// Main application controller

import { apiClient } from './api-client.js';
import { formatDate, showNotification, showError, debounce, escapeHtml } from './utils.js';
import imageUploader from './image-uploader.js';
import { renderBoardCard, renderBoardForm, saveBoardForm, deleteBoardPrompt, setupFormValidation, initGlobalTags, setSelectedTags } from './board-editor.js';
import { renderPeripheralEditor, isDirty as periIsDirty } from './peripheral-editor.js';
import { renderExpansionPinsEditor } from './expansion-pins-editor.js';
import { renderDemoCard, renderDemoForm, saveDemoForm, deleteDemoAction } from './demo-editor.js';
import i18n from './i18n.js';

let currentTab = 'boards';
let platforms = [];
let formDirty = false;  // Track unsaved changes

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize language
    setupLanguageSwitcher();
    updateUILanguage();

    // Initialize modules
    imageUploader.init();

    // Set up event listeners
    setupNavigation();
    setupBoardsTab();
    setupDemosTab();
    setupGitHistoryTab();

    // Load initial data
    await loadInitialData();
    await loadBoards();

    // Set up auto-refresh
    setInterval(updateGitStatus, 10000); // Every 10 seconds
  } catch (error) {
    showError('Initialization Error', error.message);
  }
});

// ========== Language Support ==========
function setupLanguageSwitcher() {
  const switcher = document.getElementById('languageSwitcher');
  if (!switcher) return;

  // Set initial value
  switcher.value = i18n.getLanguage();

  // Handle language change
  switcher.addEventListener('change', (e) => {
    const lang = e.target.value;
    i18n.setLanguage(lang);
    updateUILanguage();
  });
}

function updateUILanguage() {
  // Update navigation labels and text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = i18n.t(el.getAttribute('data-i18n'));
  });

  // Update title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = i18n.t(el.getAttribute('data-i18n-title'));
  });

  // Update document title
  const titleEl = document.querySelector('title');
  if (titleEl) {
    titleEl.textContent = i18n.t('manifestEditor') + ' - TuyaOpen IDE';
  }

  // Reload current page
  const currentTab = document.querySelector('.nav-item.active')?.dataset.tab;
  if (currentTab === 'boards') {
    loadBoards();
  } else if (currentTab === 'demos') {
    loadDemos();
  } else if (currentTab === 'git-history') {
    loadCommitHistory();
  }
}

// ========== Navigation ==========
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      if (tab) {
        if (formDirty) {
          showUnsavedChangesConfirm(() => switchTab(tab));
        } else {
          switchTab(tab);
        }
      }
    });
  });
}

function switchTab(tab) {
  // Update nav
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Update content
  document.querySelectorAll('.tab-content').forEach((section) => {
    section.classList.remove('active');
  });
  const tabElement = document.getElementById(`${tab}-tab`);
  if (tabElement) {
    tabElement.classList.add('active');
  }

  currentTab = tab;

  // Load tab-specific data
  if (tab === 'git-history') {
    loadCommitHistory();
  } else if (tab === 'demos') {
    loadDemos();
  }
}

// ========== Unsaved Changes Confirmation ==========
function showUnsavedChangesConfirm(onDiscard) {
  const confirmResult = confirm(i18n.t('unsavedChangesTitle') || '⚠️ Unsaved Changes\n\nYou have unsaved changes. Do you want to discard them?');
  if (confirmResult) {
    formDirty = false;
    if (onDiscard) onDiscard();
  }
}

