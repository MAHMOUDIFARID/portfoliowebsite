import { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import EdaToolReact from './EdaToolReact';
import YoutubeDownloaderReact from './YoutubeDownloaderReact';
import ImageToPdfReact from './ImageToPdfReact';

interface Tool {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'planned';
  tags: string[];
  pastelBg: string;
  tagBg: string;
}

export default function PlaygroundReact() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleLaunchTool = (id: string) => {
    setActiveTool(id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToPlayground = () => {
    setActiveTool(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tools: Tool[] = [
    {
      id: 'image-to-pdf',
      title: 'Image to PDF Converter',
      description: 'Convert PNG, JPG, JPEG, and WEBP images into a clean, high-resolution PDF document directly in your browser with zero data uploads.',
      category: 'Document Utility',
      status: 'active',
      tags: ['100% Client-Side', 'Multi-Page PDF', 'Custom Layout'],
      pastelBg: 'bg-indigo-500/10 border border-indigo-500/20',
      tagBg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
    }
  ];

  if (activeTool === 'eda') {
    return (
      <div className="relative min-h-screen bg-transparent pt-32 pb-32">
        <div className="section-container max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/40">Playground</span>
              <span className="text-neutral-300 dark:text-white/20">/</span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">CSV Auto-EDA</span>
            </div>
            <button 
              onClick={handleBackToPlayground}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Playground</span>
            </button>
          </div>
          <EdaToolReact />
        </div>
      </div>
    );
  }

  if (activeTool === 'yt-downloader') {
    return (
      <div className="relative min-h-screen bg-transparent pt-32 pb-32">
        <div className="section-container max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/40">Playground</span>
              <span className="text-neutral-300 dark:text-white/20">/</span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">YouTube Media Sync</span>
            </div>
            <button 
              onClick={handleBackToPlayground}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Playground</span>
            </button>
          </div>
          <YoutubeDownloaderReact />
        </div>
      </div>
    );
  }

  if (activeTool === 'image-to-pdf') {
    return (
      <div className="relative min-h-screen bg-transparent pt-32 pb-32">
        <div className="section-container max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/40">Playground</span>
              <span className="text-neutral-300 dark:text-white/20">/</span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Image to PDF</span>
            </div>
            <button 
              onClick={handleBackToPlayground}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Playground</span>
            </button>
          </div>
          <ImageToPdfReact />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent pt-32 pb-32">
      <div className="section-container max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
            Playground
          </h1>
          <p className="text-base text-neutral-600 dark:text-white/60 font-light leading-relaxed">
            Interactive client-side tools, data utilities, and predictive models.
          </p>
        </div>

        {/* Content / Empty state */}
        {tools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {tools.map((tool) => (
              <PlaygroundCard 
                key={tool.id} 
                tool={tool} 
                onLaunch={() => handleLaunchTool(tool.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl bg-neutral-50 dark:bg-white/5 backdrop-blur-md">
            <p className="text-lg font-medium text-neutral-400 dark:text-white/40">No tools for now.</p>
          </div>
        )}

      </div>
    </div>
  );
}

interface PlaygroundCardProps {
  tool: Tool;
  onLaunch: () => void;
}

function PlaygroundCard({ tool, onLaunch }: PlaygroundCardProps) {
  const isActive = tool.status === 'active';

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault();
        if (isActive) onLaunch();
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isActive) {
          e.preventDefault();
          onLaunch();
        }
      }}
      className={`group bg-white dark:bg-[#18181c] rounded-[32px] p-4 sm:p-5 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 border border-black/5 dark:border-white/10 ${
        isActive 
          ? 'cursor-pointer hover:-translate-y-1 active:scale-[0.98]' 
          : 'opacity-70 cursor-not-allowed select-none'
      }`}
    >
      {/* Top Pastel Container */}
      <div className={`rounded-[24px] p-6 sm:p-8 flex flex-col justify-between min-h-[260px] md:min-h-[280px] ${tool.pastelBg} transition-colors duration-300`}>
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3">
            {tool.title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed mb-6">
            {tool.description}
          </p>
        </div>

        {/* Pill Tags inside pastel container */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {tool.tags.map((tag) => (
            <span 
              key={tag} 
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${tool.tagBg}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Action Row outside pastel container */}
      <div className="flex items-center justify-between px-3 pt-4 pb-1.5">
        <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
          {isActive ? 'Explore' : 'In Pipeline'}
        </span>

        <div className={`w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 flex items-center justify-center text-neutral-900 dark:text-white transition-all duration-300 ${
          isActive ? 'group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black' : 'opacity-40'
        }`}>
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
