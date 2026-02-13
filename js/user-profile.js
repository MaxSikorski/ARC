// User Profile Page Logic
// Depends on js/supabase-client.js

(function () {
    const usernameDisplay = document.getElementById('profile-username');
    const memberSinceDisplay = document.getElementById('member-since');
    const bioDisplay = document.getElementById('profile-bio');
    const bioSection = document.getElementById('bio-section');
    const statThreads = document.getElementById('stat-threads');
    const statReplies = document.getElementById('stat-replies');
    const recentThreadsContainer = document.getElementById('recent-threads');

    async function initUserProfile() {
        if (!window.auth || !window.db) return;

        // Check if user is logged in
        const currentUser = await window.auth.getUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Get user ID from URL param
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');

        if (!userId) {
            alert('No user specified');
            window.location.href = 'forum.html';
            return;
        }

        try {
            await loadProfile(userId);
            await loadStats(userId);
            await loadRecentThreads(userId);
        } catch (err) {
            console.error("Profile load error:", err);
            alert('Error loading profile');
        }
    }

    async function loadProfile(userId) {
        const { data: profile, error } = await window.supabaseClient
            .from('profiles')
            .select('username, bio, created_at')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            throw new Error('Profile not found');
        }

        if (usernameDisplay) {
            usernameDisplay.textContent = `@${profile.username || 'anonymous'}`;
        }

        if (memberSinceDisplay && profile.created_at) {
            const date = new Date(profile.created_at);
            memberSinceDisplay.textContent = `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        }

        if (bioDisplay) {
            if (profile.bio && profile.bio.trim()) {
                bioDisplay.textContent = profile.bio;
            } else {
                bioDisplay.textContent = 'No bio yet.';
                bioDisplay.style.fontStyle = 'italic';
            }
        }
    }

    async function loadStats(userId) {
        // Count threads
        const { count: threadCount } = await window.supabaseClient
            .from('threads')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', userId);

        // Count replies
        const { count: replyCount } = await window.supabaseClient
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', userId);

        if (statThreads) statThreads.textContent = threadCount || 0;
        if (statReplies) statReplies.textContent = replyCount || 0;
    }

    async function loadRecentThreads(userId) {
        const { data: threads, error } = await window.supabaseClient
            .from('threads')
            .select('id, title, created_at')
            .eq('author_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error || !threads || threads.length === 0) {
            if (recentThreadsContainer) {
                recentThreadsContainer.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">No threads posted yet.</p>';
            }
            return;
        }

        if (recentThreadsContainer) {
            recentThreadsContainer.innerHTML = threads.map(t => {
                const date = new Date(t.created_at).toLocaleDateString();
                return `
                    <div class="forum-thread" style="margin-bottom: 10px; padding: 15px;">
                        <div>
                            <h4 style="margin: 0 0 5px 0;">${t.title}</h4>
                            <small style="color: var(--text-muted);">${date}</small>
                        </div>
                        <a href="forum-post.html?id=${t.id}" class="btn btn-secondary btn-small">View</a>
                    </div>
                `;
            }).join('');
        }
    }

    initUserProfile();
})();
