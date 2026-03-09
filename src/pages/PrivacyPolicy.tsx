import LegalLayout from '@/components/layout/LegalLayout';
import { Shield, Eye, Share2, Cookie, CheckCircle, Mail, MapPin, Globe, Lock } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'data-collection', title: 'Data Collection' },
    { id: 'data-usage', title: 'Data Usage' },
    { id: 'data-sharing', title: 'Data Sharing' },
    { id: 'cookies', title: 'Cookies & Tech' },
    { id: 'compliance', title: 'Legal Compliance' },
    { id: 'contact', title: 'Contact' },
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we handle your personal information and ensure your data remains secure."
      lastUpdated="March 09, 2026"
      sections={sections}
    >
      <section id="introduction" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">1. Introduction</h2>
        </div>
        <p>
          At <strong>Shelf Merch</strong> (a product of <strong>Chitlu Innovations Private Limited</strong>),
          your privacy is our priority. This policy outlines how we collect, use, and protect your information when you interact with our platform.
        </p>
        <p className="mt-4">
          We operate under the principles of transparency and security. By using our services, you trust us with your data,
          and we are committed to maintaining that trust.
        </p>
      </section>

      <section id="data-collection" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">2. Data Collection</h2>
        </div>
        <p>We collect only the essential information required to provide you with a seamless experience:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 rounded-3xl bg-[#fdfdfd] dark:bg-[#1a1a1a] border border-border shadow-sm">
            <h4 className="text-lg font-bold mb-2">Personal Identity</h4>
            <p className="text-sm m-0">Email addresses for account management and order tracking.</p>
          </div>
          <div className="p-6 rounded-3xl bg-[#fdfdfd] dark:bg-[#1a1a1a] border border-border shadow-sm">
            <h4 className="text-lg font-bold mb-2">Logistics Data</h4>
            <p className="text-sm m-0">Shipping addresses to ensure accurate delivery of your merchandise.</p>
          </div>
        </div>
        <p className="mt-6 italic text-sm opacity-70">
          * We do NOT track analytics using third-party services like Google Analytics or Firebase to ensure maximum privacy.
        </p>
      </section>

      <section id="data-usage" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">3. How We Use Data</h2>
        </div>
        <p>Your data empowerment allows us to:</p>
        <ul className="space-y-3 mt-4">
          <li>Fulfill and ship your custom product orders.</li>
          <li>Process payments securely through encrypted gateways.</li>
          <li>Provide dedicated customer support and technical assistance.</li>
          <li>Keep you informed about significant updates to our platform.</li>
        </ul>
      </section>

      <section id="data-sharing" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">4. Data Sharing</h2>
        </div>
        <div className="p-8 rounded-[2rem] bg-orange-500/5 border border-orange-500/10">
          <p className="text-lg font-semibold text-orange-600 dark:text-orange-400 m-0 leading-relaxed">
            We operate on a zero-third-party sharing policy. We do not sell, trade, or transfer your personal data to outside parties.
          </p>
        </div>
      </section>

      <section id="cookies" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
            <Cookie className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">5. Cookies</h2>
        </div>
        <p>
          We use functional cookies to enhance site navigation and remember your preferences. These are small text files
          stored on your device that help us provide a better user experience without intrusive tracking.
        </p>
      </section>

      <section id="compliance" className="scroll-mt-24 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">6. GDPR / CCPA Compliance</h2>
        </div>
        <p>
          Currently, Shelf Merch serves customers exclusively outside the EU and California.
          As such, we are not directly subject to GDPR or CCPA requirements, but we maintain high internal security standards
          that align with global best practices.
        </p>
      </section>

      <section id="contact" className="scroll-mt-24">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold m-0">7. Contact Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-bold m-0">Email Support</p>
                <a href="mailto:shelfmerch@gmail.com" className="text-primary hover:underline">shelfmerch@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-bold m-0">Official Website</p>
                <a href="https://shelfmerch.store/" className="text-primary hover:underline">https://shelfmerch.store/</a>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-muted/30 border border-border">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-bold m-0">Headquarters</p>
                <p className="text-sm m-0 mt-1 opacity-70">
                  Chitlu Innovations Private Limited<br />
                  G2, Win Win Towers, Madhapur, Hi-Tech City,<br />
                  Hyderabad, Telangana 500081
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
