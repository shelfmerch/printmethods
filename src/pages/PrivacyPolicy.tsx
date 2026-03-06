import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState<string>('');

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'information-collection', title: '2. Information We Collect' },
    { id: 'information-use', title: '3. How We Use Your Information' },
    { id: 'information-sharing', title: '4. Information Sharing and Disclosure' },
    { id: 'data-security', title: '5. Data Security' },
    { id: 'data-retention', title: '6. Data Retention' },
    { id: 'user-rights', title: '7. Your Rights and Choices' },
    { id: 'cookies', title: '8. Cookies and Tracking Technologies' },
    { id: 'third-party', title: '9. Third-Party Services' },
    { id: 'international', title: '10. International Data Transfers' },
    { id: 'children', title: '11. Children\'s Privacy' },
    { id: 'policy-changes', title: '12. Changes to This Privacy Policy' },
    { id: 'contact', title: '13. Contact Information' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Welcome, and thank you for your interest in MrchX, a product of Chitlu Innovations Private Limited.
          </p>
        </header>

        <div className="prose prose-gray max-w-none">
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <p className="text-sm leading-relaxed">
              Welcome, and thank you for your interest in MrchX, a product of Chitlu Innovations Private Limited ("MrchX," "we," or "us"), and our website at www.MrchX.com, along with our related websites, networks, applications, mobile applications, and other services provided by us (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="text-sm leading-relaxed mt-4">
              By using the Service, you agree to the collection and use of information in accordance with this policy. If you disagree with any part of this privacy policy, please do not use our Service or access our website.
            </p>
          </div>

          <nav className="sticky top-4 bg-background border rounded-lg p-4 mb-8">
            <h3 className="font-semibold mb-3">Quick Navigation</h3>
            <div className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`block w-full text-left text-sm px-2 py-1 rounded transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </nav>

          <div className="space-y-8">
            <section id="introduction" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-sm leading-relaxed mb-4">
                MrchX ("us", "we", or "our") operates the www.MrchX.com website and the MrchX service (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </p>
              <p className="text-sm leading-relaxed">
                We use your data to provide and improve the service. By using the Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section id="information-collection" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Data</h3>
                  <p className="text-sm leading-relaxed">
                    When you register for an account, we may ask for your contact information, including items such as name, email address, phone number, and other information that can reasonably be used to contact you or identify you.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Usage Data</h3>
                  <p className="text-sm leading-relaxed">
                    We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol (IP) address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other diagnostic data.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tracking & Cookies Data</h3>
                  <p className="text-sm leading-relaxed">
                    We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. They are sent to your browser from a website and stored on your device.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Information</h3>
                  <p className="text-sm leading-relaxed">
                    For business accounts, we may collect company name, business address, tax identification numbers, and other business-related information necessary for payment processing and service delivery.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Content and User Generated Data</h3>
                  <p className="text-sm leading-relaxed">
                    When you use our Service, we may collect information about the content you create, upload, or share, including product designs, artwork, descriptions, and other creative materials.
                  </p>
                </div>
              </div>
            </section>

            <section id="information-use" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed mb-4">
                MrchX uses the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide customer care and support</li>
                <li>To provide analysis or valuable information so that we can improve the Service</li>
                <li>To monitor the usage of the Service</li>
                <li>To detect, prevent and address technical issues</li>
                <li>To process payments and manage financial transactions</li>
                <li>To fulfill orders and deliver products</li>
                <li>To communicate with you about products, services, and promotional offers</li>
                <li>To comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section id="information-sharing" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">4. Information Sharing and Disclosure</h2>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">Service Providers</h3>
                  <p className="text-sm leading-relaxed">
                    We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Transfers</h3>
                  <p className="text-sm leading-relaxed">
                    If MrchX is involved in a merger, acquisition or asset sale, your Personal Data may be transferred. We will provide notice before your Personal Data is transferred and becomes subject to a different Privacy Policy.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Legal Requirements</h3>
                  <p className="text-sm leading-relaxed">
                    MrchX may disclose your Personal Data in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend the rights or property of MrchX, protect the personal safety of users of the Service or the public, or prevent or investigate possible wrongdoing in connection with the Service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Partners and Suppliers</h3>
                  <p className="text-sm leading-relaxed">
                    We may share your information with our manufacturing partners, shipping companies, and payment processors to fulfill orders and process transactions. These partners are contractually obligated to protect your information.
                  </p>
                </div>
              </div>
            </section>

            <section id="data-security" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-sm leading-relaxed mb-4">
                The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
              <p className="text-sm leading-relaxed">
                We implement appropriate technical and organizational measures to protect your Personal Data against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, access controls, and regular security assessments.
              </p>
            </section>

            <section id="data-retention" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
              <p className="text-sm leading-relaxed mb-4">
                MrchX will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
              </p>
              <p className="text-sm leading-relaxed">
                If you are no longer using our Service, or if we are no longer required to retain your Personal Data for legal or business purposes, we will either delete or anonymize your Personal Data or, if this is not possible, we will securely store your Personal Data and isolate it from any further processing until deletion is possible.
              </p>
            </section>

            <section id="user-rights" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">7. Your Rights and Choices</h2>
              <p className="text-sm leading-relaxed mb-4">
                You have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
              </p>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">Access and Update</h3>
                  <p className="text-sm leading-relaxed">
                    You can access and update your Personal Data through your account settings or by contacting us directly.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Data Portability</h3>
                  <p className="text-sm leading-relaxed">
                    You have the right to request a copy of your Personal Data in a structured, machine-readable format.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Deletion</h3>
                  <p className="text-sm leading-relaxed">
                    You can request deletion of your Personal Data, subject to certain legal and business obligations.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Opt-out</h3>
                  <p className="text-sm leading-relaxed">
                    You can opt out of receiving marketing communications from us at any time by following the unsubscribe instructions provided in our emails or by contacting us directly.
                  </p>
                </div>
              </div>
            </section>

            <section id="cookies" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-sm leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information.
              </p>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">Essential Cookies</h3>
                  <p className="text-sm leading-relaxed">
                    These cookies are necessary for the Service to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Performance Cookies</h3>
                  <p className="text-sm leading-relaxed">
                    These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Targeting Cookies</h3>
                  <p className="text-sm leading-relaxed">
                    These cookies may be set through our Service by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.
                  </p>
                </div>
              </div>
            </section>

            <section id="third-party" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">9. Third-Party Services</h2>
              <p className="text-sm leading-relaxed mb-4">
                Our Service may contain links to other sites that are not operated by us. If you click a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
              </p>
              <p className="text-sm leading-relaxed">
                We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. This includes payment processors, shipping carriers, social media platforms, and analytics services.
              </p>
            </section>

            <section id="international" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">10. International Data Transfers</h2>
              <p className="text-sm leading-relaxed mb-4">
                Your Personal Data may be transferred to, and maintained on, computers and equipment located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.
              </p>
              <p className="text-sm leading-relaxed">
                If you are located outside India and choose to provide information to us, please note that we transfer the data, including Personal Data, to India and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
              </p>
            </section>

            <section id="children" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">11. Children's Privacy</h2>
              <p className="text-sm leading-relaxed">
                Our Service does not address anyone under the age of 13 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us.
              </p>
            </section>

            <section id="policy-changes" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-sm leading-relaxed mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this policy.
              </p>
              <p className="text-sm leading-relaxed">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section id="contact" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">13. Contact Information</h2>
              <p className="text-sm leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 ml-4 text-sm">
                <p><strong>Email:</strong> support@shelfmerch.com</p>
                <p><strong>Website:</strong> www.MrchX.com</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <h3 className="font-semibold mb-2">Office Address:</h3>
                <p className="text-sm">G2, Win Win Towers, Madhapur, Hi-Tech City, Hyderabad, Telangana 500081</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrivacyPolicy;
