import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { PickupService } from '../services/pickupService';
import { CollectorService, CollectorDutyConfig } from '../services/collectorService';
import { EventService } from '../services/eventService';
import { PickupRequest, PickupStatus, WasteCategory, PaymentMethod } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Table, TableColumn } from '../components/common/Table';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Scale,
  Zap,
  DollarSign,
  Search,
  Filter,
  User,
  Settings,
  Boxes,
  Receipt,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

export const CollectorDashboard: React.FC<PageProps> = ({ onNavigate }) => {
  const { addToast, refreshTrigger } = useApp();
  const { user } = useAuth();

  // Sub-tabs: 'available' | 'active' | 'history' | 'earnings' | 'config' | 'profile'
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history' | 'earnings' | 'config' | 'profile'>('available');

  // Duty configuration & profile
  const [dutyConfig, setDutyConfig] = useState<CollectorDutyConfig>(() => CollectorService.getDutyConfig());
  const profile = CollectorService.getProfile(user);
  const collectorId = user?.id || 'col-default';

  // State for active job execution
  const [otpInput, setOtpInput] = useState('');
  const [verifiedWeights, setVerifiedWeights] = useState<Record<string, number>>({});
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMethod>('upi');
  const [viewJobModal, setViewJobModal] = useState<PickupRequest | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'cancelled' | 'pending'>('all');
  const [historySearch, setHistorySearch] = useState('');

  const [, setRefreshTick] = useState(0);

  // Subscribe to real-time domain events to update view automatically
  useEffect(() => {
    const unsubscribe = EventService.subscribe('*', () => {
      setRefreshTick((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const availableJobs = PickupService.getAvailableJobsForCollector();
  const activeJob = PickupService.getCollectorActiveJob(collectorId);
  const allPickups = PickupService.getAllPickups();
  const earningsData = CollectorService.getEarningsBreakdown(collectorId);

  // Calculate Today's Collector Metrics for authenticated collector
  const todayCompleted = allPickups.filter(
    (p) => p.status === 'completed' && p.collectorId === collectorId && new Date(p.updatedAt).toDateString() === new Date().toDateString()
  );
  const todayWeightKg = todayCompleted.reduce((acc, p) => {
    const w = p.wasteItems.reduce((sum, item) => sum + (item.actualWeightKg || item.estimatedWeightKg), 0);
    return acc + w;
  }, 0);

  const handleToggleOnline = (online: boolean) => {
    const updated = CollectorService.updateDutyConfig({ isOnline: online });
    setDutyConfig(updated);
    addToast({
      title: online ? 'You are now ONLINE' : 'You are now OFFLINE',
      description: online ? 'Broadcasting location for nearby pickup jobs.' : 'Job dispatching paused.',
      type: online ? 'success' : 'info',
    });
  };

  const handleAcceptJob = (job: PickupRequest) => {
    try {
      PickupService.acceptJob(
        job.id,
        collectorId,
        user?.name || 'Collector',
        user?.phone || '',
        profile.vehicleType || 'EV Auto Loader (KA-01-RE-2026)'
      );
      addToast({
        title: 'Job Accepted!',
        description: `Pickup #${job.requestNumber} added to active dispatch.`,
        type: 'success',
      });
      setActiveTab('active');
      setViewJobModal(null);
    } catch (e: any) {
      addToast({ title: 'Error', description: e.message, type: 'error' });
    }
  };

  const handleAdvanceState = (newStatus: PickupStatus) => {
    if (!activeJob) return;
    PickupService.updateStatus(activeJob.id, newStatus);
    addToast({
      title: 'Pickup State Updated',
      description: `Progressed lifecycle to ${newStatus.toUpperCase()}`,
      type: 'info',
    });
  };

  const handleVerifyOtp = () => {
    if (!activeJob) return;
    const cleanOtp = otpInput.trim();
    if (!cleanOtp) {
      addToast({ title: 'Enter OTP', description: 'Please enter the 6-digit OTP provided by customer.', type: 'warning' });
      return;
    }
    const res = PickupService.verifyOtp(activeJob.id, cleanOtp);
    if (res.success) {
      addToast({ title: 'OTP Verified ✓', description: res.message, type: 'success' });
      setOtpInput('');
    } else {
      addToast({ title: 'Invalid OTP', description: res.message, type: 'error' });
    }
  };

  const handleSaveVerifiedWeights = () => {
    if (!activeJob) return;
    const items = activeJob.wasteItems.map((item) => ({
      categoryId: item.categoryId,
      actualWeightKg: verifiedWeights[item.categoryId] ?? (item.actualWeightKg || item.estimatedWeightKg),
    }));
    PickupService.submitWeighing(activeJob.id, items);
    addToast({
      title: 'Verified Weights Recorded ✓',
      description: 'Calculated final value and doorstep receipt.',
      type: 'success',
    });
  };

  const handleCompletePaymentAndJob = async () => {
    if (!activeJob) return;
    await PickupService.settlePaymentAndComplete(activeJob.id, selectedPaymentMode);
    addToast({
      title: 'Collection Successful! 🎉',
      description: `Payment settled via ${selectedPaymentMode.toUpperCase()}. Pickup completed successfully.`,
      type: 'success',
    });
    setActiveTab('earnings');
  };

  const filteredHistory = allPickups.filter((p) => {
    const matchFilter = historyFilter === 'all' || p.status === historyFilter;
    const matchSearch =
      p.requestNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
      p.generatorName.toLowerCase().includes(historySearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const categoriesList: { key: WasteCategory; label: string }[] = [
    { key: 'e_waste', label: 'E-Waste & Electronics' },
    { key: 'metals', label: 'Scrap Metals' },
    { key: 'paper', label: 'Paper & Office Waste' },
    { key: 'cardboard', label: 'Corrugated Cardboard' },
    { key: 'plastics', label: 'Plastics & Polymers' },
    { key: 'glass', label: 'Glass Bottles' },
    { key: 'batteries', label: 'Batteries & Storage' },
    { key: 'appliances', label: 'Appliances' },
    { key: 'cables', label: 'Wiring & Cables' },
    { key: 'motors', label: 'Motors & Electrics' },
    { key: 'other', label: 'Other Recyclables' },
  ];

  return (
    <div className="space-y-6">
      {/* Mobility Top Status & Duty Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0 shadow-md shadow-emerald-600/20">
            {profile.name ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'CL'}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              {profile.name}
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">({profile.vehicleType})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Rating: <strong className="text-emerald-600">{profile.rating > 0 ? `★ ${profile.rating}` : 'No ratings yet'}</strong> | Total Completed:{' '}
              <strong className="text-slate-800 dark:text-zinc-200">{profile.completedPickups}</strong>
            </p>
          </div>
        </div>

        {/* Duty Status Switch */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-200 dark:border-zinc-700">
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Duty Radar:</span>
          <button
            onClick={() => handleToggleOnline(!dutyConfig.isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all shadow-sm ${
              dutyConfig.isOnline
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-slate-300 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${dutyConfig.isOnline ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
            {dutyConfig.isOnline ? 'ONLINE' : 'OFFLINE'}
          </button>
        </div>
      </div>

      {/* Operational Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Available Jobs</span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 mt-0.5">{availableJobs.length}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold">In your radar zone</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Completed Today</span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 mt-0.5">{todayCompleted.length}</h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Pickups finished</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Today's Earnings</span>
          <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{earningsData.today}</h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Net payout</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Total Mass Collected</span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 mt-0.5">{todayWeightKg} kg</h3>
          <p className="text-[11px] text-teal-600 font-semibold">100% Recyclable</p>
        </div>
      </div>

      {/* Collector App Sub-Navigation Bar */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-zinc-800 pb-1">
        {[
          { id: 'available' as const, label: `Available Jobs (${availableJobs.length})`, icon: <Truck className="w-4 h-4" /> },
          { id: 'active' as const, label: activeJob ? `Active Job (${activeJob.requestNumber})` : 'Active Job (None)', icon: <Boxes className="w-4 h-4" /> },
          { id: 'history' as const, label: 'My Jobs History', icon: <Calendar className="w-4 h-4" /> },
          { id: 'earnings' as const, label: 'Earnings & Payouts', icon: <Receipt className="w-4 h-4" /> },
          { id: 'config' as const, label: 'Duty & Streams Config', icon: <Settings className="w-4 h-4" /> },
          { id: 'profile' as const, label: 'Collector Profile', icon: <User className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: AVAILABLE JOBS FEED */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {!dutyConfig.isOnline && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
              <span>You are currently OFFLINE. Turn duty radar online to accept jobs.</span>
              <Button size="xs" variant="primary" onClick={() => handleToggleOnline(true)}>
                Go Online
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableJobs.map((job) => (
              <Card key={job.id} hoverable className="border-l-4 border-l-emerald-500">
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                        {job.requestNumber}
                      </span>
                      <Badge variant="amber" size="sm">
                        {job.generatorType === 'business' ? 'Commercial' : 'Individual'}
                      </Badge>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ~{job.distanceKm} km away
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">
                      Customer: {job.generatorName} ({job.address.area})
                    </p>
                    <p className="text-slate-500 dark:text-zinc-400">
                      Materials: {job.wasteItems.map((i) => i.categoryName).join(', ')}
                    </p>
                    <p className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                      Est. Quantity: {job.wasteItems.reduce((acc, i) => acc + i.estimatedWeightKg, 0)} kg | Payout: ₹{job.totalEstimatedValue}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Slot: {job.scheduledTimeSlot}
                    </span>

                    <div className="flex gap-2">
                      <Button size="xs" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setViewJobModal(job)}>
                        Details
                      </Button>
                      <Button
                        size="xs"
                        variant="primary"
                        disabled={!dutyConfig.isOnline}
                        onClick={() => handleAcceptJob(job)}
                      >
                        Accept Pickup
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {availableJobs.length === 0 && (
              <div className="col-span-full p-8 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl space-y-2">
                <Truck className="w-8 h-8 text-slate-400 dark:text-zinc-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No Pickup Requests Nearby</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  There are no pending waste pickup jobs in your area at this moment. Stay online to receive requests in real time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE JOB EXECUTION & LIFECYCLE */}
      {activeTab === 'active' && (
        <div>
          {activeJob ? (
            <Card className="border-2 border-emerald-500 bg-white dark:bg-zinc-900">
              <CardHeader className="border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <CardTitle>ACTIVE PICKUP DISPATCH: {activeJob.requestNumber}</CardTitle>
                </div>
                <StatusBadge status={activeJob.status} />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Lifecycle Stepper */}
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-zinc-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Pickup Lifecycle Progress
                  </h4>
                  <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 text-[11px] font-bold">
                    {[
                      { status: 'accepted', label: '1. ACCEPTED' },
                      { status: 'in_transit', label: '2. EN ROUTE' },
                      { status: 'arrived', label: '3. ARRIVED' },
                      { status: 'otp_verified', label: '4. OTP VERIFIED' },
                      { status: 'weighed', label: '5. WEIGHED' },
                      { status: 'completed', label: '6. COMPLETED' },
                    ].map((step, idx) => (
                      <span
                        key={step.status}
                        className={`px-2.5 py-1 rounded font-mono whitespace-nowrap ${
                          activeJob.status === step.status
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                        }`}
                      >
                        {step.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase">Customer</span>
                    <p className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">{activeJob.generatorName}</p>
                    <p className="text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> {activeJob.phone}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase">Location Address</span>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      {activeJob.address.street}, {activeJob.address.area}, {activeJob.address.city} - {activeJob.address.pincode}
                    </p>
                  </div>
                </div>

                {/* STATE STEP 1 & 2: TRIP CONTROLS */}
                {['accepted', 'in_transit'].includes(activeJob.status) && (
                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-blue-900 dark:text-blue-300">
                      Navigation & Arrival Actions
                    </h4>
                    <div className="flex gap-3">
                      {activeJob.status === 'accepted' && (
                        <Button
                          variant="primary"
                          leftIcon={<Navigation className="w-4 h-4" />}
                          onClick={() => handleAdvanceState('in_transit')}
                        >
                          [ START TRIP ] En Route
                        </Button>
                      )}
                      {activeJob.status === 'in_transit' && (
                        <Button
                          variant="primary"
                          leftIcon={<MapPin className="w-4 h-4" />}
                          onClick={() => handleAdvanceState('arrived')}
                        >
                          [ I HAVE ARRIVED AT LOCATION ]
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* STATE STEP 3: OTP VERIFICATION */}
                {['arrived', 'accepted', 'in_transit'].includes(activeJob.status) && activeJob.status !== 'otp_verified' && activeJob.status !== 'weighed' && (
                  <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-600" />
                      <h4 className="text-xs font-extrabold uppercase text-amber-900 dark:text-amber-300">
                        Verify Customer Security OTP
                      </h4>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Ask customer for their 6-digit verification code (Customer Code: <strong>{activeJob.otp}</strong>)
                    </p>
                    <div className="flex items-center gap-3 max-w-sm">
                      <Input
                        placeholder="Enter 6-digit OTP"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        maxLength={6}
                      />
                      <Button variant="primary" onClick={handleVerifyOtp}>
                        [ VERIFY OTP ]
                      </Button>
                    </div>
                  </div>
                )}

                {/* STATE STEP 4: DOORSTEP WEIGHT VERIFICATION */}
                {(activeJob.status === 'otp_verified' || activeJob.status === 'weighed') && (
                  <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-xs font-extrabold uppercase text-emerald-900 dark:text-emerald-300">
                          Doorstep Weight Verification Interface
                        </h4>
                      </div>
                      <Badge variant="emerald">OTP Verified ✓</Badge>
                    </div>

                    <div className="space-y-3">
                      {activeJob.wasteItems.map((item) => {
                        const estKg = item.estimatedWeightKg;
                        const actualKg = verifiedWeights[item.categoryId] ?? (item.actualWeightKg || estKg);
                        const finalVal = actualKg * item.ratePerKg;

                        return (
                          <div
                            key={item.categoryId}
                            className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs"
                          >
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-900 dark:text-zinc-100">{item.categoryName}</span>
                              <span className="text-emerald-600 dark:text-emerald-400">Rate: ₹{item.ratePerKg}/kg</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 items-center text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">Estimated</span>
                                <p className="font-semibold text-slate-700 dark:text-zinc-300">{estKg} kg</p>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">Verified Weight</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="w-full px-2.5 py-1 rounded border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold text-slate-900 dark:text-zinc-100 text-xs"
                                  value={actualKg}
                                  onChange={(e) =>
                                    setVerifiedWeights((prev) => ({
                                      ...prev,
                                      [item.categoryId]: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                />
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">Final Item Value</span>
                                <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">₹{finalVal}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button size="sm" variant="outline" onClick={handleSaveVerifiedWeights}>
                        [ SAVE VERIFIED WEIGHTS ]
                      </Button>
                    </div>
                  </div>
                )}

                {/* STATE STEP 5: PAYMENT SELECTION & COMPLETION */}
                {activeJob.status === 'weighed' && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Final Settled Amount</span>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
                          ₹{activeJob.totalFinalValue || activeJob.totalEstimatedValue}
                        </h3>
                      </div>
                      <Badge variant="emerald">Weights Verified ✓</Badge>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-600 dark:text-zinc-400">Select Payout Mode</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSelectedPaymentMode('upi')}
                          className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                            selectedPaymentMode === 'upi'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 shadow-xs'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                          }`}
                        >
                          UPI / GPay / PhonePe Instant
                        </button>
                        <button
                          onClick={() => setSelectedPaymentMode('cash')}
                          className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                            selectedPaymentMode === 'cash'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 shadow-xs'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                          }`}
                        >
                          Cash on Hand
                        </button>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      variant="primary"
                      onClick={handleCompletePaymentAndJob}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white shadow-md"
                    >
                      [ CONFIRM PAYMENT & COMPLETE COLLECTION ]
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-slate-500 dark:text-zinc-400 space-y-3">
                <Boxes className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto" />
                <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100">No Active Pickup Currently</h3>
                <p className="text-xs max-w-sm mx-auto">
                  Browse the Available Jobs radar feed and click "Accept Pickup" to begin a collection trip.
                </p>
                <Button size="sm" onClick={() => setActiveTab('available')}>
                  View Available Jobs Radar
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: MY JOBS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search history by request # or customer name..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'completed', 'cancelled', 'pending'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                    historyFilter === f
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredHistory.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-zinc-100">{job.requestNumber}</span>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                      Customer: {job.generatorName} ({job.address.area}) | {new Date(job.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase">Payout</span>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{job.totalFinalValue || job.totalEstimatedValue}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EARNINGS & PAYOUTS */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">Today's Earnings</span>
                <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{earningsData.today}</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Credited via Instant UPI</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">This Week</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">₹{earningsData.thisWeek}</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">14 Pickups completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase">This Month</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">₹{earningsData.thisMonth}</h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Cumulative payout</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transaction-Level Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                {earningsData.transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">{tx.pickupNumber}</span>
                      <p className="text-slate-500 dark:text-zinc-400 text-[11px]">{tx.category} • {tx.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">+₹{tx.amount}</span>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{tx.paymentMode}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: DUTY & STREAMS CONFIG */}
      {activeTab === 'config' && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Accepted Recyclable Waste Streams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-zinc-400">
              Select which waste streams your vehicle ({profile.vehicleType}) is equipped to transport.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoriesList.map((cat) => {
                const isChecked = dutyConfig.acceptedCategories.includes(cat.key);
                return (
                  <label
                    key={cat.key}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-zinc-800'
                    }`}
                  >
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{cat.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const updatedCats = e.target.checked
                          ? [...dutyConfig.acceptedCategories, cat.key]
                          : dutyConfig.acceptedCategories.filter((c) => c !== cat.key);
                        const updated = CollectorService.updateDutyConfig({ acceptedCategories: updatedCats });
                        setDutyConfig(updated);
                      }}
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: PROFILE */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Collector Mobility Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Full Name</span>
                <p className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">{profile.name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Phone Number</span>
                <p className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">{profile.phone}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Vehicle Type & Reg No.</span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">
                  {profile.vehicleType} ({profile.vehicleNumber})
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Primary Service Area</span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200">{user?.address || 'Active Coverage Radius (10 km)'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JOB DETAILS MODAL */}
      {viewJobModal && (
        <Modal isOpen={!!viewJobModal} onClose={() => setViewJobModal(null)} title={`Pickup Job ${viewJobModal.requestNumber}`}>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Generator</span>
                <p className="font-bold text-slate-900 dark:text-zinc-100">{viewJobModal.generatorName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Distance</span>
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{viewJobModal.distanceKm} km</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Location Address</span>
              <p className="font-semibold text-slate-800 dark:text-zinc-200">{viewJobModal.address.street}, {viewJobModal.address.city}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400">Materials Summary</span>
              {viewJobModal.wasteItems.map((i, idx) => (
                <p key={idx} className="text-slate-600 dark:text-zinc-400">• {i.categoryName}: ~{i.estimatedWeightKg} kg (₹{i.ratePerKg}/kg)</p>
              ))}
            </div>

            <Button size="sm" variant="primary" onClick={() => handleAcceptJob(viewJobModal)} className="w-full">
              Accept Pickup Job
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
