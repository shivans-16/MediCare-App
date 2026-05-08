export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#3B4FE4] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100">We are here to help. Reach out to us anytime.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              {[
                { icon: '📧', label: 'Email', value: 'support@medicare-plus.com', sub: 'For general inquiries and support' },
                { icon: '📞', label: 'Phone', value: '+91 1800-123-4567', sub: 'Mon–Sat, 9:00 AM – 6:00 PM IST' },
                { icon: '🏢', label: 'Office', value: 'MediCare+ Technologies Pvt. Ltd.', sub: '123, Tech Park, Bengaluru, Karnataka – 560001' },
                { icon: '🕐', label: 'Business Hours', value: 'Monday to Saturday', sub: '9:00 AM – 6:00 PM IST' },
              ].map((item) => (
                <div key={item.label} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="text-2xl shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                    <p className="font-semibold text-gray-900">{item.value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Departments */}
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
              <h3 className="font-bold text-gray-900 mb-4">Contact by Department</h3>
              <div className="space-y-3">
                {[
                  { dept: 'Patient Support', email: 'patients@medicare-plus.com' },
                  { dept: 'Doctor Onboarding', email: 'doctors@medicare-plus.com' },
                  { dept: 'Billing & Payments', email: 'billing@medicare-plus.com' },
                  { dept: 'Technical Issues', email: 'tech@medicare-plus.com' },
                ].map((d) => (
                  <div key={d.dept} className="flex justify-between text-sm">
                    <span className="text-gray-600">{d.dept}</span>
                    <span className="text-[#3B4FE4] font-medium">{d.email}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form — Static UI only */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#3B4FE4] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#3B4FE4] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#3B4FE4] focus:ring-2 focus:ring-blue-100 transition-all">
                  <option>General Inquiry</option>
                  <option>Appointment Issue</option>
                  <option>Payment & Billing</option>
                  <option>Technical Support</option>
                  <option>Doctor Onboarding</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={5}
                  placeholder="Describe your issue or question..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#3B4FE4] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
              <button className="w-full bg-[#3B4FE4] text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                Send Message
              </button>
              <p className="text-sm text-gray-500 text-center">We typically respond within 24 business hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}