// ========== Initial Data Load ==========
async function loadInitialData() {
  try {
    const status = await apiClient.getStatus();

    // Update git status
    updateGitStatusDisplay(status.git);

    // Update repo status sidebar
    updateRepoStatusPanel(status);
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
}

// ========== Boards Tab ==========
function setupBoardsTab() {
  const addBtn = document.getElementById('addBoardBtn');
  const pullBtn = document.getElementById('pullBtn');
  const pushBtn = document.getElementById('pushBtn');

  if (addBtn) {
    addBtn.addEventListener('click', () => openBoardForm(null));
  }

  if (pullBtn) {
    pullBtn.addEventListener('click', async () => {
      try {
        pullBtn.disabled = true;
        const result = await apiClient.pullChanges();
        showNotification('Pulled latest changes');
        await loadBoards();
        await updateGitStatus();
      } catch (error) {
        showError('Pull Failed', error.message);
      } finally {
        pullBtn.disabled = false;
      }
    });
  }

  if (pushBtn) {
    pushBtn.addEventListener('click', async () => {
      try {
        await showPushConfirmation();
      } catch (error) {
        showError('Push Error', error.message);
      }
    });
  }

  // Listen for image upload events
  window.addEventListener('imageUploaded', (e) => {
    loadBoards();
    updateGitStatus();
  });
}

async function loadBoards() {
  const boardsList = document.getElementById('boardsList');
  if (!boardsList) return;

  boardsList.innerHTML = '<p class="loading-text">Loading boards...</p>';
  boardsList.classList.add('loading');

  try {
    const result = await apiClient.getBoards();
    const boards = result.boards || [];

    if (boards.length === 0) {
      boardsList.innerHTML = '<p class="loading-text">No boards yet. Click "Add New Board" to create one.</p>';
    } else {
      boardsList.innerHTML = boards.map((board) => renderBoardCard(board)).join('');

      // Attach event listeners
      document.querySelectorAll('.edit-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const boardId = btn.dataset.boardId;
          openBoardForm(boardId);
        });
      });

      document.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const boardId = btn.dataset.boardId;
          deleteBoardPrompt(boardId).then((success) => {
            if (success) loadBoards();
          });
        });
      });
    }

    boardsList.classList.remove('loading');
  } catch (error) {
    boardsList.innerHTML = `<p class="loading-text" style="color: var(--color-error);">Error: ${error.message}</p>`;
  }
}

