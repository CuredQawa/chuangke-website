<script>
  export let params = {};

  import { onMount } from 'svelte';
  import { link } from 'svelte-spa-router';
  import { renderMarkdown } from '../lib/markdown.js';
  import { escapeHtml } from '../lib/sanitize.js';

  let content = '';
  let loading = true;
  let error = null;
  let contentEl;

  onMount(async () => {
    const handleScroll = () => {
      const toTop = document.getElementById('toTop');
      if (toTop) {
        toTop.style.display = window.scrollY > 50 ? 'block' : 'none';
      }
    };
    window.addEventListener('scroll', handleScroll);

    if (!params.id) {
      error = '无效的活动ID';
      loading = false;
      return;
    }

    try {
      const res = await fetch(`/api/activity/${params.id}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '活动不存在');
      const parsedContent = renderMarkdown(data.content);
      const safeTitle = escapeHtml(data.title || '');
      const safeEmail = escapeHtml(data.author?.email || '');
      const safeUsername = escapeHtml(data.author?.username || '未知用户');
      const safeDate = escapeHtml(new Date(data.datetime).toLocaleString());
      content = `
        <h1 class="title">${safeTitle}</h1>
        <hr/>
        <div class="content">${parsedContent}</div>
        <hr/>
        <p class="administrator">By&nbsp;&nbsp;<a class="strong" href="mailto:${safeEmail}">${safeUsername}</a></p>
        <p class="date">${safeDate}</p>
      `;
      loading = false;

      if (contentEl) {
        contentEl.classList.remove('content-enter');
        void contentEl.offsetWidth;
        contentEl.classList.add('content-enter');
      }

      setTimeout(() => {
        if (typeof window.initCodeHighlighting === 'function') {
          window.initCodeHighlighting();
        }
      }, 100);
    } catch (err) {
      error = err.message;
      loading = false;
    }

    return () => window.removeEventListener('scroll', handleScroll);
  });
  
  function scrollToTop() {
    var timer = setInterval(function () {
      var distanceY = document.documentElement.scrollTop || document.body.scrollTop;
      if (distanceY == 0) {
        clearInterval(timer);
        return;
      }
      var speed = Math.ceil(distanceY / 10);
      document.documentElement.scrollTop = distanceY - speed;
    }, 10);
  }
</script>

<!-- 上滑浏览按钮 -->
<button id="toTop" class="button is-success is-medium is-fixed-bottom-right-for-new-slide-button is-purple" on:click={scrollToTop} style="display: none;">
  <span class="icon"><i class="iconfont icon-xiangshang"></i></span>
</button>

<section class="container">
  <a href="/activities" use:link class="back-link">&larr; 返回活动首页</a>
  
  {#if loading}
    <p>加载中......</p>
  {:else if error}
    <div class="notification is-danger">加载失败：{error}</div>
  {:else}
    <div id="content" bind:this={contentEl}>
      {@html content}
    </div>
  {/if}
</section>

<style>
  .container {
    padding: 2rem;
  }
  
  .back-link {
    margin-bottom: 1rem;
    display: inline-block;
  }
</style>
