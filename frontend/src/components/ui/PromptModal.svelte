<script>
  import Modal from "./Modal.svelte";

  export let title = "";
  export let text = "";

  let active = false;
  let copied = false;

  export function show(t) {
    text = t;
    active = true;
    copied = false;
  }

  function close() {
    active = false;
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 1500);
    } catch {
      // 最终降级：选中文本让用户手动复制
    }
  }
</script>

<Modal {active} closable={true} on:close={close}>
  <div class="field">
    <label class="label">{title}</label>
    <div class="control">
      <textarea
        class="textarea"
        readonly
        rows="3"
        style="font-family: monospace; font-size: 0.9rem;"
        on:click={(e) => e.target.select()}>{text}</textarea
      >
    </div>
  </div>
  <div
    slot="footer"
    style="display: flex; gap: 0.5rem; justify-content: flex-end; width: 100%;"
  >
    <button class="button" on:click={close}>关闭</button>
    <button class="button is-success" on:click={copyText}>
      {copied ? "已复制" : "复制"}
    </button>
  </div>
</Modal>
