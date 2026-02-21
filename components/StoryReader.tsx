
import React, { useState } from 'react';
import { Manuscript } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface StoryReaderProps {
  manuscript: Manuscript;
  onExport: () => void;
}

const StoryReader: React.FC<StoryReaderProps> = ({ manuscript, onExport }) => {
  const [activeChapter, setActiveChapter] = useState<number | -1>(-1); // -1 for Preface

  return (
    <div className="h-full flex flex-col bg-[#050508] text-slate-200 overflow-hidden font-serif">
      <div className="flex-1 overflow-y-auto p-12 md:p-24 no-scrollbar">
        <div className="max-w-3xl mx-auto">
          {activeChapter === -1 ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <span className="text-indigo-400 font-mono text-[10px] tracking-[0.5em] uppercase mb-8 block">Project Manuscript</span>
              <h1 className="text-6xl md:text-8xl font-sacred text-white mb-12 leading-tight">{manuscript.title}</h1>
              <div className="flex items-center gap-6 mb-16 border-t border-b border-white/10 py-8">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">JB</div>
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Architect</div>
                  <div className="text-lg text-white">{manuscript.author}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Dated</div>
                  <div className="text-lg text-white">{new Date(manuscript.generatedAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="prose prose-invert prose-xl">
                <p className="text-2xl italic text-slate-400 leading-relaxed font-serif">
                  {manuscript.preface}
                </p>
              </div>
              <button 
                onClick={() => setActiveChapter(0)}
                className="mt-20 px-12 py-5 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-indigo-500 hover:text-white transition-all rounded-full shadow-2xl"
              >
                Begin Reading
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="flex justify-between items-center mb-16">
                <button onClick={() => setActiveChapter(-1)} className="text-slate-500 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest">
                  <i className="fas fa-arrow-left"></i> Contents
                </button>
                <div className="text-indigo-400 font-mono text-[10px] tracking-widest uppercase">
                  Chapter {activeChapter + 1} of {manuscript.chapters.length}
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-header text-white mb-12 uppercase tracking-wide">
                {manuscript.chapters[activeChapter].title}
              </h2>

              {manuscript.chapters[activeChapter].imageUrl && (
                <div className="mb-16 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(79,70,229,0.1)]">
                  <img src={manuscript.chapters[activeChapter].imageUrl} className="w-full aspect-video object-cover" alt="Chapter Illumination" />
                </div>
              )}

              <div className="prose prose-invert prose-lg max-w-none">
                <MarkdownRenderer content={manuscript.chapters[activeChapter].content} />
              </div>

              <div className="mt-24 pt-12 border-t border-white/5 flex justify-between">
                <button 
                  disabled={activeChapter === 0}
                  onClick={() => setActiveChapter(prev => prev - 1)}
                  className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white disabled:opacity-0"
                >
                  Previous Chapter
                </button>
                {activeChapter === manuscript.chapters.length - 1 ? (
                   <button onClick={onExport} className="px-10 py-4 bg-emerald-600 rounded-full text-white font-bold uppercase tracking-widest text-xs animate-pulse">
                     Acquire Physical Archive
                   </button>
                ) : (
                  <button 
                    onClick={() => setActiveChapter(prev => prev + 1)}
                    className="px-12 py-4 bg-indigo-600 text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-indigo-500"
                  >
                    Continue Journey
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryReader;
