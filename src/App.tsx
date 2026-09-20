import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { IndividualDashboard } from './pages/IndividualDashboard';
import { CollectorDashboard } from './pages/CollectorDashboard';
import { RecyclerDashboard } from './pages/RecyclerDashboard';
import { RequestPickupPage } from './pages/RequestPickupPage';
import { MyPickupsPage } from './pages/MyPickupsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { HelpPage } from './pages/HelpPage';

export const App: React.FC = () => {
  const { role, t } = useApp();
  const [currentPath, setCurrentPath] = useState('/');

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute Page Title based on path and active role
  const getPageTitle = () => {
    switch (currentPath) {
      case '/request-pickup':
        return 'Request Waste Pickup';
      case '/my-pickups':
      case '/my-jobs':
        return 'Pickup Requests & Jobs';
      case '/impact':
      case '/analytics':
        return 'ESG Environmental Impact';
      case '/transactions':
      case '/earnings':
        return 'Payouts & Financial Settlements';
      case '/help':
        return 'Help & Operational Protocol';
      default:
        switch (role) {
          case 'collector':
            return 'Informal Collector Command';
          case 'recycler':
            return 'Recycling & Recovery Facility Command';
          case 'business':
          case 'individual':
          default:
            return 'Customer Waste Recovery Command';
        }
    }
  };

  // Render active page component
  const renderPage = () => {
    switch (currentPath) {
      case '/request-pickup':
        return <RequestPickupPage onNavigate={handleNavigate} />;
      case '/my-pickups':
      case '/my-jobs':
      case '/messages':
        return <MyPickupsPage onNavigate={handleNavigate} />;
      case '/transactions':
      case '/earnings':
        return <TransactionsPage onNavigate={handleNavigate} />;
      case '/help':
        return <HelpPage onNavigate={handleNavigate} />;
      case '/available-jobs':
        return <CollectorDashboard onNavigate={handleNavigate} />;
      case '/incoming-material':
      case '/processing':
      case '/inventory':
        return <RecyclerDashboard onNavigate={handleNavigate} currentPath={currentPath} />;
      case '/':
      default:
        switch (role) {
          case 'collector':
            return <CollectorDashboard onNavigate={handleNavigate} />;
          case 'recycler':
            return <RecyclerDashboard onNavigate={handleNavigate} currentPath={currentPath} />;
          case 'business':
          case 'individual':
          default:
            return <IndividualDashboard onNavigate={handleNavigate} />;
        }
    }
  };

  return (
    <Layout currentPath={currentPath} onNavigate={handleNavigate} pageTitle={getPageTitle()}>
      {renderPage()}
    </Layout>
  );
};
