import Link from 'next/link';

const faqs = [
  {
    category: 'Appointments',
    items: [
      { q: 'How do I book an appointment?', a: 'Go to Find Doctors, select a doctor, choose your preferred slot and consultation type, then complete the payment to confirm your booking.' },
      { q: 'Can I cancel or reschedule my appointment?', a: 'Yes, you can cancel your appointment from your dashboard up to 2 hours before the scheduled time. Rescheduling can be done by cancelling and re-booking.' },
      { q: 'What happens if the doctor is unavailable?', a: 'In the rare case a doctor is unavailable, you will receive a full refund and a notification to rebook at your convenience.' },
    ]
  },
  {
    category: 'Payments & Refunds',
    items: [
      { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets via our secure Razorpay integration.' },
      { q: 'How long does a refund take?', a: 'Refunds are processed within 5–7 business days to your original payment method.' },
      { q: 'Is my payment information secure?', a: 'Yes. All payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We never store your card details.' },
    ]
  },
  {
    category: 'Video Consultations',
    items: [
      { q: 'What do I need for a video consultation?', a: 'A stable internet connection, a working camera and microphone, and a modern browser (Chrome recommended).' },
      { q: 'What if I face technical issues during the call?', a: 'Try refreshing the page or rejoining the room. If the issue persists, contact our support team immediately.' },
      { q: 'Are consultations recorded?', a: 'No. Consultations are completely private and are not recorded by MediCare+.' },
    ]
  },
  {
    category: 'Account & Privacy',
    items: [
      { q: 'How do I update my profile?', a: 'Go to your dashboard and click on Profile Settings to update your personal and medical information.' },
      { q: 'How is my health data protected?', a: 'All your health data is encrypted and stored securely. We follow strict privacy guidelines and never share your data with third parties.' },
      { q: 'How do I delete my account?', a: 'To request account deletion, please contact our support team at support@medicare-plus.com.' },
    ]
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#3B4FE4] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Support Center</h1>
          <p className="text-xl text-blue-100">Find answers to common questions or reach out to us.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '📧', title: 'Email Support', desc: 'support@medicare-plus.com', sub: 'Response within 24 hours' },
            { icon: '📞', title: 'Phone Support', desc: '+91 1800-123-4567', sub: 'Mon–Sat, 9am–6pm IST' },
            { icon: '💬', title: 'Live Chat', desc: 'Available on Dashboard', sub: 'For logged-in users' },
          ].map((c) => (
            <div key={c.title} className="border border-gray-200 rounded-2xl p-6 text-center hover:border-blue-300 hover:shadow-md transition-all">
              <div className="text-4xl mb-3">{c.icon}</div>
              <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
              <p className="text-[#3B4FE4] font-medium mt-1">{c.desc}</p>
              <p className="text-gray-500 text-sm mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h3 className="text-xl font-bold text-[#3B4FE4] mb-4 pb-2 border-b border-blue-100">{section.category}</h3>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.q} className="bg-gray-50 rounded-xl p-5">
                    <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                    <p className="text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still need help?</h2>
          <p className="text-gray-600 mb-6">Our support team is ready to assist you with any issue.</p>
          <Link href="/contact" className="bg-[#3B4FE4] text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors inline-block">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}