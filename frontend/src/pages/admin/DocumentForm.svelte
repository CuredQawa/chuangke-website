<script>
  import MarkdownEditor from '../../components/ui/MarkdownEditor.svelte';
  import { fetchDocument, createDocument, updateDocument, documentsLoading } from '../../stores/documents.js';
  
  export let params = {};
</script>

<MarkdownEditor 
  {params}
  type="document"
  loading={documentsLoading}
  fetchItem={fetchDocument}
  createItem={createDocument}
  updateItem={updateDocument}
  listPath="/admin/documents"
/>
