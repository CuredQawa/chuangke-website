fetch('footer.html')
  .then(response => {
    if (!response.ok) throw new Error('加载 footer.html 失败');
    return response.text();
  })
  .then(data => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.trim();

    // 插入到 body 最后
    const footerElement = tempDiv.firstElementChild;
    if (footerElement && footerElement.tagName.toLowerCase() === 'footer') {
      document.body.appendChild(footerElement);
    } else {
      console.error('footer.html 中没有 <footer> 标签');
    }

    // 设置年份
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }

  })
  .catch(err => {
    console.error('加载 footer 出错:', err);
  });