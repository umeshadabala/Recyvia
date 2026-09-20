import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLocalizedWasteItem, getLocalizedTrend } from '../i18n/rateTranslations';
import { PickupService } from '../services/pickupService';
import { WasteRateService } from '../services/wasteRateService';
import { EventService } from '../services/eventService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge, Badge } from '../components/common/Badge';
import {
  PlusCircle,
  Truck,
  Receipt,
  CheckCircle2,
  TreePine,
  Leaf,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

export const IndividualDashboard: React.FC<PageProps> = ({ onNavigate }) => {
  const { t, language } = useApp();
  const [, setRefreshTick] = useState(0);

  useEffect(() => {
    const unsubscribe = EventService.subscribe('*', () => {
      setRefreshTick((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const pickups = PickupService.getAllPickups();
  const activePickup = pickups.find((p) => !['completed', 'cancelled'].includes(p.status));
  const popularRates = WasteRateService.getPopularRates().slice(0, 4);

  const completedPickups = pickups.filter((p) => p.status === 'completed');
  const totalWasteSoldKg = completedPickups.reduce((sum, p) => sum + p.wasteItems.reduce((s, i) => s + (i.actualWeightKg || i.estimatedWeightKg), 0), 0);
  const totalPayout = completedPickups.reduce((sum, p) => sum + (p.totalFinalValue || p.totalEstimatedValue), 0);
  const completedCount = completedPickups.length;

  return (
    <div className="space-y-6">
      {/* Hero Banner / Quick Action Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-zinc-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Leaf className="w-3.5 h-3.5" />
            <span>Climate-Tech Recyclable Waste Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {t.heroSub}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              size="lg"
              leftIcon={<PlusCircle className="w-5 h-5" />}
              onClick={() => onNavigate('/request-pickup')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
            >
              {t.requestPickupNow}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('/transactions')}
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              {t.transactions}
            </Button>
          </div>
        </div>
      </div>

      {/* Active Pickup Tracker Card */}
      {activePickup && (
        <Card className="border-2 border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <CardTitle>{t.activePickupTracking}: {activePickup.requestNumber}</CardTitle>
            </div>
            <StatusBadge status={activePickup.status} />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-zinc-400 uppercase font-bold text-[10px]">{t.collector}</span>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {activePickup.collectorName || 'Assigning nearby collector...'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-zinc-400 uppercase font-bold text-[10px]">Security OTP Code</span>
                <p className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-base mt-0.5">
                  {activePickup.otp}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-zinc-400 uppercase font-bold text-[10px]">{t.preferredDate}</span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {activePickup.scheduledDate} ({activePickup.scheduledTimeSlot})
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => onNavigate('/my-pickups')}>
                {t.viewDetails} →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: t.totalWasteSold,
            value: `${totalWasteSoldKg} kg`,
            sub: t.landfillDiverted,
            icon: <Leaf className="w-5 h-5 text-emerald-600" />,
          },
          {
            title: t.totalPayoutReceived,
            value: `₹${totalPayout.toLocaleString()}`,
            sub: t.upiInstant,
            icon: <Zap className="w-5 h-5 text-amber-600" />,
          },
          {
            title: t.co2Offset,
            value: `${Math.round(totalWasteSoldKg * 2.5)} kg`,
            sub: 'Verified climate impact',
            icon: <TreePine className="w-5 h-5 text-teal-600" />,
          },
          {
            title: 'Completed Pickups',
            value: `${completedCount} Completed`,
            sub: 'Verified doorstep collections',
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 mt-1">
                  {stat.value}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{stat.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Market Scrap Rates Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <CardTitle>{t.popularScrapRates}</CardTitle>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onNavigate('/request-pickup')}>
            {t.viewDetails} →
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {popularRates.map((rate) => {
              const itemInfo = getLocalizedWasteItem(rate.id, rate.name, rate.description, language);
              const trendLabel = getLocalizedTrend(rate.marketTrend, language);

              return (
                <div
                  key={rate.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={rate.marketTrend === 'up' ? 'emerald' : 'slate'} size="sm">
                      {trendLabel}
                    </Badge>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{rate.ratePerKg}/{rate.unit}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                    {itemInfo.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                    {itemInfo.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
