<script>
  import { onMount, onDestroy } from "svelte";
  import { fade, scale } from "svelte/transition";
  import {
    images,
    fetchImages,
    imagesLoading,
    deleteImage,
  } from "../../stores/images.js";
  import { showToast } from "../../stores/ui.js";
  import { isAuthenticated, isAdmin, user } from "../../stores/auth.js";
  import { requireAuth } from "../../lib/guards.js";
  import { api } from "../../lib/api.js";
  import { API_ENDPOINTS } from "../../lib/constants.js";
  import ConfirmModal from "../../components/ui/ConfirmModal.svelte";
  import PromptModal from "../../components/ui/PromptModal.svelte";

  let confirmModal;
  let promptModal;
  let error = null;
  let fileInput;
  let dropZone;
  let fileName = "";
  let description = "";
  let uploading = false;
  let uploadStatus = "";
  let uploadStatusType = "";

  // 编辑模态框
  let editModalOpen = false;
  let editImageId = "";
  let editImageName = "";
  let editImageDescription = "";

  onMount(() => {
    if (!requireAuth()) return;
    fetchImages().catch((e) => (error = e.message));
    document.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  function handleKeyDown(e) {
    if (e.key === "Escape" && editModalOpen) {
      closeEditModal();
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    dropZone?.classList.add("dragover");
  }

  function handleDragLeave() {
    dropZone?.classList.remove("dragover");
  }

  function handleDrop(e) {
    e.preventDefault();
    dropZone?.classList.remove("dragover");
    const files = e.dataTransfer?.files;
    if (files?.length > 0 && fileInput) {
      fileInput.files = files;
      fileName = files[0].name;
    }
  }

  function handleFileChange(e) {
    const files = e.target.files;
    if (files?.length > 0) {
      fileName = files[0].name;
    }
  }

  async function handleUpload() {
    const file = fileInput?.files?.[0];
    if (!file) {
      showToast("请选择图片文件", "danger");
      return;
    }
    if (!description.trim()) {
      showToast("请填写图片描述", "danger");
      return;
    }

    uploading = true;
    uploadStatus = "正在上传图片......";
    uploadStatusType = "uploading";

    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "info",
      JSON.stringify({ description: description.trim() }),
    );

    try {
      await api.upload(API_ENDPOINTS.IMAGE, formData);
      showToast("上传成功！", "success");
      fileInput.value = "";
      fileName = "";
      description = "";
      uploadStatus = "";
      fetchImages();
    } catch (e) {
      uploadStatus = "上传失败：" + e.message;
      uploadStatusType = "error";
      setTimeout(() => {
        uploadStatus = "";
      }, 3000);
    } finally {
      uploading = false;
    }
  }

  function openEditModal(image) {
    editImageId = image.id;
    editImageName = image.fileName;
    editImageDescription = image.description;
    editModalOpen = true;
  }

  function closeEditModal() {
    editModalOpen = false;
    editImageId = "";
    editImageName = "";
    editImageDescription = "";
  }

  async function saveImageDescription() {
    if (!editImageDescription.trim()) {
      showToast("描述不能为空", "danger");
      return;
    }

    try {
      await api.put(`${API_ENDPOINTS.IMAGE}/${editImageId}`, {
        description: editImageDescription.trim(),
      });
      showToast("更新成功", "success");
      closeEditModal();
      fetchImages();
    } catch (e) {
      showToast(e.message, "danger");
    }
  }

  async function handleDeleteImage(id, filename) {
    if (
      !(await confirmModal.show(
        `确定要删除图片 "${filename}" 吗？此操作不可恢复！`,
      ))
    )
      return;
    try {
      await deleteImage(id);
      showToast("删除成功", "success");
    } catch (e) {
      showToast(e.message, "danger");
    }
  }

  function copyMarkdownLink(fileName, description, buttonElement) {
    const markdownLink = `![${description}](/images/uploads/${fileName})`;
    const originalText = buttonElement.textContent;

    buttonElement.textContent = "已复制";
    buttonElement.classList.add("is-info");
    buttonElement.classList.remove("is-success");

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(markdownLink)
        .then(() => {
          setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.classList.remove("is-info");
            buttonElement.classList.add("is-success");
          }, 1000);
        })
        .catch(() => {
          fallbackCopy(markdownLink, buttonElement, originalText);
        });
    } else {
      fallbackCopy(markdownLink, buttonElement, originalText);
    }
  }

  function fallbackCopy(text, buttonElement, originalText) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        buttonElement.textContent = "已复制";
        buttonElement.classList.add("is-info");
        buttonElement.classList.remove("is-success");
        setTimeout(() => {
          buttonElement.textContent = originalText;
          buttonElement.classList.remove("is-info");
          buttonElement.classList.add("is-success");
        }, 1000);
      } else {
        buttonElement.textContent = originalText;
        buttonElement.classList.remove("is-info");
        buttonElement.classList.add("is-success");
        promptModal.show(text);
      }
    } catch {
      buttonElement.textContent = originalText;
      buttonElement.classList.remove("is-info");
      buttonElement.classList.add("is-success");
      promptModal.show(text);
    }

    document.body.removeChild(textArea);
  }

  $: canEdit = (image) =>
    $isAdmin ||
    (image.author_id && $user && Number(image.author_id) === Number($user.id));
