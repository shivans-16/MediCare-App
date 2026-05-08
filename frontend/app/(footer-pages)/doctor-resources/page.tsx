import Link from 'next/link';

export default function DoctorResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#3B4FE4] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Doctor Resources</h1>
          <p className="text-xl text-blue-100">Everything you need to deliver the best care on MediCare+.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Getting Started */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Complete Your Profile', desc: 'Add your specialization, qualifications, experience, and a professional photo to build patient trust.' },
              { step: '02', title: 'Set Your Availability', desc: 'Define your working hours and available slots. Patients can only book within your set availability.' },
              { step: '03', title: 'Set Your Consultation Fees', desc: 'You have full control over your consultation pricing for both video and voice consultations.' },
              { step: '04', title: 'Start Consulting', desc: 'Accept appointments and consult with patients via our secure, high-quality video and voice platform.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 p-5 border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="text-3xl font-bold text-[#3B4FE4] opacity-30 shrink-0 w-10">{item.step}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Practices for Online Consultations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '💡', title: 'Good Lighting', desc: 'Ensure your face is well-lit. Natural light from a window works best.' },
              { icon: '🎙️', title: 'Clear Audio', desc: 'Use a headset or earphones to minimize background noise during calls.' },
              { icon: '🌐', title: 'Stable Internet', desc: 'Use a wired connection or strong WiFi. Minimum 5 Mbps recommended.' },
              { icon: '🖥️', title: 'Distraction-Free', desc: 'Choose a quiet, professional background for all your consultations.' },
              { icon: '📋', title: 'Be Prepared', desc: 'Review the patient\'s symptoms and medical history before the call.' },
              { icon: '⏱️', title: 'Respect Time', desc: 'Join on time. Punctuality builds patient trust and satisfaction.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings */}
        <div className="mb-16 bg-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Earnings & Payouts</h2>
          <div className="space-y-3 text-gray-600">
            <p>✅ You keep <strong className="text-gray-900">85%</strong> of every consultation fee. MediCare+ takes a 15% platform fee.</p>
            <p>✅ Payouts are processed <strong className="text-gray-900">every Monday</strong> for the previous week's consultations.</p>
            <p>✅ Payments are transferred directly to your registered bank account.</p>
            <p>✅ You can track all your earnings in real-time from your doctor dashboard.</p>
          </div>
        </div>

        {/* Support */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Doctor Support</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '📧', title: 'Dedicated Email', value: 'doctors@medicare-plus.com' },
              { icon: '📞', title: 'Priority Helpline', value: '+91 1800-123-4568' },
            ].map((item) => (
              <div key={item.title} className="border border-gray-200 rounded-xl p-5 text-center hover:border-blue-300 transition-colors">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-[#3B4FE4] font-medium mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#3B4FE4] rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to join MediCare+?</h2>
          <p className="text-blue-100 mb-6">Start consulting patients online and grow your practice.</p>
          <Link href="/doctor/register" className="bg-white text-[#3B4FE4] font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors inline-block">
            Join as a Doctor
          </Link>
        </div>
      </div>
    </div>
  );
}