async function openBoardForm(boardId = null) {
  const modal = document.getElementById('boardModal');
  const modalTitle = document.getElementById('modalTitle');
  const formContainer = document.getElementById('boardFormContainer');
  const closeBtn = document.getElementById('closeModalBtn');

  if (!modal) return;

  // Initialize global tags from all boards
  await initGlobalTags();

  let board = null;
  if (boardId) {
    try {
      const result = await apiClient.getBoard(boardId);
      board = result.board;
      modalTitle.textContent = `Edit Board: ${boardId}`;
    } catch (error) {
      showError('Load Failed', `Failed to load board "${boardId}"`);
      return;
    }
  } else {
    modalTitle.textContent = 'Create New Board';
  }

  // Load platforms if not already loaded
  if (platforms.length === 0) {
    try {
      const result = await apiClient.getStatus();
      // In a real app, we'd load platforms from /api/platforms
      // For now, we'll use hardcoded defaults
      platforms = ['t5ai', 'esp32-s3', 'esp32', 'bk7231n'];
    } catch (error) {
      console.error('Error loading platforms:', error);
    }
  }

  formContainer.innerHTML = renderBoardForm(board);

  // Populate platforms dropdown
  const platformSelect = document.getElementById('platformId');
  if (platformSelect) {
    platforms.forEach((plat) => {
      if (!platformSelect.querySelector(`option[value="${plat}"]`)) {
        const option = document.createElement('option');
        option.value = plat;
        option.textContent = plat;
        platformSelect.appendChild(option);
      }
    });
  }

  // Set up form handlers and validation
  const form = document.getElementById('boardForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const uploadImageBtn = document.getElementById('uploadImageBtn');

  // Reset dirty flag when opening form
  formDirty = false;

  if (form) {
    form.dataset.isEdit = !!boardId;

    // Track form changes
    form.addEventListener('change', () => {
      formDirty = true;
    });

    form.addEventListener('input', () => {
      formDirty = true;
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const success = await saveBoardForm(form);
      if (success) {
        formDirty = false;
        modal.classList.add('hidden');
        loadBoards();
      }
    });

    // Auto-save published toggle immediately for existing boards
    const publishedCheckbox = document.getElementById('boardPublished');
    if (publishedCheckbox && boardId) {
      publishedCheckbox.addEventListener('change', async () => {
        try {
          await apiClient.updateBoard(boardId, { published: publishedCheckbox.checked, autoCommit: true });
          showNotification(`Board "${boardId}" ${publishedCheckbox.checked ? 'published' : 'unpublished'}`);
          loadBoards();
        } catch (error) {
          showError('Update Failed', error.message);
          publishedCheckbox.checked = !publishedCheckbox.checked;
        }
      });
    }
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (formDirty) {
        showUnsavedChangesConfirm(() => modal.classList.add('hidden'));
      } else {
        modal.classList.add('hidden');
      }
    });
  }

  closeBtn.addEventListener('click', () => {
    if (formDirty) {
      showUnsavedChangesConfirm(() => modal.classList.add('hidden'));
    } else {
      modal.classList.add('hidden');
    }
  });

  // Set up URL validation and tags autocomplete
  setupFormValidation();

  // Pre-select existing tags for editing
  if (boardId && board && Array.isArray(board.tags)) {
    setSelectedTags(board.tags);
  }

  modal.classList.remove('hidden');

  // Set up inline image upload for existing boards
  if (boardId) {
    imageUploader.setupInlineUpload(boardId);
  }

  // Set up modal tabs (show only in edit mode)
  const tabsEl = document.getElementById('boardModalTabs');
  const infoPane = document.getElementById('boardFormContainer');
  const periPane = document.getElementById('peripheralEditorContainer');
  const expPinsPane = document.getElementById('expansionPinsContainer');
  if (tabsEl && infoPane && periPane && expPinsPane) {
    if (boardId) {
      tabsEl.style.display = '';
      // Reset to info tab
      infoPane.style.display = '';
      infoPane.classList.add('active');
      periPane.style.display = 'none';
      periPane.classList.remove('active');
      expPinsPane.style.display = 'none';
      expPinsPane.classList.remove('active');
      tabsEl.querySelectorAll('.board-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.boardTab === 'info');
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        newTab.addEventListener('click', () => {
          tabsEl.querySelectorAll('.board-tab').forEach(t => t.classList.remove('active'));
          newTab.classList.add('active');
          const target = newTab.dataset.boardTab;
          infoPane.style.display = target === 'info' ? '' : 'none';
          infoPane.classList.toggle('active', target === 'info');
          periPane.style.display = target === 'peripherals' ? '' : 'none';
          periPane.classList.toggle('active', target === 'peripherals');
          expPinsPane.style.display = target === 'expansion-pins' ? '' : 'none';
          expPinsPane.classList.toggle('active', target === 'expansion-pins');
          if (target === 'expansion-pins') {
            renderExpansionPinsEditor('expansionPinsContainer', boardId, board.platformId);
          }
        });
      });
      renderPeripheralEditor('peripheralEditorContainer', boardId);
    } else {
      tabsEl.style.display = 'none';
      periPane.style.display = 'none';
      expPinsPane.style.display = 'none';
      infoPane.style.display = '';
    }
  }
}

// ========== Demos Tab ==========
let demosCache = [];

function setupDemosTab() {
  const addBtn = document.getElementById('addDemoBtn');
  const searchInput = document.getElementById('demoSearch');
  const filterSelect = document.getElementById('demoFilterType');

  if (addBtn) {
    addBtn.addEventListener('click', () => openDemoForm(null));
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => filterDemos(), 200));
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', () => filterDemos());
  }
}

