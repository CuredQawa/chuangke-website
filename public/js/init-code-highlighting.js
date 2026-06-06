// 初始化代码高亮和复制按钮
function initCodeHighlighting() {
  // 确保 hljs 已加载完成
  if (typeof window.hljs === 'undefined') {
    setTimeout(initCodeHighlighting, 100);
    return;
  }

  // 执行代码高亮
  window.hljs.highlightAll();

  // 添加复制按钮
  addCopyButtons();
}

const COPY_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const CHECK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

// 为代码块添加复制按钮
function addCopyButtons() {
  setTimeout(() => {
    if (typeof window.hljs === 'undefined') {
      setTimeout(addCopyButtons, 100);
      return;
    }

    document.querySelectorAll('pre code').forEach((block) => {
      const pre = block.parentElement;
      // 排除 MarkdownEditor 内的 highlight-layer
      if (pre.classList.contains('highlight-layer')) return;
      if (!pre.querySelector('.copy-button')) {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.title = "复制代码";
        button.innerHTML = COPY_SVG;

        button.addEventListener('click', () => {
          const text = block.textContent;
          navigator.clipboard.writeText(text).then(() => {
            button.innerHTML = CHECK_SVG;
            button.title = "已复制";
            button.classList.add('copied');
            setTimeout(() => {
              button.innerHTML = COPY_SVG;
              button.classList.remove('copied');
              button.title = "复制代码";
            }, 2000);
          }).catch(err => {
            console.error('复制失败:', err);
          });
        });

        pre.style.position = 'relative';
        pre.appendChild(button);
      }
    });
  }, 100);
}

// 添加 Fira Code 字体
function loadFiraCodeFont() {
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://s4.zstatic.net/ajax/libs/firacode/6.2.0/fira_code.min.css';
  fontLink.integrity = 'sha512-MbysAYimH1hH2xYzkkMHB6MqxBqfP0megxsCLknbYqHVwXTCg9IqHbk+ZP/vnhO8UEW6PaXAkKe2vQ+SWACxxA==';
  fontLink.crossOrigin = 'anonymous';
  fontLink.referrerPolicy = 'no-referrer';
  document.head.appendChild(fontLink);
}

// 将函数添加到window对象
window.initCodeHighlighting = initCodeHighlighting;
window.addCopyButtons = addCopyButtons;

// 加载字体
loadFiraCodeFont();
