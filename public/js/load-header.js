// ../js/load-header.js

window.loadHeaderPromise = (async () => {
  try {
    const response = await fetch('header.html');
    if (!response.ok) throw new Error(`加载失败: ${response.status} ${response.statusText}`);

    const data = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.trim();

    const headerElement = tempDiv.firstElementChild;
    if (headerElement && headerElement.tagName.toLowerCase() === 'header') {
      document.body.prepend(headerElement);
    } else {
      console.error('⚠️ header.html 中应包含 <header> 根标签');
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }

  } catch (err) {
    console.error('❌ 加载 header 出错:', err);
    throw err;
  }
})();