async function loadDemos() {
  const demosList = document.getElementById('demosList');
  if (!demosList) return;

  demosList.innerHTML = `<p class="loading-text">${i18n.t('loadingDemos')}</p>`;

  try {
    const result = await apiClient.getDemos();
    demosCache = result.demos || result.items || [];
    filterDemos();
  } catch (error) {
    console.error('[loadDemos] error:', error);
    demosList.innerHTML = `<p class="loading-text" style="color: var(--color-error);">Error: ${error.message}</p>`;
  }
}

function filterDemos() {
  const searchVal = (document.getElementById('demoSearch')?.value || '').toLowerCase();
  const filterVal = document.getElementById('demoFilterType')?.value || '';

  let filtered = demosCache;

  if (filterVal) {
    filtered = filtered.filter(d => d.tags?.includes(filterVal));
  }

  if (searchVal) {
    filtered = filtered.filter(d => {
      const nameEn = (typeof d.name === 'object' ? d.name.en : d.name) || '';
      const nameZh = (typeof d.name === 'object' ? d.name['zh-CN'] : '') || '';
      const summaryEn = (typeof d.summary === 'object' ? d.summary.en : '') || '';
      const tagsStr = (d.tags || []).join(' ');
      const searchable = `${d.id} ${nameEn} ${nameZh} ${summaryEn} ${tagsStr} ${d.source?.subpath || ''}`.toLowerCase();
      return searchable.includes(searchVal);
    });
  }

  renderDemosList(filtered);
}

function renderDemosList(demos) {
  const demosList = document.getElementById('demosList');
  if (!demosList) return;

  if (demos.length === 0) {
    demosList.innerHTML = `<p class="loading-text">${i18n.t('demosEmpty') || 'No demos found.'}</p>`;
    return;
  }

  demosList.innerHTML = demos.map(d => renderDemoCard(d)).join('');

  // Attach event listeners
  demosList.querySelectorAll('.demo-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDemoForm(btn.dataset.demoId);
    });
  });

  demosList.querySelectorAll('.demo-delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const success = await deleteDemoAction(btn.dataset.demoId);
      if (success) loadDemos();
    });
  });
}

async function openDemoForm(demoId = null) {
  const modal = document.getElementById('demoModal');
  const modalTitle = document.getElementById('demoModalTitle');
  const formContainer = document.getElementById('demoFormContainer');
  const closeBtn = document.getElementById('closeDemoModalBtn');

  if (!modal) return;

  let demo = null;
  if (demoId) {
    try {
      const result = await apiClient.getDemo(demoId);
      demo = result.demo;
      modalTitle.textContent = `${i18n.t('demoFormTitleEdit') || 'Edit Demo'}: ${demoId}`;
    } catch (error) {
      showError('Load Failed', error.message);
      return;
    }
  } else {
    modalTitle.textContent = i18n.t('demoFormTitle') || 'Add Demo';
  }

  formContainer.innerHTML = renderDemoForm(demo);

  // Wire compatibility radio → boards field visibility
  const radios = formContainer.querySelectorAll('input[name="compatibilityType"]');
  const boardsGroup = document.getElementById('demoBoardsGroup');
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (boardsGroup) {
        boardsGroup.style.display = radio.value === 'universal' && radio.checked ? 'none' : '';
      }
    });
  });

  // Wire configs map add/remove buttons
  const addConfigRowBtn = document.getElementById('addConfigRowBtn');
  const configsRowsContainer = document.getElementById('configsRows');

  if (addConfigRowBtn && configsRowsContainer) {
    addConfigRowBtn.addEventListener('click', () => {
      const idx = configsRowsContainer.querySelectorAll('.configs-row').length;
      const rowHtml = `
        <div class="configs-row" data-row-idx="${idx}">
          <input type="text" class="form-input configs-key" value="" placeholder="TUYA_T5AI_EVB">
          <input type="text" class="form-input configs-value" value="" placeholder="config/TUYA_T5AI_EVB.config">
          <button type="button" class="btn btn-sm btn-danger btn-remove configs-remove-btn">✕</button>
        </div>
      `;
      configsRowsContainer.insertAdjacentHTML('beforeend', rowHtml);
    });

    // Delegate remove button clicks
    configsRowsContainer.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.configs-remove-btn');
      if (removeBtn) {
        removeBtn.closest('.configs-row').remove();
      }
    });
  }

  // Wire form submission
  const form = document.getElementById('demoForm');
  const cancelBtn = document.getElementById('demoCancelBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const success = await saveDemoForm(form, demoId);
      if (success) {
        modal.classList.add('hidden');
        loadDemos();
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.add('hidden');
  }

  // Wire demo image upload (only for existing demos)
  if (demoId) {
    setupDemoImageUpload(demoId, modal);
  }

  modal.classList.remove('hidden');
}

