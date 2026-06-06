<script>
  import { link } from 'svelte-spa-router';
</script>

<section class="section">
  <div class="container has-text-centered">
    <h1 class="title btitle">社员校内接单</h1>
    <p class="subtitle">
      部分卖品<span class="strong">红五月</span>期间有售
    </p>
  </div>

  <br />

  <div class="servescontent">
    <!-- 激光切割栏目 -->
    <div class="serveproject has-text-centered">
      <h1 class="title">
        <span class="strong">
          &lt;&lt; </span><em>激光切割件</em>
          <span class="strong"> &gt;&gt; </span>
      </h1>
      <p class="para serve-introduce">
        用激光切割机切出的小物件，定制需<a href="/contact" use:link class="strong sa">联系社员</a>洽谈。
      </p>
      <br />
      <div class="image-container">
        <img src="/images/serve-examples/example-vva.webp" alt="示例图片" class="image-showed" loading="lazy" />
        <img src="/images/serve-examples/125445.webp" alt="示例图片" class="image-showed" loading="lazy" />
        <img src="/images/serve-examples/342.webp" alt="示例图片" class="image-showed" loading="lazy" />
        <img src="/images/serve-examples/409.webp" alt="示例图片" class="image-showed" loading="lazy" />
        <img src="/images/serve-examples/596.webp" alt="示例图片" class="image-showed" loading="lazy" />
        <img src="/images/serve-examples/410.webp" alt="示例图片" class="image-showed" loading="lazy" />
      </div>
    </div>
    <!-- 3D打印栏目 -->
    <div class="serveproject has-text-centered">
      <h1 class="title">
        <span class="strong">
          &lt;&lt; </span><em>3D打印件</em>
          <span class="strong"> &gt;&gt; </span>
      </h1>
      <p class="para serve-introduce">
        用3D打印机来打印模型，定制需<a href="/contact" use:link class="strong sa">联系社员</a>洽谈。
      </p>
      <br />
      <div class="image-container">
        <img src="/images/serve-examples/example-d20.webp" alt="示例图片" class="image-showed" loading="lazy" />
        <img src="/images/serve-examples/ship.webp" alt="示例图片" class="image-showed" loading="lazy" />
        <img src="/images/serve-examples/独木舟.webp" alt="示例图片" class="image-showed" loading="lazy" />
        <img src="/images/serve-examples/dogg.webp" alt="示例图片" class="image-showed" loading="lazy" />
      </div>
    </div>
    <!-- 校园文创栏目 -->
    <div class="serveproject has-text-centered">
      <h1 class="title">
        <span class="strong">
          &lt;&lt; </span><em>校园文创产品</em>
          <span class="strong"> &gt;&gt; </span>
      </h1>
      <p class="para serve-introduce">校园文创产品，有钥匙扣、书签等等。</p>
      <br />
    </div>
  </div>

  <br />

  <div class="container has-text-centered cont-2">
    <h1 class="title btitle">其他服务</h1>
    <p class="subtitle">
      <a href="/contact" use:link class="strong sa">联系社员</a>洽谈需求
    </p>
  </div>

  <br />

  <div class="servescontent">
    <div class="serveproject has-text-centered">
      <h1 class="title">
        <span class="strong">
          &lt;&lt; </span><em>模型制作</em>
          <span class="strong"> &gt;&gt; </span>
      </h1>
      <p class="para serve-introduce">3D模型制作（社团有建模课）</p>
    </div>

    <div class="serveproject has-text-centered">
      <h1 class="title">
        <span class="strong">
          &lt;&lt; </span><em>编写程序</em>
          <span class="strong"> &gt;&gt; </span>
      </h1>
      <p class="para serve-introduce">编写自动化脚本，解放双手</p>
    </div>

    <div class="serveproject has-text-centered">
      <h1 class="title">
        <span class="strong">
          &lt;&lt; </span><em>网站代运营</em>
          <span class="strong"> &gt;&gt; </span>
      </h1>
      <p class="para serve-introduce">
        可以帮忙编写、运营网站。价格视工作量决定。
      </p>
    </div>

    <br /><br /><br />
  </div>
</section>
