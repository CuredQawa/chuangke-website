// 页面加载时检查 sessionStorage 中是否有主题设置
function applyTheme(theme) {
    const element = document.documentElement;
    const themeSwitch = document.getElementById("theme-switch");

    if (theme === 'light') {
        element.setAttribute('data-theme', 'light');
        if (themeSwitch) {
            themeSwitch.setAttribute('class', 'iconfont icon-yueliang');
        }
    } else {
        element.setAttribute('data-theme', 'dark');
        if (themeSwitch) {
            themeSwitch.setAttribute('class', 'iconfont icon-ai250');
        }
    }
}

// 获取当前应该应用的主题
function getCurrentTheme() {
    // 获取系统主题
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    // 如果有存储值就用存储值，否则默认是系统主题
    return sessionStorage.getItem('theme') || systemTheme;
}

// 确保DOM加载完成后应用主题
function initializeTheme() {
    // 如果DOM已经加载完成，直接应用主题
    if (document.readyState === 'loading') {
        // DOM仍在加载中，等待加载完成
        document.addEventListener('DOMContentLoaded', () => {
            applyTheme(getCurrentTheme());
        });
    } else {
        // DOM已经加载完成，直接应用主题
        applyTheme(getCurrentTheme());
    }
}

initializeTheme();

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    // 只有在没有手动设置主题时才跟随系统主题变化
    if (!sessionStorage.getItem('theme')) {
        const newTheme = event.matches ? 'dark' : 'light';
        applyTheme(newTheme);
    }
});

function switchTheme() {
    const documentElement = document.documentElement;
    const themeSwitch = document.getElementById("theme-switch");

    if (documentElement.getAttribute('data-theme') === 'dark') {
        documentElement.setAttribute('data-theme', 'light');
        if (themeSwitch) {
            themeSwitch.setAttribute('class', 'iconfont icon-yueliang');
        }
        sessionStorage.setItem('theme', 'light'); // 存入 light
    } else {
        documentElement.setAttribute('data-theme', 'dark');
        if (themeSwitch) {
            themeSwitch.setAttribute('class', 'iconfont icon-ai250');
        }
        sessionStorage.setItem('theme', 'dark'); // 存入 dark
    }
}