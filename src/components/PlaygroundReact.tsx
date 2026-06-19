import { useState } from 'react';
import { ArrowLeftIcon, ArrowUpRightIcon } from '@phosphor-icons/react';
import EdaToolReact from './EdaToolReact';
import YoutubeDownloaderReact from './YoutubeDownloaderReact';

interface Tool {
  id: string;
  num: string;
  title: string;
  description: string;
  category: string;
  status: string;
  tags: string[];
}

export default function PlaygroundReact() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools: Tool[] = [
    {
      id: 'eda',
      num: '01',
      title: 'CSV Auto-EDA Tool',
      description: 'Upload any CSV file to instantly generate summary statistics, plot numerical distributions, and compute correlation matrices locally in your browser.',
      category: 'Data Analytics',
      status: 'active',
      tags: ['Local Processing', 'ETL Engine', 'SVG Charts']
    },
    {
      id: 'yt-downloader',
      num: '02',
      title: 'YouTube Media Sync',
      description: 'Download video or audio streams from YouTube and other platforms. Customize tags and embed cover art directly into downloaded MP3 files.',
      category: 'Media Processing',
      status: 'active',
      tags: ['Cobalt API', 'ID3v2 Tagger', 'File Streams']
    },
    {
      id: 'sentiment',
      num: '03',
      title: 'NLP Sentiment Profiler',
      description: 'Analyze conversational texts or articles to calculate positive/negative sentiment scores using local dictionary tokens.',
      category: 'Natural Language Processing',
      status: 'planned',
      tags: ['NLP Dictionary', 'Lexicon Rules', 'planned']
    },
    {
      id: 'predict',
      num: '04',
      title: 'ML Salary Predictor',
      description: 'Estimate market salaries for tech and data roles based on sliding parameters for experience, tools, and certifications.',
      category: 'Machine Learning',
      status: 'planned',
      tags: ['Regression Model', 'Supervised ML', 'planned']
    }
  ];

  if (activeTool === 'eda') {
    return (
      <div className="relative min-h-screen bg-transparent pt-32 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        <div className="section-container max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <button 
            onClick={() => setActiveTool(null)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer mb-12 group bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-5 py-2.5 rounded-full w-fit hover:shadow-sm"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Playground</span>
          </button>
          <EdaToolReact />
        </div>
      </div>
    );
  }

  if (activeTool === 'yt-downloader') {
    return (
      <div className="relative min-h-screen bg-transparent pt-32 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        <div className="section-container max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <button 
            onClick={() => setActiveTool(null)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/40 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer mb-12 group bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-5 py-2.5 rounded-full w-fit hover:shadow-sm"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Playground</span>
          </button>
          <YoutubeDownloaderReact />
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-transparent pt-44 pb-16">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="section-container max-w-[1500px] mx-auto px-6 sm:px-12 md:px-16 relative z-10">
        


        {/* Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left Column (Sticky info panel & subscribe form) */}
          <div className="lg:col-span-4 lg:sticky lg:top-36 flex flex-col justify-between">
            <div>

              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-6">
                Code Labs.<br />
                Analyze Data.<br />
                Play Hard.
              </h1>
              <p className="text-sm md:text-base text-white/50 leading-relaxed font-light">
                An interactive sandbox hosting client-side analytical engines, media utilities, and planned predictive models. Test ideas, process files, and explore algorithms.
              </p>
            </div>

            {/* Subscribe Form styled like the screenshot */}
            <form className="mt-12 max-w-sm w-full" onSubmit={(e) => e.preventDefault()}>
              <div className="border-b border-white/20 py-2 mb-4">
                <input 
                  type="email" 
                  placeholder="email address" 
                  className="appearance-none bg-transparent border-none w-full text-white mr-3 py-1 px-2 leading-tight focus:outline-none placeholder-white/30 text-sm font-medium"
                />
              </div>
              <div className="flex">
                <button 
                  type="submit" 
                  className="w-full bg-white hover:opacity-90 text-brand-black text-sm font-bold py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          {/* Right Column (Horizontal snapping card list) */}
          <div className="lg:col-span-8 overflow-hidden w-full">
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-none -mx-6 px-6 lg:mx-0 lg:px-0">
              {tools.map((tool, index) => (
                <PlaygroundCard 
                  key={tool.id} 
                  tool={tool} 
                  index={index}
                  onLaunch={() => setActiveTool(tool.id)} 
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

interface CardProps {
  tool: Tool;
  index: number;
  onLaunch: () => void;
}

const pastelColors = [
  'bg-[#A494BF]', // Pastel Purple
  'bg-[#B5DC8C]', // Pastel Green
  'bg-[#A4C4E2]', // Pastel Blue
  'bg-[#F2B088]', // Pastel Peach
];

const SVGIllustrations = [
  // 01: CSV Auto-EDA
  <svg className="w-24 h-24 text-neutral-950" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="25" width="70" height="50" rx="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <line x1="25" y1="42" x2="95" y2="42" stroke="currentColor" strokeWidth="2.5" />
    <line x1="48" y1="25" x2="48" y2="75" stroke="currentColor" strokeWidth="2.5" />
    <line x1="72" y1="25" x2="72" y2="75" stroke="currentColor" strokeWidth="2.5" />
    <path d="M38 54C38 52 40 50 42 50C44 50 46 52 46 54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M72 54C72 52 74 50 76 50C78 50 80 52 80 54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M53 58C56 61 62 61 65 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 90 L45 75 L70 85 L100 55" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="100" cy="55" r="4.5" fill="currentColor" />
  </svg>,

  // 02: YouTube Sync
  <svg className="w-24 h-24 text-neutral-950" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 40C35 25 85 25 100 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M30 50C45 38 75 38 90 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="35" y="60" width="50" height="35" rx="8" stroke="currentColor" strokeWidth="2.5" />
    <polygon points="56,70 72,77.5 56,85" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M44 70C44 69 45 68 46 68C47 68 48 69 48 70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>,

  // 03: NLP Sentiment
  <svg className="w-24 h-24 text-neutral-950" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 35C25 26.7 31.7 20 40 20H80C88.3 20 95 26.7 95 35V65C95 73.3 88.3 80 80 80H45L25 95V35Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M48 45C48 43 50 41 52 41C54 41 56 43 56 45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M68 45C68 43 70 41 72 41C74 41 76 43 76 45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M54 58C57 61 63 61 66 58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>,

  // 04: ML Salary
  <svg className="w-24 h-24 text-neutral-950" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="70" width="22" height="12" rx="4" stroke="currentColor" strokeWidth="2.5" />
    <rect x="25" y="82" width="22" height="12" rx="4" stroke="currentColor" strokeWidth="2.5" />
    <rect x="73" y="60" width="22" height="12" rx="4" stroke="currentColor" strokeWidth="2.5" />
    <path d="M30 45 L55 35 L80 50 L100 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="100" cy="20" r="4.5" fill="currentColor" />
    <path d="M52 76C52 75 53 74 54 74C55 74 56 75 56 76" stroke="currentColor" strokeWidth="2" />
    <path d="M64 76C64 75 65 74 66 74C67 74 68 75 68 76" stroke="currentColor" strokeWidth="2" />
  </svg>
];

function PlaygroundCard({ tool, index, onLaunch }: CardProps) {
  const isActive = tool.status === 'active';

  return (
    <div 
      onClick={() => isActive && onLaunch()}
      className={`snap-start shrink-0 w-[290px] sm:w-[325px] rounded-[36px] bg-brand-gray p-7 flex flex-col justify-between min-h-[580px] border border-white/5 ${
        isActive 
          ? 'cursor-pointer group' 
          : 'opacity-50 select-none'
      }`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <span className="text-[10px] font-bold tracking-wider text-white/50 uppercase bg-white/5 px-3.5 py-1 rounded-full">
            {tool.category}
          </span>
          
          {isActive ? (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shadow-sm border border-white/10 group-hover:bg-white group-hover:text-brand-black transition-colors duration-300">
              <ArrowUpRightIcon className="w-4 h-4" />
            </div>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/45 bg-white/5 px-2.5 py-0.5 rounded-full">
              Pipeline
            </span>
          )}
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight mb-3">
          {tool.title}
        </h3>
        <p className="text-white/60 text-xs leading-relaxed font-normal">
          {tool.description}
        </p>
      </div>

      {/* Bottom Illustration Container */}
      <div className={`w-full h-[180px] rounded-2xl flex items-center justify-center overflow-hidden mt-6 ${pastelColors[index % pastelColors.length]}`}>
        {SVGIllustrations[index % SVGIllustrations.length]}
      </div>
    </div>
  );
}
