import { useState } from 'react';
import { CaretRightIcon, ArrowLeftIcon, ArrowUpRightIcon } from '@phosphor-icons/react';
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
    <div className="relative min-h-screen bg-transparent pt-32 pb-32">
      {/* Background Accent Gradients & Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
      <div className="absolute top-[20%] left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="section-container max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-neutral-400 dark:text-white/30 mb-12">
          <a href="/" className="hover:text-black dark:hover:text-white transition-colors cursor-pointer">FARID MAHMOUDI</a>
          <CaretRightIcon size={8} weight="bold" />
          <span className="text-neutral-900 dark:text-white">PLAYGROUND</span>
        </div>

        {/* Heading Section */}
        <div className="max-w-xl mb-20">
          <span className="text-[9px] font-extrabold tracking-[0.25em] text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/10">
            DATA LABS
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white mt-6 mb-6">
            Data Playground.
          </h1>
          <p className="text-sm md:text-base text-neutral-500 dark:text-white/40 leading-relaxed font-light">
            An interactive workspace hosting client-side analytical engines, data schemas analyzers, and planned predictive models.
          </p>
        </div>

        {/* Premium Grid Layout with Cursor Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {tools.map((tool) => (
            <PlaygroundCard 
              key={tool.id} 
              tool={tool} 
              onLaunch={() => setActiveTool(tool.id)} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}

interface CardProps {
  tool: Tool;
  onLaunch: () => void;
}

function PlaygroundCard({ tool, onLaunch }: CardProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const isActive = tool.status === 'active';

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => isActive && onLaunch()}
      style={{
        background: isHovered && isActive
          ? `radial-gradient(180px circle at ${coords.x}px ${coords.y}px, rgba(99, 102, 241, 0.45), rgba(255, 255, 255, 0.05))`
          : undefined
      }}
      className={`relative p-[1.5px] rounded-4xl bg-neutral-200 dark:bg-white/10 transition-all duration-300 ${
        isActive 
          ? 'hover:shadow-2xl hover:shadow-indigo-500/[0.04] cursor-pointer group' 
          : 'opacity-50 select-none'
      }`}
    >
      <div className="relative overflow-hidden bg-white dark:bg-[#070708] rounded-[30px] p-8 flex flex-col justify-between min-h-[280px]">
        {/* Subtle grid pattern inside card */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40"></div>

        {/* Cursor background highlight */}
        {isActive && (
          <div 
            style={{
              background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(99, 102, 241, 0.08), transparent 85%)`
            }}
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[9px] font-mono font-bold tracking-widest text-neutral-400 dark:text-white/25">
              {tool.num} / {tool.category.toUpperCase()}
            </span>
            
            {isActive ? (
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ready
              </span>
            ) : (
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 px-2.5 py-0.5 rounded-full">
                Pipeline
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3">
            {tool.title}
          </h3>
          <p className="text-neutral-500 dark:text-white/40 text-xs md:text-sm leading-relaxed font-light mb-6">
            {tool.description}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="relative z-10 mt-4 pt-6 border-t border-neutral-200/50 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.map((tag) => (
              <span 
                key={tag} 
                className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg border ${
                  tag === 'planned'
                    ? 'bg-neutral-50 dark:bg-transparent text-neutral-400 dark:text-white/20 border-neutral-200 dark:border-white/5'
                    : 'bg-neutral-50 dark:bg-white/5 text-neutral-400 dark:text-white/35 border-neutral-200 dark:border-white/5'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {isActive && (
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-neutral-950 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-white transition-colors shrink-0">
              <span>Execute</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
