import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { i18nReady } from './i18n';
import '../public/css/style.css';
import App from './App';

i18nReady.finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </React.StrictMode>
  );
});
