// 动态加载 header.html 与代码高亮，并初始化交互功能

// 动态加载 highlight.js
function loadHighlightJS() {
  // 创建 highlight.js 脚本
  const hljsScript = document.createElement('script');
  hljsScript.src = 'https://s4.zstatic.net/ajax/libs/highlight.js/11.11.1/highlight.min.js';
  document.head.appendChild(hljsScript);
  window.addCopyButtons = addCopyButtons;

  // 返回 Promise 以便可以等待脚本加载完成
  return new Promise((resolve) => {
    hljsScript.onload = function () {
      resolve();
    };
  });
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

// 初始化代码高亮和复制按钮
function initCodeHighlighting() {
  // 确保 hljs 已加载完成
  if (typeof window.hljs === 'undefined') {
    // 如果 hljs 未定义，等待一段时间后重试
    setTimeout(initCodeHighlighting, 100);
    return;
  }

  // 执行代码高亮
  window.hljs.highlightAll();

  // 添加复制按钮
  window.addCopyButtons();
}

// 将函数添加到window对象，使其在其他页面中可用
window.initCodeHighlighting = initCodeHighlighting;

// 为代码块添加复制按钮
function addCopyButtons() {
  // 等待 DOM 更新后执行
  setTimeout(() => {
    // 确保 hljs 已加载完成
    if (typeof window.hljs === 'undefined') {
      // 如果 hljs 未定义，等待一段时间后重试
      setTimeout(addCopyButtons, 100);
      return;
    }

    document.querySelectorAll('pre code').forEach((block) => {
      // 检查是否已经添加过复制按钮
      const pre = block.parentElement;
      if (!pre.querySelector('.copy-button')) {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.title = "复制代码";
        button.innerHTML = '<i class="iconfont icon-a-lujing37238"></i>';

        button.addEventListener('click', () => {
          const text = block.textContent;
          navigator.clipboard.writeText(text).then(() => {
            button.innerHTML = '✅'; // 复制成功后显示✅
            button.title = "已复制";
            button.classList.add('copied');
            setTimeout(() => {
              button.innerHTML = '<i class="iconfont icon-a-lujing37238"></i>'; // 恢复原始图标
              button.classList.remove('copied');
              button.title = "复制代码";
            }, 2000);
          }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动选择复制');
          });
        });

        pre.style.position = 'relative';
        pre.appendChild(button);
      }
    });
  }, 100);
}

