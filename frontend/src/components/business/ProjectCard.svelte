<script>
  export let project;
  import { link } from 'svelte-spa-router';
  import { getImageUrl } from '../../lib/utils.js';
</script>

<div class="column is-4-desktop is-6-tablet is-12-mobile">
  <a href="/projects/{project.id}" use:link>
    <div class="card hover-lift">
      <div class="card-image">
        <figure class="image">
          <img 
            src={getImageUrl(project.cover_image_url)} 
            alt={project.title}
            loading="lazy"
            on:error={(e) => e.target.src = '/images/placeholder.webp'}
          >
        </figure>
      </div>
      <div class="card-content">
        <p class="title is-5">{project.title}</p>
        <p class="content">{project.author?.username || '未知作者'}</p>
      </div>
    </div>
  </a>
</div>

<style>
  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
</style>