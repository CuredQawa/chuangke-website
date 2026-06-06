<script>
  import Modal from './Modal.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let message = '';
  export let type = 'danger';
  export let confirmText = '删除';
  export let cancelText = '取消';

  let active = false;
  let _resolve;

  export function show(msg) {
    message = msg;
    active = true;
    return new Promise(resolve => { _resolve = resolve; });
  }

  function onConfirm() {
    active = false;
    _resolve?.(true);
  }

  function onCancel() {
    active = false;
    _resolve?.(false);
  }
</script>

<Modal {active} closable={true} on:close={onCancel}>
  <p style="font-size: 1.1rem; line-height: 1.6;">{message}</p>
  <div slot="footer" style="display: flex; gap: 0.5rem; justify-content: flex-end; width: 100%;">
    <button class="button" on:click={onCancel}>{cancelText}</button>
    <button class="button is-{type}" on:click={onConfirm}>{confirmText}</button>
  </div>
</Modal>
