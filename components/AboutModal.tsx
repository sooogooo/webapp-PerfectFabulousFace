
import React from 'react';
import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-surface/90 backdrop-blur sticky top-0 z-10">
          <h2 className="text-lg font-serif font-bold text-primary">关于</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="text-text-muted hover:text-primary" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-sm font-light text-gray-600 leading-relaxed space-y-6">
          <section>
            <h3 className="font-medium text-primary mb-2">关于本应用</h3>
            <p>“丽丽格格和美丽的脸”是一款基于 Nano Banana (Gemini) 模型的趣味面部形态分析应用。通过上传照片，AI 将为您生成多维度的美学报告、风格化写真以及专业的面部指标分析。</p>
          </section>

          <section className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-800">
            <h3 className="font-medium text-orange-900 mb-2">医疗免责声明</h3>
            <p className="text-xs">本应用提供的所有分析结果、评分及建议仅供娱乐和参考，不构成任何医疗诊断或治疗建议。请勿根据本应用的输出进行任何医疗决策。如有专业医美需求，请咨询正规医疗机构的有资质医生。</p>
          </section>

          <section>
            <h3 className="font-medium text-primary mb-2">AI 生成声明</h3>
            <p className="text-xs text-gray-400">本应用生成的所有文字、图片及图表均由人工智能自动生成，可能存在误差或幻觉。生成的写真仅为风格模拟，不代表真实手术效果。</p>
          </section>

           <section>
            <h3 className="font-medium text-primary mb-2">隐私说明</h3>
            <p className="text-xs text-gray-400">我们极其重视您的隐私。您上传的照片仅用于实时的 AI 处理，不会被永久存储在云端服务器。生成的历史记录仅保存在您当前设备的浏览器本地存储中。</p>
          </section>

          <section className="border-t border-gray-100 pt-6">
             <h3 className="font-medium text-primary mb-4 text-center">联系我们</h3>
             <div className="text-center space-y-1 text-xs text-gray-500">
                <p className="font-medium text-gray-700">重庆联合丽格科技有限公司</p>
                <p>重庆市渝中区临江支路28号</p>
                <p>Email: yuxiaodong@beaucare.org</p>
                <p>Tel: 023-63326559</p>
             </div>
             
             <div className="mt-6 flex flex-col items-center gap-3">
                <a href="https://work.weixin.qq.com/kfid/kfc193e1c58e9c203c2" target="_blank" className="block p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                   <img src="https://docs.bccsw.cn/images/dr-he/dr-he-brcode.png" alt="客服二维码" className="w-24 h-24" />
                </a>
                <span className="text-[10px] text-gray-400">点击或扫描联系客服</span>
             </div>
          </section>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 tracking-wider">软件版本 0.6.6 | 部署时间 2025年11月29日</p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
