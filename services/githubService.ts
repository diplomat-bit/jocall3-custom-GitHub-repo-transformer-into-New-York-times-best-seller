
import { GithubRepo, GithubFile } from '../types';

const BASE_URL = 'https://api.github.com';
const RAW_URL = 'https://raw.githubusercontent.com';
const DEFAULT_USERNAME = 'jocall3';

export const githubService = {
  async getUserRepos(username: string = DEFAULT_USERNAME): Promise<GithubRepo[]> {
    try {
      let allRepos: GithubRepo[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`${BASE_URL}/users/${username}/repos?sort=updated&per_page=100&page=${page}`);
        if (response.status === 403) {
            throw new Error("GitHub API Rate Limit Exceeded. Please try again later or use a token.");
        }
        if (!response.ok) {
          throw new Error(`GitHub Error: ${response.status}`);
        }
        const data: GithubRepo[] = await response.json();
        if (data.length === 0) {
          hasMore = false;
        } else {
          allRepos = [...allRepos, ...data];
          page++;
        }
        if (page > 10) break; 
      }
      return allRepos;
    } catch (e: any) {
      console.error("GitHub fetch failed", e);
      throw e;
    }
  },

  async getRepoDetails(repoName: string, username: string = DEFAULT_USERNAME): Promise<any> {
    const response = await fetch(`${BASE_URL}/repos/${username}/${repoName}`);
    if (!response.ok) throw new Error('Failed to fetch repo details');
    return response.json();
  },

  async getAllRepoFilesRecursively(repoName: string, path: string = '', username: string = DEFAULT_USERNAME): Promise<GithubFile[]> {
    try {
      const repoData = await this.getRepoDetails(repoName, username);
      const branch = repoData.default_branch || 'main';
      const response = await fetch(`${BASE_URL}/repos/${username}/${repoName}/git/trees/${branch}?recursive=1`);
      
      if (!response.ok) return this.getRepoContents(repoName, path, username);

      const data = await response.json();
      return data.tree
        .filter((item: any) => item.type === 'blob')
        .filter((item: any) => {
          const skip = /\.(png|jpg|jpeg|gif|ico|pdf|zip|exe|dll|woff|woff2|ttf|mp4|mov|avi|pyc|o|a)$/i.test(item.path);
          return !skip;
        })
        .map((item: any) => ({
          name: item.path.split('/').pop(),
          path: item.path,
          type: 'file',
          download_url: `${RAW_URL}/${username}/${repoName}/${branch}/${item.path}`,
          size: item.size || 0
        }));
    } catch (e) {
      return [];
    }
  },

  async getRepoContents(repoName: string, path: string = '', username: string = DEFAULT_USERNAME): Promise<GithubFile[]> {
    const response = await fetch(`${BASE_URL}/repos/${username}/${repoName}/contents/${path}`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    return response.json();
  },

  async getFileContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) return "Error: Failed to fetch content.";
      return response.text();
    } catch (e) {
      return "Error: Network failure.";
    }
  }
};
