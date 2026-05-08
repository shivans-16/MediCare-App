export default function PrivacyPolicyPage() {
  const lastUpdated = 'May 8, 2026';

  const sections = [
    {
      title: '1. Information We Collect',
      content: [
        'Personal identification information (name, email address, phone number, date of birth)',
        'Medical information you voluntarily provide (symptoms, medical history, prescriptions)',
        'Payment information processed securely through Razorpay (we do not store card details)',
        'Device and usage data (IP address, browser type, pages visited) for analytics',
        'Communication data from consultations (chat messages, consultation notes)',
      ]
    },
    {
      title: '2. How We Use Your Information',
      content: [
        'To provide and improve our telemedicine services',
        'To match patients with appropriate healthcare professionals',
        'To process payments and manage billing',
        'To send appointment reminders and important service updates',
        'To comply with legal and regulatory requirements',
        'To ensure the security and integrity of our platform',
      ]
    },
    {
      title: '3. Data Sharing & Disclosure',
      content: [
        'We do NOT sell your personal or medical data to third parties',
        'Your health information is only shared with the doctor you consult',
        'Payment data is shared with Razorpay solely to process transactions',
        'We may disclose information when required by law or valid legal process',
        'Aggregated, anonymized data may be used for research and analytics',
      ]
    },
    {
      title: '4. Data Security',
      content: [
        'All data is encrypted in transit using TLS 1.2+ protocols',
        'Medical records are stored with AES-256 encryption at rest',
        'Access to personal data is strictly role-based and audited',
        'We conduct regular security audits and vulnerability assessments',
        'In the event of a data breach, we will notify affected users within 72 hours',
      ]
    },
    {
      title: '5. Your Rights',
      content: [
        'Right to access: Request a copy of all personal data we hold about you',
        'Right to correction: Update inaccurate or incomplete information',
        'Right to deletion: Request deletion of your account and associated data',
        'Right to portability: Receive your data in a structured, machine-readable format',
        'Right to restrict processing: Limit how we use your data in certain circumstances',
      ]
    },
    {
      title: '6. Cookies & Tracking',
      content: [
        'We use essential cookies to maintain your session and authenticate you',
        'Analytics cookies help us understand how users interact with our platform',
        'You can disable non-essential cookies through your browser settings',
        'We do not use third-party advertising cookies or tracking pixels',
      ]
    },
    {
      title: '7. Children\'s Privacy',
      content: [
        'MediCare+ is not intended for use by children under the age of 13',
        'We do not knowingly collect data from children under 13',
        'If we become aware of such data collection, we will delete it immediately',
      ]
    },
    {
      title: '8. Changes to This Policy',
      content: [
        'We may update this Privacy Policy periodically to reflect changes in our practices',
        'We will notify users of significant changes via email or in-app notification',
        'Continued use of MediCare+ after changes constitutes acceptance of the updated policy',
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#3B4FE4] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-blue-100">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Intro */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-10">
          <p className="text-gray-700 leading-relaxed">
            At MediCare+, your privacy is our priority. This Privacy Policy explains how we collect, use, store, 
            and protect your personal and medical information when you use our platform. By using MediCare+, 
            you agree to the practices described in this policy.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="flex gap-3 text-gray-600">
                    <span className="text-[#3B4FE4] mt-1 shrink-0">•</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Our Privacy Team</h2>
          <p className="text-gray-600">
            For any privacy-related questions or to exercise your rights, contact us at{' '}
            <span className="text-[#3B4FE4] font-medium">privacy@medicare-plus.com</span>{' '}
            or write to us at MediCare+ Technologies Pvt. Ltd., 123 Tech Park, Bengaluru – 560001.
          </p>
        </div>
      </div>
    </div>
  );
}