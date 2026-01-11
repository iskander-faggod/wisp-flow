import type {
  IncomeSource,
  IncomeFrequency,
  IncomeType,
  MonthlyIncome,
  CalculationResults,
  WhatIfScenario,
} from '@/types/models';

/**
 * Конвертировать доход в месячный эквивалент
 */
export function convertToMonthly(amount: number, frequency: IncomeFrequency): number {
  switch (frequency) {
    case 'monthly':
      return amount;
    case 'weekly':
      return amount * 52 / 12; // 52 недели в году / 12 месяцев
    case 'yearly':
      return amount / 12;
    case 'one_time':
      return 0; // Разовый доход не учитываем в регулярных расчетах
    default:
      return 0;
  }
}

/**
 * Конвертировать доход в годовой эквивалент
 */
export function convertToYearly(amount: number, frequency: IncomeFrequency): number {
  return convertToMonthly(amount, frequency) * 12;
}

/**
 * Рассчитать общий месячный доход из всех источников
 */
export function calculateMonthlyIncome(sources: IncomeSource[]): number {
  return sources
    .filter(source => source.isActive)
    .reduce((total, source) => {
      return total + convertToMonthly(source.amount, source.frequency);
    }, 0);
}

/**
 * Рассчитать общий годовой доход
 */
export function calculateYearlyIncome(sources: IncomeSource[]): number {
  return calculateMonthlyIncome(sources) * 12;
}

/**
 * Рассчитать разбивку дохода по типам источников
 */
export function calculateIncomeBreakdown(sources: IncomeSource[]): {
  type: IncomeType;
  amount: number;
  percentage: number;
}[] {
  const activeSources = sources.filter(s => s.isActive);
  const totalMonthly = calculateMonthlyIncome(activeSources);

  // Группируем по типам
  const breakdown = new Map<IncomeType, number>();
  activeSources.forEach(source => {
    const monthlyAmount = convertToMonthly(source.amount, source.frequency);
    const current = breakdown.get(source.type) || 0;
    breakdown.set(source.type, current + monthlyAmount);
  });

  // Конвертируем в массив с процентами
  return Array.from(breakdown.entries()).map(([type, amount]) => ({
    type,
    amount,
    percentage: totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0,
  }));
}

/**
 * Рассчитать месячные накопления
 */
export function calculateMonthlySavings(
  monthlyIncome: number,
  savingsPercentage: number
): number {
  return (monthlyIncome * savingsPercentage) / 100;
}

/**
 * Рассчитать годовые накопления
 */
export function calculateYearlySavings(
  monthlyIncome: number,
  savingsPercentage: number
): number {
  return calculateMonthlySavings(monthlyIncome, savingsPercentage) * 12;
}

/**
 * Рассчитать прогноз накоплений на N лет
 */
export function calculateSavingsProjection(
  currentSavings: number,
  alreadySaved: number,
  monthlyIncome: number,
  savingsPercentage: number,
  years: number
): number {
  const yearlySavings = calculateYearlySavings(monthlyIncome, savingsPercentage);
  const totalSaved = yearlySavings * years;
  return currentSavings + alreadySaved + totalSaved;
}

/**
 * Рассчитать месячный доход из MonthlyIncome данных
 */
export function calculateMonthlyIncomeFromData(monthlyIncomes: MonthlyIncome[]): number {
  return monthlyIncomes
    .filter(income => income.isActive)
    .reduce((total, income) => total + income.amount, 0);
}

/**
 * Рассчитать годовой доход из MonthlyIncome данных
 */
export function calculateYearlyIncomeFromData(yearData: Map<number, MonthlyIncome[]>): number {
  let total = 0;
  for (let month = 1; month <= 12; month++) {
    const monthIncomes = yearData.get(month) || [];
    total += calculateMonthlyIncomeFromData(monthIncomes);
  }
  return total;
}

/**
 * Рассчитать разбивку дохода по типам из MonthlyIncome
 */
export function calculateIncomeBreakdownFromData(monthlyIncomes: MonthlyIncome[]): {
  type: IncomeType;
  amount: number;
  percentage: number;
}[] {
  const activeIncomes = monthlyIncomes.filter(i => i.isActive);
  const totalMonthly = calculateMonthlyIncomeFromData(activeIncomes);

  // Группируем по типам
  const breakdown = new Map<IncomeType, number>();
  activeIncomes.forEach(income => {
    const current = breakdown.get(income.type) || 0;
    breakdown.set(income.type, current + income.amount);
  });

  // Конвертируем в массив с процентами
  return Array.from(breakdown.entries()).map(([type, amount]) => ({
    type,
    amount,
    percentage: totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0,
  }));
}

