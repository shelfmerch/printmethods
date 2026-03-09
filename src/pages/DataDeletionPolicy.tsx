import LegalLayout from '@/components/layout/LegalLayout';
import { Trash2, ShoppingBag, RotateCcw, Calendar, AlertCircle } from 'lucide-react';

const DataDeletionPolicy = () => {
    const sections = [
        { id: 'how-to-request', title: 'How to Request Deletion' },
        { id: 'data-collected', title: 'Types of Data Collected' },
        { id: 'after-deletion', title: 'After Data Deletion' },
        { id: 'timeframe', title: 'Timeframe for Deletion' },
        { id: 'exceptions', title: 'Exceptions' },
    ];

    return (
        <LegalLayout
            title="Data Deletion Policy"
            subtitle="Complete guide on how to request permanent removal of your personal information from our systems."
            lastUpdated="March 09, 2026"
            sections={sections}
        >
            <section id="how-to-request" className="scroll-mt-24 mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold m-0">1. How to Request Deletion</h2>
                </div>
                <p>
                    We respect your right to be forgotten. You can request the permanent deletion of your data through any of these premium support channels:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div className="flex items-start gap-4 p-6 rounded-3xl bg-[#fdfdfd] dark:bg-[#1a1a1a] border border-border group hover:border-primary transition-colors">
                        <div className="text-2xl font-bold text-primary/20 group-hover:text-primary transition-colors">01</div>
                        <div>
                            <h4 className="text-base font-bold mb-1">Direct Email</h4>
                            <p className="text-sm m-0 opacity-70 italic">Send a request to shelfmerch@gmail.com</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 rounded-3xl bg-[#fdfdfd] dark:bg-[#1a1a1a] border border-border group hover:border-primary transition-colors">
                        <div className="text-2xl font-bold text-primary/20 group-hover:text-primary transition-colors">02</div>
                        <div>
                            <h4 className="text-base font-bold mb-1">Dashboard Feature</h4>
                            <p className="text-sm m-0 opacity-70 italic">Use the account settings deletion tool</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="data-collected" className="scroll-mt-24 mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold m-0">2. Types of Data Collected</h2>
                </div>
                <p>Information subject to deletion includes:</p>
                <ul className="space-y-4 mt-6">
                    <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Profile Identity (Registered Email Addresses)</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Fulfillment Data (Saved Shipping Addresses)</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Operational History (Non-financial order details)</span>
                    </li>
                </ul>
            </section>

            <section id="after-deletion" className="scroll-mt-24 mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                        <RotateCcw className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold m-0">3. What Happens After Deletion</h2>
                </div>
                <div className="p-10 rounded-[2.5rem] bg-orange-500/[0.03] border border-orange-500/10 text-center">
                    <p className="text-lg font-medium leading-relaxed">
                        All personal identifiers are scrubbed from our active databases.
                        Your identity will be completely detached from any remaining record, ensuring zero traceability.
                    </p>
                </div>
            </section>

            <section id="timeframe" className="scroll-mt-24 mb-16">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold m-0">4. Timeframe for Deletion</h2>
                </div>
                <p>
                    Efficiency is key. We process and confirm all verified deletion requests within a strict window of
                    <strong> 30 calendar days</strong>.
                </p>
            </section>

            <section id="exceptions" className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold m-0">5. Exceptions</h2>
                </div>
                <p>In certain scenarios, we are legally required to retain specific shards of data:</p>
                <div className="mt-8 p-8 rounded-3xl bg-red-500/5 border border-red-500/10">
                    <ul className="space-y-4 m-0">
                        <li><strong>Tax Records:</strong> Financial invoices must be retained according to Indian tax regulations.</li>
                        <li><strong>Legal Obligations:</strong> Compliance with specific court orders or law enforcement requests.</li>
                    </ul>
                </div>
            </section>
        </LegalLayout>
    );
};

export default DataDeletionPolicy;
