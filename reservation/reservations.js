const INITIAL_ROOMS = [
            { id: 1, name: 'Habitación Deluxe', description: 'Vista al mar o jardín, cama King, baño de lujo.', maxGuests: 2, beds: 1, pricePerNight: 250, amenities: ['wifi', 'minibar', 'tv', 'balcón'], image: 'https://placehold.co/600x400/0000FF/FFFFFF?text=Deluxe+Room' },
            { id: 2, name: 'Habitación Estándar', description: 'Confort y funcionalidad al mejor precio.', maxGuests: 2, beds: 1, pricePerNight: 150, amenities: ['wifi', 'tv'], image: 'https://placehold.co/600x400/059669/FFFFFF?text=Standard+Room' },
            { id: 3, name: 'Suite Ejecutiva', description: 'Espacio de trabajo y terraza privada con jacuzzi.', maxGuests: 3, beds: 1, pricePerNight: 400, amenities: ['wifi', 'minibar', 'tv', 'jacuzzi'], image: 'https://placehold.co/600x400/EF4444/FFFFFF?text=Executive+Suite' },
            { id: 4, name: 'Habitación Familiar', description: 'Ideal para familias. Dos camas dobles y área de estar.', maxGuests: 4, beds: 2, pricePerNight: 300, amenities: ['wifi', 'tv', 'cocina'], image: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Family+Room' },
            { id: 5, name: 'Suite Presidencial', description: 'El máximo lujo y exclusividad, vistas panorámicas.', maxGuests: 5, beds: 2, pricePerNight: 800, amenities: ['wifi', 'minibar', 'tv', 'jacuzzi', 'balcón', 'servicio+concierge'], image: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Presidential+Suite' },
            { id: 6, name: 'Habitación Vista Ciudad', description: 'Vistas impresionantes de la ciudad, moderna y cómoda.', maxGuests: 2, beds: 1, pricePerNight: 200, amenities: ['wifi', 'tv', 'vista+panorámica'], image: 'https://placehold.co/600x400/14B8A6/FFFFFF?text=City+View' },
            { id: 7, name: 'Habitación Spa', description: 'Diseñada para el relax, con sauna o baño turco privado.', maxGuests: 2, beds: 1, pricePerNight: 350, amenities: ['wifi', 'tv', 'sauna'], image: 'https://placehold.co/600x400/EC4899/FFFFFF?text=Spa+Room' },
            { id: 8, name: 'Suite de Lujo', description: 'Espacio amplio, acabados de primera y sala de estar.', maxGuests: 3, beds: 1, pricePerNight: 500, amenities: ['wifi', 'minibar', 'tv', 'sala+estar'], image: 'https://placehold.co/600x400/94A3B8/FFFFFF?text=Luxury+Suite' },
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

        // Almacena la función de callback para el modal de confirmación
        let confirmCallback = null;

        // --- Funciones de Utilidad de Fechas ---
        const DateUtils = {
            /**
             * Convierte una fecha YYYY-MM-DD a un objeto Date a medianoche (para evitar problemas de zona horaria)
             * @param {string} dateString - Fecha en formato YYYY-MM-DD.
             * @returns {Date | null} Objeto Date UTC o null.
             */
            toMidnightDate: (dateString) => {
                if (!dateString) return null;
                // Usar el formato UTC para garantizar que la fecha se interprete correctamente como el inicio del día
                // Esto es crucial para comparaciones correctas en diferentes zonas horarias
                return new Date(dateString + 'T00:00:00Z');
            },
            /**
             * Devuelve la diferencia en días (noches) entre dos fechas YYYY-MM-DD
             * @param {string} checkIn - Fecha de entrada.
             * @param {string} checkOut - Fecha de salida.
             * @returns {number} Número de noches.
             */
            getNightCount: (checkIn, checkOut) => {
                const oneDay = 1000 * 60 * 60 * 24;
                const date1 = DateUtils.toMidnightDate(checkIn);
                const date2 = DateUtils.toMidnightDate(checkOut);
                
                if (!date1 || !date2) return 0;
                
                const diffTime = date2.getTime() - date1.getTime();
                // Usa Math.round para evitar problemas de DST, aunque con UTC debería ser exacto
                return Math.round(diffTime / oneDay);
            }
        };

        // --- Simulación de Base de Datos (localStorage) ---
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
                // Inicializar datos si no existen
                if (!this._getData('rooms')) {
                    this._setData('rooms', INITIAL_ROOMS);
                }
                if (!this._getData('users')) {
                    this._setData('users', [
                        // Usuario Administrador de Prueba (admin123)
                        { id: 1, idNumber: 'admin', fullName: 'Administrador Demo', nationality: 'Local', email: 'admin@hotel.com', phone: '000', password: 'admin123', isAdmin: true } 
                    ]);
                }
                if (!this._getData('reservations')) {
                    this._setData('reservations', []);
                }
            },
            getUsers: function() { return this._getData('users') || []; },
            saveUser: function(user) {
                const users = this.getUsers();
                // Asignar ID
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
                // Asignar ID
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

        // --- Módulo de Autenticación de Usuario ---
        const Auth = {
            currentUser: null,
            init: function() {
                // Cargar usuario de la sesión guardada
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

        // --- Lógica de Reservas ---
        const Reservations = {
            /**
             * Verifica si una habitación está disponible en un rango de fechas.
             */
            isRoomAvailable: function(roomId, checkIn, checkOut) {
                const reservations = DB.getReservations();
                const newCheckIn = DateUtils.toMidnightDate(checkIn); 
                const newCheckOut = DateUtils.toMidnightDate(checkOut); 
                
                const isConflicting = reservations.some(res => {
                    if (res.roomId !== parseInt(roomId)) return false;

                    const existingCheckIn = DateUtils.toMidnightDate(res.checkIn);
                    const existingCheckOut = DateUtils.toMidnightDate(res.checkOut);

                    // Conflicto si los rangos se superponen:
                    // La nueva reserva inicia antes de que termine la existente, Y termina después de que inicia la existente.
                    // Nota: Las fechas de salida son exclusivas (una salida el día X significa que está disponible a partir del día X).
                    const overlap = newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
                    return overlap;
                });
                
                return !isConflicting;
            },
            
            /**
             * Encuentra habitaciones disponibles según criterios de búsqueda.
             */
            findAvailableRooms: function(checkIn, checkOut, guests) {
                const allRooms = DB.getRooms();
                
                // 1. Filtrar por capacidad
                const suitableRooms = allRooms.filter(room => room.maxGuests >= guests);
                
                // 2. Filtrar por disponibilidad de fechas
                const availableRooms = suitableRooms.filter(room => {
                    return this.isRoomAvailable(room.id, checkIn, checkOut);
                });
                
                return availableRooms;
            },
            
            /**
             * Obtiene las reservas activas para un usuario.
             */
            getReservationsByUser: function(userId) {
                // Obtener la fecha de hoy a medianoche UTC
                const today = DateUtils.toMidnightDate(new Date().toISOString().split('T')[0]);
                
                // Solo devuelve reservas cuya fecha de salida es posterior a hoy (activa)
                return DB.getReservations().filter(res => 
                    res.userId == userId && DateUtils.toMidnightDate(res.checkOut) > today
                );
            }
        };

        // --- Interfaz de Usuario y Manejo de Eventos ---
        const UI = {
            init: function() {
                this.setupEventListeners();
                this.setInitialDates();
                this.addAdminNavItem(); 
                this.updatePageView();
            },
            
            addAdminNavItem: function() {
                const navUl = document.querySelector('header nav ul');
                if (navUl && !document.getElementById('admin-nav-item')) {
                    const adminLi = document.createElement('li');
                    // Nota: Mantenemos el enlace al archivo que el usuario pudo haber planeado crear
                    adminLi.innerHTML = '<a href="../admin/admin.html" class="hover:text-amber-400 transition">Administración</a>';
                    adminLi.id = 'admin-nav-item';
                    adminLi.classList.add('font-semibold');
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

                if (checkInInput && checkOutInput) { 
                    checkInInput.min = todayStr;
                    checkOutInput.min = tomorrowStr;

                    // Establecer valores iniciales si están vacíos o son inválidos
                    if (!checkInInput.value || DateUtils.toMidnightDate(checkInInput.value) < DateUtils.toMidnightDate(todayStr)) checkInInput.value = todayStr;
                    if (!checkOutInput.value || DateUtils.toMidnightDate(checkOutInput.value) <= DateUtils.toMidnightDate(todayStr)) checkOutInput.value = tomorrowStr;
                }
            },
            
            setupEventListeners: function() {
                // Forms
                document.getElementById('loginForm')?.addEventListener('submit', this.handleLogin.bind(this));
                document.getElementById('registerForm')?.addEventListener('submit', this.handleRegister.bind(this));
                document.getElementById('logout-btn')?.addEventListener('click', this.handleLogout.bind(this));
                document.getElementById('availabilityForm')?.addEventListener('submit', this.handleSearch.bind(this));

                // Modal Confirmation Buttons
                document.getElementById('confirm-yes-btn')?.addEventListener('click', this.handleConfirmYes.bind(this));
                document.getElementById('confirm-no-btn')?.addEventListener('click', this.handleConfirmNo.bind(this));

                // Delegación de eventos para los botones de Reserva y Cancelar
                document.getElementById('room-results-container')?.addEventListener('click', (e) => {
                    if (e.target.closest('.reserve-btn')) {
                        this.handleReservation(e);
                    }
                });
                
                document.getElementById('reservation-list-container')?.addEventListener('click', (e) => {
                    if (e.target.closest('.cancel-btn')) {
                        this.handleCancelReservation(e);
                    }
                });

                // Lógica de ajuste de fechas para que checkOut sea siempre > checkIn
                const checkInInput = document.getElementById('checkIn');
                const checkOutInput = document.getElementById('checkOut');
                
                if (checkInInput && checkOutInput) {
                    checkInInput.addEventListener('change', (e) => {
                        const checkInDate = e.target.value;
                        if (checkInDate) {
                            // Calcula el día siguiente
                            const checkInDateObj = DateUtils.toMidnightDate(checkInDate);
                            checkInDateObj.setDate(checkInDateObj.getDate() + 1);
                            const nextDay = checkInDateObj.toISOString().split('T')[0];

                            checkOutInput.min = nextDay;
                            // Si la fecha de salida es igual o anterior al nuevo check-in, la ajusta al día siguiente
                            if (checkOutInput.value <= checkInDate) {
                                checkOutInput.value = nextDay;
                            }
                        }
                    });
                }
            },

            // ====================================
            // Métodos de Confirmación Personalizados
            // ====================================
            showConfirm: function(message, callback) {
                const modal = document.getElementById('confirmation-modal');
                const backdrop = document.getElementById('backdrop');
                const msgEl = document.getElementById('confirm-message');
                if (!modal || !msgEl || !backdrop) return;

                msgEl.textContent = message;
                confirmCallback = callback; // Almacena la función a ejecutar

                modal.classList.remove('hidden');
                backdrop.classList.remove('hidden');
            },

            closeConfirm: function() {
                document.getElementById('confirmation-modal')?.classList.add('hidden');
                document.getElementById('backdrop')?.classList.add('hidden');
                confirmCallback = null;
            },

            handleConfirmYes: function() {
                if (confirmCallback) {
                    // Ejecuta el callback con 'true' (confirmado)
                    confirmCallback(true);
                }
                this.closeConfirm();
            },

            handleConfirmNo: function() {
                this.closeConfirm();
                // Opcional: Ejecutar callback con 'false' si la lógica lo requiere, pero para una cancelación simple, con cerrar es suficiente.
                if (confirmCallback) {
                     confirmCallback(false);
                }
            },

            // ====================================
            // Lógica de Vistas y Alertas
            // ====================================
            updatePageView: function() {
                const authContainer = document.getElementById('auth-container');
                const reservationsArea = document.getElementById('userReservationsArea');
                const adminNavItem = document.getElementById('admin-nav-item');

                if (Auth.isLoggedIn()) {
                    if (authContainer) authContainer.style.display = 'none';
                    if (reservationsArea) reservationsArea.style.display = 'block';
                    
                    document.getElementById('user-welcome-name').textContent = Auth.currentUser.fullName.split(' ')[0];
                    // Mostrar el ID completo del usuario, como es requerido para apps colaborativas
                    document.getElementById('user-id-display').textContent = Auth.currentUser.id;

                    this.renderMyReservations();
                    // Ejecuta la búsqueda inicial o un refresh
                    this.handleSearch({ preventDefault: () => {} }); 
                    
                    if (adminNavItem) adminNavItem.style.display = Auth.isAdmin() ? 'block' : 'none';
                } else {
                    if (authContainer) authContainer.style.display = 'grid'; // Mostrar como grid
                    if (reservationsArea) reservationsArea.style.display = 'none';
                    if (adminNavItem) adminNavItem.style.display = 'none';
                }
            },
            
            showAlert: function(message, isError = false) {
                const alertEl = document.getElementById('custom-alert');
                const messageEl = document.getElementById('custom-alert-message');
                
                if (!alertEl || !messageEl) return;
                
                messageEl.textContent = message;
                alertEl.className = `custom-alert ${isError ? 'bg-error' : 'bg-success'}`;
                alertEl.classList.remove('hidden');
                
                // Forzar el estado inicial para la transición
                alertEl.style.transform = 'translateX(100%)';
                alertEl.style.opacity = '0';

                // Mostrar con transición
                setTimeout(() => {
                    alertEl.style.transform = 'translateX(0)';
                    alertEl.style.opacity = '1';
                }, 10); 

                // Ocultar después de 3 segundos
                setTimeout(() => {
                    alertEl.style.transform = 'translateX(100%)';
                    alertEl.style.opacity = '0';
                    setTimeout(() => { alertEl.classList.add('hidden'); }, 300);
                }, 3000);
            },
            
            // ====================================
            // Manejo de Formularios
            // ====================================
            handleLogin: function(e) {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const pass = document.getElementById('loginPassword').value;
                const loginMessage = document.getElementById('loginMessage');
                
                if (Auth.login(email, pass)) {
                    this.showAlert('Inicio de sesión exitoso. Bienvenido.', false);
                    loginMessage.textContent = '';
                    e.target.reset();
                    this.updatePageView();
                } else {
                    loginMessage.textContent = 'Email o contraseña incorrectos.';
                }
            },
            
            handleRegister: function(e) {
                e.preventDefault();
                const registerMessage = document.getElementById('registerMessage');
                
                const userData = {
                    idNumber: document.getElementById('idNumber').value,
                    fullName: document.getElementById('fullName').value,
                    nationality: document.getElementById('nationality').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    password: document.getElementById('password').value,
                    isAdmin: false // Por defecto, no es administrador
                };
                
                const result = Auth.register(userData);
                
                if(result.success) {
                    this.showAlert('¡Registro exitoso! Ya puedes reservar.', false);
                    registerMessage.textContent = '';
                    e.target.reset();
                    this.updatePageView();
                } else {
                    registerMessage.textContent = result.message;
                }
            },
            
            handleLogout: function() {
                Auth.logout();
                this.updatePageView();
                this.showAlert('Has cerrado sesión.', false);
                // Limpiar resultados al cerrar sesión
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
                
                const nightCount = DateUtils.getNightCount(checkIn, checkOut);

                if (nightCount <= 0 || !checkIn || !checkOut || guests < 1) {
                    if (e && e.preventDefault) {
                         this.showAlert('Asegúrate de que la fecha de salida sea posterior a la de entrada y que haya al menos 1 huésped.', true);
                    }
                    this.renderSearchResults([], checkIn, checkOut, guests); 
                    return; 
                }

                const availableRooms = Reservations.findAvailableRooms(checkIn, checkOut, guests);
                this.renderSearchResults(availableRooms, checkIn, checkOut, guests);
            },
            
            // ====================================
            // Renderizado de Habitaciones
            // ====================================
            renderSearchResults: function(rooms, checkIn, checkOut, guests) {
                const container = document.getElementById('room-results-container');
                const noRoomsMessage = document.getElementById('noRoomsMessage');
                
                if (!container || !noRoomsMessage) return;

                container.innerHTML = '';

                if (rooms.length === 0) {
                    noRoomsMessage.style.display = 'block';
                    return;
                }

                noRoomsMessage.style.display = 'none';

                // Cálculo de noches para el costo
                const nightCount = DateUtils.getNightCount(checkIn, checkOut);

                rooms.forEach(room => {
                    const totalCost = (room.pricePerNight * nightCount).toFixed(2);
                    
                    const amenitiesHtml = room.amenities.map(a => {
                        const iconClass = iconMap[a] || 'fa-tag'; 
                        const name = a.replace('+', ' ');
                        return `<span class="text-sm flex items-center gap-1 text-stone-700"><i class="fas ${iconClass} text-amber-500"></i> ${name}</span>`;
                    }).join('');

                    const html = `
                        <figure class="feature-card">
                            <div class="feature-icon">
                                <img src="${room.image}" alt="${room.name}" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/600x400/94a3b8/FFFFFF?text=Imagen+No+Disp.'">
                            </div>
                            <figcaption>
                                <h3 class="text-xl font-semibold text-blue-900 mb-1">${room.name}</h3>
                                <p class="text-stone-600 mb-3 text-sm">${room.description}</p>
                                <div class="flex justify-between text-sm font-semibold text-stone-700 mb-3 border-b pb-2">
                                    <span><i class="fas fa-user-friends text-amber-500"></i> Máx. ${room.maxGuests}</span>
                                    <span><i class="fas fa-bed text-amber-500"></i> ${room.beds} Cama(s)</span>
                                </div>
                                
                                <div class="amenities-list my-3">
                                    ${amenitiesHtml}
                                </div>
                                
                                <div class="card-actions">
                                    <div class="cost">
                                        <p class="text-2xl font-bold text-green-700">$${totalCost} USD</p>
                                        <p class="text-xs text-stone-500">${nightCount} noches @ $${room.pricePerNight}/noche</p>
                                    </div>
                                    <button class="reserve-btn" 
                                        data-room-id="${room.id}"
                                        data-room-name="${room.name}"
                                        data-check-in="${checkIn}"
                                        data-check-out="${checkOut}"
                                        data-guests="${guests}"
                                        data-cost="${totalCost}">
                                        <i class="fas fa-bookmark"></i> Reservar
                                    </button>
                                </div>
                            </figcaption>
                        </figure>
                    `;
                    container.insertAdjacentHTML('beforeend', html);
                });
            },
            
            handleReservation: function(e) {
                const btn = e.target.closest('.reserve-btn');
                if (!btn) return;
                
                if (!Auth.isLoggedIn()) {
                    this.showAlert('Debes iniciar sesión para hacer una reserva.', true);
                    return;
                }

                const roomId = btn.dataset.roomId;
                const roomName = btn.dataset.roomName;
                const checkIn = btn.dataset.checkIn;
                const checkOut = btn.dataset.checkOut;
                const guests = parseInt(btn.dataset.guests);
                const totalCost = parseFloat(btn.dataset.cost);
                const roomData = DB.getRoomById(roomId);
                
                // Muestra el modal de confirmación personalizado
                this.showConfirm(
                    `¿Confirmas la reserva de la ${roomName} para ${guests} personas desde el ${checkIn} hasta el ${checkOut} por un total de $${totalCost} USD?`,
                    (confirmed) => {
                        if (confirmed) {
                            // Re-verificar disponibilidad justo antes de reservar
                            if (!Reservations.isRoomAvailable(roomId, checkIn, checkOut)) {
                                this.showAlert('Lo sentimos, esta habitación acaba de ser reservada.', true);
                                this.handleSearch({ preventDefault: () => {} }); // Refrescar resultados
                                return;
                            }
                            
                            const reservation = {
                                userId: Auth.currentUser.id,
                                roomId: parseInt(roomId),
                                roomName: roomName,
                                checkIn: checkIn,
                                checkOut: checkOut,
                                guests: guests,
                                totalCost: totalCost,
                                bookedAt: new Date().toISOString(),
                                roomPricePerNight: roomData.pricePerNight
                            };
                            
                            DB.saveReservation(reservation);
                            this.showAlert(`¡Reserva de ${roomName} confirmada!`, false);
                            this.updatePageView(); // Refresca las reservas del usuario y la búsqueda
                        }
                    }
                );
            },
            
            // ====================================
            // Renderizado de Mis Reservas
            // ====================================
            renderMyReservations: function() {
                const container = document.getElementById('reservation-list-container');
                const noReservationsMessage = document.getElementById('noMyReservationsMessage');
                
                if (!container || !noReservationsMessage) return;

                container.innerHTML = '';
                
                const myReservations = Reservations.getReservationsByUser(Auth.currentUser.id)
                    .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn)); // Ordena por fecha de entrada

                if (myReservations.length === 0) {
                    noReservationsMessage.style.display = 'block';
                    return;
                }

                noReservationsMessage.style.display = 'none';

                myReservations.forEach(res => {
                    const nightCount = DateUtils.getNightCount(res.checkIn, res.checkOut);
                    
                    const html = `
                        <li class="reservation-item">
                            <div class="reservation-details text-left">
                                <strong class="text-blue-800">${res.roomName}</strong>
                                <p class="text-sm text-stone-600 mt-1">
                                    <i class="fas fa-calendar-alt"></i> Del ${res.checkIn} al ${res.checkOut} 
                                </p>
                                <p class="text-sm text-stone-600">
                                    <i class="fas fa-moon"></i> (${nightCount} noches) | <i class="fas fa-users"></i> ${res.guests} Huéspedes
                                </p>
                                <p class="text-xl font-bold text-green-700 mt-2">Total: $${res.totalCost.toFixed(2)} USD</p>
                            </div>
                            <button class="cancel-btn transition" data-reservation-id="${res.id}">
                                <i class="fas fa-trash-alt"></i> Cancelar
                            </button>
                        </li>
                    `;
                    container.insertAdjacentHTML('beforeend', html);
                });
            },
            
            handleCancelReservation: function(e) {
                const btn = e.target.closest('.cancel-btn');
                if (!btn) return;
                
                const reservationId = btn.dataset.reservationId;
                
                // Muestra el modal de confirmación personalizado
                this.showConfirm(
                    '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.',
                    (confirmed) => {
                        if (confirmed) {
                            DB.deleteReservation(reservationId);
                            this.showAlert('Reserva cancelada exitosamente.', true);
                            this.updatePageView(); // Refresca la vista
                        }
                    }
                );
            }
        };

        // Inicialización de la Aplicación al cargar el DOM
        document.addEventListener('DOMContentLoaded', () => {
            DB.init();
            Auth.init();
            UI.init();
        }); 