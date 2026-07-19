import {
  CalendarBlankIcon,
  MapPinIcon,
  LaptopIcon,
  BuildingsIcon
} from '@phosphor-icons/react';

const experiences = [
  {
    id: 1,
    title: "Machine Learning Engineer Intern (AIOps)",
    company: "Intra Infrastructures Services",
    type: "Internship",
    date: "Jan 2026 - Jun 2026",
    duration: "6 months",
    location: "Casablanca, Morocco",
    workMode: "On-site",
    description: [
      "Engineered an automated Root Cause Analysis (RCA) machine learning system that reduced microservice incident resolution time (MTTR) by 60%, significantly improving operational efficiency.",
      "Processed millions of unstructured server logs in real-time using the Drain3 parsing algorithm, extracting dynamic features to enhance downstream anomaly detection models.",
      "Deployed an Isolation Forest-based anomaly detection framework to proactively identify and trace system failures across distributed infrastructure components, enabling faster incident response."
    ],
    skills: ["Machine Learning", "AIOps", "Anomaly Detection", "Log Analysis", "Drain3", "Isolation Forest", "Root Cause Analysis"],
    logo: "",
    logoAlt: "Intra Infrastructures Services logo"
  },
  {
    id: 2,
    title: "Full Stack Developer Intern",
    company: "Marocdesmerveilles",
    type: "Internship",
    date: "Jun 2025 - Oct 2025",
    duration: "5 months",
    location: "Kelaat Mgouna, Morocco",
    workMode: "Remote",
    description: [
      "Optimized and maintained the marocdesmerveilles.com web platform while balancing full-time studies, ensuring consistent performance and reliability.",
      "Redesigned the user interface and enhanced user experience (UX), resolving critical functional issues and improving site navigation.",
      "Structured and organized a comprehensive database for tourism-related content, improving data accessibility and content management efficiency."
    ],
    skills: ["Full Stack Development", "Web Optimization", "UI/UX", "Database Management", "Drupal", "PHP"],
    logo: "/logos/Marocdesmerveilles.png",
    logoAlt: "Marocdesmerveilles logo"
  },
  {
    id: 3,
    title: "No-Code Developer",
    company: "Voilà.partners",
    type: "Internship",
    date: "Sep 2024 - Dec 2024",
    duration: "4 months",
    location: "Brussels, Belgium",
    workMode: "Remote",
    description: [
      "Architected a custom Low-Code CRM system for tracking elected officials, mandates, and stakeholder engagement activities, streamlining political relationship management.",
      "Designed and implemented a scalable Airtable database structure with collaborative interfaces, enhancing operational tracking and team coordination.",
      "Automated complex workflows using Make (Integromat) and Airtable Automations, significantly reducing manual data entry and improving operational efficiency by 70%."
    ],
    skills: ["Low-Code/No-Code", "CRM Systems", "Airtable", "Make (Integromat)", "Workflow Automation", "Process Optimization"],
    logo: "/logos/voila-partners.png",
    logoAlt: "Voilà.partners logo"
  },
  {
    id: 4,
    title: "Full Stack Developer Intern",
    company: "Norsys Afrique",
    type: "Internship",
    date: "Nov 2023 - Dec 2023",
    duration: "2 months",
    location: "Marrakech, Morocco",
    workMode: "Hybrid",
    description: [
      "Developed a comprehensive solidarity web platform using Drupal and PHP for the Abbed Association, digitizing healthcare management for diabetic children and streamlining administrative processes.",
      "Designed and implemented a robust MySQL database architecture to centralize beneficiaries' medical records, enabling secure data management and rapid information retrieval for healthcare coordination.",
      "Built a modern, intuitive web interface with custom Drupal modules and responsive design, specifically tailored to the association's workflow requirements and improving volunteer productivity."
    ],
    skills: ["Full Stack Development", "Drupal", "PHP", "MySQL", "Database Architecture", "Responsive Design"],
    logo: "/logos/norsys-afrique.png",
    logoAlt: "Norsys Afrique logo"
  }
];

export default function ExperienceReact() {
  return (
    <section id="experience" className="bg-transparent py-32 md:py-48">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          <div className="lg:col-span-4">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white mb-8 leading-[1.1]">
              Professional Experience
            </h2>
            <p className="text-lg text-white/50 font-medium leading-relaxed">
              A focused timeline of internships and data-driven systems built with modern cloud, backend, and analytical tools.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {experiences.map((exp) => (
              <div 
                key={exp.id} 
                className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-4xl border border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden p-2 border border-white/5">
                      {exp.logo ? (
                        <img 
                          src={exp.logo} 
                          alt={exp.logoAlt} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <BuildingsIcon size={28} weight="duotone" className="text-white/60" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-1">
                        {exp.title}
                      </h3>
                      <p className="text-white/70 font-medium text-lg">{exp.company}</p>
                    </div>
                  </div>
                  <span className="bg-white/10 text-white/60 px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest self-start border border-white/5">
                    {exp.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-3 mb-8 text-xs font-medium text-white/30 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <CalendarBlankIcon weight="bold" size={16} />
                    <span>{exp.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon weight="bold" size={16} />
                    <span>{exp.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LaptopIcon weight="bold" size={16} />
                    <span>{exp.workMode}</span>
                  </div>
                </div>

                {Array.isArray(exp.description) ? (
                  <ul className="list-disc pl-5 text-white/50 text-base md:text-lg leading-relaxed mb-8 font-medium space-y-3">
                    {exp.description.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/50 text-lg leading-relaxed mb-8 font-medium">
                    {exp.description}
                  </p>
                )}

                {exp.featuredProject && (
                  <div className="mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">
                      Featured Work: {exp.featuredProject.title}
                    </h4>
                    <p className="text-sm text-white/40 leading-relaxed font-light">
                      {exp.featuredProject.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {exp.skills.map(skill => (
                    <span 
                      key={skill} 
                      className="bg-white/5 border border-white/5 text-white/50 px-4 py-2 rounded-full text-xs font-medium transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
