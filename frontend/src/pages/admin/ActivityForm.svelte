<script>
  import MarkdownEditor from '../../components/ui/MarkdownEditor.svelte';
  import { fetchActivity, createActivity, updateActivity, activitiesLoading } from '../../stores/activities.js';
  
  export let params = {};
</script>

<MarkdownEditor 
  {params}
  type="activity"
  loading={activitiesLoading}
  fetchItem={fetchActivity}
  createItem={createActivity}
  updateItem={updateActivity}
  listPath="/admin/activities"
/>
