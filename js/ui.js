// --- UI Core Logic (Non-Module) ---

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const mainLogo = document.getElementById('main-logo');
    const htmlRoot = document.documentElement;

    // --- Hamburger Menu Logic ---
    if (hamburger && navMenu && overlay) {
        function toggleMenu() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        }

        hamburger.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);

        // Close menu when clicking a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) toggleMenu();
            });
        });
    }

    // --- Theme Toggle Logic ---
    if (themeToggle && themeIcon) {
        function setTheme(theme) {
            htmlRoot.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            updateThemeIcon(theme);
        }

        function updateThemeIcon(theme) {
            if (theme === 'dark') {
                themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
            } else {
                themeIcon.innerHTML = `
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                `;
            }
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlRoot.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });

        // Initialize Theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }

    // --- Logo Refresh Logic ---
    if (mainLogo) {
        mainLogo.style.cursor = 'pointer';
        mainLogo.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    // --- Admin Shortcut Logic (Footer) ---
    const adminEmail = 'maxwell.sikorski@gmail.com';
    const footerBottom = document.querySelector('.footer-bottom');

    if (footerBottom) {
        // We use a small interval or check auth state to show the link
        // For simplicity, we check if the user is already logged in as admin
        const checkAuthAndAddLink = async () => {
            // Main.js handles the actual Supabase import, so we listen for a custom event or check storage
            const savedTheme = localStorage.getItem('theme'); // Dummy check to trigger logic

            // Note: Since this is Vanilla JS without a global state manager, 
            // we'll just wait for the auth state from main.js or check the session
            if (window.supabaseClient) {
                const { data: { user } } = await window.supabaseClient.auth.getUser();
                if (user && user.email === adminEmail) {
                    const adminLink = document.createElement('div');
                    adminLink.style.marginTop = '10px';
                    adminLink.innerHTML = '<a href="admin.html" style="font-size: 0.7rem; color: var(--text-muted); text-decoration: none; opacity: 0.5;">[SYSTEM_MANAGEMENT]</a>';
                    footerBottom.appendChild(adminLink);
                }
            }
        };

        // Wait for Supabase to be ready
        setTimeout(checkAuthAndAddLink, 2000);
    }
});
