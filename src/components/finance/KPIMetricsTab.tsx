"use client";
import { useMemo, useState } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PeriodSelector from "@/components/finance/PeriodSelector";
import DailyActivityForm from "@/components/finance/DailyActivityForm";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Percent
} from "lucide-react";
import {
  filterOperationsByPeriod,
  filterExpensesByPeriod,
  calculateTeamStats,
  calculateEmployeeSalary,
  calculateCompanyTotals
} from "@/lib/financeCalculations";
import { initialSettings } from "@/lib/financeData";

export default function KPIMetricsTab() {
  const { operations, expenses, employees, currentPeriod, isLoaded } = useFinance();

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
    currentPeriod.calculation_version || 'v1'
  ), [periodOperations, periodExpenses, employees, currentPeriod.id, currentPeriod.calculation_version]);

  const companyTotals = useMemo(() => calculateCompanyTotals(
    vadyStats,
    employees,
    periodOperations,
    periodExpenses,
    initialSettings,
    currentPeriod.calculation_version || 'v1'
  ), [vadyStats, employees, periodOperations, periodExpenses, currentPeriod.calculation_version]);

  const dailyMetrics = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const todayOps = periodOperations.filter(op => op.date.startsWith(todayStr));
    const todayRevenue = todayOps.reduce((sum, op) => sum + op.usdtAfterCommission, 0);

    const periodDays = Math.ceil((new Date(currentPeriod.endDate).getTime() - new Date(currentPeriod.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyPlan = companyTotals.totalRevenue / periodDays;

    const newLeads = todayOps.filter(op => op.type === 'растаможка').length;

    const rastamozhka = periodOperations.filter(op => op.type === 'растаможка').length;
    const dobiv = periodOperations.filter(op => op.type === 'добив').length;
    const conversionRate = rastamozhka > 0 ? (dobiv / rastamozhka) * 100 : 0;

    const avgCheck = todayOps.length > 0 ? todayRevenue / todayOps.length : 0;

    const cashOnHand = companyTotals.netProfit;

    return {
      todayRevenue,
      dailyPlan,
      planCompletion: dailyPlan > 0 ? (todayRevenue / dailyPlan) * 100 : 0,
      newLeads,
      conversionRate,
      avgCheck,
      cashOnHand,
      todayOps: todayOps.length
    };
  }, [periodOperations, currentPeriod, companyTotals]);

  const weeklyReview = useMemo(() => {
    const vohaManagers = employees.filter(e => e.team === 'vady' && e.role === 'manager');
    const vohaTarget = 200000;
    const vohaManagerTarget = 20000;

    const vohaPerformers = vohaManagers.map(manager => {
      const managerOps = periodOperations.filter(op => op.managerId === manager.id);
      const revenue = managerOps.reduce((sum, op) => sum + op.usdtAfterCommission, 0);
      const target = vohaManagerTarget;

      return {
        name: manager.name,
        revenue,
        target,
        completion: target > 0 ? (revenue / target) * 100 : 0,
        overPerformed: revenue > target
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      vady: {
        performers: vohaPerformers,
        target: vohaTarget,
        actual: vadyStats.totalRevenue,
        teamCompletion: vohaTarget > 0 ? (vadyStats.totalRevenue / vohaTarget) * 100 : 0
      }
    };
  }, [employees, periodOperations, vadyStats]);

  const individualKPIs = useMemo(() => {
    const managers = employees.filter(e => e.role === 'manager' && !e.isSpecial);

    return managers.map(manager => {
      const managerOps = periodOperations.filter(op => op.managerId === manager.id);
      const revenue = managerOps.reduce((sum, op) => sum + op.usdtAfterCommission, 0);
      const rastamozhka = managerOps.filter(op => op.type === 'растаможка').length;
      const dobiv = managerOps.filter(op => op.type === 'добив').length;
      const conversion = rastamozhka > 0 ? (dobiv / rastamozhka) * 100 : 0;
      const avgCheck = managerOps.length > 0 ? revenue / managerOps.length : 0;
      const salary = calculateEmployeeSalary(manager, periodOperations, periodExpenses, initialSettings);

      const targets = {
        minOperations: 10,
        conversion: 80,
        avgCheck: 500,
        minDobiv: 2
      };

      return {
        id: manager.id,
        name: manager.name,
        team: manager.team,
        revenue,
        operations: managerOps.length,
        rastamozhka,
        dobiv,
        conversion,
        avgCheck,
        salary: salary.finalSalary,
        kpiStatus: {
          operations: managerOps.length >= targets.minOperations,
          conversion: conversion >= targets.conversion,
          avgCheck: avgCheck >= targets.avgCheck,
          dobiv: dobiv >= targets.minDobiv
        },
        targets
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [employees, periodOperations, periodExpenses]);

  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Загрузка метрик...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              KPI & Метрики
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Ключевые показатели эффективности бизнеса
            </p>
          </div>
          <PeriodSelector />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Ежедневный Dashboard</h2>
            <Badge variant="outline" className="ml-2">Обновляется в реальном времени</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-100 flex items-center justify-between">
                  <span>Выручка за сегодня</span>
                  <DollarSign className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">${formatUSDT(dailyMetrics.todayRevenue)}</div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-blue-100">План: ${formatUSDT(dailyMetrics.dailyPlan)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {dailyMetrics.planCompletion >= 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-300" />
                  )}
                  <span className="text-xs text-blue-100">
                    {dailyMetrics.planCompletion.toFixed(0)}% выполнения
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-100 flex items-center justify-between">
                  <span>Новые лиды</span>
                  <Users className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{dailyMetrics.newLeads}</div>
                <div className="text-sm text-purple-100">Растаможек за сегодня</div>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {dailyMetrics.todayOps} операций
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-100 flex items-center justify-between">
                  <span>Конверсия</span>
                  <Percent className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{dailyMetrics.conversionRate.toFixed(0)}%</div>
                <div className="text-sm text-green-100">Растаможка → Добив</div>
                <div className="mt-2 flex items-center gap-1">
                  {dailyMetrics.conversionRate >= 80 ? (
                    <TrendingUp className="w-4 h-4 text-green-200" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-yellow-200" />
                  )}
                  <span className="text-xs text-green-100">
                    {dailyMetrics.conversionRate >= 80 ? 'Отлично' : 'Нужно улучшить'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-100 flex items-center justify-between">
                  <span>Средний чек</span>
                  <FileText className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">${formatUSDT(dailyMetrics.avgCheck)}</div>
                <div className="text-sm text-amber-100">За сегодня</div>
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    Цель: $500+
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-100 flex items-center justify-between">
                  <span>Чистая прибыль</span>
                  <Zap className="w-4 h-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">${formatUSDT(dailyMetrics.cashOnHand)}</div>
                <div className="text-sm text-emerald-100">За период</div>
                <div className="mt-2 flex items-center gap-1">
                  {dailyMetrics.cashOnHand > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-200" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-300" />
                  )}
                  <span className="text-xs text-emerald-100">
                    {dailyMetrics.cashOnHand > 0 ? 'Прибыльно' : 'Убыток'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Еженедельный Review по командам</h2>
            <Badge variant="outline" className="ml-2 text-purple-700 border-purple-300">
              Вадя: $200k
            </Badge>
            <Badge variant="outline" className="ml-2 text-green-700 border-green-300">
              На менеджера: $20k
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span>Команда Вади</span>
                  </div>
                  <Badge variant={weeklyReview.vady.teamCompletion >= 100 ? 'default' : 'secondary'}>
                    {weeklyReview.vady.teamCompletion.toFixed(0)}% плана
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Цель команды:</span>
                    <span className="font-bold text-purple-700">${formatUSDT(weeklyReview.vady.target)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Факт:</span>
                    <span className="font-bold text-purple-900">${formatUSDT(weeklyReview.vady.actual)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Результаты менеджеров:</p>
                  {weeklyReview.vady.performers.map((performer, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 ${
                        performer.overPerformed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {performer.overPerformed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="font-semibold text-gray-900">{performer.name}</span>
                        </div>
                        <Badge variant={performer.overPerformed ? 'default' : 'outline'}>
                          {performer.completion.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Выручка: ${formatUSDT(performer.revenue)}</span>
                        <span className="text-gray-600">Цель: ${formatUSDT(performer.target)}</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            performer.overPerformed ? 'bg-green-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, performer.completion)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Индивидуальные KPI менеджеров</h2>
            <Badge variant="outline">Целевые показатели</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {individualKPIs.map((kpi, index) => (
              <Card key={kpi.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{kpi.name}</h3>
                        <Badge variant="default">
                          Команда Вади
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${formatUSDT(kpi.revenue)}</p>
                      <p className="text-sm text-gray-600">Выручка</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${kpi.kpiStatus.operations ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {kpi.kpiStatus.operations ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-xs font-semibold text-gray-700">Операций</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{kpi.operations}</p>
                      <p className="text-xs text-gray-600">Цель: {kpi.targets.minOperations}+</p>
                    </div>

                    <div className={`p-3 rounded-lg ${kpi.kpiStatus.conversion ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {kpi.kpiStatus.conversion ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-xs font-semibold text-gray-700">Конверсия</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{kpi.conversion.toFixed(0)}%</p>
                      <p className="text-xs text-gray-600">Цель: {kpi.targets.conversion}%+</p>
                    </div>

                    <div className={`p-3 rounded-lg ${kpi.kpiStatus.avgCheck ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {kpi.kpiStatus.avgCheck ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-xs font-semibold text-gray-700">Средний чек</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">${formatUSDT(kpi.avgCheck)}</p>
                      <p className="text-xs text-gray-600">Цель: ${kpi.targets.avgCheck}+</p>
                    </div>

                    <div className={`p-3 rounded-lg ${kpi.kpiStatus.dobiv ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {kpi.kpiStatus.dobiv ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-xs font-semibold text-gray-700">Добивов</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{kpi.dobiv}</p>
                      <p className="text-xs text-gray-600">Цель: {kpi.targets.minDobiv}+</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Операций: {kpi.operations}</span>
                      <span>Растаможек: {kpi.rastamozhka}</span>
                      <span>Добивов: {kpi.dobiv}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Зарплата</p>
                      <p className="text-lg font-bold text-green-700">${formatUSDT(kpi.salary)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Ежедневный отчет активности</h2>
            <Badge variant="outline" className="ml-2">Для менеджеров</Badge>
          </div>

          <DailyActivityForm />
        </section>
      </div>
    </div>
  );
}
