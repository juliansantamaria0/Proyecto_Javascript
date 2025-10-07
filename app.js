// app.js

// Simulación de datos iniciales
const initialRooms = [
    { id: 1, beds: 2, maxPersons: 4, pricePerNight: 100, services: ['internet', 'minibar'] },
    { id: 2, beds: 1, maxPersons: 2, pricePerNight: 80, services: ['internet'] },
    { id: 3, beds: 3, maxPersons: 6, pricePerNight: 150, services: ['internet', 'minibar', 'jacuzzi'] }
];

if (!localStorage.getItem('rooms')) {
    localStorage.setItem('rooms', JSON.stringify(initialRooms));
}

if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

if (!localStorage.getItem('reservations')) {
    localStorage.setItem('reservations', JSON.stringify([]));
}

// Admin credenciales hardcodeadas por simplicidad
const adminUsername = 'admin';
const adminPassword = 'admin';

// Funciones helpers
function getRooms() {
    return JSON.parse(localStorage.getItem('rooms')) || [];
}

function saveRooms(rooms) {
    localStorage.setItem('rooms', JSON.stringify(rooms));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getReservations() {
    return JSON.parse(localStorage.getItem('reservations')) || [];
}

function saveReservations(reservations) {
    localStorage.setItem('reservations', JSON.stringify(reservations));
}

function isAvailable(roomId, checkIn, checkOut) {
    const reservations = getReservations();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    return !reservations.some(res => 
        res.roomId === roomId && res.status === 'active' &&
        !(new Date(res.checkOut) <= checkInDate || new Date(res.checkIn) >= checkOutDate)
    );
}

function calculateTotalPrice(pricePerNight, checkIn, checkOut, persons) {
    const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return pricePerNight * nights * (persons > 2 ? 1.2 : 1); // Ejemplo simple
}

// Lógica por página
if (document.querySelector('.landing')) {
    // Carrusel en index.html
    const carouselInner = document.querySelector('.carousel-inner');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentIndex = 0;
    
    function showSlide(index) {
        const slides = carouselInner.children;
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        carouselInner.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }
    
    prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
    showSlide(0);
}

if (document.querySelector('.reservations') || document.querySelector('.auth')) {
    // Lógica de reservas
    const authSection = document.querySelector('.auth');
    const reservationsSection = document.querySelector('.reservations');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const availabilityForm = document.getElementById('availabilityForm');
    const availableRoomsDiv = document.getElementById('availableRooms');
    const myReservationsDiv = document.getElementById('myReservations');
    
    let currentUser = null;
    
    if (localStorage.getItem('currentUser')) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        authSection.style.display = 'none';
        reservationsSection.style.display = 'block';
        loadMyReservations();
    }
    
    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        const idNumber = document.getElementById('idNumber').value;
        const users = getUsers();
        if (users.find(u => u.idNumber === idNumber)) {
            alert('Usuario ya registrado');
            return;
        }
        const newUser = {
            idNumber,
            fullName: document.getElementById('fullName').value,
            nationality: document.getElementById('nationality').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value
        };
        users.push(newUser);
        saveUsers(users);
        alert('Registro exitoso');
    });
    
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const idNumber = document.getElementById('loginIdNumber').value;
        const password = document.getElementById('loginPassword').value;
        const users = getUsers();
        const user = users.find(u => u.idNumber === idNumber && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            authSection.style.display = 'none';
            reservationsSection.style.display = 'block';
            loadMyReservations();
        } else {
            alert('Credenciales inválidas');
        }
    });
    
    availabilityForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!currentUser) {
            alert('Debes iniciar sesión');
            return;
        }
        const checkIn = document.getElementById('checkIn').value;
        const checkOut = document.getElementById('checkOut').value;
        const persons = parseInt(document.getElementById('persons').value);
        
        const rooms = getRooms();
        const availableRooms = rooms.filter(room => room.maxPersons >= persons && isAvailable(room.id, checkIn, checkOut));
        
        availableRoomsDiv.innerHTML = '';
        availableRooms.forEach(room => {
            const card = document.createElement('div');
            card.classList.add('room-card');
            card.innerHTML = `
                <p>Camas: ${room.beds}</p>
                <p>Máx Personas: ${room.maxPersons}</p>
                <p>Precio por Noche: $${room.pricePerNight}</p>
                <p>Servicios: ${room.services.join(', ')}</p>
                <p>Total: $${calculateTotalPrice(room.pricePerNight, checkIn, checkOut, persons)}</p>
                <button onclick="reserveRoom(${room.id}, '${checkIn}', '${checkOut}', ${persons})">Reservar</button>
            `;
            availableRoomsDiv.appendChild(card);
        });
    });
    
    window.reserveRoom = function(roomId, checkIn, checkOut, persons) {
        if (isAvailable(roomId, checkIn, checkOut)) {
            const reservations = getReservations();
            const newRes = {
                id: reservations.length + 1,
                roomId,
                userId: currentUser.idNumber,
                checkIn,
                checkOut,
                persons,
                totalPrice: calculateTotalPrice(getRooms().find(r => r.id === roomId).pricePerNight, checkIn, checkOut, persons),
                status: 'active'
            };
            reservations.push(newRes);
            saveReservations(reservations);
            alert('Reserva exitosa');
            loadMyReservations();
        } else {
            alert('Habitación no disponible');
        }
    };
    
    function loadMyReservations() {
        const reservations = getReservations().filter(res => res.userId === currentUser.idNumber && res.status === 'active');
        myReservationsDiv.innerHTML = '';
        reservations.forEach(res => {
            const card = document.createElement('div');
            card.classList.add('room-card');
            card.innerHTML = `
                <p>Habitación ID: ${res.roomId}</p>
                <p>Entrada: ${res.checkIn}</p>
                <p>Salida: ${res.checkOut}</p>
                <p>Personas: ${res.persons}</p>
                <p>Total: $${res.totalPrice}</p>
                <button onclick="cancelReservation(${res.id})">Cancelar</button>
            `;
            myReservationsDiv.appendChild(card);
        });
    }
    
    window.cancelReservation = function(resId) {
        let reservations = getReservations();
        const res = reservations.find(r => r.id === resId);
        if (res) {
            res.status = 'cancelled';
            saveReservations(reservations);
            alert('Reserva cancelada');
            loadMyReservations();
        }
    };
}

