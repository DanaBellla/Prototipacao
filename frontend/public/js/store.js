/* Sonora — Local state store with LocalStorage persistence.
 * Everything is prototype/simulation — no backend needed for Phase 1. */
(function () {
  const KEY = "sonora_state_v1";

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        users: state.users,
        posts: state.posts,
        events: state.events,
        likes: state.likes,
        follows: state.follows,
        currentUserId: state.currentUserId,
        theme: state.theme,
      }));
    } catch (_) {}
  }

  const seed = window.SONORA_SEED;
  const stored = loadState();

  const state = stored || {
    users: seed.users,
    posts: seed.posts,
    events: seed.events,
    trends: seed.trends,
    likes: {}, // { postId: [userId, ...] }
    follows: {}, // { userId: [followerId, ...] }
    currentUserId: null,
    theme: "dark",
  };
  // Trends are static (from seed) — not persisted
  state.trends = seed.trends;

  const store = {
    get state() { return state; },
    persist,
    currentUser() {
      if (!state.currentUserId) return null;
      return state.users.find((u) => u.id === state.currentUserId) || null;
    },
    login(email, password) {
      const u = state.users.find(
        (x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password
      );
      if (!u) return null;
      state.currentUserId = u.id;
      persist();
      return u;
    },
    logout() {
      state.currentUserId = null;
      persist();
    },
    register(payload) {
      // Basic email uniqueness check
      if (state.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
        return { error: "Este e-mail já está cadastrado." };
      }
      const id = "u" + (state.users.length + 1) + "_" + Date.now();
      const user = {
        id,
        role: payload.role,
        email: payload.email,
        password: payload.password,
        name: payload.name || payload.artistName || payload.venueName || "",
        artistName: payload.artistName,
        bandName: payload.bandName,
        venueName: payload.venueName,
        city: payload.city || "",
        state: payload.state || "",
        avatar:
          payload.avatar ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
        cover:
          payload.cover ||
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600",
        bio: payload.bio || "",
        genres: payload.genres || [],
        followers: 0,
        shows: 0,
        rating: 0,
      };
      state.users.push(user);
      state.currentUserId = user.id;
      persist();
      return { user };
    },
    userById(id) {
      return state.users.find((u) => u.id === id);
    },
    toggleLike(postId) {
      const uid = state.currentUserId;
      if (!uid) return;
      const arr = state.likes[postId] || [];
      const idx = arr.indexOf(uid);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(uid);
      state.likes[postId] = arr;
      persist();
    },
    isLiked(postId) {
      const uid = state.currentUserId;
      if (!uid) return false;
      return (state.likes[postId] || []).includes(uid);
    },
    likeCount(post) {
      return post.likes + ((state.likes[post.id] || []).length ? (state.likes[post.id].filter(u=>u!==post.userId).length) : 0);
    },
    addComment(postId, text) {
      const uid = state.currentUserId;
      if (!uid || !text.trim()) return;
      const post = state.posts.find((p) => p.id === postId);
      if (!post) return;
      post.comments.push({ user: uid, text: text.trim() });
      persist();
    },
    createPost(payload) {
      const uid = state.currentUserId;
      if (!uid) return;
      const post = {
        id: "p_" + Date.now(),
        userId: uid,
        time: new Date().toISOString(),
        image: payload.image || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200",
        caption: payload.caption || "",
        hashtags: (payload.caption || "").match(/#\w+/g) || [],
        likes: 0,
        comments: [],
        location: payload.location || "",
      };
      state.posts.unshift(post);
      persist();
      return post;
    },
    setTheme(t) {
      state.theme = t;
      document.documentElement.setAttribute("data-theme", t);
      persist();
    },
    toggleTheme() {
      this.setTheme(state.theme === "dark" ? "light" : "dark");
    },
  };

  // Apply theme on load
  document.documentElement.setAttribute("data-theme", state.theme || "dark");

  window.Store = store;
})();
