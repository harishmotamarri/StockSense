import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../../lib/api';
import {
  DashboardKPIs,
  InventoryTrendPoint,
  InventoryCategoryStat,
  Product,
  PendingOperation,
  StockMovement,
} from '../../types';
import { KPICards } from './KPICards';
import { InventoryChart } from './InventoryChart';
import { StockByCategoryChart } from './StockByCategoryChart';
import { LowStockTable } from './LowStockTable';
import { PendingOpsTable } from './PendingOpsTable';
import { RecentMovementsTable } from './RecentMovementsTable';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { MovementDetailModal } from '../movements/MovementDetailModal';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import {
  RefreshCw,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  TrendingUp,
  PieChart,
  AlertTriangle,
  Clock,
  History,
} from 'lucide-react';

export function DashboardView() {
  const { navigate } = useNavigation();
  const { role } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalProductsInStock: 0,
    lowStockItemsCount: 0,
    outOfStockItemsCount: 0,
    pendingReceiptsCount: 0,
    pendingDeliveriesCount: 0,
    internalTransfersCount: 0,
  });
  const [trend, setTrend] = useState<InventoryTrendPoint[]>([]);
  const [categoryStats, setCategoryStats] = useState<InventoryCategoryStat[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);

  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardData();
      setKpis(data.kpis);
      setTrend(data.trend);
      setCategoryStats(data.categoryStats);
      setLowStockItems(data.lowStockItems);
      setPendingOperations(data.pendingOperations);
      setRecentMovements(data.recentMovements);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Inventory Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock ledger, inbound shipments, and outbound delivery queue.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          {role === 'INVENTORY_MANAGER' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/products/new')}
              leftIcon={<Plus className="w-3.5 h-3.5 text-indigo-600" />}
            >
              Add Product
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/receipts/new')}
            leftIcon={<ArrowDownToLine className="w-3.5 h-3.5 text-sky-600" />}
          >
            New Receipt
          </Button>

          <Button
            size="sm"
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate('/deliveries/new')}
            leftIcon={<ArrowUpFromLine className="w-3.5 h-3.5" />}
          >
            New Delivery
          </Button>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <KPICards kpis={kpis} isLoading={isLoading} />

      {/* Row 1: Charts (Inventory Trend + Category Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Inventory Overview (7-Day Trend)
              </span>
            }
            description="Overall inventory stock units vs inbound receipts"
          />
          <CardContent className="pt-2">
            <InventoryChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                Stock by Category
              </span>
            }
            description="Breakdown of physical units across categories"
          />
          <CardContent className="pt-2">
            <StockByCategoryChart categories={categoryStats} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Low Stock Items & Pending Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Low Stock Items
              </span>
            }
            description="Products requiring replenishment or purchase order creation"
            action={
              <button
                onClick={() => navigate('/products?status=Low+Stock')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                View all ({lowStockItems.length})
              </button>
            }
          />
          <CardContent className="p-0">
            <LowStockTable products={lowStockItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                Pending Operations
              </span>
            }
            description="Inbound receipts, picking queues, and scheduled transfers"
            action={
              <button
                onClick={() => navigate('/receipts')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                View receipts
              </button>
            }
          />
          <CardContent className="p-0">
            <PendingOpsTable operations={pendingOperations} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Stock Movements Ledger */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700" />
              Recent Stock Movements
            </span>
          }
          description="Auditable stock ledger reflecting all receipts, dispatches, transfers, and physical adjustments"
          action={
            <button
              onClick={() => navigate('/movements')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Full Ledger →
            </button>
          }
        />
        <CardContent className="p-0">
          <RecentMovementsTable
            movements={recentMovements}
            onSelectMovement={(m) => setSelectedMovement(m)}
          />
        </CardContent>
      </Card>

      {/* Detail Modal for Clicked Movement */}
      {selectedMovement && (
        <MovementDetailModal
          movement={selectedMovement}
          isOpen={!!selectedMovement}
          onClose={() => setSelectedMovement(null)}
        />
      )}
    </div>
  );
}
