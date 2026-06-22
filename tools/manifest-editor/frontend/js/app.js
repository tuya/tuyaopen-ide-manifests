// Main application controller

import { apiClient } from './api-client.js';
import { formatDate, showNotification, showError, debounce, escapeHtml } from './utils.js';
import imageUploader from './image-uploader.js';
import { renderBoardCard, renderBoardForm, saveBoardForm, deleteBoardPrompt, setupFormValidation, initGlobalTags, setSelectedTags } from './board-editor.js';
import { renderPeripheralEditor, isDirty as periIsDirty } from './peripheral-editor.js';
import { renderExpansionPinsEditor } from './expansion-pins-editor.js';
import { renderDemoCard, renderDemoForm, saveDemoForm, deleteDemoAction } from './demo-editor.js';
import { renderPlatformCard, mountPlatformForm, mountNewPlatformForm, savePlatformForm, deletePlatformPrompt } from './platform-editor.js';
import i18n from './i18n.js';

let currentTab = 'boards';
let platforms = [];
let activeBoardPlatform = null;  // selected platform tab on the boards page
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
    setupPlatformsTab();
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
  } else if (currentTab === 'platforms') {
    loadPlatforms();
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
  } else if (tab === 'platforms') {
    loadPlatforms();
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

function attachBoardCardListeners() {
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openBoardForm(btn.dataset.boardId);
    });
  });
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteBoardPrompt(btn.dataset.boardId).then((success) => { if (success) loadBoards(); });
    });
  });
}

async function loadBoards() {
  const boardsList = document.getElementById('boardsList');
  if (!boardsList) return;

  boardsList.className = 'boards-list loading';
  boardsList.innerHTML = '<p class="loading-text">Loading boards...</p>';

  try {
    // Boards + platforms together: boards are grouped into one tab per chip
    // platform (t5ai / gd32 / …), scaling as more platforms are added.
    const [boardsRes, platsRes] = await Promise.all([
      apiClient.getBoards(),
      apiClient.getPlatforms().catch(() => ({ platforms: [] })),
    ]);
    const boards = boardsRes.boards || [];
    const plats = platsRes.platforms || [];

    if (boards.length === 0) {
      boardsList.className = 'boards-list';
      boardsList.innerHTML = '<p class="loading-text">No boards yet. Click "Add New Board" to create one.</p>';
      return;
    }

    // A board's `platformId` is its SDK platform group (e.g. "gd32"); tabs are
    // one per group, with all the group's chips' boards inside.
    const byGroup = new Map();
    for (const b of boards) {
      const group = b.platformId || '—';
      if (!byGroup.has(group)) byGroup.set(group, []);
      byGroup.get(group).push(b);
    }
    // Tab order: SDK groups in platform-list order, then any leftovers.
    const ordered = [];
    for (const p of plats) { const g = p.platformId || p.id; if (byGroup.has(g) && !ordered.includes(g)) ordered.push(g); }
    for (const g of byGroup.keys()) if (!ordered.includes(g)) ordered.push(g);

    if (!activeBoardPlatform || !byGroup.has(activeBoardPlatform)) activeBoardPlatform = ordered[0];

    const render = () => {
      const tabs = ordered.map((g) => {
        const n = byGroup.get(g).length;
        const act = g === activeBoardPlatform ? ' active' : '';
        return `<button type="button" class="board-plat-tab${act}" data-plat="${escapeHtml(g)}">${escapeHtml(g)}<span class="board-plat-tab-count">${n}</span></button>`;
      }).join('');
      const cards = byGroup.get(activeBoardPlatform).map(renderBoardCard).join('');
      boardsList.className = 'boards-tabbed';
      boardsList.innerHTML = `<div class="board-plat-tabs">${tabs}</div><div class="boards-grid">${cards}</div>`;
      boardsList.querySelectorAll('.board-plat-tab').forEach((t) =>
        t.addEventListener('click', () => { activeBoardPlatform = t.dataset.plat; render(); }));
      attachBoardCardListeners();
    };
    render();
  } catch (error) {
    boardsList.className = 'boards-list';
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
      modalTitle.textContent = `${i18n.t('boardFormEditTitle')}: ${boardId}`;
    } catch (error) {
      showError('Load Failed', `Failed to load board "${boardId}"`);
      return;
    }
  } else {
    modalTitle.textContent = i18n.t('boardFormCreateTitle');
  }

  // Load the actual chip platforms for the dropdown (one entry per existing
  // platform, e.g. t5ai / gd32) — not a hardcoded list. Reloaded on each open so
  // newly-created platforms show up.
  try {
    const result = await apiClient.getPlatforms();
    // Each entry is a chip variant: id = chip (-> board.variantId),
    // platformId = SDK group (-> board.platformId).
    platforms = (result.platforms || []).map((p) => ({ id: p.id, platformId: p.platformId || p.id, name: p.name }));
  } catch (error) {
    console.error('Error loading platforms:', error);
    platforms = [];
  }

  formContainer.innerHTML = renderBoardForm(board);

  // Dropdown lists chips; each option's value is the chip id (board.variantId),
  // and data-group carries its SDK platform group (board.platformId).
  const platformSelect = document.getElementById('platformId');
  if (platformSelect) {
    platforms.forEach((plat) => {
      if (!platformSelect.querySelector(`option[value="${plat.id}"]`)) {
        const option = document.createElement('option');
        option.value = plat.id;
        option.dataset.group = plat.platformId;
        const nm = plat.name && (plat.name['zh-CN'] || plat.name.en);
        option.textContent = nm ? `${nm} (${plat.id})` : plat.id;
        platformSelect.appendChild(option);
      }
    });
    // Pre-select the board's chip (variantId) when editing.
    if (board && board.variantId) platformSelect.value = board.variantId;
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
            // Pinout is per-chip: pass the chip id (variantId), not the SDK group.
            renderExpansionPinsEditor('expansionPinsContainer', boardId, board.variantId || board.platformId);
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

// ========== Platforms Tab ==========
function setupPlatformsTab() {
  const addBtn = document.getElementById('addPlatformBtn');
  if (addBtn) addBtn.addEventListener('click', openNewPlatform);
}

// Step 1 of adding a platform: a small dialog for just the essential fields.
// On create, jump straight into the full editor for the new platform.
function openNewPlatform() {
  const modal = document.getElementById('platformModal');
  const modalTitle = document.getElementById('platformModalTitle');
  const container = document.getElementById('platformFormContainer');
  const closeBtn = document.getElementById('closePlatformModalBtn');
  if (!modal || !container) return;
  modalTitle.textContent = i18n.t('platformFormTitle') || 'Add Platform';
  mountNewPlatformForm(container, {
    onCreated: (id) => {
      if (id) { loadPlatforms(); openPlatformForm(id); } // created → open full editor
      else { modal.classList.add('hidden'); }            // cancelled
    },
  });
  if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
  modal.classList.remove('hidden');
}

async function loadPlatforms() {
  const list = document.getElementById('platformsList');
  if (!list) return;
  list.innerHTML = `<p class="loading-text">${i18n.t('loadingPlatforms') || 'Loading platforms...'}</p>`;
  try {
    const result = await apiClient.getPlatforms();
    const platforms = result.platforms || [];
    if (platforms.length === 0) {
      list.innerHTML = `<p class="loading-text">${i18n.t('platformsEmpty') || 'No platforms yet.'}</p>`;
      return;
    }
    list.innerHTML = platforms.map(renderPlatformCard).join('');
    list.querySelectorAll('.platform-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); openPlatformForm(btn.dataset.platformId); });
    });
    list.querySelectorAll('.platform-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const ok = await deletePlatformPrompt(btn.dataset.platformId);
        if (ok) loadPlatforms();
      });
    });
  } catch (error) {
    list.innerHTML = `<p class="loading-text" style="color: var(--color-error);">Error: ${error.message}</p>`;
  }
}

