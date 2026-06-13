import { useState, useRef, useEffect } from 'react';
import { 
  DownloadSimple, 
  MusicNotes, 
  VideoCamera, 
  Gear, 
  UploadSimple, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Spinner,
  Globe
} from '@phosphor-icons/react';
import { ID3Writer } from 'browser-id3-writer';

interface CobaltInstanceInfo {
  api: string;
  name: string;
  cors: boolean;
  score?: number;
  online?: {
    api?: boolean;
    frontend?: boolean;
  } | boolean;
}

// Verified fallback Cobalt API instances if dynamic tracker is down
const FALLBACK_INSTANCES = [
  { name: 'Vinny Cafe Proxy', url: 'https://cobalt.vinny.cafe' },
  { name: 'Phreak Pro Proxy', url: 'https://cobalt.phreak.pro' },
  { name: 'Night City Proxy', url: 'https://cobalt.night-city.club' },
  { name: 'Cobalt.tools (Official)', url: 'https://api.cobalt.tools' },
  { name: 'Codeblock Proxy', url: 'https://cobalt.codeblock.app' }
];

export default function YoutubeDownloaderReact() {
  // Input fields
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'audio' | 'video'>('audio');
  const [dynamicInstances, setDynamicInstances] = useState<{ name: string; url: string }[]>([]);
  const [customServer, setCustomServer] = useState(FALLBACK_INSTANCES[0].url);
  const [showSettings, setShowSettings] = useState(false);

  const activeInstances = dynamicInstances.length > 0 ? dynamicInstances : FALLBACK_INSTANCES;

  // Dynamically load instances from instances.cobalt.best API via CORS proxy
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const targetUrl = 'https://instances.cobalt.best/api/instances.json';
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Failed to fetch instances list.');
        
        const list: CobaltInstanceInfo[] = await res.json();
        
        const healthy = list
          .filter(item => {
            const isApiOnline = typeof item.online === 'object'
              ? item.online?.api === true
              : item.online === true;
            return item.api && isApiOnline;
          })
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .map(item => ({
            name: `${item.name || new URL(item.api).hostname} (Score: ${item.score || 0})`,
            url: item.api.replace(/\/$/, '')
          }));

        if (healthy.length > 0) {
          setDynamicInstances(healthy);
          setCustomServer(healthy[0].url);
        }
      } catch (err) {
        console.warn('Failed to load dynamic instances, using fallback list:', err);
      }
    };
    fetchInstances();
  }, []);

  // Metadata Tags (Audio only)
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverBuffer, setCoverBuffer] = useState<ArrayBuffer | null>(null);

  // Video Settings
  const [videoQuality, setVideoQuality] = useState('1080');

  // Process States
  const [status, setStatus] = useState<'idle' | 'api-request' | 'downloading' | 'tagging' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadedFileName, setDownloadedFileName] = useState('');

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  // Handle local image file loading
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        setCoverBuffer(e.target.result);
        const previewUrl = URL.createObjectURL(file);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverPreview(previewUrl);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setProgress(0);
    setStatusMessage('');
  };

  // Helper to fetch with automatic CORS proxy fallback
  const robustFetch = async (targetUrl: string, options: RequestInit = {}): Promise<Response> => {
    try {
      return await fetch(targetUrl, options);
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message?.toLowerCase().includes('failed to fetch') || err.message?.toLowerCase().includes('networkerror')) {
        console.warn(`Direct fetch to ${targetUrl} failed. Retrying via corsproxy.io...`);
        try {
          const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
          return await fetch(proxyUrl, options);
        } catch (proxyErr: any) {
          if (options.method === 'GET' || !options.method) {
            console.warn(`corsproxy.io failed. Retrying via allorigins GET proxy...`);
            const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
            return await fetch(allOriginsUrl, options);
          }
          throw proxyErr;
        }
      }
      throw err;
    }
  };

  // Perform full download and tag injecting process
  const triggerDownload = async () => {
    if (!url.trim()) {
      setErrorMessage('Please enter a valid YouTube or video URL.');
      setStatus('error');
      return;
    }

    setStatus('api-request');
    setErrorMessage('');
    setStatusMessage('Contacting Cobalt API server...');
    setProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      // 1. Determine servers to try (failover logic)
      let serversToTry = [customServer];
      if (activeInstances.some(inst => inst.url === customServer)) {
        const otherDefaults = activeInstances
          .map(inst => inst.url)
          .filter(url => url !== customServer);
        serversToTry = [...serversToTry, ...otherDefaults];
      }

      let apiData: any = null;
      let lastError: any = null;
      let successfulServer = '';

      for (const server of serversToTry) {
        try {
          const serverName = activeInstances.find(i => i.url === server)?.name || 'Custom';
          setStatusMessage(`Contacting server (${serverName})...`);

          const response = await robustFetch(server, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: url.trim(),
              audioFormat: mode === 'audio' ? 'mp3' : undefined,
              downloadMode: mode === 'audio' ? 'audio' : 'auto',
              videoQuality: mode === 'video' ? videoQuality : undefined,
              alwaysProxy: mode === 'audio', // Required to bypass CORS on the stream download
              filenameStyle: 'pretty'
            }),
            signal: abortControllerRef.current.signal
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `Server returned status ${response.status}`);
          }

          const data = await response.json();

          if (data.status === 'error') {
            throw new Error(data.error?.code || 'Cobalt API returned an error.');
          }

          apiData = data;
          successfulServer = server;
          break; // success!
        } catch (err: any) {
          if (err.name === 'AbortError') {
            throw err; // user cancelled, propagate
          }
          console.warn(`Cobalt server failover check: ${server} failed.`, err);
          lastError = err;
        }
      }

      if (!apiData) {
        throw lastError || new Error('All configured Cobalt servers failed to respond.');
      }

      const downloadUrl = apiData.url;
      const returnedFilename = apiData.filename || 'media.mp3';

      if (!downloadUrl) {
        throw new Error('No download link was returned by the server.');
      }

      // 2. Process based on mode
      if (mode === 'video') {
        // Video mode: direct download via link, avoids loading large files into browser RAM
        setStatusMessage('Video link generated! Starting download...');
        setStatus('success');
        setDownloadedFileName(returnedFilename);

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = returnedFilename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Audio mode: download chunk-by-chunk to show progress, then apply ID3 tags
        setStatus('downloading');
        setStatusMessage('Downloading audio stream...');

        const mediaResponse = await robustFetch(downloadUrl, {
          signal: abortControllerRef.current.signal
        });

        if (!mediaResponse.ok) {
          throw new Error('Failed to download audio stream from proxy.');
        }

        const contentLength = mediaResponse.headers.get('content-length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
        let loadedBytes = 0;

        const reader = mediaResponse.body?.getReader();
        if (!reader) {
          throw new Error('Stream reader not available.');
        }

        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            loadedBytes += value.length;
            if (totalBytes > 0) {
              const pct = Math.round((loadedBytes / totalBytes) * 100);
              setProgress(pct);
            }
          }
        }

        // Combine chunks into single ArrayBuffer
        setStatus('tagging');
        setStatusMessage('Embedding metadata & cover art...');
        
        const combined = new Uint8Array(loadedBytes);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }

        const audioBuffer = combined.buffer;

        // Auto-extract Title & Artist if user left them empty
        let finalTitle = title.trim();
        let finalArtist = artist.trim();
        
        if (!finalTitle || !finalArtist) {
          const cleanFilename = returnedFilename.replace(/\.[^/.]+$/, ""); // strip extension
          if (cleanFilename.includes(' - ')) {
            const parts = cleanFilename.split(' - ');
            if (!finalArtist) finalArtist = parts[0].trim();
            if (!finalTitle) finalTitle = parts.slice(1).join(' - ').trim();
          } else {
            if (!finalTitle) finalTitle = cleanFilename.trim();
          }
        }
        
        if (!finalTitle) finalTitle = 'Downloaded Song';
        if (!finalArtist) finalArtist = 'Unknown Artist';

        // 3. Write ID3 tags using browser-id3-writer
        const writer = new ID3Writer(audioBuffer);
        writer.setFrame('TIT2', finalTitle)
              .setFrame('TPE1', [finalArtist]);

        if (album.trim()) {
          writer.setFrame('TALB', album.trim());
        }

        if (coverBuffer) {
          writer.setFrame('APIC', {
            type: 3, // Front cover
            data: coverBuffer,
            description: 'Cover Art'
          });
        }

        writer.addTag();
        const taggedBlob = writer.getBlob();

        // 4. Trigger download
        const localDownloadUrl = URL.createObjectURL(taggedBlob);
        const a = document.createElement('a');
        a.href = localDownloadUrl;
        a.download = `${finalArtist} - ${finalTitle}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Let object URL live slightly then revoke
        setTimeout(() => URL.revokeObjectURL(localDownloadUrl), 5000);

        setDownloadedFileName(`${finalArtist} - ${finalTitle}.mp3`);
        setStatus('success');
        setStatusMessage('Tags applied and file saved successfully!');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // User cancelled, ignore error state
      }
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during the download process.');
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-neutral-900/40 dark:bg-black/40 backdrop-blur-xl border border-neutral-200/20 dark:border-white/5 rounded-4xl p-8 shadow-2xl relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-neutral-200/10 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
            <DownloadSimple size={24} weight="bold" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">YouTube Media Sync</h2>
            <p className="text-xs text-neutral-500 dark:text-white/40">Download video or audio with customizable metadata & cover art</p>
          </div>
        </div>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
            showSettings 
              ? 'bg-neutral-800 border-neutral-700 text-indigo-400' 
              : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-800/30'
          }`}
          title="Server Settings"
        >
          <Gear size={18} />
        </button>
      </div>

      {/* Expandable Settings */}
      {showSettings && (
        <div className="mb-6 p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 backdrop-blur-md">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Globe size={14} />
            Cobalt API Configuration
          </h3>
          <p className="text-[11px] text-neutral-400 mb-4">
            Requests are processed client-side. If the default server experiences rate limits, switch instances or paste your own self-hosted Cobalt URL.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 dark:text-white/30 tracking-wider mb-2">Select Instance</label>
              <select 
                value={customServer}
                onChange={(e) => setCustomServer(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
              >
                {activeInstances.map((inst) => (
                  <option key={inst.url} value={inst.url}>{inst.name}</option>
                ))}
                <option value="custom">-- Custom Instance --</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-500 dark:text-white/30 tracking-wider mb-2">Endpoint URL</label>
              <input 
                type="text" 
                value={customServer === 'custom' ? '' : customServer}
                onChange={(e) => setCustomServer(e.target.value)}
                disabled={customServer !== 'custom'}
                placeholder="https://your-cobalt-instance.com"
                className="w-full bg-neutral-900 border border-neutral-800 disabled:opacity-40 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="space-y-6">
        {/* URL Input */}
        <div>
          <label className="block text-[10px] uppercase font-extrabold text-neutral-500 dark:text-white/30 tracking-wider mb-2.5">
            Video Source URL
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube, SoundCloud, or TikTok link here..."
              className="w-full bg-neutral-950/40 hover:bg-neutral-950/60 focus:bg-neutral-950/80 border border-neutral-800 focus:border-indigo-500/50 rounded-2xl px-5 py-4 pr-12 text-sm text-neutral-200 focus:outline-none transition-all duration-300 shadow-inner"
            />
          </div>
        </div>

        {/* Tab Selection (Mode) */}
        <div>
          <label className="block text-[10px] uppercase font-extrabold text-neutral-500 dark:text-white/30 tracking-wider mb-2.5">
            Output Format Mode
          </label>
          <div className="grid grid-cols-2 gap-3 bg-neutral-950/40 p-1.5 rounded-2xl border border-neutral-800">
            <button 
              type="button"
              onClick={() => setMode('audio')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                mode === 'audio' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-md shadow-indigo-500/[0.02]' 
                  : 'text-neutral-500 dark:text-white/30 hover:text-neutral-850 dark:hover:text-white'
              }`}
            >
              <MusicNotes size={16} />
              Audio Only (MP3)
            </button>
            <button 
              type="button"
              onClick={() => setMode('video')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                mode === 'video' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-md shadow-indigo-500/[0.02]' 
                  : 'text-neutral-500 dark:text-white/30 hover:text-neutral-850 dark:hover:text-white'
              }`}
            >
              <VideoCamera size={16} />
              Video (MP4)
            </button>
          </div>
        </div>

        {/* Dynamic Panels */}
        {mode === 'audio' ? (
          /* Audio (ID3 Metadata Panel) */
          <div className="p-6 rounded-3xl bg-neutral-950/20 border border-neutral-800/50 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <h3 className="text-xs font-bold text-neutral-800 dark:text-white/60 uppercase tracking-wider">Song ID3v2 Tags Customization</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Text Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-neutral-500 dark:text-white/30 tracking-wider mb-1.5">Song Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Auto-extracted if left empty"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-neutral-500 dark:text-white/30 tracking-wider mb-1.5">Artist / Band</label>
                  <input 
                    type="text" 
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Queen"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-neutral-500 dark:text-white/30 tracking-wider mb-1.5">Album</label>
                  <input 
                    type="text" 
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="e.g. Greatest Hits"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              {/* Cover Art Drag/Drop Upload */}
              <div>
                <label className="block text-[9px] uppercase font-bold text-neutral-500 dark:text-white/30 tracking-wider mb-1.5">Custom Cover Art</label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl h-[178px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden ${
                    isDragOver 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : coverPreview 
                        ? 'border-indigo-500/40' 
                        : 'border-neutral-850 hover:border-indigo-500/30 bg-neutral-950/20 hover:bg-neutral-950/30'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />

                  {coverPreview ? (
                    <>
                      {/* Image Preview with overlay */}
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-300">
                        <UploadSimple size={20} className="text-white" />
                        <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Change Cover</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all w-fit mx-auto mb-2.5">
                        <ImageIcon size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-200 transition-colors uppercase tracking-wider block mb-1">
                        Drag cover art here
                      </span>
                      <span className="text-[9px] text-neutral-500 dark:text-white/20">or click to browse local files</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Video Quality Panel */
          <div className="p-6 rounded-3xl bg-neutral-950/20 border border-neutral-800/50 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <h3 className="text-xs font-bold text-neutral-800 dark:text-white/60 uppercase tracking-wider">Video Options</h3>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-neutral-500 dark:text-white/30 tracking-wider mb-2">Preferred Quality Resolution</label>
              <div className="grid grid-cols-4 gap-2.5">
                {['1080', '720', '480', '360'].map((quality) => (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => setVideoQuality(quality)}
                    className={`py-2 rounded-xl text-xs font-medium cursor-pointer border transition-all ${
                      videoQuality === quality
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : 'bg-neutral-950/40 border-neutral-850 text-neutral-500 hover:text-white hover:bg-neutral-800/30'
                    }`}
                  >
                    {quality}p
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Button & Status Overlays */}
        <div className="pt-2">
          {status === 'idle' || status === 'error' || status === 'success' ? (
            <button
              onClick={triggerDownload}
              className="w-full py-4 bg-gradient-to-r from-indigo-650 to-indigo-500 hover:from-indigo-550 hover:to-indigo-450 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2.5"
            >
              <DownloadSimple size={18} weight="bold" />
              Generate Download Link
            </button>
          ) : (
            /* Progress & Processing Box */
            <div className="p-6 rounded-2xl bg-neutral-950/50 border border-neutral-800/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Spinner size={18} className="text-indigo-400 animate-spin" />
                  <span className="text-xs font-medium text-neutral-350">{statusMessage}</span>
                </div>
                {status === 'downloading' && (
                  <span className="text-xs font-bold font-mono text-indigo-400">{progress}%</span>
                )}
              </div>

              {/* Progress Bar */}
              {status === 'downloading' && (
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-4">
                  <div 
                    style={{ width: `${progress}%` }} 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  ></div>
                </div>
              )}

              <button
                onClick={handleCancel}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer"
              >
                Cancel Process
              </button>
            </div>
          )}
        </div>

        {/* Response Feedbacks */}
        {status === 'success' && (
          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 flex items-start gap-3.5">
            <CheckCircle size={20} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider">Process Completed!</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Downloaded: <span className="font-semibold text-neutral-200 break-all">{downloadedFileName}</span>
              </p>
              <p className="text-[10px] text-emerald-500/60 font-light">
                The file has been successfully processed and triggered to save in your browser.
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-400 flex items-start gap-3.5">
            <XCircle size={20} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider">Processing Failed</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {errorMessage}
              </p>
              <p className="text-[10px] text-rose-500/60 font-light">
                Tips: Check if the video is public, verify your link, or try selecting a different Cobalt API Instance in the settings top right.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
