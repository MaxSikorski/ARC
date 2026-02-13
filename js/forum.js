// Forum Logic
// Depends on js/supabase-client.js

(function () {
    const threadContainer = document.querySelector('.forum-threads');
    const searchInput = document.getElementById('forum-search');
    const tagBar = document.getElementById('tag-bar');

    let allThreads = [];
    let currentTag = 'all';
    let currentUser = null;
    let isAdmin = false;

    async function initForum() {
        if (!window.auth || !window.db) return;

        currentUser = await window.auth.getUser();
        if (currentUser) {
            isAdmin = currentUser.id === window.SUPABASE_CONFIG?.adminId;
        }
        if (!currentUser) {
            threadContainer.innerHTML = `
                <div style="text-align: center; padding: 100px; border: 1px dashed var(--accent-secondary);">
                    <h3 style="margin-bottom: 20px;">[IDENT_REQUIRED]</h3>
                    <p style="margin-bottom: 20px;">The forum is restricted to authorized designers and makers.</p>
                    <a href="login.html" class="btn btn-primary">Login to Access</a>
                </div>
            `;
            return;
        }

        try {
            threadContainer.innerHTML = '<div style="text-align:center; padding:50px;">[SYNCING_DISCOURSE_BUS...]</div>';
            allThreads = await window.db.getThreads();
            renderFilteredThreads();
        } catch (err) {
            threadContainer.innerHTML = `<p>[SYNC_ERROR]: ${err.message}</p>`;
        }
    }

    function renderFilteredThreads() {
        let filtered = allThreads;

        // Filter by tag
        if (currentTag !== 'all') {
            filtered = filtered.filter(t => (t.tags || []).includes(currentTag));
        }

        // Filter by search
        const query = searchInput?.value.toLowerCase() || '';
        if (query) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(query) ||
               (t.content && t.content.toLowerCase().includes(query))
            );
        }

        renderThreads(filtered);
    }

    function renderThreads(filtered) {
        threadContainer.innerHTML = '';
        filtered.forEach((t, index) => {
            const threadEl = document.createElement('div');
            threadEl.className = 'forum-thread blueprint-line';
            threadEl.setAttribute('data-label', `THREAD_${(index + 1).toString().padStart(3, '0')}`);

            const date = new Date(t.created_at).toLocaleDateString();
            const tagHtml = (t.tags || []).map(tag => `<span class="tag-chip-small" style="font-size: 0.6rem; border: 1px solid var(--accent-secondary); padding: 2px 5px; margin-right: 5px;">#${tag}</span>`).join('');
            const authorLink = t.profiles?.username ? `<a href="user-profile.html?id=${t.author_id}" class="username-link">@${t.profiles.username}</a>` : 'Unknown Maker';

            threadEl.innerHTML = `
                <div>
                    <h3 style="margin-bottom: 5px;">${t.title}</h3>
                    <div style="margin-bottom: 5px;">${tagHtml}</div>
                    <small>By: ${authorLink} | ${date}</small>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a href="forum-post.html?id=${t.id}&title=${encodeURIComponent(t.title.replace(/\s+/g, '-').toLowerCase())}" class="btn btn-secondary btn-small">View Discourse</a>
                    ${isAdmin ? `<button class="btn-delete-thread" data-id="${t.id}" style="background: var(--error-color, #e74c3c); color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.7rem;">Delete</button>` : ''}
                </div>
            `;

            // Add delete handler if admin
            if (isAdmin) {
                const deleteBtn = threadEl.querySelector('.btn-delete-thread');
                if (deleteBtn) {
                    deleteBtn.onclick = async () => {
                        if (confirm('Delete this entire thread? This cannot be undone.')) {
                            try {
                                const { error } = await window.supabaseClient
                                    .from('threads')
                                    .delete()
                                    .eq('id', t.id);
                                if (error) throw error;
                                alert('Thread deleted');
                                location.reload();
                            } catch (err) {
                                alert('Delete failed: ' + err.message);
                            }
                        }
                    };
                }
            }

            threadContainer.appendChild(threadEl);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderFilteredThreads);
    }

    if (tagBar) {
        tagBar.addEventListener('click', (e) => {
            const tagChip = e.target.closest('.tag-chip');
            if (tagChip) {
                document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
                tagChip.classList.add('active');
                currentTag = tagChip.dataset.tag;
                renderFilteredThreads();
            }
        });
    }

    initForum();
})();
