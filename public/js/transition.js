document.addEventListener("DOMContentLoaded", () => {
    const ease = "power4.inOut";


    document.querySelectorAll("a:not(.othersites)").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const href = link.getAttribute("href");

            // 如果是外部链接、空链接、或锚点（#xxx），直接放行
            // if (!href || href === '#' || href.startsWith('#')) {
            //     return; // 让浏览器默认处理
            // }

            if (href && !href.startsWith("#") && href !== window.location.pathname) {
                animateTransition().then(() =>{
                    window.location.href = href;
                })
            }
        })
    })


    revealTransition().then(() =>{
        gsap.set(".blockt", { visability : "hidden" });
    })

    function revealTransition(){
        return new Promise((resolve) =>{
            gsap.set(".blockt", { scaleY : 1 });
            gsap.to(".blockt", {
                scaleY : 0,
                duration : 0.7,
                stagger: {
                    each : 0.1,
                    from : "start",
                    grid : "auto",
                    axis : "x",
                },
                ease : ease,
                onComplete : resolve,
            })
        })
    }


    function animateTransition(){
        return new Promise((resolve) =>{
            gsap.set(".blockt", { visability : "visible" , scaleY : 0 });
            gsap.to(".blockt", {
                scaleY : 1,
                duration : 0.7,
                stagger: {
                    each : 0.1,
                    from : "start",
                    grid : [1,5],
                    axis : "x",
                },
                ease : ease,
                onComplete : resolve,
            })
        })
    }

})