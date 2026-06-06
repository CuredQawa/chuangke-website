<script>
  import { onMount } from "svelte";
  import { fade, scale } from "svelte/transition";
  import {
    accounts,
    fetchAccounts,
    accountsLoading,
    deleteAccount,
  } from "../../stores/accounts.js";
  import { showToast } from "../../stores/ui.js";
  import { user, isAuthenticated, isAdmin } from "../../stores/auth.js";
  import { api } from "../../lib/api.js";
  import { link, push } from "svelte-spa-router";
  import { MESSAGES, API_ENDPOINTS } from "../../lib/constants.js";
  import { escapeHtml } from "../../lib/sanitize.js";
  import { requireAdmin, requireAuthOrAdmin } from "../../lib/guards.js";
  import ConfirmModal from "../../components/ui/ConfirmModal.svelte";

  let confirmModal;
  let error = null;

  // 编辑模态框
  let editModalOpen = false;
  let editAccountId = "";
  let editUsername = "";
  let editEmail = "";
  let editGraduationYear = "";
  let editRole = "user";
  let editPassword = "";
  let editConfirmPassword = "";
  let editUpdatePassword = false;

  // 注册模态框
  let registerModalOpen = false;
  let regUsername = "";
  let regEmail = "";
  let regPassword = "";
  let regConfirmPassword = "";
  let regGraduationYear = "";
  let regRole = "user";

  onMount(() => {
    if (!requireAuthOrAdmin()) return;
    if ($isAdmin) {
      fetchAccounts().catch((e) => (error = e.message));
    } else {
      // 普通用户初始化编辑表单
      initUserEditForm();
    }
  });

  // 初始化普通用户的编辑表单
  function initUserEditForm() {
    if ($user) {
      editAccountId = $user.id;
      editUsername = $user.username;
      editEmail = $user.email;
      editGraduationYear = $user.graduation_year;
      editRole = $user.role;
      editPassword = "";
      editConfirmPassword = "";
      editUpdatePassword = false;
    }
  }

  // 处理普通用户直接编辑
  async function handleDirectEdit() {
    if (editUpdatePassword && editPassword !== editConfirmPassword) {
      showToast("两次输入的密码不一致", "danger");
      return;
    }

    try {
      const data = {
        username: editUsername,
        email: editEmail,
        graduation_year: parseInt(editGraduationYear),
        role: editRole,
      };
      if (editUpdatePassword && editPassword) {
        data.password = editPassword;
      }
      await api.put(`${API_ENDPOINTS.ACCOUNT}/${editAccountId}`, data);
      showToast("更新成功", "success");
      // 更新本地用户信息
      user.update(u => ({ ...u, ...data }));
    } catch (e) {
      showToast(e.message || "更新失败", "danger");
    }
  }

  // 取消编辑，恢复原始值
  function handleCancelEdit() {
    initUserEditForm();
  }

  // 编辑账户
  function openEditModal(account) {
    editAccountId = account.id;
    editUsername = account.username;
    editEmail = account.email;
    editGraduationYear = account.graduation_year;
    editRole = account.role;
    editPassword = "";
    editConfirmPassword = "";
    editUpdatePassword = false;
    editModalOpen = true;
  }

  function closeEditModal() {
    editModalOpen = false;
  }

  async function handleEditSave() {
    if (editUpdatePassword && editPassword !== editConfirmPassword) {
      showToast("两次输入的密码不一致", "danger");
      return;
    }

    try {
      const data = {
        username: editUsername,
        email: editEmail,
        graduation_year: parseInt(editGraduationYear),
        role: editRole,
      };
      if (editUpdatePassword && editPassword) {
        data.password = editPassword;
      }
      await api.put(`${API_ENDPOINTS.ACCOUNT}/${editAccountId}`, data);
      showToast("更新成功", "success");
      closeEditModal();
      fetchAccounts();
    } catch (e) {
      showToast(e.message || "更新失败", "danger");
    }
  }

  // 注册新用户
  function openRegisterModal() {
    regUsername = "";
    regEmail = "";
    regPassword = "";
    regConfirmPassword = "";
    regGraduationYear = "";
    regRole = "user";
    registerModalOpen = true;
  }

  function closeRegisterModal() {
    registerModalOpen = false;
  }

  async function handleRegister() {
    if (regPassword !== regConfirmPassword) {
      showToast("两次输入的密码不一致", "danger");
      return;
    }

    try {
      await api.post(API_ENDPOINTS.REGISTER, {
        username: regUsername,
        email: regEmail,
        password: regPassword,
        graduation_year: parseInt(regGraduationYear),
        role: regRole,
      });
      showToast("注册成功", "success");
      closeRegisterModal();
      fetchAccounts();
    } catch (e) {
      showToast(e.message || "注册失败", "danger");
    }
  }

  // 删除账户
  async function handleDelete(id, username) {
    if (!(await confirmModal.show(`确定要删除用户 ${username} 吗？`))) return;
    try {
      await deleteAccount(id);
      showToast("删除成功", "success");
    } catch (e) {
      showToast(e.message || "删除失败", "danger");
    }
  }

  // ESC键关闭模态框
  function handleKeydown(e) {
    if (e.key === "Escape") {
      if (editModalOpen) closeEditModal();
      if (registerModalOpen) closeRegisterModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="admin-container">
  <h1 class="title">{$isAdmin ? "管理账户" : "我的账户"}</h1>
  <p class="subtitle">
    {$isAdmin ? "注册、编辑、删除用户" : "编辑您的账户信息"}
  </p>

  {#if $isAdmin}
    <!-- 注册新用户按钮 -->
    <div class="columns is-vcentered mb-3">
      <div class="column is-narrow">
        <button class="button is-success" on:click={openRegisterModal}
          >注册新用户</button
        >
      </div>
    </div>

    <!-- 用户列表 -->
    <h2 class="title is-4 mb-4">用户列表</h2>

    {#if $accountsLoading}
      <p></p>
    {:else if error}
      <div class="notification is-danger">{error}</div>
    {:else}
      <div id="accounts-list">
        {#each $accounts as account (account.id)}
          <div class="account-card">
            <div class="account-header">
              <div class="account-info">
                <p><strong>用户名：</strong>{account.username}</p>
                <p><strong>邮箱：</strong>{account.email}</p>
                <p><strong>毕业年份：</strong>{account.graduation_year}</p>
                <p>
                  <strong>角色：</strong><span class="role-tag {account.role}"
                    >{account.role === "admin" ? "管理员" : "社员"}</span
                  >
                </p>
              </div>
              <div class="account-actions">
                <button
                  class="button is-small is-warning"
                  on:click={() => openEditModal(account)}>编辑</button
                >
                <button
                  class="button is-small is-danger"
                  on:click={() => handleDelete(account.id, account.username)}
                  >删除</button
                >
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {:else}
    <!-- 普通用户编辑自己的账户 -->
    {#if $accountsLoading}
      <p></p>
    {:else if $user}
      <form on:submit|preventDefault={handleDirectEdit}>
        <div class="columns">
          <div class="column">
            <div class="field">
              <label class="label">用户名</label>
              <div class="control">
                <input
                  class="input"
                  type="text"
                  bind:value={editUsername}
                  required
                />
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">毕业年份</label>
              <div class="control">
                <input
                  class="input"
                  type="number"
                  bind:value={editGraduationYear}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">邮箱</label>
          <div class="control">
            <input class="input" type="email" bind:value={editEmail} required />
          </div>
        </div>
        <div class="field">
          <div class="control">
            <label class="checkbox">
              <input type="checkbox" bind:checked={editUpdatePassword} />
              修改密码
            </label>
          </div>
        </div>
        {#if editUpdatePassword}
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">新密码</label>
                <div class="control">
                  <input
                    class="input"
                    type="password"
                    bind:value={editPassword}
                    placeholder="请输入新密码"
                  />
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">确认新密码</label>
                <div class="control">
                  <input
                    class="input"
                    type="password"
                    bind:value={editConfirmPassword}
                    placeholder="请再次输入新密码"
                  />
                </div>
                {#if editConfirmPassword && editPassword !== editConfirmPassword}
                  <p class="help is-danger">两次输入的密码不一致</p>
                {/if}
              </div>
            </div>
          </div>
        {/if}
        <div class="buttons">
          <button type="submit" class="button is-success">保存修改</button>
          <button type="button" class="button" on:click={handleCancelEdit}>取消</button>
        </div>
      </form>
    {/if}
  {/if}
</section>

<!-- 编辑账户模态框 -->
{#if editModalOpen}
  <div
    class="modal is-active"
    transition:fade={{ duration: 200 }}
    on:click|self={closeEditModal}
  >
    <div class="modal-background"></div>
    <div class="modal-card" transition:scale={{ duration: 200, start: 0.95 }}>
      <header class="modal-card-head">
        <p class="modal-card-title">编辑账户</p>
        <button class="delete" aria-label="close" on:click={closeEditModal}
        ></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">用户名</label>
          <div class="control">
            <input
              class="input"
              type="text"
              bind:value={editUsername}
              required
            />
          </div>
        </div>
        <div class="field">
          <label class="label">邮箱</label>
          <div class="control">
            <input class="input" type="email" bind:value={editEmail} required />
          </div>
        </div>
        <div class="field">
          <label class="label">毕业年份</label>
          <div class="control">
            <input
              class="input"
              type="number"
              bind:value={editGraduationYear}
              required
            />
          </div>
        </div>
        <div class="field">
          <div class="control">
            <label class="checkbox">
              <input type="checkbox" bind:checked={editUpdatePassword} />
              修改密码
            </label>
          </div>
        </div>
        {#if editUpdatePassword}
          <div class="field">
            <label class="label">新密码</label>
            <div class="control">
              <input
                class="input"
                type="password"
                bind:value={editPassword}
                placeholder="请输入新密码"
              />
            </div>
          </div>
          <div class="field">
            <label class="label">确认新密码</label>
            <div class="control">
              <input
                class="input"
                type="password"
                bind:value={editConfirmPassword}
                placeholder="请再次输入新密码"
              />
            </div>
            {#if editConfirmPassword && editPassword !== editConfirmPassword}
              <p class="help is-danger">两次输入的密码不一致</p>
            {/if}
          </div>
        {/if}
        {#if $isAdmin}
          <div class="field">
            <label class="label">角色</label>
            <div class="control">
              <label class="radio">
                <input type="radio" bind:group={editRole} value="user" /> 社员
              </label>
              <label class="radio" style="margin-left: 1rem;">
                <input type="radio" bind:group={editRole} value="admin" /> 管理员
              </label>
            </div>
          </div>
        {/if}
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" on:click={handleEditSave}>保存</button
        >
        <button class="button" on:click={closeEditModal}>取消</button>
      </footer>
    </div>
  </div>
{/if}

<!-- 注册新用户模态框 -->
{#if registerModalOpen}
  <div
    class="modal is-active"
    transition:fade={{ duration: 200 }}
    on:click|self={closeRegisterModal}
  >
    <div class="modal-background"></div>
    <div class="modal-card" transition:scale={{ duration: 200, start: 0.95 }}>
      <header class="modal-card-head">
        <p class="modal-card-title">注册新用户</p>
        <button class="delete" aria-label="close" on:click={closeRegisterModal}
        ></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">用户名</label>
          <div class="control">
            <input
              class="input"
              type="text"
              bind:value={regUsername}
              required
            />
          </div>
        </div>
        <div class="field">
          <label class="label">邮箱</label>
          <div class="control">
            <input class="input" type="email" bind:value={regEmail} required />
          </div>
        </div>
        <div class="field">
          <label class="label">密码</label>
          <div class="control">
            <input
              class="input"
              type="password"
              bind:value={regPassword}
              required
            />
          </div>
        </div>
        <div class="field">
          <label class="label">确认密码</label>
          <div class="control">
            <input
              class="input"
              type="password"
              bind:value={regConfirmPassword}
              required
            />
          </div>
          {#if regConfirmPassword && regPassword !== regConfirmPassword}
            <p class="help is-danger">两次输入的密码不一致</p>
          {/if}
        </div>
        <div class="field">
          <label class="label">毕业年份</label>
          <div class="control">
            <input
              class="input"
              type="number"
              bind:value={regGraduationYear}
              required
            />
          </div>
        </div>
        <div class="field">
          <label class="label">角色</label>
          <div class="control">
            <label class="radio">
              <input type="radio" bind:group={regRole} value="user" checked /> 社员
            </label>
            <label class="radio" style="margin-left: 1rem;">
              <input type="radio" bind:group={regRole} value="admin" /> 管理员
            </label>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button" on:click={closeRegisterModal}>取消</button>
      </footer>
    </div>
  </div>
{/if}

<ConfirmModal bind:this={confirmModal} />
