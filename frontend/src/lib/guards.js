import { get } from 'svelte/store';
import { isAuthenticated, isAdmin } from '../stores/auth.js';
import { push } from 'svelte-spa-router';
import { showToast } from '../stores/ui.js';

export function requireAuth() {
  if (!get(isAuthenticated)) {
    push('/login');
    return false;
  }
  return true;
}

export function requireAdmin() {
  if (!get(isAuthenticated)) {
    push('/login');
    return false;
  }
  if (!get(isAdmin)) {
    showToast('权限不够', 'danger');
    push('/');
    return false;
  }
  return true;
}

export function requireAuthOrAdmin() {
  if (!get(isAuthenticated)) {
    push('/login');
    return false;
  }
  return true;
}