function setupDemoImageUpload(demoId, modal) {
  const section = modal.querySelector('#demoImageUploadSection');
  if (!section) return;

  const zone = section.querySelector('.image-upload-zone');
  const fileInput = section.querySelector('#demoImageInput');
  const sourceTabs = section.querySelectorAll('.image-source-tab');
  const sourceFile = section.querySelector('#demoImageSourceFile');
  const sourceUrl = section.querySelector('#demoImageSourceUrl');
  const urlInput = section.querySelector('#demoImageUrl');
  const confirmUrlBtn = section.querySelector('#demoConfirmUrlBtn');
  const deleteBtn = section.querySelector('#demoDeleteImageBtn');

  // Tab switching
  if (sourceTabs.length) {
    sourceTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const source = tab.dataset.source;
        sourceTabs.forEach(t => {
          if (t.dataset.source === source) {
            t.style.color = 'var(--color-primary)';
            t.style.fontWeight = '600';
            t.style.borderBottom = '2px solid var(--color-primary)';
          } else {
            t.style.color = 'var(--color-muted)';
            t.style.fontWeight = '500';
            t.style.borderBottom = 'none';
          }
        });
        if (source === 'file') {
          sourceFile.style.display = 'block';
          sourceUrl.style.display = 'none';
        } else {
          sourceFile.style.display = 'none';
          sourceUrl.style.display = 'block';
        }
      });
    });
  }

  // File drag & drop
  if (zone) {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.style.borderColor = 'var(--color-primary)';
    });
    zone.addEventListener('dragleave', () => {
      zone.style.borderColor = 'var(--color-border)';
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.borderColor = 'var(--color-border)';
      if (e.dataTransfer.files.length > 0) {
        handleDemoImageFile(e.dataTransfer.files[0], demoId);
      }
    });
    zone.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      fileInput?.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleDemoImageFile(e.target.files[0], demoId);
      }
    });
  }

  // URL upload
  if (confirmUrlBtn) {
    confirmUrlBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = urlInput?.value?.trim();
      if (!url) {
        showError('Missing URL', 'Please enter an image URL');
        return;
      }
      if (!url.startsWith('https://')) {
        showError('Invalid URL', 'URL must use HTTPS protocol');
        return;
      }
      confirmUrlBtn.disabled = true;
      confirmUrlBtn.textContent = 'Uploading...';
      try {
        const result = await apiClient.uploadDemoImage(demoId, url, null, true, true);
        if (result.success) {
          showNotification('Demo image uploaded from URL');
          urlInput.value = '';
          loadDemos();
        }
      } catch (error) {
        showError('Upload Failed', error.message);
      } finally {
        confirmUrlBtn.disabled = false;
        confirmUrlBtn.textContent = 'Use URL';
      }
    });
  }

  // Delete image
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!confirm('Delete this demo image?')) return;
      try {
        const images = await apiClient.getDemoImages(demoId);
        if (images.images?.length > 0) {
          await apiClient.deleteDemoImage(demoId, images.images[0].filename);
          showNotification('Demo image deleted');
          const preview = section.querySelector('#demoCurrentImage');
          if (preview) preview.remove();
          loadDemos();
        }
      } catch (error) {
        showError('Delete Failed', error.message);
      }
    });
  }
}

