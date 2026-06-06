<script>
  export let currentPage = 1;
  export let totalPages = 1;
  export let maxVisible = 5;
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  $: pages = generatePages(currentPage, totalPages, maxVisible);
  
  function generatePages(current, total, max) {
    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, current - Math.floor(max / 2));
    let end = Math.min(total, start + max - 1);
    
    if (end - start + 1 < max) {
      start = Math.max(1, end - max + 1);
    }
    
    const pages = [];
    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < total - 1) pages.push('...');
    if (end < total) pages.push(total);
    
    return pages;
  }
  
  function goToPage(page) {
    if (typeof page === 'number' && page !== currentPage) {
      dispatch('pageChange', page);
    }
  }
</script>

{#if totalPages > 1}
  <nav class="pagination is-centered" role="navigation" aria-label="pagination">
    <button 
      class="pagination-previous" 
      disabled={currentPage === 1}
      on:click={() => goToPage(currentPage - 1)}
    >
      上一页
    </button>
    <button 
      class="pagination-next" 
      disabled={currentPage === totalPages}
      on:click={() => goToPage(currentPage + 1)}
    >
      下一页
    </button>
    <ul class="pagination-list">
      {#each pages as page}
        <li>
          {#if page === '...'}
            <span class="pagination-ellipsis">&hellip;</span>
          {:else}
            <button 
              class="pagination-link {page === currentPage ? 'is-current' : ''}"
              aria-label="Go to page {page}"
              on:click={() => goToPage(page)}
            >
              {page}
            </button>
          {/if}
        </li>
      {/each}
    </ul>
  </nav>
{/if}
