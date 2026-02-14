import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '../components/Button';

interface FAQItem {
  question: string;
  answer: string;
}

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "How do I cancel or modify my booking?",
      answer: "You can cancel or modify your booking through your account dashboard up to 24 hours before your journey. Log in, go to 'My Bookings', select the trip, and choose 'Modify' or 'Cancel'. For cancellations made more than 48 hours before departure, you'll receive a full refund minus a small processing fee. Modifications can be made without any extra charges if done within the allowed timeframe."
    },
    {
      question: "What is your refund policy?",
      answer: "We offer a flexible refund policy: Full refund if cancelled 48+ hours before departure (minus 2% processing fee), 50% refund if cancelled 24-48 hours before departure, No refund if cancelled within 24 hours of departure. Refunds are processed within 5-7 business days to your original payment method. For special circumstances, please contact our customer support team."
    },
    {
      question: "Can I choose my seat during booking?",
      answer: "Yes! During the booking process, you'll see an interactive seat map of your coach. You can select your preferred seat(s) from available options. Lower deck and upper deck seats are available, with single sleeper and double sleeper configurations. Premium seats with extra legroom are also available at a nominal additional cost. Seat selection is included in your booking at no extra charge."
    },
    {
      question: "What amenities are available onboard?",
      answer: "Our premium fleet includes: Free Wi-Fi on all routes, USB charging ports at every seat, Complimentary water and snacks, Blankets and pillows for your comfort, LED entertainment screens, Air-conditioned cabins, Spacious reclining seats, Onboard restroom facilities, First aid and safety equipment. Our Bharat Benz and Volvo coaches are regularly sanitized and maintained to the highest standards for your safety and comfort."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Get In Touch</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Have questions or need assistance? We're here to help 24/7. Reach out to us anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <a 
            href="tel:+919107168168"
            className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer"
          >
            <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all">
              <Phone className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Phone Support</h3>
            <p className="text-slate-300 mb-4">Speak directly with our support team</p>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 hover:text-amber-300 font-semibold">
                +91 91071 68168
              </span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-slate-400 text-sm mt-2">Available 24/7</p>
          </a>

          <a 
            href="mailto:support@hashbus.in"
            className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer"
          >
            <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-all">
              <Mail className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Email Us</h3>
            <p className="text-slate-300 mb-4">Send us a detailed message</p>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 hover:text-amber-300 font-semibold">
                support@hashbus.in
              </span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-slate-400 text-sm mt-2">Response within 2 hours</p>
          </a>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/20">
            <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Visit Us</h3>
            <p className="text-slate-300 mb-4">Our headquarters</p>
            <p className="text-amber-400 font-semibold">
              MG Road, Bengaluru<br />
              Karnataka 560001
            </p>
            <p className="text-slate-400 text-sm mt-2">Mon-Sat: 9 AM - 6 PM</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-white mb-6">Send Us a Message</h2>

            {submitted ? (
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/50 rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/30 rounded-full mb-4 animate-pulse">
                  <Send className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-300">
                  Thank you for reaching out. We'll get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="What can we help you with?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="group w-full relative px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </form>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Office Hours</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-amber-500 mt-1" />
                  <div>
                    <p className="text-white font-semibold mb-1">Customer Support</p>
                    <p className="text-slate-300">24/7 Available</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-amber-500 mt-1" />
                  <div>
                    <p className="text-white font-semibold mb-1">Office Hours</p>
                    <p className="text-slate-300">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-slate-400 text-sm">Closed on Sundays and Public Holidays</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl p-8 hover:border-amber-500/60 transition-all hover:shadow-lg hover:shadow-amber-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">Quick Response</h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                Our dedicated support team is committed to responding to all inquiries within 2 hours
                during office hours and 4 hours during off-hours. For urgent matters, please call our
                24/7 helpline.
              </p>
              
              <a
                href="tel:+919107168168"
                className="group relative inline-flex w-full items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 via-amber-550 to-amber-600 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/50 hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-2 w-full">
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Call Now: +91 91071 68168</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            </div>

            {/* ✅ Modern Expandable FAQ Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked</h3>
              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-slate-700 rounded-lg overflow-hidden hover:border-amber-500/50 transition-all"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-slate-900/50 hover:bg-slate-900 transition-colors group"
                    >
                      <span className="text-left text-slate-300 font-medium group-hover:text-amber-400 transition-colors">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-amber-500 transition-transform duration-300 flex-shrink-0 ml-4 ${
                          expandedFAQ === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-5 py-4 bg-slate-950/50 border-t border-slate-700 text-slate-300 leading-relaxed animate-in fade-in">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};