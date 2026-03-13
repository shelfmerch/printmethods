import LegalLayout from '@/components/layout/LegalLayout';
import { Gavel, CheckCircle, Package, UserCircle, AlertTriangle, CloudOff, XCircle, Landmark, MessageSquare, ArrowRight, ShieldCheck, ScrollText } from 'lucide-react';

const TermsOfConditions = () => {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The foundational legal framework defining our partnership and service standards."
      lastUpdated="March 09, 2026"
    >
      <section id="introduction" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-6 mb-8 group">
          <div className="p-4 rounded-[1.5rem] bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
            <Gavel className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black m-0 tracking-tighter">1. Introduction</h2>
        </div>
        <div className="bg-slate-50 dark:bg-white/[0.03] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5">
          <p className="text-lg leading-relaxed m-0 text-slate-700 dark:text-slate-300 font-medium">
            Welcome to <strong>ShelfMerch</strong>. By using our print-on-demand and order fulfillment services, you enter into a binding agreement designed to ensure a secure, transparent, and fair ecommerce ecosystem for all stakeholders.
          </p>
        </div>
      </section>

      <section id="acceptance" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">2. Acceptance</h2>
        </div>
        <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
          <p className="text-lg font-bold leading-relaxed mb-0 text-slate-200 relative z-10">
            Installation of the ShelfMerch app signifies your full <span className="text-white underline decoration-blue-500 underline-offset-4">acceptance of these terms</span>. If you do not agree with any provision herein, you must immediately cease usage and uninstall the application.
          </p>
        </div>
      </section>

      <section id="description" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">3. Service Scope</h2>
        </div>
        <p className="mb-8 text-slate-500 dark:text-slate-400 text-sm">ShelfMerch empowers Shopify merchants with a full-stack fulfillment infrastructure:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { t: 'Product Creation', d: 'High-fidelity POD design tools.', icon: ScrollText },
            { t: 'Shopify Sync', d: 'Real-time catalog synchronization.', icon: CloudOff },
            { t: 'Logistics', d: 'Automated order routing and labels.', icon: Package },
            { t: 'Fulfillment', d: 'Global print and ship network.', icon: CheckCircle }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 flex flex-col items-center text-center group hover:border-primary/30 transition-all">
              <item.icon className="w-8 h-8 text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors mb-4" />
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight text-sm">{item.t}</h4>
              <p className="text-[10px] text-slate-500 m-0 font-medium">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="responsibilities" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <UserCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">4. Duties</h2>
        </div>
        <div className="space-y-4">
          {[
            'Merchants retain full ownership of uploaded designs.',
            'Responsibility for ensuring IP rights compliance.',
            'Maintaining accurate product descriptions and pricing.',
            'Primary customer support for end-consumers.'
          ].map((duty, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform" />
              <span className="font-bold text-sm text-slate-600 dark:text-slate-400">{duty}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="liability" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">5. Liability</h2>
        </div>
        <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10">
          <p className="text-base font-bold leading-relaxed m-0 text-red-800 dark:text-red-400 italic text-center">
            ShelfMerch shall not be liable for any indirect, incidental, or consequential damages including revenue loss or fulfillment delays outside our immediate control.
          </p>
        </div>
      </section>

      <section id="termination" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-zinc-500/10 text-zinc-500">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">7. Termination</h2>
        </div>
        <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 text-center">
          <p className="text-lg font-bold text-slate-500 dark:text-slate-400 m-0">
            Service integration terminates automatically and immediately upon the uninstallation of the ShelfMerch App from your Shopify store.
          </p>
        </div>
      </section>

      <section id="governing-law" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">8. Governing Law</h2>
        </div>
        <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-base font-bold text-emerald-800 dark:text-emerald-400 m-0 leading-relaxed">
            These terms are governed by the laws of India. Any disputes arising from the use of the platform shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.
          </p>
        </div>
      </section>

      <section id="contact" className="scroll-mt-32">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">Support</h2>
        </div>
        <div className="group relative overflow-hidden p-1 p-px bg-gradient-to-br from-primary via-blue-400 to-indigo-500 rounded-3xl">
          <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[1.45rem] relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="text-lg font-bold mb-1 tracking-tight">Legal Inquiries</p>
              <p className="text-slate-500 m-0 text-sm font-medium">ShelfMerch Governance Council</p>
            </div>
            <a
              href="mailto:shelfmerch@gmail.com"
              className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-all flex items-center gap-3 active:scale-95"
            >
              Contact Legal
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
};

export default TermsOfConditions;
