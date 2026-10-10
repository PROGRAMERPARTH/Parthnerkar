/* ============================================
   Contact Section — Contact form + social links
   ============================================ */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IoMailOutline,
  IoPersonOutline,
  IoChatbubbleOutline,
  IoSendOutline,
  IoLogoGithub,
  IoLogoLinkedin,
  IoLocationOutline,
  IoCallOutline,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import SectionWrapper from '../components/SectionWrapper';
import { useTheme } from '../context/ThemeContext';

const SOCIALS = [
  { icon: <IoLogoGithub size={22} />, label: 'GitHub', url: 'https://github.com/PROGRAMERPARTH' },
  { icon: <IoLogoLinkedin size={22} />, label: 'LinkedIn', url: 'https://www.linkedin.com/in/parth-nerkar-2009ab315/' },
];

const EMPTY_FORM = { name: '', email: '', message: '' };

export default function ContactSection() {
  const { isDark } = useTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSending(true);
    const subject = encodeURIComponent(`Portfolio enquiry from ${form.name.trim()}`);
    const body = encodeURIComponent(`Name: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`);
    window.location.href = `mailto:nerkarparth06@gmail.com?subject=${subject}&body=${body}`;
    toast.success('Your email app has been opened with a draft.');
    setForm(EMPTY_FORM);
    setSending(false);
  };

  const inputClasses = `w-full px-4 py-3 rounded-xl outline-none transition-all ${
    isDark
      ? 'bg-white/5 border border-white/10 text-white focus:border-primary-500 placeholder:text-surface-200/30'
      : 'bg-surface-50 border border-surface-200 text-surface-800 focus:border-primary-500 placeholder:text-surface-700/40'
  }`;

  return (
    <SectionWrapper id="contact" title="Get In Touch" subtitle="Have a question or want to work together? Drop me a message.">
      <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        {/* Contact form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-5"
        >
          {/* Name */}
          <div className="relative">
            <IoPersonOutline
              className={`absolute left-3.5 top-3.5 ${isDark ? 'text-surface-200/40' : 'text-surface-700/40'}`}
              size={18}
            />
            <input
              type="text"
              aria-label="Your name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your Name"
              className={`${inputClasses} pl-10`}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <IoMailOutline
              className={`absolute left-3.5 top-3.5 ${isDark ? 'text-surface-200/40' : 'text-surface-700/40'}`}
              size={18}
            />
            <input
              type="email"
              aria-label="Your email address"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className={`${inputClasses} pl-10`}
            />
          </div>

          {/* Message */}
          <div className="relative">
            <IoChatbubbleOutline
              className={`absolute left-3.5 top-3.5 ${isDark ? 'text-surface-200/40' : 'text-surface-700/40'}`}
              size={18}
            />
            <textarea
              rows={5}
              aria-label="Your message"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Your message…"
              className={`${inputClasses} pl-10 resize-none`}
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={sending}
            whileHover={{ scale: sending ? 1 : 1.02 }}
            whileTap={{ scale: sending ? 1 : 0.98 }}
            className={`w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              sending ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {sending ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <IoSendOutline size={18} />
                Open Email Draft
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Info + Socials */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <div className={`rounded-2xl p-8 ${
            isDark
              ? 'bg-white/5 border border-white/5'
              : 'bg-white border border-surface-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-surface-800'}`}>
              Let's Connect
            </h3>
            <p className={`text-sm mb-6 leading-relaxed ${
              isDark ? 'text-surface-200/60' : 'text-surface-700/60'
            }`}>
              I'm always open to new opportunities, collaborations, and interesting conversations.
              Feel free to reach out!
            </p>

            {/* Contact details */}
            <div className="space-y-3 mb-6">
              <a
                href="mailto:nerkarparth06@gmail.com"
                className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                  isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-500'
                }`}
              >
                <IoMailOutline size={18} />
                nerkarparth06@gmail.com
              </a>
              <div className={`flex items-center gap-2 text-sm ${
                isDark ? 'text-surface-200/60' : 'text-surface-700/60'
              }`}>
                <IoCallOutline size={18} />
                +91 7249655250
              </div>
              <div className={`flex items-center gap-2 text-sm ${
                isDark ? 'text-surface-200/60' : 'text-surface-700/60'
              }`}>
                <IoLocationOutline size={18} />
                Pune, India
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isDark
                      ? 'bg-white/8 hover:bg-primary-500/20 text-surface-200 hover:text-primary-400'
                      : 'bg-surface-100 hover:bg-primary-50 text-surface-600 hover:text-primary-600'
                  }`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
