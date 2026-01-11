/**
 * Тип источника дохода
 */
export enum IncomeType {
  SALARY = 'salary',
  FREELANCE = 'freelance',
  SIDE_HUSTLE = 'side_hustle',
  INVESTMENT = 'investment',
  PASSIVE = 'passive',
  OTHER = 'other',
}

/**
 * Периодичность дохода
 */
export enum IncomeFrequency {
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  YEARLY = 'yearly',
  ONE_TIME = 'one_time',
}

/**
 * Источник дохода
 */
export interface IncomeSource {
  id: string;
  name: string;
  amount: number; // Сумма за период
  type: IncomeType;
  frequency: IncomeFrequency;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Текущие сбережения
 */
export interface Savings {
  id: string;
  currentSavings: number; // Текущие накопления
  alreadySaved: number; // Уже отложенные средства
  updatedAt: Date;
}

/**
 * Финансовая цель
 */
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Настройки приложения
 */
export interface AppSettings {
  id: string;
  savingsPercentage: number; // Процент от дохода для накоплений (10, 15, 20, 30...)
  currency: string; // Валюта (USD, RUB, EUR...)
  locale: string; // Локаль для форматирования
  theme: 'light' | 'dark';
  updatedAt: Date;
}

/**
 * Результаты расчетов
 */
export interface CalculationResults {
  monthlyIncome: number; // Месячный доход
  yearlyIncome: number; // Годовой доход
  monthlySavings: number; // Месячные накопления
  yearlySavings: number; // Годовые накопления

  // Прогнозы накоплений
  projections: {
    years: number;
    total: number; // Общая сумма накоплений через N лет
    saved: number; // Накоплено за N лет
  }[];

  // Разбивка по источникам
  incomeBreakdown: {
    type: IncomeType;
    amount: number;
    percentage: number;
  }[];
}

/**
 * Сценарий "что будет, если"
 */
export interface WhatIfScenario {
  savingsPercentage: number;
  monthlyIncome: number;
  monthlySavings: number;
  projection5Years: number;
  projection10Years: number;
}

/**
 * Доход за конкретный месяц
 */
export interface MonthlyIncome {
  id: string;
  year: number; // 2024, 2025...
  month: number; // 1-12 (январь = 1)
  incomeSourceId: string | null; // Ссылка на IncomeSource (null для разовых)
  amount: number; // Сумма за этот месяц
  name: string; // Название (для разовых доходов)
  type: IncomeType; // Тип дохода
  isActive: boolean; // Включён ли в этом месяце
  isRecurring: boolean; // true = регулярный из Income Sources, false = разовый
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Реальные накопления за конкретный месяц
 */
export interface MonthlySavings {
  id: string;
  year: number; // 2024, 2025...
  month: number; // 1-12 (январь = 1)
  savedAmount: number; // Сколько реально отложили
  notes?: string; // Заметки (опционально)
  createdAt: Date;
  updatedAt: Date;
}
