<script>
  export let activity;
  import { link } from 'svelte-spa-router';
  import { formatDate, getImageUrl } from '../../lib/utils.js';
</script>

<div class="column is-4-desktop is-6-tablet is-12-mobile">
  <a href="/activities/{activity.id}" use:link>
    <div class="card hover-lift">
      <div class="card-image">
        <figure class="image">
          <img 
            src={getImageUrl(activity.cover_image_url)} 
            alt={activity.title}
            loading="lazy"
            on:error={(e) => e.target.src = '/images/placeholder.webp'}
          >
        </figure>
      </div>
      <div class="card-content">
        <p class="title is-5">{activity.title}</p>
        <p class="content">{formatDate(activity.activity_date)}</p>
      </div>
    </div>
  </a>
</div>