async function openPlatformForm(platformId = null) {
  const modal = document.getElementById('platformModal');
  const modalTitle = document.getElementById('platformModalTitle');
  const container = document.getElementById('platformFormContainer');
  const closeBtn = document.getElementById('closePlatformModalBtn');
  if (!modal || !container) return;

  let platform = null;
  let detail = null;
  if (platformId) {
    try {
      const result = await apiClient.getPlatform(platformId);
      platform = result.platform;
      detail = result.detail || {};
      modalTitle.textContent = `${i18n.t('platformFormTitleEdit') || 'Edit Platform'}: ${platformId}`;
    } catch (error) {
      showError('Load Failed', error.message);
      return;
    }
  } else {
    modalTitle.textContent = i18n.t('platformFormTitle') || 'Add Platform';
  }

  mountPlatformForm(container, platform, detail, { isNew: !platformId });

  const form = document.getElementById('platformForm');
  const cancelBtn = document.getElementById('pfCancelBtn');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const ok = await savePlatformForm();
      if (ok) { modal.classList.add('hidden'); loadPlatforms(); }
    });
  }
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
  if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');

  // Inline image upload (only for existing platforms)
  if (platformId) setupPlatformImageUpload(platformId, modal);

  modal.classList.remove('hidden');
}

function setupPlatformImageUpload(platformId, modal) {
  const section = modal.querySelector('#platformImageUploadSection');
  if (!section) return;

  const zone = section.querySelector('.image-upload-zone');
  const fileInput = section.querySelector('#platformImageInput');
  const sourceTabs = section.querySelectorAll('.image-source-tab');
  const sourceFile = section.querySelector('#platformImageSourceFile');
  const sourceUrl = section.querySelector('#platformImageSourceUrl');
  const urlInput = section.querySelector('#platformImageUrl');
  const confirmUrlBtn = section.querySelector('#platformConfirmUrlBtn');
  const deleteBtn = section.querySelector('#platformDeleteImageBtn');

  // Tab switching (file / url)
  sourceTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const source = tab.dataset.source;
      sourceTabs.forEach(t => {
        const on = t.dataset.source === source;
        t.style.color = on ? 'var(--color-primary)' : 'var(--color-muted)';
        t.style.fontWeight = on ? '600' : '500';
        t.style.borderBottom = on ? '2px solid var(--color-primary)' : 'none';
      });
      if (sourceFile) sourceFile.style.display = source === 'file' ? 'block' : 'none';
      if (sourceUrl) sourceUrl.style.display = source === 'url' ? 'block' : 'none';
    });
  });

  // Drag & drop + click
  if (zone) {
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = 'var(--color-primary)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = 'var(--color-border)'; });
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.style.borderColor = 'var(--color-border)';
      if (e.dataTransfer.files.length > 0) handlePlatformImageFile(e.dataTransfer.files[0], platformId);
    });
    zone.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fileInput?.click(); });
  }
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handlePlatformImageFile(e.target.files[0], platformId);
    });
  }

  // URL upload
  if (confirmUrlBtn) {
    confirmUrlBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = urlInput?.value?.trim();
      if (!url) { showError('Missing URL', 'Please enter an image URL'); return; }
      if (!url.startsWith('https://')) { showError('Invalid URL', 'URL must use HTTPS protocol'); return; }
      confirmUrlBtn.disabled = true;
      confirmUrlBtn.textContent = i18n.t('platformImageUploading');
      try {
        const result = await apiClient.uploadPlatformImage(platformId, url, null, true, true);
        if (result.success) { showNotification('Platform image uploaded from URL'); urlInput.value = ''; loadPlatforms(); }
      } catch (error) {
        showError('Upload Failed', error.message);
      } finally {
        confirmUrlBtn.disabled = false;
        confirmUrlBtn.textContent = i18n.t('platformImageUseUrl');
      }
    });
  }

  // Delete image
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!confirm(i18n.t('platformImageDeleteConfirm') || 'Delete this platform image?')) return;
      try {
        const images = await apiClient.getPlatformImages(platformId);
        if (images.images?.length > 0) {
          await apiClient.deletePlatformImage(platformId, images.images[0].filename);
          showNotification('Platform image deleted');
          section.querySelector('#platformCurrentImage')?.remove();
          loadPlatforms();
        }
      } catch (error) {
        showError('Delete Failed', error.message);
      }
    });
  }
}

