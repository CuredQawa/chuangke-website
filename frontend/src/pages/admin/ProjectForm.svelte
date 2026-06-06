<script>
  import MarkdownEditor from '../../components/ui/MarkdownEditor.svelte';
  import { fetchProject, createProject, updateProject, projectsLoading } from '../../stores/projects.js';
  
  export let params = {};
</script>

<MarkdownEditor 
  {params}
  type="project"
  loading={projectsLoading}
  fetchItem={fetchProject}
  createItem={createProject}
  updateItem={updateProject}
  listPath="/admin/projects"
/>
