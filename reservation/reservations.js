const INITIAL_ROOMS = [
    { id: 1, name: 'Habitación Deluxe', description: 'Vista al mar o jardín, cama King, baño de lujo.', maxGuests: 2, beds: 1, pricePerNight: 250, amenities: ['wifi', 'minibar', 'tv', 'balcón'], image: '../Images/deluxe.jpg' },
    { id: 2, name: 'Habitación Estándar', description: 'Confort y funcionalidad al mejor precio.', maxGuests: 2, beds: 1, pricePerNight: 150, amenities: ['wifi', 'tv'], image: '../Images/estandar.jpg' },
    { id: 3, name: 'Suite Ejecutiva', description: 'Espacio de trabajo y terraza privada con jacuzzi.', maxGuests: 3, beds: 1, pricePerNight: 400, amenities: ['wifi', 'minibar', 'tv', 'jacuzzi'], image: '../Images/jacuzzi.jpg' },
    { id: 4, name: 'Habitación Familiar', description: 'Ideal para familias. Dos camas dobles y área de estar.', maxGuests: 4, beds: 2, pricePerNight: 300, amenities: ['wifi', 'tv', 'cocina'], image: '../Images/familiar.jpg' },
    { id: 5, name: 'Suite Presidencial', description: 'El máximo lujo y exclusividad, vistas panorámicas.', maxGuests: 5, beds: 2, pricePerNight: 800, amenities: ['wifi', 'minibar', 'tv', 'jacuzzi', 'balcón', 'servicio+concierge'], image: '../Images/presidencial.jpg' },
    { id: 6, name: 'Habitación Vista Ciudad', description: 'Vistas impresionantes de la ciudad, moderna y cómoda.', maxGuests: 2, beds: 1, pricePerNight: 200, amenities: ['wifi', 'tv', 'vista+panorámica'], image: '../Images/vistaciudad.jpg' },
    { id: 7, name: 'Habitación Spa', description: 'Diseñada para el relax, con sauna o baño turco privado.', maxGuests: 2, beds: 1, pricePerNight: 350, amenities: ['wifi', 'tv', 'sauna'], image: '../Images/spa.jpg' },
    { id: 8, name: 'Suite de Lujo', description: 'Espacio amplio, acabados de primera y sala de estar.', maxGuests: 3, beds: 1, pricePerNight: 500, amenities: ['wifi', 'minibar', 'tv', 'sala+estar'], image: '../Images/suite.jpg' },
];

const iconMap = { 
    wifi: 'fa-wifi', 
    minibar: 'fa-cocktail', 
    tv: 'fa-tv', 
    jacuzzi: 'fa-hot-tub', 
    balcón: 'fa-door-open',
    'vista+panorámica': 'fa-mountain-sun',
    sauna: 'fa-steam',
    'servicio+concierge': 'fa-bell',
    'sala+estar': 'fa-couch',
    'cocina': 'fa-kitchen-set'
};

const DB = {
    _getData: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || null;
        } catch (e) {
            console.error("Error al parsear localStorage para", key, ":", e);
            return null;
        }
    },
    _setData: (key, data) => localStorage.setItem(key, JSON.stringify(data)),

    init: function() {
        console.log("Initializing DB...");
        if (!this._getData('rooms')) {
            console.log("Initializing rooms with default data:", INITIAL_ROOMS);
            this._setData('rooms', INITIAL_ROOMS);
        }
        if (!this._getData('users')) {
            this._setData('users', [
                // Usuario de administrador para pruebas
                { id: 1, idNumber: 'admin', fullName: 'Administrador', nationality: 'Local', email: 'admin@hotel.com', phone: '000', password: 'admin123', isAdmin: true } 
            ]);
        }
        if (!this._getData('reservations')) {
            console.log("Initializing reservations as empty array");
            this._setData('reservations', []);
        }
        console.log("DB initialized. Current data loaded.");
    },
    getUsers: function() { return this._getData('users') || []; },
    saveUser: function(user) {
        const users = this.getUsers();
        user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        users.push(user);
        this._setData('users', users);
        return user;
    },
    findUserByEmail: function(email) {
        return this.getUsers().find(user => user.email === email);
    },
    findUserByCredentials: function(email, password) {
        return this.getUsers().find(user => user.email === email && user.password === password);
    },
    getRooms: function() { return this._getData('rooms') || []; },
    getRoomById: function(id) { return this.getRooms().find(r => r.id === parseInt(id)); },
    getReservations: function() { return this._getData('reservations') || []; },
    saveReservation: function(res) {
        const reservations = this.getReservations();
        res.id = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
        reservations.push(res);
        this._setData('reservations', reservations);
        return res;
    },
    deleteReservation: function(id) {
        let reservations = this.getReservations();
        reservations = reservations.filter(res => res.id !== parseInt(id));
        this._setData('reservations', reservations);
    }
};

