import { writable, get } from 'svelte/store';
import { api } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const projects = writable([]);
export const currentProject = writable(null);
export const projectsLoading = writable(false);
export const projectsError = writable(null);

export async function fetchProjects() {
  projectsLoading.set(true);
  projectsError.set(null);

  try {
    const data = await api.get(API_ENDPOINTS.PROJECTS);
    projects.set(data);
    return data;
  } catch (error) {
    projectsError.set(error.message);
    throw error;
  } finally {
    projectsLoading.set(false);
  }
}

export async function fetchProject(id) {
  projectsLoading.set(true);
  projectsError.set(null);

  try {
    const data = await api.get(`${API_ENDPOINTS.PROJECT}/${id}`);
    currentProject.set(data);
    return data;
  } catch (error) {
    projectsError.set(error.message);
    throw error;
  } finally {
    projectsLoading.set(false);
  }
}

export async function createProject(projectData) {
  const data = await api.post(API_ENDPOINTS.PROJECT, projectData);
  projects.update(list => [data, ...list]);
  return data;
}

export async function updateProject(id, projectData) {
  const data = await api.put(`${API_ENDPOINTS.PROJECT}/${id}`, projectData);
  projects.update(list => list.map(p => p.id === id ? data : p));
  if (get(currentProject)?.id === id) currentProject.set(data);
  return data;
}

export async function deleteProject(id) {
  await api.delete(`${API_ENDPOINTS.PROJECT}/${id}`);
  projects.update(list => list.filter(p => p.id !== id));
}
