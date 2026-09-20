import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PickupService } from '../services/pickupService';
import { EventService } from '../services/eventService';
import { PickupRequest } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge, Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { TraceabilityTimeline } from '../components/common/TraceabilityTimeline';
import { Truck, MapPin, Clock, Phone, ShieldCheck, Receipt, AlertCircle } from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

export const MyPickupsPage: React.FC<PageProps> = ({ onNavigate }) => {
  const { refreshTrigger } = useApp();
  const [, setRefreshTick] = useState(0);

  useEffect(() => {
    const unsubscribe = EventService.subscribe('*', () => {
      setRefreshTick((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const pickups = PickupService.getAllPickups();
  const [selectedPickup, setSelectedPickup] = useState<PickupRequest | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            My Pickup Requests Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Track real-time collector en-route progress, check security OTP, and review settlement history.
          </p>
        </div>

        <Button size="sm" onClick={() => onNavigate('/request-pickup')}>
          + New Pickup Request
        </Button>
      </div>

      <div className="space-y-4">
        {pickups.map((p) => (
          <Card key={p.id} hoverable onClick={() => setSelectedPickup(p)}>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                    {p.requestNumber}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  Scheduled: {p.scheduledDate} ({p.scheduledTimeSlot})
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 uppercase font-bold text-[10px]">Pickup Address</span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                    {p.address.street}, {p.address.area}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-zinc-400 uppercase font-bold text-[10px]">Assigned Collector</span>
                  <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                    {p.collectorName || 'Searching nearby collectors...'}
                  </p>
                </div>

                <div className="text-right sm:text-left">
                  <span className="text-slate-500 dark:text-zinc-400 uppercase font-bold text-[10px]">Settlement Amount</span>
                  <p className="font-extrabold text-base text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ₹{p.totalFinalValue || p.totalEstimatedValue}
                  </p>
                </div>
              </div>

              {p.status === 'completed' && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">MRF Recovery:</span>
                    {p.recoveryStatus === 'RECOVERED' ? (
                      <Badge variant="emerald">100% Diverted & Recovered ✓</Badge>
                    ) : p.recoveryStatus === 'PROCESSING' ? (
                      <Badge variant="indigo">Facility Processing</Badge>
                    ) : p.recoveryStatus === 'RECEIVED' ? (
                      <Badge variant="blue">Received at Facility</Badge>
                    ) : (
                      <Badge variant="amber">Available for MRF Intake</Badge>
                    )}
                  </div>

                  {p.recyclerName && (
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Facility: <strong className="text-emerald-600">{p.recyclerName}</strong>
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {pickups.length === 0 && (
          <div className="p-12 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl space-y-3 bg-white dark:bg-zinc-900">
            <Truck className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">No Pickup Requests Yet</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              You haven't requested any scrap waste pickups yet. Schedule a pickup to earn money with doorstep weighing and instant settlement.
            </p>
            <Button size="sm" onClick={() => onNavigate('/request-pickup')}>
              Request Your First Pickup
            </Button>
          </div>
        )}
      </div>

      {/* Pickup Details Modal */}
      {selectedPickup && (
        <Modal isOpen={!!selectedPickup} onClose={() => setSelectedPickup(null)} title={`Pickup Request ${selectedPickup.requestNumber}`}>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
              <StatusBadge status={selectedPickup.status} />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Security OTP</span>
                <p className="font-mono font-extrabold text-emerald-600 text-base">{selectedPickup.otp}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100">Waste Items Breakdown</h4>
              {selectedPickup.wasteItems.map((item, idx) => (
                <div key={idx} className="flex justify-between p-2 rounded border border-slate-200 dark:border-zinc-800">
                  <span>{item.categoryName} ({item.actualWeightKg || item.estimatedWeightKg} kg)</span>
                  <span className="font-bold text-emerald-600">₹{item.ratePerKg * (item.actualWeightKg || item.estimatedWeightKg)}</span>
                </div>
              ))}
            </div>

            {/* Traceability Timeline */}
            <TraceabilityTimeline pickup={selectedPickup} recyclerPartnerName={selectedPickup.recyclerName} />

            {selectedPickup.status === 'completed' && (
              <Button size="sm" variant="primary" leftIcon={<Receipt className="w-4 h-4" />} onClick={() => onNavigate('/transactions')} className="w-full">
                View Settlement History
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
