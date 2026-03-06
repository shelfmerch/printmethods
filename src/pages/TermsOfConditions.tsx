import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';

const TermsOfConditions = () => {
  const [activeSection, setActiveSection] = useState<string>('');

  const sections = [
    { id: 'overview', title: '1. MrchX Service Overview' },
    { id: 'accounts', title: '2. Accounts and Registration' },
    { id: 'listings', title: '3. Creation and implementation of Product Listings - Corporate site' },
    { id: 'fees', title: '4. Corporate Site Fees and Payment Terms' },
    { id: 'licenses', title: '5. Licenses' },
    { id: 'ownership', title: '6. Ownership; Proprietary Rights' },
    { id: 'user-content', title: '7. User Content' },
    { id: 'prohibited', title: '8. Prohibited Conduct' },
    { id: 'modification', title: '9. Modification of these Terms' },
    { id: 'termination', title: '10. Term, Termination and Modification of the Service' },
    { id: 'indemnity', title: '11. Indemnity' },
    { id: 'disclaimers', title: '12. Disclaimers, No Warranties' },
    { id: 'liability', title: '13. Limitation Of Liability' },
    { id: 'law', title: '14. Applicable law and jurisdiction' },
    { id: 'notice', title: '15. Notice' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground">
            Welcome, and thank you for your interest in MrchX, a product of Chitlu Innovations Private Limited.
          </p>
        </header>

        <div className="prose prose-gray max-w-none">
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <p className="text-sm leading-relaxed">
              Welcome, and thank you for your interest in MrchX, a product of Chitlu Innovations Private Limited. ("MrchX," "we," or "us"), and our website at www.MrchX.com, along with our related websites, networks, applications, mobile applications, and other services provided by us (collectively, the "Service"). These Terms of Service are a legally binding contract between you and MrchX regarding your use of the service.
            </p>
            <p className="text-sm leading-relaxed mt-4">
              Please read the following terms carefully. By clicking "I accept" or otherwise accessing or using the service, you agree that you have read and understood, and, as a condition to your use of the service, you agree to be bound by, the following terms and conditions, including MrchX's privacy policy (together, these "terms"). If you are not eligible or do not agree to the terms, then you do not have our permission to use the service. Your use of the service and MrchX's provision of the service to you constitute an agreement by MrchX and by you to be bound by these terms.
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
            <section id="overview" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">1. MrchX Service Overview</h2>
              <p className="text-sm leading-relaxed mb-4">
                This section describes the service and some of its features. MrchX is a technology platform that allows you to set up a fully branded store ("Creator Site"). MrchX is your ultimate partner in delivering premium corporate merchandise solutions. At MrchX, we specialize in creating and managing custom online stores for businesses, providing employee kits, and handling all logistics from end to end. Our mission is to elevate your brand and strengthen relationships through high-quality products and an intelligent, user-friendly platform.
              </p>
            </section>

            <section id="accounts" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">2. Accounts and Registration</h2>
              <p className="text-sm leading-relaxed mb-4">
                This section describes the mechanics of your account on the service. To use the service, you must register for an account. When you register for an account, you may be required to provide us with some information about yourself, such as your name, email address, or other contact information. You agree that the information you provide to us is accurate and that you will keep it accurate and up-to-date at all times. When you register, you will be asked to provide a password. You are solely responsible for maintaining the confidentiality of your account and password, and you accept responsibility for all activities that occur under your account. If you believe that your account is no longer secure, then you must immediately notify us at support@shelfmerch.com.
              </p>
            </section>

            <section id="listings" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">3. Creation and implementation of Product Listings - Corporate site</h2>
              <p className="text-sm leading-relaxed mb-4">
                This Section describes the mechanics of your account on the Service.
              </p>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Your Right to Implement a Listing</h3>
                  <p className="text-sm leading-relaxed">
                    By creating a listing through the Shelf Merch, you represent and warrant that you own or are the licensee of all trademark rights, copyrights, rights of publicity, and other intellectual property or other proprietary rights necessary to create and implement the listing ("Listing Rights"), including any rights relating to the name, description, images, text, or URL used for the listing. You will provide Shelf Merch with evidence of your listing rights upon request.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Content Ownership</h3>
                  <p className="text-sm leading-relaxed">
                    Shelf Merch does not claim any ownership rights to the content you upload to the Shelf Merch Platform. Please be sure you maintain copies of all of your work. Shelf Merch has no responsibility or liability for the deletion or failure to store any content or information uploaded to the Shelf Merch Platform.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. License Grant</h3>
                  <p className="text-sm leading-relaxed">
                    For the purpose of implementing and fulfilling your listing and for the purpose of advertising the Shelf Merch platform in any medium Shelf Merch chooses, you hereby grant Shelf Merch a nonexclusive, worldwide, fully paid-up, transferable, sublicensable license under your Listing Rights to copy, display, distribute, and modify the content you upload to the Shelfmerch platform (including all related images, text, content, and information).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4. Indemnity</h3>
                  <p className="text-sm leading-relaxed">
                    To the extent any listing launched by you or launched via your Shelf Merch account violates or is alleged to violate our Acceptable Use Policy or any other part of these Terms of Service, in addition to any other remedies, you agree that Shelf Merch has the right to withhold and redirect any funds collected relating to the listing, which funds will be disbursed based on Shelf Merch's internal policies. Without limiting the foregoing, you also agree to indemnify and hold Shelf Merch harmless from any and all liabilities, losses, damages, and expenses arising out of your violation or any alleged violation of our Acceptable Use Policy or any other part of these Terms of Service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">5. Quality of Artwork and Promotions</h3>
                  <p className="text-sm leading-relaxed">
                    Each listing must meet reasonable production standards (e.g., a listing may not include a low-quality image that will not print well). All of your advertisements or promotional descriptions, including content that is uploaded to the Shelf Merch Service, must be accurate and correct, and you must not include any content concerning non-Shelf Merch activities, events, products, services, or promotions.
                  </p>
                </div>
              </div>
            </section>

            <section id="fees" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">4. Corporate Site Fees and Payment Terms</h2>
              <p className="text-sm leading-relaxed mb-4">
                This section describes the payment of fees for the service. It also specifies that Shelf Merch will collect and remit taxes and serve as the merchant of record.
              </p>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">A. Payment Processing</h3>
                  <p className="text-sm leading-relaxed">
                    Shelf Merch will process and receive payment from end users for all product orders made through your corporate site. Shelf Merch reserves the right to not authorize or settle any payment it believes is in violation of these terms or is fraudulent.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">B. Fees</h3>
                  <p className="text-sm leading-relaxed">
                    Shelf Merch will deduct the following fees from amounts owed to you under these Terms: (a) platform commission from the revenue generated on digital products ("Digital Products Fee"); (b) a payment processing fee of all payments made by end users through your site ("Payment Processing Fees"); and (c) shipping fees.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">C. Payments to You</h3>
                  <p className="text-sm leading-relaxed">
                    Within 7 business days after the end of each calendar month, Shelf Merch will pay to you the product revenue for that month, minus: (a) the digital products fee; (b) the payment processing fees; (c) shipping fees; (d) taxes collected by Shelfmerch; and (e) amounts for refunds, returns, credits, chargebacks, and fraudulent transactions. Shelf Merch may, in its sole discretion, exclude or withhold from any payment due to you any amount: (i) received in connection with a violation of these Terms; (ii) that Shelf Merch believes to be fraudulent; or (iii) as necessary to comply with any law, rule, or regulation. "Product Revenue" means amounts received by Shelf Merch in connection with product orders, minus amounts owed to suppliers for the supply of the product.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">D. Payment Information</h3>
                  <p className="text-sm leading-relaxed">
                    Shelf Merch will pay you any amounts owed under these Terms to the payment method that you choose from the payment options made available through the service. To ensure proper payment, you are responsible for providing and maintaining accurate contact and payment information through the service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">E. Currency</h3>
                  <p className="text-sm leading-relaxed">
                    All payments made by Shelf Merch under these terms will be made in Indian rupees. If Shelf Merch is required to make a payment in a currency that is not Indian Rupees, Shelf Merch will use an exchange rate at its discretion and may charge you fees or charges for the conversion.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">F. Taxes</h3>
                  <p className="text-sm leading-relaxed">
                    Shelf Merch will be responsible for calculating and collecting any and all sales taxes on product orders and will submit such collected sales taxes to the appropriate tax authorities. For sales tax purposes, Shelf Merch will serve as the merchant of record.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">G. Right of Set Off; Overpayment</h3>
                  <p className="text-sm leading-relaxed">
                    At any time, Shelf Merch may offset returns, refunds, or other amounts owed by you to Shelf Merch against amounts Shelf Merch owes to you. If any excess payment has been made to you for any reason whatsoever, Shelf Merch reserves the right to adjust or offset the same against any subsequent amounts payable to you under these terms.
                  </p>
                </div>
              </div>
            </section>

            <section id="licenses" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">5. Licenses</h2>
              <p className="text-sm leading-relaxed mb-4">
                This section grants you the right to use the service, describes some restrictions on that right, and gives Shelf Merch the right to use any feedback you provide.
              </p>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Limited License</h3>
                  <p className="text-sm leading-relaxed">
                    Subject to your complete and ongoing compliance with these Terms, Shelf Merch grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. License Restrictions</h3>
                  <p className="text-sm leading-relaxed">
                    Except and solely to the extent such a restriction is impermissible under applicable law, you may not: (a) reproduce, distribute, publicly display, or publicly perform the service; (b) make modifications to the service; or (c) interfere with or circumvent any feature of the service, including any security or access control mechanism. If you are prohibited under applicable law from using the service, you may not use it.
                  </p>
                </div>
              </div>
            </section>

            <section id="ownership" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">6. Ownership; Proprietary Rights</h2>
              <p className="text-sm leading-relaxed mb-4">
                This section clarifies that Shelf Merch owns the service. The platform is owned and operated by Shelf Merch. The visual interfaces, graphics, design, compilation, information, data, computer code (including source code or object code), products, software, services, and all other elements of the platform ("materials") provided by Shelf Merch are protected by intellectual property and other laws. All materials included in the service are the property of Shelf Merch or its third-party licensors. Except as expressly authorized by Shelf Merch, you may not make use of the materials.
              </p>
            </section>

            <section id="user-content" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">7. User Content</h2>
              <p className="text-sm leading-relaxed mb-4">
                This section gives Shelf Merch the right to use anything you post on the service to provide the service to you and includes some restrictions on what you may post.
              </p>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">a. User Content Generally</h3>
                  <p className="text-sm leading-relaxed">
                    Certain features of the service may permit users to choose a unique domain for their corporate site and to upload content to the service, including product designs, artwork, messages, reviews, photos, video, images, folders, data, text, and other types of works or digital content ("User Content"), and to publish user content on the service, including your site. You retain any copyright and other proprietary rights that you may hold in the user content that you post to the service, including your site.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">b. Limited License Grant to Shelf Merch</h3>
                  <p className="text-sm leading-relaxed">
                    By providing User Content to or via the Service, you grant Shelf Merch a worldwide, non-exclusive, royalty-free, fully paid right and license (with the right to sublicense) to host, store, transfer, display, perform, reproduce, modify for the purpose of formatting for display, and distribute your User Content, in whole or in part, in any media formats and through any media channels now known or hereafter developed in order to provide the Service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">c. Limited License Grant to Other Users</h3>
                  <p className="text-sm leading-relaxed">
                    By providing User Content to or via the Service to other users of the Service, you grant those users a non-exclusive license to access and use that User Content as permitted by these Terms and the functionality of the Service.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">d. User Content Representations and Warranties</h3>
                  <p className="text-sm leading-relaxed">
                    Shelf Merch disclaims any and all liability in connection with user content. You are solely responsible for your user content and the consequences of providing user content via the platform. By providing user content via the service, you affirm, represent, and warrant that.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">e. Ownership Rights</h3>
                  <p className="text-sm leading-relaxed">
                    You are the owner of the user content or have the necessary licenses, rights, consents, and permissions to authorize Shelf Merch and users of the service to use and distribute your user content as necessary to exercise the licenses granted by you in this section in the manner contemplated by Shelf Merch, the service, and these terms.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">f. Non-Infringement</h3>
                  <p className="text-sm leading-relaxed">
                    Your user content, and the use of your user content as contemplated by these terms, does not and will not: (i) infringe, violate, or misappropriate any third party right, including any copyright, trademark, patent, trade secret, moral right, privacy right, right of publicity, or any other intellectual property or proprietary right; (ii) slander, defame, libel, or invade the right of privacy, publicity, or other property rights of any other person; or cause Shelfmerch to violate any law or regulation.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">g. Content Standards</h3>
                  <p className="text-sm leading-relaxed">
                    Your user content could not be deemed by a reasonable person to be objectionable, profane, indecent, pornographic, harassing, threatening, embarrassing, hateful, or otherwise inappropriate.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">h. User Content Disclaimer</h3>
                  <p className="text-sm leading-relaxed">
                    We are under no obligation to edit or control any site or any user content that you or other users post or publish, and we will not be in any way responsible for or liable for user content. Shelf Merch may, however, at any time and without prior notice, screen, remove, edit, or block any user content, including user content on any site, that in Shelf Merch's sole judgement violates these terms or is otherwise objectionable. You understand that when using the service, you will be exposed to user content from a variety of sources and acknowledge that user content may be inaccurate, offensive, indecent, or objectionable. You agree to waive, and do waive, any legal or equitable right or remedy you have or may have against Shelf Merch with respect to user content. If notified by a user or content owner that user content allegedly does not conform to these terms, we may investigate the allegation and determine in our sole discretion whether to remove the user content, which we reserve the right to do at any time and without notice.
                  </p>
                </div>
              </div>
            </section>

            <section id="prohibited" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">8. Prohibited Conduct</h2>
              <p className="text-sm leading-relaxed mb-4">
                This section describes what you may not do on the service. By using the service you agree not to:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4 text-sm">
                <li>use the service for any illegal purpose or in violation of any local, state, national, or international law;</li>
                <li>harass, threaten, demean, embarrass, or otherwise harm any person;</li>
                <li>violate, or encourage others to violate, any right of a third party, including by infringing or misappropriating any third party intellectual property right;</li>
                <li>interfere with security-related features of the service, including by: (i) disabling or circumventing features that prevent or limit use or copying of any content; or (ii) reverse engineering or otherwise attempting to discover the source code of any portion of the Service except to the extent that the activity is expressly permitted by applicable law;</li>
                <li>interfere with the operation of the service or any user's enjoyment of the service, including by: (i) uploading or otherwise disseminating any virus, adware, spyware, worm, or other malicious code; (ii) making any unsolicited offer or advertisement to another user of the service; (iii) collecting personal information about another user or third party without consent; or (iv) interfering with or disrupting any network, equipment, or server connected to or used to provide the service;</li>
              </ol>
            </section>

            <section id="modification" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">9. Modification of these Terms</h2>
              <p className="text-sm leading-relaxed">
                This section gives Shelf Merch the right to modify these terms and describes how we may do so. We reserve the right to change these terms on a going-forward basis at any time upon notice. Please check these terms periodically for changes. If a change to these terms materially modifies your rights or obligations, we may require that you accept the modified terms in order to continue to use the service. Material modifications are effective upon your acceptance of the modified terms. Immaterial modifications are effective upon publication. Disputes arising under these terms will be resolved in accordance with the version of these terms that was in effect at the time the dispute arose.
              </p>
            </section>

            <section id="termination" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">10. Term, Termination and Modification of the Service</h2>
              <p className="text-sm leading-relaxed mb-4">
                This Section describes when and how these terms and your use of the Service may be terminated.
              </p>
              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Term</h3>
                  <p className="text-sm leading-relaxed">
                    These terms are effective beginning when you accept the Terms or first download, install, access, or use the service, and ending when terminated.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Termination</h3>
                  <p className="text-sm leading-relaxed">
                    If you violate any provision of these Terms, your authorization to access the service and these terms automatically terminate. In addition, Shelf Merch may, at its sole discretion, terminate these Terms or your account on the service, or suspend or terminate your access to the service, at any time for any reason or no reason, with or without notice. You may terminate your account and these terms at any time by contacting customer service at support@shelfmerch.com.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Effect of Termination</h3>
                  <p className="text-sm leading-relaxed">
                    Upon termination of these Terms: (a) your license rights will terminate and you must immediately cease all use of the Service; (b) you will no longer be authorized to access your account or the service; (c) your creator Site will be taken offline; (d) you must pay Shelf Merch any unpaid amounts that are due to Shelf Merch; (e) Shelf Merch will pay to you any undisputed amounts owed to you under these terms and not yet paid.
                  </p>
                </div>
              </div>
            </section>

            <section id="indemnity" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">11. Indemnity</h2>
              <p className="text-sm leading-relaxed">
                This section states that you will indemnify Shelf Merch if a claim is brought against you for a misuse of the service, violation of these terms or any other rights, third party disputes, or your Products.
              </p>
              <p className="text-sm leading-relaxed mt-4">
                To the fullest extent permitted by law, you are responsible for your use of the service, and you will defend and indemnify Shelf Merch and its officers, directors, employees, consultants, affiliates, subsidiaries and agents from and against every claim brought by a third party, and any related liability, damage, loss, and expense, including reasonable attorneys' fees and costs, arising out of or connected with: (a) your unauthorized use of, or misuse of, the service; (b) your violation of any portion of these terms, any representation, warranty, or agreement referenced in these terms, or any applicable law or regulation; (c) your violation of any third party right, including any intellectual property right or publicity, confidentiality, other property, or privacy right; (d) any dispute or issue between you and any third party; or (e) any Product. We reserve the right, at our own expense, to assume the exclusive defense and control of any matter otherwise subject to indemnification by you (without limiting your indemnification obligations with respect to that matter), and in that case, you agree to cooperate with our defense of those claims.
              </p>
            </section>

            <section id="disclaimers" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">12. Disclaimers, No Warranties</h2>
              <p className="text-sm leading-relaxed mb-4">
                This section limits the warranties Shelf Merch makes about the service and clarifies what we do not say the service will do.
              </p>
              <p className="text-sm leading-relaxed">
                The service and all materials and content available through the service are provided "as is" and on an "as available" basis. Shelf Merch disclaims all warranties of any kind, whether express or implied, relating to the service and all materials and content available through the service, including: (a) any implied warranty of merchantability, fitness for a particular purpose, title, quiet enjoyment, or non-infringement; and (b) any warranty arising out of course of dealing, usage, or trade. Shelf Merch does not warrant that the service or any portion of the service, or any materials or content offered through the service, will be uninterrupted, secure, or free of errors, viruses, or other harmful components, and Shelfmerch does not warrant that any of those issues will be corrected.
              </p>
              <p className="text-sm leading-relaxed mt-4">
                No advice or information, whether oral or written, obtained by you from the service or Shelf Merch entities or any materials or content available through the service will create any warranty regarding any of the Shelf Merch entities or the service that is not expressly stated in these terms. We are not responsible for any damage that may result from the service and your dealing with any other service user. You understand and agree that you use any portion of the service at your own discretion and risk, and that we are not responsible for any damage to your property (including your computer system or mobile device used in connection with the service) or any loss of data, including user content.
              </p>
              <p className="text-sm leading-relaxed mt-4">
                The limitations, exclusions and disclaimers in this section apply to the fullest extent permitted by law. Shelf Merch does not disclaim any warranty or other right that shelf Merch is prohibited from disclaiming under applicable law.
              </p>
            </section>

            <section id="liability" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">13. Limitation Of Liability</h2>
              <p className="text-sm leading-relaxed mb-4">
                This section limits Shelf Merch's liability for providing the service.
              </p>
              <p className="text-sm leading-relaxed">
                To the fullest extent permitted by law, in no event will the Shelf Merch entities be liable to you for any indirect, incidental, special, consequential or punitive damages (including damages for loss of profits, goodwill, or any other intangible loss) arising out of or relating to your access to or use of, or your inability to access or use, the service or any materials or content on the service, or any damage to or loss of any of your pre-made products, whether based on warranty, contract, tort (including negligence), statute, or any other legal theory, and whether or not any Shelf Merch entity has been informed of the possibility of damage.
              </p>
              <p className="text-sm leading-relaxed mt-4">
                Each provision of these terms that provides for a limitation of liability, a disclaimer of warranties, or the exclusion of damages is intended to allot the risks between the parties under these terms. This allocation is an essential element of the basis of the bargain between the parties. Each of these provisions is severable and independent of all other provisions of these terms. The limitations in this Section 18 will apply even if any limited remedy fails to fulfil its essential purpose.
              </p>
            </section>

            <section id="law" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">14. Applicable law and jurisdiction</h2>
              <p className="text-sm leading-relaxed">
                These terms of use are governed by and to be interpreted in accordance with the laws of India, without regard to the choice or conflicts of law provisions of any jurisdiction. You agree, in the event of any dispute arising in relation to these Terms of Use or any dispute arising in relation to the Platform, whether in contract, tort, or otherwise, to submit to the jurisdiction of the courts located in Hyderabad, India, for the resolution of all such disputes.
              </p>
            </section>

            <section id="notice" className="scroll-mt-20">
              <h2 className="text-2xl font-bold mb-4">15. Notice</h2>
              <p className="text-sm leading-relaxed mb-4">
                To give notice pursuant to this contract, a party must send written notice to the other party at the email address provided in the service. Notices to Shelfmerch must be sent by using the contact form provided in the service. Unless otherwise specified, notice is deemed to be received at the start of the next full business day (meaning 9:00 a.m. to 5:00 p.m. in the time zone of the recipient) after it is sent by electronic mail.
              </p>
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

export default TermsOfConditions;
