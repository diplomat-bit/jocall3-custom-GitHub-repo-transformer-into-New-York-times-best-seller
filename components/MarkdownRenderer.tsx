
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Fira Code'
    });
    
    if (ref.current) {
      ref.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [chart]);

  return <div className="mermaid" ref={ref}>{chart}</div>;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <ReactMarkdown
      className={`prose prose-invert max-w-none ${className}`}
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : '';

          if (!inline && lang === 'mermaid') {
            return <Mermaid chart={String(children).replace(/\n$/, '')} />;
          }

          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={lang}
              PreTag="div"
              className="rounded-lg !bg-slate-950/50 !p-4 border border-slate-700/50"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        // Prettier tables
        table({ children }) {
          return <div className="overflow-x-auto my-6"><table className="min-w-full divide-y divide-slate-800 border border-slate-800 rounded-lg">{children}</table></div>;
        },
        th({ children }) {
          return <th className="px-4 py-2 bg-slate-800/50 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">{children}</th>;
        },
        td({ children }) {
          return <td className="px-4 py-2 border-t border-slate-800 text-sm text-slate-300">{children}</td>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
