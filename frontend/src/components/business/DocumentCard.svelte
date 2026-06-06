<script>
  export let document;
  import { link } from 'svelte-spa-router';
  import { formatDate } from '../../lib/utils.js';
</script>

<div class="column is-4-desktop is-6-tablet is-12-mobile">
  <a href="/documents/{document.id}" use:link>
    <div class="card hover-lift">
      <div class="card-content">
        <p class="title is-5">{document.title}</p>
        <p class="content">{formatDate(document.created_at)}</p>
      </div>
    </div>
  </a>
</div>
