<script>
  import { onMount } from 'svelte';
  import { activities, fetchActivities, activitiesLoading } from '../stores/activities.js';
  import { isAuthenticated, isAdmin } from '../stores/auth.js';
  import { link } from 'svelte-spa-router';
  
  let containerEl;
  let showLeft = false;
  let showRight = true;
  
  onMount(async () => {
    await fetchActivities();
    setTimeout(updateButtonVisibility, 100);
  });
  
  function updateButtonVisibility() {
    if (!containerEl) return;
    const maxScroll = containerEl.scrollWidth - containerEl.clientWidth;
    showLeft = containerEl.scrollLeft > 0;
    showRight = containerEl.scrollLeft < maxScroll - 10;
  }
  
  function scrollLeft() {
    if (!containerEl) return;
    const card = containerEl.querySelector('.activity-item');
    const cardWidth = card ? card.offsetWidth : 300;
    const scrollAmount = cardWidth + 20;
    containerEl.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    setTimeout(updateButtonVisibility, 600);
  }
  
  function scrollRight() {
    if (!containerEl) return;
    const card = containerEl.querySelector('.activity-item');
    const cardWidth = card ? card.offsetWidth : 300;
    const scrollAmount = cardWidth + 20;
    containerEl.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(updateButtonVisibility, 600);
  }
</script>

<!-- 管理活动按钮 -->
{#if $isAuthenticated}
  <a href="/admin/activities" use:link class="button is-success is-medium is-fixed-bottom-right is-purple">
    <span class="icon"><i class="iconfont icon-xitongguanli"></i></span>
  </a>
{/if}

<section class="section">
  <div class="activity-container-wrapper">
    <!-- 活动卡片容器 -->
    <div class="container-activity" bind:this={containerEl} on:scroll={updateButtonVisibility}>
      {#if $activitiesLoading}
        <p>加载中......</p>
      {:else if $activities.length === 0}
        <p class="has-text-grey has-text-centered">暂无活动</p>
      {:else}
        {#each $activities as activity}
          <a href="/activities/{activity.id}" use:link>
            <div class="activity-item">
              <img src={activity.cover_image_url || '/images/placeholder.webp'} alt={activity.title} loading="lazy">
              <p class="a-p">{activity.title}</p>
            </div>
          </a>
        {/each}
      {/if}
    </div>

    <!-- 左右滚动按钮 - 始终在DOM中，通过style控制显示 -->
    <button class="scroll-btn" id="scroll-left" on:click={scrollLeft} title="上一个活动" style="display: {showLeft ? 'flex' : 'none'}">
      <span class="icon"><i class="iconfont icon-jiantou"></i></span>
    </button>
    <button class="scroll-btn" id="scroll-right" on:click={scrollRight} title="下一个活动" style="display: {showRight ? 'flex' : 'none'}">
      <span class="icon"><i class="iconfont icon-jiantou3"></i></span>
    </button>
  </div>
</section>

<br><br><br><br>

<style>
  .activity-container-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .container-activity {
    padding: 5vh 5%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    gap: 2vw;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-snap-type: x mandatory;
  }

  .container-activity::-webkit-scrollbar {
    display: none;
  }

  :global(.activity-item) {
    flex-shrink: 0;
    border-radius: 2em;
    border: 4px solid rgb(166, 84, 241);
    height: 50vh;
    width: 20vw;
    margin: 0 1vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease;
    scroll-snap-align: start;
  }

  :global(.activity-item:hover) {
    transform: scale(1.05);
  }

  :global(.activity-item img) {
    width: 100%;
    height: 70%;
    object-fit: cover;
  }

  .a-p {
    color: rgb(166, 84, 241);
    font-size: x-large;
    font-weight: 700;
    margin: auto;
  }

  .scroll-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 50px;
    height: 50px;
    background-color: rgba(32, 32, 32, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  .scroll-btn:hover {
    background-color: #a654f1;
    transform: translateY(-50%) scale(1.1);
  }

  #scroll-left {
    left: 10px;
  }

  #scroll-right {
    right: 10px;
  }
</style>
