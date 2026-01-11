import Dexie, { Table } from 'dexie';
import type { IncomeSource, Savings, Goal, AppSettings, MonthlyIncome, MonthlySavings } from '@/types/models';

/**
 * Класс базы данных Wispr Flow
 * Использует Dexie.js для работы с IndexedDB
 */
export class WisprFlowDatabase extends Dexie {
  incomeSources!: Table<IncomeSource, string>;
  savings!: Table<Savings, string>;
  goals!: Table<Goal, string>;
  settings!: Table<AppSettings, string>;
  monthlyIncomes!: Table<MonthlyIncome, string>;
  monthlySavings!: Table<MonthlySavings, string>;

  constructor() {
    super('WisprFlowDB');

    // Version 1 - original schema
    this.version(1).stores({
      incomeSources: 'id, name, type, frequency, isActive, createdAt',
      savings: 'id, updatedAt',
      goals: 'id, name, deadline, createdAt',
      settings: 'id, updatedAt',
    });

    // Version 2 - add monthlyIncomes
    this.version(2).stores({
      incomeSources: 'id, name, type, frequency, isActive, createdAt',
      savings: 'id, updatedAt',
      goals: 'id, name, deadline, createdAt',
      settings: 'id, updatedAt',
      monthlyIncomes: 'id, [year+month], incomeSourceId, year, month, isActive, createdAt',
    });

    // Version 3 - add monthlySavings
    this.version(3).stores({
      incomeSources: 'id, name, type, frequency, isActive, createdAt',
      savings: 'id, updatedAt',
      goals: 'id, name, deadline, createdAt',
      settings: 'id, updatedAt',
      monthlyIncomes: 'id, [year+month], incomeSourceId, year, month, isActive, createdAt',
      monthlySavings: 'id, [year+month], year, month, createdAt',
    });
  }
}

// Экспортируем единственный экземпляр базы данных
export const db = new WisprFlowDatabase();
