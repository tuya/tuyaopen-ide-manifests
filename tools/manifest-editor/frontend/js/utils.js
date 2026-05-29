// Utility functions for frontend

export function escapeHtml(text) {
  const str = text == null ? '' : String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) {
    return 'just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 1 week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getLocalizedString(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    const lang = document.getElementById('languageSwitcher')?.value || navigator.language || 'en';
    return value[lang] || value.en || Object.values(value)[0] || '';
  }
  return '';
}

export function setLocalizedString(value) {
  if (typeof value === 'string') {
    return { en: value, 'zh-CN': value };
  }
  return value || { en: '', 'zh-CN': '' };
}

export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function showNotification(message, type = 'success', duration = 4000) {
  const container = document.getElementById('notificationContainer');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-message">${escapeHtml(message)}</div>
  `;

  container.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 300ms ease-out';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

export function showError(title, message) {
  const container = document.getElementById('notificationContainer');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = 'notification error';
  notification.innerHTML = `
    <div class="notification-title">${escapeHtml(title)}</div>
    <div class="notification-message">${escapeHtml(message)}</div>
  `;

  container.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 300ms ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

export function parseValidationErrors(errors) {
  if (!Array.isArray(errors)) {
    return [];
  }
  return errors.map((err) => {
    if (typeof err === 'string') return err;
    if (err.message) return err.message;
    return JSON.stringify(err);
  });
}
