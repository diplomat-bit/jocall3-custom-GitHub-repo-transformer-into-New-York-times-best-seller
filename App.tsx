
import React, { useState, useEffect } from 'react';
import { GithubRepo, SelectedContext, Manuscript, RepoSession } from './types';
import { githubService } from './services/githubService';
import { geminiService } from './services/geminiService';
import { exportService } from './services/exportService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PortfolioGrid from './components/PortfolioGrid';
import StoryReader from './components/StoryReader';

const App: React.FC = () => {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [repoSessions, setRepoSessions] = useState<Record<number, RepoSession>>({});
  const [selectedContext, setSelectedContext] = useState<SelectedContext>({
    repo: null, manuscript: null, chatHistory: [], isGenerating: false, status: 'IDLE'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const data = await githubService.getUserRepos();
      setRepos(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepo = (repo: GithubRepo) => {
    const session = repoSessions[repo.id] || { repoId: repo.id, manuscript: null, chatHistory: [] };
    setSelectedContext({ 
      repo, 
      manuscript: session.manuscript, 
      chatHistory: session.chatHistory,
      isGenerating: false,
      status: 'READY'
    });
  };

  const handleGoHome = () => {
    setSelectedContext({ repo: null, manuscript: null, chatHistory: [], isGenerating: false, status: 'IDLE' });
  };

  const handleGenerateStory = async () => {
    if (!selectedContext.repo) return;
    setSelectedContext(prev => ({ ...prev, isGenerating: true, status: 'INITIALIZING_NEURAL_SWARM' }));
    
    try {
      const allFiles = await githubService.getAllRepoFilesRecursively(selectedContext.repo.name);
      
      // Batch download the most important files for analysis (top 30 to stay within context limits while being deep)
      const fileContents = await Promise.all(
        allFiles.slice(0, 30).map(async f => ({
          path: f.path,
          content: f.download_url ? await githubService.getFileContent(f.download_url) : ''
        }))
      );

      const manuscript = await geminiService.weaveManuscript(
        selectedContext.repo.name, 
        fileContents, 
        (status) => setSelectedContext(prev => ({ ...prev, status }))
      );

      setRepoSessions(prev => ({
        ...prev,
        [selectedContext.repo!.id]: { ...prev[selectedContext.repo!.id], manuscript }
      }));
      setSelectedContext(prev => ({ ...prev, manuscript, isGenerating: false, status: 'COMPLETE' }));
    } catch (e) {
      console.error(e);
      setSelectedContext(prev => ({ ...prev, isGenerating: false, status: 'NEURAL_FAULT: RESOURCE_EXHAUSTED' }));
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-black text-white font-mono uppercase tracking-widest text-xs animate-pulse">Accessing Registry...</div>;

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-slate-200">
      <Sidebar 
        repos={repos} 
        selectedRepo={selectedContext.repo} 
        onSelectRepo={handleSelectRepo} 
        onAnalyzeRepo={handleGenerateStory}
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        knowledgeBase={[]} auditQueue={[]} onSelectFile={() => {}} onToggleKnowledge={() => {}} onToggleAudit={() => {}}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header 
          repo={selectedContext.repo} 
          file={null} 
          toggleAI={() => {}} 
          isAIPanelOpen={false} 
          isSidebarOpen={isSidebarOpen}
          auditCount={0}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onGoHome={handleGoHome}
        />
        
        <main className="flex-1 overflow-hidden relative">
          {selectedContext.isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center space-y-12 p-20 text-center bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)]">
              <div className="relative">
                <div className="w-48 h-48 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-b-2 border-amber-500/30 rounded-full animate-spin-slow"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-brain text-5xl text-indigo-400 animate-pulse"></i>
                </div>
              </div>
              <div className="max-w-md">
                <h2 className="text-3xl font-header tracking-[0.4em] uppercase mb-4 text-white">Parallel Neural Synthesis</h2>
                <p className="text-slate-500 font-serif italic mb-8">Coordinating multiple AI scribes to weave your architectural odyssey into a cohesive manuscript...</p>
                <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-8 py-3 rounded-full border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                  &gt; {selectedContext.status}
                </div>
              </div>
            </div>
          ) : selectedContext.manuscript ? (
            <StoryReader 
              manuscript={selectedContext.manuscript} 
              onExport={() => exportService.downloadManuscript(selectedContext.manuscript!)} 
            />
          ) : selectedContext.repo ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 p-12 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.03)_0%,_transparent_70%)]">
               <div className="max-w-xl text-center">
                  <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-indigo-500/20">
                    <i className="fas fa-scroll text-2xl text-indigo-400"></i>
                  </div>
                  <h2 className="text-5xl font-sacred mb-6 tracking-widest">Manuscript Ready</h2>
                  <p className="text-slate-500 font-serif text-xl mb-12 leading-relaxed italic px-10">
                    The architectural data for "{selectedContext.repo.name}" is staged. Initiate the Neural Swarm to produce a high-fidelity digital book of its design.
                  </p>
                  <button 
                    onClick={handleGenerateStory}
                    className="px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-[0.5em] text-xs rounded-full shadow-[0_0_60px_rgba(79,70,229,0.3)] transition-all hover:scale-110 active:scale-95 border border-indigo-400/30"
                  >
                    Weave Magnum Opus
                  </button>
               </div>
            </div>
          ) : (
            <PortfolioGrid repos={repos} onSelectRepo={handleSelectRepo} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