async function handlePlatformImageFile(file, platformId) {
  if (!file.type.startsWith('image/')) { showError('Invalid File', 'Please select an image file (JPEG, PNG, WebP)'); return; }
  if (file.size > 5242880) { showError('File Too Large', 'Maximum file size is 5MB'); return; }
  try {
    const result = await apiClient.uploadPlatformImage(platformId, file, `${platformId}.jpg`, true);
    if (result.success) { showNotification('Platform image uploaded successfully'); loadPlatforms(); }
  } catch (error) {
    showError('Upload Failed', error.message);
  }
}

// ========== Demos Tab ==========
let demosCache = [];
// Active demos type tab: 'example' or 'app'. Apps tab is first / default.
let demosActiveType = 'app';
// Facet filters (multi-select, OR within each dimension).
let demosFilterTags = [];
let demosFilterBoards = [];
// boardId -> display name, for the board facet chips.
let demosBoardNameMap = {};

function setupDemosTab() {
  const addBtn = document.getElementById('addDemoBtn');
  const searchInput = document.getElementById('demoSearch');
  const tabs = document.getElementById('demosTabs');
  const tagChips = document.getElementById('demoFilterTags');
  const boardChips = document.getElementById('demoFilterBoards');

  if (addBtn) {
    addBtn.addEventListener('click', () => openDemoForm(null));
  }

  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => filterDemos(), 200));
  }

  // Facet dropdowns: button toggles its panel; option click toggles selection.
  const tagsBtn = document.getElementById('demoFilterTagsBtn');
  const boardsBtn = document.getElementById('demoFilterBoardsBtn');
  if (tagsBtn) tagsBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFacetPanel('demoFilterTags'); });
  if (boardsBtn) boardsBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFacetPanel('demoFilterBoards'); });

  if (tagChips) {
    tagChips.addEventListener('click', (e) => {
      const opt = e.target.closest('.demos-filter-option');
      if (!opt) return;
      demosFilterTags = toggleInArray(demosFilterTags, opt.dataset.val);
      populateDemoFacets();
      filterDemos();
    });
  }
  if (boardChips) {
    boardChips.addEventListener('click', (e) => {
      const opt = e.target.closest('.demos-filter-option');
      if (!opt) return;
      demosFilterBoards = toggleInArray(demosFilterBoards, opt.dataset.val);
      populateDemoFacets();
      filterDemos();
    });
  }

  // Close any open facet panel when clicking outside a dropdown.
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.demos-filter-dd')) closeFacetPanels();
  });

  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.demos-tab');
      if (!tab) return;
      demosActiveType = tab.dataset.demoType === 'app' ? 'app' : 'example';
      tabs.querySelectorAll('.demos-tab').forEach(t => t.classList.toggle('active', t === tab));
      // Tag/board options depend on the active type's demos; rebuild + reset.
      demosFilterTags = [];
      demosFilterBoards = [];
      populateDemoFacets();
      filterDemos();
    });
  }
}

function toggleInArray(arr, val) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

function closeFacetPanels() {
  document.querySelectorAll('.demos-filter-panel').forEach(p => { p.hidden = true; });
  document.querySelectorAll('.demos-filter-dd-btn').forEach(b => b.classList.remove('open'));
}

function toggleFacetPanel(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const wasHidden = panel.hidden;
  closeFacetPanels();
  if (wasHidden) {
    panel.hidden = false;
    panel.closest('.demos-filter-dd')?.querySelector('.demos-filter-dd-btn')?.classList.add('open');
  }
}

// Rebuild the tag/board facet dropdowns from the demos in the active type tab.
// Drops any active selection that's no longer present after the rebuild.
function populateDemoFacets() {
  const inType = demosCache.filter(d => (d.type === 'app' ? 'app' : 'example') === demosActiveType);
  const tags = [...new Set(inType.flatMap(d => Array.isArray(d.tags) ? d.tags : []))].sort();
  const boards = [...new Set(inType.flatMap(d => Array.isArray(d.boards) ? d.boards : []))].sort();

  demosFilterTags = demosFilterTags.filter(t => tags.includes(t));
  demosFilterBoards = demosFilterBoards.filter(b => boards.includes(b));

  renderFacetPanel('demoFilterTags', 'demoFilterTagsRow', 'demoFilterTagsCount', tags, demosFilterTags, demoTagLabel);
  renderFacetPanel('demoFilterBoards', 'demoFilterBoardsRow', 'demoFilterBoardsCount', boards, demosFilterBoards, (v) => demosBoardNameMap[v] || v);
}

// Localized label for a tag id, from the controlled vocabulary (DEMO_TAG_VOCAB).
function demoTagLabel(id) {
  const lang = i18n.getLanguage();
  for (const list of [DEMO_TAG_VOCAB[demosActiveType], DEMO_TAG_VOCAB.example, DEMO_TAG_VOCAB.app]) {
    const v = list && list.find(x => x.id === id);
    if (v) return lang === 'zh-CN' ? v.zh : v.en;
  }
  return id;
}

