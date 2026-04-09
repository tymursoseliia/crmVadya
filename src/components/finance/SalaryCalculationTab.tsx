"use client";
import { useMemo, useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PeriodSelector from "@/components/finance/PeriodSelector";
import { Calculator, RefreshCw, Users, DollarSign, TrendingUp, Cpu, AlertTriangle, Star } from "lucide-react";
import {
  calculateEmployeeSalary,
  filterOperationsByPeriod,
  filterExpensesByPeriod,
  calculateTeamStats,
  calculateCompanyTotals
} from "@/lib/financeCalculations";
import { initialSettings } from "@/lib/financeData";

export default function SalaryCalculationTab() {
  const { operations, expenses, employees, currentPeriod, isLoaded, reloadData } = useFinance();

  const periodOperations = useMemo(() => filterOperationsByPeriod(
    operations,
    currentPeriod.startDate,
    currentPeriod.endDate
  ), [operations, currentPeriod.startDate, currentPeriod.endDate]);

  const periodExpenses = useMemo(() => filterExpensesByPeriod(
    expenses,
    currentPeriod.startDate,
    currentPeriod.endDate
  ), [expenses, currentPeriod.startDate, currentPeriod.endDate]);

  const vadyStats = useMemo(() => calculateTeamStats(
    'vady',
    periodOperations,
    periodExpenses,
    employees,
    initialSettings,
    currentPeriod.id,
    currentPeriod.isClosed ? (currentPeriod.calculation_version || 'v1') : 'v2'
  ), [periodOperations, periodExpenses, employees, currentPeriod]);

  const companyTotals = useMemo(() => calculateCompanyTotals(
    vadyStats,
    employees,
    periodOperations,
    periodExpenses,
    initialSettings,
    currentPeriod.isClosed ? (currentPeriod.calculation_version || 'v1') : 'v2'
  ), [vadyStats, employees, periodOperations, periodExpenses, currentPeriod]);

  const groupedEmployees = useMemo(() => {
    const vadyTeam = employees.filter(e => e.team === 'vady' && e.role === 'manager');
    const closers = employees.filter(e => e.role === 'closer');
    const itTeam = employees.filter(e => e.role === 'it');
    const specialTeam = employees.filter(e => e.role === 'special');

    return {
      vadyTeam,
      closers,
      itTeam,
      specialTeam,
    };
  }, [employees]);

  const salaries = useMemo(() => {
    const result: Record<string, { salary: number; debt?: number }> = {};

    employees.forEach(emp => {
      const calcVersion = currentPeriod.isClosed ? (currentPeriod.calculation_version || 'v1') : 'v2';
      const salaryCalc = calculateEmployeeSalary(emp, periodOperations, periodExpenses, initialSettings, calcVersion);

      result[emp.id] = {
        salary: salaryCalc.finalSalary,
        debt: salaryCalc.debt,
      };
    });

    return result;
  }, [employees, periodOperations, periodExpenses, currentPeriod]);

  const totalSalary = useMemo(() => {
    return Object.values(salaries).reduce((sum, s) => sum + s.salary, 0);
  }, [salaries]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  const renderEmployee = (employee: typeof employees[0], salaryData: { salary: number; debt?: number }, showBadge?: string) => (
    <div key={employee.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(employee.name)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-gray-900">{employee.name}</p>
            {showBadge && <Badge variant="outline" className="text-xs">{showBadge}</Badge>}
          </div>
          <p className="text-xs text-gray-600">
            {employee.percentRastamozhka > 0 && `Растам: ${employee.percentRastamozhka}%`}
            {employee.percentDobiv > 0 && ` • Добив: ${employee.percentDobiv}%`}
            {employee.percentProfit > 0 && `${employee.percentProfit}% от прибыли`}
            {employee.fixedPay && `Фикс: $${employee.fixedPay}`}
            {employee.salary > 0 && !employee.fixedPay && `Мин: $${employee.salary}`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">${formatUSDT(salaryData.salary)}</p>
        {salaryData.debt && salaryData.debt > 0 && (
          <div className="flex items-center gap-1 text-red-600 font-medium text-sm">
            <AlertTriangle className="w-3 h-3" />
            <span>Долг: ${salaryData.debt.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              Расчет зарплат
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Управление выплатами сотрудникам
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector />
            <Button
              onClick={reloadData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 space-y-3">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5" />
                  <p className="text-xs font-medium opacity-90">Общая сумма ЗП</p>
                </div>
                <p className="text-3xl font-bold">${formatUSDT(totalSalary)}</p>
                <p className="text-xs opacity-75 mt-1">
                  {employees.length} сотрудников
                </p>
              </div>
              <Users className="w-16 h-16 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <Card className="shadow-lg border-t-4 border-t-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-2 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-blue-600" />
                  Команда Вади
                </CardTitle>
                <Badge className="bg-blue-500 text-xs">{groupedEmployees.vadyTeam.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2 px-4">
              <div className="space-y-1">
                {groupedEmployees.vadyTeam.map(emp => renderEmployee(emp, salaries[emp.id] || { salary: 0 }, 'Менеджер'))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-600">Итого команда:</span>
                  <span className="text-blue-600">${formatUSDT(groupedEmployees.vadyTeam.reduce((sum, e) => sum + (salaries[e.id]?.salary || 0), 0))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-t-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Клоузеры
                </CardTitle>
                <Badge className="bg-green-500 text-xs">{groupedEmployees.closers.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2 px-4">
              <div className="space-y-1">
                {groupedEmployees.closers.map(emp => renderEmployee(emp, salaries[emp.id] || { salary: 0 }))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-600">Итого:</span>
                  <span className="text-green-600">${formatUSDT(groupedEmployees.closers.reduce((sum, e) => sum + (salaries[e.id]?.salary || 0), 0))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-t-gray-500">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Cpu className="w-4 h-4 text-gray-600" />
                  IT отдел
                </CardTitle>
                <Badge className="bg-gray-500 text-xs">{groupedEmployees.itTeam.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2 px-4">
              <div className="space-y-1">
                {groupedEmployees.itTeam.map(emp => renderEmployee(emp, salaries[emp.id] || { salary: 0 }))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-600">Итого:</span>
                  <span className="text-gray-600">${formatUSDT(groupedEmployees.itTeam.reduce((sum, e) => sum + (salaries[e.id]?.salary || 0), 0))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-t-4 border-t-amber-500">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-amber-600" />
                  Особые роли
                </CardTitle>
                <Badge className="bg-amber-500 text-xs">{groupedEmployees.specialTeam.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2 px-4">
              <div className="space-y-1">
                {groupedEmployees.specialTeam.map(emp => renderEmployee(emp, salaries[emp.id] || { salary: 0 }))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-600">Итого:</span>
                  <span className="text-amber-600">${formatUSDT(groupedEmployees.specialTeam.reduce((sum, e) => sum + (salaries[e.id]?.salary || 0), 0))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