async function handleDemoImageFile(file, demoId) {
  if (!file.type.startsWith('image/')) {
    showError('Invalid File', 'Please select an image file (JPEG, PNG, WebP)');
    return;
  }
  if (file.size > 5242880) {
    showError('File Too Large', 'Maximum file size is 5MB');
    return;
  }
  try {
    const filename = `${demoId}.jpg`;
    const result = await apiClient.uploadDemoImage(demoId, file, filename, true);
    if (result.success) {
      showNotification('Demo image uploaded successfully');
      refreshDemoImagePreview(demoId, result.image.url);
      loadDemos();
    }
  } catch (error) {
    showError('Upload Failed', error.message);
  }
}

function refreshDemoImagePreview(demoId, imageUrl) {
  const section = document.querySelector('#demoImageUploadSection');
  if (!section) return;

  let preview = section.querySelector('#demoCurrentImage');
  const displayUrl = `/api/demo-images/${imageUrl.replace('images/', '')}?t=${Date.now()}`;

  if (preview) {
    const img = preview.querySelector('img');
    if (img) img.src = displayUrl;
  } else {
    const html = `
      <div class="image-current-preview" id="demoCurrentImage">
        <img src="${displayUrl}" alt="Demo image" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid var(--color-border);">
        <button type="button" class="btn btn-sm btn-danger" id="demoDeleteImageBtn" style="margin-top: 8px;">Delete Image</button>
      </div>
    `;
    section.insertAdjacentHTML('afterbegin', html);
    const deleteBtn = section.querySelector('#demoDeleteImageBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('Delete this demo image?')) return;
        try {
          const images = await apiClient.getDemoImages(demoId);
          if (images.images?.length > 0) {
            await apiClient.deleteDemoImage(demoId, images.images[0].filename);
            showNotification('Demo image deleted');
            const p = section.querySelector('#demoCurrentImage');
            if (p) p.remove();
            loadDemos();
          }
        } catch (error) {
          showError('Delete Failed', error.message);
        }
      });
    }
  }
}

// ========== Git History Tab ==========
function setupGitHistoryTab() {
  const refreshBtn = document.getElementById('refreshHistoryBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadCommitHistory);
  }
}

async function loadCommitHistory() {
  const history = document.getElementById('commitHistory');
  if (!history) return;

  history.innerHTML = '<p class="loading-text">Loading commit history...</p>';
  history.classList.add('loading');

  try {
    const result = await apiClient.getGitStatus();
    const commits = result.history || [];

    if (commits.length === 0) {
      history.innerHTML = '<p class="loading-text">No commits yet.</p>';
    } else {
      history.innerHTML = commits
        .map((commit) => {
          return `
            <div class="commit-item">
              <div class="commit-sha">${commit.sha}</div>
              <div class="commit-message">${commit.message}</div>
              <div class="commit-meta">${commit.author} · ${formatDate(commit.date)}</div>
            </div>
          `;
        })
        .join('');
    }

    history.classList.remove('loading');
  } catch (error) {
    history.innerHTML = `<p class="loading-text" style="color: var(--color-error);">Error: ${error.message}</p>`;
  }
}

// ========== Git Status ==========
async function updateGitStatus() {
  try {
    const result = await apiClient.getGitStatus();
    updateGitStatusDisplay(result);
  } catch (error) {
    console.error('Error updating git status:', error);
  }
}

