import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { IncomeSources } from '@/pages/IncomeSources';
import { MonthlyIncome } from '@/pages/MonthlyIncome';
import { Analytics } from '@/pages/Analytics';
import { Goals } from '@/pages/Goals';
import { Settings } from '@/pages/Settings';
import { useAppStore } from '@/store/useAppStore';
import { initializeDatabase } from '@/db/services';

function App() {
  const loadData = useAppStore((state) => state.loadData);

  useEffect(() => {
    // Initialize database and load data
    const init = async () => {
      await initializeDatabase();
      await loadData();
    };
    init();
  }, [loadData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="income" element={<IncomeSources />} />
          <Route path="monthly" element={<MonthlyIncome />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="goals" element={<Goals />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
