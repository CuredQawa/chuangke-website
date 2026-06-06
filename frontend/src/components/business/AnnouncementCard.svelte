<script>
  export let announcement;
  import { formatDate } from '../../lib/utils.js';
</script>

<div class="box">
  <article class="media">
    <div class="media-content">
      <div class="content">
        <p>
          <strong>{announcement.title}</strong>
          <br>
          <small>{formatDate(announcement.created_at)}</small>
          <br>
          {announcement.content}
        </p>
      </div>
    </div>
  </article>
</div>
