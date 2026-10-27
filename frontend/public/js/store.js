/* BandaConnection — Local state store with LocalStorage persistence. */
(function () {
  const KEY = "sonora_state_v2";

  function loadState() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) { return null; }
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        users: state.users,
        posts: state.posts,
        events: state.events,
        likes: state.likes,
        follows: state.follows,
        conversations: state.conversations,
        tickets: state.tickets,
        notifications: state.notifications,
        proposals: state.proposals,
        currentUserId: state.currentUserId,
        theme: state.theme,
      }));
    } catch (_) {}
  }

  const seed = window.SONORA_SEED;
  const stored = loadState();

  const defaults = {
    users: seed.users,
    posts: seed.posts,
    events: seed.events,
    likes: {},
    follows: {},
    conversations: seedConversations(),
    tickets: [],
    notifications: seedNotifications(),
    proposals: [],
    currentUserId: null,
    theme: "dark",
  };

  const state = stored || defaults;
  // Non-persistent seed additions
  state.trends = seed.trends;
  // Ensure new fields exist for older localstorage
  ["conversations", "tickets", "notifications", "proposals"].forEach((k) => {
    if (!state[k]) state[k] = defaults[k];
  });
  if (!state.follows || typeof state.follows !== "object") state.follows = {};

  function seedConversations() {
    // Threads between u1 (Luna), u3 (Aurora), u2 (Kaio), u4 (Natura)
    return [
      {
        id: "c1",
        participants: ["u1", "u3"],
        messages: [
          { from: "u3", text: "Oi Luna! Vamos fechar a sexta?", time: hoursAgo(30) },
          { from: "u1", text: "Vamos sim! Que horas começa?", time: hoursAgo(28) },
          { from: "u3", text: "21h. Passamos o cachê e a estrutura em seguida.", time: hoursAgo(27) },
          { from: "u1", text: "Perfeito 🎶", time: hoursAgo(2) },
        ],
      },
      {
        id: "c2",
        participants: ["u1", "u4"],
        messages: [
          { from: "u4", text: "Luna, quer abrir a noite de MPB dia 8?", time: hoursAgo(72) },
          { from: "u1", text: "Adoraria! Me manda a proposta formal.", time: hoursAgo(70) },
        ],
      },
      {
        id: "c3",
        participants: ["u3", "u2"],
        messages: [
          { from: "u3", text: "Kaio, tem sábado 24?", time: hoursAgo(5) },
        ],
      },
    ];
  }
  function seedNotifications() {
    return [
      { id: "n1", type: "like", from: "u3", target: "p1", time: hoursAgo(1), read: false, forUserId: "u1" },
      { id: "n2", type: "proposal", from: "u3", target: null, time: hoursAgo(3), read: false, forUserId: "u1" },
      { id: "n3", type: "follow", from: "u5", target: null, time: hoursAgo(6), read: false, forUserId: "u1" },
      { id: "n4", type: "comment", from: "u2", target: "p1", time: hoursAgo(20), read: true, forUserId: "u1" },
      { id: "n5", type: "event", from: null, target: "e1", time: hoursAgo(30), read: true, forUserId: "u1" },
      { id: "n6", type: "like", from: "u1", target: "p2", time: hoursAgo(2), read: false, forUserId: "u3" },
    ];
  }
  function hoursAgo(h) { return new Date(Date.now() - h * 3600 * 1000).toISOString(); }

  // Apply theme
  document.documentElement.setAttribute("data-theme", state.theme || "dark");

  window.Store = {
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
      if (state.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
        return { error: "Este e-mail já está cadastrado." };
      }
      const id = "u_" + Date.now();
      const displayName =
        payload.name ||
        payload.artistName ||
        payload.venueName ||
        payload.email.split("@")[0];
      const defaultAvatars = {
        musician: "./images/default-avatar.svg",
        venue: "./images/default-avatar.svg",
        listener: "./images/default-avatar.svg",
      };
      const defaultCovers = {
        musician: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1600",
        venue: "https://images.unsplash.com/photo-1651511806003-30e8a55b5fce?w=1600",
        listener: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600",
      };
      const user = {
        id,
        role: payload.role,
        email: payload.email,
        password: payload.password,
        name: displayName,
        artistName: payload.artistName || "",
        bandName: payload.bandName || "",
        venueName: payload.venueName || "",
        city: payload.city || "",
        state: payload.state || "",
        avatar: payload.avatar || defaultAvatars[payload.role] || defaultAvatars.listener,
        cover: payload.cover || defaultCovers[payload.role] || defaultCovers.listener,
        avatarPosition: payload.avatarPosition || { x: 50, y: 50 },
        coverPosition: payload.coverPosition || { x: 50, y: 50 },
        bio: payload.bio || "",
        genres: (payload.genres || []).slice(0, 5),
        category: payload.category || "",
        address: payload.address || "",
        capacity: Number(payload.capacity) || 0,
        cache: payload.cache || "",
        duration: payload.duration || "",
        instagram: payload.instagram || "",
        spotify: payload.spotify || "",
        hours: payload.hours || "",
        openingSchedule: payload.openingSchedule || [],
        gallery: (payload.gallery || []).slice(0, 6),
        galleryPositions: (payload.galleryPositions || []).slice(0, 6),
        followers: 0,
        shows: 0,
        rating: 0,
      };
      state.users.push(user);
      state.currentUserId = user.id;
      persist();
      return { user };
    },
    userById(id) { return state.users.find((u) => u.id === id); },
    updateUser(userId, updates) {
      const user = state.users.find((entry) => entry.id === userId);
      if (!user || userId !== state.currentUserId) return null;
      Object.assign(user, updates);
      persist();
      return user;
    },

    isFollowing(targetUserId, followerId = state.currentUserId) {
      return !!followerId && (state.follows[followerId] || []).includes(targetUserId);
    },

    toggleFollow(targetUserId) {
      const followerId = state.currentUserId;
      if (!followerId || followerId === targetUserId || !this.userById(targetUserId)) return false;
      const following = state.follows[followerId] || [];
      const index = following.indexOf(targetUserId);
      if (index >= 0) following.splice(index, 1);
      else following.push(targetUserId);
      state.follows[followerId] = following;
      persist();
      return index < 0;
    },

    followingOf(userId) {
      return (state.follows[userId] || [])
        .map((id) => this.userById(id))
        .filter(Boolean);
    },

    followersOf(userId) {
      return Object.keys(state.follows)
        .filter((followerId) => (state.follows[followerId] || []).includes(userId))
        .map((followerId) => this.userById(followerId))
        .filter(Boolean);
    },

    canCreatePost() {
      const user = this.currentUser();
      return !!user && (user.role === "musician" || user.role === "venue");
    },

    canManageEvents() {
      const user = this.currentUser();
      return !!user && (user.role === "musician" || user.role === "venue");
    },

    canManageEvent(event) {
      const user = this.currentUser();
      if (!user || !event || !this.canManageEvents()) return false;
      if (event.createdByUserId) return event.createdByUserId === user.id;
      return user.role === "musician"
        ? event.artistId === user.id
        : event.venueId === user.id;
    },

    canSendProposal(targetUserId) {
      const sender = this.currentUser();
      const target = this.userById(targetUserId);
      return !!sender && !!target && sender.id !== target.id &&
        ((sender.role === "venue" && target.role === "musician") ||
          (sender.role === "musician" && target.role === "venue"));
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
      if (!uid || !this.canCreatePost()) return null;
      const post = {
        id: "p_" + Date.now(),
        userId: uid,
        time: new Date().toISOString(),
        image: payload.images?.[0] || payload.image || "",
        images: payload.images || (payload.image ? [payload.image] : []),
        imagePositions: payload.imagePositions || [],
        attachments: payload.attachments || [],
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

    createEvent(payload) {
      const user = this.currentUser();
      if (!user || !this.canManageEvents()) return null;
      const event = {
        ...payload,
        id: "e_" + Date.now(),
        createdByUserId: user.id,
        artistId: user.role === "musician" ? user.id : (payload.artistId || ""),
        venueId: user.role === "venue" ? user.id : (payload.venueId || ""),
      };
      state.events.unshift(event);
      persist();
      return event;
    },

    updateEvent(eventId, updates) {
      const event = state.events.find((entry) => entry.id === eventId);
      const user = this.currentUser();
      if (!event || !user || !this.canManageEvent(event)) return null;
      const ownerId = event.createdByUserId || user.id;
      Object.assign(event, updates, {
        id: event.id,
        createdByUserId: ownerId,
        artistId: user.role === "musician" ? user.id : (updates.artistId || ""),
        venueId: user.role === "venue" ? user.id : (updates.venueId || ""),
      });
      persist();
      return event;
    },

    // Conversations
    conversationsFor(userId) {
      return state.conversations
        .filter((c) => c.participants.includes(userId))
        .sort((a, b) => {
          const la = a.messages[a.messages.length - 1]?.time || 0;
          const lb = b.messages[b.messages.length - 1]?.time || 0;
          return new Date(lb) - new Date(la);
        });
    },
    getOrCreateConversation(otherUserId) {
      const me = state.currentUserId;
      if (!me || me === otherUserId) return null;
      let c = state.conversations.find(
        (x) => x.participants.length === 2 && x.participants.includes(me) && x.participants.includes(otherUserId)
      );
      if (!c) {
        c = { id: "c_" + Date.now(), participants: [me, otherUserId], messages: [] };
        state.conversations.push(c);
        persist();
      }
      return c;
    },
    sendMessage(convId, text, attachments = []) {
      const me = state.currentUserId;
      const c = state.conversations.find((x) => x.id === convId);
      if (!c || (!text.trim() && !attachments.length)) return;
      c.messages.push({
        from: me,
        text: text.trim(),
        attachments,
        time: new Date().toISOString(),
      });
      persist();
      // Simulate reply after a bit
      const other = c.participants.find((p) => p !== me);
      const replies = [
        "Show, entendi! Vou verificar aqui.",
        "Bacana, vamos alinhar mais detalhes por aqui.",
        "Perfeito 🙌",
        "Combinado!",
        "Show, aguardo retorno.",
        "Manda no meu Whats pra fechar rápido.",
      ];
      setTimeout(() => {
        c.messages.push({ from: other, text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toISOString() });
        persist();
        // Notify UI
        window.dispatchEvent(new CustomEvent("sonora:message", { detail: { convId } }));
      }, 1400 + Math.random() * 1200);
    },

    // Tickets
    ticketsFor(userId) {
      return state.tickets.filter((t) => t.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    buyTicket(eventId, quantity, buyer) {
      const uid = state.currentUserId;
      if (!uid) return null;
      const ev = state.events.find((e) => e.id === eventId);
      if (!ev) return null;
      const code = ("BC-" + Math.random().toString(36).slice(2, 6) + "-" + Math.random().toString(36).slice(2, 6)).toUpperCase();
      const ticket = {
        id: "t_" + Date.now(),
        userId: uid,
        eventId,
        quantity,
        total: ev.price * quantity,
        code,
        buyer: buyer || {},
        createdAt: new Date().toISOString(),
        status: "confirmed",
      };
      state.tickets.push(ticket);
      persist();
      return ticket;
    },

    // Notifications
    notificationsFor(userId) {
      return state.notifications
        .filter((n) => n.forUserId === userId)
        .sort((a, b) => new Date(b.time) - new Date(a.time));
    },
    unreadCount(userId) {
      return state.notifications.filter((n) => n.forUserId === userId && !n.read).length;
    },
    markAllRead(userId) {
      state.notifications.forEach((n) => { if (n.forUserId === userId) n.read = true; });
      persist();
    },

    // Proposals
    saveProposal(prop) {
      if (!this.canSendProposal(prop.targetUserId)) return null;
      const conversation = this.getOrCreateConversation(prop.targetUserId);
      if (!conversation) return null;
      const p = {
        ...prop,
        fromUserId: state.currentUserId,
        id: "pr_" + Date.now(),
        status: "sent",
        createdAt: new Date().toISOString(),
      };
      state.proposals.push(p);
      conversation.messages.push({
        from: p.fromUserId,
        type: "proposal",
        proposalId: p.id,
        text: `Proposta de show · ${p.date} às ${p.time}`,
        time: p.createdAt,
      });
      // Send notification to target
      state.notifications.unshift({
        id: "n_" + Date.now(),
        type: "proposal",
        from: p.fromUserId,
        target: p.id,
        time: p.createdAt,
        read: false,
        forUserId: p.targetUserId,
      });
      persist();
      return p;
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
})();