function updateGitStatusDisplay(gitStatus) {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const pushBtn = document.getElementById('pushBtn');

  if (!statusIndicator || !statusText) return;

  const hasUnpushed = gitStatus.ahead > 0;

  if (gitStatus.dirty) {
    statusIndicator.classList.add('dirty');
    statusIndicator.classList.remove('clean');
    const count = Array.isArray(gitStatus.uncommitted) ? gitStatus.uncommitted.length : gitStatus.uncommitted;
    statusText.textContent = `${i18n.t('dirty')} (${count} ${i18n.t('files')}) - ${i18n.t('waitingToPush')}`;
    if (pushBtn) {
      pushBtn.style.display = 'inline-block';
    }
  } else if (hasUnpushed) {
    statusIndicator.classList.add('dirty');
    statusIndicator.classList.remove('clean');
    statusText.textContent = `${gitStatus.ahead} commit(s) ahead — ready to push`;
    if (pushBtn) {
      pushBtn.style.display = 'inline-block';
    }
  } else {
    statusIndicator.classList.add('clean');
    statusIndicator.classList.remove('dirty');
    statusText.textContent = i18n.t('clean');
    if (pushBtn) {
      pushBtn.style.display = 'none';
    }
  }

  // Update sidebar status
  updateRepoStatusPanel({ git: gitStatus });
}

function updateRepoStatusPanel(status) {
  const panel = document.getElementById('repoStatus');
  if (!panel) return;

  const git = status.git || {};
  let statusHtml = `
    <div class="status-row">
      <span class="status-label">${i18n.t('branch')}:</span>
      <span class="status-value">${git.branch || i18n.t('unknown')}</span>
    </div>
    <div class="status-row">
      <span class="status-label">${i18n.t('status')}:</span>
      <span class="status-value">${git.dirty ? i18n.t('dirty') : i18n.t('clean')}</span>
    </div>
  `;

  if (git.dirty) {
    statusHtml += `
      <div class="status-row" style="background-color: rgba(251, 146, 60, 0.1); padding: 8px; border-radius: 4px; margin-top: 8px;">
        <span class="status-label" style="color: #d97706;">📤 ${i18n.t('waitingToPush')}</span>
      </div>
    `;
  }

  if (git.uncommitted) {
    statusHtml += `
      <div class="status-row">
        <span class="status-label">${i18n.t('uncommitted')}:</span>
        <span class="status-value">${Array.isArray(git.uncommitted) ? git.uncommitted.length : git.uncommitted} ${i18n.t('files')}</span>
      </div>
    `;
  }

  if (git.ahead) {
    statusHtml += `
      <div class="status-row">
        <span class="status-label">${i18n.t('ahead')}:</span>
        <span class="status-value">${git.ahead} commits</span>
      </div>
    `;
  }

  panel.innerHTML = statusHtml;
}

// ========== Push Functionality ==========
async function showPRCreationGuide(commitMessage) {
  const prGuide = `
    <div style="text-align: center; padding: 24px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🔗</div>
      <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 700;">Create a Pull Request</h3>
      <p style="margin: 0 0 24px; font-size: 14px; color: #666;">
        Your changes have been pushed to your fork. Now create a pull request to contribute to the main repository.
      </p>

      <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin-bottom: 20px; text-align: left; border-radius: 4px;">
        <p style="margin: 0 0 12px; font-size: 13px; color: #333;"><strong>📝 Commit Message (will auto-fill PR title):</strong></p>
        <code style="font-family: monospace; font-size: 12px; color: #0284c7; word-break: break-all; display: block; padding: 8px; background: white; border-radius: 2px;">
          ${escapeHtml(commitMessage)}
        </code>
      </div>

      <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 20px; text-align: left; border-radius: 4px;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #333;"><strong>✅ Next Steps:</strong></p>
        <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #555;">
          <li>Click the button below to open GitHub</li>
          <li>Review the PR title and description (pre-filled)</li>
          <li>Click "Create pull request" to submit</li>
        </ol>
      </div>

      <button id="openGithubPRBtn" class="btn btn-primary" style="width: 100%; padding: 12px;">
        🚀 Open GitHub & Create PR
      </button>
    </div>
  `;

  const modal = document.getElementById('pushModal');
  const modalContent = document.getElementById('pushModalContent');

  if (modalContent) {
    modalContent.innerHTML = prGuide;
    modal.classList.remove('hidden');

    const openBtn = document.getElementById('openGithubPRBtn');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        // Generate GitHub PR creation URL
        const prUrl = 'https://github.com/tuya/tuyaopen-ide-manifests/compare/master...HEAD?expand=1';
        window.open(prUrl, '_blank');
        setTimeout(() => modal.classList.add('hidden'), 500);
      });
    }
  }
}

