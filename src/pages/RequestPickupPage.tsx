import React, { useState, useEffect } from 'react';
import { PictorialCategorySelector } from '../components/pickup/PictorialCategorySelector';
import { RegulatoryDisclaimer } from '../components/common/RegulatoryDisclaimer';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getLocalizedWasteItem } from '../i18n/rateTranslations';
import { WasteRateService } from '../services/wasteRateService';
import { PickupService } from '../services/pickupService';
import { WasteCategory, PaymentMethod, PickupItemEstimate } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import {
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Leaf,
  Sparkles,
  ArrowRight,
  User,
  Phone,
  Building,
} from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

export const RequestPickupPage: React.FC<PageProps> = ({ onNavigate }) => {
  const { addToast, role, language } = useApp();
  const { user } = useAuth();
  const allRates = WasteRateService.getAllRates();

  // Selected items state
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(['rate-ewaste-laptops', 'rate-paper-office']);
  const [itemWeights, setItemWeights] = useState<Record<string, number>>({
    'rate-ewaste-laptops': 10,
    'rate-paper-office': 20,
  });

  // Dynamic Contact & Address state
  const [customerType, setCustomerType] = useState<'individual' | 'business'>(
    role === 'business' ? 'business' : 'individual'
  );
  const [orgGst, setOrgGst] = useState('');
  const [customerName, setCustomerName] = useState(
    user?.name || (role === 'business' ? 'Commercial Facility' : '')
  );
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address || '');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduledSlot, setScheduledSlot] = useState('10:00 AM - 12:00 PM');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if auth user state becomes available asynchronously
  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!contactPhone && user.phone) setContactPhone(user.phone);
      if (!street && user.address) setStreet(user.address);
    }
  }, [user]);

  // Toggle item selection
  const toggleItem = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((item: string) => item !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
      if (!itemWeights[id]) {
        setItemWeights((prev: Record<string, number>) => ({ ...prev, [id]: 5 }));
      }
    }
  };

  const handleWeightChange = (id: string, weight: number) => {
    setItemWeights((prev: Record<string, number>) => ({ ...prev, [id]: Math.max(1, weight) }));
  };

  // Calculations
  const selectedRateItems = allRates.filter((r) => selectedItemIds.includes(r.id));
  const totalEstimatedValue = selectedRateItems.reduce(
    (acc, rate) => acc + rate.ratePerKg * (itemWeights[rate.id] || 5),
    0
  );

  const handleSubmitRequest = () => {
    if (selectedItemIds.length === 0) {
      addToast({ title: 'Select Waste Category', description: 'Please choose at least 1 recyclable item.', type: 'warning' });
      return;
    }

    if (!customerName.trim()) {
      addToast({ title: 'Name Required', description: 'Please enter your name or facility name.', type: 'warning' });
      return;
    }

    if (!contactPhone.trim()) {
      addToast({ title: 'Phone Required', description: 'Please enter a contact phone number.', type: 'warning' });
      return;
    }

    if (!street.trim() || !area.trim()) {
      addToast({ title: 'Address Required', description: 'Please specify your street address and neighborhood area.', type: 'warning' });
      return;
    }

    setIsSubmitting(true);

    const wasteItems: PickupItemEstimate[] = selectedRateItems.map((rate) => ({
      categoryId: rate.id,
      categoryName: rate.name,
      categoryKey: rate.category,
      estimatedWeightKg: itemWeights[rate.id] || 5,
      ratePerKg: rate.ratePerKg,
      totalCalculatedValue: rate.ratePerKg * (itemWeights[rate.id] || 5),
    }));

    const combinedNotes = [
      customerType === 'business' && orgGst ? `GST/Org ID: ${orgGst}` : '',
      notes.trim(),
    ]
      .filter(Boolean)
      .join(' | ');

    const newPickup = PickupService.createPickupRequest({
      generatorId: user?.id || `gen-${Date.now().toString().slice(-6)}`,
      generatorName: customerName.trim(),
      generatorType: customerType,
      phone: contactPhone.trim(),
      address: {
        street: street.trim(),
        area: area.trim(),
        city: city.trim() || 'Bengaluru',
        state: 'Karnataka',
        pincode: pincode.trim() || '560001',
        lat: 12.9716,
        lng: 77.5946,
      },
      wasteItems,
      photos: [],
      notes: combinedNotes,
      scheduledDate,
      scheduledTimeSlot: scheduledSlot,
      paymentMethod,
    });

    setIsSubmitting(false);

    addToast({
      title: 'Pickup Request Dispatched!',
      description: `Pickup #${newPickup.requestNumber} created. Searching for nearby collectors...`,
      type: 'success',
    });

    onNavigate('/my-pickups');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-emerald-600" />
            Request Waste Pickup
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Select recyclable waste categories, estimate weights, choose pickup slot, and receive doorstep payout.
          </p>
        </div>
      </div>

      <RegulatoryDisclaimer variant="banner" />

      {/* Customer Type Toggle: Individual vs Commercial / Business */}
      <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center gap-1.5">
        <button
          type="button"
          onClick={() => setCustomerType('individual')}
          className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            customerType === 'individual'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Individual / Household Scrap</span>
        </button>

        <button
          type="button"
          onClick={() => setCustomerType('business')}
          className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            customerType === 'business'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-zinc-700'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Commercial / Business Bulk Waste</span>
        </button>
      </div>

      <PictorialCategorySelector
        selectedCategoryId={selectedItemIds[0] || 'rate-ewaste-laptops'}
        onSelectCategory={(catId) => {
          if (!selectedItemIds.includes(catId)) {
            setSelectedItemIds([catId, ...selectedItemIds]);
            if (!itemWeights[catId]) {
              setItemWeights((prev: Record<string, number>) => ({ ...prev, [catId]: 5 }));
            }
          }
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Waste Categories */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select Specific Items & Sub-categories</CardTitle>
              <Badge variant="emerald">{selectedItemIds.length} Selected</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {allRates.map((rate) => {
                  const isSelected = selectedItemIds.includes(rate.id);
                  const itemInfo = getLocalizedWasteItem(rate.id, rate.name, rate.description, language);
                  return (
                    <div
                      key={rate.id}
                      onClick={() => toggleItem(rate.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                          {itemInfo.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 capitalize">
                          {rate.category.replace('_', ' ')}
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{rate.ratePerKg}/{rate.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimated Weight Adjusters */}
              {selectedRateItems.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-zinc-400">
                    Estimate Quantities / Weights (kg)
                  </h4>
                  {selectedRateItems.map((rate) => {
                    const itemInfo = getLocalizedWasteItem(rate.id, rate.name, rate.description, language);
                    return (
                      <div
                        key={rate.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/50 text-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{itemInfo.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleWeightChange(rate.id, (itemWeights[rate.id] || 5) - 2)}
                            className="p-1 rounded bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300"
                          >
                            <MinusCircle className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                          </button>
                          <span className="w-12 text-center font-bold text-slate-900 dark:text-zinc-100">
                            {itemWeights[rate.id] || 5} kg
                          </span>
                          <button
                            onClick={() => handleWeightChange(rate.id, (itemWeights[rate.id] || 5) + 2)}
                            className="p-1 rounded bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300"
                          >
                            <PlusCircle className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Contact & Pickup Location */}
          <Card>
            <CardHeader>
              <CardTitle>2. Contact & Pickup Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={customerType === 'business' ? 'Company / Facility Name' : 'Full Name'}
                  placeholder={customerType === 'business' ? 'e.g. Acme EcoTech Solutions Ltd' : 'e.g. John Doe'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400 dark:text-zinc-500" />}
                  required
                />
                <Input
                  label="Contact Phone Number"
                  placeholder="e.g. +91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4 text-slate-400 dark:text-zinc-500" />}
                  required
                />
              </div>

              {customerType === 'business' && (
                <Input
                  label="Organization GSTIN / Tax ID (Optional for ESG Reporting)"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={orgGst}
                  onChange={(e) => setOrgGst(e.target.value)}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Street / Flat / Premises"
                  placeholder="e.g. 402, Green Valley Apartments"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
                <Input
                  label="Area / Neighborhood"
                  placeholder="e.g. Indiranagar / Koramangala"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />
                <Input
                  label="City"
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="Pincode"
                  placeholder="e.g. 560038"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Preferred Pickup Date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                />
                <Select
                  label="Time Slot Window"
                  value={scheduledSlot}
                  onChange={(e) => setScheduledSlot(e.target.value)}
                  options={[
                    { value: '08:00 AM - 10:00 AM', label: '08:00 AM - 10:00 AM' },
                    { value: '10:00 AM - 12:00 PM', label: '10:00 AM - 12:00 PM' },
                    { value: '02:00 PM - 04:00 PM', label: '02:00 PM - 04:00 PM' },
                    { value: '04:00 PM - 06:00 PM', label: '04:00 PM - 06:00 PM' },
                  ]}
                  leftIcon={<Clock className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Special Instructions / Gate Pass Notes"
                placeholder="e.g. Digital scale preferred, call on arrival"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Summary & Submit Panel */}
        <div className="space-y-6">
          <Card className="border-2 border-emerald-500/60 bg-white dark:bg-zinc-900 shadow-xl">
            <CardHeader className="border-b border-slate-100 dark:border-zinc-800">
              <CardTitle>Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2.5 text-xs">
                {selectedRateItems.map((rate) => {
                  const w = itemWeights[rate.id] || 5;
                  const val = rate.ratePerKg * w;
                  const itemInfo = getLocalizedWasteItem(rate.id, rate.name, rate.description, language);
                  return (
                    <div key={rate.id} className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span className="font-medium">
                        {itemInfo.name} ({w} kg)
                      </span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">₹{val}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">Estimated Payout</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">₹{totalEstimatedValue}</h3>
                </div>
                <Badge variant="emerald">Instant Payout</Badge>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] uppercase font-bold text-slate-600 dark:text-zinc-400">Payout Settlement Mode</label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  options={[
                    { value: 'upi', label: 'UPI / GPay / PhonePe (Instant)' },
                    { value: 'bank_transfer', label: 'Bank NEFT / IMPS Transfer' },
                    { value: 'cash', label: 'Cash on Delivery' },
                    { value: 'wallet', label: 'Recyvia Wallet' },
                  ]}
                />
              </div>

              <Button
                size="lg"
                variant="primary"
                isLoading={isSubmitting}
                onClick={handleSubmitRequest}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md"
              >
                Confirm Pickup Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
