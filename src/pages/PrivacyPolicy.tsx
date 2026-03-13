import LegalLayout from '@/components/layout/LegalLayout';
import { Shield, Database, UserCheck, Truck, Cog, Share2, Lock, History, Trash2, Globe, RefreshCcw, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How ShelfMerch safeguards your store data and customer privacy with industry-leading standards."
      lastUpdated="March 09, 2026"
    >
      <section id="introduction" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-6 mb-8 group">
          <div className="p-4 rounded-[1.5rem] bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tighter">1. Introduction</h2>
        </div>
        <div className="bg-slate-50 dark:bg-white/[0.03] p-6 rounded-2xl border border-slate-200 dark:border-white/5">
          <p className="text-base leading-relaxed m-0 text-slate-600 dark:text-slate-400">
            At <strong>ShelfMerch</strong>, your data privacy isn't just a policy—it's a foundation.
            We respect the trust you place in us when integrating our fulfillment platform into your Shopify store.
            This document details our rigorous commitment to handling your information with maximum transparency and security.
          </p>
        </div>
      </section>

      <section id="shopify-api" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">2. Shopify APIs</h2>
        </div>
        <p className="mb-6 text-slate-600 dark:text-slate-400">To provide seamless fulfillment, ShelfMerch requests secure access to the following Shopify data categories:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[
            { title: 'Store Identity', desc: 'General store identification and locale settings.', icon: Globe },
            { title: 'Product Catalog', desc: 'Listings, variants, and inventory metadata.', icon: Cog },
            { title: 'Order History', desc: 'Quantities, SKUs, and transaction totals.', icon: History },
            { title: 'Fulfillment Info', desc: 'Customer addresses required for shipping.', icon: Truck }
          ].map((item, i) => (
            <div key={i} className="flex gap-5 p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white mb-1 tracking-tight">{item.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 m-0">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="merchant-direct" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">3. Merchant Data</h2>
        </div>
        <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 space-y-4 text-slate-600 dark:text-slate-400">
          <p className="m-0 italic">Information we collect directly from you to maintain your master account:</p>
          <div className="flex flex-wrap gap-3">
            {['Merchant Full Name', 'Verified Email Address', 'Account Configuration', 'Localization Prefs'].map((tag, i) => (
              <span key={i} className="px-4 py-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-black uppercase tracking-widest">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="customer-processing" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">4. Customer Data</h2>
        </div>
        <div className="relative p-8 rounded-3xl bg-slate-900 text-white overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
          <h4 className="text-orange-500 uppercase tracking-[0.3em] text-[10px] font-black mb-4">Limited Scope Processing</h4>
          <p className="text-lg font-bold leading-relaxed mb-0 text-slate-200">
            We process customer PII <span className="text-white underline decoration-orange-500 underline-offset-4">strictly for logistics</span>.
            Names and addresses are utilized only to generate labels and complete deliveries. We never store this data longer than necessary or use it for marketing.
          </p>
        </div>
      </section>

      <section id="usage" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-6 mb-8 group">
          <div className="p-4 rounded-[1.5rem] bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform duration-500">
            <Cog className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tighter">5. Usage Scope</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            'Bilateral product synchronization',
            'Smart order processing & routing',
            'Full-cycle fulfillment & delivery',
            'Infrastructure security monitoring',
            'Proactive merchant support'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 group">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 transition-transform group-hover:rotate-[360deg] duration-500" />
              </div>
              <span className="font-bold text-sm text-slate-600 dark:text-slate-400">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="sharing" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">6. Data Sharing</h2>
        </div>
        <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-slate-600 dark:text-slate-400">
          <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">Zero Selling Policy</p>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-0">
            ShelfMerch does not sell your data. Sharing is confined to high-compliance partners:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { t: 'Platform', d: 'Shopify infrastructure' },
              { t: 'Secure Hosting', d: 'AWS/Google Cloud' },
              { t: 'Legal', d: 'By official court order only' }
            ].map((box, i) => (
              <div key={i} className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-amber-500/10">
                <p className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest text-[10px] mb-2">{box.t}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white m-0 leading-tight">{box.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">7. Storage & Security</h2>
        </div>
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 flex flex-col md:flex-row items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-base font-bold leading-relaxed m-0 text-slate-700 dark:text-slate-300">
              Your data is fortified by AES-256 encryption at rest and TLS 1.3 in transit. Our servers are audited
              regularly to maintain the highest defense against unauthorized access.
            </p>
          </div>
          <div className="flex-shrink-0 w-32 h-32 rounded-full border-4 border-teal-500/20 flex items-center justify-center animate-spin-slow">
            <div className="w-20 h-20 rounded-full border-4 border-t-teal-500 border-l-transparent border-r-transparent border-b-transparent" />
          </div>
        </div>
      </section>

      <section id="uninstall" className="scroll-mt-32 mb-12">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">9. Uninstall & Deletion</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Upon uninstallation, your store's "Right to be Forgotten" is prioritized.
        </p>
        <div className="flex items-center gap-4 mt-8 p-6 rounded-3xl bg-red-500/5 border border-red-500/10">
          <RefreshCcw className="w-6 h-6 text-red-500 animate-spin-slow" />
          <p className="font-bold text-red-700 dark:text-red-400 m-0 leading-tight italic">
            Our uninstall webhook automatically initiates a comprehensive data scrubbing protocol from all active databases.
          </p>
        </div>
      </section>

      <section id="contact" className="scroll-mt-32">
        <div className="flex items-center gap-4 mb-6 group">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">12. Support</h2>
        </div>
        <div className="group relative overflow-hidden p-1 p-px bg-gradient-to-br from-primary via-blue-400 to-teal-500 rounded-[2.5rem]">
          <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-3xl relative z-10">
            <p className="text-lg font-bold mb-4 tracking-tight">Need a deep dive into our privacy stack?</p>
            <a
              href="mailto:shelfmerch@gmail.com"
              className="inline-flex items-center gap-3 text-xl md:text-2xl font-bold text-primary hover:gap-4 transition-all duration-500 tracking-tight"
            >
              shelfmerch@gmail.com
              <ArrowRight className="w-6 h-6 md:w-8 h-8" />
            </a>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
