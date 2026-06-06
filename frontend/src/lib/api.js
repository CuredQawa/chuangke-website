const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export const api = {
  get: (endpoint) => request(endpoint),
  
  post: (endpoint, data) => request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint, data) => request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint) => request(endpoint, {
    method: 'DELETE',
  }),
  
  upload: (endpoint, formData) => {
    const url = `${BASE_URL}${endpoint}`;
    return fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    }).then(res => {
      if (!res.ok) throw new Error('上传失败');
      return res.json();
    });
  }
};
