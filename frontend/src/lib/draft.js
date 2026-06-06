/**
 * 草稿管理工具
 * 提供自动保存和恢复草稿功能
 */

const DRAFT_PREFIX = 'chuangke_draft_';
const DRAFT_TIMESTAMP_PREFIX = 'chuangke_draft_time_';

/**
 * 保存草稿到 localStorage
 * @param {string} key - 草稿的唯一标识（如 'project_new' 或 'project_123'）
 * @param {object} data - 要保存的数据（如 { title, content }）
 */
export function saveDraft(key, data) {
  try {
    localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(data));
    localStorage.setItem(DRAFT_TIMESTAMP_PREFIX + key, Date.now().toString());
  } catch (e) {
    console.error('保存草稿失败:', e);
  }
}

/**
 * 从 localStorage 读取草稿
 * @param {string} key - 草稿的唯一标识
 * @returns {object|null} 保存的数据，如果没有则返回 null
 */
export function loadDraft(key) {
  try {
    const data = localStorage.getItem(DRAFT_PREFIX + key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('读取草稿失败:', e);
    return null;
  }
}

/**
 * 删除草稿
 * @param {string} key - 草稿的唯一标识
 */
export function clearDraft(key) {
  try {
    localStorage.removeItem(DRAFT_PREFIX + key);
    localStorage.removeItem(DRAFT_TIMESTAMP_PREFIX + key);
  } catch (e) {
    console.error('删除草稿失败:', e);
  }
}

/**
 * 获取草稿的保存时间
 * @param {string} key - 草稿的唯一标识
 * @returns {Date|null} 保存时间，如果没有则返回 null
 */
export function getDraftTimestamp(key) {
  try {
    const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_PREFIX + key);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  } catch (e) {
    return null;
  }
}

/**
 * 检查是否有草稿
 * @param {string} key - 草稿的唯一标识
 * @returns {boolean} 是否有草稿
 */
export function hasDraft(key) {
  return localStorage.getItem(DRAFT_PREFIX + key) !== null;
}

/**
 * 生成草稿的唯一标识
 * @param {string} type - 类型（如 'project', 'activity', 'document', 'announcement'）
 * @param {string|number} id - 编辑的项目 ID，新建时为空或 'new'
 * @returns {string} 草稿的唯一标识
 */
export function generateDraftKey(type, id) {
  return id && id !== 'new' ? `${type}_${id}` : `${type}_new`;
}

/**
 * 格式化草稿保存时间
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的时间字符串
 */
export function formatDraftTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