// ========== Push Functionality ==========
async function showPushConfirmation() {
  const modal = document.getElementById('pushModal');
  const modalContent = document.getElementById('pushModalContent');
  const closePushBtn = document.getElementById('closePushModalBtn');
  const pushConfirmBtn = document.getElementById('pushConfirmBtn');
  const pushConfirmCancelBtn = document.getElementById('pushConfirmCancelBtn');

  if (!modal || !modalContent) return;

  // Fetch uncommitted changes
  let changedFiles = [];
  let commitMessage = 'chore(manifests): update boards and chips data';

  try {
    const statusResult = await apiClient.getGitStatus();
    if (statusResult.uncommitted && Array.isArray(statusResult.uncommitted)) {
      changedFiles = statusResult.uncommitted;
    }

    // Auto-generate commit message based on changed files
    const hasBoards = changedFiles.some(f => f.includes('boards'));
    const hasChips = changedFiles.some(f => f.includes('chips'));
    const hasImages = changedFiles.some(f => f.includes('images'));

    if (hasBoards && hasChips) {
      commitMessage = 'feat(manifests): update boards and chips';
    } else if (hasBoards) {
      commitMessage = 'feat(manifests): update board information';
    } else if (hasImages) {
      commitMessage = 'assets(manifests): add/update board images';
    }

    // Add timestamp for uniqueness
    commitMessage += ` (${new Date().toLocaleString()})`;
  } catch (error) {
    console.error('Error fetching git status:', error);
  }

  // Build modal content
  const filesHtml = changedFiles.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 14px; font-weight: 600;">📝 Changed Files (${changedFiles.length}):</h3>
      <div style="background-color: #f5f5f5; border-radius: 4px; max-height: 250px; overflow-y: auto; padding: 12px;">
        ${changedFiles.map(file => `
          <div style="padding: 6px 0; border-bottom: 1px solid #e0e0e0; font-family: monospace; font-size: 12px;">
            <span style="color: #d97706;">●</span> ${escapeHtml(file)}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '<p style="color: #999;">No changes to push</p>';

  const messageHtml = `
    <div style="margin-bottom: 16px;">
      <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 14px; font-weight: 600;">📌 Commit Message:</h3>
      <div style="background-color: #f0f9ff; border-left: 3px solid #0284c7; padding: 12px; border-radius: 4px;">
        <code style="font-family: monospace; font-size: 13px; word-break: break-all;">${escapeHtml(commitMessage)}</code>
      </div>
    </div>
  `;

  modalContent.innerHTML = messageHtml + filesHtml + `
    <div style="background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 12px; border-radius: 4px; font-size: 13px;">
      <strong>⚠️ Note:</strong> This will create a commit and push to the remote repository. Please review the changes before confirming.
    </div>
  `;

  // Setup event handlers
  closePushBtn.onclick = () => modal.classList.add('hidden');
  pushConfirmCancelBtn.onclick = () => modal.classList.add('hidden');

  pushConfirmBtn.onclick = async () => {
    try {
      pushConfirmBtn.disabled = true;
      pushConfirmBtn.textContent = '⏳ Pushing...';

      // Auto-commit and push
      const result = await apiClient.pushChanges(commitMessage);

      if (result.success) {
        showNotification(`✅ Successfully pushed ${changedFiles.length} file(s) to remote`);
        modal.classList.add('hidden');
        await updateGitStatus();
        await loadBoards();

        // Show PR creation guide if fork is detected
        setTimeout(() => showPRCreationGuide(commitMessage), 500);
      } else {
        showError('Push Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      showError('Push Error', error.message);
    } finally {
      pushConfirmBtn.disabled = false;
      pushConfirmBtn.textContent = '✓ Push Changes';
    }
  };

  modal.classList.remove('hidden');
}
