import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { monthlyIncomeService, monthlySavingsService } from '@/db/services';
import type { MonthlyIncome as MonthlyIncomeType, MonthlySavings, IncomeType } from '@/types/models';
import { IncomeType as IncomeTypeEnum } from '@/types/models';
import { Plus, Check, X, ChevronLeft, ChevronRight, PiggyBank } from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { useAppStore } from '@/store/useAppStore';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthlyIncome: React.FC = () => {
  const { settings } = useAppStore();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [monthlyData, setMonthlyData] = useState<Map<number, MonthlyIncomeType[]>>(new Map());
  const [monthlySavingsData, setMonthlySavingsData] = useState<Map<number, MonthlySavings | undefined>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Form state for adding one-time income
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<IncomeType>(IncomeTypeEnum.FREELANCE);

  useEffect(() => {
    loadMonthlyData();
  }, [selectedYear]);

  const loadMonthlyData = async () => {
    const data = new Map<number, MonthlyIncomeType[]>();
    const savingsData = new Map<number, MonthlySavings | undefined>();

    for (let month = 1; month <= 12; month++) {
      const incomes = await monthlyIncomeService.getByMonth(selectedYear, month);
      const savings = await monthlySavingsService.getByMonth(selectedYear, month);
      data.set(month, incomes);
      savingsData.set(month, savings);
    }

    setMonthlyData(data);
    setMonthlySavingsData(savingsData);
  };

  const handleToggleActive = async (id: string) => {
    await monthlyIncomeService.toggleActive(id);
    await loadMonthlyData();
  };

  const handleOpenModal = (month: number) => {
    setSelectedMonth(month);
    setName('');
    setAmount('');
    setType(IncomeTypeEnum.FREELANCE);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMonth(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMonth === null) return;

    await monthlyIncomeService.addOneTime({
      year: selectedYear,
      month: selectedMonth,
      amount: parseFloat(amount),
      name,
      type,
    });

    await loadMonthlyData();
    handleCloseModal();
  };

  const handleDeleteIncome = async (id: string) => {
    if (confirm('Delete this income?')) {
      await monthlyIncomeService.delete(id);
      await loadMonthlyData();
    }
  };

  const calculateMonthTotal = (month: number): number => {
    const incomes = monthlyData.get(month) || [];
    return incomes
      .filter(income => income.isActive)
      .reduce((sum, income) => sum + income.amount, 0);
  };

  const calculateSavingsPercentage = (month: number): number => {
    const total = calculateMonthTotal(month);
    const savings = monthlySavingsData.get(month);
    if (!total || !savings) return 0;
    return (savings.savedAmount / total) * 100;
  };

  const handleSavingsUpdate = async (month: number, amount: string) => {
    const savedAmount = parseFloat(amount) || 0;
    await monthlySavingsService.setSavings(selectedYear, month, savedAmount);
    await loadMonthlyData();
  };

  const typeLabels: Record<IncomeType, string> = {
    [IncomeTypeEnum.SALARY]: 'Salary',
    [IncomeTypeEnum.FREELANCE]: 'Freelance',
    [IncomeTypeEnum.SIDE_HUSTLE]: 'Side Hustle',
    [IncomeTypeEnum.INVESTMENT]: 'Investment',
    [IncomeTypeEnum.PASSIVE]: 'Passive',
    [IncomeTypeEnum.OTHER]: 'Other',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Monthly Income</h1>
          <p className="text-gray-600">Manage income for each month</p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setSelectedYear(selectedYear - 1)}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xl font-semibold min-w-[80px] text-center">
            {selectedYear}
          </span>
          <Button
            onClick={() => setSelectedYear(selectedYear + 1)}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MONTHS.map((monthName, index) => {
          const month = index + 1;
          const incomes = monthlyData.get(month) || [];
          const total = calculateMonthTotal(month);
          const savings = monthlySavingsData.get(month);
          const savingsPercentage = calculateSavingsPercentage(month);
          const isCurrentMonth =
            month === currentDate.getMonth() + 1 &&
            selectedYear === currentDate.getFullYear();

          return (
            <Card
              key={month}
              className={`${isCurrentMonth ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className="space-y-3">
                {/* Month Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {monthName}
                    {isCurrentMonth && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </h3>
                  <Button
                    onClick={() => handleOpenModal(month)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Income List */}
                <div className="space-y-2">
                  {incomes.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No income</p>
                  ) : (
                    incomes.map((income) => (
                      <div
                        key={income.id}
                        className={`flex items-center justify-between p-2 rounded-lg border ${
                          income.isActive
                            ? 'border-gray-200 bg-white'
                            : 'border-gray-100 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {income.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {settings
                              ? formatCurrency(income.amount, settings.currency, settings.locale)
                              : income.amount}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {income.isRecurring ? (
                            <button
                              onClick={() => handleToggleActive(income.id)}
                              className={`p-1 rounded ${
                                income.isActive
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={income.isActive ? 'Active' : 'Inactive'}
                            >
                              {income.isActive ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteIncome(income.id)}
                              className="p-1 rounded text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Month Total */}
                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Income:</span>
                    <span className="text-lg font-bold text-primary-600">
                      {settings
                        ? formatCurrency(total, settings.currency, settings.locale)
                        : total}
                    </span>
                  </div>

                  {/* Savings Input */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-600">Saved:</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={savings?.savedAmount || ''}
                        onChange={(e) => handleSavingsUpdate(month, e.target.value)}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      {savingsPercentage > 0 && (
                        <span className="text-sm font-semibold text-green-600 min-w-[50px]">
                          {savingsPercentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add One-Time Income Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Add Income for ${selectedMonth ? MONTHS[selectedMonth - 1] : ''} ${selectedYear}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={setName}
            placeholder="e.g., Freelance Project, Bonus"
            required
          />

          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />

          <Select
            label="Type"
            value={type}
            onChange={(value) => setType(value as IncomeType)}
            options={Object.values(IncomeTypeEnum).map((t) => ({
              value: t,
              label: typeLabels[t],
            }))}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={handleCloseModal} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Add Income
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
