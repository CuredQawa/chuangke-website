import { writable } from 'svelte/store';
import { api } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const announcements = writable([]);
export const currentAnnouncement = writable(null);
export const announcementsLoading = writable(false);
export const announcementsError = writable(null);

export async function fetchAnnouncements() {
  announcementsLoading.set(true);
  announcementsError.set(null);

  try {
    const data = await api.get(API_ENDPOINTS.ANNOUNCEMENTS);
    announcements.set(data);
    return data;
  } catch (error) {
    announcementsError.set(error.message);
    throw error;
  } finally {
    announcementsLoading.set(false);
  }
}

export async function fetchAnnouncement(id) {
  announcementsLoading.set(true);
  announcementsError.set(null);

  try {
    const data = await api.get(`${API_ENDPOINTS.ANNOUNCEMENT}/${id}`);
    currentAnnouncement.set(data);
    return data;
  } catch (error) {
    announcementsError.set(error.message);
    throw error;
  } finally {
    announcementsLoading.set(false);
  }
}

export async function createAnnouncement(announcementData) {
  const data = await api.post(API_ENDPOINTS.ANNOUNCEMENT, announcementData);
  announcements.update(list => [data, ...list]);
  return data;
}

export async function updateAnnouncement(id, announcementData) {
  await api.put(`${API_ENDPOINTS.ANNOUNCEMENT}/${id}`, announcementData);
  await fetchAnnouncements();
}

export async function deleteAnnouncement(id) {
  await api.delete(`${API_ENDPOINTS.ANNOUNCEMENT}/${id}`);
  announcements.update(list => list.filter(a => a.id !== id));
}
