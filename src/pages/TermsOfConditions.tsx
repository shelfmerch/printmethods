import LegalLayout from '@/components/layout/LegalLayout';
import { Gavel, Users, AlertTriangle, XCircle, Landmark, Edit3, MessageCircle } from 'lucide-react';

const TermsOfConditions = () => {
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'responsibilities', title: 'User Responsibilities' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'amendments', title: 'Amendments' },
    { id: 'contact', title: 'Contact' },
  ];

  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The rules, guidelines, and legal agreements for using our platform."
      lastUpdated="March 09, 2026"
      sections={sections}
    >
      <section id="introduction" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Gavel className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">1. Introduction</h2>
        </div>
        <p>
          Welcome to <strong>Shelf Merch</strong>. These Terms of Service govern your access to and use of our platform,
          including our website at <a href="https://shelfmerch.store/">https://shelfmerch.store/</a> and any related services.
        </p>
        <p className="mt-4">
          Shelf Merch is a premier print-on-demand platform enabling creators to design, sell, and fulfill custom merchandise effortlessly.
          By accessing our App, you agree to be legally bound by these terms.
        </p>
      </section>

      <section id="responsibilities" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">2. User Responsibilities</h2>
        </div>
        <p>To maintain a safe and creative community, you agree to:</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 mt-8">
          <li className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="text-sm leading-relaxed">Use the App only for lawful, ethical purposes.</span>
          </li>
          <li className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="text-sm leading-relaxed">Provide accurate account and business information.</span>
          </li>
          <li className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="text-sm leading-relaxed">Protect your account credentials from unauthorized access.</span>
          </li>
          <li className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="text-sm leading-relaxed">Respect intellectual property rights of all creators.</span>
          </li>
        </ul>
      </section>

      <section id="liability" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">3. Limitation of Liability</h2>
        </div>
        <div className="p-8 rounded-[2.5rem] bg-red-500/[0.03] border border-red-500/10">
          <p className="text-sm leading-relaxed italic opacity-80">
            To the maximum extent permitted by law, <strong>Chitlu Innovations Private Limited</strong> shall not be liable for any indirect,
            incidental, or consequential damages resulting from your use of the App, including data loss or business interruptions.
          </p>
        </div>
      </section>

      <section id="termination" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-zinc-500/10 text-zinc-500">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">4. Termination</h2>
        </div>
        <p>
          We reserve the right to suspend or terminate your access immediately, without prior notice, if we determine you have breached these Terms.
          Your creative freedom comes with the responsibility of following platform guidelines.
        </p>
      </section>

      <section id="governing-law" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">5. Governing Law</h2>
        </div>
        <p>
          These Terms are governed by the laws of <strong>India</strong>. Any disputes shall be subject to
          the exclusive jurisdiction of the courts in <strong>Hyderabad, India</strong>.
        </p>
      </section>

      <section id="amendments" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500">
            <Edit3 className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">6. Amendments</h2>
        </div>
        <p>
          We evolve constantly. As such, we may update these Terms periodically.
          Significant changes will be communicated via the platform or updated on this page.
        </p>
      </section>

      <section id="contact" className="scroll-mt-24">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">7. Contact Information</h2>
        </div>
        <p>For legal inquiries or clarifications regarding these terms, please contact:</p>
        <div className="mt-8 flex items-center p-6 rounded-3xl bg-primary/5 border border-primary/10">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white mr-4">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold m-0 text-foreground">Legal Department</p>
            <p className="text-sm m-0 opacity-70">shelfmerch@gmail.com</p>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
};

export default TermsOfConditions;