function renderFacetPanel(panelId, ddId, countId, values, selected, labelOf) {
  const dd = document.getElementById(ddId);
  const panel = document.getElementById(panelId);
  const count = document.getElementById(countId);
  if (!panel || !dd) return;
  // Hide the whole dropdown when this type tab has no values for the dimension.
  dd.style.display = values.length ? '' : 'none';
  if (count) count.textContent = selected.length ? `(${selected.length})` : '';
  panel.innerHTML = values.map(v => {
    const on = selected.includes(v);
    return `<button type="button" class="demos-filter-option${on ? ' demos-filter-option--on' : ''}" data-val="${escapeHtml(v)}">` +
      `<span class="demos-filter-check">${on ? '✓' : ''}</span>${escapeHtml(labelOf(v))}</button>`;
  }).join('');
}

// Searchable multi-select for a demo's "Boards" field, sourced from the live
// boards list. Selected ids are mirrored into the hidden #demoBoards input
// (comma-separated) so saveDemoForm reads them unchanged.
function setupDemoBoardsSelect(allBoards) {
  const root = document.getElementById('demoBoardsSelect');
  const hidden = document.getElementById('demoBoards');
  const chipsEl = document.getElementById('demoBoardsChips');
  const searchEl = document.getElementById('demoBoardsSearch');
  const dropdownEl = document.getElementById('demoBoardsDropdown');
  if (!root || !hidden || !chipsEl || !searchEl || !dropdownEl) return;

  const lang = i18n.getLanguage();
  const labelOf = (b) => (b.name && (b.name[lang] || b.name.en || b.name['zh-CN'])) || b.id;
  let selected = (hidden.value || '').split(',').map(s => s.trim()).filter(Boolean);

  const sync = () => { hidden.value = selected.join(','); };

  const renderChips = () => {
    chipsEl.innerHTML = selected.map(id => {
      const b = allBoards.find(x => x.id === id);
      const text = b ? labelOf(b) : id;
      return `<span class="board-ms-chip" title="${escapeHtml(id)}">${escapeHtml(text)}` +
        `<button type="button" class="board-ms-chip-x" data-id="${escapeHtml(id)}">×</button></span>`;
    }).join('');
  };

  const renderDropdown = () => {
    const q = (searchEl.value || '').toLowerCase().trim();
    const avail = allBoards.filter(b => !selected.includes(b.id) &&
      (!q || b.id.toLowerCase().includes(q) || labelOf(b).toLowerCase().includes(q)));
    dropdownEl.innerHTML = avail.length
      ? avail.map(b => `<div class="board-ms-item" data-id="${escapeHtml(b.id)}">` +
          `<span class="board-ms-item-name">${escapeHtml(labelOf(b))}</span>` +
          `<span class="board-ms-item-id">${escapeHtml(b.id)}</span></div>`).join('')
      : `<div class="board-ms-empty">${i18n.t('demoBoardsNoMatch') || 'No matching boards'}</div>`;
  };

  renderChips();

  const open = () => { renderDropdown(); dropdownEl.style.display = 'block'; };
  searchEl.addEventListener('focus', open);
  searchEl.addEventListener('input', open);

  // mousedown + preventDefault so selecting an item doesn't blur the search first
  dropdownEl.addEventListener('mousedown', (e) => {
    const item = e.target.closest('.board-ms-item');
    if (!item) return;
    e.preventDefault();
    if (!selected.includes(item.dataset.id)) selected.push(item.dataset.id);
    sync(); renderChips(); searchEl.value = ''; renderDropdown(); searchEl.focus();
  });

  chipsEl.addEventListener('click', (e) => {
    const x = e.target.closest('.board-ms-chip-x');
    if (!x) return;
    selected = selected.filter(id => id !== x.dataset.id);
    sync(); renderChips(); renderDropdown();
  });

  document.addEventListener('mousedown', (e) => {
    if (!root.contains(e.target)) dropdownEl.style.display = 'none';
  });
}

// Supported-board targets editor (demo Build Config):
// each target = a board (+ optional accessory) and a list of named config files.
// Accessory options come from the board's peripheralGroups + ungrouped accessory
// peripherals (mounting === 'accessory' && no group); onboard peripherals excluded.
// Accept the new array shape; convert the legacy map ({symbol:{file}}) to
// provisional targets (board unset) so old data shows for manual re-assignment
// instead of being silently dropped on save.
function normalizeDemoConfigs(configs) {
  if (Array.isArray(configs)) return configs;
  if (configs && typeof configs === 'object') {
    return Object.entries(configs).map(([key, val]) => ({
      board: '',
      options: [{ name: { en: key, 'zh-CN': '' }, file: (typeof val === 'object' ? val.file : val) || '' }],
    }));
  }
  return [];
}

