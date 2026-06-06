<script>
  export let params = {};

  import { onMount } from 'svelte';
  import { currentDocument, fetchDocument, documentsLoading, documentsError } from '../stores/documents.js';
  import LoadingSpinner from '../components/ui/LoadingSpinner.svelte';
  import ErrorMessage from '../components/ui/ErrorMessage.svelte';
  import { formatDateTime } from '../lib/utils.js';
  import { link } from 'svelte-spa-router';
  import { renderMarkdown } from '../lib/markdown.js';

  onMount(() => {
    if (params.id) {
      fetchDocument(params.id);
    }
  });
</script>

<section class="section">
  <div class="container">
    {#if $documentsLoading}
      <LoadingSpinner />
    {:else if $documentsError}
      <ErrorMessage message={$documentsError} />
    {:else if $currentDocument}
      <nav class="breadcrumb mb-5">
        <ul>
          <li><a href="/documents" use:link>文档列表</a></li>
          <li class="is-active"><a href="#">{$currentDocument.title}</a></li>
        </ul>
      </nav>

      <article class="article">
        <h1 class="title is-2">{$currentDocument.title}</h1>
        <p class="subtitle">{formatDateTime($currentDocument.datetime || $currentDocument.created_at)}</p>

        <div class="content">
          {@html renderMarkdown($currentDocument.content)}
        </div>
      </article>
    {/if}
  </div>
</section>
