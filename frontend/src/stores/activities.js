import { writable, get } from 'svelte/store';
import { api } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const activities = writable([]);
export const currentActivity = writable(null);
export const activitiesLoading = writable(false);
export const activitiesError = writable(null);

export async function fetchActivities() {
  activitiesLoading.set(true);
  activitiesError.set(null);

  try {
    const data = await api.get(API_ENDPOINTS.ACTIVITIES);
    activities.set(data);
    return data;
  } catch (error) {
    activitiesError.set(error.message);
    throw error;
  } finally {
    activitiesLoading.set(false);
  }
}

export async function fetchActivity(id) {
  activitiesLoading.set(true);
  activitiesError.set(null);

  try {
    const data = await api.get(`${API_ENDPOINTS.ACTIVITY}/${id}`);
    currentActivity.set(data);
    return data;
  } catch (error) {
    activitiesError.set(error.message);
    throw error;
  } finally {
    activitiesLoading.set(false);
  }
}

export async function createActivity(activityData) {
  const data = await api.post(API_ENDPOINTS.ACTIVITY, activityData);
  activities.update(list => [data, ...list]);
  return data;
}

export async function updateActivity(id, activityData) {
  const data = await api.put(`${API_ENDPOINTS.ACTIVITY}/${id}`, activityData);
  activities.update(list => list.map(a => a.id === id ? data : a));
  if (get(currentActivity)?.id === id) currentActivity.set(data);
  return data;
}

export async function deleteActivity(id) {
  await api.delete(`${API_ENDPOINTS.ACTIVITY}/${id}`);
  activities.update(list => list.filter(a => a.id !== id));
}
