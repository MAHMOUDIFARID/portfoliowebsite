import React, { useState } from 'react';
import { 
  Code, 
  Cpu, 
  Lightning, 
  ArrowRight, 
  CheckCircle, 
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
  const services: ServiceItem[] = [
    {
      id: 'fullstack',
      num: '01',
      title: 'Full-Stack Web Development',
      tagline: 'Custom Web Apps, Portals & High-Converting Websites',
      description: 'Architecting and building fast, responsive, and scalable web applications from scratch tailored to your business needs.',
      icon: Code,
      deliverables: [
        'Custom Web Applications',
        'E-Commerce & Portals',
        'Responsive Mobile UI',
        'Ultra-Fast Page Load Speeds',
        'Secure Admin Dashboards'
      ],
      techStack: [],
      highlightColor: 'from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30'
    },
    {
      id: 'automation',
      num: '02',
      title: 'Workflow & Process Automation',
      tagline: 'Eliminating manual tasks and connecting your software tools',
      description: 'Automating repetitive business operations, connecting app ecosystems, and syncing data seamlessly across your software tools.',
      icon: Lightning,
      deliverables: [
        'Automated Data Pipelines',
        'CRM & Tool Integration',
        'Custom Webhook Triggers',
        'Zero Manual Data Entry',
        'Real-Time App Syncing'
      ],
      techStack: [],
      highlightColor: 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30'
    },
    {
      id: 'ai-integration',
      num: '03',
      title: 'AI Integrations & Agents',
      tagline: 'Empowering your platform with artificial intelligence',
      description: 'Integrating custom AI chatbots, automated document processing, and intelligent AI agents directly into your web applications.',
      icon: Cpu,
      deliverables: [
        'Custom AI Chatbots & RAG',
        'Gemini & OpenAI APIs',
        'Smart Business Assistants',
        'Automated Content Gen',
        'Document & Text Analysis'
      ],
      techStack: [],
      highlightColor: 'from-purple-500/20 to-violet-500/20 text-purple-500 border-purple-500/30'
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

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-6">
            Services
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-white/70 font-light leading-relaxed">
            I engineer high-performance web applications, automated workflows, and AI solutions, taking your ideas seamlessly from concept to production deployment.
          </p>
        </div>

        {/* Services List Section */}
        <div id="services-list" className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              What I Provide
            </h2>
          </div>

          {/* Cards Grid - Hand-Drawn Pencil Sketch Design ("Mrssom Blyed Bl9alam") */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service) => {
              return (
                <div
                  key={service.id}
                  className="bg-brand-charcoal border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl flex flex-col group/card relative"
                >
                  {/* Top half: Hand-Drawn Pencil Sketch Banner */}
                  <div className="relative w-full h-[220px] overflow-hidden shrink-0 bg-neutral-950">
                    <img
                      src={service.id === 'fullstack' ? '/service_fullstack.png' : service.id === 'automation' ? '/service_automation.png' : '/service_ai.png'}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 opacity-90"
                    />
                    {/* Dark gradient fade overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-transparent to-black/20 pointer-events-none"></div>
                  </div>

                  {/* Bottom half: Info & Action Button */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-sm text-white/50 mb-6 leading-relaxed font-light">
                        {service.description}
                      </p>
                    </div>

                    <div>
                      {/* Deliverables List */}
                      <ul className="space-y-2.5 mb-8">
                        {service.deliverables.map((item) => (
                          <li key={item} className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-300 font-normal">
                            <CheckCircle size={16} className="text-emerald-400 shrink-0" weight="fill" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Call to Action Button */}
                      <a
                        href="/contact"
                        className="group/btn w-full py-3.5 px-6 rounded-2xl bg-neutral-900 dark:bg-white/[0.05] border border-neutral-800 dark:border-white/10 hover:bg-neutral-800 dark:hover:bg-white/10 font-medium text-sm transition-all duration-300 flex items-center justify-between"
                      >
                        <span className="text-[#ffffff]">Discuss Service</span>
                        <div className="w-7 h-7 rounded-full bg-neutral-800 dark:bg-white/10 text-white flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                          <ArrowRight size={14} weight="bold" />
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Development Process Steps - Exact Minimalist Line & Number Design */}
        <div className="mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
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
        <div className="rounded-[2.5rem] bg-brand-charcoal border border-neutral-200 dark:border-white/10 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="max-w-2xl text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
              Have a project in mind?
            </h2>
            <p className="text-sm text-neutral-600 dark:text-white/70 font-light leading-relaxed">
              Whether you need a custom full-stack web application, automated business workflows, or smart AI integrations, let's build something extraordinary together.
            </p>
          </div>

          <a
            href="/contact"
            className="group shrink-0 font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-full transition-all cursor-pointer flex items-center gap-2 shadow-md hover:opacity-90"
            style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}
          >
            <span style={{ color: '#FFFFFF' }}>Let's talk</span>
            <span className="text-base group-hover:scale-110 transition-transform">💬</span>
          </a>
        </div>

      </div>
    </div>
  );
}
