import { simpleGit } from 'simple-git';
import { config } from '../../config.js';

class GitSync {
  constructor() {
    this.git = simpleGit(config.gitRepoPath);
    this.git.addConfig('user.name', config.gitAuthorName);
    this.git.addConfig('user.email', config.gitAuthorEmail);
    this.pendingPush = false;
    this.pushRetries = 0;
    this.maxRetries = 3;

    // Set up auto-push interval if enabled
    if (config.autoPush) {
      setInterval(() => this.handlePendingPush(), config.pushInterval);
    }
  }

  async getStatus() {
    try {
      const status = await this.git.status();
      return {
        branch: status.current,
        dirty: status.files.length > 0,
        uncommitted: status.files.map((f) => ({
          path: f.path,
          status: f.working_dir,
        })),
        ahead: status.ahead,
        behind: status.behind,
      };
    } catch (error) {
      console.error('Error getting git status:', error.message);
      throw new Error(`Failed to get git status: ${error.message}`);
    }
  }

  async autoCommit(message) {
    try {
      // Honor the AUTO_COMMIT switch — when disabled, never touch git.
      if (!config.autoCommit) {
        return { success: true, message: 'Auto-commit disabled', sha: null };
      }

      // Check if there are changes
      const status = await this.git.status();
      if (status.files.length === 0) {
        return { success: true, message: 'No changes to commit', sha: null };
      }

      // Add all changes
      await this.git.add('.');

      // Commit
      const result = await this.git.commit(message);
      this.pendingPush = true;

      return {
        success: true,
        message: 'Committed successfully',
        sha: result.commit,
      };
    } catch (error) {
      if (error.message.includes('nothing to commit')) {
        return { success: true, message: 'No changes to commit', sha: null };
      }
      console.error('Error committing:', error.message);
      throw new Error(`Failed to commit: ${error.message}`);
    }
  }

  async autoPush() {
    try {
      const result = await this.git.push(['-u', 'origin', config.gitBranch]);
      this.pendingPush = false;
      this.pushRetries = 0;
      return {
        success: true,
        message: 'Pushed successfully',
      };
    } catch (error) {
      console.error('Error pushing:', error.message);
      this.pushRetries += 1;

      if (this.pushRetries < this.maxRetries) {
        this.pendingPush = true;
      }

      throw new Error(`Failed to push: ${error.message}`);
    }
  }

  async handlePendingPush() {
    if (!this.pendingPush) return;

    try {
      await this.autoPush();
    } catch (error) {
      console.warn('Push retry failed:', error.message);
    }
  }

  async getCommitHistory(limit = 20) {
    try {
      const log = await this.git.log({ maxCount: limit });
      return log.all.map((commit) => ({
        sha: commit.hash.substring(0, 7),
        fullSha: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
      }));
    } catch (error) {
      console.error('Error getting commit history:', error.message);
      throw new Error(`Failed to get commit history: ${error.message}`);
    }
  }

  async pull() {
    try {
      await this.git.pull('origin', config.gitBranch);
      return { success: true, message: 'Pulled successfully' };
    } catch (error) {
      console.error('Error pulling:', error.message);
      throw new Error(`Failed to pull: ${error.message}`);
    }
  }
}

export const gitSync = new GitSync();
