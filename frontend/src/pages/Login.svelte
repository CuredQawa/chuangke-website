<script>
  import { login, authLoading, authError } from '../stores/auth.js';
  
  let email = '';
  let password = '';
  let errorMessage = '';
  
  async function handleSubmit() {
    errorMessage = '';
    try {
      await login(email, password);
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo') || '/';
      window.location.href = decodeURIComponent(returnTo);
    } catch (error) {
      errorMessage = error.message || '登录失败';
    }
  }
</script>

<section class="login-container">
  <div class="login-box">
    <div class="has-text-centered mb-5">
      <span><img src="/images/logo-alpha.webp" alt="创客社Logo" style="width: 60px;"></span>
      <h2 class="title is-3">登录创客社系统</h2>
    </div>

    {#if errorMessage}
      <div class="notification is-danger">
        {errorMessage}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
      <div class="field">
        <label class="label" for="email">邮箱</label>
        <div class="control">
          <input class="input" type="email" id="email" bind:value={email} placeholder="请输入邮箱" required />
        </div>
      </div>

      <div class="field">
        <label class="label" for="password">密码</label>
        <div class="control">
          <input class="input" type="password" id="password" bind:value={password} placeholder="请输入密码" required />
        </div>
      </div>

      <div class="field">
        <button type="submit" class="button is-large is-login" class:is-loading={$authLoading}>登录</button>
      </div>
    </form>
  </div>
</section>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  }

  .login-box {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 400px;
  }

  .title {
    color: #333;
    font-weight: 700;
  }

  :global(.label) {
    color: #333;
  }

  .field {
    margin-bottom: 1.5rem;
  }

  .button.is-login {
    background: #a654f1;
    color: white;
    width: 100%;
  }
</style>
