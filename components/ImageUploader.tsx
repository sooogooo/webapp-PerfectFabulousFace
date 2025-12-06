
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Camera, Upload, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

const WALLPAPER_IMAGES = [
  "https://docs.bccsw.cn/images/chacha/faceonly.jpg",
  "https://docs.bccsw.cn/images/chacha/manke1.jpg",
  "https://docs.bccsw.cn/images/chacha/manke2.jpg",
  "https://docs.bccsw.cn/images/chacha/splendeur.jpg",
  "https://docs.bccsw.cn/images/chacha/superorder.jpg",
  "https://docs.bccsw.cn/images/chacha/xinfuyuan1.jpg",
  "https://docs.bccsw.cn/images/chacha/xinfuyuan2.jpg",
  "https://docs.bccsw.cn/images/chacha/xinfuyuan3.jpg",
  "https://docs.bccsw.cn/images/chacha/xinfuyuan4.jpg"
];

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, selectedImage, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random floating items
  const floatingItems = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      src: WALLPAPER_IMAGES[i % WALLPAPER_IMAGES.length],
      left: Math.random() * 100, // 0-100%
      width: 80 + Math.random() * 100, // 80-180px
      duration: 15 + Math.random() * 20, // 15-35s
      delay: -(Math.random() * 20), // start mid-animation
      opacity: 0.4 + Math.random() * 0.5, // 0.4-0.9 (Increased opacity range by ~30% from previous 0.3-0.7)
    }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full mb-6">
      <style>
        {`
          @keyframes floatUp {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: var(--target-opacity); }
            90% { opacity: var(--target-opacity); }
            100% { transform: translateY(-1200px); opacity: 0; }
          }
          .floating-item {
            position: absolute;
            top: 100%;
            animation: floatUp linear infinite;
            border-radius: 12px;
            object-fit: cover;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
        `}
      </style>
      <div
        className={`relative w-full rounded-[24px] md:rounded-[32px] overflow-hidden transition-all duration-500 ease-out group border-[0.5px] ${isDragOver ? 'border-clinic-gold' : 'border-transparent'}
          ${!selectedImage ? 'bg-[#f8f8f8] min-h-[420px] md:h-[500px]' : 'bg-black'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Waterfall Background (Only when no image selected) */}
        {!selectedImage && mounted && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            {/* Gradient Mask to fade top/bottom */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#f8f8f8] via-white/40 to-[#f8f8f8]" />
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px]" />
            
            {/* Floating Images */}
            {floatingItems.map((item) => (
              <img
                key={item.id}
                src={item.src}
                className="floating-item filter grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                style={{
                  left: `${item.left}%`,
                  width: `${item.width}px`,
                  height: `${item.width * 1.4}px`, // Portrait aspect ratio
                  animationDuration: `${item.duration}s`,
                  animationDelay: `${item.delay}s`,
                  '--target-opacity': item.opacity, // Direct opacity, no dimming
                } as React.CSSProperties}
                alt=""
              />
            ))}
          </div>
        )}

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="flex items-center justify-center w-full h-full bg-black min-h-[300px] z-0">
             <img
                src={selectedImage}
                alt="Selected"
                className="max-w-full max-h-[70vh] object-contain opacity-90 mx-auto"
                style={{ maxWidth: '100%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
          </div>
        )}

        {/* Content Container */}
        <div className={`absolute inset-0 flex flex-col items-center justify-between py-12 px-6 text-center z-20 pointer-events-none ${selectedImage ? 'h-full' : ''}`}>
          
          {/* Header - Moved to App.tsx or removed as requested if only title was needed */}
          <div className={`transform transition-all duration-700 ${selectedImage ? 'translate-y-0' : 'translate-y-8 md:translate-y-12'}`}>
            {selectedImage && (
              <>
                <h2 className="text-2xl md:text-4xl font-light tracking-tight mb-3 text-white">
                  分析就绪
                </h2>
                <p className="text-xs md:text-sm tracking-widest uppercase font-light mb-1 text-gray-300">
                  AI 预览已加载
                </p>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full max-w-[540px] justify-center pointer-events-auto pb-6 md:pb-2">
            {selectedImage ? (
               <button
                onClick={onClear}
                className="w-full sm:w-[260px] mx-auto py-3.5 rounded-full text-sm font-light tracking-wide bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 transition-all"
              >
                更换照片
              </button>
            ) : (
                <div className="flex flex-col items-center gap-3 w-full">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full sm:w-[260px] py-4 rounded-full text-sm font-medium tracking-widest bg-gray-900 text-white hover:bg-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5"
                    >
                        <Camera size={18} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform text-white"/>
                        <span>上传照片 / 拍摄</span>
                    </button>
                    <span className="text-[10px] text-gray-400 font-light tracking-wide">支持高清人像及自拍</span>
                </div>
            )}
          </div>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
    </div>
  );
};

export default ImageUploader;
