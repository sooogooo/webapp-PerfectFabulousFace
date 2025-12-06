
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { AestheticScores } from '../types';

interface AestheticRadarChartProps {
  scores: AestheticScores;
}

const AestheticRadarChart: React.FC<AestheticRadarChartProps> = ({ scores }) => {
  const data = [
    { subject: '眼部', A: scores.eyes, fullMark: 100 },
    { subject: '面颊', A: scores.cheeks, fullMark: 100 },
    { subject: '唇部', A: scores.lips, fullMark: 100 },
    { subject: '眉部', A: scores.brows, fullMark: 100 },
    { subject: '下颌', A: scores.jawline, fullMark: 100 },
    { subject: '对称性', A: scores.symmetry, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[260px] md:h-[300px] flex justify-center items-center bg-white rounded-xl p-2 md:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#f0f0f0" strokeWidth={0.5} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#888', fontSize: 10, fontFamily: 'sans-serif', fontWeight: 300 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="美学评分"
            dataKey="A"
            stroke="#d4af37"
            strokeWidth={1}
            fill="#d4af37"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AestheticRadarChart;
