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
      headerElement.style.opacity = '0';
      headerElement.style.transition = 'opacity 0.5s ease-in-out';
      document.body.prepend(headerElement);

      setTimeout(() => {
        headerElement.style.opacity = '1';
      }, 100);
    } else {
      console.error('⚠️ header.html 中应包含 <header> 根标签');
    }

    const currentPage = window.location.href;

    // ========== 获取用户信息 ==========
    async function loadUserInfo() {
      try {
        const res = await fetch('/api/account', { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          document.getElementById('username').textContent = user.username;
          document.getElementById('role').textContent = user.role === 'admin' ? '管理员' : '社员';
          document.getElementById('role').className = `role-tag ${user.role}`;

          document.getElementById('mobile-username').textContent = user.username;
          document.getElementById('mobile-role').textContent = user.role === 'admin' ? '管理员' : '社员';
          document.getElementById('mobile-role').className = `role-tag ${user.role}`;

          document.getElementById('user-info').style.display = 'flex';
          document.getElementById('mobile-user-info').style.display = 'block';
          document.getElementById('login-btn').style.display = 'none';
          document.getElementById('mobile-login-btn').style.display = 'none';
          document.getElementById('logout-btn').style.display = 'inline-block';
          document.getElementById('mobile-logout-btn').style.display = 'block';

          const show = user.role === 'admin' ? 'inline-block' : 'none';
          document.getElementById('manage-accounts-btn').style.display = show;
          document.getElementById('mobile-manage-accounts-btn').style.display = show;
        } else {
          document.getElementById('login-btn').style.display = 'inline-block';
          document.getElementById('mobile-login-btn').style.display = 'block';
          document.getElementById('logout-btn').style.display = 'none';
          document.getElementById('mobile-logout-btn').style.display = 'none';
        }
      } catch (err) {
        console.error('获取用户信息失败', err);
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

    // ========== 移动端导航 ==========
    window.navigateTo = function (url) {
      document.getElementById('mobileSidebar').classList.remove('active');
      document.getElementById('hamburger').classList.remove('active');
      window.location.href = url;
    };

    // ========== 汉堡菜单逻辑 ==========
    const hamburger = document.getElementById('hamburger');
    const mobileSidebar = document.getElementById('mobileSidebar');

    if (hamburger && mobileSidebar) {
      // 汉堡按钮切换
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        mobileSidebar.classList.toggle('active');
      });

      // 点击侧边栏内部不关闭
      mobileSidebar.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // 点击外部关闭
      document.addEventListener('click', () => {
        if (mobileSidebar.classList.contains('active')) {
          hamburger.classList.remove('active');
          mobileSidebar.classList.remove('active');
        }
      });
    }

    // ========== 修复：更多下拉菜单 ==========
    function initMobileDropdowns() {
      // 等待 DOM 稳定
      setTimeout(() => {
        const items = document.querySelectorAll('[data-mobile-dropdown]');
        console.log('找到 data-mobile-dropdown 元素:', items.length); // 调试

        items.forEach(item => {
          item.addEventListener('click', function (e) {
            e.stopPropagation(); // 阻止关闭侧边栏

            const submenuName = this.dataset.mobileDropdown;
            const submenu = document.querySelector(`[data-submenu="${submenuName}"]`);

            if (!submenu) {
              console.warn(`未找到 submenu: ${submenuName}`);
              return;
            }

            // 切换显示
            const isActive = submenu.classList.toggle('active');

            // 更新箭头
            const span = this.querySelector('span');
            if (span) {
              span.textContent = isActive ? '▲' : '▼';
            }
          });
        });
      }, 100); // 确保 DOM 已插入
    }

    // 绑定按钮
    document.getElementById('login-btn')?.addEventListener('click', gotoLogin);
    document.getElementById('mobile-login-btn')?.addEventListener('click', gotoLogin);

    // ========== 初始化 ==========
    loadUserInfo();
    initMobileDropdowns(); // ✅ 修复后调用

  } catch (err) {
    console.error('❌ 加载 header 出错:', err);
    throw err;
  }
})();