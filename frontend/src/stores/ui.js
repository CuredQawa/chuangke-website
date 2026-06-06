import { writable } from 'svelte/store';

export const toast = writable({
  show: false,
  message: '',
  type: 'info',
  timeout: null
});

export function showToast(message, type = 'info', duration) {
  // danger 类型默认 2.5 秒，其他 1.5 秒
  const ttl = duration ?? (type === 'danger' ? 2500 : 1500);
  toast.update(state => {
    if (state.timeout) clearTimeout(state.timeout);
    return {
      show: true,
      message,
      type,
      timeout: setTimeout(() => {
        toast.set({ show: false, message: '', type: 'info', timeout: null });
      }, ttl)
    };
  });
}

export const sidebarOpen = writable(false);
export const mobileMenuOpen = writable(false);
