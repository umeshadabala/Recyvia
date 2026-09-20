import React from 'react';
import { 
  Clock, 
  Truck, 
  Key, 
  CheckCircle2, 
  Factory, 
  Recycle,
  ShieldCheck
} from 'lucide-react';
import { PickupRequest } from '../../types';

export interface TraceabilityTimelineProps {
  pickup: PickupRequest;
  recyclerPartnerName?: string;
  className?: string;
}

interface TimelineStep {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: string;
  icon: React.ReactNode;
}

export const TraceabilityTimeline: React.FC<TraceabilityTimelineProps> = ({
  pickup,
  recyclerPartnerName = 'CPCB Registered Recycler Facility',
  className = '',
}) => {
  const getTimelineSteps = (): TimelineStep[] => {
    const isCompleted = pickup.status === 'completed';
    const isPaid = pickup.status === 'paid' || isCompleted;
    const isWeighed = pickup.status === 'weighed' || isPaid;
    const isOtp = pickup.status === 'otp_verified' || isWeighed;
    const isArrived = pickup.status === 'arrived' || isOtp;
    const isInTransit = pickup.status === 'in_transit' || isArrived;
    const isAccepted = pickup.status === 'accepted' || isInTransit;

    const totalWeight = pickup.wasteItems?.reduce((acc, item) => acc + (item.actualWeightKg || item.estimatedWeightKg), 0) || 0;

    const isRecyclerReceived =
      pickup.recoveryStatus === 'RECEIVED' ||
      pickup.recoveryStatus === 'PROCESSING' ||
      pickup.recoveryStatus === 'RECOVERED';
    const isRecovered = pickup.recoveryStatus === 'RECOVERED';
    const isProcessing = pickup.recoveryStatus === 'PROCESSING';

    return [
      {
        id: '1',
        title: 'Request Created',
        subtitle: `Generator: ${pickup.generatorName} (${pickup.generatorType})`,
        status: 'completed',
        timestamp: pickup.createdAt ? new Date(pickup.createdAt).toLocaleString('en-IN') : 'Initiated',
        icon: <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      },
      {
        id: '2',
        title: 'Collector Dispatch',
        subtitle: pickup.collectorName ? `Collector: ${pickup.collectorName}` : 'Matching nearby collector',
        status: isAccepted ? 'completed' : 'upcoming',
        timestamp: isAccepted ? 'Matched & On-the-way' : 'Pending dispatch',
        icon: <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      },
      {
        id: '3',
        title: 'Doorstep OTP & Weighing',
        subtitle: pickup.otp ? `6-Digit OTP: ${pickup.otp}` : 'Security Handshake',
        status: isWeighed ? 'completed' : isOtp ? 'current' : 'upcoming',
        timestamp: isWeighed ? 'Verified on digital scale' : 'Awaiting doorstep arrival',
        icon: <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      },
      {
        id: '4',
        title: 'Doorstep Settlement Completed',
        subtitle: `Mass: ${totalWeight} kg • Payout: ₹${pickup.totalFinalValue || pickup.totalEstimatedValue}`,
        status: isPaid ? 'completed' : 'upcoming',
        timestamp: isPaid ? 'Settled & Verified' : 'Pending payment settlement',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      },
      {
        id: '5',
        title: 'Recycler Intake',
        subtitle: `Facility: ${pickup.recyclerName || recyclerPartnerName}`,
        status: isRecyclerReceived ? 'completed' : isCompleted ? 'current' : 'upcoming',
        timestamp: isRecyclerReceived
          ? 'Received at facility'
          : isCompleted
          ? 'Available for MRF intake'
          : 'Pending collection',
        icon: <Factory className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      },
      {
        id: '6',
        title: 'Recovery & EPR Accounting',
        subtitle: isRecovered
          ? 'Material transformed into recycled pellets/fluff'
          : isProcessing
          ? 'Sorting and mechanical decontamination'
          : 'CPCB EPR credit compliance processing',
        status: isRecovered ? 'completed' : isProcessing ? 'current' : 'upcoming',
        timestamp: isRecovered && pickup.updatedAt
          ? new Date(pickup.updatedAt).toLocaleDateString('en-IN')
          : 'Scheduled processing',
        icon: <Recycle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      },
    ];
  };

  const steps = getTimelineSteps();

  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 ${className}`}>
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            End-to-End Traceability Chain
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Immutable 6-Stage Recycling Lifecycle Audit Trail
          </p>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Traceable Chain
        </span>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
        {steps.map((step) => {
          const isDone = step.status === 'completed';
          const isCur = step.status === 'current';

          return (
            <div key={step.id} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform duration-200 ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : isCur
                    ? 'bg-amber-500 border-amber-500 text-white animate-bounce'
                    : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{step.id}</span>
                )}
              </div>

              {/* Content Card */}
              <div className="ml-3 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {step.icon}
                    {step.title}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    {step.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
