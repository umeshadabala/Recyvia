import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AuthLandingGuard } from './components/auth/AuthLandingGuard';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <AuthProvider>
        <AuthLandingGuard>
          <App />
        </AuthLandingGuard>
      </AuthProvider>
    </AppProvider>
  </React.StrictMode>
);