function setupDemoTargets(allBoards, existing) {
  const root = document.getElementById('demoTargets');
  const addBtn = document.getElementById('addTargetBtn');
  if (!root) return;

  const lang = i18n.getLanguage();
  const loc = (n, fb) => (n && (n[lang] || n.en || n['zh-CN'])) || fb;
  const periphCache = {};

  // All pickable peripherals for a board: its peripheral GROUPS (bundled
  // accessories) + every UNGROUPED peripheral — onboard parts (button/led/audio)
  // AND standalone accessories (camera/oled/…). The author checks the ones the
  // demo actually USES; onboard is NOT auto-included. Group members are
  // represented by their group, mirroring the IDE hardware view's collapse.
  async function fetchBoardPeripherals(boardId) {
    if (periphCache[boardId]) return periphCache[boardId];
    // Ordered: onboard (soldered) parts first, then accessories (groups +
    // accessory-mounted parts). Grouped members are represented by their group.
    const onboard = [];
    const accessories = [];
    try {
      const d = (await apiClient.getBoard(boardId)).board || {};
      for (const [gid, g] of Object.entries(d.peripheralGroups || {})) {
        accessories.push({ id: gid, label: loc(g.name, gid), group: true });
      }
      for (const arr of Object.values(d.peripheralPatterns || {})) {
        for (const p of (arr || [])) {
          if (!p.id || p.group) continue;
          const item = { id: p.id, label: loc(p.name, p.id), group: false };
          if (p.mounting === 'accessory') accessories.push(item);
          else onboard.push(item);
        }
      }
    } catch (e) {
      console.error('[demoTargets] board peripherals failed', boardId, e);
    }
    const list = [...onboard, ...accessories];
    periphCache[boardId] = list;
    return list;
  }

  const boardById = Object.fromEntries(allBoards.map(b => [b.id, b]));
  const platforms = [...new Set(allBoards.map(b => b.platformId).filter(Boolean))].sort();

  const platformOptions = (sel) => `<option value="">${i18n.t('demoTargetSelectPlatform')}</option>` +
    platforms.map(p => `<option value="${escapeHtml(p)}"${p === sel ? ' selected' : ''}>${escapeHtml(p)}</option>`).join('');
  const boardOptions = (platform, sel) => `<option value="">${i18n.t('demoTargetSelectBoard')}</option>` +
    allBoards.filter(b => !platform || b.platformId === platform)
      .map(b => `<option value="${escapeHtml(b.id)}"${b.id === sel ? ' selected' : ''}>${escapeHtml(loc(b.name, b.id))}</option>`).join('');
  // Per-option peripheral picker: the author checks which peripherals THIS
  // config uses (board peripheral / group ids). Group ids stand for the bundle.
  const peripheralChecks = (list, selected) => {
    if (!list.length) return `<small style="color:var(--color-muted)">${i18n.t('demoTargetOptionPeripheralsEmpty')}</small>`;
    return list.map(p =>
      `<label class="opt-peri"><input type="checkbox" class="opt-peri-cb" value="${escapeHtml(p.id)}"${selected.includes(p.id) ? ' checked' : ''}> ${escapeHtml(p.label)}${p.group ? ' <span class="opt-peri-grp">⛓</span>' : ''}</label>`
    ).join('');
  };

  const optionRow = (o) => `<div class="target-option">
      <div class="target-option-head">
        <input type="text" class="form-input opt-name-en" placeholder="${escapeHtml(i18n.t('demoTargetOptionNameEn'))}" value="${escapeHtml(o?.name?.en || '')}">
        <input type="text" class="form-input opt-name-zh" placeholder="${escapeHtml(i18n.t('demoTargetOptionNameZh'))}" value="${escapeHtml(o?.name?.['zh-CN'] || '')}">
        <input type="text" class="form-input opt-file" placeholder="${escapeHtml(i18n.t('demoTargetOptionFile'))}" value="${escapeHtml(o?.file || '')}">
        <button type="button" class="btn btn-sm btn-danger opt-remove">✕</button>
      </div>
      <div class="opt-peripherals-wrap">
        <span class="opt-peri-label">${escapeHtml(i18n.t('demoTargetOptionPeripherals'))}</span>
        <div class="opt-peripherals" data-selected="${escapeHtml((o?.peripherals || []).join(','))}"></div>
      </div>
    </div>`;

  const targetRow = (t) => {
    const opts = (t?.options && t.options.length) ? t.options : [{}];
    const platform = t?.board ? (boardById[t.board]?.platformId || '') : '';
    return `<div class="demo-target">
      <div class="target-head">
        <select class="form-input target-platform">${platformOptions(platform)}</select>
        <select class="form-input target-board">${boardOptions(platform, t?.board || '')}</select>
        <button type="button" class="btn btn-sm btn-danger target-remove" title="${escapeHtml(i18n.t('demoTargetRemove'))}">✕</button>
      </div>
      <small style="color:var(--color-muted);display:block;margin:6px 0 4px;">${escapeHtml(i18n.t('demoTargetOptionsHint'))}</small>
      <div class="target-options">${opts.map(optionRow).join('')}</div>
      <button type="button" class="btn btn-sm btn-outline target-add-option">${i18n.t('demoTargetAddOption')}</button>
    </div>`;
  };

  // Fill per-option peripheral checkboxes from the target's board. `only`
  // (optional) restricts to one .opt-peripherals container (when adding an
  // option) so the other options' live selections are preserved.
  async function fillPeripherals(row, only) {
    const board = row.querySelector('.target-board').value;
    const containers = only ? [only] : [...row.querySelectorAll('.opt-peripherals')];
    if (!board) {
      containers.forEach(c => { c.innerHTML = `<small style="color:var(--color-muted)">${i18n.t('demoTargetOptionPeripheralsNoBoard')}</small>`; });
      return;
    }
    const choices = await fetchBoardPeripherals(board);
    containers.forEach(c => {
      const sel = (c.dataset.selected || '').split(',').filter(Boolean);
      c.innerHTML = peripheralChecks(choices, sel);
    });
  }

  function addTarget(t, prepend) {
    root.insertAdjacentHTML(prepend ? 'afterbegin' : 'beforeend', targetRow(t));
    fillPeripherals(prepend ? root.firstElementChild : root.lastElementChild);
  }

  root.innerHTML = '';
  existing.forEach((t) => addTarget(t, false));

  // New rows are added at the top (first row).
  if (addBtn) addBtn.addEventListener('click', () => addTarget({}, true));

  root.addEventListener('click', (e) => {
    if (e.target.closest('.target-remove')) { e.target.closest('.demo-target').remove(); return; }
    if (e.target.closest('.opt-remove')) { e.target.closest('.target-option').remove(); return; }
    const addOpt = e.target.closest('.target-add-option');
    if (addOpt) {
      const opts = addOpt.parentElement.querySelector('.target-options');
      opts.insertAdjacentHTML('beforeend', optionRow({}));
      // Fill only the new option's peripheral list — keep others' live state.
      fillPeripherals(addOpt.closest('.demo-target'), opts.lastElementChild.querySelector('.opt-peripherals'));
    }
  });
  root.addEventListener('change', (e) => {
    const row = e.target.closest('.demo-target');
    if (!row) return;
    if (e.target.classList.contains('target-platform')) {
      // Refilter boards to the chosen platform; reset board + peripherals.
      row.querySelector('.target-board').innerHTML = boardOptions(e.target.value, '');
      row.querySelectorAll('.opt-peripherals').forEach(c => { c.dataset.selected = ''; });
      fillPeripherals(row);
    } else if (e.target.classList.contains('target-board')) {
      // Board changed → its peripheral ids differ; reset + refill.
      row.querySelectorAll('.opt-peripherals').forEach(c => { c.dataset.selected = ''; });
      fillPeripherals(row);
    }
  });
}

