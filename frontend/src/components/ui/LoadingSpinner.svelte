<script>
  export let loading = true;
  export let text = '加载中......';
  export let size = 'medium';
</script>

{#if loading}
  <div class="has-text-centered py-6">
    <button class="button is-{size} is-loading is-ghost is-static"></button>
    {#if text}
      <p class="mt-3 has-text-grey">{text}</p>
    {/if}
  </div>
{/if}
