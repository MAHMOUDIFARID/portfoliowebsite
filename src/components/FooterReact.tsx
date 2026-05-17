export default function FooterReact() {
  return (
    <footer className="bg-brand-black border-t border-white/10 w-full flex items-center h-14 px-6 md:px-12">
      <div className="w-full max-w-[1400px] mx-auto flex justify-between items-center text-xs md:text-sm font-normal text-white/50 tracking-wide">
        
        <p>
          Built with <span className="text-white/80">Astro, Tailwind CSS, and TypeScript</span>
        </p>

        <a 
          href="/contact" 
          className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full pr-1"
          aria-label="Contact Farid Mahmoudi"
        >
          <img 
            src="/me.png" 
            alt="Farid Mahmoudi" 
            className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover border border-white/10 transition-all duration-300"
          />
          <span>
            By <span className="text-white/90 underline decoration-white/20 underline-offset-4 group-hover:decoration-white/60 transition-colors duration-300">FARID</span>
          </span>
        </a>

      </div>
    </footer>
  );
}
