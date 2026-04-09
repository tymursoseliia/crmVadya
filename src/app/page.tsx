"use client";
import { Button } from "@/components/ui/button";
import { Crown, DollarSign, Users, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginScreen from "@/components/LoginScreen";

export default function Home() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-amber-200 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <Crown className="w-12 h-12 text-amber-500" />
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight">
                <span className="text-gray-800">Обманщики</span>
              </h1>
            </div>
            <Crown className="w-12 h-12 text-amber-500" />
            <div className="ml-8">
              <Button variant="ghost" className="text-gray-500 hover:text-red-500" onClick={logout}>
                <LogOut className="w-5 h-5 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Выберите раздел
          </h2>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-xl">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/crm")}
            className="w-full sm:w-auto h-24 text-xl border-purple-400 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-500 gap-3"
          >
            <Users className="w-8 h-8" />
            CRM
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/finances")}
            className="w-full sm:w-auto h-24 text-xl border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-600 gap-3"
          >
            <DollarSign className="w-8 h-8" />
            Финансы
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <span className="font-medium">Обманщики</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
