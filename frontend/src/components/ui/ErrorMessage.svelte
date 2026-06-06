<script>
  export let message = '';
  export let type = 'danger';
  export let dismissible = false;
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function handleDismiss() {
    dispatch('dismiss');
  }
</script>

{#if message}
  <div class="notification is-{type} {dismissible ? 'is-dismissible' : ''}">
    {#if dismissible}
      <button class="delete" on:click={handleDismiss}></button>
    {/if}
    {message}
  </div>
{/if}
