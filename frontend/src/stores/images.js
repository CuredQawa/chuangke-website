import { writable, get } from 'svelte/store';
import { api } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const images = writable([]);
export const currentImage = writable(null);
export const imagesLoading = writable(false);
export const imagesError = writable(null);

export async function fetchImages() {
  imagesLoading.set(true);
  imagesError.set(null);

  try {
    const data = await api.get(API_ENDPOINTS.IMAGES);
    images.set(data);
    return data;
  } catch (error) {
    imagesError.set(error.message);
    throw error;
  } finally {
    imagesLoading.set(false);
  }
}

export async function fetchImage(id) {
  imagesLoading.set(true);
  imagesError.set(null);

  try {
    const data = await api.get(`${API_ENDPOINTS.IMAGE}/${id}`);
    currentImage.set(data);
    return data;
  } catch (error) {
    imagesError.set(error.message);
    throw error;
  } finally {
    imagesLoading.set(false);
  }
}

export async function createImage(imageData) {
  const data = await api.post(API_ENDPOINTS.IMAGE, imageData);
  images.update(list => [data, ...list]);
  return data;
}

export async function updateImage(id, imageData) {
  const data = await api.put(`${API_ENDPOINTS.IMAGE}/${id}`, imageData);
  images.update(list => list.map(i => i.id === id ? data : i));
  if (get(currentImage)?.id === id) currentImage.set(data);
  return data;
}

export async function deleteImage(id) {
  await api.delete(`${API_ENDPOINTS.IMAGE}/${id}`);
  images.update(list => list.filter(i => i.id !== id));
}