// Controlled tag vocabulary for demos — two sets, picked by the demo `type`.
const DEMO_TAG_VOCAB = {
  example: [
    { id: 'getting-started', en: 'Getting Started', zh: '入门' },
    { id: 'peripheral', en: 'Peripheral', zh: '外设' },
    { id: 'system', en: 'System', zh: '系统' },
    { id: 'networking', en: 'Networking', zh: '网络' },
    { id: 'wifi', en: 'Wi-Fi', zh: 'Wi-Fi' },
    { id: 'ble', en: 'BLE', zh: '蓝牙' },
    { id: 'multimedia', en: 'Multimedia', zh: '多媒体' },
    { id: 'graphics', en: 'Graphics', zh: '图形显示' },
    { id: 'tuya_cloud', en: 'Tuya Cloud', zh: '涂鸦云' },
    { id: 'tinyml', en: 'TinyML', zh: '端侧 ML' },
  ],
  app: [
    { id: 'ai', en: 'AI', zh: 'AI' },
    { id: 'pixel-art', en: 'Pixel Art', zh: '像素屏' },
    { id: 'robotics', en: 'Robotics', zh: '机器人' },
    { id: 'pocket', en: 'Pocket', zh: '口袋机' },
    { id: 'game', en: 'Game', zh: '游戏' },
    { id: 'tuya_cloud', en: 'Tuya Cloud', zh: '涂鸦云' },
    { id: 'micropython', en: 'MicroPython', zh: 'MicroPython' },
  ],
};

// Tag picker for demos — mirrors the board form's chip-input + search dropdown
// + available pool (same CSS classes/behavior). Sourced from the controlled
// vocabulary by the current `type`; ids mirror into hidden #demoTags (CSV).
function setupDemoTagsSelect() {
  const chipsContainer = document.getElementById('demoSelectedTags');
  const searchInput = document.getElementById('demoTagsSearchInput');
  const dropdown = document.getElementById('demoTagsDropdown');
  const pool = document.getElementById('demoTagsAvailablePool');
  const hidden = document.getElementById('demoTags');
  const typeSel = document.getElementById('demoCategory');
  if (!chipsContainer || !searchInput || !pool || !hidden) return;

  const lang = i18n.getLanguage();
  const vocab = () => DEMO_TAG_VOCAB[typeSel && typeSel.value === 'app' ? 'app' : 'example'];
  const labelOf = (id) => { const v = vocab().find(x => x.id === id); return v ? (lang === 'zh-CN' ? v.zh : v.en) : id; };
  let selected = (hidden.value || '').split(',').map(s => s.trim()).filter(Boolean);

  const sync = () => { selected = selected.filter(id => vocab().some(v => v.id === id)); hidden.value = selected.join(','); };
  const renderChips = () => {
    chipsContainer.innerHTML = selected.map(id =>
      `<span class="tag-chip" data-tag-id="${escapeHtml(id)}">${escapeHtml(labelOf(id))}<button type="button" class="tag-chip-remove">&times;</button></span>`).join('');
  };
  const renderPool = () => {
    const avail = vocab().filter(v => !selected.includes(v.id));
    pool.innerHTML = avail.length
      ? `<div class="tag-category-group">` + avail.map(v =>
          `<span class="tag-pool-item" data-tag-id="${escapeHtml(v.id)}">${escapeHtml(labelOf(v.id))}</span>`).join('') + `</div>`
      : '';
  };
  const refresh = () => { sync(); renderChips(); renderPool(); };
  const addTag = (id) => { if (!selected.includes(id)) { selected.push(id); refresh(); } };
  const removeTag = (id) => { selected = selected.filter(x => x !== id); refresh(); };

  refresh();

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) { dropdown.style.display = 'none'; return; }
    const m = vocab().filter(v => !selected.includes(v.id) && (v.id.toLowerCase().includes(q) || labelOf(v.id).toLowerCase().includes(q)));
    if (!m.length) { dropdown.style.display = 'none'; return; }
    dropdown.innerHTML = m.map(v => `<div class="tags-dropdown-item" data-tag-id="${escapeHtml(v.id)}">${escapeHtml(labelOf(v.id))}</div>`).join('');
    dropdown.style.display = 'block';
  });
  dropdown.addEventListener('click', (e) => {
    const it = e.target.closest('.tags-dropdown-item');
    if (!it) return;
    addTag(it.dataset.tagId); searchInput.value = ''; dropdown.style.display = 'none';
  });
  searchInput.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));
  pool.addEventListener('click', (e) => { const c = e.target.closest('.tag-pool-item'); if (c) addTag(c.dataset.tagId); });
  chipsContainer.addEventListener('click', (e) => {
    const b = e.target.closest('.tag-chip-remove');
    if (!b) return;
    const c = b.closest('.tag-chip');
    if (c) removeTag(c.dataset.tagId);
  });
  if (typeSel) typeSel.addEventListener('change', refresh);
}

