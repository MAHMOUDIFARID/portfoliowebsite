import { imageFor } from '../lib/images';

export default function FooterReact() {
  const portrait = imageFor('/FARID MAHMOUDI.jpg');
  return (
    <footer className="bg-brand-black border-t border-white/10 w-full flex items-center min-h-14 py-4 sm:py-0 px-6 md:px-12">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center text-xs md:text-sm font-normal text-white/50 tracking-wide gap-3 sm:gap-0">
        
        <div className="flex-1 text-center sm:text-left">
          Built with <span className="text-white/80">Astro, Tailwind CSS, and TypeScript</span>
        </div>

        <div className="flex-1 text-center">
          Want to check the code? View it on <a href="https://github.com/MAHMOUDIFARID/portfoliowebsite" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white underline decoration-white/20 underline-offset-4 hover:decoration-white/60 transition-colors duration-300">GitHub</a>
        </div>

        <div className="flex-1 flex justify-center sm:justify-end">
          <a 
            href="/contact" 
            className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full pr-1"
            aria-label="Contact Farid Mahmoudi"
          >
            <img 
              src={portrait.src}
              srcSet={portrait.srcSet}
              sizes="24px"
              width={24}
              height={24}
              loading="lazy"
              decoding="async"
              alt="Farid Mahmoudi" 
              className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover border border-white/10 transition-all duration-300"
            />
            <span>
              By <span className="text-white/90 underline decoration-white/20 underline-offset-4 group-hover:decoration-white/60 transition-colors duration-300">FARID</span>
            </span>
          </a>
        </div>

      </div>
    </footer>
  );
}
