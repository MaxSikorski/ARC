// Admin Panel Logic
// Depends on js/supabase-client.js

(function () {
    const eventForm = document.getElementById('event-form');
    const syncPreview = document.getElementById('sync-preview');
    const previewData = document.getElementById('preview-data');
    const noEventLabel = document.getElementById('no-event-selected');
    const adminMain = document.getElementById('admin-main');

    /**
     * STRICT ADMIN GATEKEEPER
     */
    async function checkAdmin() {
        if (!window.auth) return;

        // 1. Get current session
        const user = await window.auth.getUser();

        // 2. Verification against Private Config
        const ADMIN_ID = window.SUPABASE_CONFIG.adminId;
        const ADMIN_NPUB = window.SUPABASE_CONFIG.adminNpub;

        if (!user || user.id !== ADMIN_ID) {
            console.error("Access Denied: Restricted Zone.");
            // Hide everything immediately if accessed directly
            if (adminMain) adminMain.innerHTML = '<div style="text-align:center; padding:100px;"><h1>403</h1><p>ACCESS_DENIED_BY_PROTOCOL</p><a href="index.html">Return to Safety</a></div>';
            if (adminMain) adminMain.style.display = 'block';
            return;
        }

        // 3. Optional but Forced Nostr Verification (if configured)
        if (ADMIN_NPUB) {
            if (window.nostr) {
                try {
                    const pubkey = await window.nostr.getPublicKey();
                    const npub = window.NostrTools.nip19.npubEncode(pubkey);

                    if (npub !== ADMIN_NPUB) {
                        alert("Nostr identity mismatch! hardware_key_verification_failed.");
                        window.location.href = 'index.html';
                        return;
                    }
                    console.log("Hardware Key Verified.");
                } catch (err) {
                    alert("Nostr hardware verification required for admin access.");
                    window.location.href = 'index.html';
                    return;
                }
            } else {
                console.warn("Nostr extension not found. Hardware verification skipped (Low Security Mode).");
                // Optional: Force extension install if you're strict
                // alert("Please install a Nostr extension (nos2x/Alby) for secure admin access.");
            }
        }

        // 4. Reveal UI
        if (adminMain) {
            adminMain.style.display = 'block';
            console.log("Admin Authorized. Welcome back, Maxwell.");
        }
    }

    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const eventData = {
                title: document.getElementById('event-title').value,
                date: document.getElementById('event-date').value,
                time: document.getElementById('event-time').value,
                location: document.getElementById('event-location').value,
                description: document.getElementById('event-desc').value,
                created_by: (await window.auth.getUser())?.id
            };

            try {
                await window.db.createEvent(eventData);
                alert("Event created successfully!");
                stageEvent(eventData);
                eventForm.reset();
            } catch (err) {
                alert("Error creating event: " + err.message);
            }
        });
    }

    function stageEvent(event) {
        if (!noEventLabel) return;
        noEventLabel.style.display = 'none';
        syncPreview.style.display = 'block';

        previewData.innerHTML = `
            <h4 style="color: var(--accent-secondary); margin-bottom: 10px;">${event.title}</h4>
            <p style="font-size: 0.8rem; margin-bottom: 5px;"><strong>Date:</strong> ${event.date} @ ${event.time}</p>
            <p style="font-size: 0.8rem; margin-bottom: 5px;"><strong>Location:</strong> ${event.location}</p>
            <p style="font-size: 0.8rem;">${event.description}</p>
        `;
    }

    const btnTitle = document.getElementById('btn-copy-title');
    if (btnTitle) {
        btnTitle.onclick = () => {
            const title = document.getElementById('event-title').value;
            navigator.clipboard.writeText(title);
            alert("Title copied!");
        };
    }

    const btnDesc = document.getElementById('btn-copy-desc');
    if (btnDesc) {
        btnDesc.onclick = () => {
            const desc = document.getElementById('event-desc').value;
            const loc = document.getElementById('event-location').value;
            const time = document.getElementById('event-time').value;
            const fullDesc = `${desc}\n\nLocation: ${loc}\nTime: ${time}`;
            navigator.clipboard.writeText(fullDesc);
            alert("Description copied!");
        };
    }

    checkAdmin();
})();
