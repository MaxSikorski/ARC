// Bulletin Board Logic
// Depends on js/supabase-client.js

(function () {
    const board = document.getElementById('bulletin-board');
    const controls = document.getElementById('bulletin-controls');
    const addNoteBtn = document.getElementById('btn-add-note');
    const noteModal = document.getElementById('note-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');
    const noteForm = document.getElementById('note-form');
    const noteText = document.getElementById('note-text');

    let currentUser = null;
    let isAdmin = false;

    async function initBoard() {
        if (!window.db || !window.auth) return;

        currentUser = await window.auth.getUser();
        if (currentUser) {
            // Check if user is admin
            isAdmin = currentUser.id === window.SUPABASE_CONFIG?.adminId;
            if (controls) controls.style.display = 'block';
        }

        fetchNotes();
    }

    async function fetchNotes() {
        if (!board) return;

        try {
            const { data, error } = await window.supabaseClient
                .from('bulletin_notes')
                .select('*, profiles(username)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderNotes(data);
        } catch (err) {
            console.error("Board sync failed:", err);
            board.innerHTML = '<p style="text-align:center; padding: 50px;">[SYNC_ERROR]</p>';
        }
    }

    function renderNotes(notes) {
        board.innerHTML = '';
        if (notes.length === 0) {
            board.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 100px; color: var(--text-muted);">[VIRTUAL_BOARD_EMPTY]</div>';
            return;
        }

        notes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'sticky-note';

            const canDelete = (currentUser && note.author_id === currentUser.id) || isAdmin;
            const date = new Date(note.created_at).toLocaleDateString();
            const usernameLink = note.profiles?.username ? `<a href="user-profile.html?id=${note.author_id}" class="username-link">@${note.profiles.username}</a>` : '@maker';

            noteEl.innerHTML = `
                <div class="note-content">${note.content}</div>
                <div class="note-footer">
                    <span>${usernameLink}</span>
                    <span>${date}</span>
                </div>
                ${canDelete ? `<button class="delete-note" data-id="${note.id}">×</button>` : ''}
            `;

            if (canDelete) {
                noteEl.querySelector('.delete-note').onclick = () => deleteNote(note.id);
            }

            board.appendChild(noteEl);
        });
    }

    async function deleteNote(id) {
        if (!confirm("Remove this note?")) return;
        try {
            const { error } = await window.supabaseClient
                .from('bulletin_notes')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchNotes();
        } catch (err) {
            alert("Delete failed: " + err.message);
        }
    }

    if (addNoteBtn) {
        addNoteBtn.onclick = () => {
            if (noteModal) noteModal.style.display = 'flex';
        };
    }

    if (closeModalBtn) {
        closeModalBtn.onclick = () => {
            if (noteModal) noteModal.style.display = 'none';
        };
    }

    if (noteForm) {
        noteForm.onsubmit = async (e) => {
            e.preventDefault();
            const content = noteText.value.trim();
            if (!content) return;

            try {
                const { error } = await window.supabaseClient
                    .from('bulletin_notes')
                    .insert([{
                        content,
                        author_id: currentUser.id
                    }]);

                if (error) throw error;

                noteText.value = '';
                if (noteModal) noteModal.style.display = 'none';
                fetchNotes();
            } catch (err) {
                alert("Pin failed: " + err.message);
            }
        };
    }

    initBoard();
})();
