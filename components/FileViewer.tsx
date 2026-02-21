
import React from 'react';
import { GithubFile, GithubRepo } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface FileViewerProps {
  file: GithubFile | null;
  content: string | null;
  repo: GithubRepo | null;
}

const FileViewer: React.FC<FileViewerProps> = ({ file, content, repo }) => {
  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-6 px-10">
        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
           <i className="fas fa-code text-4xl text-slate-600"></i>
        </div>
        <div className="text-center max-w-md">
           <h3 className="text-xl font-bold text-slate-300 mb-2">Portfolio Node: jocall3</h3>
           <p className="text-sm">Select a module to decrypt the project architecture.</p>
        </div>
      </div>
    );
  }

  const isImage = /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file.name);
  const isMarkdown = /\.md$/i.test(file.name);
  
  // Extract language for non-markdown code files
  const langMatch = /\.([a-z0-9]+)$/i.exec(file.name);
  const lang = langMatch ? langMatch[1] : 'text';

  return (
    <div className="h-full overflow-hidden flex flex-col bg-slate-900">
      <div className="flex-1 overflow-auto p-6 scroll-smooth">
        <div className="max-w-6xl mx-auto">
          {isImage ? (
            <div className="flex items-center justify-center bg-slate-800/20 p-8 rounded-2xl border border-slate-800">
              <img src={file.download_url} alt={file.name} className="max-w-full h-auto rounded-lg shadow-2xl" />
            </div>
          ) : isMarkdown ? (
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl">
              <MarkdownRenderer content={content || "No content found."} />
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <MarkdownRenderer content={`\`\`\`${lang}\n${content || ''}\n\`\`\``} />
            </div>
          )}
        </div>
      </div>
      
      <div className="h-12 border-t border-slate-800 bg-slate-900/90 flex items-center px-6 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-indigo-400">
            <i className="fas fa-file-code"></i> {file.name}
          </span>
          <span className="text-slate-700">|</span>
          <span>{file.size ? (file.size / 1024).toFixed(2) : 0} KB</span>
        </div>
        <div className="flex-1"></div>
        <a href={file.download_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
          RAW CONTENT <i className="fas fa-external-link-alt text-[10px]"></i>
        </a>
      </div>
    </div>
  );
};

export default FileViewer;
