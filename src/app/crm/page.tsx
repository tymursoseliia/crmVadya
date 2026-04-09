"use client";
import { useRouter } from "next/navigation";
import { Crown, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMProvider } from "@/contexts/CRMContext";
import { TelegramProvider } from "@/contexts/TelegramContext";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginScreen from "@/components/LoginScreen";
import CRMLeadsTab from "@/components/crm/CRMLeadsTab";
import TelegramAnalyticsTab from "@/components/telegram/TelegramAnalyticsTab";

export default function CRMPage() {
  const router = useRouter();
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

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-purple-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="text-gray-600 hover:text-purple-600"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-500" />
                <span className="font-bold text-gray-800">Обманщики</span>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <span className="text-purple-600 font-medium">CRM - Воронка лидов</span>
            </div>
            <div />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        <FinanceProvider>
          <CRMProvider>
            <Tabs defaultValue="leads" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
                <TabsTrigger value="leads" className="text-base">
                  Воронка лидов
                </TabsTrigger>
                <TabsTrigger value="telegram" className="text-base">
                  Telegram
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leads" className="mt-0">
                <CRMLeadsTab />
              </TabsContent>

              <TabsContent value="telegram" className="mt-0">
                <TelegramProvider>
                  <TelegramAnalyticsTab />
                </TelegramProvider>
              </TabsContent>
            </Tabs>
          </CRMProvider>
        </FinanceProvider>
      </main>
    </div>
  );
}
