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

    // ========== 新增：初始化导航逻辑 ==========
    const currentPage = window.location.href;

    // 获取用户信息
    async function loadUserInfo() {
      try {
        const res = await fetch('/api/account', {
          credentials: 'include'
        });

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
          
          // 显示管理账户按钮（仅管理员）
          if (user.role === 'admin') {
            document.getElementById('manage-accounts-btn').style.display = 'inline-block';
          } else {
            document.getElementById('manage-accounts-btn').style.display = 'none';
          }

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

    // 登出
    window.handleLogout = async function () {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include'
      });
      location.reload();
    };

    // 跳转登录
    window.gotoLogin = function () {
      const returnTo = encodeURIComponent(currentPage);
      window.location.href = `/html/login.html?returnTo=${returnTo}`;
    };

    // 跳转管理账号
    window.gotoManageAccounts = function () {
      window.location.href = '/html/manage-accounts.html';
    };

    // 移动端导航
    window.navigateTo = function (url) {
      document.getElementById('mobileSidebar').classList.remove('active');
      document.getElementById('hamburger').classList.remove('active');
      window.location.href = url;
    };

    // 汉堡菜单
    const hamburger = document.getElementById('hamburger');
    const mobileSidebar = document.getElementById('mobileSidebar');
    if (hamburger && mobileSidebar) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileSidebar.classList.toggle('active');
      });
    }

    // 更多菜单切换
    document.querySelectorAll('[data-mobile-dropdown]').forEach(item => {
      item.addEventListener('click', () => {
        const submenu = document.querySelector(`[data-submenu="${item.dataset.mobileDropdown}"]`);
        submenu.classList.toggle('active');
        const span = item.querySelector('span');
        span.textContent = submenu.classList.contains('active') ? '▲' : '▼';
      });
    });

    // 绑定登录按钮
    document.getElementById('login-btn')?.addEventListener('click', gotoLogin);
    document.getElementById('mobile-login-btn')?.addEventListener('click', gotoLogin);

    // 加载用户信息
    loadUserInfo();

    

  } catch (err) {
    console.error('❌ 加载 header 出错:', err);
    throw err;
  }
})();