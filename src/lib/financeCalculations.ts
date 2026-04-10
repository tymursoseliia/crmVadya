import type {
  Operation,
  Expense,
  Employee,
  TeamStats,
  SalaryCalculation,
  SystemSettings,
  TeamName,
  PayPeriod,
} from '@/types/finance';
import { getFixedExpensesPerPeriod } from './financeData';

export const calculateUsdtAfterCommission = (
  sumRub: number,
  dropCommission: number,
  exchangeRate: number
): number => {
  const afterCommission = sumRub * (1 - dropCommission / 100);
  return afterCommission / exchangeRate;
};

export const calculateManagerEarning = (
  usdtAmount: number,
  employee: Employee,
  operationType: 'растаможка' | 'добив'
): number => {
  const percent = operationType === 'растаможка'
    ? employee.percentRastamozhka
    : employee.percentDobiv;
  return usdtAmount * (percent / 100);
};

export const calculateCloserEarning = (
  usdtAmount: number,
  closer: Employee
): number => {
  if (closer.role === 'manager') {
    return usdtAmount * (5 / 100);
  }
  return usdtAmount * (closer.percentDobiv / 100);
};

export const filterOperationsByPeriod = (
  operations: Operation[],
  startDate: string,
  endDate: string
): Operation[] => {
  return operations.filter(op => {
    const opDate = new Date(op.date);
    return opDate >= new Date(startDate) && opDate <= new Date(endDate);
  });
};

export const filterExpensesByPeriod = (
  expenses: Expense[],
  startDate: string,
  endDate: string
): Expense[] => {
  return expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= new Date(startDate) && expDate <= new Date(endDate);
  });
};

export const distributeExpenses = (
  expenses: Expense[],
  team: TeamName,
  calculationVersion: 'v1' | 'v2' | 'v3' = 'v1'
): {
  personal: number;
  tech: number;
  fixed: number;
  common: number;
  total: number;
} => {
  let personal = 0;
  let tech = 0;
  let fixed = 0;
  let common = 0;
  expenses.forEach(exp => {
    switch (exp.type) {
      case 'personal':
        if (exp.teamId === team) {
          personal += exp.sumUsdt;
        }
        break;
      case 'tech':
        tech += exp.sumUsdt * 0.25;
        break;
      case 'fixed':
        fixed += exp.sumUsdt * 0.5;
        break;
      case 'common':
        common += exp.sumUsdt * 0.5;
        break;
    }
  });
  const total = personal + tech + fixed + common;
  return { personal, tech, fixed, common, total };
};

export const calculateEmployeeSalary = (
  employee: Employee,
  operations: Operation[],
  expenses: Expense[],
  settings: SystemSettings,
  calculationVersion: 'v1' | 'v2' | 'v3' = 'v1'
): SalaryCalculation => {
  if ((employee.role === 'it' || employee.role === 'special') && !employee.percentProfit) {
    let fixedSalary = employee.fixedPay || employee.salary;
    if (employee.id === 'photoshop') {
      fixedSalary = calculationVersion === 'v1' ? 2500 : 4000;
    }
    return {
      employeeId: employee.id,
      periodId: '',
      totalEarnings: fixedSalary,
      operations: [],
      personalExpenses: 0,
      finalSalary: fixedSalary,
      minSalary: 0,
    };
  }



  const employeeOps = operations.filter(
    op => op.managerId === employee.id || op.closerId === employee.id
  );
  let totalEarnings = 0;
  employeeOps.forEach(op => {
    if (op.managerId === employee.id && op.closerId === employee.id) {
      totalEarnings += op.managerEarning;
    } else {
      if (op.managerId === employee.id) {
        totalEarnings += op.managerEarning;
      }
      if (op.closerId === employee.id && op.closerEarning) {
        totalEarnings += op.closerEarning;
      }
    }
  });

  let finalSalary = totalEarnings;

  if (employee.role === 'manager' || (employee.role === 'closer' && employee.salary > 0)) {
    finalSalary = Math.max(finalSalary, employee.salary);
  }

  return {
    employeeId: employee.id,
    periodId: '',
    totalEarnings,
    operations: employeeOps.map(op => op.id),
    personalExpenses: 0,
    finalSalary,
    minSalary: (employee.role === 'manager' || (employee.role === 'closer' && employee.salary > 0)) ? employee.salary : 0,
  };
};

