// i18n Translation System

const TRANSLATIONS = {
  en: {
    // App Title & Branding
    manifestEditor: 'TuyaOpen IDE Manifest',
    editorSubtitle: 'Content Asset Management',
    editorDescription: 'Manage hardware definitions, board information, and demo assets that power the TuyaOpen IDE. Your edits synchronize with the global manifest registry.',

    // Navigation
    boards: '📦 Boards',
    gitHistory: '📜 Git History',
    contribute: '🤝 Contribute',
    settings: '⚙️ Settings',

    // Headers
    developmentBoards: 'Development Boards',
    commitHistory: 'Commit History',
    addNewBoard: '+ Add New Board',
    refresh: 'Refresh',
    pull: '↓ Pull',
    navigation: 'Navigation',
    loading: 'Loading...',
    pullTitle: 'Pull latest changes from git',
    push: '↑ Push',
    pushTitle: 'Push changes to git',
    loadingRepositoryInfo: 'Loading repository info...',
    loadingBoards: 'Loading boards...',
    editBoard: 'Edit Board',
    loadingCommitHistory: 'Loading commit history...',
    confirmPushToRemote: 'Confirm Push to Remote',
    pushChanges: '✓ Push Changes',
    repositoryStatus: 'Repository Status',
    settingsTitle: 'Settings',
    settingsDesc: 'Settings and configuration will be added here.',

    // Contribute Tab
    contributeTitle: 'Contribute to the Manifest',
    contributeSubtitle: 'Share your hardware expertise with the global TuyaOpen community',
    howItWorks: 'How It Works',
    howItWorksDesc: 'The TuyaOpen Manifest is the bridge between IDE, code, and hardware. Every board definition, demo asset, and documentation link you contribute helps thousands of developers worldwide.',
    editingGuide: '📖 Editing Guide',
    editingGuideDesc: 'Learn best practices for creating high-quality board information, documentation links, and asset metadata.',
    submissionProcess: '🚀 Submission Process',
    submissionProcessDesc: 'Create a new board, validate your changes, push to the repository, and open a pull request for review.',
    repositoryPath: '🗂️ Repository Path',
    repositoryPathDesc: 'Understand the structure: vendor/tuyaopen-ide-manifests/boards-and-chips/',
    qualityStandards: '⭐ Quality Standards',
    qualityStandardsDesc: 'High-quality manifests lead to better developer experiences. Follow our guidelines for descriptions, documentation, and asset organization.',

    // Contribution Guide Details
    step1Title: 'Fork or Clone',
    step1Desc: 'Clone the manifest repository to your local machine or fork it on GitHub.',
    step2Title: 'Create or Edit',
    step2Desc: 'Use this editor to create new boards or update existing ones. Changes are auto-committed with descriptive messages.',
    step3Title: 'Validate',
    step3Desc: 'Schema validation ensures your data is correct. All URLs, formats, and references are checked automatically.',
    step4Title: 'Push & Submit',
    step4Desc: 'Push changes to your branch and create a pull request. Our team reviews and merges high-quality contributions.',

    // PR & Fork Workflow
    prCreated: '✅ Creating Pull Request...',
    prLinkTitle: 'Your Pull Request',
    prLinkDesc: 'Your changes have been pushed! Opening GitHub to create a pull request...',
    prOpening: '🔗 Opening GitHub...',
    forkBranchDetected: 'Fork branch detected - Will guide you to create a PR',
    prAutoFill: 'PR title and description will be auto-filled with your commit message',

    // Quality Banner
    qualityTip: '💡 Quality Tips',
    qualityMessage: 'High-quality board information is the developer\'s first step. Please carefully complete the following:',
    qualityPoint1: '✓ Accurate Board ID - Must match board.config in TuyaOpen SDK',
    qualityPoint2: '✓ Clear Description - Use concise language to explain board features',
    qualityPoint3: '✓ Complete Documentation - Provide schematics, user guides, etc.',
    qualityPoint4: '✓ Correct Purchase Link - Help developers quickly obtain hardware',

    // Form Fields
    boardId: 'Board ID',
    boardIdWarning: '⚠️ CRITICAL: Board ID must match board.config in TuyaOpen SDK. Cannot be changed after creation!',
    boardIdFormat: 'Format: lowercase letters, numbers, hyphens (kebab-case)',
    boardNameEn: 'Board Name (English)',
    boardNameEnPlaceholder: 'e.g., Tuya T5AI Development Board',
    boardNameZh: 'Board Name (Chinese)',
    boardNameZhPlaceholder: 'e.g., 涂鸦 T5AI 开发板',
    chipPlatform: 'Chip Platform',
    chipPlatformHelp: 'Select the chip platform this board is based on',
    functionDescEn: 'Function Description (English)',
    functionDescEnPlaceholder: 'Describe key features and capabilities',
    functionDescZh: 'Function Description (Chinese)',
    manufacturer: 'Manufacturer',
    manufacturerHelp: 'Board manufacturer name',
    tags: 'Tags (comma-separated)',
    tagsHelp: 'Use commas to separate key feature tags for easy search',
    schematicLink: 'Schematic Link (HTTPS)',
    schematicLinkHelp: 'Direct link to board schematic PDF or image',
    userManualEn: 'User Manual (English)',
    userManualEnHelp: 'User guide with pin definitions, usage methods, etc.',
    userManualZh: 'User Manual (Chinese)',
    userManualZhHelp: 'Chinese version user manual',
    purchaseLinkEn: 'Purchase Link (English)',
    purchaseLinkEnHelp: 'Official or authorized channels where developers can buy this board',
    purchaseLinkZh: 'Purchase Link (Chinese)',
    purchaseLinkZhHelp: 'Chinese purchase channels',

    // Image Upload
    uploadFile: '📁 Upload File',
    fromUrl: '🔗 From URL',
    dragDropImage: 'Drag and drop image here or click to select',
    enterImageUrl: 'Enter a valid HTTPS image URL',
    confirmUpload: 'Confirm Upload',
    cancel: 'Cancel',
    useThisUrl: 'Use This URL',
    noImageSet: 'No image set yet',
    saveFirstToUpload: 'Save board first to upload images',
    current: 'Current',

    // Buttons
    cancelBtn: 'Cancel',
    createBoard: '✓ Create Board',
    saveChanges: '✓ Save Changes',
    edit: '✏️ Edit',
    delete: '🗑️ Delete',
    learnMore: 'Learn More →',
    discard: 'Discard',
    keep: 'Keep Editing',

    // Unsaved Changes
    unsavedChangesTitle: '⚠️ Unsaved Changes',
    unsavedChangesMessage: 'You have unsaved changes. Do you want to discard them?',

    // Messages
    createBoardSuccess: 'Board created successfully',
    updateBoardSuccess: 'Board updated successfully',
    imagUploadedSuccess: 'Image uploaded successfully',
    boardDeletedSuccess: 'Board permanently deleted',
    deleteWarning: '⚠️ WARNING: Delete board',
    deleteCannotUndo: 'This action CANNOT be undone!',
    deleteConfirmation: '🔴 FINAL CONFIRMATION - Type the board ID to confirm deletion',
    typeExactlyToConfirm: 'Please enter exactly',
    toConfirm: 'to confirm',
    invalidUrl: 'URL must use HTTPS protocol',

    // Repository Status
    repositoryStatus: 'Repository Status',
    branch: 'Branch',
    status: 'Status',
    uncommitted: 'Uncommitted',
    ahead: 'Ahead',
    clean: '✅ Clean',
    dirty: '⚠️ Dirty',
    files: 'files',
    waitingToPush: 'Waiting to push',
    unknown: 'unknown',

    // Peripheral Editor
    boardInfoTab: 'Board Info',
    peripheralsTab: 'Peripherals',
    expansionPinsTab: 'Expansion Pins',
    periAddPeripheral: '+ Add',
    periEmpty: 'No peripherals defined for this type yet.',
    periEdit: 'Edit',
    periDelete: 'Delete',
    periDeleteConfirm: 'Delete this peripheral?',
    periSave: 'Save',
    periCancel: 'Cancel',
    periNameEn: 'Name (EN)',
    periNameZh: 'Name (ZH)',
    periModel: 'Model',
    periResolution: 'Resolution',
    periAxes: 'Axes',
    periCount: 'Count',
    periInterface: 'Interface',
    periOptional: 'Optional',
    periPinMapping: 'Pin Mapping',
    periGroup: 'Group',
    periRole: 'Role',
    periNoteEn: 'Note (EN)',
    periNoteZh: 'Note (ZH)',
    periNameRequired: 'Name (EN) is required.',
    periType: 'Type',
    periTypeRequired: 'Type is required (e.g. audio, display, button).',

    // Demos Tab
    navDemos: '🎮 Demos',
    demosTitle: 'Demos & Examples',
    demoAdd: '+ Add Demo',
    demoSearchPlaceholder: 'Search by name, tag, path...',
    demoFilterAll: 'All Types',
    demoFilterApps: 'Apps (Board-specific)',
    demoFilterExamples: 'Examples (Universal)',
    loadingDemos: 'Loading demos...',
    demosEmpty: 'No demos found.',
    demoFormTitle: 'Add Demo',
    demoFormTitleEdit: 'Edit Demo',
    demoEdit: 'Edit',
    demoDelete: 'Delete',
    demoDeleteConfirm: 'Delete demo "{id}"? This cannot be undone.',
    demoSave: 'Save',
    demoCreated: 'Demo created successfully',
    demoUpdated: 'Demo updated successfully',
    demoDeleted: 'Demo deleted successfully',
    demoId: 'ID',
    demoNameEn: 'Name (EN)',
    demoNameZh: 'Name (zh-CN)',
    demoSummaryEn: 'Summary (EN)',
    demoSummaryZh: 'Summary (zh-CN)',
    demoTags: 'Tags (comma separated)',
    demoCompatibility: 'Compatibility',
    demoUniversal: 'Universal (cross-platform)',
    demoBoardSpecific: 'Board-specific',
    demoBoardsList: 'Boards (comma separated)',
    demoSource: 'Source',
    demoSourceRepo: 'Repository URL',
    demoSourceSubpath: 'Subpath',
    demoSourceRef: 'Branch/Ref',
    demoDocumentation: 'Documentation',
    demoDefaultConfig: 'Default Config (JSON)',

    // Board Kconfig & Scaffold
    boardKconfigId: 'Kconfig ID',
    boardKconfigIdHint: 'Must match SDK board directory name (e.g. TUYA_T5AI_EVB)',
    boardScaffold: 'Scaffold Settings',
    boardScaffoldTemplate: 'Template Path',
    boardScaffoldBaseConfig: 'Base Config (JSON)',
    boardAssociatedDemos: 'Associated Demos',

    // Demo Configs Map
    demoConfigs: 'Board Configs',
    demoConfigsHint: 'Map kconfigId to config file path',
    demoConfigsAdd: '+ Add Config',
    demoConfigsKconfigId: 'Kconfig ID',
    demoConfigsFile: 'Config File',
  },

  'zh-CN': {
    // App Title & Branding
    manifestEditor: 'TuyaOpen IDE 清单',
    editorSubtitle: '内容资产管理编辑器',
    editorDescription: '管理支持 TuyaOpen IDE 的硬件定义、开发板信息和演示资产。你的编辑将同步到全球清单注册表。',

    // Navigation
    boards: '📦 开发板',
    gitHistory: '📜 Git 历史',
    contribute: '🤝 贡献',
    settings: '⚙️ 设置',

    // Headers
    developmentBoards: '开发板管理',
    commitHistory: '提交历史',
    addNewBoard: '+ 添加新开发板',
    refresh: '刷新',
    pull: '↓ 拉取',
    navigation: '导航',
    loading: '加载中...',
    pullTitle: '从git拉取最新更改',
    push: '↑ 推送',
    pushTitle: '推送更改到git',
    loadingRepositoryInfo: '加载仓库信息...',
    loadingBoards: '加载开发板...',
    editBoard: '编辑开发板',
    loadingCommitHistory: '加载提交历史...',
    confirmPushToRemote: '确认推送到远程仓库',
    pushChanges: '✓ 推送更改',
    repositoryStatus: '仓库状态',
    settingsTitle: '设置',
    settingsDesc: '设置和配置将在此处添加。',

    // Contribute Tab
    contributeTitle: '贡献清单',
    contributeSubtitle: '与全球 TuyaOpen 社区分享你的硬件专业知识',
    howItWorks: '工作原理',
    howItWorksDesc: 'TuyaOpen 清单是 IDE、代码和硬件之间的桥梁。你贡献的每个开发板定义、演示资产和文档链接都会帮助全球数千名开发者。',
    editingGuide: '📖 编辑指南',
    editingGuideDesc: '学习创建优质开发板信息、文档链接和资产元数据的最佳实践。',
    submissionProcess: '🚀 提交流程',
    submissionProcessDesc: '创建新开发板、验证更改、推送到仓库，然后提交拉取请求进行审查。',
    repositoryPath: '🗂️ 仓库路径',
    repositoryPathDesc: '了解结构：vendor/tuyaopen-ide-manifests/boards-and-chips/',
    qualityStandards: '⭐ 质量标准',
    qualityStandardsDesc: '高质量的清单能提供更好的开发体验。遵循我们的描述、文档和资产组织指南。',

    // Contribution Guide Details
    step1Title: 'Fork 或克隆',
    step1Desc: '将清单仓库克隆到本地或在 GitHub 上 fork。',
    step2Title: '创建或编辑',
    step2Desc: '使用此编辑器创建新开发板或更新现有开发板。更改会自动提交并附带描述性消息。',
    step3Title: '验证',
    step3Desc: '模式验证确保你的数据正确。所有 URL、格式和引用都会自动检查。',
    step4Title: '推送并提交',
    step4Desc: '将更改推送到你的分支并创建拉取请求。我们的团队审查并合并高质量的贡献。',

    // PR & Fork Workflow
    prCreated: '✅ 正在创建拉取请求...',
    prLinkTitle: '你的拉取请求',
    prLinkDesc: '你的更改已推送！正在打开 GitHub 创建拉取请求...',
    prOpening: '🔗 正在打开 GitHub...',
    forkBranchDetected: '检测到 Fork 分支 - 将引导你创建 PR',
    prAutoFill: 'PR 标题和描述将自动填充为你的提交信息',

    // Quality Banner
    qualityTip: '💡 质量提示',
    qualityMessage: '优质的开发板信息是开发者的第一步。请认真完整地填写以下内容：',
    qualityPoint1: '✓ 准确的Board ID - 与TuyaOpen SDK中的board.config匹配',
    qualityPoint2: '✓ 清晰的描述 - 用简明的语言说明开发板的功能特性',
    qualityPoint3: '✓ 完整的文档链接 - 提供原理图、用户指南等重要资源',
    qualityPoint4: '✓ 正确的采购链接 - 帮助开发者快速获取硬件',

    // Form Fields
    boardId: '开发板ID',
    boardIdWarning: '⚠️ 关键字段: Board ID 必须与 TuyaOpen SDK 中 board.config 完全匹配。创建后无法更改！',
    boardIdFormat: '格式: 小写字母、数字、连字符 (kebab-case)',
    boardNameEn: '开发板名称 (英文)',
    boardNameEnPlaceholder: '例如: Tuya T5AI Development Board',
    boardNameZh: '开发板名称 (中文)',
    boardNameZhPlaceholder: '例如: 涂鸦 T5AI 开发板',
    chipPlatform: '芯片平台',
    chipPlatformHelp: '选择开发板基于的芯片平台',
    functionDescEn: '功能描述 (英文)',
    functionDescEnPlaceholder: '说明开发板的关键功能特性',
    functionDescZh: '功能描述 (中文)',
    manufacturer: '制造商',
    manufacturerHelp: '开发板制造商名称',
    tags: '标签 (英文逗号分隔)',
    tagsHelp: '使用逗号分隔关键特性标签，便于开发者搜索和筛选',
    schematicLink: '原理图链接 (HTTPS)',
    schematicLinkHelp: '开发板电路原理图PDF或图片的直接链接',
    userManualEn: '用户手册 (英文)',
    userManualEnHelp: '开发板使用手册或详细文档',
    userManualZh: '用户手册 (中文)',
    userManualZhHelp: '中文版用户手册',
    purchaseLinkEn: '采购链接 (英文)',
    purchaseLinkEnHelp: '开发者可以购买此开发板的官方或授权渠道链接',
    purchaseLinkZh: '采购链接 (中文)',
    purchaseLinkZhHelp: '中文采购渠道',

    // Image Upload
    uploadFile: '📁 上传文件',
    fromUrl: '🔗 从URL添加',
    dragDropImage: '拖拽图片到此处或点击选择',
    enterImageUrl: '输入有效的HTTPS图片URL',
    confirmUpload: '确认上传',
    cancel: '取消',
    useThisUrl: '使用此URL',
    noImageSet: '还未设置图片',
    saveFirstToUpload: '请先保存开发板后再上传图片',
    current: '当前',

    // Buttons
    cancelBtn: '取消',
    createBoard: '✓ 创建开发板',
    saveChanges: '✓ 保存修改',
    edit: '✏️ 编辑',
    delete: '🗑️ 删除',
    learnMore: '了解更多 →',
    discard: '放弃修改',
    keep: '继续编辑',

    // Unsaved Changes
    unsavedChangesTitle: '⚠️ 未保存的更改',
    unsavedChangesMessage: '你有未保存的更改。要放弃这些更改吗？',

    // Messages
    createBoardSuccess: '开发板创建成功',
    updateBoardSuccess: '开发板更新成功',
    imageUploadedSuccess: '图片上传成功',
    boardDeletedSuccess: '开发板已永久删除',
    deleteWarning: '⚠️ 警告: 删除开发板',
    deleteCannotUndo: '此操作无法撤销！',
    deleteConfirmation: '🔴 最终确认 - 输入开发板ID以确认删除',
    typeExactlyToConfirm: '请输入',
    toConfirm: '以确认',
    invalidUrl: 'URL必须使用HTTPS协议',

    // Repository Status
    repositoryStatus: '仓库状态',
    branch: '分支',
    status: '状态',
    uncommitted: '未提交',
    ahead: '领先',
    clean: '✅ 干净',
    dirty: '⚠️ 有修改',
    files: '个文件',
    waitingToPush: '等待推送',
    unknown: '未知',

    // Peripheral Editor
    boardInfoTab: '开发板信息',
    peripheralsTab: '外设',
    expansionPinsTab: '扩展引脚',
    periAddPeripheral: '+ 添加',
    periEmpty: '暂无此类型外设。',
    periEdit: '编辑',
    periDelete: '删除',
    periDeleteConfirm: '确定删除此外设？',
    periSave: '保存',
    periCancel: '取消',
    periNameEn: '名称 (EN)',
    periNameZh: '名称 (中文)',
    periModel: '型号',
    periResolution: '分辨率',
    periAxes: '轴数',
    periCount: '数量',
    periInterface: '接口',
    periOptional: '可选',
    periPinMapping: '引脚映射',
    periGroup: '分组',
    periRole: '角色',
    periNoteEn: '备注 (EN)',
    periNoteZh: '备注 (中文)',
    periNameRequired: '名称 (EN) 不能为空。',
    periType: '类型',
    periTypeRequired: '类型不能为空（如 audio, display, button）。',

    // Demos Tab
    navDemos: '🎮 示例',
    demosTitle: '示例与演示',
    demoAdd: '+ 添加示例',
    demoSearchPlaceholder: '按名称、标签、路径搜索...',
    demoFilterAll: '全部类型',
    demoFilterApps: '应用 (板级相关)',
    demoFilterExamples: '示例 (通用)',
    loadingDemos: '加载示例...',
    demosEmpty: '未找到示例。',
    demoFormTitle: '添加示例',
    demoFormTitleEdit: '编辑示例',
    demoEdit: '编辑',
    demoDelete: '删除',
    demoDeleteConfirm: '确定删除示例 "{id}"？此操作无法撤销。',
    demoSave: '保存',
    demoCreated: '示例创建成功',
    demoUpdated: '示例更新成功',
    demoDeleted: '示例删除成功',
    demoId: 'ID',
    demoNameEn: '名称 (英文)',
    demoNameZh: '名称 (中文)',
    demoSummaryEn: '简介 (英文)',
    demoSummaryZh: '简介 (中文)',
    demoTags: '标签 (逗号分隔)',
    demoCompatibility: '兼容性',
    demoUniversal: '通用 (跨平台)',
    demoBoardSpecific: '板级相关',
    demoBoardsList: '支持的开发板 (逗号分隔)',
    demoSource: '来源',
    demoSourceRepo: '仓库地址',
    demoSourceSubpath: '子路径',
    demoSourceRef: '分支/引用',
    demoDocumentation: '文档',
    demoDefaultConfig: '默认配置 (JSON)',

    // Board Kconfig & Scaffold
    boardKconfigId: 'Kconfig 标识',
    boardKconfigIdHint: '须与 SDK 板级目录名一致（如 TUYA_T5AI_EVB）',
    boardScaffold: '脚手架设置',
    boardScaffoldTemplate: '模板路径',
    boardScaffoldBaseConfig: '基础配置 (JSON)',
    boardAssociatedDemos: '关联示例',

    // Demo Configs Map
    demoConfigs: '板级配置映射',
    demoConfigsHint: '将 kconfigId 映射到配置文件路径',
    demoConfigsAdd: '+ 添加配置',
    demoConfigsKconfigId: 'Kconfig 标识',
    demoConfigsFile: '配置文件',
  }
};

let currentLanguage = localStorage.getItem('editor-language') || 'en';

export function t(key) {
  return TRANSLATIONS[currentLanguage]?.[key] || TRANSLATIONS.en[key] || key;
}

export function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLanguage = lang;
    localStorage.setItem('editor-language', lang);
    return true;
  }
  return false;
}

export function getLanguage() {
  return currentLanguage;
}

export function getAvailableLanguages() {
  return Object.keys(TRANSLATIONS);
}

export default {
  t,
  setLanguage,
  getLanguage,
  getAvailableLanguages,
};
