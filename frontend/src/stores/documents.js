import { writable, get } from 'svelte/store';
import { api } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const documents = writable([]);
export const currentDocument = writable(null);
export const documentsLoading = writable(false);
export const documentsError = writable(null);

export async function fetchDocuments() {
  documentsLoading.set(true);
  documentsError.set(null);

  try {
    const data = await api.get(API_ENDPOINTS.DOCUMENTS);
    documents.set(data);
    return data;
  } catch (error) {
    documentsError.set(error.message);
    throw error;
  } finally {
    documentsLoading.set(false);
  }
}

export async function fetchDocument(id) {
  documentsLoading.set(true);
  documentsError.set(null);

  try {
    const data = await api.get(`${API_ENDPOINTS.DOCUMENT}/${id}`);
    currentDocument.set(data);
    return data;
  } catch (error) {
    documentsError.set(error.message);
    throw error;
  } finally {
    documentsLoading.set(false);
  }
}

export async function createDocument(docData) {
  const data = await api.post(API_ENDPOINTS.DOCUMENT, docData);
  documents.update(list => [data, ...list]);
  return data;
}

export async function updateDocument(id, docData) {
  const data = await api.put(`${API_ENDPOINTS.DOCUMENT}/${id}`, docData);
  documents.update(list => list.map(d => d.id === id ? data : d));
  if (get(currentDocument)?.id === id) currentDocument.set(data);
  return data;
}

export async function deleteDocument(id) {
  await api.delete(`${API_ENDPOINTS.DOCUMENT}/${id}`);
  documents.update(list => list.filter(d => d.id !== id));
}