</script>

<section class="admin-container">
  <h1 class="title">管理图片</h1>
  <p class="subtitle">上传、查看和管理社团图片资源</p>

  <!-- 上传区域 -->
  <div class="upload-section">
    <h2 class="title is-4">上传图片</h2>
    <form on:submit|preventDefault={handleUpload}>
      <!-- 拖拽上传区域 -->
      <div
        class="drop-zone"
        bind:this={dropZone}
        on:click={() => fileInput?.click()}
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
      >
        <p class="drop-zone-text">
          拖拽图片文件到此处或
          <span class="drop-zone-highlight">点击选择文件</span>
        </p>
        <p class="help">支持 JPG、PNG、GIF、WebP 格式，最大 5MB</p>
      </div>

      <!-- 隐藏的文件输入框 -->
      <input
        type="file"
        bind:this={fileInput}
        accept="image/*"
        style="display: none;"
        on:change={handleFileChange}
      />

      <!-- 已选择文件名显示 -->
      {#if fileName}
        <div class="file-name-display show">
          已选择文件: {fileName}
        </div>
      {/if}

      <!-- 描述输入 -->
      <div class="field">
        <label class="label">图片描述</label>
        <div class="control">
          <input
            class="input"
            type="text"
            bind:value={description}
            placeholder="例如：创客社2024年春季招新活动现场"
            required
          />
        </div>
      </div>

      <!-- 上传状态显示 -->
      {#if uploadStatus}
        <div class="upload-status show {uploadStatusType}">
          <p>{uploadStatus}</p>
        </div>
      {/if}

      <!-- 提交按钮 -->
      <div class="field">
        <div class="control">
          <button type="submit" class="button is-primary" disabled={uploading}>
            {uploading ? "上传中......" : "上传图片"}
          </button>
        </div>
      </div>
    </form>
  </div>

  <!-- 图片列表 -->
  <div class="image-list">
    <h2 class="title is-4">图片列表</h2>

    {#if $imagesLoading}
      <p class="has-text-grey">正在加载图片...</p>
    {:else if error}
      <p class="has-text-danger">加载失败，请刷新重试</p>
    {:else if $images.length === 0}
      <p class="has-text-grey">暂无图片</p>
    {:else}
      <div id="images-container">
        {#each $images as image (image.id)}
          <div class="image-item">
            <div class="image-header">
              <a
                class="image-name"
                href="/images/uploads/{encodeURIComponent(image.fileName)}"
                target="_blank"
              >
                {image.fileName}
              </a>
              <div class="field is-grouped">
                <button
                  class="button is-small is-success delete-btn"
                  on:click={(e) =>
                    copyMarkdownLink(
                      image.fileName,
                      image.description,
                      e.currentTarget,
                    )}
                >
                  复制 Markdown
                </button>
                {#if canEdit(image)}
                  <button
                    class="button is-small is-warning delete-btn"
                    on:click={() => openEditModal(image)}
                  >
                    编辑
                  </button>
                  <button
                    class="button is-small is-danger delete-btn"
                    on:click={() => handleDeleteImage(image.id, image.fileName)}
                  >
                    删除
                  </button>
                {/if}
              </div>
            </div>
            <p class="image-desc">{image.description}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<!-- 编辑图片描述模态框 -->
{#if editModalOpen}
  <div
    class="modal is-active"
    transition:fade={{ duration: 200 }}
    on:click|self={closeEditModal}
  >
    <div class="modal-background"></div>
    <div class="modal-card" transition:scale={{ duration: 200, start: 0.95 }}>
      <header class="modal-card-head">
        <p class="modal-card-title">编辑图片描述</p>
        <button class="delete" aria-label="close" on:click={closeEditModal}
        ></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">图片名称</label>
          <div class="control">
            <input class="input" type="text" value={editImageName} disabled />
          </div>
        </div>
        <div class="field">
          <label class="label">图片描述</label>
          <div class="control">
            <input
              class="input"
              type="text"
              bind:value={editImageDescription}
              required
            />
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" on:click={saveImageDescription}
          >保存</button
        >
        <button class="button" on:click={closeEditModal}>取消</button>
      </footer>
    </div>
  </div>
{/if}

<ConfirmModal bind:this={confirmModal} message="确定要删除吗？" />
<PromptModal bind:this={promptModal} title="Markdown 链接" />

<style>
  .image-list {
    margin-top: 2rem;
  }

  .delete-btn {
    align-self: flex-end;
    margin-top: 0.25rem;
  }
</style>
