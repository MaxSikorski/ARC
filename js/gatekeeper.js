/**
 * GATEKEEPER.JS
 * Responsible for checking authentication status and protecting private routes.
 * This should be loaded BEFORE other page-specific scripts.
 */

(function () {
    // List of pages that require authentication
    const privatePages = [
        'forum.html',
        'profile.html',
        'admin.html',
        'booking.html'
    ];

    // List of pages that are only for admins
    const adminPages = [
        'admin.html'
    ];

    async function checkAccess() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isPrivate = privatePages.includes(currentPage);
        const isAdminOnly = adminPages.includes(currentPage);

        // Wait for auth to be initialized from main.js/supabase-client.js
        // We use a small interval to ensure window.auth is available
        const checkAuthReady = setInterval(async () => {
            if (window.auth) {
                clearInterval(checkAuthReady);

                try {
                    const user = await window.auth.getUser();

                    if (isPrivate && !user) {
                        console.warn("Unauthorized access attempt to:", currentPage);
                        window.location.href = 'login.html?redirect=' + currentPage;
                        return;
                    }

                    if (isAdminOnly && user) {
                        const adminId = window.SUPABASE_CONFIG?.adminId;
                        if (user.id !== adminId) {
                            console.error("Access Denied: Admin privileges required.");
                            alert("Access Denied: This area is for the site administrator only.");
                            window.location.href = 'index.html';
                        }
                    }
                } catch (err) {
                    console.error("Gatekeeper error:", err);
                    if (isPrivate) window.location.href = 'login.html';
                }
            }
        }, 50);

        // Timeout after 3 seconds if auth never loads
        setTimeout(() => clearInterval(checkAuthReady), 3000);
    }

    // Run access check
    checkAccess();
})();
