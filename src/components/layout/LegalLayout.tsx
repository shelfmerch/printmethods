import React, { useEffect, useState } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { ChevronRight, Globe, Mail, ArrowRight } from 'lucide-react';


interface LegalLayoutProps {
    title: string;
    subtitle: string;
    lastUpdated: string;
    children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({
    title,
    subtitle,
    lastUpdated,
    children
}) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] transition-colors duration-700 selection:bg-primary/20">
            <Header />

            {/* Modern Mesh Grid Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.08),transparent_50%)]" />
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-100" />
            </div>

            <main>
                {/* Dynamic Hero Section */}
                <section className="relative pt-32 pb-16 overflow-hidden">
                    <div className="container-custom relative z-10">
                        <div className="flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-primary/20 text-primary text-[10px] uppercase font-bold tracking-[0.2em] mb-8 shadow-sm backdrop-blur-md animate-fade-in">
                                <Globe className="w-3.5 h-3.5" />
                                <span>Legal & Compliance</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 animate-fade-up leading-[1.1]">
                                {title.split(' ').map((word, i) => (
                                    <span key={i} className={i === title.split(' ').length - 1 ? "text-primary block md:inline" : "block md:inline"}>
                                        {word}{' '}
                                    </span>
                                ))}
                            </h1>

                            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-up animate-delay-100 font-medium">
                                {subtitle}
                            </p>

                            <div className="mt-8 flex items-center gap-4 text-sm font-bold animate-fade-up animate-delay-200">
                                <span className="text-slate-400 uppercase tracking-widest text-[10px]">Updated on</span>
                                <span className="px-3 py-1 bg-slate-200/50 dark:bg-white/10 rounded-lg text-slate-900 dark:text-white">{lastUpdated}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="px-6 md:px-12 lg:px-20 pb-32">
                    <div className="w-full">
                        {/* Premium Content Area */}
                        <article>
                            <div className="bg-white dark:bg-[#0c0c0c] rounded-[2rem] p-6 md:p-8 lg:p-10 border border-slate-200 dark:border-white/5 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.08)] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-400 to-brand-green opacity-50" />

                                <div className="prose prose-slate prose-lg dark:prose-invert max-w-none 
                  prose-headings:font-bold prose-headings:tracking-tight 
                  prose-headings:text-slate-900 dark:prose-headings:text-white
                  prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed
                  prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
                  prose-li:text-slate-600 dark:prose-li:text-slate-400
                  prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                  prose-ul:list-none prose-ul:pl-0
                ">
                                    {children}
                                </div>

                                {/* Support Footer within content area */}
                                <div className="mt-16 pt-8 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-8 bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border border-slate-200/50 dark:border-white/5">
                                        <div className="max-w-2xl">
                                            <h4 className="text-2xl font-black mb-2 tracking-tight">Need a deeper explanation?</h4>
                                            <p className="text-slate-500 text-base m-0 font-medium leading-relaxed">
                                                Our compliance and legal teams are standing by to help you understand our operational standards and your rights as a merchant.
                                            </p>
                                        </div>
                                        <a
                                            href="mailto:shelfmerch@gmail.com"
                                            className="inline-flex items-center justify-center gap-3 px-10 py-6 bg-primary text-white rounded-2xl text-lg font-black hover:bg-blue-600 transition-all shadow-2xl shadow-primary/30 active:scale-95 whitespace-nowrap"
                                        >
                                            <Mail className="w-6 h-6" />
                                            Get in Touch
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LegalLayout;
