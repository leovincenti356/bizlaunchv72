import React, { useState } from 'react';
import { BusinessModule } from '../types';

interface ModuleFormProps {
  onSave: (module: Omit<BusinessModule, 'id' | 'userId'>) => void;
  onCancel: () => void;
}

const ModuleForm: React.FC<ModuleFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'running' | 'idea'>('running');
  const [income, setIncome] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  });

  const handleIncomeChange = (period: keyof typeof income, value: number) => {
    const updatedIncome = { ...income, [period]: value };

    if (period === 'daily') {
      updatedIncome.weekly = value * 7;
      updatedIncome.monthly = value * 30;
      updatedIncome.yearly = value * 365;
    } else if (period === 'weekly') {
      updatedIncome.daily = value / 7;
      updatedIncome.monthly = value * 4;
      updatedIncome.yearly = value * 52;
    } else if (period === 'monthly') {
      updatedIncome.daily = value / 30;
      updatedIncome.weekly = value / 4;
      updatedIncome.yearly = value * 12;
    } else if (period === 'yearly') {
      updatedIncome.daily = value / 365;
      updatedIncome.weekly = value / 52;
      updatedIncome.monthly = value / 12;
    }

    Object.keys(updatedIncome).forEach((key) => {
      updatedIncome[key as keyof typeof income] = Number(updatedIncome[key as keyof typeof income].toFixed(2));
    });

    setIncome(updatedIncome);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, type, income, tasks: [] });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Create Business Module</h2>
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600"
              rows={3}
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium">Type</label>
            <div className="mt-1 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="running"
                  checked={type === 'running'}
                  onChange={() => setType('running')}
                  className="form-radio text-blue-600 bg-gray-700 border-gray-600"
                />
                <span className="ml-2">Running Business</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="idea"
                  checked={type === 'idea'}
                  onChange={() => setType('idea')}
                  className="form-radio text-blue-600 bg-gray-700 border-gray-600"
                />
                <span className="ml-2">Business Idea</span>
              </label>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Income</h3>
            <div className="grid grid-cols-2 gap-4">
              {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                <div key={period}>
                  <label htmlFor={period} className="block text-sm font-medium">
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </label>
                  <input
                    type="number"
                    id={period}
                    value={income[period as keyof typeof income]}
                    onChange={(e) =>
                      handleIncomeChange(period as keyof typeof income, parseFloat(e.target.value) || 0)
                    }
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600"
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleForm;