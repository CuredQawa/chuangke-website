<script>
  import { link, push } from 'svelte-spa-router';
  import { isAuthenticated, isAdmin, user, logout } from '../../stores/auth.js';
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let mobileMenuOpen = false;
  let moreOpen = false;
  
  async function handleLogout() {
    await logout();
    window.location.reload();
  }
  
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    if (!mobileMenuOpen) moreOpen = false;
  }
  
  function toggleMore() {
    moreOpen = !moreOpen;
  }
  
  function gotoLogin() {
    push('/login');
  }
  
  function handleThemeSwitch() {
    if (typeof window.switchTheme === 'function') {
      window.switchTheme();
    }
  }
</script>

<div>
  <header class="header is-risecolor">
    <!-- 主图标（始终显示） -->
    <a class="main-icon-a" href="/" use:link>
      <div class="logo-container">
        <img src="/images/logo-alpha.webp" alt="创客社Logo" class="header-logo">
        <span class="s1">湛江一中创客社</span>
      </div>
    </a>

    <!-- 左侧：桌面导航（仅桌面显示） -->
    <div class="header-left">
      <nav class="navbar-desktop">
        <div class="navbar-menu is-risecolor">
          <div class="navbar-start is-risecolor">
            <a class="navbar-item a-anounce" title="为社员发布上课和活动公告" href="/announcements" use:link>
              <span class="iconfont icon-gonggao09"></span>
              <span class="icon-name">公告</span>
            </a>
            <a class="navbar-item a-prize" title="社团成员的项目展示" href="/projects" use:link>
              <span class="iconfont icon-xunzhang"></span>
              <span class="icon-name">项目</span>
            </a>
            <a class="navbar-item a-rule" title="收录社团的文档" href="/documents" use:link>
              <span class="iconfont icon-a-lujing37238"></span>
              <span class="icon-name">文档</span>
            </a>
            <a class="navbar-item a-kaifa" title="开发工具导航页" href="/development" use:link>
              <span class="iconfont icon-terminal-box-fill"></span>
              <span class="icon-name">开发</span>
            </a>
            <a class="navbar-item a-serve" title="社员接单，赚点零花钱" href="/serve" use:link>
              <span class="iconfont icon-renminbi1"></span>
              <span class="icon-name">服务</span>
            </a>
            <a class="navbar-item a-activity" title="学校有趣活动实时更新" href="/activities" use:link>
              <span class="iconfont icon-huodong"></span>
              <span class="icon-name">活动</span>
            </a>
            <div class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">更多</a>
              <div class="navbar-dropdown">
                <a class="navbar-item" href="/about" use:link>关于</a>
                <a class="navbar-item" href="/rules" use:link>规章制度</a>
                <a class="navbar-item" href="/join" use:link>加入我们</a>
                <hr class="navbar-divider" />
                <a class="navbar-item" href="/contact" use:link>联系我们</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- 右侧：用户信息（仅桌面显示） -->
    <div class="header-right">
      <button class="button theme-switch" on:click={handleThemeSwitch} title="切换主题">
        <span id="theme-switch" class="iconfont icon-ai250"></span>
      </button>

      {#if $isAuthenticated && $user}
        <div class="user-info" style="display: flex;">
          <strong>{$user.username || ''}</strong>
          <span class="role-tag {$user.role || 'user'}">{$user.role === 'admin' ? '管理员' : '社员'}</span>
        </div>
        
        <button class="button is-small is-danger" on:click={handleLogout}>登出</button>
        
        <a class="button is-small is-warning" href="/admin/accounts" use:link>管理账户</a>
        <a class="button is-small is-info" href="/admin/images" use:link>管理图片</a>
      {:else}
        <button id="login-btn" class="button is-small" on:click={gotoLogin}>登录</button>
      {/if}
    </div>

    <!-- 汉堡按钮（移动端） -->
    <div class="hamburger" class:active={mobileMenuOpen} on:click={toggleMobileMenu}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </header>

  <!-- 移动端侧边栏（放在 header 外面） -->
  {#if mobileMenuOpen}
    <div class="mobile-overlay" on:click={toggleMobileMenu}></div>
  {/if}
  <div class="mobile-sidebar" class:active={mobileMenuOpen} on:click={(e) => { if (e.target.closest('a, button:not(.theme-switch-mobile)')) toggleMobileMenu(); }}>
    <div style="margin-top: 1rem; padding: 0.5rem 0;">
      {#if $isAuthenticated && $user}
        <div style="margin-bottom: 1rem;">
          <p style="display: flex; justify-content: center; align-items: center; margin: 0;">
            <span style="font-weight: bold;">{$user.username || ''}</span>
            <span style="margin-left: 8px;" class="role-tag {$user.role || 'user'}">{$user.role === 'admin' ? '管理员' : '社员'}</span>
          </p>
        </div>
        
        <a class="mobile-sidebar-item button is-warning" href="/admin/accounts" use:link style="width: 100%; margin: 0.5rem 0;">管理账户</a>
        <a class="mobile-sidebar-item button is-info" href="/admin/images" use:link style="width: 100%; margin: 0.5rem 0;">管理图片</a>
        
        <button class="mobile-sidebar-item button is-danger" on:click={handleLogout} style="width: 100%; margin: 0.5rem 0;">登出</button>
      {:else}
        <button class="mobile-sidebar-item button" on:click={gotoLogin} style="width: 100%; margin: 0.5rem 0;">登录</button>
      {/if}
      
      <button class="mobile-sidebar-item button theme-switch-mobile" on:click={handleThemeSwitch} style="width: 100%; margin: 0.5rem 0;">
        切换主题
      </button>
    </div>

    <a class="mobile-sidebar-item" href="/announcements" use:link>公告</a>
    <a class="mobile-sidebar-item" href="/projects" use:link>项目</a>
    <a class="mobile-sidebar-item" href="/documents" use:link>文档</a>
    <a class="mobile-sidebar-item" href="/development" use:link>开发</a>
    <a class="mobile-sidebar-item" href="/serve" use:link>服务</a>
    <a class="mobile-sidebar-item" href="/activities" use:link>活动</a>
    <button class="mobile-sidebar-item" on:click|stopPropagation={toggleMore} data-mobile-dropdown="more">更多 ▼</button>
    {#if moreOpen}
      <div class="mobile-sidebar-submenu" data-submenu="more" transition:slide={{ duration: 300, easing: cubicOut }}>
        <a href="/about" use:link>关于</a>
        <a href="/rules" use:link>规章制度</a>
        <a href="/join" use:link>加入我们</a>
        <a href="/contact" use:link>联系我们</a>
      </div>
    {/if}
  </div>
</div>
