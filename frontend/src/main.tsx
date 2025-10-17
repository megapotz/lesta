import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';
import { AuthProvider } from './providers/AuthProvider';
import { AppQueryProvider } from './providers/QueryProvider';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AppQueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppQueryProvider>
    </BrowserRouter>
  </StrictMode>,
);
