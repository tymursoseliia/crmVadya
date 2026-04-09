"use client";
import { useState, useMemo, useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, X, Shield, Lock, Activity, Users } from "lucide-react";
import type { Expense, ExpenseType } from "@/types/finance";

export default function ChannelsTab() {
  const {
    expenses,
    expenseCategories,
    addExpense,
    currentPeriod,
    periods,
    isLoaded
  } = useFinance();

  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    try {
      const authData = localStorage.getItem('auth_user');
      if (authData) {
        setIsAdmin(JSON.parse(authData).role === 'admin');
      }
    } catch(e) {}
  }, []);

  const channelCategories = useMemo(() => {
    return expenseCategories.filter(c => c.id.startsWith('cat-chan-'));
  }, [expenseCategories]);

  const generalCategories = useMemo(() => {
    return expenseCategories.filter(c => !c.id.startsWith('cat-chan-'));
  }, [expenseCategories]);

  const [showFullForm, setShowFullForm] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    sumUsdt: '',
    cashRegister: 'vady' as 'vady' | 'tech' | 'common',
    issuedBy: 'Вадим',
    comment: '',
  });

  const channelStats = useMemo(() => {
    const stats: Record<string, { total: number, count: number }> = {};
    
    // Initialize stats
    channelCategories.forEach(cat => {
      stats[cat.name] = { total: 0, count: 0 };
    });

    // Calculate from current period expenses
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const start = new Date(currentPeriod.startDate);
      const end = new Date(currentPeriod.endDate);
      
      if (expDate >= start && expDate <= end) {
        if (stats[exp.category]) {
          stats[exp.category].total += exp.sumUsdt;
          stats[exp.category].count += 1;
        }
      }
    });

    return stats;
  }, [expenses, currentPeriod, channelCategories]);

  const totalChannelExpenses = useMemo(() => {
    return Object.values(channelStats).reduce((sum, stat) => sum + stat.total, 0);
  }, [channelStats]);

  const handleAddClick = (categoryId?: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId || generalCategories[0]?.id || '',
    }));
    setSelectedChannel(categoryId || null);
    setShowFullForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentPeriod.isClosed) {
      alert('Период закрыт! Переключитесь на открытый период для добавления расходов.');
      return;
    }

    if (!formData.sumUsdt || !formData.category) {
      alert('Заполните все обязательные поля');
      return;
    }

    const sumUsdt = parseFloat(formData.sumUsdt);
    if (isNaN(sumUsdt)) {
      alert('Неверный формат суммы');
      return;
    }

    let type: ExpenseType;
    let teamId: 'vady' | undefined;

    if (formData.cashRegister === 'tech') {
      type = 'tech';
      teamId = undefined;
    } else if (formData.cashRegister === 'common') {
      type = 'common';
      teamId = undefined;
    } else {
      type = 'personal';
      teamId = 'vady';
    }

    const categoryObj = expenseCategories.find(c => c.id === formData.category);

    const newExpense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: formData.date,
      category: categoryObj?.name || '',
      sumUsdt,
      type,
      teamId,
      employeeId: undefined,
      issuedBy: formData.issuedBy,
      recipient: formData.issuedBy,
      comment: formData.comment,
      isForSpecialEmployee: false,
    };

    await addExpense(newExpense);

    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      sumUsdt: '',
      cashRegister: 'vady',
      issuedBy: 'Вадим',
      comment: '',
    });
    setShowFullForm(false);
    setSelectedChannel(null);
  };

  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (!isLoaded) {
    return <div className="p-8 text-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Send className="w-6 h-6 text-blue-600" />
              Telegram Каналы
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Управление маркетингом и трафиком
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleAddClick()}
                className="bg-gray-800 hover:bg-gray-900 text-white shadow-md"
              >
                <Shield className="w-4 h-4 mr-2" />
                Регулярный расход
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Send className="w-8 h-8 opacity-80" />
                <Badge className="bg-white/20 text-white border-0">{channelCategories.length} каналов</Badge>
              </div>
              <p className="text-sm opacity-90 mb-1">Затраты на каналы (текущий период)</p>
              <p className="text-3xl font-bold">${formatUSDT(totalChannelExpenses)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className={showFullForm ? "col-span-8" : "col-span-12"}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channelCategories.map((channel) => {
                const stats = channelStats[channel.name] || { total: 0, count: 0 };
                return (
                  <Card key={channel.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500 flex flex-col justify-between">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold truncate text-blue-800" title={channel.name}>
                        {channel.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mt-2 mb-4">
                        <div className="text-2xl font-bold text-gray-900">
                          ${formatUSDT(stats.total)}
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {stats.count} трат
                        </Badge>
                      </div>
                      {isAdmin ? (
                        <Button
                          variant="outline"
                          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 group"
                          onClick={() => handleAddClick(channel.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Внести затраты
                        </Button>
                      ) : (
                        <div className="text-xs text-gray-400 text-center">Нет прав на запись</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {showFullForm && (
            <div className="col-span-4">
              <Card className="shadow-lg sticky top-6 border-t-4 border-t-blue-500">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Plus className="w-5 h-5 text-blue-600" />
                        {selectedChannel ? 'Затраты на канал' : 'Общий / Регулярный расход'}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowFullForm(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Категория / Канал *</Label>
                      <select
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        <option value="">Выберите категорию</option>
                        <optgroup label="Telegram Каналы">
                          {channelCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Общие расходы (Трафик, безопасность и др.)">
                          {generalCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Сумма USDT *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.sumUsdt}
                        onChange={(e) => setFormData({ ...formData, sumUsdt: e.target.value })}
                        required
                        className="mt-1 font-medium text-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">С какой кассы списать? *</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.cashRegister === 'vady' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                        }`}>
                          <input
                            type="radio"
                            name="cashRegister"
                            value="vady"
                            checked={formData.cashRegister === 'vady'}
                            onChange={(e) => setFormData({ ...formData, cashRegister: e.target.value as any })}
                            className="w-4 h-4"
                          />
                          <div>
                            <div className="font-medium">Персональная (Команда Вади)</div>
                          </div>
                        </label>
                        <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.cashRegister === 'common' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                        }`}>
                          <input
                            type="radio"
                            name="cashRegister"
                            value="common"
                            checked={formData.cashRegister === 'common'}
                            onChange={(e) => setFormData({ ...formData, cashRegister: e.target.value as any })}
                            className="w-4 h-4"
                          />
                          <div>
                            <div className="font-medium">Общая касса</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Дата</Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                          min={currentPeriod.startDate}
                          max={currentPeriod.endDate}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Кто внес</Label>
                        <Input
                          type="text"
                          value={formData.issuedBy}
                          onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Комментарий (опционально)</Label>
                      <Input
                        type="text"
                        placeholder="Например: Закуп рекламы на неделю"
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={currentPeriod.isClosed}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Записать расход
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
