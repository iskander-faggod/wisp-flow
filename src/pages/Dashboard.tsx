import React from 'react';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/utils/calculations';
import { Wallet, TrendingUp, Target } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { calculations, settings, savings, currentMonthSavings, yearlySavings, yearlyIncomes } = useAppStore();

  if (!calculations || !settings || !savings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const { monthlyIncome, yearlyIncome } = calculations;

  // Total Savings = alreadySaved + currentSavings + сумма всех monthly savings
  const yearlySavingsTotal = yearlySavings.reduce((sum, s) => sum + s.savedAmount, 0);
  const totalSavings = savings.currentSavings + savings.alreadySaved + yearlySavingsTotal;

  // Реальные накопления текущего месяца
  const realMonthlySavings = currentMonthSavings?.savedAmount || 0;
  const realSavingsPercentage = monthlyIncome > 0
    ? (realMonthlySavings / monthlyIncome) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Your financial overview</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(monthlyIncome, settings.currency, settings.locale)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Yearly Income</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(yearlyIncome, settings.currency, settings.locale)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(realMonthlySavings, settings.currency, settings.locale)}
              </p>
              {realMonthlySavings > 0 && (
                <p className="text-xs text-gray-500 mt-1">{realSavingsPercentage.toFixed(1)}% of income</p>
              )}
              {realMonthlySavings === 0 && (
                <p className="text-xs text-gray-400 mt-1">No savings entered yet</p>
              )}
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Current Savings */}
      <Card title="Current Savings">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Savings</span>
            <span className="text-xl font-semibold">
              {formatCurrency(savings.currentSavings, settings.currency, settings.locale)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Already Saved</span>
            <span className="text-xl font-semibold">
              {formatCurrency(savings.alreadySaved, settings.currency, settings.locale)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">This Year Savings</span>
            <span className="text-xl font-semibold text-green-600">
              {formatCurrency(yearlySavingsTotal, settings.currency, settings.locale)}
            </span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-medium">Total Savings</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(totalSavings, settings.currency, settings.locale)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Savings Over Time */}
      <Card title="Savings Over Time">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthSavings = yearlySavings.find(s => s.month === month);
            const monthIncomes = yearlyIncomes.get(month) || [];
            const monthIncome = monthIncomes
              .filter(income => income.isActive)
              .reduce((total, income) => total + income.amount, 0);
            const savedAmount = monthSavings?.savedAmount || 0;
            const percentage = monthIncome > 0 ? (savedAmount / monthIncome) * 100 : 0;
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const isCurrent = month === currentMonth;

            return (
              <div
                key={month}
                className={`p-3 rounded-xl border-2 ${
                  isCurrent
                    ? 'border-green-500 bg-green-50'
                    : savedAmount > 0
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className={`text-xs font-medium mb-1 ${isCurrent ? 'text-green-700' : 'text-gray-600'}`}>
                  {monthNames[i]}
                </p>
                <p className={`text-lg font-bold ${savedAmount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {savedAmount > 0 ? formatCurrency(savedAmount, settings.currency, settings.locale) : '—'}
                </p>
                {savedAmount > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {percentage.toFixed(1)}%
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="This Year">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Saved So Far</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  yearlySavings.reduce((sum, s) => sum + s.savedAmount, 0),
                  settings.currency,
                  settings.locale
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Income</span>
              <span className="font-semibold">
                {formatCurrency(yearlyIncome, settings.currency, settings.locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Savings Rate</span>
              <span className="font-semibold">
                {yearlySavings.length > 0
                  ? ((yearlySavings.reduce((sum, s) => sum + s.savedAmount, 0) / yearlyIncome) * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
          </div>
        </Card>

        <Card title="Motivation">
          <div className="space-y-3">
            <p className="text-gray-700">
              Keep tracking your income and savings to build a strong financial future.
            </p>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Great job!</strong> Check Analytics to see your long-term projections
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
