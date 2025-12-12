import React, { useState } from 'react';
import { X, Trash2, Maximize, Columns, Check, ChevronLeft } from 'lucide-react';
import { ReportData } from '../types';
import ImageViewer from './ImageViewer';
import CompareSlider from './CompareSlider';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ReportData[];
  onRestore: (item: ReportData) => void;
  onDelete: (timestamp: number) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onRestore, onDelete }) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSelection = (timestamp: number) => {
    if (selectedItems.includes(timestamp)) {
      setSelectedItems(selectedItems.filter(t => t !== timestamp));
    } else {
      if (selectedItems.length < 2) {
        setSelectedItems([...selectedItems, timestamp]);
      }
    }
  };

  const startComparison = () => {
    if (selectedItems.length === 2) {
      setCompareMode(true);
    }
  };

  const getCompareItems = () => {
    const item1 = history.find(h => h.analysis.timestamp === selectedItems[0]);
    const item2 = history.find(h => h.analysis.timestamp === selectedItems[1]);
    return { item1, item2 };
  };

  if (compareMode) {
    const { item1, item2 } = getCompareItems();
    if (!item1 || !item2) return null;
    const img1 = item1.images.front?.clean || "";
    const img2 = item2.images.front?.clean || "";

    return (
      <div className="fixed inset-0 z-[70] bg-surface flex flex-col animate-fade-in">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <button onClick={() => setCompareMode(false)} className="flex items-center gap-1 text-gray-500 hover:text-primary">
             <ChevronLeft size={20}/> 返回画廊
          </button>
          <h2 className="text-lg font-serif font-bold text-primary">美学对比</h2>
          <div className="w-6"></div>
        </div>
        <div className="flex-1 overflow-hidden relative p-4 flex flex-col items-center justify-center bg-gray-50">
           <div className="w-full max-w-4xl h-full max-h-[80vh] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <CompareSlider 
                 leftImage={`data:image/jpeg;base64,${img1.replace(/^data:image\/\w+;base64,/, '')}`} 
                 rightImage={`data:image/jpeg;base64,${img2.replace(/^data:image\/\w+;base64,/, '')}`} 
                 leftLabel={new Date(item1.analysis.timestamp || 0).toLocaleDateString()}
                 rightLabel={new Date(item2.analysis.timestamp || 0).toLocaleDateString()}
              />
           </div>
           <p className="mt-4 text-xs text-gray-400 font-light text-center">拖动滑块对比两张写真的差异</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-surface/90 backdrop-blur sticky top-0 z-10">
          <h2 className="text-lg font-serif font-bold text-primary">我的美学画廊</h2>
          <div className="flex items-center gap-2">
            {selectedItems.length === 2 && (
               <button onClick={startComparison} className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-full text-xs hover:bg-opacity-90 transition-all shadow-sm">
                  <Columns size={14}/> 对比
               </button>
            )}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <X className="text-text-muted hover:text-primary" size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
           {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                 <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"><Maximize size={24}/></div>
                 <p className="text-sm font-light">暂无保存的写真记录</p>
              </div>
           ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {history.map((item) => {
                    const timestamp = item.analysis.timestamp || 0;
                    const isSelected = selectedItems.includes(timestamp);
                    const img = item.images.front?.clean; 
                    
                    return (
                       <div key={timestamp} className={`relative group bg-white rounded-xl overflow-hidden shadow-sm border transition-all ${isSelected ? 'ring-2 ring-accent border-accent' : 'border-gray-100 hover:shadow-md'}`}>
                          <div className="aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer relative" onClick={() => img && setFullscreenImage(`data:image/jpeg;base64,${img}`)}>
                             {img ? (
                                <>
                                  <img src={`data:image/jpeg;base64,${img}`} alt="History" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                  {isSelected && <div className="absolute inset-0 bg-gradient-to-t from-accent/40 via-transparent to-transparent pointer-events-none" />}
                                </>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">图片丢失</div>
                             )}
                          </div>
                          
                          {/* Selection Checkbox */}
                          <div className="absolute top-2 left-2 z-10">
                             <button onClick={(e) => { e.stopPropagation(); toggleSelection(timestamp); }} className={`w-5 h-5 rounded-full border border-white/50 shadow-sm flex items-center justify-center transition-colors ${isSelected ? 'bg-accent border-accent text-white' : 'bg-black/20 hover:bg-black/40'}`}>
                                {isSelected && <Check size={12}/>}
                             </button>
                          </div>

                          <div className="p-3">
                             <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-medium text-gray-700">{new Date(timestamp).toLocaleDateString()}</span>
                                <span className="text-[10px] text-accent font-serif italic">{item.analysis.scores.total}分</span>
                             </div>
                             <p className="text-[10px] text-gray-400 font-light line-clamp-1">{item.analysis.keywords.slice(0, 3).join(' ')}</p>
                             
                             <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                                <button onClick={() => { onRestore(item); onClose(); }} className="flex-1 py-1.5 text-[10px] bg-primary text-white rounded text-center hover:bg-gray-800 transition-colors">恢复编辑</button>
                                <button onClick={() => onDelete(timestamp)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={12}/></button>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           )}
        </div>
      </div>
      
      {fullscreenImage && (
         <ImageViewer src={fullscreenImage} onClose={() => setFullscreenImage(null)} />
      )}
    </div>
  );
};

export default HistoryModal;