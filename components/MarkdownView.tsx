
import React from 'react';
import Markdown from 'react-markdown';

interface MarkdownViewProps {
  content: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none text-gray-500 font-light leading-relaxed tracking-wide">
      <Markdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-lg font-normal text-gray-700 mb-2 mt-4 tracking-wider" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-base font-normal text-gray-700 mb-2 mt-3 tracking-wider" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-sm font-medium text-gray-600 mb-1 mt-2 tracking-wider" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 text-justify font-light text-gray-500 leading-7 text-xs md:text-sm" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1 font-light text-gray-500 text-xs md:text-sm" {...props} />,
          li: ({node, ...props}) => <li className="marker:text-gray-300" {...props} />,
          strong: ({node, ...props}) => <strong className="font-medium text-gray-600" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-[0.5px] border-gray-300 pl-3 italic text-gray-400 my-2 font-light text-xs" {...props} />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

export default MarkdownView;
