import {
  CalendarBlankIcon,
} from '@phosphor-icons/react';

const education = [
  {
    id: 1,
    degree: "Master's in Big Data & Cloud Computing",
    date: "2022 - 2024",
    location: "Kenitra",
    logo: "/logos/FS%20Kenitra%20LOGO.png",
    logoAlt: "Faculty of Sciences Kenitra logo",
    description: "Advanced studies focused on distributed systems, data engineering pipelines, cloud infrastructure (AWS/Azure), and machine learning models.",
    skills: ["Data Engineering", "Cloud Architecture", "Machine Learning", "Distributed Systems", "Python", "SQL"]
  },
  {
    id: 2,
    degree: "Bachelor's in Computer Science",
    date: "2019 - 2022",
    location: "Ouarzazate",
    logo: "/logos/Ibn%20Zohr%20LOGO.jpg",
    logoAlt: "Ibn Zohr University logo",
    description: "Core foundation in software engineering, algorithms, database management, and web development.",
    skills: ["Algorithms", "Data Structures", "Software Engineering", "Web Development", "Java", "C++"]
  }
];

export default function EducationReact() {
  return (
    <section id="education" className="bg-transparent py-20 md:py-32">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white mb-8 leading-[1.1]">
              Education <br /> Journey
            </h2>
            <p className="text-lg text-white/50 font-medium leading-relaxed">
              My academic background with a strong focus on building scalable data systems and leveraging cloud technologies.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {education.map((edu) => (
              <div 
                key={edu.id} 
                className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-4xl border border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 relative z-10">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden border border-white/5 shadow-inner">
                      <img
                        src={edu.logo}
                        alt={edu.logoAlt}
                        className="w-full h-full rounded-full object-cover scale-110"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                        {edu.degree}
                      </h3>
                      <p className="text-white/70 font-medium text-lg">{edu.location}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-3 mb-8 text-xs font-medium text-white/30 uppercase tracking-widest relative z-10">
                  <div className="flex items-center gap-2">
                    <CalendarBlankIcon weight="bold" size={16} />
                    <span>{edu.date}</span>
                  </div>

                </div>

                <p className="text-white/50 text-lg leading-relaxed mb-8 font-medium relative z-10">
                  {edu.description}
                </p>

                <div className="flex flex-wrap gap-2 relative z-10">
                  {edu.skills.map(skill => (
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
