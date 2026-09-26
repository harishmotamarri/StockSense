/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

// Layout & Auth
import { AppShell } from './components/layout/AppShell';
import { LoginView } from './components/auth/LoginView';
import { SignupView } from './components/auth/SignupView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { VerifyOtpView } from './components/auth/VerifyOtpView';
import { ResetPasswordView } from './components/auth/ResetPasswordView';

// Dashboard & Core Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductList } from './components/products/ProductList';
import { ProductDetail } from './components/products/ProductDetail';
import { ProductForm } from './components/products/ProductForm';
import { ProductEditView } from './components/products/ProductEditView';

import { ReceiptList } from './components/receipts/ReceiptList';
import { ReceiptDetail } from './components/receipts/ReceiptDetail';
import { ReceiptForm } from './components/receipts/ReceiptForm';

import { DeliveryList } from './components/deliveries/DeliveryList';
import { DeliveryDetail } from './components/deliveries/DeliveryDetail';
import { DeliveryForm } from './components/deliveries/DeliveryForm';

import { TransferList } from './components/transfers/TransferList';
import { TransferDetail } from './components/transfers/TransferDetail';
import { TransferForm } from './components/transfers/TransferForm';

import { AdjustmentList } from './components/adjustments/AdjustmentList';
import { AdjustmentDetail } from './components/adjustments/AdjustmentDetail';
import { AdjustmentForm } from './components/adjustments/AdjustmentForm';

import { MovementList } from './components/movements/MovementList';
import { WarehouseList } from './components/warehouses/WarehouseList';
import { WarehouseDetail } from './components/warehouses/WarehouseDetail';
import { WarehouseForm } from './components/warehouses/WarehouseForm';

import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';

import { Loader2, Package } from 'lucide-react';

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentRoute, params, navigate } = useNavigation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl mb-4 animate-pulse">
          <Package className="w-7 h-7 stroke-[2.2]" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-200 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          Initializing StockSense ERP...
        </p>
      </div>
    );
  }

  // Handle Unauthenticated Routing
  if (!isAuthenticated) {
    if (currentRoute === 'signup') return <SignupView />;
    if (currentRoute === 'forgot-password') return <ForgotPasswordView />;
    if (currentRoute === 'verify-otp') return <VerifyOtpView />;
    if (currentRoute === 'reset-password') return <ResetPasswordView />;
    return <LoginView />;
  }

  // If user is authenticated and navigating to login/signup/reset, route them to dashboard
  if (
    currentRoute === 'login' ||
    currentRoute === 'signup' ||
    currentRoute === 'forgot-password' ||
    currentRoute === 'verify-otp' ||
    currentRoute === 'reset-password'
  ) {
    return (
      <AppShell>
        <DashboardView />
      </AppShell>
    );
  }

  // Render Authenticated View
  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardView />;

      // Products
      case 'products':
        return <ProductList />;
      case 'product-new':
        return <ProductForm />;
      case 'product-edit':
        return <ProductEditView productId={params.id} />;
      case 'product-detail':
        return <ProductDetail productId={params.id} />;

      // Receipts
      case 'receipts':
        return <ReceiptList />;
      case 'receipt-new':
        return <ReceiptForm />;
      case 'receipt-detail':
        return <ReceiptDetail receiptId={params.id} />;

      // Deliveries
      case 'deliveries':
        return <DeliveryList />;
      case 'delivery-new':
        return <DeliveryForm />;
      case 'delivery-detail':
        return <DeliveryDetail deliveryId={params.id} />;

      // Transfers
      case 'transfers':
        return <TransferList />;
      case 'transfer-new':
        return <TransferForm />;
      case 'transfer-detail':
        return <TransferDetail transferId={params.id} />;

      // Adjustments
      case 'adjustments':
        return <AdjustmentList />;
      case 'adjustment-new':
        return <AdjustmentForm />;
      case 'adjustment-detail':
        return <AdjustmentDetail adjustmentId={params.id} />;

      // Ledger / Movements
      case 'movements':
        return <MovementList />;

      // Warehouses
      case 'warehouses':
        return <WarehouseList />;
      case 'warehouse-new':
        return <WarehouseForm />;
      case 'warehouse-detail':
        return <WarehouseDetail warehouseId={params.id} />;

      // Settings & Profile
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;

      default:
        return <DashboardView />;
    }
  };

  return <AppShell>{renderCurrentView()}</AppShell>;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NavigationProvider>
          <AppRouter />
        </NavigationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
