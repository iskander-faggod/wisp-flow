import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAppStore } from '@/store/useAppStore';
import { IncomeType, IncomeFrequency } from '@/types/models';
import { Plus, Trash2, Edit2, DollarSign } from 'lucide-react';
import { formatCurrency, convertToMonthly } from '@/utils/calculations';

export const IncomeSources: React.FC = () => {
  const { incomeSources, settings, addIncomeSource, updateIncomeSource, deleteIncomeSource } =
    useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<IncomeType>(IncomeType.SALARY);
  const [frequency, setFrequency] = useState<IncomeFrequency>(IncomeFrequency.MONTHLY);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setName('');
    setAmount('');
    setType(IncomeType.SALARY);
    setFrequency(IncomeFrequency.MONTHLY);
    setIsActive(true);
    setEditingId(null);
  };

  const handleOpenModal = (id?: string) => {
    if (id) {
      const source = incomeSources.find((s) => s.id === id);
      if (source) {
        setName(source.name);
        setAmount(source.amount.toString());
        setType(source.type);
        setFrequency(source.frequency);
        setIsActive(source.isActive);
        setEditingId(id);
      }
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name,
      amount: parseFloat(amount),
      type,
      frequency,
      isActive,
    };

    if (editingId) {
      await updateIncomeSource(editingId, data);
    } else {
      await addIncomeSource(data);
    }

    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this income source?')) {
      await deleteIncomeSource(id);
    }
  };

  const typeLabels: Record<IncomeType, string> = {
    [IncomeType.SALARY]: 'Salary',
    [IncomeType.FREELANCE]: 'Freelance',
    [IncomeType.SIDE_HUSTLE]: 'Side Hustle',
    [IncomeType.INVESTMENT]: 'Investment',
    [IncomeType.PASSIVE]: 'Passive Income',
    [IncomeType.OTHER]: 'Other',
  };

  const frequencyLabels: Record<IncomeFrequency, string> = {
    [IncomeFrequency.MONTHLY]: 'Monthly',
    [IncomeFrequency.WEEKLY]: 'Weekly',
    [IncomeFrequency.YEARLY]: 'Yearly',
    [IncomeFrequency.ONE_TIME]: 'One-time',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Income Sources</h1>
          <p className="text-gray-600">Manage your income streams</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Income
        </Button>
      </div>

      {/* Income Sources List */}
      {incomeSources.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No income sources yet</p>
            <Button onClick={() => handleOpenModal()} variant="primary">
              Add Your First Income
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incomeSources.map((source) => (
            <Card key={source.id} className={!source.isActive ? 'opacity-60' : ''}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{source.name}</h3>
                    <p className="text-sm text-gray-500">{typeLabels[source.type]}</p>
                  </div>
                  {!source.isActive && (
                    <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    {settings
                      ? formatCurrency(source.amount, settings.currency, settings.locale)
                      : source.amount}
                  </p>
                  <p className="text-sm text-gray-500">{frequencyLabels[source.frequency]}</p>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    Monthly equivalent:{' '}
                    <span className="font-semibold">
                      {settings
                        ? formatCurrency(
                            convertToMonthly(source.amount, source.frequency),
                            settings.currency,
                            settings.locale
                          )
                        : convertToMonthly(source.amount, source.frequency)}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleOpenModal(source.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1 inline" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(source.id)}
                    variant="danger"
                    size="sm"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1 inline" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Income Source' : 'Add Income Source'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={setName}
            placeholder="e.g., Main Job, Freelance Project"
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
            options={Object.values(IncomeType).map((t) => ({
              value: t,
              label: typeLabels[t],
            }))}
            required
          />

          <Select
            label="Frequency"
            value={frequency}
            onChange={(value) => setFrequency(value as IncomeFrequency)}
            options={Object.values(IncomeFrequency).map((f) => ({
              value: f,
              label: frequencyLabels[f],
            }))}
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active (include in calculations)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={handleCloseModal} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {editingId ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
