// =====================================================
// Hotel El Rincón del Carmen — Core Storage & Models
// All data persisted in localStorage (simulation only)
// =====================================================

/**
 * LINE-BY-LINE DOCS:
 * 1. Small helpers around JSON/localStorage to avoid try/catch at call sites.
 * 2. Model factories for users, rooms, reservations.
 * 3. Business rules:
 *    - Only ADMIN can cancel/modify reservations.
 *    - No date overlap per room.
 *    - Assign rooms that match capacity and filters.
 * 4. Seed initial demo data (first-run only).
 */

// --- 1) Storage helpers ---
const LS = {
  get(key, fallback) {
    // read JSON or return fallback
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// --- 2) Model factories ---
const nowIso = () => new Date().toISOString();

function makeUser({ id, name, nation, email, phone, password, role = 'USER' }) {
  return { id, name, nation, email, phone, password, role, createdAt: nowIso() };
}

function makeRoom({ id, name, beds, maxPeople, priceNight, features = [] , photo=''}) {
  return { id, name, beds, maxPeople, priceNight, features, photo, createdAt: nowIso() };
}

function makeReservation({ id, roomId, userId, checkIn, checkOut, people, total, status='CONFIRMED' }) {
  return { id, roomId, userId, checkIn, checkOut, people, total, status, createdAt: nowIso() };
}

// --- 3) DB accessors ---
const DB = {
  users: () => LS.get('users', []),
  rooms: () => LS.get('rooms', []),
  reservations: () => LS.get('reservations', []),
  session: () => LS.get('session', { currentUserId: null }),

  saveUsers(list) { LS.set('users', list); },
  saveRooms(list) { LS.set('rooms', list); },
  saveReservations(list) { LS.set('reservations', list); },
  saveSession(s) { LS.set('session', s); },
};

// --- 4) Auth API ---
const Auth = {
  register(payload) {
    const users = DB.users();
    if (users.some(u => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new Error('El correo ya está registrado.');
    }
    const user = makeUser(payload);
    users.push(user);
    DB.saveUsers(users);
    DB.saveSession({ currentUserId: user.id });
    return user;
  },
  login(email, password) {
    const users = DB.users();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error('Credenciales inválidas');
    DB.saveSession({ currentUserId: user.id });
    return user;
  },
  logout() {
    DB.saveSession({ currentUserId: null });
  },
  me() {
    const s = DB.session();
    return DB.users().find(u => u.id === s.currentUserId) || null;
  }
};

// --- 5) Room API ---
const Rooms = {
  list(filters = {}) {
    const all = DB.rooms();
    // Filter by capacity and feature tags
    return all.filter(r => {
      const okPeople = filters.people ? r.maxPeople >= Number(filters.people) : true;
      const okFeatures = filters.features && filters.features.length
        ? filters.features.every(f => r.features.includes(f))
        : true;
      return okPeople && okFeatures;
    });
  },
  upsert(room, actor) {
    // Only ADMIN
    if (!actor || actor.role !== 'ADMIN') throw new Error('Solo el administrador puede gestionar habitaciones.');
    const list = DB.rooms();
    const idx = list.findIndex(r => r.id === room.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...room };
    else list.push(room);
    DB.saveRooms(list);
    return room;
  },
  remove(id, actor) {
    if (!actor || actor.role !== 'ADMIN') throw new Error('Solo el administrador puede gestionar habitaciones.');
    DB.saveRooms(DB.rooms().filter(r => r.id !== id));
  }
};

// --- 6) Date helpers ---
const parseDate = s => new Date(s + 'T12:00:00'); // fix TZ
const nightsBetween = (a, b) => Math.max(1, Math.round((parseDate(b) - parseDate(a)) / 86_400_000));

function overlap(aStart, aEnd, bStart, bEnd) {
  // Two ranges overlap if start < otherEnd && otherStart < end
  return parseDate(aStart) < parseDate(bEnd) && parseDate(bStart) < parseDate(aEnd);
}

// --- 7) Reservations API ---
const Reservations = {
  computeTotal(room, checkIn, checkOut, people) {
    const nights = nightsBetween(checkIn, checkOut);
    return nights * room.priceNight; // flat price per room/night
  },

  isAvailable(roomId, checkIn, checkOut) {
    const resv = DB.reservations().filter(r => r.roomId === roomId && r.status === 'CONFIRMED');
    return !resv.some(r => overlap(r.checkIn, r.checkOut, checkIn, checkOut));
  },

  create({ roomId, userId, checkIn, checkOut, people }) {
    // Verify availability in real-time
    if (!this.isAvailable(roomId, checkIn, checkOut)) {
      throw new Error('La habitación ya no está disponible para ese rango de fechas.');
    }
    const room = DB.rooms().find(r => r.id === roomId);
    if (!room) throw new Error('Habitación no encontrada.');
    if (people > room.maxPeople) throw new Error('Personas supera la capacidad de la habitación.');

    const total = this.computeTotal(room, checkIn, checkOut, people);
    const id = crypto.randomUUID();
    const res = makeReservation({ id, roomId, userId, checkIn, checkOut, people, total });
    const list = DB.reservations();
    list.push(res);
    DB.saveReservations(list);
    return res;
  },

  // Users cannot cancel; only admin can change status or delete
  cancel(resId, actor) {
    if (!actor || actor.role !== 'ADMIN') throw new Error('Solo el administrador puede cancelar reservas.');
    const list = DB.reservations();
    const idx = list.findIndex(r => r.id === resId);
    if (idx < 0) throw new Error('Reserva no encontrada.');
    list[idx].status = 'CANCELLED';
    DB.saveReservations(list);
  },
  remove(resId, actor) {
    if (!actor || actor.role !== 'ADMIN') throw new Error('Solo el administrador puede eliminar reservas.');
    DB.saveReservations(DB.reservations().filter(r => r.id !== resId));
  }
};

// --- 8) Seed (first run) ---
(function seed() {
  if (!localStorage.getItem('seed_v2')) {
    const demoAdmin = makeUser({
      id: 'admin-1', name: 'Admin Rincón', nation: 'CO',
      email: 'admin@rincon.com', phone: '+57 3000000000',
      password: 'admin123', role: 'ADMIN'
    });

    const demoRooms = [
      makeRoom({ id:'std-1', name:'Estandar', beds:1, maxPeople:2, priceNight:180000, features:['wifi','tv','minibar'], photo:'Images/estandar.jpg' }),
      makeRoom({ id:'dlx-1', name:'Deluxe', beds:2, maxPeople:4, priceNight:320000, features:['wifi','tv','jacuzzi','minibar'], photo:'Images/premiun.jpg' }),
      makeRoom({ id:'fam-1', name:'Familiar', beds:3, maxPeople:6, priceNight:420000, features:['wifi','tv','kitchen'], photo:'Images/familiar.jpg' }),
      makeRoom({ id:'city-1', name:'Vista Ciudad', beds:1, maxPeople:2, priceNight:260000, features:['wifi','tv','balcony'], photo:'Images/vistaciudad.jpg' }),
    ];

    DB.saveUsers([demoAdmin]);
    DB.saveRooms(demoRooms);
    DB.saveReservations([]);
    DB.saveSession({ currentUserId: null });
    localStorage.setItem('seed_v2', 'true');
  }
})();

// Expose to window for modules without bundler
window.HotelCore = { LS, Auth, Rooms, Reservations, DB, nightsBetween };
