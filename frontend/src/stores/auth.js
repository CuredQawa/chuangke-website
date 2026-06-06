import { writable } from 'svelte/store';
import { api } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const user = writable(null);
export const isAuthenticated = writable(false);
export const isAdmin = writable(false);
export const authLoading = writable(false);
export const authError = writable(null);

export async function login(email, password) {
  authLoading.set(true);
  authError.set(null);

  try {
    const data = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    user.set(data.user);
    isAuthenticated.set(true);
    isAdmin.set(data.user?.role === 'admin');
    return data;
  } catch (error) {
    authError.set(error.message);
    throw error;
  } finally {
    authLoading.set(false);
  }
}

export async function logout() {
  try {
    await api.post(API_ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error('登出失败:', error);
  } finally {
    user.set(null);
    isAuthenticated.set(false);
    isAdmin.set(false);
  }
}

export async function checkAuth() {
  try {
    const data = await api.get(API_ENDPOINTS.ACCOUNT);
    user.set(data);
    isAuthenticated.set(true);
    isAdmin.set(data.role === 'admin');
  } catch {
    user.set(null);
    isAuthenticated.set(false);
    isAdmin.set(false);
  }
}
