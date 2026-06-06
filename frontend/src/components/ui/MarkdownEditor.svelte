<script>
  import { onMount, onDestroy } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { showToast } from '../../stores/ui.js';
  import { isAuthenticated, isAdmin } from '../../stores/auth.js';
  import { requireAuth } from '../../lib/guards.js';
  import LoadingSpinner from '../ui/LoadingSpinner.svelte';
  import ConfirmModal from '../ui/ConfirmModal.svelte';
  import { renderMarkdown } from '../../lib/markdown.js';
  import { sanitizeUrl } from '../../lib/sanitize.js';
  import { saveDraft, loadDraft, clearDraft, hasDraft, getDraftTimestamp, generateDraftKey, formatDraftTime } from '../../lib/draft.js';
  
  export let params = {};
  export let type = 'project';
  export let loading;
  export let fetchItem;
  export let createItem;
  export let updateItem;
  export let listPath;
  
  const labels = {
    project: { name: '项目', emoji: '🚀' },
    activity: { name: '活动', emoji: '🎯' },
    document: { name: '文档', emoji: '📄' }
  };
  
  $: label = labels[type] || labels.project;
  $: draftKey = generateDraftKey(type, params.id);
  
  let title = '';
  let content = '';
  let error = null;
  let isEditing = false;
  let previewHtml = '';
  let highlightedCode = '';
  let editorEl;
  let highlightEl;
  let previewEl;
  let scrollSyncTimeout;
  let autoSaveTimeout;
  let draftSaved = false;
  let showDraftHint = false;
  let draftTime = null;
  let confirmModal;
  let originalTitle = '';
  let originalContent = '';
  
  const EDITOR_STYLE = `
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    padding: 12px;
    margin: 0;
    border: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    tab-size: 2;
    letter-spacing: normal;
    word-spacing: normal;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  `;
  
  function refresh() {
    previewHtml = renderMarkdown(content);
    updateHighlight();
    setTimeout(() => {
      addDataLineAttributes();
      if (typeof window.initCodeHighlighting === 'function') window.initCodeHighlighting();
    }, 50);
  }
  
  onMount(async () => {
    if (!requireAuth()) return;
    
    // 检查是否有草稿
    if (hasDraft(draftKey)) {
      const draft = loadDraft(draftKey);
      draftTime = getDraftTimestamp(draftKey);
      if (draft && (draft.title || draft.content)) {
        showDraftHint = true;
      }
    }
    
    if (params.id && params.id !== 'new') {
      isEditing = true;
      try {
        const item = await fetchItem(params.id);
        title = item.title || '';
        content = item.content || '';
        originalTitle = title;
        originalContent = content;
        refresh();
      } catch (e) {
        error = e.message;
      }
    } else {
      content = `# 新${label.name}\n\n请输入内容......`;
      refresh();
    }
    
    // 监听页面卸载事件
    window.addEventListener('beforeunload', handleBeforeUnload);
  });
  
  onDestroy(() => {
    // 清除定时器
    clearTimeout(autoSaveTimeout);
    // 移除事件监听
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });
  
  // 页面卸载前保存草稿
  function handleBeforeUnload() {
    if (hasRealContent()) {
      saveDraft(draftKey, { title, content });
    }
  }
  
  // 取消编辑
  async function handleCancel() {
    if (hasRealContent()) {
      const shouldSave = await confirmModal.show('是否保存为草稿？');
      if (shouldSave) {
        saveDraft(draftKey, { title, content });
        showToast('草稿已保存', 'success');
      } else {
        clearDraft(draftKey);
      }
    }
    push(listPath);
  }
  
  // 恢复草稿
  function restoreDraft() {
    const draft = loadDraft(draftKey);
    if (draft) {
      title = draft.title || '';
      content = draft.content || '';
      refresh();
      showToast('已恢复草稿', 'success');
    }
    showDraftHint = false;
  }
  
  // 忽略草稿
  function ignoreDraft() {
    clearDraft(draftKey);
    showDraftHint = false;
  }
  
  // 检查是否有实际内容需要保存
  function hasRealContent() {
    if (isEditing) {
      // 编辑模式：检查内容是否有变化
      return title !== originalTitle || content !== originalContent;
    } else {
      // 新建模式：检查是否有内容（排除默认模板）
      const defaultContent = `# 新${label.name}\n\n请输入内容......`;
      return title.trim() || (content.trim() && content.trim() !== defaultContent.trim());
    }
  }
  
  // 自动保存草稿（节流）
  let lastSaveTime = 0;
  function scheduleAutoSave() {
    const now = Date.now();
    draftSaved = false;
    
    // 距离上次保存超过2秒，立即保存
    if (now - lastSaveTime >= 2000) {
      if (hasRealContent()) {
        saveDraft(draftKey, { title, content });
        lastSaveTime = now;
        draftSaved = true;
        setTimeout(() => { draftSaved = false; }, 2000);
      }
    } else {
      // 否则设置定时器，确保在停止输入后也会保存
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = setTimeout(() => {
        if (hasRealContent()) {
          saveDraft(draftKey, { title, content });
          lastSaveTime = Date.now();
          draftSaved = true;
          setTimeout(() => { draftSaved = false; }, 2000);
        }
      }, 1000);
    }
  }
  
  // 用 lexer 的行号给预览元素加 data-line
  function addDataLineAttributes() {
    if (!previewEl || !content) return;
    
    const tokens = marked.lexer(content);
    const lineMap = [];
    let offset = 0;
    for (const token of tokens) {
      if (token.type !== 'space') {
        const before = content.substring(0, offset);
        lineMap.push(before.split('\n').length - 1);
      }
      offset += token.raw.length;
    }
    
    const blockTags = ['H1','H2','H3','H4','H5','H6','P','PRE','UL','OL','BLOCKQUOTE','TABLE','HR'];
    const blocks = Array.from(previewEl.querySelectorAll('*')).filter(el => {
      return blockTags.includes(el.tagName) && el.parentElement === previewEl;
    });
    
    for (let i = 0; i < blocks.length && i < lineMap.length; i++) {
      blocks[i].setAttribute('data-line', lineMap[i]);
    }
  }
  
  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  
  function updateHighlight() {
    let html = escapeHtml(content);
    html = html.replace(/^(#{1,6}\s.+)$/gm, '<span class="md-h">$1</span>');
    html = html.replace(/(```[\s\S]*?```)/g, '<span class="md-cb">$1</span>');
    html = html.replace(/(`[^`\n]+`)/g, '<span class="md-ic">$1</span>');
    html = html.replace(/(\*\*.*?\*\*)/g, '<span class="md-b">$1</span>');
    html = html.replace(/(\*[^*]+\*)/g, '<span class="md-em">$1</span>');
    html = html.replace(/(!\[.*?\]\(.*?\))/g, '<span class="md-img">$1</span>');
    html = html.replace(/(\[.*?\]\(.*?\))/g, '<span class="md-a">$1</span>');
    html = html.replace(/^(&gt;.*)$/gm, '<span class="md-q">$1</span>');
    html = html.replace(/^(\s*[-*+]\s)/gm, '<span class="md-li">$1</span>');
    highlightedCode = html;
  }
  
  function handleInput() { 
    refresh();
    scheduleAutoSave();
  }
  
  function handleEditorScroll() {
    if (highlightEl && editorEl) {
      highlightEl.scrollTop = editorEl.scrollTop;
      highlightEl.scrollLeft = editorEl.scrollLeft;
    }
    clearTimeout(scrollSyncTimeout);
    scrollSyncTimeout = setTimeout(syncPreviewScroll, 16);
  }
  
  function syncPreviewScroll() {
    if (!editorEl || !previewEl) return;
    
    const lineHeight = parseFloat(getComputedStyle(editorEl).lineHeight) || 22.4;
    const currentLine = Math.floor(editorEl.scrollTop / lineHeight);
    
    // 找到所有带 data-line 的元素
    const elements = previewEl.querySelectorAll('[data-line]');
    if (elements.length === 0) return;
    
    // 找到当前行对应的元素和下一个元素
    let targetIdx = 0;
    for (let i = elements.length - 1; i >= 0; i--) {
      if (parseInt(elements[i].getAttribute('data-line')) <= currentLine) {
        targetIdx = i;
        break;
      }
    }
    
    const target = elements[targetIdx];
    const next = elements[targetIdx + 1]; // 可能是 undefined
    
    // 计算在当前块内的行偏移比例
    const blockStartLine = parseInt(target.getAttribute('data-line'));
    const blockEndLine = next ? parseInt(next.getAttribute('data-line')) : (content.split('\n').length);
    const blockLineCount = Math.max(blockEndLine - blockStartLine, 1);
    const lineInBlock = currentLine - blockStartLine;
    const blockRatio = Math.min(lineInBlock / blockLineCount, 1);
    
    // 计算目标滚动位置：元素顶部 + 块内偏移
    const targetTop = target.offsetTop - previewEl.offsetTop;
    const blockHeight = next ? (next.offsetTop - target.offsetTop) : target.offsetHeight;
    const scrollTarget = targetTop + blockRatio * blockHeight - 20;
    
    previewEl.scrollTop = Math.max(0, scrollTarget);
  }
  
  function handleKeydown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorEl.selectionStart;
      const end = editorEl.selectionEnd;
      content = content.substring(0, start) + '  ' + content.substring(end);
      setTimeout(() => {
        editorEl.selectionStart = editorEl.selectionEnd = start + 2;
        refresh();
      }, 0);
    }
  }
  
  function extractCoverImageUrl(text) {
    const m = text.match(/!\[.*?\]\((.*?)\)/);
    if (!m) return null;
    const safe = sanitizeUrl(m[1].trim());
    return safe || null;
  }
  
  async function handleSubmit() {
    if (!title.trim()) { showToast('请输入标题', 'danger'); return; }
    if (!content.trim()) { showToast('内容不能为空', 'danger'); return; }
    try {
      const cover_image_url = extractCoverImageUrl(content);
      const data = { title, content, cover_image_url };
      if (isEditing) { await updateItem(params.id, data); showToast(`${label.name}更新成功`, 'success'); }
      else { await createItem(data); showToast(`${label.name}创建成功`, 'success'); }
      // 成功提交后清除草稿
      clearDraft(draftKey);
      push(listPath);
    } catch (e) { showToast(e.message, 'danger'); }
  }
</script>

<section class="admin-container" style="padding: 0;">
  <div class="container">
    <h1 class="title">{isEditing ? `编辑${label.name}：${title}` : `新建${label.name}`}</h1>
    {#if type !== 'document'}
      <p style="margin-bottom: 2%;">Markdown 中第一张图片会作为{label.name}封面图片展示</p>
    {/if}
    
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
    
    {#if $loading}
      <LoadingSpinner />
    {:else if error}
      <div class="notification is-danger">{error}</div>
    {:else}
      <form on:submit|preventDefault={handleSubmit}>
        <div class="field">
          <label class="label">
            {label.name}标题
            {#if draftSaved}
              <span class="draft-saved-hint">草稿已自动保存</span>
            {/if}
          </label>
          <div class="control">
            <input class="input" type="text" bind:value={title} on:input={scheduleAutoSave} required />
          </div>
        </div>
        <div class="editor-container">
          <div class="editor-left">
            <label class="label">Markdown 原文</label>
            <div class="editor-wrapper">
              <pre class="highlight-layer" bind:this={highlightEl} style={EDITOR_STYLE}><code>{@html highlightedCode}</code></pre>
              <textarea class="content-input" bind:value={content} bind:this={editorEl}
                on:input={handleInput} on:scroll={handleEditorScroll} on:keydown={handleKeydown}
                placeholder="输入 Markdown 内容......" spellcheck="false" style={EDITOR_STYLE}></textarea>
            </div>
          </div>
          <div class="editor-right">
            <label class="label">预览</label>
            <div class="preview content" bind:this={previewEl} on:click|preventDefault>{@html previewHtml}</div>
          </div>
        </div>
        <div class="field mt-4">
          <button type="submit" class="button is-success" disabled={$loading}>提交</button>
          <button type="button" class="button is-light" on:click={handleCancel}>取消</button>
        </div>
      </form>
    {/if}
  </div>
</section>

<ConfirmModal 
  bind:this={confirmModal}
  confirmText="保存草稿"
  cancelText="不保存"
  type="info"
/>

<style>
  .editor-container { display: flex; gap: 2rem; height: calc(100vh - 120px); overflow: hidden; }
  .editor-left, .editor-right { flex: 1; min-width: 0; padding: 0; overflow: hidden; display: flex; flex-direction: column; }
  
  .editor-wrapper {
    flex: 1; position: relative; overflow: hidden;
    border: 1px solid var(--border-light); border-radius: 8px;
    background: var(--bg-card);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .editor-wrapper:focus-within {
    border: 2px solid var(--brand-primary);
    box-shadow: 0 0 0 0.25em var(--brand-bg);
  }
  
  .highlight-layer {
    position: absolute; top: 0; left: 0;
    overflow-y: auto; pointer-events: none;
    color: var(--text-primary); background: transparent;
    z-index: 0;
  }
  
  .highlight-layer code {
    font-family: inherit; font-size: inherit; line-height: inherit;
    background: none; padding: 0; white-space: inherit;
  }
  
  .content-input {
    position: absolute; top: 0; left: 0;
    resize: none; background: transparent;
    color: transparent; caret-color: var(--text-primary);
    overflow-y: auto; overflow-x: hidden;
    outline: none; z-index: 1;
  }
  
  .preview {
    flex: 1; overflow-y: auto; overflow-x: hidden; padding: 1rem;
    border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border-color);
  }
  
  .mt-4 { padding: 1rem; padding-bottom: 3rem; display: flex; justify-content: end; gap: 1rem; }
  
  :global(.md-h) { color: var(--brand-primary); font-weight: bold; }
  :global(.md-cb) { color: #e06c75; }
  :global(.md-ic) { color: #e06c75; background: var(--bg-code); border-radius: 3px; padding: 0 2px; }
  :global(.md-b) { color: var(--text-primary); font-weight: bold; }
  :global(.md-em) { color: var(--text-secondary); font-style: italic; }
  :global(.md-img) { color: #98c379; }
  :global(.md-a) { color: #61afef; }
  :global(.md-q) { color: #6a737d; font-style: italic; }
  :global(.md-li) { color: #e5c07b; }
  
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
