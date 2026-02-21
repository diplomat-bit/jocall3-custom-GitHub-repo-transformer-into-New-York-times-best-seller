
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Manuscript, Chapter, FileAnalysis, VirtualRepository, ChatMessage } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// The Elite Model Swarm: Primary, Secondary, and Fallbacks
// Updated to use only permitted models according to guidelines
const MODEL_SWARM = [
  "gemini-3-pro-preview",
  "gemini-3-flash-preview",
  "gemini-flash-latest",
  "gemini-flash-lite-latest"
];

const IMAGE_MODELS = [
  "gemini-3-pro-image-preview",
  "gemini-2.5-flash-image"
];

/**
 * Advanced Neural Worker: Executes tasks with automatic model cycling and rate-limit recovery.
 */
async function executeNeuralTask<T>(
  prompt: string, 
  schema: any, 
  priorityModel: string = "gemini-3-pro-preview",
  maxRetries: number = 5
): Promise<T> {
  let attempt = 0;
  let currentModelIndex = MODEL_SWARM.indexOf(priorityModel);
  if (currentModelIndex === -1) currentModelIndex = 0;

  while (attempt < maxRetries) {
    const modelName = MODEL_SWARM[currentModelIndex % MODEL_SWARM.length];
    try {
      // Always initialize GoogleGenAI right before use with the named parameter apiKey
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.8,
        },
      });

      // Use .text property directly
      const text = response.text?.trim();
      if (!text) throw new Error("Empty neural response");
      return JSON.parse(text) as T;
    } catch (err: any) {
      const isRateLimit = err.message?.includes('429') || err.message?.includes('quota');
      console.warn(`[Neural Swarm] Model ${modelName} failed. Attempt ${attempt + 1}/${maxRetries}. Reason: ${err.message}`);
      
      if (isRateLimit) {
        currentModelIndex++;
        await sleep(2000 * (attempt + 1));
      } else {
        await sleep(500);
      }
      attempt++;
    }
  }
  throw new Error("Neural Swarm reached critical exhaustion. All models failed.");
}