export const calculateTeamStats = (
  team: TeamName,
  operations: Operation[],
  expenses: Expense[],
  employees: Employee[],
  settings: SystemSettings,
  periodId: string,
  calculationVersion: 'v1' | 'v2' | 'v3' = 'v1'
): TeamStats => {
  const teamOps = operations.filter(op => op.team === team);
  const totalRevenue = teamOps.reduce((sum, op) => sum + op.usdtAfterCommission, 0);
  const expensesDistribution = distributeExpenses(expenses, team, calculationVersion);
  const teamMembers = employees.filter(
    emp => emp.team === team && emp.role === 'manager'
  );
  let teamSalaries = 0;
  teamMembers.forEach(emp => {
    const salary = calculateEmployeeSalary(emp, operations, expenses, settings, calculationVersion);
    teamSalaries += salary.finalSalary;
  });
  const itEmployees = employees.filter(emp => emp.role === 'it');
  let itSalaries = 0;
  itEmployees.forEach(emp => {
    const salary = calculateEmployeeSalary(emp, operations, expenses, settings, calculationVersion);
    itSalaries += salary.finalSalary;
  });
  const halfITSalaries = itSalaries * 0.5;
  
  let closersExpenses = 0;
  if (calculationVersion === 'v3') {
    teamOps.forEach(op => {
      if (op.closerEarning) {
        closersExpenses += op.closerEarning;
      }
    });
  }

  const totalExpenses = expensesDistribution.total + teamSalaries + halfITSalaries + closersExpenses;
  const netProfit = totalRevenue - totalExpenses;
  const teamleadSalary = 0;

  return {
    team,
    periodId,
    totalRevenue,
    operationsCount: teamOps.length,
    personalExpenses: expensesDistribution.personal,
    techExpenses: expensesDistribution.tech,
    fixedExpenses: expensesDistribution.fixed,
    commonExpenses: expensesDistribution.common,
    closersExpenses,
    totalExpenses,
    teamSalaries,
    teamleadSalary,
    netProfit,
  };
};

export const calculateCompanyTotals = (
  vadyStats: TeamStats,
  employees: Employee[],
  operations: Operation[],
  expenses: Expense[],
  settings: SystemSettings,
  calculationVersion: 'v1' | 'v2' | 'v3' = 'v1'
) => {
  const totalRevenue = operations.reduce((sum, op) => sum + op.usdtAfterCommission, 0);

  const itEmployees = employees.filter(emp => emp.role === 'it');
  let itSalaries = 0;
  itEmployees.forEach(emp => {
    const salary = calculateEmployeeSalary(emp, operations, expenses, settings, calculationVersion);
    itSalaries += salary.finalSalary;
  });



  const closers = employees.filter(e => e.role === 'closer');
  const closersSalaries = closers.reduce((sum, cl) => {
    return sum + calculateEmployeeSalary(cl, operations, expenses, settings, calculationVersion).finalSalary;
  }, 0);

  const expensesWithoutBonuses =
    vadyStats.totalExpenses +
    vadyStats.teamleadSalary +
    closersSalaries;

  const profitBeforeBonuses = totalRevenue - expensesWithoutBonuses;
  const netProfit = profitBeforeBonuses;
  
  const totalSalaries =
    vadyStats.teamSalaries +
    itSalaries +
    vadyStats.teamleadSalary +
    closersSalaries;

  const directExpensesOnly = expenses.reduce((sum, exp) => sum + exp.sumUsdt, 0);

  const totalExpenses = calculationVersion !== 'v1' 
    ? directExpensesOnly + totalSalaries 
    : expensesWithoutBonuses;

  const bubonCompensation = expenses
    .filter(exp => exp.type === 'tech')
    .reduce((sum, exp) => sum + exp.sumUsdt * 0.5, 0);

  const effectiveRevenue = totalRevenue + bubonCompensation;
  
  let netProfitWithBubon = 0;
  if (calculationVersion !== 'v1') {
    netProfitWithBubon = effectiveRevenue - directExpensesOnly - totalSalaries;
  } else {
    netProfitWithBubon = effectiveRevenue - expensesWithoutBonuses;
  }
  
  const profitMarginWithBubon = effectiveRevenue > 0 ? (netProfitWithBubon / effectiveRevenue) * 100 : 0;
  return {
    totalRevenue,
    effectiveRevenue,
    totalExpenses,
    totalSalaries,
    directExpensesOnly,
    bubonCompensation,
    netProfit: netProfitWithBubon,
    profitMargin: profitMarginWithBubon,
  };
};
