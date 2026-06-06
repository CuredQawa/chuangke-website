<script>
  import { toast } from '../../stores/ui.js';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
</script>

{#if $toast.show}
  <div
    class="notification is-{$toast.type} toast-container"
    role="alert"
    transition:fly={{ y: -50, duration: 350, easing: quintOut }}
  >
    {$toast.message}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    min-width: 320px;
    max-width: 640px;
    width: max-content;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    font-size: 1.05rem;
    text-align: center;
  }
</style>
