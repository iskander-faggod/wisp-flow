import { db } from './database';
import type {
  IncomeSource,
  Savings,
  Goal,
  AppSettings,
  MonthlyIncome,
  MonthlySavings,
  IncomeType
} from '@/types/models';

/**
 * Сервис для работы с источниками дохода
 */
export const incomeService = {
  /**
   * Получить все источники дохода
   */
  async getAll(): Promise<IncomeSource[]> {
    return await db.incomeSources.toArray();
  },

  /**
   * Получить активные источники дохода
   */
  async getActive(): Promise<IncomeSource[]> {
    return await db.incomeSources.where('isActive').equals(1).toArray();
  },

  /**
   * Получить источник дохода по ID
   */
  async getById(id: string): Promise<IncomeSource | undefined> {
    return await db.incomeSources.get(id);
  },

  /**
   * Добавить новый источник дохода
   */
  async add(source: Omit<IncomeSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db.incomeSources.add({
      ...source,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },

  /**
   * Обновить источник дохода
   */
  async update(id: string, updates: Partial<IncomeSource>): Promise<void> {
    await db.incomeSources.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  /**
   * Удалить источник дохода
   */
  async delete(id: string): Promise<void> {
    await db.incomeSources.delete(id);
  },

  /**
   * Получить источники по типу
   */
  async getByType(type: IncomeType): Promise<IncomeSource[]> {
    return await db.incomeSources.where('type').equals(type).toArray();
  },
};

/**
 * Сервис для работы со сбережениями
 */
export const savingsService = {
  /**
   * Получить текущие сбережения
   */
  async get(): Promise<Savings | undefined> {
    const all = await db.savings.toArray();
    return all[0]; // Должна быть только одна запись
  },

  /**
   * Обновить сбережения
   */
  async update(data: Omit<Savings, 'id' | 'updatedAt'>): Promise<void> {
    const existing = await this.get();

    if (existing) {
      await db.savings.update(existing.id, {
        ...data,
        updatedAt: new Date(),
      });
    } else {
      const id = crypto.randomUUID();
      await db.savings.add({
        ...data,
        id,
        updatedAt: new Date(),
      });
    }
  },

  /**
   * Инициализировать сбережения (если их нет)
   */
  async initialize(): Promise<void> {
    const existing = await this.get();
    if (!existing) {
      await this.update({
        currentSavings: 0,
        alreadySaved: 0,
      });
    }
  },
};

/**
 * Сервис для работы с целями
 */
export const goalsService = {
  /**
   * Получить все цели
   */
  async getAll(): Promise<Goal[]> {
    return await db.goals.orderBy('createdAt').reverse().toArray();
  },

  /**
   * Получить цель по ID
   */
  async getById(id: string): Promise<Goal | undefined> {
    return await db.goals.get(id);
  },

  /**
   * Добавить новую цель
   */
  async add(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db.goals.add({
      ...goal,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },

  /**
   * Обновить цель
   */
  async update(id: string, updates: Partial<Goal>): Promise<void> {
    await db.goals.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  /**
   * Удалить цель
   */
  async delete(id: string): Promise<void> {
    await db.goals.delete(id);
  },

  /**
   * Обновить прогресс цели
   */
  async updateProgress(id: string, amount: number): Promise<void> {
    await db.goals.update(id, {
      currentAmount: amount,
      updatedAt: new Date(),
    });
  },
};

/**
 * Сервис для работы с настройками
 */
export const settingsService = {
  /**
   * Получить настройки
   */
  async get(): Promise<AppSettings | undefined> {
    const all = await db.settings.toArray();
    return all[0]; // Должна быть только одна запись
  },

  /**
   * Обновить настройки
   */
  async update(data: Partial<AppSettings>): Promise<void> {
    const existing = await this.get();

    if (existing) {
      await db.settings.update(existing.id, {
        ...data,
        updatedAt: new Date(),
      });
    } else {
      const id = crypto.randomUUID();
      await db.settings.add({
        savingsPercentage: 20,
        currency: 'USD',
        locale: 'en-US',
        theme: 'light',
        ...data,
        id,
        updatedAt: new Date(),
      });
    }
  },

  /**
   * Инициализировать настройки по умолчанию
   */
  async initialize(): Promise<void> {
    const existing = await this.get();
    if (!existing) {
      await this.update({
        savingsPercentage: 20,
        currency: 'USD',
        locale: 'en-US',
        theme: 'light',
      });
    }
  },
};

/**
 * Сервис для работы с месячными доходами
 */
export const monthlyIncomeService = {
  /**
   * Получить доходы за конкретный месяц
   */
  async getByMonth(year: number, month: number): Promise<MonthlyIncome[]> {
    return await db.monthlyIncomes
      .where('[year+month]')
      .equals([year, month])
      .toArray();
  },

  /**
   * Получить доходы за год
   */
  async getByYear(year: number): Promise<MonthlyIncome[]> {
    return await db.monthlyIncomes.where('year').equals(year).sortBy('month');
  },

  /**
   * Добавить месячный доход (разовый)
   */
  async addOneTime(data: {
    year: number;
    month: number;
    amount: number;
    name: string;
    type: IncomeType;
  }): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();

    await db.monthlyIncomes.add({
      id,
      year: data.year,
      month: data.month,
      incomeSourceId: null,
      amount: data.amount,
      name: data.name,
      type: data.type,
      isActive: true,
      isRecurring: false,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },

  /**
   * Переключить активность месячного дохода
   */
  async toggleActive(id: string): Promise<void> {
    const income = await db.monthlyIncomes.get(id);
    if (income) {
      await db.monthlyIncomes.update(id, {
        isActive: !income.isActive,
        updatedAt: new Date(),
      });
    }
  },

  /**
   * Обновить сумму месячного дохода
   */
  async updateAmount(id: string, amount: number): Promise<void> {
    await db.monthlyIncomes.update(id, {
      amount,
      updatedAt: new Date(),
    });
  },

  /**
   * Удалить месячный доход
   */
  async delete(id: string): Promise<void> {
    await db.monthlyIncomes.delete(id);
  },

  /**
   * Генерировать месячные доходы из регулярных источников
   * Вызывается при добавлении/изменении IncomeSource с frequency=monthly
   */
  async generateFromSource(source: IncomeSource, startYear: number, startMonth: number, monthsCount: number = 12): Promise<void> {
    if (source.frequency !== 'monthly') return;

    const now = new Date();

    for (let i = 0; i < monthsCount; i++) {
      let year = startYear;
      let month = startMonth + i;

      // Корректировка года
      while (month > 12) {
        month -= 12;
        year += 1;
      }

      // Проверить, существует ли уже запись
      const existing = await db.monthlyIncomes
        .where('[year+month]')
        .equals([year, month])
        .and((income) => income.incomeSourceId === source.id)
        .first();

      if (!existing) {
        const id = crypto.randomUUID();
        await db.monthlyIncomes.add({
          id,
          year,
          month,
          incomeSourceId: source.id,
          amount: source.amount,
          name: source.name,
          type: source.type,
          isActive: source.isActive,
          isRecurring: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  },

  /**
   * Удалить все месячные доходы связанные с источником
   */
  async deleteBySource(sourceId: string): Promise<void> {
    const toDelete = await db.monthlyIncomes
      .where('incomeSourceId')
      .equals(sourceId)
      .toArray();

    const ids = toDelete.map((item) => item.id);
    await db.monthlyIncomes.bulkDelete(ids);
  },

  /**
   * Обновить все месячные доходы при изменении источника
   */
  async updateFromSource(source: IncomeSource): Promise<void> {
    const existing = await db.monthlyIncomes
      .where('incomeSourceId')
      .equals(source.id)
      .toArray();

    for (const income of existing) {
      await db.monthlyIncomes.update(income.id, {
        amount: source.amount,
        name: source.name,
        type: source.type,
        updatedAt: new Date(),
      });
    }
  },
};

/**
 * Сервис для работы с месячными накоплениями
 */
export const monthlySavingsService = {
  /**
   * Получить накопления за конкретный месяц
   */
  async getByMonth(year: number, month: number): Promise<MonthlySavings | undefined> {
    const result = await db.monthlySavings
      .where('[year+month]')
      .equals([year, month])
      .first();
    return result;
  },

  /**
   * Установить/обновить накопления за месяц
   */
  async setSavings(year: number, month: number, savedAmount: number, notes?: string): Promise<void> {
    const existing = await this.getByMonth(year, month);

    if (existing) {
      await db.monthlySavings.update(existing.id, {
        savedAmount,
        notes,
        updatedAt: new Date(),
      });
    } else {
      const id = crypto.randomUUID();
      const now = new Date();
      await db.monthlySavings.add({
        id,
        year,
        month,
        savedAmount,
        notes,
        createdAt: now,
        updatedAt: now,
      });
    }
  },

  /**
   * Получить все накопления за год
   */
  async getByYear(year: number): Promise<MonthlySavings[]> {
    return await db.monthlySavings.where('year').equals(year).sortBy('month');
  },
};

/**
 * Инициализация базы данных с данными по умолчанию
 */
export async function initializeDatabase(): Promise<void> {
  await savingsService.initialize();
  await settingsService.initialize();

  // Генерируем месячные доходы для текущего года
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const sources = await incomeService.getAll();
  for (const source of sources) {
    if (source.frequency === 'monthly' && source.isActive) {
      await monthlyIncomeService.generateFromSource(source, currentYear, currentMonth, 12);
    }
  }
}
