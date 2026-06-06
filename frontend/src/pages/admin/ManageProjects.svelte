<script>
  import { onMount } from "svelte";
  import {
    projects,
    fetchProjects,
    projectsLoading,
    deleteProject,
  } from "../../stores/projects.js";
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
    fetchProjects().catch((e) => (error = e.message));
  });

  function canEdit(project) {
    if (!$user) return false;
    return (
      Number(project.author_id) === Number($user.id) || $user.role === "admin"
    );
  }

  async function handleDelete(id, title) {
    if (!(await confirmModal.show(`确定要删除项目《${title}》吗？`))) return;
    try {
      await deleteProject(id);
      showToast("删除成功", "success");
    } catch (e) {
      showToast(e.message || "删除失败", "danger");
    }
  }
</script>

<section class="admin-container">
  <h1 class="title">管理项目</h1>
  <p class="subtitle">创建、编辑、删除你的项目</p>
  <a href="/admin/projects/new" use:link class="button is-success mb-4"
    >新建项目</a
  >
  <div class="projects-list">
    {#if $projectsLoading}
      <LoadingSpinner />
    {:else if error}
      <ErrorMessage message={error} />
    {:else if $projects.length === 0}
      <p>暂无项目</p>
    {:else}
      {#each $projects as project (project.id)}
        <div class="project-item">
          <div class="project-info">
            <strong>{project.title}</strong>
            <br />
            <small
              >By&nbsp;&nbsp;<a
                class="strong"
                href="mailto:{project.author?.email}"
                title="给{project.author?.graduation_year}届的 {project.author
                  ?.username || '未知用户'} 发邮件"
                >{project.author?.username || "未知用户"}</a
              ></small
            >
          </div>
          <div class="project-actions">
            <a
              href="/admin/projects/{project.id}"
              use:link
              class="button is-small is-warning {!canEdit(project)
                ? 'is-static'
                : ''}"
              aria-disabled={!canEdit(project)}>编辑</a
            >
            <button
              class="button is-small is-danger {!canEdit(project)
                ? 'is-static'
                : ''}"
              disabled={!canEdit(project)}
              on:click={() => handleDelete(project.id, project.title)}
              >删除</button
            >
          </div>
        </div>
      {/each}
    {/if}
  </div>
</section>

<ConfirmModal bind:this={confirmModal} />