if (document.querySelector('.admin')) {
    // Lógica de admin
    const adminLoginForm = document.getElementById('adminLoginForm');
    const manageRoomsSection = document.querySelector('.manage-rooms');
    const manageReservationsSection = document.querySelector('.manage-reservations');
    const roomForm = document.getElementById('roomForm');
    const roomsListDiv = document.getElementById('roomsList');
    const allReservationsDiv = document.getElementById('allReservations');
    
    let isAdminLogged = false;
    
    if (localStorage.getItem('isAdminLogged') === 'true') {
        isAdminLogged = true;
        adminLoginForm.style.display = 'none';
        manageRoomsSection.style.display = 'block';
        manageReservationsSection.style.display = 'block';
        loadRooms();
        loadAllReservations();
    }
    
    adminLoginForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        if (username === adminUsername && password === adminPassword) {
            isAdminLogged = true;
            localStorage.setItem('isAdminLogged', 'true');
            adminLoginForm.style.display = 'none';
            manageRoomsSection.style.display = 'block';
            manageReservationsSection.style.display = 'block';
            loadRooms();
            loadAllReservations();
        } else {
            alert('Credenciales inválidas');
        }
    });
    
    roomForm.addEventListener('submit', e => {
        e.preventDefault();
        const roomId = document.getElementById('roomId').value;
        const beds = parseInt(document.getElementById('beds').value);
        const maxPersons = parseInt(document.getElementById('maxPersons').value);
        const pricePerNight = parseInt(document.getElementById('pricePerNight').value);
        const services = document.getElementById('services').value.split(',').map(s => s.trim());
        
        let rooms = getRooms();
        if (roomId) {
            // Editar
            const index = rooms.findIndex(r => r.id == roomId);
            if (index !== -1) {
                rooms[index] = { id: parseInt(roomId), beds, maxPersons, pricePerNight, services };
            }
        } else {
            // Agregar
            const newId = rooms.length ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
            rooms.push({ id: newId, beds, maxPersons, pricePerNight, services });
        }
        saveRooms(rooms);
        loadRooms();
        roomForm.reset();
        document.getElementById('roomId').value = '';
    });
    
    function loadRooms() {
        const rooms = getRooms();
        roomsListDiv.innerHTML = '';
        rooms.forEach(room => {
            const card = document.createElement('div');
            card.classList.add('room-card');
            card.innerHTML = `
                <p>ID: ${room.id}</p>
                <p>Camas: ${room.beds}</p>
                <p>Máx Personas: ${room.maxPersons}</p>
                <p>Precio: $${room.pricePerNight}</p>
                <p>Servicios: ${room.services.join(', ')}</p>
                <button onclick="editRoom(${room.id})">Editar</button>
                <button onclick="deleteRoom(${room.id})">Eliminar</button>
            `;
            roomsListDiv.appendChild(card);
        });
    }
    
    window.editRoom = function(id) {
        const rooms = getRooms();
        const room = rooms.find(r => r.id === id);
        if (room) {
            document.getElementById('roomId').value = room.id;
            document.getElementById('beds').value = room.beds;
            document.getElementById('maxPersons').value = room.maxPersons;
            document.getElementById('pricePerNight').value = room.pricePerNight;
            document.getElementById('services').value = room.services.join(',');
        }
    };
    
    window.deleteRoom = function(id) {
        let rooms = getRooms();
        rooms = rooms.filter(r => r.id !== id);
        saveRooms(rooms);
        loadRooms();
    };
    
    function loadAllReservations() {
        const reservations = getReservations();
        allReservationsDiv.innerHTML = '';
        reservations.forEach(res => {
            const card = document.createElement('div');
            card.classList.add('room-card');
            card.innerHTML = `
                <p>ID: ${res.id}</p>
                <p>Habitación: ${res.roomId}</p>
                <p>Usuario: ${res.userId}</p>
                <p>Entrada: ${res.checkIn}</p>
                <p>Salida: ${res.checkOut}</p>
                <p>Estado: ${res.status}</p>
                <button onclick="cancelAdminReservation(${res.id})">Cancelar</button>
            `;
            allReservationsDiv.appendChild(card);
        });
    }
    
    window.cancelAdminReservation = function(resId) {
        let reservations = getReservations();
        const res = reservations.find(r => r.id === resId);
        if (res) {
            res.status = 'cancelled';
            saveReservations(reservations);
            alert('Reserva cancelada');
            loadAllReservations();
        }
    };
}

