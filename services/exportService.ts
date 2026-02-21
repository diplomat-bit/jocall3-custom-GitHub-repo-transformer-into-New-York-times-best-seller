
import { Manuscript, ProjectCompendium, GithubRepo } from '../types';

export const exportService = {
  downloadManuscript(manuscript: Manuscript) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${manuscript.title} | Archive</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #030305;
            --text: #e2e8f0;
            --gold: #d4af37;
            --accent: #6366f1;
            --muted: #64748b;
        }
        * { box-sizing: border-box; }
        body { 
            font-family: 'EB Garamond', serif; 
            background: var(--bg); 
            color: var(--text); 
            line-height: 1.8; 
            margin: 0; 
            padding: 0;
            overflow-x: hidden;
        }
        .container { max-width: 900px; margin: 0 auto; padding: 0 40px; }
        
        /* Cover Page */
        .cover {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            background: radial-gradient(circle at center, rgba(99,102,241,0.05) 0%, transparent 70%);
        }
        .cover-label { font-family: 'Fira Code', monospace; font-size: 10px; letter-spacing: 0.8em; text-transform: uppercase; color: var(--accent); margin-bottom: 40px; }
        h1 { font-family: 'Cinzel', serif; font-size: 5vw; margin: 0; line-height: 1.1; color: #fff; text-transform: uppercase; }
        .author-line { margin-top: 60px; font-size: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; width: 300px; }

        /* Preface */
        .preface { font-size: 28px; font-style: italic; color: var(--muted); margin: 200px 0; line-height: 1.6; text-align: center; font-family: 'EB Garamond', serif; }

        /* Chapters */
        section { margin-bottom: 300px; }
        .chapter-header { margin-bottom: 80px; position: relative; }
        .chapter-num { font-family: 'Cinzel', serif; font-size: 120px; position: absolute; top: -60px; left: -40px; opacity: 0.05; pointer-events: none; }
        h2 { font-family: 'Cinzel', serif; font-size: 48px; color: #fff; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px; }
        
        .illustration { width: 100%; border-radius: 20px; margin: 60px 0; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 50px 100px -20px rgba(0,0,0,0.8); }
        
        .content { font-size: 22px; text-align: justify; }
        .content p { margin-bottom: 2em; }
        
        .verdict {
            background: rgba(99,102,241,0.03);
            border-left: 4px solid var(--accent);
            padding: 40px;
            margin-top: 80px;
            border-radius: 0 20px 20px 0;
            font-family: 'Fira Code', monospace;
            font-size: 14px;
        }
        .verdict-title { color: var(--accent); font-weight: 900; margin-bottom: 10px; font-size: 10px; letter-spacing: 3px; }

        footer { text-align: center; padding: 100px 0; opacity: 0.3; font-size: 12px; letter-spacing: 2px; }

        /* Typography Extras */
        h1, h2, h3 { font-weight: 900; }
        strong { color: #fff; }
        code { font-family: 'Fira Code', monospace; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
        pre { background: #000; padding: 30px; border-radius: 10px; overflow-x: auto; border: 1px solid rgba(255,255,255,0.05); }

        @media print {
            body { background: #fff; color: #000; }
            .cover, section { height: auto; page-break-after: always; }
            h1, h2 { color: #000; }
            .illustration { filter: grayscale(100%); }
        }
    </style>
</head>
<body>
    <div class="cover">
        <div class="cover-label">Neural Manuscript Archive</div>
        <h1>${manuscript.title}</h1>
        <div class="author-line">BY ${manuscript.author}</div>
        <div style="margin-top: 10px; font-family: 'Fira Code'; font-size: 10px; opacity: 0.4;">REGISTRY DATE: ${new Date(manuscript.generatedAt).toDateString()}</div>
    </div>

    <div class="container">
        <div class="preface">
            ${manuscript.preface}
        </div>

        ${manuscript.chapters.map((ch, idx) => `
            <section>
                <div class="chapter-header">
                    <div class="chapter-num">${idx + 1}</div>
                    <h2>${ch.title}</h2>
                </div>
                
                ${ch.imageUrl ? `<img src="${ch.imageUrl}" class="illustration" alt="Visual Synthesis">` : ''}
                
                <div class="content">
                    ${ch.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
                </div>
                
                <div class="verdict">
                    <div class="verdict-title">// SYSTEM_ARCHITECT_VERDICT</div>
                    ${ch.technicalSummary}
                </div>
            </section>
        `).join('')}

        <footer>
            THE ARCANE NODE PORTFOLIO ENGINE // END OF REGISTRY
        </footer>
    </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${manuscript.repoName.toUpperCase()}_MANUSCRIPT.html`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Fix: Added generateHTMLBlueprint to create an architectural report from a compendium
  generateHTMLBlueprint(compendium: ProjectCompendium): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Blueprint: ${compendium.repoName}</title>
    <style>
        body { font-family: sans-serif; background: #050508; color: #fff; padding: 40px; line-height: 1.6; }
        .decree { font-style: italic; color: #6366f1; font-size: 1.5rem; margin-bottom: 40px; border-left: 4px solid #6366f1; padding-left: 20px; }
        .artifact { border: 1px solid #1e293b; padding: 30px; margin-bottom: 30px; border-radius: 15px; background: #0a0a0f; }
        img { max-width: 100%; height: auto; display: block; margin: 20px 0; border-radius: 10px; box-shadow: 0 0 30px rgba(0,0,0,0.5); }
        h1 { color: #6366f1; text-transform: uppercase; letter-spacing: 0.1em; }
        h2 { border-bottom: 1px solid #1e293b; padding-bottom: 10px; margin-top: 50px; }
    </style>
</head>
<body>
    <h1>Architectural Blueprint: ${compendium.repoName}</h1>
    <div class="decree">${compendium.sacredDecree}</div>
    
    <h2>Global Architecture Consensus</h2>
    <div style="white-space: pre-wrap;">${compendium.masterStory}</div>
    
    <h2>Neural Bibliography (Tech Stack)</h2>
    <div>${compendium.ultimateBibliography}</div>
    
    <h2>Artifact Analysis Detail</h2>
    ${compendium.summaries.map(s => `
        <div class="artifact">
            <h3>${s.name}</h3>
            <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 15px;">PATH: ${s.path}</div>
            <p><strong>Neural Thoughts:</strong> ${s.thoughts}</p>
            <p><strong>Hypnotic Command:</strong> ${s.hypnoticCommand}</p>
            ${s.imageUrl ? `<img src="${s.imageUrl}" alt="Visual Synthesis" />` : ''}
        </div>
    `).join('')}
    
    <footer style="margin-top: 100px; text-align: center; color: #64748b; font-size: 0.8rem;">
        GENERATED AT: ${new Date(compendium.analyzedAt).toLocaleString()}
    </footer>
</body>
</html>
`;
  },

  // Fix: Added generateMasterResume to create a summary of all user repositories
  generateMasterResume(repos: GithubRepo[]): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Portfolio Registry Index</title>
    <style>
        body { font-family: 'Cinzel', serif; background: #050508; color: #e2e8f0; padding: 60px; }
        .repo { margin-bottom: 40px; border: 1px solid #1e293b; padding: 30px; border-radius: 20px; background: #0a0a0f; }
        h1 { color: #6366f1; border-bottom: 2px solid #6366f1; display: inline-block; font-size: 3rem; margin-bottom: 40px; }
        .meta { font-family: monospace; font-size: 0.8rem; color: #6366f1; background: rgba(99,102,241,0.1); padding: 5px 15px; rounded: 10px; display: inline-block; }
        h2 { margin-top: 0; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; }
        p { color: #94a3b8; }
    </style>
</head>
<body>
    <h1>The Arcane Node Registry</h1>
    <p style="font-size: 1.2rem; font-style: italic; margin-bottom: 60px;">A master log of architectural feats and high-logic repositories.</p>
    
    ${repos.map(repo => `
        <div class="repo">
            <div class="meta">${repo.language || 'POLYLINGUAL'}</div>
            <h2>${repo.name}</h2>
            <p>${repo.description || 'Accessing this module reveals hidden architectural patterns and refined logic.'}</p>
            <div style="margin-top: 20px; font-size: 0.7rem; color: #475569;">
                STARS: ${repo.stargazers_count} | FORKS: ${repo.forks_count} | LAST UPDATED: ${new Date(repo.updated_at).toLocaleDateString()}
            </div>
        </div>
    `).join('')}
    
    <footer style="text-align: center; margin-top: 100px; color: #475569; font-size: 0.8rem;">
        END OF REGISTRY LOG
    </footer>
</body>
</html>
`;
  },

  download(filename: string, content: string, type: string = 'text/html') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