// Hardware-driver dependency picker for demos. Vocabulary is the "peripherals"
// tag category (audio/display/led/button/…) so a demo's required drivers can be
// matched against a board's peripheral tags. Each selected driver carries a
// level — required (strong: won't run without it) or optional (weak: enhances).
// State lives in the row's data-driver/data-level; saveDemoForm reads the DOM.
function setupDemoDrivers(vocab, existing) {
  const container = document.getElementById('demoDriversContainer');
  if (!container) return;
  const lang = i18n.getLanguage();
  const labelOf = (id) => {
    const v = vocab.find(x => x.id === id);
    return v ? ((lang === 'zh-CN' ? (v['zh-CN'] || v.en) : v.en) || id) : id;
  };
  let rows = (existing || [])
    .filter(d => d && d.driver)
    .map(d => ({ driver: d.driver, level: d.level === 'required' ? 'required' : 'optional' }));

  const render = () => {
    const used = new Set(rows.map(r => r.driver));
    const avail = vocab.filter(v => !used.has(v.id));
    const reqL = i18n.t('demoDriverRequired') || 'Required';
    const optL = i18n.t('demoDriverOptional') || 'Optional';
    let html = '';
    if (rows.length) {
      html += rows.map(r => `
        <div class="demo-driver-row" data-driver="${escapeHtml(r.driver)}" data-level="${r.level}">
          <span class="demo-driver-name">${escapeHtml(labelOf(r.driver))}</span>
          <div class="demo-driver-levels">
            <button type="button" class="demo-driver-level${r.level === 'required' ? ' active' : ''}" data-set="required">${escapeHtml(reqL)}</button>
            <button type="button" class="demo-driver-level${r.level === 'optional' ? ' active' : ''}" data-set="optional">${escapeHtml(optL)}</button>
          </div>
          <button type="button" class="demo-driver-remove" title="${escapeHtml(i18n.t('demoDelete') || 'Remove')}">&times;</button>
        </div>`).join('');
    } else {
      html += `<div class="demo-drivers-empty">${escapeHtml(i18n.t('demoDriversEmpty') || 'No hardware drivers declared.')}</div>`;
    }
    html += `<div class="demo-driver-add">
      <select class="demo-driver-select form-select"${avail.length ? '' : ' disabled'}>
        <option value="">${escapeHtml(i18n.t('demoDriverAddSelect') || '-- add a driver --')}</option>
        ${avail.map(v => `<option value="${escapeHtml(v.id)}">${escapeHtml(labelOf(v.id))}</option>`).join('')}
      </select>
      <button type="button" class="btn btn-sm btn-primary demo-driver-add-btn"${avail.length ? '' : ' disabled'}>+ ${escapeHtml(i18n.t('demoDriverAddBtn') || 'Add')}</button>
    </div>`;
    container.innerHTML = html;
  };

  render();

  container.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.demo-driver-add-btn');
    if (addBtn) {
      const sel = container.querySelector('.demo-driver-select');
      const id = sel && sel.value;
      if (id && !rows.some(r => r.driver === id)) { rows.push({ driver: id, level: 'required' }); render(); }
      return;
    }
    const lvl = e.target.closest('.demo-driver-level');
    if (lvl) {
      const row = lvl.closest('.demo-driver-row');
      const r = rows.find(x => x.driver === row.dataset.driver);
      if (r) { r.level = lvl.dataset.set === 'required' ? 'required' : 'optional'; render(); }
      return;
    }
    const rm = e.target.closest('.demo-driver-remove');
    if (rm) {
      const row = rm.closest('.demo-driver-row');
      rows = rows.filter(x => x.driver !== row.dataset.driver);
      render();
    }
  });
}

async function loadDemos() {
  const demosList = document.getElementById('demosList');
  if (!demosList) return;

  demosList.innerHTML = `<p class="loading-text">${i18n.t('loadingDemos')}</p>`;

  try {
    const result = await apiClient.getDemos();
    demosCache = result.demos || result.items || [];
    // Board id -> name map for the board facet chips (best-effort).
    try {
      const lang = i18n.getLanguage();
      const boardsResult = await apiClient.getBoards();
      const allBoards = boardsResult.boards || boardsResult.items || [];
      demosBoardNameMap = Object.fromEntries(allBoards.map(b =>
        [b.id, (b.name && (b.name[lang] || b.name.en || b.name['zh-CN'])) || b.id]));
    } catch { demosBoardNameMap = {}; }
    populateDemoFacets();
    filterDemos();
  } catch (error) {
    console.error('[loadDemos] error:', error);
    demosList.innerHTML = `<p class="loading-text" style="color: var(--color-error);">Error: ${error.message}</p>`;
  }
}

