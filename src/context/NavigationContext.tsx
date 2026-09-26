import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppRoute =
  | 'dashboard'
  | 'products'
  | 'product-detail'
  | 'product-new'
  | 'product-edit'
  | 'receipts'
  | 'receipt-detail'
  | 'receipt-new'
  | 'deliveries'
  | 'delivery-detail'
  | 'delivery-new'
  | 'transfers'
  | 'transfer-detail'
  | 'transfer-new'
  | 'adjustments'
  | 'adjustment-detail'
  | 'adjustment-new'
  | 'movements'
  | 'warehouses'
  | 'warehouse-detail'
  | 'warehouse-new'
  | 'settings'
  | 'profile'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'verify-otp'
  | 'reset-password';

interface RouteMatch {
  route: AppRoute;
  params: Record<string, string>;
  path: string;
}

interface NavigationContextType {
  currentRoute: AppRoute;
  currentPath: string;
  params: Record<string, string>;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function parsePath(path: string): RouteMatch {
  const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';

  if (cleanPath === '/' || cleanPath === '/dashboard') {
    return { route: 'dashboard', params: {}, path: '/dashboard' };
  }

  // Auth routes
  if (cleanPath === '/login') return { route: 'login', params: {}, path: cleanPath };
  if (cleanPath === '/signup') return { route: 'signup', params: {}, path: cleanPath };
  if (cleanPath === '/forgot-password') return { route: 'forgot-password', params: {}, path: cleanPath };
  if (cleanPath === '/verify-otp') return { route: 'verify-otp', params: {}, path: cleanPath };
  if (cleanPath === '/reset-password') return { route: 'reset-password', params: {}, path: cleanPath };

  // Settings & Profile
  if (cleanPath === '/settings') return { route: 'settings', params: {}, path: cleanPath };
  if (cleanPath === '/profile') return { route: 'profile', params: {}, path: cleanPath };
  if (cleanPath === '/movements') return { route: 'movements', params: {}, path: cleanPath };

  // Products
  if (cleanPath === '/products') return { route: 'products', params: {}, path: cleanPath };
  if (cleanPath === '/products/new') return { route: 'product-new', params: {}, path: cleanPath };
  const prodEditMatch = cleanPath.match(/^\/products\/([^/]+)\/edit$/);
  if (prodEditMatch) return { route: 'product-edit', params: { id: prodEditMatch[1] }, path: cleanPath };
  const prodMatch = cleanPath.match(/^\/products\/([^/]+)$/);
  if (prodMatch) return { route: 'product-detail', params: { id: prodMatch[1] }, path: cleanPath };

  // Receipts
  if (cleanPath === '/receipts') return { route: 'receipts', params: {}, path: cleanPath };
  if (cleanPath === '/receipts/new') return { route: 'receipt-new', params: {}, path: cleanPath };
  const recMatch = cleanPath.match(/^\/receipts\/([^/]+)$/);
  if (recMatch) return { route: 'receipt-detail', params: { id: recMatch[1] }, path: cleanPath };

  // Deliveries
  if (cleanPath === '/deliveries') return { route: 'deliveries', params: {}, path: cleanPath };
  if (cleanPath === '/deliveries/new') return { route: 'delivery-new', params: {}, path: cleanPath };
  const delMatch = cleanPath.match(/^\/deliveries\/([^/]+)$/);
  if (delMatch) return { route: 'delivery-detail', params: { id: delMatch[1] }, path: cleanPath };

  // Transfers
  if (cleanPath === '/transfers') return { route: 'transfers', params: {}, path: cleanPath };
  if (cleanPath === '/transfers/new') return { route: 'transfer-new', params: {}, path: cleanPath };
  const trfMatch = cleanPath.match(/^\/transfers\/([^/]+)$/);
  if (trfMatch) return { route: 'transfer-detail', params: { id: trfMatch[1] }, path: cleanPath };

  // Adjustments
  if (cleanPath === '/adjustments') return { route: 'adjustments', params: {}, path: cleanPath };
  if (cleanPath === '/adjustments/new') return { route: 'adjustment-new', params: {}, path: cleanPath };
  const adjMatch = cleanPath.match(/^\/adjustments\/([^/]+)$/);
  if (adjMatch) return { route: 'adjustment-detail', params: { id: adjMatch[1] }, path: cleanPath };

  // Warehouses
  if (cleanPath === '/warehouses') return { route: 'warehouses', params: {}, path: cleanPath };
  if (cleanPath === '/warehouses/new') return { route: 'warehouse-new', params: {}, path: cleanPath };
  const whMatch = cleanPath.match(/^\/warehouses\/([^/]+)$/);
  if (whMatch) return { route: 'warehouse-detail', params: { id: whMatch[1] }, path: cleanPath };

  return { route: 'dashboard', params: {}, path: '/dashboard' };
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [match, setMatch] = useState<RouteMatch>(() => {
    if (typeof window !== 'undefined') {
      return parsePath(window.location.pathname || '/dashboard');
    }
    return { route: 'dashboard', params: {}, path: '/dashboard' };
  });

  useEffect(() => {
    const handlePopState = () => {
      setMatch(parsePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((toPath: string, options?: { replace?: boolean }) => {
    const target = toPath.startsWith('/') ? toPath : `/${toPath}`;
    if (options?.replace) {
      window.history.replaceState({}, '', target);
    } else {
      window.history.pushState({}, '', target);
    }
    setMatch(parsePath(target));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentRoute: match.route,
        currentPath: match.path,
        params: match.params,
        navigate,
        goBack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
