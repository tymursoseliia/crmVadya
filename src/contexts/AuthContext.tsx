"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Employee } from "@/types/finance";
import { supabase, dbToApp } from "@/lib/supabase";

export type AuthUser = 
  | { role: 'admin'; id: 'admin'; name: 'Вадим' }
  | { role: 'employee'; employee: Employee; id: string; name: string };

interface AuthContextType {
  user: AuthUser | null;
  loginEmployee: (password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверка сохраненной сессии
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Ошибка парсинга сессии");
      }
    }
    setIsLoading(false);
  }, []);

  const loginEmployee = async (password: string) => {
    try {
      if (!supabase) {
        return { success: false, error: "База данных недоступна" };
      }
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('password', password)
        .single();
        
      if (error || !data) {
        return { success: false, error: "Неверный пароль" };
      }
      
      const employee = dbToApp.employee(data);
      if (employee.role !== 'manager' && employee.role !== 'teamlead' && employee.role !== 'closer') {
         // Для IT и прочих, если они не заходят
         // Если всем можно, то убрать проверку. Пока разрешаем
         // return { success: false, error: "У вашей роли нет доступа в CRM" };
      }

      const authUser: AuthUser = {
        role: 'employee',
        employee,
        id: employee.id,
        name: employee.name
      };
      
      setUser(authUser);
      localStorage.setItem("auth_user", JSON.stringify(authUser));
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, error: "Ошибка при входе" };
    }
  };

  const loginAdmin = (password: string) => {
    if (password === "vadim2026") {
      const authUser: AuthUser = {
        role: 'admin',
        id: 'admin',
        name: 'Вадим'
      };
      setUser(authUser);
      localStorage.setItem("auth_user", JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, loginEmployee, loginAdmin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