function filterDemos() {
  const searchVal = (document.getElementById('demoSearch')?.value || '').toLowerCase().trim();

  // Always scoped to the active type tab (example / app).
  let filtered = demosCache.filter(d => (d.type === 'app' ? 'app' : 'example') === demosActiveType);

  // Facet: tags (OR — demo must carry at least one selected tag).
  if (demosFilterTags.length) {
    filtered = filtered.filter(d => Array.isArray(d.tags) && demosFilterTags.some(t => d.tags.includes(t)));
  }
  // Facet: boards (OR — demo must support at least one selected board).
  if (demosFilterBoards.length) {
    filtered = filtered.filter(d => Array.isArray(d.boards) && demosFilterBoards.some(b => d.boards.includes(b)));
  }

  // Full-text: name (en+zh), summary (en+zh), id, tags, boards.
  if (searchVal) {
    filtered = filtered.filter(d => {
      const nameEn = (typeof d.name === 'object' ? d.name.en : d.name) || '';
      const nameZh = (typeof d.name === 'object' ? d.name['zh-CN'] : '') || '';
      const summaryEn = (typeof d.summary === 'object' ? d.summary.en : '') || '';
      const summaryZh = (typeof d.summary === 'object' ? d.summary['zh-CN'] : '') || '';
      const tagsStr = (d.tags || []).join(' ');
      const boardsStr = (d.boards || []).join(' ');
      const searchable = `${d.id} ${nameEn} ${nameZh} ${summaryEn} ${summaryZh} ${tagsStr} ${boardsStr}`.toLowerCase();
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

  // Unpublished demos sort to the end (published first), matching the boards list.
  const sorted = [...demos].sort((a, b) => (a.publish === false ? 1 : 0) - (b.publish === false ? 1 : 0));
  demosList.innerHTML = sorted.map(d => renderDemoCard(d)).join('');

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

  // Translate the freshly-injected form into the active language
  // (updateUILanguage only runs on init / language switch, not on modal open).
  formContainer.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = i18n.t(el.getAttribute('data-i18n'));
  });
  formContainer.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = i18n.t(el.getAttribute('data-i18n-placeholder'));
  });

  // Populate the supported-board targets editor (Board Config Mapping pane)
  try {
    const boardsResult = await apiClient.getBoards();
    const allBoards = boardsResult.boards || boardsResult.items || [];
    // Only board-keyed configs seed the board-targets repeater; platform-keyed
    // configs are seeded into the platform section's per-platform config inputs.
    setupDemoTargets(allBoards, normalizeDemoConfigs(demo?.configs).filter(c => c.board));
  } catch (err) {
    console.error('[openDemoForm] boards load failed:', err);
  }

  // Populate the platform multi-select (platform scope) — variants the demo supports.
  try {
    const platResult = await apiClient.getPlatforms();
    const plats = platResult.platforms || platResult.items || [];
    const plang = i18n.getLanguage();
    const ploc = (n, fb) => (n && (n[plang] || n.en || n['zh-CN'])) || fb;
    const sel = Array.isArray(demo?.platforms) ? demo.platforms : [];
    // Pre-fill each platform's config file from existing platform-scoped
    // `configs` entries ({ platform, options:[{file}] }). A platform demo's
    // .config is a defconfig carrying the demo's feature kconfig — the IDE uses
    // it as the build base and repoints the board choice at the chosen board.
    const platConfigFile = {};
    (demo?.configs || []).forEach(c => {
      if (c.platform && Array.isArray(c.options) && c.options[0] && c.options[0].file) {
        platConfigFile[c.platform] = c.options[0].file;
      }
    });
    const cont = document.getElementById('demoPlatforms');
    if (cont) {
      cont.innerHTML = plats.length
        ? plats.map(p => `<div class="demo-plat-row" data-platform="${escapeHtml(p.id)}">
            <label class="demo-plat"><input type="checkbox" class="demo-plat-cb" value="${escapeHtml(p.id)}"${sel.includes(p.id) ? ' checked' : ''}> ${escapeHtml(ploc(p.name, p.id))}</label>
            <input type="text" class="demo-plat-config" data-i18n-placeholder="demoPlatformConfigPlaceholder" placeholder="config file (optional)" value="${escapeHtml(platConfigFile[p.id] || '')}">
          </div>`).join('')
        : `<small style="color:var(--color-muted)">${i18n.t('demoPlatformsEmpty')}</small>`;
      // These rows are injected after the form's initial data-i18n pass, so
      // apply placeholder translations to them here.
      cont.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = i18n.t(el.getAttribute('data-i18n-placeholder'));
      });
    }
  } catch (err) {
    console.error('[openDemoForm] platforms load failed:', err);
  }

  // Tags chip multi-select (controlled vocabulary, type-aware)
  setupDemoTagsSelect();

  // Hardware-driver dependencies — vocabulary from the "peripherals" tag category.
  try {
    const tagsResult = await apiClient.getTags();
    const peri = (tagsResult.categories || []).find(c => c.id === 'peripherals');
    const vocab = (peri?.tags || []).map(t => ({ id: t.id, en: t.en, 'zh-CN': t['zh-CN'] }));
    setupDemoDrivers(vocab, demo?.drivers);
  } catch (err) {
    console.error('[openDemoForm] driver vocab load failed:', err);
    setupDemoDrivers([], demo?.drivers);
  }

  // Tab switching (Basic Info / Board Config Mapping)
  formContainer.querySelectorAll('.demo-form-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const pane = tab.dataset.pane;
      formContainer.querySelectorAll('.demo-form-tab').forEach(t => t.classList.toggle('active', t === tab));
      formContainer.querySelectorAll('.demo-pane').forEach(p => {
        p.style.display = p.dataset.pane === pane ? '' : 'none';
      });
    });
  });

  // Compatibility scope radios → show the matching section (platform / board).
  const platSection = document.getElementById('demoPlatformsSection');
  const configSection = document.getElementById('demoConfigSection');
  formContainer.querySelectorAll('input[name="demoScope"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const scope = formContainer.querySelector('input[name="demoScope"]:checked')?.value || 'universal';
      if (platSection) platSection.style.display = scope === 'platform' ? '' : 'none';
      if (configSection) configSection.style.display = scope === 'board-specific' ? '' : 'none';
    });
  });

  // Cloud checkbox → reveal the method + data fields (Dependencies pane).
  const cloudCb = document.getElementById('demoCloud');
  const cloudOverrides = document.getElementById('demoCloudOverrides');
  const cloudVia = document.getElementById('demoCloudVia');
  const syncCloudViaFields = () => {
    const via = cloudVia?.value || 'auto';
    formContainer.querySelectorAll('.demo-cloud-field').forEach(f => {
      f.style.display = f.dataset.via === via ? '' : 'none';
    });
  };
  if (cloudCb && cloudOverrides) {
    cloudCb.addEventListener('change', () => {
      cloudOverrides.style.display = cloudCb.checked ? '' : 'none';
    });
  }
  if (cloudVia) cloudVia.addEventListener('change', syncCloudViaFields);

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
      confirmUrlBtn.textContent = i18n.t('demoImageUploading');
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
        confirmUrlBtn.textContent = i18n.t('demoImageUseUrl');
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
