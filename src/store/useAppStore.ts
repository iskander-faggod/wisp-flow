import { create } from 'zustand';
import type {
  IncomeSource,
  Savings,
  Goal,
  AppSettings,
  MonthlyIncome,
  MonthlySavings,
  CalculationResults,
} from '@/types/models';
import {
  incomeService,
  savingsService,
  goalsService,
  settingsService,
  monthlyIncomeService,
  monthlySavingsService,
} from '@/db/services';
import { calculateResultsFromMonthlyData } from '@/utils/calculations';

interface AppState {
  // Данные
  incomeSources: IncomeSource[];
  savings: Savings | null;
  goals: Goal[];
  settings: AppSettings | null;
  calculations: CalculationResults | null;

  // Месячные данные
  currentMonthIncomes: MonthlyIncome[]; // Доходы текущего месяца
  currentMonthSavings: MonthlySavings | null; // Реальные накопления текущего месяца
  yearlyIncomes: Map<number, MonthlyIncome[]>; // Все доходы за год
  yearlySavings: MonthlySavings[]; // Все накопления за год

  // Состояние загрузки
  isLoading: boolean;
  error: string | null;

  // Действия
  loadData: () => Promise<void>;
  recalculate: () => Promise<void>;

  // Income sources
  addIncomeSource: (source: Omit<IncomeSource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncomeSource: (id: string, updates: Partial<IncomeSource>) => Promise<void>;
  deleteIncomeSource: (id: string) => Promise<void>;

  // Savings
  updateSavings: (data: Omit<Savings, 'id' | 'updatedAt'>) => Promise<void>;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Начальное состояние
  incomeSources: [],
  savings: null,
  goals: [],
  settings: null,
  calculations: null,
  currentMonthIncomes: [],
  currentMonthSavings: null,
  yearlyIncomes: new Map(),
  yearlySavings: [],
  isLoading: false,
  error: null,

  // Загрузка всех данных из базы
  loadData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [incomeSources, savings, goals, settings] = await Promise.all([
        incomeService.getAll(),
        savingsService.get(),
        goalsService.getAll(),
        settingsService.get(),
      ]);

      set({
        incomeSources,
        savings: savings || null,
        goals,
        settings: settings || null,
        isLoading: false,
      });

      // Пересчитать результаты (загрузит месячные данные)
      await get().recalculate();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
      });
    }
  },

  // Пересчитать результаты на основе месячных данных
  recalculate: async () => {
    const { savings, settings } = get();
    if (!savings || !settings) return;

    try {
      // Загрузить месячные данные
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Загрузить доходы текущего месяца
      const currentMonthIncomes = await monthlyIncomeService.getByMonth(currentYear, currentMonth);

      // Загрузить реальные накопления текущего месяца
      const currentMonthSavings = await monthlySavingsService.getByMonth(currentYear, currentMonth);

      // Загрузить все доходы за год
      const yearlyIncomes = new Map<number, MonthlyIncome[]>();
      for (let month = 1; month <= 12; month++) {
        const monthIncomes = await monthlyIncomeService.getByMonth(currentYear, month);
        yearlyIncomes.set(month, monthIncomes);
      }

      // Загрузить все накопления за год
      const yearlySavings = await monthlySavingsService.getByYear(currentYear);

      // Рассчитать результаты на основе реальных месячных данных
      const calculations = calculateResultsFromMonthlyData(
        currentMonthIncomes,
        yearlyIncomes,
        savings.currentSavings,
        savings.alreadySaved,
        settings.savingsPercentage
      );

      set({
        currentMonthIncomes,
        currentMonthSavings: currentMonthSavings || null,
        yearlyIncomes,
        yearlySavings,
        calculations
      });
    } catch (error) {
      console.error('Failed to recalculate:', error);
    }
  },

  // Добавить источник дохода
  addIncomeSource: async (source) => {
    try {
      await incomeService.add(source);
      const incomeSources = await incomeService.getAll();
      set({ incomeSources });
      await get().recalculate();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add income source' });
    }
  },

  // Обновить источник дохода
  updateIncomeSource: async (id, updates) => {
    try {
      await incomeService.update(id, updates);
      const incomeSources = await incomeService.getAll();
      set({ incomeSources });
      await get().recalculate();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update income source' });
    }
  },

  // Удалить источник дохода
  deleteIncomeSource: async (id) => {
    try {
      await incomeService.delete(id);
      const incomeSources = await incomeService.getAll();
      set({ incomeSources });
      await get().recalculate();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete income source' });
    }
  },

  // Обновить сбережения
  updateSavings: async (data) => {
    try {
      await savingsService.update(data);
      const savings = await savingsService.get();
      set({ savings: savings || null });
      await get().recalculate();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update savings' });
    }
  },

  // Добавить цель
  addGoal: async (goal) => {
    try {
      await goalsService.add(goal);
      const goals = await goalsService.getAll();
      set({ goals });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add goal' });
    }
  },

  // Обновить цель
  updateGoal: async (id, updates) => {
    try {
      await goalsService.update(id, updates);
      const goals = await goalsService.getAll();
      set({ goals });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update goal' });
    }
  },

  // Удалить цель
  deleteGoal: async (id) => {
    try {
      await goalsService.delete(id);
      const goals = await goalsService.getAll();
      set({ goals });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete goal' });
    }
  },

  // Обновить настройки
  updateSettings: async (updates) => {
    try {
      await settingsService.update(updates);
      const settings = await settingsService.get();
      set({ settings: settings || null });
      await get().recalculate();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update settings' });
    }
  },
}));
