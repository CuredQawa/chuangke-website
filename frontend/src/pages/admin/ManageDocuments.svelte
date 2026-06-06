<script>
  import { onMount } from "svelte";
  import {
    documents,
    fetchDocuments,
    documentsLoading,
    deleteDocument,
  } from "../../stores/documents.js";
  import { showToast } from "../../stores/ui.js";
  import { user } from "../../stores/auth.js";
  import { requireAuth } from "../../lib/guards.js";
  import LoadingSpinner from "../../components/ui/LoadingSpinner.svelte";
  import ErrorMessage from "../../components/ui/ErrorMessage.svelte";
  import { link } from "svelte-spa-router";
  import ConfirmModal from "../../components/ui/ConfirmModal.svelte";

  let confirmModal;
  let error = null;

  onMount(() => {
    if (!requireAuth()) return;
    fetchDocuments().catch((e) => (error = e.message));
  });

  function canEdit(document) {
    if (!$user) return false;
    return (
      Number(document.author_id) === Number($user.id) || $user.role === "admin"
    );
  }

  async function handleDelete(id, title) {
    if (!(await confirmModal.show(`确定要删除文档《${title}》吗？`))) return;
    try {
      await deleteDocument(id);
      showToast("删除成功", "success");
    } catch (e) {
      showToast(e.message || "删除失败", "danger");
    }
  }
</script>

<section class="admin-container">
  <h1 class="title">管理文档</h1>
  <p class="subtitle">创建、编辑、删除你的文档</p>
  <a href="/admin/documents/new" use:link class="button is-success mb-4"
    >新建文档</a
  >
  <div class="docs-list">
    {#if $documentsLoading}
      <LoadingSpinner />
    {:else if error}
      <ErrorMessage message={error} />
    {:else if $documents.length === 0}
      <p>暂无文档</p>
    {:else}
      {#each $documents as document (document.id)}
        <div class="doc-item">
          <div class="doc-info">
            <strong>{document.title}</strong>
            <br />
            <small
              >By&nbsp;&nbsp;<a
                class="strong"
                href="mailto:{document.author?.email}"
                title="给{document.author?.graduation_year}届的 {document.author
                  ?.username || '未知用户'} 发邮件"
                >{document.author?.username || "未知用户"}</a
              ></small
            >
          </div>
          <div class="doc-actions">
            <a
              href="/admin/documents/{document.id}"
              use:link
              class="button is-small is-warning {!canEdit(document)
                ? 'is-static'
                : ''}"
              aria-disabled={!canEdit(document)}>编辑</a
            >
            <button
              class="button is-small is-danger {!canEdit(document)
                ? 'is-static'
                : ''}"
              disabled={!canEdit(document)}
              on:click={() => handleDelete(document.id, document.title)}
              >删除</button
            >
          </div>
        </div>
      {/each}
    {/if}
  </div>
</section>

<ConfirmModal bind:this={confirmModal} />
