
import React from 'react';

interface WordCloudProps {
  keywords: string[];
}

const colors = [
  'text-clinic-gold',
  'text-clinic-dark',
  'text-gray-500',
  'text-amber-700',
  'text-stone-600',
];

const fontSizes = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
];

const fontWeights = [
  'font-light',
  'font-normal',
  'font-medium',
  'font-bold',
];

const WordCloud: React.FC<WordCloudProps> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 py-4 px-2">
      {keywords.map((word, index) => {
        // Randomly assign style for artistic feel
        // Using index to keep it deterministic per render
        const color = colors[index % colors.length];
        const size = fontSizes[(index * 3) % fontSizes.length];
        const weight = fontWeights[(index * 2) % fontWeights.length];
        
        return (
          <span 
            key={index} 
            className={`${color} ${size} ${weight} tracking-wide opacity-90 hover:scale-110 transition-transform cursor-default select-none`}
            style={{ fontFamily: index % 2 === 0 ? 'serif' : 'sans-serif' }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export default WordCloud;
