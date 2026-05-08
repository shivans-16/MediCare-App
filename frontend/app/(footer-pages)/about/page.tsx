import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#3B4FE4] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About MediCare+</h1>
          <p className="text-xl text-blue-100">Connecting patients with trusted doctors, anytime, anywhere.</p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              MediCare+ was founded with a simple but powerful goal — to make quality healthcare accessible to everyone. 
              We believe that geography, time, and convenience should never be a barrier to getting the medical attention you deserve.
            </p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-8">
            <div className="text-5xl font-bold text-[#3B4FE4] mb-2">10,000+</div>
            <div className="text-gray-600 font-medium">Consultations completed</div>
            <div className="text-5xl font-bold text-[#3B4FE4] mt-6 mb-2">500+</div>
            <div className="text-gray-600 font-medium">Verified doctors</div>
            <div className="text-5xl font-bold text-[#3B4FE4] mt-6 mb-2">50+</div>
            <div className="text-gray-600 font-medium">Specializations covered</div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🩺', title: 'Patient First', desc: 'Every decision we make starts with what is best for the patient.' },
              { icon: '🔒', title: 'Trust & Privacy', desc: 'Your health data is sacred. We protect it with the highest standards.' },
              { icon: '⚡', title: 'Accessibility', desc: 'Quality healthcare should be available to everyone, everywhere.' },
            ].map((v) => (
              <div key={v.title} className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How MediCare+ Works</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Create an Account', desc: 'Sign up as a patient in minutes. No paperwork, no hassle.' },
              { step: '02', title: 'Find Your Doctor', desc: 'Browse verified doctors by specialization, availability, and ratings.' },
              { step: '03', title: 'Book a Slot', desc: 'Choose a time that works for you and book your consultation instantly.' },
              { step: '04', title: 'Consult Online', desc: 'Meet your doctor via video or voice call from the comfort of your home.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start p-6 border border-gray-100 rounded-2xl hover:border-blue-200 transition-colors">
                <div className="text-3xl font-bold text-[#3B4FE4] opacity-30 shrink-0">{item.step}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#3B4FE4] rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-blue-100 mb-6">Join thousands of patients who trust MediCare+ for their healthcare needs.</p>
          <Link href="/patient/register" className="bg-white text-[#3B4FE4] font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors inline-block">
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}