import {
  CalendarBlankIcon,
  MapPinIcon,
  LaptopIcon
} from '@phosphor-icons/react';

const experiences = [
  {
    id: 1,
    title: "Data & Automation Engineer",
    company: "Voila.partners",
    type: "Internship",
    date: "Sep 2024 - Dec 2024",
    duration: "4 months",
    location: "Bruxelles",
    workMode: "Remote",
    description: "Designed and implemented robust relational database structures, automated ETL pipelines, and created unified process dashboards.",
    skills: ["Data Engineering", "ETL Pipelines", "Relational Databases", "Airtable Systems", "Make.com Automation", "Workflow Optimization", "Process Analytics"],
    logo: "/logos/voila-partners.png",
    logoAlt: "Voila.partners logo"
  },
  {
    id: 2,
    title: "Software & Data Engineer",
    company: "Norsys Afrique",
    type: "Internship",
    date: "Nov 2023 - Dec 2023",
    duration: "2 months",
    location: "Marrakesh-Safi, Morocco",
    workMode: "Hybrid",
    description: "Delivered backend system logic, database designs, and interactive web dashboard solutions in an Agile environment. Supported the complete technical development of a solidary web platform.",
    featuredProject: {
      title: "Plateforme Web Solidaire - Association Abbed, Enfants Diabetiques",
      description: "Architected and implemented a backend relational database structure and clean dashboard views to help manage diabetes tracking analytics."
    },
    skills: ["Backend Development", "Database Management", "Data Modeling", "Web App Development", "Git Version Control", "Agile Development", "React Systems"],
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
                      <img 
                        src={exp.logo} 
                        alt={exp.logoAlt} 
                        className="w-full h-full object-contain"
                      />
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

                <p className="text-white/50 text-lg leading-relaxed mb-8 font-medium">
                  {exp.description}
                </p>

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
