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
    <div 
      className="min-h-screen flex flex-col relative bg-black bg-cover bg-center bg-no-repeat overflow-hidden" 
      style={{ backgroundImage: 'url("/gta-bg.jpg")' }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-black/30 backdrop-blur-md shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <Crown className="w-12 h-12 text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
            <div className="text-center">
              <h1 className="text-5xl font-black tracking-tight text-white uppercase" style={{ WebkitTextStroke: '2px black', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
                <span>Обманщики</span>
              </h1>
            </div>
            <Crown className="w-12 h-12 text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
            <div className="ml-8">
              <Button variant="ghost" className="text-white hover:text-red-400 hover:bg-white/10" onClick={logout}>
                <LogOut className="w-5 h-5 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center">

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full max-w-2xl">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/crm")}
            className="w-full sm:w-64 h-32 text-2xl font-black uppercase text-white bg-gradient-to-br from-pink-500/80 to-purple-600/80 hover:from-pink-500 hover:to-purple-600 border-2 border-pink-300/50 shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(236,72,153,0.8)] gap-4 backdrop-blur-sm rounded-2xl"
          >
            <Users className="w-10 h-10" />
            CRM
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/finances")}
            className="w-full sm:w-64 h-32 text-2xl font-black uppercase text-white bg-gradient-to-br from-emerald-500/80 to-teal-600/80 hover:from-emerald-500 hover:to-teal-600 border-2 border-emerald-300/50 shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] gap-4 backdrop-blur-sm rounded-2xl"
          >
            <DollarSign className="w-10 h-10" />
            Финансы
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/20 bg-black/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center gap-2 text-white/50">
            <span className="font-bold tracking-widest uppercase text-sm">Обманщики</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
