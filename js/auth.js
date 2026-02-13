// Auth logic for Login/Signup
// Depends on js/supabase-client.js (window.auth, window.db)

(function () {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleAuth = document.getElementById('toggle-auth');
    const toggleAuthBack = document.getElementById('toggle-auth-back');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const nostrModal = document.getElementById('nostr-modal');
    const nostrModalContent = document.getElementById('nostr-modal-content');

    if (!loginForm) return;

    // --- Navigation Toggle ---
    if (toggleAuth) {
        toggleAuth.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            authTitle.textContent = 'Join the Collective';
            authSubtitle.textContent = 'REGISTRATION_INITIALIZED';
        });
    }

    if (toggleAuthBack) {
        toggleAuthBack.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            authTitle.textContent = 'Login';
            authSubtitle.textContent = 'IDENTITY_VERIFICATION_REQUIRED';
        });
    }

    // --- Login Handle ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.textContent = 'Verifying...';
            submitBtn.disabled = true;

            const data = await window.auth.signIn(email, password);
            console.log("Login successful:", data);

            // Redirect after success
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Login error:", error);
            alert('Authentication failed: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // --- Signup Handle (If it still exists in HTML) ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const submitBtn = signupForm.querySelector('button');

            try {
                submitBtn.textContent = 'Creating...';
                submitBtn.disabled = true;

                const { user } = await window.auth.signUp(email, password);
                if (user) {
                    showNostrFlow(user);
                } else {
                    alert('Check your email for the confirmation link!');
                }
            } catch (error) {
                alert('Registration failed: ' + error.message);
            } finally {
                submitBtn.textContent = 'Create Account';
                submitBtn.disabled = false;
            }
        });
    }

    // --- Nostr Flow ---
    function showNostrFlow(user) {
        if (!nostrModal) return;
        nostrModal.style.display = 'flex';
        nostrModalContent.innerHTML = `
            <p style="margin-bottom: 20px;">Welcome, Maker! To future-proof your identity, we recommend linking a Nostr account.</p>
            <div style="display: flex; gap: 10px; flex-direction: column;">
                <button id="btn-has-nostr" class="btn btn-secondary" style="width: 100%;">I already have a Nostr account</button>
                <button id="btn-no-nostr" class="btn btn-primary" style="width: 100%;">Create a new Nostr identity for me</button>
            </div>
        `;

        document.getElementById('btn-has-nostr').onclick = () => showLinkingFlow(user);
        document.getElementById('btn-no-nostr').onclick = () => showGenerationFlow(user);
    }

    async function showLinkingFlow(user) {
        nostrModalContent.innerHTML = `
            <p style="margin-bottom: 15px;">Paste your public key (npub) or connect via extension.</p>
            <div class="form-group">
                <input type="text" id="manual-npub" placeholder="npub1..." style="width: 100%; margin-bottom: 10px;">
            </div>
            <button id="btn-connect-extension" class="btn btn-secondary" style="width: 100%; margin-bottom: 10px;">Connect Extension (Nos2x/Alby)</button>
            <button id="btn-save-npub" class="btn btn-primary" style="width: 100%;">Link Identity</button>
        `;

        document.getElementById('btn-connect-extension').onclick = async () => {
            if (window.nostr) {
                try {
                    const pubkey = await window.nostr.getPublicKey();
                    const npub = window.NostrTools.nip19.npubEncode(pubkey);
                    document.getElementById('manual-npub').value = npub;
                } catch (err) {
                    alert("Extension connection failed: " + err.message);
                }
            } else {
                alert("No Nostr extension detected. Please install nos2x or Alby.");
            }
        };

        document.getElementById('btn-save-npub').onclick = async () => {
            const npub = document.getElementById('manual-npub').value.trim();
            if (npub.startsWith('npub1')) {
                await window.db.updateProfile(user.id, { nostr_npub: npub });
                finishFlow();
            } else {
                alert("Please enter a valid npub address.");
            }
        };
    }

    function showGenerationFlow(user) {
        const sk = window.NostrTools.generatePrivateKey();
        const pk = window.NostrTools.getPublicKey(sk);
        const nsec = window.NostrTools.nip19.nsecEncode(sk);
        const npub = window.NostrTools.nip19.npubEncode(pk);

        nostrModalContent.innerHTML = `
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">We've generated a sovereign identity for you. SAVE YOUR SECRET KEY!</p>
            
            <div class="form-group">
                <label>PUBLIC KEY (NPUB)</label>
                <div style="background: var(--bg-color); padding: 10px; border: 1px solid var(--border-color); font-size: 0.7rem; word-break: break-all; font-family: var(--font-mono);">
                    ${npub}
                </div>
            </div>

            <div class="form-group">
                <label>SECRET KEY (NSEC) - <span style="color: #ff4444;">DO NOT SHARE</span></label>
                <div style="position: relative;">
                    <input type="password" id="generated-nsec" value="${nsec}" readonly 
                           style="width: 100%; font-family: var(--font-mono); font-size: 0.7rem; padding-right: 40px; background: #111;">
                    <button id="btn-copy-nsec" style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--accent-secondary); cursor: pointer;">
                        COPY
                    </button>
                </div>
            </div>

            <p style="font-size: 0.8rem; margin: 15px 0; border-left: 3px solid var(--accent-primary); padding-left: 10px;">
                Download a Nostr extension like <strong>nos2x</strong> and import this key to log in without passwords in the future.
            </p>

            <button id="btn-finish-gen" class="btn btn-primary" style="width: 100%;">I have saved my key</button>
        `;

        document.getElementById('btn-copy-nsec').onclick = () => {
            navigator.clipboard.writeText(nsec);
            alert("Secret key copied! Store it somewhere safe.");
        };

        document.getElementById('btn-finish-gen').onclick = async () => {
            await window.db.updateProfile(user.id, { nostr_npub: npub });
            finishFlow();
        };
    }

    function finishFlow() {
        alert("Profile setup complete! Welcome to the Collective.");
        window.location.href = 'index.html';
    }
})();
