<script>
  import { onMount } from 'svelte';
  import { announcements, fetchAnnouncements, announcementsLoading, announcementsError } from '../stores/announcements.js';
  import { isAuthenticated, isAdmin } from '../stores/auth.js';
  import { link } from 'svelte-spa-router';
  import { renderMarkdown } from '../lib/markdown.js';
  
  let showScrollTop = false;
  
  onMount(() => {
    fetchAnnouncements();
    
    // 滚动监听
    const handleScroll = () => {
      showScrollTop = window.scrollY > 50;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
  
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<!-- 上滑浏览按钮 -->
{#if showScrollTop}
  <button class="button is-success is-medium is-fixed-bottom-right-for-new-slide-button is-purple" on:click={scrollToTop}>
    <span class="icon"><i class="iconfont icon-xiangshang"></i></span>
  </button>
{/if}

<!-- 管理员专用：发布公告按钮 -->
{#if $isAuthenticated && $isAdmin}
  <a href="/admin/announcements" use:link class="button is-success is-medium is-fixed-bottom-right is-purple">
    <span class="icon">
      <i class="iconfont icon-xitongguanli"></i>
    </span>
  </a>
{/if}

<section class="section announcement-page">
  <div class="frontboard has-text-centered">
    <h1 class="title btitle">创客社公告栏</h1>
    
    {#if $announcementsLoading}
      <p>加载中......</p>
    {:else if $announcementsError}
      <p>无法加载公告信息</p>
    {:else}
      <div class="announcements-grid">
        {#each $announcements as announcement}
          <div class="announcement">
            <p class="titlep">{announcement.title}</p>
            <p class="contentp">{@html renderMarkdown(announcement.content)}</p>
            <p class="administrator">By&nbsp;&nbsp;<a class="strong" href="mailto:{announcement.author?.email}" title="给{announcement.author?.graduation_year}届的 {announcement.author?.username || '未知用户'} 发邮件">{announcement.author?.username || '未知用户'}</a></p>
            <p class="date">{new Date(announcement.datetime).toLocaleString()}</p>
          </div>
        {/each}
      </div>
    {/if}
    

  </div>
</section>
