<script>
  import { onMount } from 'svelte';
  import { activities, fetchActivities, activitiesLoading, deleteActivity } from '../../stores/activities.js';
  import { showToast } from '../../stores/ui.js';
  import { user } from '../../stores/auth.js';
  import { requireAuth } from '../../lib/guards.js';
  import LoadingSpinner from '../../components/ui/LoadingSpinner.svelte';
  import ErrorMessage from '../../components/ui/ErrorMessage.svelte';
  import { link } from 'svelte-spa-router';
  import ConfirmModal from '../../components/ui/ConfirmModal.svelte';

  let confirmModal;
  let error = null;
  
  onMount(() => {
    if (!requireAuth()) return;
    fetchActivities().catch(e => error = e.message);
  });
  
  function canEdit(activity) {
    if (!$user) return false;
    return Number(activity.author_id) === Number($user.id) || $user.role === 'admin';
  }
  
  async function handleDelete(id, title) {
    if (!(await confirmModal.show(`确定要删除活动《${title}》吗？`))) return;
    try {
      await deleteActivity(id);
      showToast('删除成功', 'success');
    } catch (e) {
      showToast(e.message || '删除失败', 'danger');
    }
  }
</script>

<section class="admin-container">
  <h1 class="title">管理活动</h1>
  <p class="subtitle">创建、编辑、删除社团活动</p>
  <a href="/admin/activities/new" use:link class="button is-success mb-4">新建活动</a>
  <div class="activities-list">
    {#if $activitiesLoading}
      <LoadingSpinner />
    {:else if error}
      <ErrorMessage message={error} />
    {:else if $activities.length === 0}
      <p>暂无活动</p>
    {:else}
      {#each $activities as activity (activity.id)}
        <div class="project-item">
          <div class="project-info">
            <strong>{activity.title}</strong>
            <br/>
            <small>By&nbsp;&nbsp;<a class="strong" href="mailto:{activity.author?.email}" title="给{activity.author?.graduation_year}届的 {activity.author?.username || '未知用户'} 发邮件">{activity.author?.username || '未知用户'}</a></small>
          </div>
          <div class="project-actions">
            <a href="/admin/activities/{activity.id}" use:link class="button is-small is-warning {!canEdit(activity) ? 'is-static' : ''}" aria-disabled={!canEdit(activity)}>编辑</a>
            <button class="button is-small is-danger {!canEdit(activity) ? 'is-static' : ''}" 
                    disabled={!canEdit(activity)} 
                    on:click={() => handleDelete(activity.id, activity.title)}>删除</button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</section>

<ConfirmModal bind:this={confirmModal} />
