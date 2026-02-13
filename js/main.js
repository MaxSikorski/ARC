// Main Auth UI logic
// Depends on js/supabase-client.js (window.auth)

(function () {
    /**
     * Update the navigation bar based on the user's authentication state.
     */
    function updateAuthUI(user) {
        const authLinks = document.querySelectorAll('.login-btn, .dynamic-auth-link');
        const navMenuUls = document.querySelectorAll('.nav-menu ul, .desktop-nav ul');
        const adminId = window.SUPABASE_CONFIG?.adminId;

        if (user) {
            // Change "Login" to "Profile" for all links
            authLinks.forEach(link => {
                link.textContent = 'Profile';
                link.href = 'profile.html';
            });

            // Show Admin link if user is administrator
            if (user.id === adminId) {
                if (!document.querySelector('.admin-link')) {
                    navMenuUls.forEach(ul => {
                        const adminLi = document.createElement('li');
                        adminLi.className = 'admin-link';
                        adminLi.innerHTML = '<a href="admin.html">Admin</a>';

                        // Insert before Logout or at the end
                        const logoutBtn = ul.querySelector('.logout-btn');
                        if (logoutBtn) {
                            ul.insertBefore(adminLi, logoutBtn.parentElement);
                        } else {
                            ul.appendChild(adminLi);
                        }
                    });
                }
            } else {
                document.querySelectorAll('.admin-link').forEach(el => el.remove());
            }

            // Add a "Logout" menu item if it's missing
            if (!document.querySelector('.logout-btn')) {
                navMenuUls.forEach(ul => {
                    const logoutLi = document.createElement('li');
                    logoutLi.innerHTML = '<a href="#" class="logout-btn">Logout</a>';
                    ul.appendChild(logoutLi);

                    logoutLi.querySelector('.logout-btn').addEventListener('click', async (e) => {
                        e.preventDefault();
                        await window.auth.signOut();
                        window.location.href = 'index.html';
                    });
                });
            }
        } else {
            // Reset to "Login"
            authLinks.forEach(link => {
                link.textContent = 'Login';
                link.href = 'login.html';
                link.classList.remove('profile-active'); // Optional cleanup
            });

            // Remove Protected links
            document.querySelectorAll('.admin-link').forEach(el => el.remove());
            document.querySelectorAll('.logout-btn').forEach(btn => {
                if (btn.parentElement) btn.parentElement.remove();
            });
        }
    }

    // Handle initialization and auth state changes
    document.addEventListener('DOMContentLoaded', () => {
        if (window.auth) {
            window.auth.getUser().then(updateAuthUI).catch(err => {
                console.warn("Supabase Auth not initialized (Check config.js)");
            });

            window.auth.onAuthStateChange((event, session) => {
                updateAuthUI(session?.user || null);
            });
        }
    });
})();
