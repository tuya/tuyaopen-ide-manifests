// API Client for making requests to the backend

class ApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const detail = errorData.errors?.length
          ? `: ${errorData.errors.map(e => typeof e === 'string' ? e : `${e.path} ${e.message}`).join('; ')}`
          : '';
        throw new Error((errorData.error?.message || errorData.error || 'Request failed') + detail);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${url}]:`, error);
      throw error;
    }
  }

  // Status endpoints
  async getStatus() {
    return this.request('GET', '/status');
  }

  async getGitStatus() {
    return this.request('GET', '/status/git');
  }

  async getTags() {
    return this.request('GET', '/status/tags');
  }

  async pullChanges() {
    return this.request('POST', '/status/pull');
  }

  async pushChanges(commitMessage = null) {
    return this.request('POST', '/status/push', { commitMessage });
  }

  // Board endpoints
  async getBoards() {
    return this.request('GET', '/boards');
  }

  async getBoard(id) {
    return this.request('GET', `/boards/${id}`);
  }

  async createBoard(data) {
    return this.request('POST', '/boards', data);
  }

  async updateBoard(id, data) {
    return this.request('PATCH', `/boards/${id}`, data);
  }

  async deleteBoard(id, autoCommit = true) {
    return this.request('DELETE', `/boards/${id}`, { autoCommit });
  }

  async validateBoard(data) {
    return this.request('POST', `/boards/temp/validate`, data);
  }

  // Image endpoints
  async uploadImage(boardId, fileOrUrl, filename = null, autoCommit = true, isUrl = false) {
    // Handle URL-based image upload
    if (isUrl || (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('https://'))) {
      return this.request('POST', '/images/upload', {
        boardId,
        imageUrl: fileOrUrl,
        autoCommit,
        autoUpdate: true,
      });
    }

    // Handle file-based image upload
    const formData = new FormData();
    formData.append('boardId', boardId);
    formData.append('image', fileOrUrl, filename || 'image.jpg');
    if (filename) formData.append('filename', filename);
    formData.append('autoCommit', autoCommit);
    formData.append('autoUpdate', 'true');

    const url = `${this.baseUrl}/images/upload`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  async getBoardImages(boardId) {
    return this.request('GET', `/images/${boardId}`);
  }

  async deleteImage(boardId, filename, autoCommit = true) {
    return this.request('DELETE', `/images/${boardId}/${filename}`, { autoCommit });
  }

  // Peripheral endpoints
  async getPeripherals(boardId) {
    return this.request('GET', `/boards/${boardId}/peripherals`);
  }

  async updatePeripherals(boardId, data) {
    return this.request('PATCH', `/boards/${boardId}/peripherals`, data);
  }

  // Expansion pins endpoints
  async getExpansionPins(boardId) {
    return this.request('GET', `/boards/${boardId}/expansion-pins`);
  }

  async updateExpansionPins(boardId, gpios) {
    return this.request('PATCH', `/boards/${boardId}/expansion-pins`, { gpios });
  }

  async getPlatformPinout(platformId) {
    return this.request('GET', `/boards/platforms/${platformId}/pinout`);
  }

  async getPlatformPeripherals(platformId) {
    return this.request('GET', `/boards/platforms/${platformId}/peripherals`);
  }

  // Demo endpoints
  async getDemos() {
    return this.request('GET', '/demos');
  }

  async getDemo(id) {
    return this.request('GET', `/demos/${id}`);
  }

  async createDemo(data) {
    return this.request('POST', '/demos', data);
  }

  async updateDemo(id, data) {
    return this.request('PATCH', `/demos/${id}`, data);
  }

  async deleteDemo(id) {
    return this.request('DELETE', `/demos/${id}`);
  }

  // Demo image endpoints
  async getDemoImages(demoId) {
    return this.request('GET', `/demo-images/${demoId}`);
  }

  async uploadDemoImage(demoId, fileOrUrl, filename = null, autoCommit = true, isUrl = false) {
    if (isUrl || (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('https://'))) {
      return this.request('POST', '/demo-images/upload', {
        demoId,
        imageUrl: fileOrUrl,
        autoCommit,
        autoUpdate: true,
      });
    }

    const formData = new FormData();
    formData.append('demoId', demoId);
    formData.append('image', fileOrUrl, filename || 'image.jpg');
    if (filename) formData.append('filename', filename);
    formData.append('autoCommit', autoCommit);
    formData.append('autoUpdate', 'true');

    const url = `${this.baseUrl}/demo-images/upload`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.error || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Demo image upload error:', error);
      throw error;
    }
  }

  async deleteDemoImage(demoId, filename, autoCommit = true) {
    return this.request('DELETE', `/demo-images/${demoId}/${filename}`, { autoCommit });
  }
}

export const apiClient = new ApiClient();
