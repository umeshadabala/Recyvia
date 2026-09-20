import React from 'react';
import { useApp } from '../context/AppContext';
import { PickupService } from '../services/pickupService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Table, TableColumn } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { Receipt, Download, ArrowUpRight } from 'lucide-react';
import { PickupRequest } from '../types';

interface PageProps {
  onNavigate: (path: string) => void;
}

export const TransactionsPage: React.FC<PageProps> = ({ onNavigate }) => {
  const pickups = PickupService.getAllPickups();

  const columns: TableColumn<PickupRequest>[] = [
    {
      header: 'Transaction ID / Request',
      cell: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 dark:text-zinc-100">{row.requestNumber}</span>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{new Date(row.createdAt).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      header: 'Generator',
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-zinc-200">{row.generatorName}</span>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{row.address.area}</p>
        </div>
      ),
    },
    {
      header: 'Collector Partner',
      cell: (row) => <span className="font-semibold text-slate-800 dark:text-zinc-200">{row.collectorName || 'Unassigned'}</span>,
    },
    {
      header: 'Payment Method',
      cell: (row) => (
        <Badge variant="slate" size="sm">
          {row.paymentMethod.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Amount Paid',
      cell: (row) => (
        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
          ₹{row.totalFinalValue || row.totalEstimatedValue}
        </span>
      ),
    },
    {
      header: 'Payment Status',
      cell: (row) => (
        <Badge variant={row.paymentStatus === 'completed' ? 'emerald' : 'amber'} size="sm">
          {row.paymentStatus.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-emerald-600" />
          Financial Transactions & Payout Log
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Settlement records for doorstep waste collections, UPI transactions, and collector earnings.
        </p>
      </div>

      <Table
        columns={columns}
        data={pickups}
        keyExtractor={(p) => p.id}
        emptyText="No payment transactions logged yet. Doorstep waste collections settled with informal collectors will appear here."
      />
    </div>
  );
};