window.loadHeaderPromise = (async () => {
  try {
    // 添加网站图标 (favicon)
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/webp';
    favicon.href = '../images/logo-alpha.webp';
    document.head.appendChild(favicon);

    // 添加网站描述和关键字
    const description = document.createElement('meta');
    description.name = 'description';
    description.content = '湛江一中创客社网站，提供社团公告、项目展示、技术文档等信息';
    document.head.appendChild(description);

    const keywords = document.createElement('meta');
    keywords.name = 'keywords';
    keywords.content = '创客社,湛江一中,社团活动,技术分享,编程,硬件,建模,3D打印,激光切割,社团项目';
    document.head.appendChild(keywords);

    // 加载 highlight.js
    await loadHighlightJS();

    // 加载 Fira Code 字体
    loadFiraCodeFont();

    const response = await fetch('header.html');
    if (!response.ok) throw new Error(`加载失败: ${response.status} ${response.statusText}`);

    const data = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data.trim();

    const headerElement = tempDiv.firstElementChild;
    if (headerElement && headerElement.tagName.toLowerCase() === 'header') {
      headerElement.style.opacity = '0';
      headerElement.style.transition = 'opacity 0.5s ease-in-out';
      document.body.prepend(headerElement);

      // 动画显示
      setTimeout(() => {
        headerElement.style.opacity = '1';
      }, 100);

      // header 加载完成后初始化代码高亮和复制按钮
      initCodeHighlighting();
    } else {
      console.error('⚠️ header.html 中应包含 <header> 根根标签');
    }

    const currentPage = window.location.href;

    // ========== 状态统一控制函数 ==========
    function updateAuthUI(isLoggedIn, user = null) {
      const toggleElement = (el, condition, mode = 'block') => {
        if (!el) return;
        if (condition) {
          el.style.display = mode;
          el.classList.add('active');
        } else {
          el.style.display = 'none';
          el.classList.remove('active');
        }
      };

      if (isLoggedIn && user) {
        // 已登录状态
        toggleElement(document.getElementById('user-info'), true, 'flex');
        toggleElement(document.getElementById('mobile-user-info'), true, 'block');

        toggleElement(document.getElementById('login-btn'), false);
        toggleElement(document.getElementById('mobile-login-btn'), false);

        toggleElement(document.getElementById('logout-btn'), true, 'inline-block');
        toggleElement(document.getElementById('mobile-logout-btn'), true, 'block');

        // 显示用户名和角色
        document.getElementById('username').textContent = user.username;
        document.getElementById('role').textContent = user.role === 'admin' ? '管理员' : '社员';
        document.getElementById('role').className = `role-tag ${user.role}`;

        document.getElementById('mobile-username').textContent = user.username;
        document.getElementById('mobile-role').textContent = user.role === 'admin' ? '管理员' : '社员';
        document.getElementById('mobile-role').className = `role-tag ${user.role}`;

        // 管理账户：仅管理员
        const isAdmin = user.role === 'admin';
        toggleElement(document.getElementById('manage-accounts-btn'), isAdmin, 'inline-block');
        toggleElement(document.getElementById('mobile-manage-accounts-btn'), isAdmin, 'block');

        // 管理图片：社员和管理员
        const isUserOrAdmin = user.role === 'user' || isAdmin;
        toggleElement(document.getElementById('manage-images-btn'), isUserOrAdmin, 'inline-block');
        toggleElement(document.getElementById('mobile-manage-images-btn'), isUserOrAdmin, 'block');

      } else {
        // 未登录状态
        toggleElement(document.getElementById('user-info'), false);
        toggleElement(document.getElementById('mobile-user-info'), false);

        toggleElement(document.getElementById('login-btn'), true, 'inline-block');
        toggleElement(document.getElementById('mobile-login-btn'), true, 'block');

        toggleElement(document.getElementById('logout-btn'), false);
        toggleElement(document.getElementById('mobile-logout-btn'), false);
        toggleElement(document.getElementById('manage-accounts-btn'), false);
        toggleElement(document.getElementById('mobile-manage-accounts-btn'), false);
        toggleElement(document.getElementById('manage-images-btn'), false);
        toggleElement(document.getElementById('mobile-manage-images-btn'), false);
      }
    }

    // ========== 获取用户信息 ==========
    async function loadUserInfo() {
      try {
        const res = await fetch('/api/account', { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          updateAuthUI(true, user);
        } else {
          updateAuthUI(false);
        }
      } catch (err) {
        console.error('获取用户信息失败:', err);
        updateAuthUI(false);
      }
    }

    // ========== 跳转登录 ==========
    function gotoLogin() {
      const returnTo = encodeURIComponent(currentPage);
      window.location.href = `/html/login.html?returnTo=${returnTo}`;
    };

    // ========== 登出 ==========
    window.handleLogout = async function () {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include'
      });
      location.reload();
    };

    // ========== 移动端导航 ==========
    window.navigateTo = function (url) {
      const mobileSidebar = document.getElementById('mobileSidebar');
      const hamburger = document.getElementById('hamburger');
      if (mobileSidebar && hamburger) {
        mobileSidebar.classList.remove('active');
        hamburger.classList.remove('active');
        // 显示汉堡按钮
        hamburger.style.transition = '';
        hamburger.style.opacity = '1';
        hamburger.style.visibility = 'visible';
      }
      window.location.href = url;
    };

    // ========== 汉堡菜单逻辑 ==========
    const hamburger = document.getElementById('hamburger');
    const mobileSidebar = document.getElementById('mobileSidebar');

    if (hamburger && mobileSidebar) {
      // 汉堡按钮点击
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        mobileSidebar.classList.toggle('active');

        // 打开侧边栏后立即隐藏汉堡按钮，避免动画冲突
        if (hamburger.classList.contains('active')) {
          // 立即暂停按钮的过渡动画并隐藏
          hamburger.style.transition = 'none';
          hamburger.style.opacity = '0';
          hamburger.style.visibility = 'hidden';

          // 强制重排以确保样式立即生效
          hamburger.offsetHeight;
        } else {
          // 关闭侧边栏后显示汉堡按钮
          hamburger.style.transition = '';
          hamburger.style.opacity = '1';
          hamburger.style.visibility = 'visible';
        }
      });

      // 阻止侧边栏点击关闭
      mobileSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // 点击页面其他区域关闭
      document.addEventListener('click', () => {
        if (mobileSidebar.classList.contains('active')) {
          hamburger.classList.remove('active');
          mobileSidebar.classList.remove('active');
          // 关闭侧边栏后显示汉堡按钮
          hamburger.style.transition = '';
          hamburger.style.opacity = '1';
          hamburger.style.visibility = 'visible';
        }
      });
    }

    // ========== 移动端下拉菜单（更多） ==========
    function initMobileDropdowns() {
      setTimeout(() => {
        const items = document.querySelectorAll('[data-mobile-dropdown]');
        items.forEach(item => {
          item.addEventListener('click', function (e) {
            e.stopPropagation();

            const submenuName = this.dataset.mobileDropdown;
            const submenu = document.querySelector(`[data-submenu="${submenuName}"]`);
            if (!submenu) return;

            // 切换激活状态
            const isActive = submenu.classList.toggle('active');

            // 添加动画效果
            if (isActive) {
              // 显示时的动画
              submenu.style.display = 'block';
              submenu.style.opacity = '0';
              submenu.style.transform = 'translateY(-10px)';
              submenu.offsetHeight; // 触发重排
              submenu.style.transition = 'all 0.3s ease';
              submenu.style.opacity = '1';
              submenu.style.transform = 'translateY(0)';
            } else {
              // 隐藏时的动画
              submenu.style.transition = 'all 0.3s ease';
              submenu.style.opacity = '0';
              submenu.style.transform = 'translateY(-10px)';
              // 动画结束后隐藏元素
              setTimeout(() => {
                if (!submenu.classList.contains('active')) {
                  submenu.style.display = 'none';
                }
              }, 300);
            }

            const arrowSpan = this.querySelector('span[data-arrow]');
            if (arrowSpan) {
              arrowSpan.textContent = isActive ? '▲' : '▼';
            }
          });
        });
      }, 100);
    }

    // ========== 绑定按钮事件 ==========
    document.getElementById('login-btn')?.addEventListener('click', gotoLogin);
    document.getElementById('mobile-login-btn')?.addEventListener('click', gotoLogin);

    // ========== 初始化 ==========
    loadUserInfo();
    initMobileDropdowns();

  } catch (err) {
    console.error('❌ 加载 header 出错:', err);
    throw err;
  }
})();