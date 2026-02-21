
import React, { useState, useEffect } from 'react';
import { GithubRepo, GithubFile, KnowledgeBaseFile, AuditItem } from '../types';
import { githubService } from '../services/githubService';

interface SidebarProps {
  repos: GithubRepo[];
  selectedRepo: GithubRepo | null;
  knowledgeBase: KnowledgeBaseFile[];
  auditQueue: AuditItem[];
  onSelectRepo: (repo: GithubRepo) => void;
  onSelectFile: (file: GithubFile) => void;
  onToggleKnowledge: (file: GithubFile) => void;
  onToggleAudit: (file: GithubFile, repo: GithubRepo) => void;
  onAnalyzeRepo: (repo: GithubRepo) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const FileItem: React.FC<{
  repo: GithubRepo;
  file: GithubFile;
  level: number;
  isSelected: boolean;
  isInKnowledge: boolean;
  isInAudit: boolean;
  onSelectFile: (file: GithubFile) => void;
  onToggleKnowledge: (file: GithubFile) => void;
  onToggleAudit: (file: GithubFile, repo: GithubRepo) => void;
}> = ({ repo, file, level, isSelected, isInKnowledge, isInAudit, onSelectFile, onToggleKnowledge, onToggleAudit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<GithubFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.type !== 'dir') {
      onSelectFile(file);
      return;
    }
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && children.length === 0) {
      setIsLoading(true);
      try {
        const data = await githubService.getRepoContents(repo.name, file.path);
        setChildren(data);
      } catch (err) {
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="my-0.5">
      <div 
        className={`group flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer ${isSelected ? 'bg-indigo-500/20 border-indigo-500/30' : 'hover:bg-slate-800/40'}`}
        onClick={toggleFolder}
      >
        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {file.type === 'dir' ? (
                <i className={`fas fa-chevron-right text-[8px] transition-transform text-slate-500 ${isOpen ? 'rotate-90' : ''}`}></i>
            ) : null}
        </div>
        <i className={`fas ${file.type === 'dir' ? (isOpen ? 'fa-folder-open text-amber-400' : 'fa-folder text-amber-400') : 'fa-file-code text-indigo-400'} text-xs`}></i>
        <span className={`truncate text-[11px] ${file.type === 'dir' ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>{file.name}</span>
        
        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleAudit(file, repo); }} 
            className={`w-5 h-5 rounded flex items-center justify-center ${isInAudit ? 'text-amber-500' : 'text-slate-600 hover:text-amber-500'}`}
          >
            <i className="fas fa-atom text-[10px]"></i>
          </button>
          {file.type === 'file' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleKnowledge(file); }} 
              className={`w-5 h-5 rounded flex items-center justify-center ${isInKnowledge ? 'text-indigo-500' : 'text-slate-600 hover:text-indigo-500'}`}
            >
              <i className="fas fa-plus text-[10px]"></i>
            </button>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="ml-4 border-l border-slate-800 pl-2">
          {isLoading ? (
            <div className="py-2 px-4 space-y-2">
                <div className="h-2 bg-slate-800 rounded w-24 animate-pulse"></div>
            </div>
          ) : (
            children.map(child => (
              <FileItem 
                key={child.path} 
                repo={repo} 
                file={child} 
                level={level + 1} 
                isSelected={false} 
                isInKnowledge={false} 
                isInAudit={false}
                onSelectFile={onSelectFile} 
                onToggleKnowledge={onToggleKnowledge} 
                onToggleAudit={onToggleAudit} 
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ repos, selectedRepo, onSelectRepo, onSelectFile, onToggleKnowledge, onToggleAudit, onAnalyzeRepo, isOpen, onToggle }) => {
  const [search, setSearch] = useState('');
  const [rootFiles, setRootFiles] = useState<GithubFile[]>([]);
  const [loadingRoot, setLoadingRoot] = useState(false);

  useEffect(() => {
    if (selectedRepo) {
      loadRoot();
    }
  }, [selectedRepo?.id]);

  const loadRoot = async () => {
    setLoadingRoot(true);
    try {
      const data = await githubService.getRepoContents(selectedRepo!.name, '');
      setRootFiles(data);
    } catch (err) {
      setRootFiles([]);
    } finally {
      setLoadingRoot(false);
    }
  };

  const filteredRepos = repos.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`flex flex-col border-r border-white/5 bg-slate-950 transition-all duration-500 shadow-2xl overflow-hidden ${isOpen ? 'w-[320px]' : 'w-0 opacity-0'}`}>
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-header text-indigo-400 tracking-[0.3em] uppercase">Modules</h2>
          <button onClick={onToggle} className="text-slate-600 hover:text-white"><i className="fas fa-chevron-left"></i></button>
        </div>
        
        <div className="relative group">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]"></i>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Registry..." 
            className="w-full bg-slate-900 border border-white/5 rounded-lg py-2 pl-8 pr-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
        {filteredRepos.map(repo => (
          <div key={repo.id} className="group">
            <button 
                onClick={() => onSelectRepo(repo)} 
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${selectedRepo?.id === repo.id ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:bg-slate-900 border border-transparent'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRepo?.id === repo.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'}`}>
                <i className="fas fa-archive text-xs"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[11px] font-bold truncate uppercase tracking-tight ${selectedRepo?.id === repo.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{repo.name}</div>
                <div className="text-[9px] text-slate-600 font-mono mt-0.5">{repo.language || 'Code'}</div>
              </div>
            </button>
            
            {selectedRepo?.id === repo.id && (
              <div className="mt-2 ml-4 pl-4 border-l border-indigo-500/20 pb-4">
                <button 
                  onClick={() => onAnalyzeRepo(repo)}
                  className="w-full mb-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                >
                  <i className="fas fa-brain animate-pulse"></i>
                  Analyze Repo
                </button>

                {loadingRoot ? (
                  <div className="p-2 space-y-2 animate-pulse">
                      <div className="h-2 bg-slate-800 rounded w-full"></div>
                      <div className="h-2 bg-slate-800 rounded w-3/4"></div>
                  </div>
                ) : (
                  rootFiles.map(file => (
                    <FileItem 
                      key={file.path} 
                      repo={repo} 
                      file={file} 
                      level={0} 
                      isSelected={false} 
                      isInKnowledge={false} 
                      isInAudit={false}
                      onSelectFile={onSelectFile} 
                      onToggleKnowledge={onToggleKnowledge} 
                      onToggleAudit={onToggleAudit}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