const Auth = {
    currentUser: null,
    init: function() {
        const user = DB._getData('currentUser');
        if(user) {
            this.currentUser = user;
        }
    },
    login: function(email, password) {
        const user = DB.findUserByCredentials(email, password);
        if (user) {
            this.currentUser = user;
            DB._setData('currentUser', user);
            return true;
        }
        return false;
    },
    register: function(userData) {
        if (DB.findUserByEmail(userData.email)) {
            return { success: false, message: 'El correo electrónico ya está registrado.' };
        }
        const newUser = DB.saveUser(userData);
        this.currentUser = newUser;
        DB._setData('currentUser', newUser);
        return { success: true, user: newUser };
    },
    logout: function() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    },
    isLoggedIn: function() {
        return this.currentUser !== null;
    },
    isAdmin: function() {
        return this.isLoggedIn() && this.currentUser.isAdmin;
    }
};

const Reservations = {
    /**
     * Verifica si una habitación está disponible para un rango de fechas.
     * La comprobación se hace a nivel de día completo (medianoche).
     */
    isRoomAvailable: function(roomId, checkIn, checkOut) {
        const reservations = DB.getReservations();
        // Usar 'T00:00:00' para asegurar la comparación de fechas a medianoche y evitar problemas de zona horaria.
        const newCheckIn = new Date(checkIn + 'T00:00:00'); 
        const newCheckOut = new Date(checkOut + 'T00:00:00'); 
        
        // Comprobar si hay alguna reserva existente que se solape con el nuevo rango.
        const isConflicting = reservations.some(res => {
            if (res.roomId !== parseInt(roomId)) return false;

            const existingCheckIn = new Date(res.checkIn + 'T00:00:00');
            const existingCheckOut = new Date(res.checkOut + 'T00:00:00');

            // Lógica de solapamiento: (InicioA < FinB) && (FinA > InicioB)
            // Se solapan si la nueva entrada es antes de la salida existente Y la nueva salida es después de la entrada existente.
            const overlap = newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
            return overlap;
        });
        
        // Si no hay ningún conflicto (isConflicting es false), la habitación está disponible.
        return !isConflicting;
    },
    
    /**
     * Busca habitaciones que cumplan con los criterios de huéspedes y disponibilidad de fechas.
     */
    findAvailableRooms: function(checkIn, checkOut, guests) {
        const allRooms = DB.getRooms();
        
        // 1. Filtrar por capacidad de huéspedes
        const suitableRooms = allRooms.filter(room => room.maxGuests >= guests);
        
        // 2. Filtrar por disponibilidad de fechas (usando la lógica corregida)
        const availableRooms = suitableRooms.filter(room => {
            return this.isRoomAvailable(room.id, checkIn, checkOut);
        });
        
        return availableRooms;
    },
    getReservationsByUser: function(userId) {
        // Filtra solo las reservas futuras o en curso
        const today = new Date().setHours(0, 0, 0, 0);
        return DB.getReservations().filter(res => 
            res.userId == userId && new Date(res.checkOut + 'T00:00:00').getTime() > today
        );
    }
};

