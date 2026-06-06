<script>
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import { routes } from './router.js';
  import Header from './components/layout/Header.svelte';
  import Footer from './components/layout/Footer.svelte';
  import Toast from './components/ui/Toast.svelte';
  import { checkAuth } from './stores/auth.js';

  let authChecked = false;
  let authTimeout = false;

  // 全局锚点链接拦截：#xxx 点击后平滑滚动到对应元素，不触发路由跳转
  function handleGlobalAnchorClick(e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#/')) return;
    if (href === '#') return;

    const rawId = href.slice(1);
    if (!rawId) return;

    e.preventDefault();
    e.stopPropagation();

    document.querySelectorAll('.content h1, .content h2, .content h3, .content h4, .content h5, .content h6').forEach(h => {
      if (!h.id) {
        h.id = h.textContent.trim().toLowerCase()
          .replace(/[\s]+/g, '-')
          .replace(/[^\w\u4e00-\u9fff-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
    });

    let decodedId;
    try { decodedId = decodeURIComponent(rawId); } catch { decodedId = rawId; }

    const target = document.getElementById(rawId) || document.getElementById(decodedId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // 路由变化时给 page-wrap 加 class 触发 CSS 动画
  function handleRouteLoaded() {
    const wrap = document.querySelector('.page-wrap');
    if (!wrap) return;
    wrap.classList.remove('page-enter');
    void wrap.offsetWidth;
    wrap.classList.add('page-enter');
  }

  onMount(async () => {
    // 设置超时机制，5秒后如果还没完成就继续渲染
    const timeoutId = setTimeout(() => {
      if (!authChecked) {
        authTimeout = true;
        authChecked = true;
      }
    }, 5000);

    try {
      await checkAuth();
    } catch (error) {
      console.error('认证检查失败:', error);
    } finally {
      clearTimeout(timeoutId);
      authChecked = true;
    }

    if (typeof window.applyTheme === 'function') {
      window.applyTheme(window.getCurrentTheme());
    }

    document.addEventListener('click', handleGlobalAnchorClick, true);
    window.addEventListener('hashchange', handleRouteLoaded);
    return () => {
      document.removeEventListener('click', handleGlobalAnchorClick, true);
      window.removeEventListener('hashchange', handleRouteLoaded);
    };
  });
</script>

<Header />
<main>
  <div class="page-wrap">
    {#if authChecked}
      <Router {routes} on:routeLoaded={handleRouteLoaded} />
    {:else}
      <div class="has-text-centered p-6 loading-container">
        <div class="loading-spinner"></div>
        <p class="mt-3">加载中...</p>
        {#if authTimeout}
          <p class="has-text-grey is-size-7 mt-2">网络较慢，请稍候...</p>
        {/if}
      </div>
    {/if}
  </div>
</main>
<Footer />
<Toast />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  @keyframes page-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  :global(.page-wrap.page-enter) {
    animation: page-fade-in 0.4s ease forwards;
  }

  .loading-container {
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3273dc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
