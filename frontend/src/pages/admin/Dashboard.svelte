<script>
  import { link } from 'svelte-spa-router';
  import { isAuthenticated, isAdmin } from '../../stores/auth.js';
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { requireAdmin } from '../../lib/guards.js';
  
  onMount(() => {
    if (!requireAdmin()) return;
  });
</script>

<section class="section">
  <div class="container">
    <h1 class="title is-2 mb-6">管理后台</h1>
    
    <div class="columns is-multiline">
      <div class="column is-4">
        <a href="/admin/projects" use:link>
          <div class="box has-text-centered">
            <h3 class="title is-4">项目管理</h3>
            <p>管理社团项目</p>
          </div>
        </a>
      </div>
      
      <div class="column is-4">
        <a href="/admin/activities" use:link>
          <div class="box has-text-centered">
            <h3 class="title is-4">活动管理</h3>
            <p>管理社团活动</p>
          </div>
        </a>
      </div>
      
      <div class="column is-4">
        <a href="/admin/documents" use:link>
          <div class="box has-text-centered">
            <h3 class="title is-4">文档管理</h3>
            <p>管理社团文档</p>
          </div>
        </a>
      </div>
      
      <div class="column is-4">
        <a href="/admin/announcements" use:link>
          <div class="box has-text-centered">
            <h3 class="title is-4">公告管理</h3>
            <p>管理公告通知</p>
          </div>
        </a>
      </div>
      
      <div class="column is-4">
        <a href="/admin/images" use:link>
          <div class="box has-text-centered">
            <h3 class="title is-4">图片管理</h3>
            <p>管理图片资源</p>
          </div>
        </a>
      </div>
      
      <div class="column is-4">
        <a href="/admin/accounts" use:link>
          <div class="box has-text-centered">
            <h3 class="title is-4">账户管理</h3>
            <p>管理用户账户</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</section>