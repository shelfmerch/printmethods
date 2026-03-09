import React, { useEffect, useState } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { ChevronRight, FileText, Shield, Trash2, Clock, Globe, Lock, Mail } from 'lucide-react';

interface Section {
    id: string;
    title: string;
    count?: string;
}

interface LegalLayoutProps {
    title: string;
    subtitle: string;
    lastUpdated: string;
    sections: Section[];
    children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({
    title,
    subtitle,
    lastUpdated,
    sections,
    children
}) => {
    const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
            <Header />

            {/* Premium Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-brand-green/5 rounded-full blur-[100px]" />
                </div>

                <div className="container-custom relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 animate-fade-in">
                        <Globe className="w-3 h-3" />
                        <span>Official Policy Documentation</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#111] dark:text-white tracking-tight mb-6 animate-fade-up">
                        {title}
                    </h1>

                    <p className="text-xl text-brand-gray dark:text-brand-gray max-w-2xl mx-auto leading-relaxed animate-fade-up animate-delay-100">
                        {subtitle}
                    </p>

                    <div className="mt-8 text-sm font-medium text-brand-gray/60 animate-fade-up animate-delay-200">
                        Last updated: <span className="text-[#111] dark:text-white">{lastUpdated}</span>
                    </div>
                </div>
            </section>

            <div className="container-custom pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Dynamic Sidebar */}
                    <aside className="lg:col-span-3">
                        <div className="sticky top-24 space-y-4">
                            <div className="p-6 bg-white dark:bg-[#111] rounded-2xl border border-border/50 shadow-sm">
                                <h3 className="text-xs font-bold text-brand-gray/50 uppercase tracking-[0.2em] mb-6">On this page</h3>
                                <nav className="space-y-1">
                                    {sections.map((section, idx) => (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeSection === section.id
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1'
                                                    : 'text-brand-gray hover:bg-muted hover:text-[#111] dark:hover:text-white'
                                                }`}
                                        >
                                            <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border ${activeSection === section.id ? 'border-white/50' : 'border-border'
                                                }`}>
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm font-semibold truncate">{section.title}</span>
                                            {activeSection === section.id && (
                                                <ChevronRight className="w-4 h-4 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Need help card */}
                            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 group">
                                <h4 className="text-sm font-bold text-[#111] dark:text-white mb-2">Need clarification?</h4>
                                <p className="text-xs text-brand-gray leading-relaxed mb-4">
                                    Our team is here to help you understand our policies and your rights.
                                </p>
                                <a
                                    href="mailto:shelfmerch@gmail.com"
                                    className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:gap-3 transition-all"
                                >
                                    <Mail className="w-3 h-3" />
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Content Block */}
                    <main className="lg:col-span-9">
                        <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-8 md:p-12 lg:p-16 border border-border/50 shadow-xl shadow-black/[0.02]">
                            <div className="prose prose-slate prose-invert lg:prose-xl max-w-none 
                prose-headings:text-[#111] dark:prose-headings:text-white 
                prose-p:text-brand-gray dark:prose-p:text-brand-gray/80
                prose-strong:text-[#111] dark:prose-strong:text-white
                prose-li:text-brand-gray dark:prose-li:text-brand-gray/80
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              ">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default LegalLayout;
