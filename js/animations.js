// Register ScrollTrigger if available
if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// --- Hero Assembly Animation ---
function initHeroAnimations() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });

    tl.from(hero, {
        opacity: 0,
        scale: 0.95,
        duration: 1.5
    })
        .from(".hero .blueprint-line", {
            width: 0,
            duration: 1.2,
            stagger: 0.2
        }, "-=1")
        .from(".hero-title", {
            y: 50,
            opacity: 0,
            duration: 0.8
        }, "-=0.8")
        .from(".hero-subtitle", {
            y: 30,
            opacity: 0,
            duration: 0.8
        }, "-=0.6")
        .from(".hero-cta .btn", {
            x: -20,
            opacity: 0,
            stagger: 0.2,
            duration: 0.5
        }, "-=0.4")
        .from(".screw-head", {
            scale: 0,
            rotation: 360,
            stagger: 0.1,
            duration: 0.5
        }, "-=0.5");
}

// --- Easter Egg: Unscrew Logic ---
function initScrewEasterEgg() {
    const screws = document.querySelectorAll('.screw-head');

    screws.forEach(screw => {
        screw.addEventListener('click', () => {
            // Rotate the screw
            gsap.to(screw, {
                rotation: "+=720",
                duration: 1,
                ease: "power2.inOut"
            });

            // Make it "loose"
            gsap.to(screw, {
                y: 5,
                boxShadow: "0 5px 10px rgba(0,0,0,0.2)",
                duration: 0.5
            });

            // Check if all screws are clicked? (Optional idea)
            // For now, just make the mat wiggle
            gsap.to(".workbench-mat", {
                x: "random(-2, 2)",
                y: "random(-2, 2)",
                duration: 0.1,
                repeat: 5,
                yoyo: true
            });
        });
    });
}

// --- Easter Egg: Konami Code ---
let konamiBuffer = [];
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

window.addEventListener('keydown', (e) => {
    konamiBuffer.push(e.key);
    konamiBuffer = konamiBuffer.slice(-10);

    if (JSON.stringify(konamiBuffer) === JSON.stringify(konamiCode)) {
        triggerKonamiSurprise();
    }
});

function triggerKonamiSurprise() {
    const overlay = document.createElement('div');
    overlay.style.fixed = "position";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(230, 126, 34, 0.9)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.color = "white";
    overlay.style.fontFamily = "'Fira Code', monospace";
    overlay.innerHTML = `
        <h1 style="font-size: 5rem;">LEVEL UP!</h1>
        <p style="font-size: 1.5rem;">3D Printer Speed: 200%</p>
        <p style="margin-top: 20px;">[Click to resume making]</p>
    `;
    overlay.style.position = "fixed"; // Fix typo in my head

    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => overlay.remove()
        });
    });

    // Animate the text
    gsap.from(overlay.querySelectorAll('h1, p'), {
        y: 100,
        opacity: 0,
        stagger: 0.3,
        ease: "back.out(1.7)"
    });
}

// Init on load
window.addEventListener('load', () => {
    initHeroAnimations();
    initScrewEasterEgg();
});
