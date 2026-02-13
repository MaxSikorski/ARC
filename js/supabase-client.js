// Initialize the Supabase client
// This script depends on js/config.js being loaded first

(function () {
    if (!window.SUPABASE_CONFIG) {
        console.error("SUPABASE_CONFIG not found. Ensure js/config.js is loaded.");
        return;
    }

    const supabaseUrl = window.SUPABASE_CONFIG.url;
    const supabaseAnonKey = window.SUPABASE_CONFIG.anonKey;

    // We use the global 'supabase' object provided by the CDN script
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
    window.supabaseClient = supabaseClient;

    /**
     * Common database operations
     */
    window.db = {
        // Events
        async getEvents() {
            const { data, error } = await supabaseClient
                .from('events')
                .select('*')
                .order('date', { ascending: true });
            if (error) throw error;
            return data;
        },

        async createEvent(eventData) {
            const { data, error } = await supabaseClient
                .from('events')
                .insert([eventData]);
            if (error) throw error;
            return data;
        },

        // Profiles (User data including Nostr keys)
        async getProfile(userId) {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) throw error;
            return data;
        },

        async updateProfile(userId, profileData) {
            const { data, error } = await supabaseClient
                .from('profiles')
                .update(profileData)
                .eq('id', userId);
            if (error) throw error;
            return data;
        },

        // Forum
        async getThreads() {
            const { data, error } = await supabaseClient
                .from('threads')
                .select('*, profiles(username)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },

        async getPosts(threadId) {
            const { data, error } = await supabaseClient
                .from('posts')
                .select('*, profiles(username)')
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data;
        },

        async createThread(title, authorId) {
            const { data, error } = await supabaseClient
                .from('threads')
                .insert([{ title, author_id: authorId }])
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    };

    /**
     * Authentication operations
     */
    window.auth = {
        async signUp(email, password, metadata = {}) {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            });
            if (error) throw error;
            return data;
        },

        async signIn(email, password) {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return data;
        },

        async signOut() {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
        },

        async getUser() {
            const { data: { user } } = await supabaseClient.auth.getUser();
            return user;
        },

        onAuthStateChange(callback) {
            return supabaseClient.auth.onAuthStateChange(callback);
        }
    };
})();
