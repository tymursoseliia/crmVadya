"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, DollarSign, Receipt, Users, Calculator, BarChart3, Target, Home, Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginScreen from "@/components/LoginScreen";
import dynamic from 'next/dynamic';

// Динамический импорт компонентов
const FinanceDashboard = dynamic(() => import('@/components/finance/FinanceDashboard'), {
  loading: () => <div className="bg-white rounded-lg shadow p-6">Загрузка...</div>
});

const OperationsTab = dynamic(() => import('@/components/finance/OperationsTab'), {
  loading: () => <div className="bg-white rounded-lg shadow p-6">Загрузка...</div>
});

const ExpensesTab = dynamic(() => import('@/components/finance/ExpensesTab'), {
  loading: () => <div className="bg-white rounded-lg shadow p-6">Загрузка...</div>
});

const EmployeesTab = dynamic(() => import('@/components/finance/EmployeesTab'), {
  loading: () => <div className="bg-white rounded-lg shadow p-6">Загрузка...</div>
});

const SalaryCalculationTab = dynamic(() => import('@/components/finance/SalaryCalculationTab'), {
  loading: () => <div className="bg-white rounded-lg shadow p-6">Загрузка...</div>
});

const ReportsTab = dynamic(() => import('@/components/finance/ReportsTab'), {
  loading: () => <div className="bg-white rounded-lg shadow p-6">Загрузка...</div>
});

const ChannelsTab = dynamic(() => import('@/components/finance/ChannelsTab'), {
  loading: () => <div className="bg-white rounded-lg shadow p-6">Загрузка...</div>
});

const KPIMetricsTab = dynamic(() => import('@/components/finance/KPIMetricsTab'), {
  loading: () => <div className="bg-white rounded-lg shadow p-6">Загрузка...</div>
});

function FinancesContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Lock className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Доступ закрыт</h1>
        <p className="text-gray-600 mb-6">Раздел Финансы доступен только руководителю.</p>
        <Button onClick={() => router.push("/")} variant="default">
          Вернуться на главную
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-[1800px] mx-auto">

        {/* Табы */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
            <div className="px-6 py-4 flex items-center justify-between">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-100/50 p-1.5 text-gray-600 gap-1 overflow-x-auto">
                <TabsTrigger
                  value="dashboard"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </TabsTrigger>

                <TabsTrigger
                  value="operations"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Операции</span>
                </TabsTrigger>

                <TabsTrigger
                  value="expenses"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Расходы</span>
                </TabsTrigger>

                <TabsTrigger
                  value="channels"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Каналы</span>
                </TabsTrigger>

                <TabsTrigger
                  value="employees"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Сотрудники</span>
                </TabsTrigger>

                <TabsTrigger
                  value="salary"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Расчет ЗП</span>
                </TabsTrigger>

                <TabsTrigger
                  value="reports"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Отчеты</span>
                </TabsTrigger>

                <TabsTrigger
                  value="kpi"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md gap-2"
                >
                  <Target className="w-4 h-4" />
                  <span>KPI & Метрики</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">На главную</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Контент табов */}
          <TabsContent value="dashboard">
            <FinanceDashboard />
          </TabsContent>

          <TabsContent value="operations">
            <OperationsTab />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpensesTab />
          </TabsContent>

          <TabsContent value="channels">
            <ChannelsTab />
          </TabsContent>

          <TabsContent value="employees">
            <EmployeesTab />
          </TabsContent>

          <TabsContent value="salary">
            <SalaryCalculationTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="kpi">
            <KPIMetricsTab />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

export default function FinancesPage() {
  return (
    <FinanceProvider>
      <FinancesContent />
    </FinanceProvider>
  );
}