const UI = {
    init: function() {
        this.setupEventListeners();
        this.setInitialDates();
        this.addAdminNavItem(); // Asegura el enlace de administración si es necesario
        this.updatePageView();
    },
    addAdminNavItem: function() {
        const navUl = document.querySelector('header nav ul');
        if (!document.getElementById('admin-nav-item')) {
            const adminLi = document.createElement('li');
            adminLi.innerHTML = '<a href="../admin/admin.html">Administración</a>';
            adminLi.id = 'admin-nav-item';
            adminLi.style.display = 'none';
            navUl.appendChild(adminLi);
        }
    },
    setInitialDates: function() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (date) => date.toISOString().split('T')[0];
        
        const todayStr = formatDate(today);
        const tomorrowStr = formatDate(tomorrow);
        
        const checkInInput = document.getElementById('checkIn');
        const checkOutInput = document.getElementById('checkOut');

        checkInInput.min = todayStr;
        checkOutInput.min = tomorrowStr;

        if (!checkInInput.value || new Date(checkInInput.value) < new Date(todayStr)) checkInInput.value = todayStr;
        if (!checkOutInput.value || new Date(checkOutInput.value) <= new Date(todayStr)) checkOutInput.value = tomorrowStr;
    },
    setupEventListeners: function() {
        document.getElementById('loginForm').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('registerForm').addEventListener('submit', this.handleRegister.bind(this));
        document.getElementById('logout-btn').addEventListener('click', this.handleLogout.bind(this));
        document.getElementById('availabilityForm').addEventListener('submit', this.handleSearch.bind(this));
        
        // Lógica de validación de fechas
        document.getElementById('checkIn').addEventListener('change', (e) => {
            const checkInDate = e.target.value;
            const checkOutInput = document.getElementById('checkOut');
            if (checkInDate) {
                const nextDay = new Date(new Date(checkInDate).setDate(new Date(checkInDate).getDate() + 1)).toISOString().split('T')[0];
                checkOutInput.min = nextDay;
                if (checkOutInput.value <= checkInDate) {
                    checkOutInput.value = nextDay;
                }
            }
        });
        
        document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', (e) => {
            document.querySelectorAll('nav a').forEach(navA => navA.classList.remove('active'));
            e.currentTarget.classList.add('active');
        }));
    },
    updatePageView: function() {
        const authContainer = document.getElementById('auth-container');
        const reservationsArea = document.getElementById('userReservationsArea');
        const adminNavItem = document.getElementById('admin-nav-item');

        if (Auth.isLoggedIn()) {
            authContainer.style.display = 'none';
            reservationsArea.style.display = 'block';
            
            document.getElementById('user-welcome-name').textContent = Auth.currentUser.fullName.split(' ')[0];
            document.getElementById('user-id-display').textContent = Auth.currentUser.id;

            this.renderMyReservations();
            // Ejecutar la búsqueda inicial con las fechas por defecto al iniciar sesión.
            this.handleSearch({ preventDefault: () => {} });

            if (adminNavItem) {
                adminNavItem.style.display = Auth.isAdmin() ? 'block' : 'none';
            }
        } else {
            authContainer.style.display = 'flex';
            reservationsArea.style.display = 'none';
            if (adminNavItem) {
                adminNavItem.style.display = 'none';
            }
        }
    },
    showAlert: function(message, isError = false) {
        const alertEl = document.getElementById('custom-alert');
        const messageEl = document.getElementById('custom-alert-message');
        
        messageEl.textContent = message;
        alertEl.className = `custom-alert`;
        alertEl.classList.add(isError ? 'bg-error' : 'bg-success'); // Clases definidas en tu CSS

        alertEl.classList.remove('hidden', 'translate-x-full', 'opacity-0');
        alertEl.classList.add('translate-x-0', 'opacity-100');
        
        setTimeout(() => {
            alertEl.classList.remove('translate-x-0', 'opacity-100');
            alertEl.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => { alertEl.classList.add('hidden'); }, 300);
        }, 3000);
    },
    handleLogin: function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        
        if (Auth.login(email, pass)) {
            this.showAlert('Inicio de sesión exitoso. Bienvenido.', false);
            document.getElementById('loginMessage').textContent = '';
            document.getElementById('loginForm').reset();
            this.updatePageView();
        } else {
            document.getElementById('loginMessage').textContent = 'Email o contraseña incorrectos.';
        }
    },
    handleRegister: function(e) {
        e.preventDefault();
        const userData = {
            idNumber: document.getElementById('idNumber').value,
            fullName: document.getElementById('fullName').value,
            nationality: document.getElementById('nationality').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value,
            isAdmin: false
        };
        
        const result = Auth.register(userData);
        
        if(result.success) {
            this.showAlert('¡Registro exitoso! Ya puedes reservar.', false);
            document.getElementById('registerMessage').textContent = '';
            e.target.reset();
            this.updatePageView();
        } else {
            document.getElementById('registerMessage').textContent = result.message;
        }
    },
    handleLogout: function() {
        Auth.logout();
        this.updatePageView();
        this.showAlert('Has cerrado sesión.', false);
        // Limpiar resultados de búsqueda al cerrar sesión
        document.getElementById('room-results-container').innerHTML = '';
        document.getElementById('reservation-list-container').innerHTML = '';
        document.getElementById('noMyReservationsMessage').style.display = 'block';
    },
    handleSearch: function(e) {
        if (e && e.preventDefault) e.preventDefault(); 
        
        const checkIn = document.getElementById('checkIn').value;
        const checkOut = document.getElementById('checkOut').value;
        const personsInput = document.getElementById('persons');
        const guests = parseInt(personsInput.value);
        
        // Validación de fechas
        if (new Date(checkIn) >= new Date(checkOut)) {
            if (e && e.preventDefault) { 
                this.showAlert('La fecha de salida debe ser posterior a la fecha de entrada.', true);
            }
            this.renderSearchResults([], checkIn, checkOut, guests); // Limpia los resultados si la fecha es inválida
            return; 
        }

        const availableRooms = Reservations.findAvailableRooms(checkIn, checkOut, guests);
        this.renderSearchResults(availableRooms, checkIn, checkOut, guests);
    },
    renderSearchResults: function(rooms, checkIn, checkOut, guests) {
        const container = document.getElementById('room-results-container');
        const noRoomsMessage = document.getElementById('noRoomsMessage');
        // Calcular la diferencia de noches
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1;

        if (rooms.length === 0) {
            container.innerHTML = '';
            noRoomsMessage.style.display = 'block';
            return;
        }
        
        noRoomsMessage.style.display = 'none';
        
        container.innerHTML = rooms.map(room => {
            const totalPrice = room.pricePerNight * nights;
            const availability = 'Disponible'; // Ya están filtradas, por lo que están disponibles.
            
            const amenitiesHTML = room.amenities.map(amenity => {
                const iconClass = iconMap[amenity] || 'fa-tag';
                const amenityName = amenity.replace('+', ' ');
                return `<i class="fas ${iconClass} mr-1 text-amber-700" title="${amenityName}"></i>`;
            }).join('');
            
            return `
                <figure class="feature-card">
                    <div class="feature-icon">
                        <img src="${room.image}" alt="${room.name}" onerror="this.src='https://placehold.co/400x200/94A3B8/FFFFFF?text=${room.name.replace(/\s/g, '+')}'"/>
                    </div>
                    <figcaption>
                        <h3>${room.name}</h3>
                        <p class="text-sm text-stone-600">${room.description}</p>
                        <p class="mt-2 mb-3">
                            <span class="font-bold text-lg text-amber-700">USD $${room.pricePerNight}</span>/noche
                            <br>
                            <span class="text-sm text-stone-500">Total por ${nights} noches: <span class="font-bold">USD $${totalPrice.toLocaleString('es-CO')}</span></span>
                        </p>
                        <p class="text-sm mb-3">${amenitiesHTML}</p>
                        <div class="card-actions">
                            <span class="availability ${availability.toLowerCase()}">${availability}</span>
                            <button class="reserve-btn" data-room-id="${room.id}" data-check-in="${checkIn}" data-check-out="${checkOut}" data-total-price="${totalPrice}" data-guests="${guests}"><i class="fas fa-bookmark"></i> Reservar Ahora</button>
                        </div>
                    </figcaption>
                </figure>
            `;
        }).join('');
        
        document.querySelectorAll('.reserve-btn').forEach(btn => {
            btn.addEventListener('click', this.handleBookingConfirmation.bind(this));
        });
    },
    handleBookingConfirmation: function(e) {
        const { roomId, checkIn, checkOut, totalPrice, guests } = e.currentTarget.dataset;
        
        const room = DB.getRoomById(roomId);
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

        if (!window.confirm(`¿Confirmas la reserva de la ${room.name} por ${nights} noche(s) por USD $${parseFloat(totalPrice).toLocaleString('es-CO')} del ${checkIn} al ${checkOut}?`)) {
            return;
        }
        
        // Re-verificar disponibilidad justo antes de reservar
        if (!Reservations.isRoomAvailable(roomId, checkIn, checkOut)) {
            this.showAlert('La habitación ya no está disponible. Por favor, realiza la búsqueda de nuevo.', true);
            this.handleSearch({ preventDefault: () => {} });
            return;
        }
        
        const reservationData = {
            roomId: parseInt(roomId),
            userId: Auth.currentUser.id,
            checkIn,
            checkOut,
            totalPrice: parseFloat(totalPrice),
            guests: parseInt(guests),
            status: 'Confirmada'
        };
        
        DB.saveReservation(reservationData);
        this.showAlert('¡Reserva confirmada exitosamente!', false);
        
        this.renderMyReservations();
        this.handleSearch({ preventDefault: () => {} }); // Re-ejecuta la búsqueda para quitar la habitación de los resultados
    },
    renderMyReservations: function() {
        const container = document.getElementById('reservation-list-container');
        const noReservationsMessage = document.getElementById('noMyReservationsMessage');
        const userReservations = Reservations.getReservationsByUser(Auth.currentUser.id);

        if (userReservations.length === 0) {
            container.innerHTML = '';
            noReservationsMessage.style.display = 'block';
            return;
        }
        
        noReservationsMessage.style.display = 'none';
        
        container.innerHTML = userReservations.map(res => {
            const room = DB.getRoomById(res.roomId);
            const nights = Math.ceil((new Date(res.checkOut) - new Date(res.checkIn)) / (1000 * 60 * 60 * 24));

            return `
                <li class="flex flex-col md:flex-row md:justify-between md:items-center reservation-item p-4 mb-3 rounded-xl shadow-sm border border-stone-200 bg-white">
                    <div class="reservation-details mb-2 md:mb-0">
                        <strong>Reserva #${res.id} - ${room.name} (${nights} Noche${nights > 1 ? 's' : ''})</strong>
                        <p class="text-sm text-stone-600">
                            <i class="fas fa-calendar-alt mr-1"></i> Fechas: ${res.checkIn} - ${res.checkOut} 
                            | <i class="fas fa-users mr-1"></i> Huéspedes: ${res.guests}
                        </p>
                        <p class="text-sm">Total: <span class="font-bold text-amber-800">USD $${res.totalPrice.toLocaleString('es-CO')}</span> | Estado: <span class="font-semibold text-green-700">${res.status}</span></p>
                    </div>
                    <div class="reservation-actions mt-2 md:mt-0">
                        <button class="bg-red-100 text-red-700 hover:bg-red-200 cancel-reservation-btn p-2 rounded-lg text-sm transition" data-res-id="${res.id}"><i class="fas fa-times-circle"></i> Cancelar</button>
                    </div>
                </li>
            `;
        }).join('');
        
        document.querySelectorAll('.cancel-reservation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const resId = e.currentTarget.dataset.resId;
                if(window.confirm('¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.')) {
                    DB.deleteReservation(resId);
                    this.showAlert('Reserva cancelada y habitación liberada.', true);
                    this.renderMyReservations();
                    this.handleSearch({ preventDefault: () => {} }); 
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Page loaded. Initializing application...");
    DB.init();
    Auth.init();
    UI.init();
});