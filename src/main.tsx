import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { SiteProvider } from './lib/site';
import './index.css';

const AdminApp = lazy(() => import('./admin/AdminApp'));
const isAdmin = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')!).render(
  isAdmin ? (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-gray-500">লোড হচ্ছে...</div>}>
      <AdminApp />
    </Suspense>
  ) : (
    <SiteProvider>
      <App />
    </SiteProvider>
  )
);
