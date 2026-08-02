import { useState } from 'react';
import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  PaperPlaneRightIcon
} from '@phosphor-icons/react';

const CONTACT_EMAIL = 'contact@mahmoudi.ma';

export default function ContactReact() {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('subject') || 'Project inquiry').trim();
    const message = String(formData.get('message') || '').trim();

    if (!firstName || !email || !message) {
      setStatus('Please add your name, email, and message before sending.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Direct native submission to /api/contact.php (Official cPanel Server Handler)
      const response = await fetch('/api/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: email,
          subject: subject,
          message: message
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setStatus('Thank you! Your message has been sent successfully.');
        form.reset();
      } else {
        setStatus(data.message || 'Something went wrong. Please try again or email contact@mahmoudi.ma directly.');
      }
    } catch {
      setStatus('Something went wrong. Please try again or email contact@mahmoudi.ma directly.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-transparent pt-40 pb-32 min-h-screen flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute -bottom-[40%] md:-bottom-[60%] left-1/2 -translate-x-1/2 w-[200%] md:w-[150%] h-[100%] border-t border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent rounded-[100%] pointer-events-none blur-[2px]"></div>

      <div className="w-full max-w-3xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="text-center mb-16 w-full">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
            Let's have a chat <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-base md:text-lg text-white/50 max-w-lg mx-auto leading-relaxed font-medium">
            Send a project note or contact me directly by{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white transition-colors"
            >
              email
            </a>
            .
          </p>
        </div>

        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-sm font-medium text-white/70 ml-1">First name</label>
              <input
                required
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Your first name"
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl py-3 px-4 text-white placeholder-white/25 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-sm font-medium text-white/70 ml-1">Last name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Your last name"
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl py-3 px-4 text-white placeholder-white/25 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-white/70 ml-1">Email</label>
              <input
                required
                type="email"
                name="email"
                id="email"
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl py-3 px-4 text-white placeholder-white/25 focus:outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="subject" className="text-sm font-medium text-white/70 ml-1">Subject</label>
              <input
                type="text"
                name="subject"
                id="subject"
                placeholder="How can I help?"
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl py-3 px-4 text-white placeholder-white/25 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-medium text-white/70 ml-1">Message</label>
            <textarea
              required
              name="message"
              id="message"
              placeholder="Write your message here..."
              rows={5}
              className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl py-3 px-4 text-white placeholder-white/25 focus:outline-none transition-all resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-brand-black font-semibold py-4 rounded-xl transition-all duration-300 mt-2 hover:bg-white/90 inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Sending...</span>
            ) : isSuccess ? (
              <span>Message Sent!</span>
            ) : (
              <>
                <span>Send message</span>
                <PaperPlaneRightIcon weight="fill" />
              </>
            )}
          </button>

          {status && (
            <p className="text-sm text-white/60 text-center" role="status">
              {status}
            </p>
          )}
        </form>

        <div className="mt-12 flex items-center justify-center gap-5">
          <a
            href="https://github.com/MAHMOUDIFARID"
            aria-label="GitHub profile"
            className="text-white/60 hover:text-white transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            <GithubLogoIcon size={26} weight="fill" />
          </a>
          <a
            href="https://www.linkedin.com/in/faridmahmoudi/"
            aria-label="LinkedIn profile"
            className="text-white/60 hover:text-white transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedinLogoIcon size={26} weight="fill" />
          </a>
        </div>
      </div>
    </div>
  );
}
