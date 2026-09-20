import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { HelpCircle, Phone, Mail, ShieldCheck, Receipt, Recycle } from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

export const HelpPage: React.FC<PageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-emerald-600" />
          Help & Support Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          Frequently asked questions, doorstep weighing verification, and contact support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> How does doorstep weighing work?
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              When the verified collector arrives at your location, they inspect your materials and weigh them using calibrated digital scales. You verify the weights on the collector app before approving payment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" /> How does payment settlement work?
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Upon verifying weights with your 6-digit OTP, the collector initiates instant payment directly to your UPI ID or via cash, recorded with full receipt history in your account.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Customer Operations & Helpdesk</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <Phone className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold text-slate-900 dark:text-zinc-100">Toll Free Support Line</span>
              <p className="text-slate-600 dark:text-zinc-300 font-mono">1800-425-RECYCLE (+91 80 4123 9000)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <Mail className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold text-slate-900 dark:text-zinc-100">Email Operations</span>
              <p className="text-slate-600 dark:text-zinc-300 font-mono">support@recyvia.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
