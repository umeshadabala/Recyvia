import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StorageManager, subscribeToStorage } from '../services/storageService';
import { RecoveryService } from '../services/recoveryService';
import { AppSyncEventService } from '../services/appsyncEventService';
import { RecoveryItem } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Factory, Boxes, CheckCircle2, ArrowRight, ShieldCheck, Download, RefreshCw, Layers, Sparkles, Scale, Clock } from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export const RecyclerDashboard: React.FC<PageProps> = ({ onNavigate, currentPath = '/' }) => {
  const { addToast, refreshTrigger } = useApp();
  const { user } = useAuth();
  
  // Determine active tab from route or local state
  const getInitialTab = (): 'all' | 'incoming' | 'processing' | 'recovered' => {
    if (currentPath === '/incoming-material') return 'incoming';
    if (currentPath === '/processing') return 'processing';
    if (currentPath === '/inventory') return 'recovered';
    return 'all';
  };

  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'processing' | 'recovered'>(getInitialTab);
  const [items, setItems] = useState<RecoveryItem[]>(() => RecoveryService.getAllRecoveryItems());
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Sync state reactively
  const reloadData = () => {
    setItems(RecoveryService.getAllRecoveryItems());
  };

  useEffect(() => {
    reloadData();
    const unsubStorage = subscribeToStorage(reloadData);
    const unsubAppSync = AppSyncEventService.subscribe('*', (ev) => {
      if (
        ev.type.includes('RECOVERY') ||
        ev.type.includes('RECYCLER') ||
        ev.type.includes('PROCESSING') ||
        ev.type === 'COLLECTION_COMPLETED'
      ) {
        reloadData();
      }
    });

    return () => {
      unsubStorage();
      unsubAppSync();
    };
  }, [refreshTrigger]);

  // Tab switching sync with route if changed
  useEffect(() => {
    if (currentPath === '/incoming-material') setActiveTab('incoming');
    else if (currentPath === '/processing') setActiveTab('processing');
    else if (currentPath === '/inventory') setActiveTab('recovered');
  }, [currentPath]);

  // Status transitions
  const handleReceive = async (item: RecoveryItem) => {
    setActionLoadingId(item.id);
    try {
      const recyclerId = user?.id || 'mrf-partner-01';
      const recyclerName = user?.name || 'Recyvia MRF Partner';
      await RecoveryService.receiveMaterial(item.id, recyclerId, recyclerName);
      addToast({
        title: 'Material Intake Confirmed',
        description: `Batch #${item.batchNumber} received into facility inventory.`,
        type: 'success',
      });
      reloadData();
    } catch (err: any) {
      addToast({
        title: 'Intake Failed',
        description: err?.message || 'Failed to receive batch',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartProcessing = async (item: RecoveryItem) => {
    setActionLoadingId(item.id);
    try {
      await RecoveryService.startProcessing(item.id);
      addToast({
        title: 'Processing Started',
        description: `Batch #${item.batchNumber} sent to sorting & recovery conveyor.`,
        type: 'info',
      });
      reloadData();
    } catch (err: any) {
      addToast({
        title: 'Operation Failed',
        description: err?.message || 'Failed to start processing',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteRecovery = async (item: RecoveryItem) => {
    setActionLoadingId(item.id);
    try {
      const updated = await RecoveryService.completeRecovery(item.id);
      addToast({
        title: '100% Recovery Completed',
        description: `Batch #${item.batchNumber} fully diverted! Audit Proof: ${updated.certificateOfRecoveryId}`,
        type: 'success',
      });
      reloadData();
    } catch (err: any) {
      addToast({
        title: 'Recovery Failed',
        description: err?.message || 'Failed to complete recovery',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics computation
  const availableItems = items.filter((i) => i.status === 'AVAILABLE');
  const processingItems = items.filter((i) => i.status === 'RECEIVED' || i.status === 'PROCESSING');
  const recoveredItems = items.filter((i) => i.status === 'RECOVERED');

  const totalAvailableKg = availableItems.reduce((acc, i) => acc + (i.verifiedQuantity || 0), 0);
  const totalProcessingKg = processingItems.reduce((acc, i) => acc + (i.verifiedQuantity || 0), 0);
  const totalRecoveredKg = recoveredItems.reduce((acc, i) => acc + (i.verifiedQuantity || 0), 0);

  // Filter items based on activeTab
  const displayedItems = items.filter((item) => {
    if (activeTab === 'incoming') return item.status === 'AVAILABLE';
    if (activeTab === 'processing') return item.status === 'RECEIVED' || item.status === 'PROCESSING';
    if (activeTab === 'recovered') return item.status === 'RECOVERED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Recycler Header */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 mb-2">
            <Factory className="w-3.5 h-3.5" /> Certified Material Recovery Facility (MRF)
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            {user?.name ? `${user.name} — MRF Command` : 'Material Recovery Facility'}
          </h1>
          <p className="text-xs text-slate-300">
            {user?.address || 'Industrial Recovery & Smelting Zone, Bengaluru'} • Direct Circular Economy Loop
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={reloadData}
          >
            Refresh Feed
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Boxes className="w-4 h-4" />}
            onClick={() => setActiveTab('incoming')}
          >
            Incoming Material ({availableItems.length})
          </Button>
        </div>
      </div>

      {/* Live Pipeline Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('incoming')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'incoming'
              ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-500/20'
              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Ready for Intake
            </span>
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
              {totalAvailableKg.toFixed(1)} <span className="text-sm font-semibold">kg</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">({availableItems.length} batches)</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Collected scrap awaiting MRF gate entry
          </p>
        </div>

        <div
          onClick={() => setActiveTab('processing')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'processing'
              ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              In Processing
            </span>
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
              {totalProcessingKg.toFixed(1)} <span className="text-sm font-semibold">kg</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">({processingItems.length} batches)</span>
          </div>
          <p className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            Undergoing sorting, smelting & extraction
          </p>
        </div>

        <div
          onClick={() => setActiveTab('recovered')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'recovered'
              ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              100% Diverted / Recovered
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalRecoveredKg.toFixed(1)} <span className="text-sm font-semibold">kg</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">({recoveredItems.length} batches)</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Certified closed-loop circular recovery
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          All Batches ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'incoming'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Incoming Material ({availableItems.length})
          {availableItems.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'processing'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Processing Pipeline ({processingItems.length})
        </button>
        <button
          onClick={() => setActiveTab('recovered')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'recovered'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Recovered Inventory ({recoveredItems.length})
        </button>
      </div>

      {/* Recycler Items Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-600" />
              <CardTitle>
                {activeTab === 'all' && 'All Material Recovery Records'}
                {activeTab === 'incoming' && 'Incoming Collections Awaiting Facility Gate Intake'}
                {activeTab === 'processing' && 'Material Processing & Sorting Batches'}
                {activeTab === 'recovered' && 'Fully Recovered & Diverted Secondary Raw Materials'}
              </CardTitle>
            </div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
              Showing {displayedItems.length} records
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {displayedItems.map((item) => {
            const isActionLoading = actionLoadingId === item.id;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                        {item.batchNumber}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                        (Ref: {item.pickupNumber})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Informal Collector: <strong className="text-slate-700 dark:text-zinc-300">{item.collectorName}</strong>
                      {item.recyclerName && (
                        <span> • Facility: <strong className="text-emerald-600">{item.recyclerName}</strong></span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'AVAILABLE' && (
                      <Badge variant="amber">AVAILABLE FOR INTAKE</Badge>
                    )}
                    {item.status === 'RECEIVED' && (
                      <Badge variant="blue">RECEIVED AT FACILITY</Badge>
                    )}
                    {item.status === 'PROCESSING' && (
                      <Badge variant="indigo">PROCESSING & SORTING</Badge>
                    )}
                    {item.status === 'RECOVERED' && (
                      <Badge variant="emerald">100% DIVERTER & RECOVERED</Badge>
                    )}
                  </div>
                </div>

                {/* Composition Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Weight: <strong className="text-slate-900 dark:text-zinc-100">{item.verifiedQuantity} kg</strong>
                    </span>
                    <span>
                      Settled Value: <strong className="text-emerald-600 font-mono">₹{item.finalAmount}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    {item.composition?.map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-medium text-[11px]"
                      >
                        {comp.category}: <strong>{comp.weightKg} kg</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timestamps & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-500 dark:text-zinc-400 font-mono text-[11px] space-y-0.5">
                    <div>Collected: {new Date(item.collectionDate).toLocaleString()}</div>
                    {item.receivedAt && (
                      <div className="text-blue-500">
                        Received: {new Date(item.receivedAt).toLocaleTimeString()}
                      </div>
                    )}
                    {item.recoveredAt && (
                      <div className="text-emerald-500">
                        Recovered: {new Date(item.recoveredAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'AVAILABLE' && (
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={isActionLoading}
                        onClick={() => handleReceive(item)}
                        leftIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Receive Material
                      </Button>
                    )}

                    {item.status === 'RECEIVED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={isActionLoading}
                        onClick={() => handleStartProcessing(item)}
                        leftIcon={<Layers className="w-4 h-4" />}
                      >
                        Start Processing
                      </Button>
                    )}

                    {item.status === 'PROCESSING' && (
                      <Button
                        size="sm"
                        variant="success"
                        isLoading={isActionLoading}
                        onClick={() => handleCompleteRecovery(item)}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Complete Recovery
                      </Button>
                    )}

                    {item.status === 'RECOVERED' && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {item.certificateOfRecoveryId}
                        </span>
                        <Button
                          size="xs"
                          variant="outline"
                          leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                          onClick={() => {
                            addToast({
                              title: 'Recovery Audit Proof Verified',
                              description: `Verification Hash: SHA256-${item.id.slice(0, 12)}`,
                              type: 'info',
                            });
                          }}
                        >
                          Audit Proof
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {displayedItems.length === 0 && (
            <div className="p-12 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl space-y-3 bg-white dark:bg-zinc-900">
              <Boxes className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">
                {activeTab === 'incoming' && 'No Incoming Batches at this Moment'}
                {activeTab === 'processing' && 'No Batches Currently in Processing'}
                {activeTab === 'recovered' && 'No Recovered Batches Yet'}
                {activeTab === 'all' && 'No Recovery Records Found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                {activeTab === 'incoming'
                  ? 'When informal collectors complete pickups from individuals or businesses, the scrap material will instantly show up here for facility intake.'
                  : 'Collections progress here through gate intake, sorting, smelting, and certified circular recovery.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
