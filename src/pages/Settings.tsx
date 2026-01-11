import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAppStore } from '@/store/useAppStore';

export const Settings: React.FC = () => {
  const { settings, savings, updateSettings, updateSavings } = useAppStore();

  const [currency, setCurrency] = useState('USD');
  const [locale, setLocale] = useState('en-US');
  const [currentSavings, setCurrentSavings] = useState('0');
  const [alreadySaved, setAlreadySaved] = useState('0');

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currency);
      setLocale(settings.locale);
    }
    if (savings) {
      setCurrentSavings(savings.currentSavings.toString());
      setAlreadySaved(savings.alreadySaved.toString());
    }
  }, [settings, savings]);

  const handleSaveSettings = async () => {
    await updateSettings({
      currency,
      locale,
    });
  };

  const handleSaveSavings = async () => {
    await updateSavings({
      currentSavings: parseFloat(currentSavings),
      alreadySaved: parseFloat(alreadySaved),
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your preferences</p>
      </div>

      {/* Savings Data */}
      <Card title="Savings Data">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Savings"
              type="number"
              value={currentSavings}
              onChange={setCurrentSavings}
              step="0.01"
              min="0"
            />

            <Input
              label="Already Saved"
              type="number"
              value={alreadySaved}
              onChange={setAlreadySaved}
              step="0.01"
              min="0"
            />
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p>
              <strong>Current Savings:</strong> Money you have now
            </p>
            <p>
              <strong>Already Saved:</strong> Money you've saved before using this app
            </p>
            <p className="mt-2">
              Both amounts are included in total savings calculations.
            </p>
          </div>

          <Button onClick={handleSaveSavings} variant="primary" className="w-full">
            Save Savings Data
          </Button>
        </div>
      </Card>

      {/* App Settings */}
      <Card title="App Preferences">
        <div className="space-y-4">
          <Select
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: 'USD', label: 'US Dollar (USD)' },
              { value: 'EUR', label: 'Euro (EUR)' },
              { value: 'GBP', label: 'British Pound (GBP)' },
              { value: 'RUB', label: 'Russian Ruble (RUB)' },
              { value: 'JPY', label: 'Japanese Yen (JPY)' },
              { value: 'CNY', label: 'Chinese Yuan (CNY)' },
            ]}
          />

          <Select
            label="Locale"
            value={locale}
            onChange={setLocale}
            options={[
              { value: 'en-US', label: 'English (US)' },
              { value: 'en-GB', label: 'English (UK)' },
              { value: 'ru-RU', label: 'Russian' },
              { value: 'de-DE', label: 'German' },
              { value: 'fr-FR', label: 'French' },
              { value: 'es-ES', label: 'Spanish' },
            ]}
          />

          <Button onClick={handleSaveSettings} variant="primary">
            Save App Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};
