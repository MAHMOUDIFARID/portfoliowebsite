import React, { useState, useRef } from 'react';
import { 
  Paperclip, 
  Link as LinkIcon, 
  Trash, 
  ArrowLeft, 
  ArrowRight, 
  Gear,
  CheckCircle,
  Spinner,
  Image as ImageIcon
} from '@phosphor-icons/react';
import jsPDF from 'jspdf';

interface ImageFileItem {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  size?: string;
  isUrl?: boolean;
}

export default function ImageToPdfReact() {
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'auto'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(10);
  const [outputFilename, setOutputFilename] = useState('converted_document');

  // Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
          size: formatFileSize(file.size),
          isUrl: false
        });
      }
    });

    if (newItems.length > 0) {
      setImages(prev => [...prev, ...newItems]);
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  const handleAddUrl = () => {
    if (!imageUrl.trim()) return;

    const trimmed = imageUrl.trim();
    const filename = trimmed.split('/').pop()?.split('?')[0] || 'Image URL';

    setImages(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        previewUrl: trimmed,
        name: filename,
        isUrl: true
      }
    ]);

    setImageUrl('');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(item => item.id === id);
      if (target && !target.isUrl) URL.revokeObjectURL(target.previewUrl);
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
    images.forEach(item => {
      if (!item.isUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setImages([]);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const generatePdf = async () => {
    if (images.length === 0) {
      setErrorMessage('Please select at least one image to convert.');
      return;
    }

    setIsGenerating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize === 'auto' ? 'a4' : pageSize
      });

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        
        const imgObj = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${item.name}`));
          img.src = item.previewUrl;
        });

        if (i > 0) {
          if (pageSize === 'auto') {
            const isLandscape = imgObj.width > imgObj.height;
            doc.addPage([imgObj.width * 0.264583, imgObj.height * 0.264583], isLandscape ? 'landscape' : 'portrait');
          } else {
            doc.addPage(pageSize, orientation);
          }
        }

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

      setSuccessMessage(`Successfully converted ${images.length} image${images.length > 1 ? 's' : ''} into "${filename}"!`);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setErrorMessage(err.message || 'Error generating PDF. Please check your image URLs or files.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center py-6">

      {/* 1. Top Segmented Selector (Theme Tokens for Light/Dark Mode) */}
      <div className="inline-flex items-center bg-brand-gray p-1 rounded-xl mb-6 shadow-sm border border-black/10 dark:border-white/10">
        <button
          onClick={() => setUploadTab('file')}
          className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            uploadTab === 'file'
              ? 'bg-brand-charcoal text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          File Upload
        </button>
        <button
          onClick={() => setUploadTab('url')}
          className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
            uploadTab === 'url'
              ? 'bg-brand-charcoal text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          URL Upload
        </button>
      </div>

      {/* Hidden File Input */}
      <input 
        ref={fileInputRef} 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={(e) => e.target.files && handleFiles(e.target.files)} 
        className="hidden" 
      />

      {/* 2. Main Capsule Input Box with Dashed Border */}
      <div className="w-full relative">
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          className={`w-full border-2 border-dashed rounded-2xl p-2 sm:p-2.5 flex items-center justify-between transition-all duration-300 bg-brand-charcoal shadow-lg border-black/30 dark:border-white/30 ${
            isDragOver 
              ? 'scale-[0.995]' 
              : ''
          }`}
        >
          {uploadTab === 'file' ? (
            /* File Upload Mode */
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center gap-3 px-3 py-2 cursor-pointer select-none group"
            >
              <Paperclip size={20} className="text-white opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm font-medium text-white opacity-70 group-hover:opacity-100 transition-opacity truncate">
                {images.length > 0 
                  ? `${images.length} image${images.length > 1 ? 's' : ''} selected` 
                  : 'Select your images'}
              </span>
            </div>
          ) : (
            /* URL Upload Mode */
            <div className="flex-1 flex items-center gap-3 px-3 py-2">
              <LinkIcon size={20} className="text-white opacity-70 shrink-0" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                placeholder="Paste image URL here..."
                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-white/40"
              />
              {imageUrl.trim() && (
                <button
                  onClick={handleAddUrl}
                  className="px-3 py-1 bg-brand-gray text-white text-xs font-semibold rounded-md hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                  Add
                </button>
              )}
            </div>
          )}

          {/* Right Action Button (Convert) */}
          <button
            onClick={generatePdf}
            disabled={isGenerating || images.length === 0}
            className="bg-white text-black font-bold text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Spinner size={16} className="animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <span>Convert</span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Settings Toggle */}
      <div className="w-full flex items-center justify-between mt-4 px-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <Gear size={14} />
          <span>{showSettings ? 'Hide Options' : 'PDF Options (A4, Margins, Name)'}</span>
        </button>

        {images.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
          >
            <Trash size={13} />
            <span>Clear ({images.length})</span>
          </button>
        )}
      </div>

      {/* 4. Expandable PDF Settings Drawer */}
      {showSettings && (
        <div className="w-full mt-4 p-5 rounded-2xl bg-brand-charcoal border border-black/10 dark:border-white/10 shadow-md text-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full bg-brand-gray border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="a4">A4 (210 x 297 mm)</option>
                <option value="letter">Letter (8.5 x 11 in)</option>
                <option value="auto">Auto (Match Image Aspect)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full bg-brand-gray border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">Margins</label>
              <select
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full bg-brand-gray border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value={0}>No Margin</option>
                <option value={10}>Small (10 mm)</option>
                <option value={20}>Normal (20 mm)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
            <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider shrink-0">PDF Filename:</label>
            <input
              type="text"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="my_document"
              className="flex-1 bg-brand-gray border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              style={{ fontFamily: "'Inconsolata', monospace" }}
            />
            <span className="text-xs text-white/60" style={{ fontFamily: "'Inconsolata', monospace" }}>.pdf</span>
          </div>
        </div>
      )}

      {/* 5. Selected Images Preview & Reorder Bar */}
      {images.length > 0 && (
        <div className="w-full mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={14} />
              <span>Selected Images ({images.length})</span>
            </h4>
            <span className="text-[11px] text-white/50">Page Order</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((item, idx) => (
              <div 
                key={item.id}
                className="group relative bg-brand-charcoal border border-black/10 dark:border-white/10 rounded-xl p-2 flex flex-col justify-between shadow-sm hover:shadow-md transition-all text-white"
              >
                {/* Page Badge */}
                <div className="absolute top-3 left-3 z-10 w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </div>

                {/* Trash Delete */}
                <button
                  onClick={() => removeImage(item.id)}
                  className="absolute top-3 right-3 z-10 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                >
                  <Trash size={10} />
                </button>

                {/* Thumbnail Image */}
                <div className="w-full h-24 rounded-lg bg-brand-gray flex items-center justify-center overflow-hidden mb-1.5">
                  <img src={item.previewUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between text-[10px] text-white/70 pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="truncate max-w-[80px]" title={item.name}>{item.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, 'left')}
                      className="hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowLeft size={11} />
                    </button>
                    <button
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, 'right')}
                      className="hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Notifications */}
      {successMessage && (
        <div className="w-full mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="w-full mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <Trash size={16} className="text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

    </div>
  );
}
