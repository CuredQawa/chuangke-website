<script>
  import { onMount } from 'svelte';
  import { documents, fetchDocuments, documentsLoading } from '../stores/documents.js';
  import { isAuthenticated, isAdmin } from '../stores/auth.js';
  import { link } from 'svelte-spa-router';
  import { renderMarkdown, sanitizeHtml } from '../lib/markdown.js';
  import { escapeHtml } from '../lib/sanitize.js';

  let selectedDoc = null;
  let docContent = '';
  let contentEl;

  onMount(async () => {
    await fetchDocuments();
    if ($documents.length > 0) {
      selectDoc($documents[0].id, 0);
    }

    const handleScroll = () => {
      const toTop = document.getElementById('toTop');
      if (toTop) {
        toTop.style.display = window.scrollY > 50 ? 'block' : 'none';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  async function selectDoc(id, index) {
    selectedDoc = id;
    try {
      const res = await fetch(`/api/doc/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '文档不存在');
      const parsedContent = renderMarkdown(data.content);
      const safeTitle = escapeHtml(data.title || '');
      const safeEmail = escapeHtml(data.author?.email || '');
      const safeUsername = escapeHtml(data.author?.username || '未知用户');
      const safeYear = escapeHtml(data.author?.graduation_year ?? '');
      const safeDate = escapeHtml(new Date(data.datetime).toLocaleString());
      docContent = `
        <h2 class="title">${safeTitle}</h2>
        <hr/>
        <div class="content">${parsedContent}</div>
        <hr/>
        <p class="administrator">By&nbsp;&nbsp;<a class="strong" href="mailto:${safeEmail}" title="给${safeYear}届的 ${safeUsername} 发邮件">${safeUsername}</a></p>
        <p class="date">${safeDate}</p>
      `;

      if (contentEl) {
        contentEl.classList.remove('content-enter');
        void contentEl.offsetWidth;
        contentEl.classList.add('content-enter');
      }

      setTimeout(() => {
        if (typeof window.initCodeHighlighting === 'function') {
          window.initCodeHighlighting();
        }
        scrollToTop();
      }, 100);
    } catch (err) {
      const safeMsg = escapeHtml(err.message || '未知错误');
      docContent = `<div class="notification is-danger">加载失败：${safeMsg}</div>`;
    }
  }
  
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

<!-- 管理文档按钮 -->
{#if $isAuthenticated}
  <a href="/admin/documents" use:link class="button is-success is-medium is-fixed-bottom-right is-purple">
    <span class="icon"><i class="iconfont icon-xitongguanli"></i></span>
  </a>
{/if}

<!-- 上滑浏览按钮 -->
<button id="toTop" class="button is-success is-medium is-fixed-bottom-right-for-new-slide-button is-purple" on:click={scrollToTop} style="display: none;">
  <span class="icon"><i class="iconfont icon-xiangshang"></i></span>
</button>

<br>

<section class="container document-page">
  <h1 class="title has-text-centered">📘 文档中心</h1>
  <div class="columns">
    <div class="column is-one-third menu-column">
      <aside class="menu">
        <p class="menu-label">文档列表</p>
        <ul class="menu-list" id="doc-menu">
          {#if $documentsLoading}
            <li><a>加载中......</a></li>
          {:else if $documents.length === 0}
            <li><a>暂无文档</a></li>
          {:else}
            {#each $documents as doc, index}
              <li><a class:is-active={selectedDoc === doc.id} on:click|preventDefault={() => selectDoc(doc.id, index)} href="#">{doc.title}</a></li>
            {/each}
          {/if}
        </ul>
      </aside>
    </div>
    <div class="column">
      <div id="content" bind:this={contentEl}>
        {#if docContent}
          {@html docContent}
        {:else}
          <p>请选择左侧文档以查看内容。</p>
        {/if}
      </div>
    </div>
  </div>
</section>

<br><br><br><br>
