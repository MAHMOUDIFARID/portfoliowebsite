import React, { useState, useRef } from 'react';
import { 
  FilePdf, 
  UploadSimple, 
  Trash, 
  ArrowLeft, 
  ArrowRight, 
  DownloadSimple, 
  SlidersHorizontal,
  CheckCircle,
  Plus,
  Spinner,
  Image as ImageIcon
} from '@phosphor-icons/react';
import jsPDF from 'jspdf';

interface ImageFileItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: string;
}

export default function ImageToPdfReact() {
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'auto'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(10); // mm
  const [outputFilename, setOutputFilename] = useState('converted_document');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFiles = (fileList: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'];
    const newItems: ImageFileItem[] = [];

    Array.from(fileList).forEach(file => {
      if (validTypes.includes(file.type.toLowerCase()) || file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl,
          name: file.name,
          size: formatFileSize(file.size)
        });
      }
    });

    if (newItems.length > 0) {
      setImages(prev => [...prev, ...newItems]);
      setSuccessMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(item => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(item => item.id !== id);
    });
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    
    setImages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      return updated;
    });
  };

  const clearAll = () => {
    images.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setImages([]);
    setSuccessMessage('');
  };

  const generatePdf = async () => {
    if (images.length === 0) return;

    setIsGenerating(true);
    setSuccessMessage('');

    try {
      // Create jsPDF document
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize === 'auto' ? 'a4' : pageSize
      });

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        
        // Load image onto Image object to get natural width/height
        const imgObj = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = item.previewUrl;
        });

        // Add page if not the first iteration
        if (i > 0) {
          if (pageSize === 'auto') {
            const isLandscape = imgObj.width > imgObj.height;
            doc.addPage([imgObj.width * 0.264583, imgObj.height * 0.264583], isLandscape ? 'landscape' : 'portrait');
          } else {
            doc.addPage(pageSize, orientation);
          }
        }

        // Calculate dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const availWidth = pageWidth - (margin * 2);
        const availHeight = pageHeight - (margin * 2);

        const imgRatio = imgObj.width / imgObj.height;
        const pageRatio = availWidth / availHeight;

        let drawWidth = availWidth;
        let drawHeight = availHeight;

        if (imgRatio > pageRatio) {
          drawHeight = availWidth / imgRatio;
        } else {
          drawWidth = availHeight * imgRatio;
        }

        const xPos = margin + (availWidth - drawWidth) / 2;
        const yPos = margin + (availHeight - drawHeight) / 2;

        // Render onto canvas to handle webp/png transparency smoothly
        const canvas = document.createElement('canvas');
        canvas.width = imgObj.width;
        canvas.height = imgObj.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(imgObj, 0, 0);
        }
        const imgData = canvas.toDataURL('image/jpeg', 0.92);

        doc.addImage(imgData, 'JPEG', xPos, yPos, drawWidth, drawHeight);
      }

      const filename = (outputFilename.trim() || 'converted_document') + '.pdf';
      doc.save(filename);

      setSuccessMessage(`Successfully created "${filename}" (${images.length} page${images.length > 1 ? 's' : ''})!`);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-neutral-900/40 dark:bg-black/40 backdrop-blur-xl border border-neutral-200/20 dark:border-white/5 rounded-4xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Glow Accents */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-neutral-200/10 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/20 text-rose-400">
            <FilePdf size={26} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Image to PDF Converter</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Free & Local
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-white/40">Convert PNG, JPG & WEBP images into a clean PDF document directly in your browser</p>
          </div>
        </div>

        {images.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <Trash size={14} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver 
            ? 'border-rose-400 bg-rose-500/10 scale-[0.99]' 
            : 'border-white/10 hover:border-white/20 bg-neutral-950/40 hover:bg-neutral-900/40'
        }`}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={(e) => e.target.files && handleFiles(e.target.files)} 
          className="hidden" 
        />
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <UploadSimple size={28} weight="bold" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          Drop images here or <span className="text-rose-400 underline underline-offset-4">browse</span>
        </h3>
        <p className="text-xs text-white/40 max-w-sm mx-auto">
          Supports PNG, JPG, JPEG, WEBP files. Multiple images will be merged into a single multi-page PDF.
        </p>
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon size={16} className="text-rose-400" />
              <span>Selected Images ({images.length} page{images.length > 1 ? 's' : ''})</span>
            </h3>
            <span className="text-[11px] text-white/40">Drag or reorder pages below</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((item, idx) => (
              <div 
                key={item.id} 
                className="group relative bg-neutral-950/60 border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between hover:border-rose-500/50 transition-all duration-300 shadow-md"
              >
                {/* Page Number Badge */}
                <div className="absolute top-4 left-4 z-10 w-6 h-6 rounded-full bg-black/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center justify-center border border-white/20">
                  {idx + 1}
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(item.id); }}
                  className="absolute top-4 right-4 z-10 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:scale-110 cursor-pointer"
                  title="Remove image"
                >
                  <Trash size={12} weight="bold" />
                </button>

                {/* Thumbnail Preview */}
                <div className="w-full h-32 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center mb-2">
                  <img src={item.previewUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>

                {/* Info & Order Controls */}
                <div className="flex items-center justify-between text-[11px] text-white/60 pt-1 border-t border-white/5">
                  <span className="truncate max-w-[90px]" title={item.name}>{item.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'left')}
                      className="p-1 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move left"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 'right')}
                      className="p-1 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move right"
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add More Card */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-rose-500/40 rounded-2xl h-44 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-rose-500/5 transition-all text-white/40 hover:text-rose-400"
            >
              <Plus size={24} />
              <span className="text-xs font-semibold">Add More</span>
            </div>
          </div>
        </div>
      )}

      {/* PDF Settings */}
      {images.length > 0 && (
        <div className="mt-8 p-6 rounded-3xl bg-neutral-950/60 border border-white/10 backdrop-blur-md">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <SlidersHorizontal size={16} />
            <span>PDF Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 cursor-pointer"
              >
                <option value="a4">Standard A4 (210 x 297 mm)</option>
                <option value="letter">US Letter (8.5 x 11 in)</option>
                <option value="auto">Auto (Match Image Aspect)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 cursor-pointer"
              >
                <option value="portrait">Portrait (Vertical)</option>
                <option value="landscape">Landscape (Horizontal)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">Margins</label>
              <select
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 cursor-pointer"
              >
                <option value={0}>No Margin (Edge-to-Edge)</option>
                <option value={10}>Small (10 mm)</option>
                <option value={20}>Normal (20 mm)</option>
              </select>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-white/5">
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">Output PDF Name</label>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                placeholder="my_converted_document"
                className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 font-mono"
              />
              <span className="text-xs text-white/40 font-mono font-bold">.pdf</span>
            </div>
          </div>
        </div>
      )}

      {/* Convert & Download Action */}
      {images.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <div className="text-xs text-white/50">
            Ready to compile <span className="text-white font-bold">{images.length} image{images.length > 1 ? 's' : ''}</span> into PDF
          </div>

          <button
            onClick={generatePdf}
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Spinner size={18} className="animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <DownloadSimple size={18} weight="bold" />
                <span>Convert & Download PDF</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
