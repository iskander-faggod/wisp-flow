import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Trash2, Edit2, Target } from 'lucide-react';
import { formatCurrency, calculateGoalProgress, calculateMonthsToGoal } from '@/utils/calculations';

export const Goals: React.FC = () => {
  const { goals, settings, calculations, addGoal, updateGoal, deleteGoal } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [deadline, setDeadline] = useState('');

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDescription('');
    setColor('#8b5cf6');
    setDeadline('');
    setEditingId(null);
  };

  const handleOpenModal = (id?: string) => {
    if (id) {
      const goal = goals.find((g) => g.id === id);
      if (goal) {
        setName(goal.name);
        setTargetAmount(goal.targetAmount.toString());
        setCurrentAmount(goal.currentAmount.toString());
        setDescription(goal.description || '');
        setColor(goal.color);
        setDeadline(goal.deadline ? goal.deadline.toISOString().split('T')[0] : '');
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
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      description,
      color,
      deadline: deadline ? new Date(deadline) : undefined,
    };

    if (editingId) {
      await updateGoal(editingId, data);
    } else {
      await addGoal(data);
    }

    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
    }
  };

  const monthlySavings = calculations?.monthlySavings || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Goals</h1>
          <p className="text-gray-600">Track your financial goals</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No goals yet</p>
            <Button onClick={() => handleOpenModal()} variant="primary">
              Set Your First Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
            const monthsToGoal = calculateMonthsToGoal(
              goal.currentAmount,
              goal.targetAmount,
              monthlySavings
            );

            return (
              <Card key={goal.id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-xl text-gray-900">{goal.name}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleOpenModal(goal.id)} variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(goal.id)} variant="danger" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold" style={{ color: goal.color }}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Current</p>
                      <p className="font-semibold">
                        {settings
                          ? formatCurrency(goal.currentAmount, settings.currency, settings.locale)
                          : goal.currentAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Target</p>
                      <p className="font-semibold">
                        {settings
                          ? formatCurrency(goal.targetAmount, settings.currency, settings.locale)
                          : goal.targetAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Remaining</p>
                      <p className="font-semibold">
                        {settings
                          ? formatCurrency(
                              goal.targetAmount - goal.currentAmount,
                              settings.currency,
                              settings.locale
                            )
                          : goal.targetAmount - goal.currentAmount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Est. Time</p>
                      <p className="font-semibold">
                        {monthsToGoal === Infinity
                          ? '∞'
                          : monthsToGoal === 0
                          ? 'Complete!'
                          : `${monthsToGoal} months`}
                      </p>
                    </div>
                  </div>

                  {goal.deadline && (
                    <div className="text-sm text-gray-600">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Goal' : 'Add Goal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Goal Name"
            value={name}
            onChange={setName}
            placeholder="e.g., Emergency Fund, Vacation, New Car"
            required
          />

          <Input
            label="Target Amount"
            type="number"
            value={targetAmount}
            onChange={setTargetAmount}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />

          <Input
            label="Current Amount"
            type="number"
            value={currentAmount}
            onChange={setCurrentAmount}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />

          <Input
            label="Description (optional)"
            value={description}
            onChange={setDescription}
            placeholder="Describe your goal"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>

          <Input
            label="Deadline (optional)"
            type="date"
            value={deadline}
            onChange={setDeadline}
          />

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
