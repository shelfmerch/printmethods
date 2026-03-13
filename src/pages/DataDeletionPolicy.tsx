import LegalLayout from '@/components/layout/LegalLayout';
import { Trash2, ShieldCheck, Database, History, Mail, RotateCw, Fingerprint, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

const DataDeletionPolicy = () => {
    return (
        <LegalLayout
            title="Data Deletion Policy"
            subtitle="Complete transparency on our data scrubbing protocols and your right to be forgotten."
            lastUpdated="March 09, 2026"
        >
            <section id="introduction" className="scroll-mt-32 mb-12">
                <div className="flex items-center gap-6 mb-8 group">
                    <div className="p-4 rounded-[1.5rem] bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black m-0 tracking-tighter">Introduction</h2>
                </div>
                <div className="bg-slate-50 dark:bg-white/[0.03] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5">
                    <p className="text-lg leading-relaxed m-0 text-slate-700 dark:text-slate-300 font-medium">
                        At <strong>ShelfMerch</strong>, we believe you should have total control over your digital footprint.
                        In strict alignment with Shopify’s privacy standards and global regulations, we provide clear,
                        automated pathways for the permanent removal of your personal and store-related data.
                    </p>
                </div>
            </section>

            <section id="how-to-request" className="scroll-mt-32 mb-12">
                <div className="flex items-center gap-4 mb-6 group">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">Request Deletion</h2>
                </div>
                <p className="mb-8 text-slate-500 dark:text-slate-400">To initiate a manual data scrubbing request, please reach out to our privacy team:</p>

                <div className="relative group overflow-hidden p-6 rounded-3xl bg-primary text-white shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <p className="text-white/60 uppercase tracking-[0.3em] text-[10px] font-black mb-1">Direct Channel</p>
                            <a href="mailto:shelfmerch@gmail.com" className="text-2xl md:text-2xl font-bold hover:underline tracking-tight">shelfmerch@gmail.com</a>
                        </div>
                        <ArrowRight className="w-8 h-8 text-white/20 hidden md:block" />
                    </div>
                </div>

                <div className="flex items-start gap-5 mt-10 p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10">
                    <Fingerprint className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-black text-amber-900 dark:text-amber-400 mb-1 tracking-tight">Identity Verification Required</h4>
                        <p className="text-sm m-0 text-amber-800/80 dark:text-amber-500/80 leading-relaxed">
                            To prevent unauthorized data removal, we may require verification via your registered merchant email before processing any manual deletion request.
                        </p>
                    </div>
                </div>
            </section>

            <section id="data-collected" className="scroll-mt-32 mb-12">
                <div className="flex items-center gap-4 mb-6 group">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                        <Database className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">Data Inventory</h2>
                </div>
                <p className="mb-6 text-slate-500 dark:text-slate-400 text-sm">The following categories of data are eligible for permanent removal from our active clusters:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[
                        { title: 'Shopify Store Info', desc: 'Metadata, synchronization settings, and store identifiers.' },
                        { title: 'Merchant Contacts', desc: 'Email addresses and primary account holder details.' },
                        { title: 'Product Inventory', desc: 'Designs, configurations, and variant data shards.' },
                        { title: 'Service History', desc: 'Non-billing related order and fulfillment logs.' }
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 group hover:border-primary/20 transition-all">
                            <h4 className="font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-500 m-0 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="after-deletion" className="scroll-mt-32 mb-12">
                <div className="flex items-center gap-4 mb-6 group">
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                        <History className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">Post-Deletion</h2>
                </div>
                <div className="p-8 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10">
                    <p className="text-lg font-bold leading-relaxed m-0 text-slate-600 dark:text-slate-400 italic">
                        "Once purged, your identifiers are detached from our backend. Any remaining system shards are fully anonymized, making reverse-association with your store mathematically impossible."
                    </p>
                </div>
            </section>

            <section id="uninstall-removal" className="scroll-mt-32 mb-12">
                <div className="flex items-center gap-4 mb-6 group">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                        <RotateCw className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">Uninstall Removal</h2>
                </div>
                <div className="p-8 rounded-3xl bg-slate-900 text-white overflow-hidden relative shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Automated Trigger</span>
                    </div>
                    <h4 className="text-2xl font-black mb-6 tracking-tight">Instant Deletion Protocol</h4>
                    <p className="text-slate-400 leading-relaxed mb-0 font-medium">
                        If you uninstall the <strong>ShelfMerch</strong> app, our systems automatically receive a secure webhook from Shopify. This triggers an immediate or near-immediate data purge of all store-associated records, ensuring we respect your exit without delay.
                    </p>
                </div>
            </section>

            <section id="timeframe" className="scroll-mt-32 mb-12">
                <div className="flex items-center gap-4 mb-6 group">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">Timeframe</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-lg leading-relaxed text-slate-500 dark:text-slate-400 mb-0 font-medium">
                            We operate a <strong>zero-lag</strong> deletion policy. Verified requests are flagged for processing instantly. While the scrubbing happens in milliseconds, synchronization across our global CDN may take up to 24 hours to reflect globally.
                        </p>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-3xl font-black text-indigo-600 mb-1">~0s</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Latency</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="exceptions" className="scroll-mt-32 mb-12">
                <div className="flex items-center gap-4 mb-6 group">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">Legal Exceptions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="p-8 rounded-[2rem] bg-red-500/5 border border-red-500/10">
                        <h4 className="font-black text-red-900 dark:text-red-400 mb-3 uppercase tracking-widest text-[10px]">Tax & Billing</h4>
                        <p className="text-sm m-0 text-red-800/70 dark:text-red-500/70 leading-relaxed font-medium text-pretty">
                            Financial records, including invoices and tax-related transaction logs, must be retained according to Indian regulatory standards and cannot be purged upon request.
                        </p>
                    </div>
                    <div className="p-8 rounded-[2rem] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <h4 className="font-black text-slate-500 mb-3 uppercase tracking-widest text-[10px]">Legal Hold</h4>
                        <p className="text-sm m-0 text-slate-500 leading-relaxed font-medium text-pretty">
                            Data subject to a valid legal hold, law enforcement request, or necessary for the defense of legitimate legal claims will be preserved until the hold is lifted.
                        </p>
                    </div>
                </div>
            </section>

            <section id="contact" className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6 group">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold m-0 tracking-tight">Support</h2>
                </div>
                <div className="group relative overflow-hidden p-1 p-px bg-gradient-to-br from-primary via-blue-400 to-green-400 rounded-3xl">
                    <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-[1.45rem] relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <p className="text-lg font-bold mb-1 tracking-tight">Privacy Officer</p>
                            <p className="text-slate-500 m-0 text-sm font-medium">ShelfMerch Compliance Team</p>
                        </div>
                        <a
                            href="mailto:shelfmerch@gmail.com"
                            className="px-6 py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            Contact Team
                        </a>
                    </div>
                </div>
            </section>
        </LegalLayout>
    );
};

export default DataDeletionPolicy;
