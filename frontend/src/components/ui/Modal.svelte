<script>
  export let active = false;
  export let title = '';
  export let closable = true;
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function close() {
    if (closable) {
      active = false;
      dispatch('close');
    }
  }
  
  function handleKeydown(e) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if active}
  <div class="modal is-active">
    <div class="modal-background" on:click={close}></div>
    <div class="modal-card">
      {#if title}
        <header class="modal-card-head">
          <p class="modal-card-title">{title}</p>
          {#if closable}
            <button class="delete" on:click={close}></button>
          {/if}
        </header>
      {/if}
      <section class="modal-card-body">
        <slot />
      </section>
      <footer class="modal-card-foot">
        <slot name="footer">
          {#if closable}
            <button class="button" on:click={close}>取消</button>
          {/if}
        </slot>
      </footer>
    </div>
  </div>
{/if}
