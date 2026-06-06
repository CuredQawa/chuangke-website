import { writable } from 'svelte/store';
import { api } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const accounts = writable([]);
export const currentAccount = writable(null);
export const accountsLoading = writable(false);
export const accountsError = writable(null);

export async function fetchAccounts() {
  accountsLoading.set(true);
  accountsError.set(null);

  try {
    const data = await api.get(API_ENDPOINTS.ACCOUNTS);
    accounts.set(data);
    return data;
  } catch (error) {
    accountsError.set(error.message);
    throw error;
  } finally {
    accountsLoading.set(false);
  }
}

export async function fetchAccount(id) {
  accountsLoading.set(true);
  accountsError.set(null);

  try {
    const data = await api.get(`${API_ENDPOINTS.ACCOUNT}/${id}`);
    currentAccount.set(data);
    return data;
  } catch (error) {
    accountsError.set(error.message);
    throw error;
  } finally {
    accountsLoading.set(false);
  }
}

export async function updateAccount(id, accountData) {
  const data = await api.put(`${API_ENDPOINTS.ACCOUNT}/${id}`, accountData);
  accounts.update(list => list.map(a => a.id === id ? data : a));
  currentAccount.set(data);
  return data;
}

export async function deleteAccount(id) {
  await api.delete(`${API_ENDPOINTS.ACCOUNT}/${id}`);
  accounts.update(list => list.filter(a => a.id !== id));
}
