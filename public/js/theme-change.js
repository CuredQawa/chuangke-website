

// 页面加载时检查 localStorage 中是否有主题设置
window.addEventListener('DOMContentLoaded', (event) => {
    const element = document.documentElement;
    const themeSwitch = document.getElementById("theme-switch");

// 如果有存储值就用存储值，否则默认是 dark
    const savedTheme = localStorage.getItem('theme') || 'dark';

    if (savedTheme === 'light') {
        element.setAttribute('data-theme', 'light');
        themeSwitch.setAttribute('class', 'iconfont icon-yueliang');
    } else {
        element.setAttribute('data-theme', 'dark');
        themeSwitch.setAttribute('class', 'iconfont icon-ai250');
    }
    });

    function switchtheme() {
    const element = document.documentElement;
    const themeSwitch = document.getElementById("theme-switch");

    if (element.getAttribute('data-theme') === 'dark') {
        element.setAttribute('data-theme', 'light');
        themeSwitch.setAttribute('class', 'iconfont icon-yueliang');
        localStorage.setItem('theme', 'light'); // 存入 light
    } else {
        element.setAttribute('data-theme', 'dark');
        themeSwitch.setAttribute('class', 'iconfont icon-ai250');
        localStorage.setItem('theme', 'dark'); // 存入 dark
    }
}

