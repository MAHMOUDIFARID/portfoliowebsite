import { CaretRightIcon, DownloadSimpleIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';

export default function MotivationReact() {
  return (
    <div className="bg-transparent pt-40 pb-32">
      <div className="section-container max-w-4xl mx-auto px-6 lg:px-8">
        
        <div className="flex items-center gap-3 text-sm text-white/50 font-medium mb-12">
          <a href="/" className="hover:text-white transition-colors cursor-pointer">FARID MAHMOUDI</a>
          <CaretRightIcon size={14} weight="bold" />
          <span className="text-white">Motivation Letter</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-6">
          Ready to build the future.
        </h1>
        
        <p className="text-lg md:text-xl text-white/40 font-medium mb-16">
          Recent Big Data & Cloud Computing Graduate
        </p>

        <div className="text-lg md:text-xl text-white/70 leading-relaxed mb-16 space-y-8 font-light">
          <p>
            To whom it may concern,
          </p>
          <p>
            As a recent graduate specializing in Big Data and Cloud Computing, I have spent the last few years immersing myself in the architecture, deployment, and optimization of large-scale distributed systems. I am writing to express my strong interest in joining a forward-thinking engineering team where I can translate my academic background into high-impact, production-ready solutions.
          </p>
          <p>
            My academic journey has equipped me with a deep understanding of cloud infrastructure, data pipelines, and scalable computing. Beyond the classroom, I've actively applied these concepts by building full-stack applications and experimenting with modern frontend frameworks to ensure that the data systems I build are not only robust but also accessible through seamless user interfaces.
          </p>
          <p>
            I am particularly passionate about the intersection of data engineering and software development. I believe that the best products are built when scalable backends meet intuitive frontends. My goal is to join a company that values innovation, clean architecture, and continuous learning.
          </p>
          <p>
            I am highly adaptable, thrive in collaborative environments, and am eager to tackle complex engineering challenges. I would welcome the opportunity to discuss how my skills in Big Data, Cloud Computing, and Software Engineering align with your team's goals.
          </p>
          <p>
            Thank you for your time and consideration.
          </p>
          <p className="pt-4 font-medium text-white">
            Sincerely,<br/>
            <span className="text-white/60 font-light">Farid Mahmoudi</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-10">
          <a 
            href="/contact" 
            className="flex items-center justify-center gap-2 bg-white text-brand-black px-8 py-4 rounded-full text-base font-semibold hover:bg-white/90 transition-colors"
          >
            Get in touch <PaperPlaneTiltIcon weight="fill" />
          </a>
          <a 
            href="/resume.pdf" 
            className="flex items-center justify-center gap-2 bg-brand-charcoal border border-white/10 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-brand-gray transition-colors"
          >
            Download CV <DownloadSimpleIcon weight="bold" />
          </a>
        </div>

      </div>
    </div>
  );
}