/**
 * Рассчитать все результаты НА ОСНОВЕ МЕСЯЧНЫХ ДАННЫХ
 */
export function calculateResultsFromMonthlyData(
  currentMonthIncomes: MonthlyIncome[], // Доходы текущего месяца
  yearData: Map<number, MonthlyIncome[]>, // Все доходы за год
  currentSavings: number,
  alreadySaved: number,
  savingsPercentage: number
): CalculationResults {
  const monthlyIncome = calculateMonthlyIncomeFromData(currentMonthIncomes);
  const yearlyIncome = calculateYearlyIncomeFromData(yearData);
  const monthlySavings = calculateMonthlySavings(monthlyIncome, savingsPercentage);
  const yearlySavings = calculateYearlySavings(monthlyIncome, savingsPercentage);

  // Прогнозы на 1, 3, 5, 10 лет
  const projectionYears = [1, 3, 5, 10];
  const projections = projectionYears.map(years => ({
    years,
    total: calculateSavingsProjection(
      currentSavings,
      alreadySaved,
      monthlyIncome,
      savingsPercentage,
      years
    ),
    saved: yearlySavings * years,
  }));

  const incomeBreakdown = calculateIncomeBreakdownFromData(currentMonthIncomes);

  return {
    monthlyIncome,
    yearlyIncome,
    monthlySavings,
    yearlySavings,
    projections,
    incomeBreakdown,
  };
}

/**
 * Рассчитать все результаты (СТАРАЯ ВЕРСИЯ - для обратной совместимости)
 */
export function calculateResults(
  sources: IncomeSource[],
  currentSavings: number,
  alreadySaved: number,
  savingsPercentage: number
): CalculationResults {
  const monthlyIncome = calculateMonthlyIncome(sources);
  const yearlyIncome = calculateYearlyIncome(sources);
  const monthlySavings = calculateMonthlySavings(monthlyIncome, savingsPercentage);
  const yearlySavings = calculateYearlySavings(monthlyIncome, savingsPercentage);

  // Прогнозы на 1, 3, 5, 10 лет
  const projectionYears = [1, 3, 5, 10];
  const projections = projectionYears.map(years => ({
    years,
    total: calculateSavingsProjection(
      currentSavings,
      alreadySaved,
      monthlyIncome,
      savingsPercentage,
      years
    ),
    saved: yearlySavings * years,
  }));

  const incomeBreakdown = calculateIncomeBreakdown(sources);

  return {
    monthlyIncome,
    yearlyIncome,
    monthlySavings,
    yearlySavings,
    projections,
    incomeBreakdown,
  };
}

/**
 * Создать сценарий "что будет, если"
 */
export function createWhatIfScenario(
  monthlyIncome: number,
  savingsPercentage: number,
  currentSavings: number,
  alreadySaved: number
): WhatIfScenario {
  const monthlySavings = calculateMonthlySavings(monthlyIncome, savingsPercentage);

  return {
    savingsPercentage,
    monthlyIncome,
    monthlySavings,
    projection5Years: calculateSavingsProjection(
      currentSavings,
      alreadySaved,
      monthlyIncome,
      savingsPercentage,
      5
    ),
    projection10Years: calculateSavingsProjection(
      currentSavings,
      alreadySaved,
      monthlyIncome,
      savingsPercentage,
      10
    ),
  };
}

/**
 * Создать несколько сценариев с разными процентами накоплений
 */
export function createWhatIfScenarios(
  monthlyIncome: number,
  currentSavings: number,
  alreadySaved: number,
  percentages: number[] = [10, 15, 20, 30, 40, 50]
): WhatIfScenario[] {
  return percentages.map(percentage =>
    createWhatIfScenario(monthlyIncome, percentage, currentSavings, alreadySaved)
  );
}

/**
 * Форматировать валюту
 */
export function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Форматировать процент
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Рассчитать прогресс цели
 */
export function calculateGoalProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}

/**
 * Рассчитать сколько месяцев нужно для достижения цели
 */
export function calculateMonthsToGoal(
  currentAmount: number,
  targetAmount: number,
  monthlySavings: number
): number {
  if (monthlySavings === 0) return Infinity;
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / monthlySavings);
}