// Para logout, pero no implementado por simplicidad. Se puede agregar botón para borrar localStorage 'currentUser' e 'isAdminLogged'
  // Simulación de lógica de administración (deberías integrarlo con tu app.js)
        document.addEventListener('DOMContentLoaded', () => {
            const adminLoginForm = document.getElementById('adminLoginForm');
            const adminDashboard = document.querySelector('.admin-dashboard');
            const loginMessage = document.getElementById('loginMessage');

            const sectionManageRooms = document.getElementById('sectionManageRooms');
            const sectionManageReservations = document.getElementById('sectionManageReservations');
            const sectionManageUsers = document.getElementById('sectionManageUsers');

            const cardManageRooms = document.getElementById('cardManageRooms');
            const cardManageReservations = document.getElementById('cardManageReservations');
            const cardManageUsers = document.getElementById('cardManageUsers');

            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('adminUsername').value;
                const password = document.getElementById('adminPassword').value;

                // Credenciales simples para demostración. ¡En un entorno real, usa autenticación segura!
                if (username === 'admin' && password === 'admin') {
                    adminLoginForm.style.display = 'none';
                    adminDashboard.style.display = 'flex';
                    loginMessage.textContent = ''; // Limpiar mensaje de error
                } else {
                    loginMessage.textContent = 'Usuario o contraseña incorrectos.';
                }
            });

            // Manejar la visibilidad de las secciones al hacer clic en las tarjetas del dashboard
            cardManageRooms.addEventListener('click', () => {
                hideAllAdminSections();
                sectionManageRooms.style.display = 'block';
            });

            cardManageReservations.addEventListener('click', () => {
                hideAllAdminSections();
                sectionManageReservations.style.display = 'block';
            });

            cardManageUsers.addEventListener('click', () => {
                hideAllAdminSections();
                sectionManageUsers.style.display = 'block';
            });

            function hideAllAdminSections() {
                sectionManageRooms.style.display = 'none';
                sectionManageReservations.style.display = 'none';
                sectionManageUsers.style.display = 'none';
            }

        });

                // Simulación de lógica de autenticación y visualización de secciones
        document.addEventListener('DOMContentLoaded', () => {
            const registerForm = document.getElementById('registerForm');
            const loginForm = document.getElementById('loginForm');
            const userReservationsArea = document.getElementById('userReservationsArea');
            const registerMessage = document.getElementById('registerMessage');
            const loginMessage = document.getElementById('loginMessage');

            // Simulación de inicio de sesión/registro exitoso
            let isLoggedIn = false;

            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Aquí iría tu lógica real de registro (validación, envío a API, etc.)
                // Para la demo, simplemente simulamos un éxito.
                registerMessage.textContent = '¡Registro exitoso! Ya puedes iniciar sesión.';
                registerMessage.className = 'auth-message success';
                // Opcionalmente, puedes limpiar el formulario o redirigir
                registerForm.reset();
            });

            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const loginIdNumber = document.getElementById('loginIdNumber').value;
                const loginPassword = document.getElementById('loginPassword').value;

                // Simulación de credenciales (¡Usa autenticación real en producción!)
                if (loginIdNumber === '123' && loginPassword === 'password') {
                    loginMessage.textContent = 'Inicio de sesión exitoso.';
                    loginMessage.className = 'auth-message success';
                    isLoggedIn = true;
                    document.querySelector('.auth-container').style.display = 'none'; // Ocultar formularios de auth
                    userReservationsArea.style.display = 'block'; // Mostrar sección de reservas
                    // Cargar datos de reservas del usuario, habitaciones disponibles, etc.
                } else {
                    loginMessage.textContent = 'Número de identificación o contraseña incorrectos.';
                    loginMessage.className = 'auth-message error';
                }
            });

            // Lógica para la sección de disponibilidad y reservas (ejemplos)
            const availabilityForm = document.getElementById('availabilityForm');
            const availableRoomsDiv = document.getElementById('availableRooms');
            const roomsListContainer = availableRoomsDiv.querySelector('.room-card-container');
            const noRoomsMessage = document.getElementById('noRoomsMessage');

            availabilityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const checkInDate = document.getElementById('checkIn').value;
                const checkOutDate = document.getElementById('checkOut').value;
                const persons = document.getElementById('persons').value;

                // Aquí deberías realizar una llamada a tu API para buscar habitaciones
                // disponibles con estos criterios.
                console.log(`Buscando habitaciones desde ${checkInDate} hasta ${checkOutDate} para ${persons} personas.`);

                // Simulación de resultados de búsqueda (mostrar/ocultar tarjetas de ejemplo)
                if (checkInDate && checkOutDate && persons > 0) {
                    roomsListContainer.style.display = 'grid'; // Mostrar el contenedor de habitaciones
                    noRoomsMessage.style.display = 'none'; // Ocultar mensaje de no hay habitaciones
                    // En un caso real, aquí popularías `roomsListContainer` dinámicamente
                    // con las tarjetas de habitaciones encontradas.
                } else {
                    roomsListContainer.style.display = 'none'; // Ocultar habitaciones de ejemplo
                    noRoomsMessage.style.display = 'block'; // Mostrar mensaje de no hay habitaciones
                }
            });

            // Inicializar fechas con el día actual para evitar que estén vacías
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('checkIn').setAttribute('min', today);
            document.getElementById('checkOut').setAttribute('min', today);

            document.getElementById('checkIn').addEventListener('change', (e) => {
                document.getElementById('checkOut').setAttribute('min', e.target.value);
                if (document.getElementById('checkOut').value < e.target.value) {
                    document.getElementById('checkOut').value = e.target.value;
                }
            });
        });