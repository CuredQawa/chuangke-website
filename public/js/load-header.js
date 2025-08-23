// ../js/load-header.js
// 动态加载 header.html 并初始化交互功能

window.loadHeaderPromise = (async () => {
  try {
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
    } else {
      console.error('⚠️ header.html 中应包含 <header> 根标签');
    }

    const currentPage = window.location.href;

    // ========== 状态统一控制函数 ==========
    function updateAuthUI(isLoggedIn, user = null) {
      const show = (el, mode = 'block') => el && (el.style.display = mode);
      const hide = (el) => el && (el.style.display = 'none');

      if (isLoggedIn && user) {
        // 已登录状态
        show(document.getElementById('user-info'), 'flex');
        show(document.getElementById('mobile-user-info'), 'block');

        hide(document.getElementById('login-btn'));
        hide(document.getElementById('mobile-login-btn'));

        show(document.getElementById('logout-btn'), 'inline-block');
        show(document.getElementById('mobile-logout-btn'), 'block');

        // 显示用户名和角色
        document.getElementById('username').textContent = user.username;
        document.getElementById('role').textContent = user.role === 'admin' ? '管理员' : '社员';
        document.getElementById('role').className = `role-tag ${user.role}`;

        document.getElementById('mobile-username').textContent = user.username;
        document.getElementById('mobile-role').textContent = user.role === 'admin' ? '管理员' : '社员';
        document.getElementById('mobile-role').className = `role-tag ${user.role}`;

        // 管理账户：仅管理员
        const isAdmin = user.role === 'admin';
        show(document.getElementById('manage-accounts-btn'), isAdmin ? 'inline-block' : 'none');
        show(document.getElementById('mobile-manage-accounts-btn'), isAdmin ? 'block' : 'none');

        // 管理图片：社员和管理员
        const isUserOrAdmin = user.role === 'user' || isAdmin;
        show(document.getElementById('manage-images-btn'), isUserOrAdmin ? 'inline-block' : 'none');
        show(document.getElementById('mobile-manage-images-btn'), isUserOrAdmin ? 'block' : 'none');

      } else {
        // 未登录状态
        hide(document.getElementById('user-info'));
        hide(document.getElementById('mobile-user-info'));

        show(document.getElementById('login-btn'), 'inline-block');
        show(document.getElementById('mobile-login-btn'), 'block');

        hide(document.getElementById('logout-btn'));
        hide(document.getElementById('mobile-logout-btn'));
        hide(document.getElementById('manage-accounts-btn'));
        hide(document.getElementById('mobile-manage-accounts-btn'));
        hide(document.getElementById('manage-images-btn'));
        hide(document.getElementById('mobile-manage-images-btn'));
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

    // ========== 登出 ==========
    window.handleLogout = async function () {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include'
      });
      location.reload();
    };

    // ========== 跳转登录 ==========
    window.gotoLogin = function () {
      const returnTo = encodeURIComponent(currentPage);
      window.location.href = `/html/login.html?returnTo=${returnTo}`;
    };

    // ========== 跳转管理账户 ==========
    window.gotoManageAccounts = function () {
      window.location.href = '/html/manage-accounts.html';
    };

    // ========== 跳转管理图片 ==========
    window.gotoManageImages = function () {
      window.location.href = '/html/manage-images.html';
    };

    // ========== 移动端导航 ==========
    window.navigateTo = function (url) {
      const mobileSidebar = document.getElementById('mobileSidebar');
      const hamburger = document.getElementById('hamburger');
      if (mobileSidebar && hamburger) {
        mobileSidebar.classList.remove('active');
        hamburger.classList.remove('active');
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

            const isActive = submenu.classList.toggle('active');
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