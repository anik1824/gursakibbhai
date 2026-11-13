import { createContext, useContext } from 'react';
import { AdminUser } from '../types';

export interface AdminContextValue {
  me: AdminUser;
  can: (perm: string) => boolean;
  go: (page: string, query?: Record<string, string>) => void;
  query: URLSearchParams;
  storeName: string;
  refreshKey: number;
}

export const AdminContext = createContext<AdminContextValue>(null as unknown as AdminContextValue);
export const useAdmin = () => useContext(AdminContext);