export const geminiService = {
  // Fix: Added method to generate images using inlineData from response candidates
  async generateIllumination(prompt: string): Promise<string> {
    for (const model of IMAGE_MODELS) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [{ text: `High-end commercial tech visualization: ${prompt}. Cinematic lighting, 8k, dark mode aesthetic, deep indigo/gold, glassmorphism UI elements floating in void.` }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      } catch (e) {
        console.warn(`Image generation failed for ${model}, trying next...`);
      }
    }
    return '';
  },

  /**
   * Orchestrates the Parallel Manuscript Weaving process.
   */
  async weaveManuscript(repoName: string, files: {path: string, content: string}[], onStatus: (s: string) => void): Promise<Manuscript> {
    onStatus("MASTER_ARCHITECT: Analyzing codebase and drafting the Global Strategy...");
    
    const fileSample = files.slice(0, 15).map(f => `PATH: ${f.path}\nSUMMARY: ${f.content.slice(0, 500)}`).join("\n---\n");
    
    const outlineSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        preface: { type: Type.STRING },
        globalNarrativeArc: { type: Type.STRING, description: "The overarching theme that binds all chapters." },
        chapters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              focus: { type: Type.STRING },
              files: { type: Type.ARRAY, items: { type: Type.STRING } },
              narrativeHook: { type: Type.STRING, description: "How this chapter should transition from the previous one." }
            }
          }
        }
      },
      required: ["title", "preface", "globalNarrativeArc", "chapters"]
    };

    const strategy = await executeNeuralTask<any>(
      `ACT AS THE MASTER ARCHITECT. We are writing a high-end technical manuscript for the repository "${repoName}". 
      Draft a 5-7 chapter outline. Each chapter must represent a specific architectural layer.
      FILES TO ANALYZE:
      ${fileSample}`,
      outlineSchema,
      "gemini-3-pro-preview"
    );

    onStatus(`NEURAL_SWARM_ACTIVATED: Deploying scribes for ${strategy.chapters.length} parallel threads...`);

    const chapterPromises = strategy.chapters.map(async (ch: any, idx: number) => {
      const relevantFiles = files.filter(f => ch.files.includes(f.path) || idx === 0); 
      const contextSnippet = relevantFiles.map(f => `FILE: ${f.path}\nCODE:\n${f.content.slice(0, 8000)}`).join("\n\n");

      const chapterSchema = {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "Long-form book content in Markdown." },
          technicalVerdict: { type: Type.STRING },
          visualMetaphor: { type: Type.STRING }
        },
        required: ["content", "technicalVerdict", "visualMetaphor"]
      };

      const chapterData = await executeNeuralTask<any>(
        `ACT AS A SENIOR TECHNICAL SCRIBE. 
        BOOK TITLE: ${strategy.title}
        GLOBAL ARC: ${strategy.globalNarrativeArc}
        CHAPTER TITLE: ${ch.title}
        TRANSITION HOOK: ${ch.narrativeHook}
        
        Write a 1000-word chapter based on these files. Explain the logic as if it's a structural masterpiece. 
        
        FILES:
        ${contextSnippet}`,
        chapterSchema,
        idx % 2 === 0 ? "gemini-3-pro-preview" : "gemini-3-flash-preview"
      );

      const imageUrl = await this.generateIllumination(chapterData.visualMetaphor);

      return {
        id: `ch-${idx}`,
        title: ch.title,
        content: chapterData.content,
        technicalSummary: chapterData.technicalVerdict,
        imageryPrompt: chapterData.visualMetaphor,
        imageUrl
      } as Chapter;
    });

    const completedChapters = await Promise.all(chapterPromises);

    onStatus("FINAL_BINDING: Merging neural streams into physical archive...");

    return {
      repoName,
      title: strategy.title,
      preface: strategy.preface,
      chapters: completedChapters,
      conclusion: "This architecture stands as an eternal registry of logic and design.",
      generatedAt: new Date().toISOString(),
      author: "James Burvel (Neural Synthesis Edition)"
    };
  },

  // Fix: Added analyzeFullRepo method to process repository files individually
  async analyzeFullRepo(
    repoName: string,
    files: {path: string, content: string}[],
    onStatus: (s: string) => void,
    onAnalysis: (analysis: FileAnalysis) => void
  ): Promise<void> {
    for (const file of files) {
      onStatus(`Analyzing file: ${file.path}`);
      const analysisSchema = {
        type: Type.OBJECT,
        properties: {
          thoughts: { type: Type.STRING },
          hypnoticCommand: { type: Type.STRING },
          visualMetaphor: { type: Type.STRING }
        },
        required: ["thoughts", "hypnoticCommand", "visualMetaphor"]
      };

      const analysis = await executeNeuralTask<any>(
        `Analyze this file from the repository "${repoName}". 
        Provide "thoughts" on its architectural role, a "hypnoticCommand" that summarizes its essence in one sentence, and a "visualMetaphor" for image generation.
        FILE PATH: ${file.path}
        CONTENT:
        ${file.content.slice(0, 5000)}`,
        analysisSchema,
        "gemini-3-flash-preview"
      );

      const imageUrl = await this.generateIllumination(analysis.visualMetaphor);

      onAnalysis({
        path: file.path,
        name: file.path.split('/').pop() || '',
        thoughts: analysis.thoughts,
        hypnoticCommand: analysis.hypnoticCommand,
        imageUrl
      });
    }
  },

  // Fix: Added buildConsensus method to synthesize global architecture from file analyses
  async buildConsensus(repoName: string, summaries: FileAnalysis[]): Promise<any> {
    const summaryText = summaries.map(s => `FILE: ${s.path}\nSUMMARY: ${s.hypnoticCommand}`).join('\n');
    const consensusSchema = {
      type: Type.OBJECT,
      properties: {
        architecture: { type: Type.STRING },
        globalSacredDecree: { type: Type.STRING },
        ultimateBibliography: { type: Type.STRING }
      },
      required: ["architecture", "globalSacredDecree", "ultimateBibliography"]
    };

    return await executeNeuralTask<any>(
      `Based on the following file summaries for the repository "${repoName}", build a global architectural consensus.
      "architecture" should be a high-level summary.
      "globalSacredDecree" should be a poetic, philosophical statement about the codebase.
      "ultimateBibliography" should be a list of technologies used.
      
      SUMMARIES:
      ${summaryText}`,
      consensusSchema,
      "gemini-3-pro-preview"
    );
  },

  // Fix: Added queryVirtualRepoStream method for streaming chat interaction with the analyzed repository
  async *queryVirtualRepoStream(virtualRepo: VirtualRepository, query: string, history: ChatMessage[]): AsyncGenerator<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
            systemInstruction: `You are the Virtual Representative of the "${virtualRepo.name}" repository. 
            You have deep knowledge of its architecture: ${virtualRepo.consensus.architecture}.
            Global Sacred Decree: ${virtualRepo.consensus.globalSacredDecree}.
            You are helpful, analytical, and slightly poetic.`,
        }
    });

    const response = await chat.sendMessageStream({ message: query });
    for await (const chunk of response) {
      const c = chunk as GenerateContentResponse;
      // Use .text property directly as per guidelines
      yield c.text || "";
    }
  }
};
