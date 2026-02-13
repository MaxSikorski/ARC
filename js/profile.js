// Profile Page Logic
// Depends on js/supabase-client.js

(function () {
    const usernameInput = document.getElementById('username');
    const bioInput = document.getElementById('bio');
    const charCount = document.getElementById('char-count');
    const emailDisplay = document.getElementById('user-email');
    const npubDisplay = document.getElementById('display-npub');
    const saveBtn = document.getElementById('btn-save-profile');
    const updateNostrBtn = document.getElementById('btn-update-nostr');
    const nostrModal = document.getElementById('nostr-modal');
    const modalConnectBtn = document.getElementById('btn-modal-connect');
    const modalCloseBtn = document.getElementById('btn-modal-close');

    if (!usernameInput) return;

    let currentUser = null;

    async function initProfile() {
        if (!window.auth || !window.db) return;

        currentUser = await window.auth.getUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        if (emailDisplay) emailDisplay.textContent = currentUser.email.toUpperCase();

        try {
            const profile = await window.db.getProfile(currentUser.id);
            if (profile) {
                usernameInput.value = profile.username || '';
                if (bioInput) {
                    bioInput.value = profile.bio || '';
                    updateCharCount();
                }
                if (npubDisplay) npubDisplay.textContent = profile.nostr_npub || 'NOT_LINKED';
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    }

    function updateCharCount() {
        if (bioInput && charCount) {
            const length = bioInput.value.length;
            charCount.textContent = `${length}/500 characters`;
        }
    }

    if (bioInput) {
        bioInput.addEventListener('input', updateCharCount);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const newUsername = usernameInput.value.trim();
            if (!newUsername) return;

            try {
                // Check if username is taken by someone else
                const { data: existing } = await window.supabaseClient
                    .from('profiles')
                    .select('id')
                    .eq('username', newUsername)
                    .neq('id', currentUser.id)
                    .maybeSingle();

                if (existing) {
                    alert("This username is already claimed by another maker. Please choose another.");
                    return;
                }

                const updateData = { username: newUsername };
                if (bioInput) {
                    updateData.bio = bioInput.value.trim();
                }

                await window.db.updateProfile(currentUser.id, updateData);
                alert("Profile synced successfully!");
            } catch (err) {
                alert("Sync failed: " + err.message);
            }
        });
    }

    if (updateNostrBtn) {
        updateNostrBtn.addEventListener('click', () => {
            if (nostrModal) nostrModal.style.display = 'flex';
        });
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            if (nostrModal) nostrModal.style.display = 'none';
        });
    }

    if (modalConnectBtn) {
        modalConnectBtn.addEventListener('click', async () => {
            const npub = prompt("Please paste your npub identity:");
            if (npub) {
                try {
                    await window.db.updateProfile(currentUser.id, { nostr_npub: npub });
                    if (npubDisplay) npubDisplay.textContent = npub;
                    if (nostrModal) nostrModal.style.display = 'none';
                } catch (err) {
                    alert("Update failed: " + err.message);
                }
            }
        });
    }

    initProfile();
})();
