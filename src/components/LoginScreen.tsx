"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserCircle, Shield, Lock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, dbToApp } from "@/lib/supabase";
import type { Employee } from "@/types/finance";

export default function LoginScreen() {
  const { loginEmployee, loginAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'employee' | 'admin'>('employee');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Получаем сотрудников для списка селекта
    const fetchEmployees = async () => {
      if (supabase) {
        const { data } = await supabase.from('employees').select('*').order('name');
        if (data) {
          setEmployees(data.map(dbToApp.employee).filter(e => e.role !== 'it' && e.role !== 'special'));
        }
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeName) {
      setError("Выберите сотрудника из списка");
      return;
    }
    if (!password) {
      setError("Введите пароль");
      return;
    }
    setError("");
    setIsLoading(true);
    
    const res = await loginEmployee(selectedEmployeeName, password);
    if (!res.success) {
      setError(res.error || "Ошибка входа");
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Введите пароль");
      return;
    }
    setError("");
    setIsLoading(true);

    const success = loginAdmin(password);
    if (!success) {
      setError("Неверный пароль администратора");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        <div className="flex bg-gray-100/50">
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'employee' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('employee'); setError(""); setPassword(""); }}
          >
            Я Сотрудник
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'admin' ? 'bg-white text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('admin'); setError(""); setPassword(""); }}
          >
            Я Руководитель
          </button>
        </div>

        <CardHeader className="text-center pt-8">
          <div className="inline-flex justify-center mb-4">
            <div className={`p-4 rounded-xl shadow-inner ${activeTab === 'employee' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
              {activeTab === 'employee' ? <UserCircle className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {activeTab === 'employee' ? 'Вход для сотрудников' : 'Панель управления'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {activeTab === 'employee' ? 'Укажите свой уникальный пароль доступа' : 'Войдите под мастер-паролем Вадима'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          {activeTab === 'employee' ? (
            <form onSubmit={handleEmployeeLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Имя сотрудника</label>
                <Select value={selectedEmployeeName} onValueChange={(val) => { setSelectedEmployeeName(val); setError(""); }}>
                  <SelectTrigger className="h-12 w-full text-base">
                    <SelectValue placeholder="Выберите своё имя" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.name}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="emp-password">Пароль сотрудника</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    id="emp-password"
                    type="password" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Введите пароль"
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              
              {error && <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
              
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md">
                {isLoading ? "Вход..." : "Войти в систему"}
                {!isLoading && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="admin-password">Мастер-пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input 
                    id="admin-password"
                    type="password" 
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Пароль руководителя"
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              
              {error && <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
              
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-md">
                {isLoading ? "Вход..." : "Получить полный доступ"}
                {!isLoading && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
