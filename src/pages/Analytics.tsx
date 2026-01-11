import React from 'react';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency, createWhatIfScenarios } from '@/utils/calculations';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export const Analytics: React.FC = () => {
  const { calculations, settings, savings, yearlySavings } = useAppStore();

  if (!calculations || !settings || !savings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const { incomeBreakdown, monthlyIncome } = calculations;

  // Prepare data for charts
  const breakdownData = incomeBreakdown.map((item) => ({
    name: item.type.replace('_', ' '),
    value: item.amount,
    percentage: item.percentage,
  }));

  // Реальная динамика накоплений по месяцам
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const savingsOverTimeData = monthNames.map((monthName, index) => {
    const month = index + 1;
    const monthSavings = yearlySavings.find(s => s.month === month);
    const savedAmount = monthSavings?.savedAmount || 0;

    // Накопительный итог
    const cumulativeTotal = yearlySavings
      .filter(s => s.month <= month)
      .reduce((sum, s) => sum + s.savedAmount, 0);

    return {
      name: monthName,
      monthly: savedAmount,
      cumulative: cumulativeTotal,
    };
  });

  const whatIfScenarios = createWhatIfScenarios(
    monthlyIncome,
    savings.currentSavings,
    savings.alreadySaved
  );

  const scenarioData = whatIfScenarios.map((s) => ({
    name: `${s.savingsPercentage}%`,
    '5 Years': s.projection5Years,
    '10 Years': s.projection10Years,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Visualize your financial data</p>
      </div>

      {/* Income Breakdown Pie Chart */}
      <Card title="Income Breakdown by Type">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={breakdownData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {breakdownData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                formatCurrency(value, settings.currency, settings.locale)
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Savings Over Time */}
      <Card title="Savings Over Time">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={savingsOverTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                formatCurrency(value, settings.currency, settings.locale)
              }
            />
            <Legend />
            <Line type="monotone" dataKey="monthly" stroke="#10b981" strokeWidth={2} name="Monthly Savings" />
            <Line type="monotone" dataKey="cumulative" stroke="#8b5cf6" strokeWidth={2} name="Cumulative Total" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* What-If Scenarios */}
      <Card title='What-If Scenarios: "What if I save X%?"'>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={scenarioData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                formatCurrency(value, settings.currency, settings.locale)
              }
            />
            <Legend />
            <Bar dataKey="5 Years" fill="#8b5cf6" />
            <Bar dataKey="10 Years" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Comparison Table */}
      <Card title="Savings Rate Comparison">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Savings %</th>
                <th className="text-right py-3 px-4">Monthly</th>
                <th className="text-right py-3 px-4">5 Years</th>
                <th className="text-right py-3 px-4">10 Years</th>
              </tr>
            </thead>
            <tbody>
              {whatIfScenarios.map((scenario) => (
                <tr key={scenario.savingsPercentage} className="border-b">
                  <td className="py-3 px-4">{scenario.savingsPercentage}%</td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(scenario.monthlySavings, settings.currency, settings.locale)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(scenario.projection5Years, settings.currency, settings.locale)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatCurrency(scenario.projection10Years, settings.currency, settings.locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
