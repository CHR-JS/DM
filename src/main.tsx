import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          error: {
            duration: 6000,
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
              border: '1px solid #FCA5A5'
            }
          },
          success: {
            duration: 4000,
            style: {
              background: '#DCFCE7',
              color: '#166534',
              border: '1px solid #86EFAC'
            }
          }
        }}
      />
    </ErrorBoundary>
  </StrictMode>
);