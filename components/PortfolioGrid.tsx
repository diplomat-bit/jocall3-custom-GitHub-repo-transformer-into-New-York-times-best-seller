
import React from 'react';
import { GithubRepo } from '../types';
import { exportService } from '../services/exportService';

interface PortfolioGridProps {
  repos: GithubRepo[];
  onSelectRepo: (repo: GithubRepo) => void;
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ repos, onSelectRepo }) => {
  const handleDownloadRegistry = () => {
    const html = exportService.generateMasterResume(repos);
    exportService.download("James_Burvel_Registry", html);
  };

  return (
    <div className="h-full overflow-y-auto p-10 md:p-20 scroll-smooth relative bg-slate-950">
      {/* Aesthetic Background Overlays */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)`, backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-24 text-center">
            <div className="flex flex-col items-center">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full mb-10">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <p className="text-[10px] font-header uppercase tracking-[0.4em] text-indigo-400">Registry Index // {repos.length} Modules Online</p>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-sacred text-white mb-6 tracking-widest drop-shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    The Arcane Node
                </h1>
                
                <p className="text-slate-500 font-header text-xs uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed mb-12">
                    Exploring the digital architecture and high-logic repositories of James Burvel.
                </p>

                <button 
                  onClick={handleDownloadRegistry}
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-full transition-all flex items-center gap-4 shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:scale-105"
                >
                    <i className="fas fa-download"></i>
                    Download Full Registry
                </button>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-40">
            {repos.map(repo => (
                <div 
                    key={repo.id}
                    onClick={() => onSelectRepo(repo)}
                    className="group relative bg-slate-900/20 backdrop-blur-md border border-white/5 hover:border-indigo-500/40 p-10 cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-[420px] rounded-[2.5rem] overflow-hidden"
                >
                    {/* Hover Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 group-hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all duration-500">
                                <i className="fas fa-cube text-2xl"></i>
                            </div>
                            <div className="flex flex-col items-end">
                                {repo.language && (
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                        {repo.language}
                                    </span>
                                )}
                                <span className="text-[8px] font-mono text-slate-600 mt-2">v{repo.updated_at.split('-')[0]}</span>
                            </div>
                        </div>
                        
                        <h3 className="text-3xl font-header text-white mb-4 group-hover:text-indigo-300 transition-colors tracking-tight uppercase line-clamp-2 leading-none">
                            {repo.name}
                        </h3>
                        
                        <p className="text-sm text-slate-500 mb-8 line-clamp-4 leading-relaxed group-hover:text-slate-300 transition-colors italic font-serif">
                            {repo.description || 'Accessing this module reveals hidden architectural patterns and refined logic that define the frontier of this engineering feat.'}
                        </p>

                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-header text-slate-600 uppercase tracking-widest mb-1">Veneration</span>
                                    <span className="text-sm font-header text-white flex items-center gap-1.5">
                                      <i className="fas fa-star text-[10px] text-amber-500"></i> {repo.stargazers_count}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-header text-slate-600 uppercase tracking-widest mb-1">Forks</span>
                                    <span className="text-sm font-header text-white flex items-center gap-1.5">
                                      <i className="fas fa-code-branch text-[10px] text-emerald-500"></i> {repo.forks_count}
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:scale-110 transition-all duration-300">
                                <i className="fas fa-arrow-right text-xs group-hover:text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioGrid;
