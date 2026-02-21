
export interface GithubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export interface GithubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  download_url?: string;
  size: number;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  technicalSummary: string;
  imageryPrompt: string;
  imageUrl?: string;
}

export interface Manuscript {
  repoName: string;
  title: string;
  preface: string;
  chapters: Chapter[];
  conclusion: string;
  generatedAt: string;
  author: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

// Added KnowledgeBaseFile interface for repository exploration
export interface KnowledgeBaseFile extends GithubFile {
  repoName: string;
}

// Added AuditItem interface for tracking items in audit queue
export interface AuditItem {
  file: GithubFile;
  repo: GithubRepo;
}

// Added FileAnalysis interface for granular file reporting
export interface FileAnalysis {
  path: string;
  name: string;
  thoughts: string;
  hypnoticCommand: string;
  imageUrl?: string;
}

// Added ProjectCompendium interface for global architectural reports
export interface ProjectCompendium {
  repoName: string;
  summaries: FileAnalysis[];
  masterStory: string;
  sacredDecree: string;
  ultimateBibliography: string;
  analyzedAt: string;
  totalFilesProcessed: number;
}

// Added VirtualRepository interface for chat-based architectural querying
export interface VirtualRepository {
  name: string;
  files: Map<string, FileAnalysis>;
  consensus: any;
  isReady: boolean;
}

export interface SelectedContext {
  repo: GithubRepo | null;
  manuscript: Manuscript | null;
  chatHistory: ChatMessage[];
  isGenerating: boolean;
  status: string;
  // Added optional compendium and virtualRepo for deep analysis features
  compendium?: ProjectCompendium | null;
  virtualRepo?: VirtualRepository | null;
}

export interface RepoSession {
  repoId: number;
  manuscript: Manuscript | null;
  chatHistory: ChatMessage[];
}
