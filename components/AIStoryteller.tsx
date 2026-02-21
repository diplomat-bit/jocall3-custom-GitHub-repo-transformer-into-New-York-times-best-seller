
import React, { useState, useRef, useEffect } from 'react';
import { SelectedContext, ChatMessage, FileAnalysis, ProjectCompendium, VirtualRepository } from '../types';
import { geminiService } from '../services/geminiService';
import { githubService } from '../services/githubService';
import { exportService } from '../services/exportService';
import MarkdownRenderer from './MarkdownRenderer';

interface AIStorytellerProps {
  context: SelectedContext;
  onMinimize: () => void;
  onClose: () => void;
  onAddMessage: (msg: ChatMessage) => void;
  onClearChat: () => void;
  onUpdateCompendium: (comp: ProjectCompendium) => void;
  onUpdateVirtualRepo: (repo: VirtualRepository) => void;
  onClearAuditQueue: () => void;
}

const AIStoryteller: React.FC<AIStorytellerProps> = ({ 
  context, onClose, onAddMessage, onUpdateCompendium, onUpdateVirtualRepo
}) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [swarmState, setSwarmState] = useState<'idle' | 'hypnotizing' | 'ready'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [alerts, setAlerts] = useState<{msg: string, type: 'info' | 'success' | 'error'}[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [context.chatHistory, streamingText, alerts, context.compendium?.summaries.length]);

  const addAlert = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setAlerts(prev => [{msg, type}, ...prev].slice(0, 10));
  };

  const startDeepScan = async () => {
    if (!context.repo) return;
    setSwarmState('hypnotizing');
    addAlert(`COMMENCING_ANALYSIS: Establishing neural link with ${context.repo.name}...`);
    
    try {
      const allFiles = await githubService.getAllRepoFilesRecursively(context.repo.name);
      setProgress({ current: 0, total: allFiles.length });
      
      const fileContents: {path: string, content: string}[] = [];
      for (const f of allFiles) {
        if (f.download_url) {
          try {
            const content = await githubService.getFileContent(f.download_url);
            fileContents.push({ path: f.path, content });
          } catch (e) {
            console.warn(`Failed to fetch ${f.path}`);
          }
        }
      }

      const summaries: FileAnalysis[] = [];
      const fileMap = new Map<string, FileAnalysis>();

      await geminiService.analyzeFullRepo(
        context.repo.name,
        fileContents,
        (status) => addAlert(status),
        (analysis) => {
          summaries.push(analysis);
          fileMap.set(analysis.path, analysis);
          setProgress(prev => ({ ...prev, current: summaries.length }));
          
          onUpdateCompendium({
            repoName: context.repo!.name,
            summaries: [...summaries],
            masterStory: "",
            sacredDecree: "Processing neural layers...",
            ultimateBibliography: "",
            analyzedAt: new Date().toISOString(),
            totalFilesProcessed: fileContents.length
          });
        }
      );

      addAlert("SYNTHESIZING: Building global architectural consensus...");
      const consensus = await geminiService.buildConsensus(context.repo.name, summaries);
      
      onUpdateVirtualRepo({ 
        name: context.repo.name, 
        files: fileMap, 
        consensus, 
        isReady: true 
      });

      onUpdateCompendium({
        repoName: context.repo.name,
        summaries,
        masterStory: consensus.architecture,
        sacredDecree: consensus.globalSacredDecree,
        ultimateBibliography: consensus.ultimateBibliography,
        analyzedAt: new Date().toISOString(),
        totalFilesProcessed: fileContents.length
      });

      setSwarmState('ready');
      addAlert("ANALYSIS_COMPLETE: System ready for export.", "success");
    } catch (err: any) {
      addAlert(`NEURAL_FAULT: ${err.message}`, "error");
      setSwarmState('idle');
    }
  };

  const handleExport = () => {
    if (context.compendium && context.repo) {
        const html = exportService.generateHTMLBlueprint(context.compendium);
        exportService.download(`${context.repo.name}_BLUEPRINT`, html);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating || !context.virtualRepo) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    onAddMessage(userMsg);
    setInput('');
    setIsGenerating(true);
    setStreamingText('');

    try {
      let fullResponse = '';
      const stream = geminiService.queryVirtualRepoStream(context.virtualRepo, input, context.chatHistory);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingText(fullResponse);
      }
      onAddMessage({ role: 'assistant', text: fullResponse });
      setStreamingText('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050508] border-l border-white/5 text-slate-300 relative">
      {/* Panel Header */}
      <div className="p-6 border-b border-white/5 bg-slate-900/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <i className="fas fa-brain text-lg"></i>
             </div>
             <div>
                <h3 className="font-header text-xs tracking-widest text-white uppercase">Neural Analyst</h3>
                <p className="text-[9px] font-mono text-indigo-400 uppercase mt-0.5">
                  {swarmState === 'hypnotizing' ? 'Scoping Synapses...' : 'Node Active'}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Global Controls */}
        <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={startDeepScan} 
              disabled={swarmState === 'hypnotizing'}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 shadow-lg shadow-indigo-600/20"
            >
              <i className="fas fa-radar mr-2"></i> Deep Scan
            </button>

            <button 
              onClick={handleExport}
              disabled={!context.compendium}
              className={`flex-1 py-3 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2
                ${context.compendium 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 animate-pulse' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'}`}
            >
              <i className="fas fa-file-export"></i> Download Report
            </button>
        </div>

        {swarmState === 'hypnotizing' && (
            <div className="mt-4">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                    ></div>
                </div>
            </div>
        )}
      </div>

      {/* Main Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar scroll-smooth pb-32">
        {/* Activity Logs */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[9px] text-slate-500 space-y-1">
          {alerts.slice(-5).reverse().map((a, i) => (
            <div key={i} className={a.type === 'success' ? 'text-emerald-400' : a.type === 'error' ? 'text-rose-400' : 'text-indigo-400'}>
              &gt; {a.msg}
            </div>
          ))}
        </div>

        {context.compendium && (
            <div className="space-y-12">
                {/* Decree */}
                <div className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/20">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4 block">Architectural Verdict</span>
                    <div className="text-lg font-serif text-white italic leading-relaxed">
                        <MarkdownRenderer content={context.compendium.sacredDecree} />
                    </div>
                </div>

                {/* Summaries */}
                {context.compendium.summaries.map((s, idx) => (
                    <div key={idx} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">
                          Artifact: {s.name}
                        </h4>
                        
                        {s.imageUrl && (
                            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <img src={s.imageUrl} alt="Visualization" className="w-full grayscale hover:grayscale-0 transition-all duration-700" />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900 rounded-xl border border-white/5">
                                <span className="text-[8px] font-bold text-indigo-400 uppercase mb-2 block">Logic Thoughts</span>
                                <p className="text-[10px] text-slate-400 italic">"{s.thoughts}"</p>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-xl border border-white/5">
                                <span className="text-[8px] font-bold text-amber-500 uppercase mb-2 block">Command</span>
                                <p className="text-[10px] text-white font-bold">{s.hypnoticCommand}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Chat History */}
        <div className="space-y-4 pt-8 border-t border-white/5">
            {context.chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 rounded-2xl max-w-[85%] text-xs ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-white/10 text-slate-300'}`}>
                        <MarkdownRenderer content={msg.text} />
                    </div>
                </div>
            ))}
            {streamingText && (
                <div className="flex justify-start">
                    <div className="p-4 rounded-2xl max-w-[85%] bg-slate-900 border border-white/10 text-slate-300 text-xs animate-pulse">
                        <MarkdownRenderer content={streamingText} />
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 bg-[#050508]/90 backdrop-blur-xl border-t border-white/5 absolute bottom-0 left-0 right-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating || !context.virtualRepo}
            placeholder={context.virtualRepo ? "Query the architecture..." : "Scan repo to chat."}
            className="flex-1 bg-black border border-white/10 rounded-xl py-3 px-4 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="w-11 h-11 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-colors">
             <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIStoryteller;
