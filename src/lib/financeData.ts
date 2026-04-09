import type { Employee, SystemSettings, ExpenseCategory, Drop } from '@/types/finance';

// Дропы (платежные провайдеры)
export const initialDrops: Drop[] = [
  { id: 'drop1', name: 'Дроп 1', commission: 22 },
  { id: 'drop2', name: 'Дроп 2', commission: 20 },
  { id: 'drop3', name: 'Дроп 3', commission: 25 },
];

// Команда Вади
const vadyTeam: Employee[] = [
  { id: 'philipp_plein', name: 'Philipp Plein', role: 'manager', team: 'vady', salary: 500, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'kolomoyskiy', name: 'Коломойский', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'an_225', name: 'АН-225', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'matros', name: 'Матрос', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'tefal', name: 'Tefal', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'reno', name: 'Reno', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'hugo', name: 'HUGO', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'shura', name: 'Шура', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'shtil', name: 'Штиль', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'ceo', name: 'CEO', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'malish', name: 'Малыш', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'lada', name: 'LADA', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'piton', name: 'Питон', role: 'manager', team: 'vady', salary: 500, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'adidas', name: 'Adidas', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'exel', name: 'EXEL', role: 'manager', team: 'vady', salary: 500, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'valeryana', name: 'Валерьяна', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'stone_island', name: 'Stone Island', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'cp_company', name: 'C.P Company', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'ufc', name: 'UFC', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'tyazhik', name: 'Тяжик', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'borchik', name: 'Борчик', role: 'manager', team: 'vady', salary: 350, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
  { id: 'sportik', name: 'Спортик', role: 'manager', team: 'vady', salary: 1000, percentRastamozhka: 15, percentDobiv: 10, percentProfit: 0, isSpecial: false },
];



// Клоузеры
const closers: Employee[] = [
  { id: 'vanya', name: 'Ваня', role: 'closer', team: null, salary: 0, percentRastamozhka: 0, percentDobiv: 5, percentProfit: 0, isSpecial: false },
  { id: 'pasha', name: 'Паша', role: 'closer', team: null, salary: 0, percentRastamozhka: 0, percentDobiv: 5, percentProfit: 0, isSpecial: false },
  { id: 'an_225_closer', name: 'АН-225', role: 'closer', team: null, salary: 0, percentRastamozhka: 0, percentDobiv: 0, percentProfit: 0, isSpecial: false },
  { id: 'stone_island_closer', name: 'Stone Island', role: 'closer', team: null, salary: 0, percentRastamozhka: 0, percentDobiv: 0, percentProfit: 0, isSpecial: false },
  { id: 'malish_closer', name: 'Малыш', role: 'closer', team: null, salary: 0, percentRastamozhka: 0, percentDobiv: 0, percentProfit: 0, isSpecial: false },
  { id: 'dyadya_closer', name: 'Дядя', role: 'closer', team: null, salary: 0, percentRastamozhka: 0, percentDobiv: 0, percentProfit: 0, isSpecial: false },
];

// IT отдел
const itDepartment: Employee[] = [
  { id: 'it_dept', name: 'IT отдел', role: 'it', team: null, salary: 3000, percentRastamozhka: 0, percentDobiv: 0, percentProfit: 0, isSpecial: false },
];

export const initialEmployees: Employee[] = [
  ...vadyTeam,
  ...closers,
  ...itDepartment,
];

// Настройки системы
export const initialSettings: SystemSettings = {
  currentPeriodId: 'period-2026-01-26',
  securityCost: 30000, // раз в 2 месяца
  rentCost: 15500, // раз в 2 месяца
  itSalaries: {
    it_dept: 3000,
  },
  minSalary: 350,
};

// Категории расходов
export const initialExpenseCategories: ExpenseCategory[] = [
  { id: 'cat-security', name: 'Безопасность', type: 'fixed' },
  { id: 'cat-rent', name: 'Аренда', type: 'fixed' },
  { id: 'cat-traffic-ads', name: 'Трафик АДС', type: 'personal' },
  { id: 'cat-manual-ads', name: 'Ручной закуп АДС', type: 'personal' },
  { id: 'cat-rusnoj-tg', name: 'Русной закуп ТГ', type: 'personal' },
  { id: 'cat-avito', name: 'Авито', type: 'personal' },
  { id: 'cat-yandex-direct', name: 'Яндекс директ', type: 'personal' },
  { id: 'cat-yandex', name: 'Яндекс', type: 'personal' },
  { id: 'cat-tg-boost', name: 'Накрутка на ТГ', type: 'personal' },
  { id: 'cat-subscriptions', name: 'Подписки', type: 'common' },
  { id: 'cat-content', name: 'Контент', type: 'personal' },
  { id: 'cat-tech', name: 'Тех. расходы', type: 'tech' },
  { id: 'cat-telephony', name: 'Телефония', type: 'common' },
  { id: 'cat-office', name: 'Офисные расходы', type: 'common' },
  
  // Telegram Channels
  { id: 'cat-chan-autoprigon024', name: 't.me/autoprigon024', type: 'personal' },
  { id: 'cat-chan-PapaEuroCar', name: 't.me/PapaEuroCar', type: 'personal' },
  { id: 'cat-chan-AutoSelection_EU', name: 't.me/AutoSelection_EU', type: 'personal' },
  { id: 'cat-chan-WestToDrive', name: 't.me/WestToDrive', type: 'personal' },
  { id: 'cat-chan-Way_Home_RU', name: 't.me/Way_Home_RU', type: 'personal' },
  { id: 'cat-chan-PodZakazLab', name: 't.me/PodZakazLab', type: 'personal' },
  { id: 'cat-chan-Europa_Motors', name: 't.me/Europa_Motors', type: 'personal' },
  { id: 'cat-chan-FastCarDelivery01', name: 't.me/FastCarDelivery01', type: 'personal' },
  { id: 'cat-chan-Car_Import_RU01', name: 't.me/Car_Import_RU01', type: 'personal' },
  { id: 'cat-chan-GrandImport', name: 't.me/GrandImport', type: 'personal' },
  { id: 'cat-chan-Euro_avto_tut', name: 't.me/Euro_avto_tut', type: 'personal' },
  { id: 'cat-chan-Prigon_EU_AUTO', name: 't.me/Prigon_EU_AUTO', type: 'personal' },
  { id: 'cat-chan-Auto_ImportFromEU', name: 't.me/Auto_ImportFromEU', type: 'personal' },
  { id: 'cat-chan-Auto_euro_zdes', name: 't.me/Auto_euro_zdes', type: 'personal' },
];

// Расчет общей ЗП IT отдела
export const getTotalITSalary = (settings: SystemSettings): number => {
  return settings.itSalaries.it_dept || 3000;
};

// Расчет постоянных расходов за период (1/4 от суммы за 2 месяца)
export const getFixedExpensesPerPeriod = (settings: SystemSettings): number => {
  return (settings.securityCost + settings.rentCost) / 4;
};
