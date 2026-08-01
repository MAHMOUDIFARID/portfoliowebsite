import React, { useState } from 'react';
import { 
  Code, 
  ShoppingBag, 
  Cpu, 
  Lightning, 
  Wrench, 
  ArrowRight, 
  CheckCircle, 
  Sparkle, 
  Globe, 
  Rocket,
  Compass,
  PencilRuler,
  TerminalWindow,
  ShieldCheck
} from '@phosphor-icons/react';

interface ServiceItem {
  id: string;
  num: string;
  title: string;
  tagline: string;
  description: string;
  icon: any;
  deliverables: string[];
  techStack: string[];
  highlightColor: string;
}

export default function ServicesReact() {
  const [activeTab, setActiveTab] = useState<string>('all');

  const services: ServiceItem[] = [
    {
      id: 'fullstack',
      num: '01',
      title: 'Full-Stack Web Development',
      tagline: 'Custom Single Page Applications, SaaS Platforms & Dynamic Portals',
      description: 'Architecting and building fast, responsive, and scalable web applications from scratch. Using modern frameworks like React, Next.js, Astro, and Node.js to create clean user interfaces powered by robust backend systems.',
      icon: Code,
      deliverables: [
        'Custom React / Next.js / Astro frontends',
        'RESTful & GraphQL API integration',
        'State management & real-time features',
        'Responsive, mobile-first design system',
        'Database design & ORM configuration'
      ],
      techStack: ['React', 'Next.js', 'Astro', 'TypeScript', 'Node.js', 'Tailwind CSS'],
      highlightColor: 'from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30'
    },
    {
      id: 'cms-ecomm',
      num: '02',
      title: 'CMS & E-Commerce Solutions',
      tagline: 'High-Converting Online Stores & Custom Content Portals',
      description: 'Building custom e-commerce stores and content management platforms tailored to your business operations. Expertise in Drupal 10, Headless setups, and custom e-commerce platforms with seamless payment and inventory integrations.',
      icon: ShoppingBag,
      deliverables: [
        'Custom Drupal 10 module & theme development',
        'Headless CMS & decoupled frontend setups',
        'E-commerce store architecture & checkout optimization',
        'Payment gateway & logistics API integrations',
        'Admin dashboards & content workflow automation'
      ],
      techStack: ['Drupal 10', 'PHP', 'Twig', 'Next.js', 'WooCommerce', 'MySQL'],
      highlightColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30'
    },
    {
      id: 'api-ai',
      num: '03',
      title: 'API Development & AI Integration',
      tagline: 'Custom Backends, Microservices & LLM Automations',
      description: 'Designing secure backend services, microservice architectures, and integrating modern AI capabilities (Gemini, OpenAI APIs) into existing workflows to automate complex business processes.',
      icon: Cpu,
      deliverables: [
        'Node.js / Express & Python backend services',
        'Gemini Live & OpenAI API integrations',
        'Webhooks, background workers & queue systems',
        'Authentication (JWT, OAuth, Firebase Auth)',
        'Database query optimization (PostgreSQL, MongoDB)'
      ],
      techStack: ['Python', 'Node.js', 'Hono', 'Gemini API', 'PostgreSQL', 'MongoDB'],
      highlightColor: 'from-purple-500/20 to-violet-500/20 text-purple-500 border-purple-500/30'
    },
    {
      id: 'performance-seo',
      num: '04',
      title: 'Performance & Technical SEO',
      tagline: 'Sub-Second Load Times & 95+ Core Web Vitals Audit',
      description: 'Optimizing existing web applications for maximum speed, search engine ranking, and accessibility. Eliminating render-blocking scripts, refactoring heavy bundles, and implementing SEO architecture.',
      icon: Lightning,
      deliverables: [
        'Google Lighthouse 95+ speed optimization',
        'Core Web Vitals diagnostic & refactoring',
        'Code splitting, lazy loading & image optimization',
        'Structured schema markup & technical SEO setup',
        'Accessibility (WCAG / a11y) compliance'
      ],
      techStack: ['Lighthouse', 'Astro SSG', 'Vite', 'Schema.org', 'Web Vitals'],
      highlightColor: 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30'
    },
    {
      id: 'maintenance-devops',
      num: '05',
      title: 'Code Modernization & Deployment',
      tagline: 'Legacy Migration, Cloud Deployment & Continuous Support',
      description: 'Refactoring outdated codebases to modern standards, migrating static sites to dynamic frameworks, and managing cloud deployments (cPanel, VPS, Vercel) with zero downtime.',
      icon: Wrench,
      deliverables: [
        'Legacy code audit & modern framework migration',
        'cPanel, VPS, Vercel & Netlify server deployment',
        'SSL certificate configuration & domain management',
        'Automated CI/CD pipeline setup',
        'Ongoing maintenance & bug fixes'
      ],
      techStack: ['Git', 'cPanel', 'Vercel', 'Docker', 'Linux', 'Apache/Nginx'],
      highlightColor: 'from-rose-500/20 to-pink-500/20 text-rose-500 border-rose-500/30'
    }
  ];

  const processSteps = [
    {
      step: '01',
      phase: 'PHASE 01',
      title: 'Discovery & Scope',
      desc: 'Analyzing your business goals, target audience, technical requirements, and defining a clear project roadmap.',
      icon: Compass,
      accent: 'from-blue-500 to-indigo-600',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    },
    {
      step: '02',
      phase: 'PHASE 02',
      title: 'Architecture & Design',
      desc: 'Crafting responsive UI layouts, planning database schemas, and selecting the optimal technology stack.',
      icon: PencilRuler,
      accent: 'from-purple-500 to-indigo-600',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    },
    {
      step: '03',
      phase: 'PHASE 03',
      title: 'Agile Development',
      desc: 'Writing clean, typed, modular code with frequent milestone previews and continuous feedback integration.',
      icon: TerminalWindow,
      accent: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      step: '04',
      phase: 'PHASE 04',
      title: 'Optimization & Testing',
      desc: 'Running rigorous performance audits, cross-browser compatibility tests, and security checks.',
      icon: ShieldCheck,
      accent: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      step: '05',
      phase: 'PHASE 05',
      title: 'Launch & Support',
      desc: 'Zero-downtime production deployment, documentation handover, and ongoing technical support.',
      icon: Rocket,
      accent: 'from-rose-500 to-pink-600',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    }
  ];

  return (
    <div className="relative min-h-screen bg-transparent pt-32 pb-32">
      <div className="section-container max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-6 leading-[1.1]">
            High-Performance <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Web Solutions</span> Tailored to Scale.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-white/70 font-light leading-relaxed mb-8">
            I build clean, reliable web applications and custom websites. Whether you need a full-stack web app, a CMS portal, or performance optimization, I handle the engineering from code to deployment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs sm:text-sm uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-xl cursor-pointer"
            >
              <span>Discuss Your Project</span>
              <ArrowRight size={16} weight="bold" />
            </a>

            <a 
              href="#services-list"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-neutral-200 dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              <span>Explore Services</span>
            </a>
          </div>
        </div>

        {/* Services List Section */}
        <div id="services-list" className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-neutral-200 dark:border-white/10 pb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
                What I Provide
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                Comprehensive web development services designed for performance, security, and growth.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {['all', 'fullstack', 'cms-ecomm', 'api-ai', 'performance-seo'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer capitalize ${
                    activeTab === tab
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md'
                      : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'cms-ecomm' ? 'CMS & E-Commerce' : tab === 'api-ai' ? 'APIs & AI' : tab === 'performance-seo' ? 'Performance' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services
              .filter(s => activeTab === 'all' || s.id === activeTab)
              .map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.id}
                    className="group bg-white dark:bg-[#18181c] border border-neutral-200 dark:border-white/10 rounded-[32px] p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Top Header Row */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${service.highlightColor} border shadow-inner`}>
                          <IconComponent size={28} weight="bold" />
                        </div>
                        <span className="text-3xl font-extrabold text-neutral-300 dark:text-neutral-700 font-mono">
                          {service.num}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
                        {service.title}
                      </h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-4">
                        {service.tagline}
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 font-normal">
                        {service.description}
                      </p>

                      {/* Key Deliverables */}
                      <div className="mb-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                          Key Deliverables:
                        </h4>
                        <ul className="space-y-2.5">
                          {service.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                              <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Tech Stack Tags & Action Link */}
                    <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-4">
                      <div className="flex flex-wrap gap-1.5">
                        {service.techStack.map((tech) => (
                          <span 
                            key={tech}
                            className="px-3 py-1 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <a
                        href="/contact"
                        className="inline-flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pt-2"
                      >
                        <span>Request Service</span>
                        <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                          <ArrowRight size={14} />
                        </div>
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Development Process Steps - Exact Minimalist Line & Number Design */}
        <div className="mb-28">
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
              How We Build Together
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-normal">
              A simple 5-step engineering process focused on clarity and code quality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {processSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                {/* Number & Horizontal Line Connector */}
                <div className="flex items-center gap-4">
                  <span className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white leading-none font-sans">
                    {idx + 1}
                  </span>
                  {idx < processSteps.length - 1 && (
                    <div className="hidden lg:block flex-1 h-[1px] bg-neutral-300 dark:bg-neutral-800"></div>
                  )}
                </div>

                {/* Text Description matching reference */}
                <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
                  <span className="font-bold text-neutral-900 dark:text-white block mb-1 text-sm sm:text-base">
                    {step.title}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {step.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple & Clean Call to Action */}
        <div className="rounded-[2.5rem] bg-brand-charcoal border border-black/10 dark:border-white/10 p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-2xl text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Have a web project in mind?
            </h2>
            <p className="text-sm text-white/70 font-light leading-relaxed">
              Whether you need a custom React web app, a high-converting Drupal CMS portal, or speed optimization for your existing site, let's build something extraordinary.
            </p>
          </div>

          <a
            href="/contact"
            className="group shrink-0 bg-white text-black font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-full hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>Let's talk</span>
            <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </div>
  );
}
