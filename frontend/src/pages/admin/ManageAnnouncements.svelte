<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { announcements, fetchAnnouncements, announcementsLoading, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../stores/announcements.js';
  import { showToast } from '../../stores/ui.js';
  import { requireAdmin } from '../../lib/guards.js';
  import LoadingSpinner from '../../components/ui/LoadingSpinner.svelte';
  import ErrorMessage from '../../components/ui/ErrorMessage.svelte';
  import { renderMarkdown } from '../../lib/markdown.js';
  import ConfirmModal from '../../components/ui/ConfirmModal.svelte';
  import { saveDraft, loadDraft, clearDraft, hasDraft, getDraftTimestamp, formatDraftTime } from '../../lib/draft.js';

  const DRAFT_KEY = 'announcement_new';

  let confirmModal;
  let error = null;
  let newTitle = '';
  let newContent = '';

  // 编辑模态框
  let editModalOpen = false;
  let editId = '';
  let editTitle = '';
  let editContent = '';
  
  // 草稿相关
  let autoSaveTimeout;
  let draftSaved = false;
  let showDraftHint = false;
  let draftTime = null;

  onMount(() => {
    if (!requireAdmin()) return;
    
    // 检查是否有草稿
    if (hasDraft(DRAFT_KEY)) {
      const draft = loadDraft(DRAFT_KEY);
      draftTime = getDraftTimestamp(DRAFT_KEY);
      if (draft && (draft.title || draft.content)) {
        showDraftHint = true;
      }
    }
    
    fetchAnnouncements().catch(e => error = e.message);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  onDestroy(() => {
    clearTimeout(autoSaveTimeout);
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  function handleKeydown(e) {
    if (e.key === 'Escape' && editModalOpen) closeEditModal();
  }
  
  // 页面卸载前保存草稿
  function handleBeforeUnload() {
    if (newTitle.trim() || newContent.trim()) {
      saveDraft(DRAFT_KEY, { title: newTitle, content: newContent });
    }
  }
  
  // 恢复草稿
  function restoreDraft() {
    const draft = loadDraft(DRAFT_KEY);
    if (draft) {
      newTitle = draft.title || '';
      newContent = draft.content || '';
      showToast('已恢复草稿', 'success');
    }
    showDraftHint = false;
  }
  
  // 忽略草稿
  function ignoreDraft() {
    clearDraft(DRAFT_KEY);
    showDraftHint = false;
  }
  
  // 自动保存草稿（节流）
  let lastSaveTime = 0;
  function scheduleAutoSave() {
    const now = Date.now();
    draftSaved = false;
    
    // 距离上次保存超过2秒，立即保存
    if (now - lastSaveTime >= 2000) {
      if (newTitle.trim() || newContent.trim()) {
        saveDraft(DRAFT_KEY, { title: newTitle, content: newContent });
        lastSaveTime = now;
        draftSaved = true;
        setTimeout(() => { draftSaved = false; }, 2000);
      }
    } else {
      // 否则设置定时器，确保在停止输入后也会保存
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        if (newTitle.trim() || newContent.trim()) {
          saveDraft(DRAFT_KEY, { title: newTitle, content: newContent });
          lastSaveTime = Date.now();
          draftSaved = true;
          setTimeout(() => { draftSaved = false; }, 2000);
        }
      }, 1000);
    }
  }
  
  async function handleCreate() {
    if (!newTitle.trim() || !newContent.trim()) {
      showToast('请填写标题和内容', 'danger');
      return;
    }
    try {
      await createAnnouncement({ title: newTitle, content: newContent });
      showToast('发布公告成功', 'success');
      clearDraft(DRAFT_KEY);
      newTitle = '';
      newContent = '';
    } catch (e) {
      showToast(e.message || '发布失败', 'danger');
    }
  }
  
  function openEditModal(item) {
    editId = item.id;
    editTitle = item.title || '';
    editContent = item.content || '';
    editModalOpen = true;
  }
  
  function closeEditModal() {
    editModalOpen = false;
    editId = '';
    editTitle = '';
    editContent = '';
  }
  
  async function handleEditSave() {
    if (!editTitle.trim() || !editContent.trim()) {
      showToast('标题和内容不能为空', 'danger');
      return;
    }
    try {
      await updateAnnouncement(editId, { title: editTitle, content: editContent });
      showToast('更新成功', 'success');
      closeEditModal();
    } catch (e) {
      showToast(e.message || '更新失败', 'danger');
    }
  }
  
  async function handleDelete(id) {
    if (!(await confirmModal.show('确定要删除这条公告吗？'))) return;
    try {
      await deleteAnnouncement(id);
      showToast('删除成功', 'success');
    } catch (e) {
      showToast(e.message || '删除失败', 'danger');
    }
  }
</script>

<section class="admin-container">
  <h1 class="title">管理公告</h1>
  <p class="subtitle">发布、编辑、删除公告</p>

  <!-- 发布新公告表单 -->
  <div class="announcement-card-A">
    <h2 class="title is-4">发布新公告</h2>
    
    {#if showDraftHint}
      <div class="notification is-info is-light draft-hint">
        <p><strong>发现未保存的草稿</strong></p>
        <p>上次保存时间：{formatDraftTime(draftTime)}</p>
        <div class="buttons mt-2">
          <button class="button is-info is-small" on:click={restoreDraft}>恢复草稿</button>
          <button class="button is-light is-small" on:click={ignoreDraft}>忽略草稿</button>
        </div>
      </div>
    {/if}
    
    <form on:submit|preventDefault={handleCreate}>
      <div class="form-group">
        <label class="label">
          标题
          {#if draftSaved}
            <span class="draft-saved-hint">草稿已自动保存</span>
          {/if}
        </label>
        <input class="input" type="text" bind:value={newTitle} on:input={scheduleAutoSave} required>
      </div>
      <div class="form-group">
        <label class="label">内容</label>
        <textarea class="textarea" bind:value={newContent} on:input={scheduleAutoSave} required placeholder="输入 Markdown 内容......"></textarea>
      </div>
      <button type="submit" class="button is-success">发布</button>
    </form>
  </div>

  <!-- 公告列表 -->
  <h2 class="title is-4">现有公告</h2>
  <div class="announcements-list">
    {#if $announcementsLoading}
      <LoadingSpinner />
    {:else if error}
      <ErrorMessage message={error} />
    {:else}
      {#each $announcements as item (item.id)}
        <div class="announcement-card">
          <div class="announcement-header">
            <div class="announcement-info">
              <p><strong>{item.title}</strong></p>
              <p class="contentp">{@html renderMarkdown(item.content)}</p>
              <p class="administrator">By&nbsp;&nbsp;<a class="strong" href="mailto:{item.author?.email}" title="给{item.author?.graduation_year}届的 {item.author?.username || '未知用户'} 发邮件">{item.author?.username || '未知用户'}</a></p>
              <p class="date">{new Date(item.datetime).toLocaleString()}</p>
            </div>
            <div class="announcement-actions">
              <button class="button is-small is-warning" on:click={() => openEditModal(item)}>编辑</button>
              <button class="button is-small is-danger" on:click={() => handleDelete(item.id)}>删除</button>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</section>

<!-- 编辑公告模态框 -->
{#if editModalOpen}
  <div class="modal is-active" transition:fade={{ duration: 200 }} on:click|self={closeEditModal}>
    <div class="modal-background"></div>
    <div class="modal-card" transition:scale={{ duration: 200, start: 0.95 }}>
      <header class="modal-card-head">
        <p class="modal-card-title">编辑公告</p>
        <button class="delete" aria-label="close" on:click={closeEditModal}></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">标题</label>
          <div class="control">
            <input class="input" type="text" bind:value={editTitle} required />
          </div>
        </div>
        <div class="field">
          <label class="label">内容</label>
          <div class="control">
            <textarea class="textarea" bind:value={editContent} required placeholder="输入 Markdown 内容......"></textarea>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" on:click={handleEditSave}>保存</button>
        <button class="button" on:click={closeEditModal}>取消</button>
      </footer>
    </div>
  </div>
{/if}

<ConfirmModal bind:this={confirmModal} />

<style>
  .draft-hint {
    margin-bottom: 1rem;
    border-left: 4px solid #3273dc;
  }
  
  .draft-saved-hint {
    font-size: 0.75rem;
    font-weight: normal;
    color: #48c774;
    margin-left: 0.5rem;
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
