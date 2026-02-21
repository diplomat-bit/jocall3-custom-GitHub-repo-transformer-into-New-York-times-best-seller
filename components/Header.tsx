
import React from 'react';
import { GithubRepo, GithubFile } from '../types';

interface HeaderProps {
  repo: GithubRepo | null;
  file: GithubFile | null;
  toggleAI: () => void;
  isAIPanelOpen: boolean;
  isSidebarOpen: boolean;
  auditCount: number;
  onToggleSidebar: () => void;
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ repo, file, toggleAI, isAIPanelOpen, isSidebarOpen, auditCount, onToggleSidebar, onGoHome }) => {
  return (
    <header className="h-16 border-b border-white/5 bg-slate-950 flex items-center justify-between px-6 z-40 shadow-xl">
      <div className="flex items-center gap-4 overflow-hidden">
        <button
            onClick={onToggleSidebar}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${!isSidebarOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
        >
            <i className={`fas ${isSidebarOpen ? 'fa-outdent' : 'fa-indent'}`}></i>
        </button>
        
        <div className="h-6 w-px bg-white/5 mx-1"></div>

        <button 
          onClick={onGoHome}
          className="flex items-center gap-2 group"
        >
           <i className="fab fa-github text-2xl text-slate-300"></i>
           <span className="text-indigo-400 font-black tracking-tighter text-lg truncate group-hover:text-indigo-300">JOCALL3</span>
        </button>
        
        {repo && (
          <>
            <i className="fas fa-chevron-right text-[10px] text-slate-600"></i>
            <span className="text-slate-200 font-black uppercase text-xs tracking-widest truncate">{repo.name}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {auditCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full animate-pulse">
            <i className="fas fa-atom text-amber-500 text-xs"></i>
            <span className="text-amber-500 text-[10px] font-black">{auditCount} STAGED</span>
          </div>
        )}

        {repo && (
          <div className="flex items-center gap-2">
            <a 
              href={`${repo.html_url}/archive/refs/heads/${repo.name === 'main' || repo.name === 'master' ? repo.name : 'main'}.zip`}
              title="Download Repository Zip"
              className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500 transition-all"
            >
              <i className="fas fa-file-zipper text-xs"></i>
            </a>
            
            <button
              onClick={toggleAI}
              className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 font-black uppercase tracking-widest text-[10px] ${
                isAIPanelOpen 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              }`}
            >
              {isAIPanelOpen ? (
                 <><i className="fas fa-code"></i> Code</>
              ) : (
                 <><i className="fas fa-brain"></i> Neural Swarm</>
              )}
            </button>
          </div>
        )}
        
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 font-black text-xs cursor-pointer hover:border-indigo-500 transition-colors" onClick={onGoHome}>
          JO
        </div>
      </div>
    </header>
  );
};

export default Header;
