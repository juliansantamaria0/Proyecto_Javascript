// =====================================================
// Hotel El Rincón del Carmen — Núcleo de Almacenamiento y Modelos
// Todos los datos se guardan en localStorage (solo simulación)
// =====================================================

/**
 * DOCUMENTACIÓN LÍNEA POR LÍNEA:
 * 1. Pequeños ayudantes para manejar JSON/localStorage sin usar try/catch en cada llamada.
 * 2. Fábricas de modelos para usuarios, habitaciones y reservas.
 * 3. Reglas de negocio:
 *    - Solo el ADMIN puede cancelar o modificar reservas.
 *    - No se permiten reservas superpuestas por habitación.
 *    - Asignar habitaciones que coincidan con la capacidad y los filtros.
 * 4. Carga de datos de demostración (solo la primera ejecución).
 */

// --- 1) Ayudantes de almacenamiento ---
const LS = {
  get(key, fallback) {
    // leer JSON o devolver valor por defecto
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// --- 2) Fábricas de modelos ---
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

// --- 3) Accesores de base de datos ---
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

// --- 4) API de autenticación ---
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

// --- 5) API de habitaciones ---
const Rooms = {
  list(filters = {}) {
    const all = DB.rooms();
    // Filtrar por capacidad y características
    return all.filter(r => {
      const okPeople = filters.people ? r.maxPeople >= Number(filters.people) : true;
      const okFeatures = filters.features && filters.features.length
        ? filters.features.every(f => r.features.includes(f))
        : true;
      return okPeople && okFeatures;
    });
  },
  upsert(room, actor) {
    // Solo ADMIN
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

// --- 6) Ayudantes de fecha ---
const parseDate = s => new Date(s + 'T12:00:00'); // corregir zona horaria
const nightsBetween = (a, b) => Math.max(1, Math.round((parseDate(b) - parseDate(a)) / 86_400_000));

function overlap(aStart, aEnd, bStart, bEnd) {
  // Dos rangos se superponen si inicio < otroFin && otroInicio < fin
  return parseDate(aStart) < parseDate(bEnd) && parseDate(bStart) < parseDate(aEnd);
}

// --- 7) API de reservas ---
const Reservations = {
  computeTotal(room, checkIn, checkOut, people) {
    const nights = nightsBetween(checkIn, checkOut);
    return nights * room.priceNight; // precio fijo por habitación/noche
  },

  isAvailable(roomId, checkIn, checkOut) {
    const resv = DB.reservations().filter(r => r.roomId === roomId && r.status === 'CONFIRMED');
    return !resv.some(r => overlap(r.checkIn, r.checkOut, checkIn, checkOut));
  },

  create({ roomId, userId, checkIn, checkOut, people }) {
    // Verificar disponibilidad en tiempo real
    if (!this.isAvailable(roomId, checkIn, checkOut)) {
      throw new Error('La habitación ya no está disponible para ese rango de fechas.');
    }
    const room = DB.rooms().find(r => r.id === roomId);
    if (!room) throw new Error('Habitación no encontrada.');
    if (people > room.maxPeople) throw new Error('El número de personas supera la capacidad de la habitación.');

    const total = this.computeTotal(room, checkIn, checkOut, people);
    const id = crypto.randomUUID();
    const res = makeReservation({ id, roomId, userId, checkIn, checkOut, people, total });
    const list = DB.reservations();
    list.push(res);
    DB.saveReservations(list);
    return res;
  },

  // Los usuarios no pueden cancelar; solo el administrador puede cambiar estado o eliminar
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

// --- 8) Datos iniciales (primera ejecución) ---
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

// Exponer al objeto global window para módulos sin empaquetador
window.HotelCore = { LS, Auth, Rooms, Reservations, DB, nightsBetween };
