# Autor
Julian Santamaria

# 🏨 Hotel El Rincón del Carmen

> Sistema de gestión hotelera completo con **HTML5 + CSS3 + JavaScript Vanilla**. Usa `localStorage` para persistencia sin backend.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**🌐 Demo en vivo:** [peaceful-snickerdoodle-aa64e3.netlify.app](https://peaceful-snickerdoodle-aa64e3.netlify.app)

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Netlify](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Reglas de Negocio](#-reglas-de-negocio)
- [Solución de Problemas](#-solución-de-problemas)
- [Contribuciones](#-contribuciones)
- [Licencia](#-licencia)

---
##  Netlify
peaceful-snickerdoodle-aa64e3.netlify.app

## 🎯 Descripción

Sistema web moderno tipo **SPA** para gestión integral de hotel. Implementa reservas con validación de disponibilidad, autenticación de usuarios, panel administrativo y catálogo de 8 tipos de habitaciones. Desarrollado con JavaScript vanilla sin frameworks, usando `localStorage` como persistencia.

### Entidades Gestionadas:

- 👤 **Usuarios**: Clientes y administradores con roles diferenciados
- 🛏️ **Habitaciones**: 8 tipos con servicios y capacidades diferentes
- 📅 **Reservas**: Sistema anti-solapamiento de fechas
- 📊 **Estadísticas**: Dashboard administrativo con métricas en tiempo real
- 💬 **Contacto**: Sistema de mensajería integrado

---

## ✨ Características

### Funcionalidades Principales

| Característica | Descripción |
|----------------|-------------|
| 🔐 **Autenticación** | Sistema de registro e inicio de sesión con roles (Usuario/Admin) |
| 🔍 **Búsqueda Inteligente** | Filtrado por fechas, capacidad y servicios incluidos |
| 📅 **Reservas en Tiempo Real** | Sistema anti-solapamiento de fechas automático |
| 👤 **Panel de Usuario** | Gestión personal de reservas activas |
| 🛡️ **Panel de Admin** | Dashboard completo con estadísticas y gestión total |
| 📱 **Diseño Responsivo** | Interfaz adaptable a móviles, tablets y desktop |
| 💾 **Persistencia Local** | Todos los datos se guardan en `localStorage` |
| ⚡ **Sin Backend** | Funciona 100% en el navegador (ideal para demos) |

---

## 🛠️ Tecnologías

### Stack Tecnológico

```javascript
// JavaScript ES6+ con módulos nativos
import { loadNavbar, loadFooter } from './assets/js/ui.js';
const session = JSON.parse(localStorage.getItem('session'));

// Funciones de persistencia
export function saveReservation(data) {
  const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
  reservations.push(data);
  localStorage.setItem('reservations', JSON.stringify(reservations));
}
```

**Tecnologías utilizadas:**
- **JavaScript ES6+**: Módulos, async/await, clases, destructuring
- **HTML5**: Estructura semántica y validaciones nativas
- **CSS3**: Grid, Flexbox, Variables CSS, Animaciones
- **LocalStorage API**: Persistencia de datos en el navegador
- **Responsive Design**: Mobile-first approach

**Herramientas de Desarrollo:**
- VS Code con Live Server
- Chrome/Firefox DevTools
- Git para control de versiones

---

## 📁 Estructura del Proyecto

```
📦 Hotel-El-Rincon-del-Carmen/
│
├── 📄 index.html                          # Página principal
├── 📄 README.md                           # Este archivo
│
├── 📁 assets/
│   ├── 📁 css/                            # Estilos modulares
│   │   ├── main.css                       # Variables globales y reset
│   │   ├── index.css
│   │   ├── disponibilidad.css
│   │   ├── contacto.css
│   │   ├── historia.css
│   │   ├── servicios.css
│   │   └── patrocinadores.css
│   │
│   └── 📁 js/                             # Lógica de negocio
│       ├── core.js                        # Modelos, reglas y persistencia
│       ├── ui.js                          # Componentes UI (navbar, footer)
│       ├── disponibilidad.js              # Motor de búsqueda
│       ├── rooms.js                       # Catálogo de habitaciones
│       ├── admin.js                       # Panel administrativo
│       ├── mis-reservas.js                # Gestión de reservas
│       ├── login.js                       # Autenticación
│       ├── register.js                    # Registro de usuarios
│       ├── contacto.js
│       ├── historia.js
│       ├── index.js
│       ├── servicios.js
│       └── patrocinadores.js
│
├── 📁 Habitaciones/                       # Catálogo de habitaciones
│   ├── rooms.html                         # Listado principal
│   ├── rooms.css
│   ├── habitaciones.css
│   ├── HabitacionEstandar.html
│   ├── Habitacion.Deluxe.html
│   ├── HabitacionFamiliar.html
│   ├── HabitacionSpa.html
│   ├── HabitacionVistaCiudad.html
│   ├── SuiteEjecutiva.html
│   ├── SuiteLujo.html
│   └── SuitePresidencial.html
│
├── 📁 Images/                             # Recursos visuales
│
└── 📁 pages/                              # Páginas del sitio
    ├── admin.html                         # Panel de administración
    ├── contacto.html
    ├── disponibilidad.html                # Búsqueda y reservas
    ├── historia.html
    ├── login.html
    ├── mis-reservas.html
    ├── patrocinadores.html
    ├── register.html
    └── servicios.html
```

---

## 🚀 Instalación

### Requisitos Previos

- ✅ Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- ✅ Editor de código (VS Code recomendado)
- ✅ Servidor HTTP local (por restricciones CORS)

### Paso 1: Clonar o Descargar

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/hotel-rincon-carmen.git
cd hotel-rincon-carmen

# O descargar ZIP y extraer archivos
```

### Paso 2: Configurar Servidor Local

#### 🟢 Opción 1: VS Code Live Server (Recomendado)
1. Instalar extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Click derecho en `index.html` → **"Open with Live Server"**
3. Se abre automáticamente en `http://127.0.0.1:5500`

#### 🟡 Opción 2: Python HTTP Server
```bash
python -m http.server 8000
# Abrir http://localhost:8000
```

#### 🔵 Opción 3: Node.js http-server
```bash
npx http-server -p 8000
```

### Paso 3: Verificar Funcionamiento

1. Abre consola del navegador (`F12`)
2. No deben aparecer errores CORS
3. Navbar y footer se cargan correctamente
4. Navega a "Habitaciones" para verificar

---

## 📖 Uso

### 🔐 Credenciales de Acceso

**Cuenta Administrador:**
```
Email:      admin@rincon.com
Contraseña: admin123
```

**Usuario Normal:** Regístrate en `/pages/register.html`

### 🗺️ Navegación del Sitio

```
🏠 index.html (Página Principal)
│
├── 🛏️ Habitaciones (/Habitaciones/rooms.html)
│   └── Ver catálogo y detalles de cada tipo
│
├── 🔍 Disponibilidad (/pages/disponibilidad.html)
│   ├── Buscar habitaciones disponibles
│   ├── Filtrar por fechas, personas y servicios
│   └── Realizar reservas
│
├── 📖 Historia, 🛎️ Servicios, 🤝 Patrocinadores, 📧 Contacto
│
├── 🔑 Login → Iniciar sesión
├── ✍️ Registro → Crear cuenta
│
├── 📋 Mis Reservas [Requiere login]
│   └── Ver y gestionar reservas personales
│
└── 🔐 Panel Admin [Solo admin]
    ├── Ver estadísticas del hotel
    ├── Gestionar todas las reservas
    └── Administrar usuarios
```

### 🎯 Flujos Principales

#### ➕ Realizar Reserva

```
1. 🔍 Ir a "Disponibilidad"
2. 📅 Seleccionar fechas (check-in y check-out)
3. 👥 Indicar número de personas
4. 🛎️ Elegir servicios deseados (opcional)
5. 🔎 Click "Buscar Habitaciones"
6. 🛏️ Ver habitaciones disponibles
7. ✅ Click "Reservar" en habitación deseada
8. 📝 Confirmar datos
✅ ¡Reserva exitosa!
```

#### 🔐 Gestión Administrativa

```
1. 🔑 Login como admin
2. 🛡️ Ir a "Panel de Administración"
3. 📊 Ver estadísticas: reservas, ocupación, ingresos
4. 📋 Gestionar: Ver/filtrar/cancelar todas las reservas
5. 👥 Administrar usuarios y su actividad
```

---

## 🎯 Reglas de Negocio

### 🔒 Sistema de Permisos

| Acción | Usuario Normal | Administrador |
|--------|----------------|---------------|
| 👁️ Ver disponibilidad | ✅ Sí | ✅ Sí |
| ➕ Crear reservas | ✅ Sí | ✅ Sí |
| 📋 Ver mis reservas | ✅ Solo propias | ✅ Todas |
| ❌ Cancelar reservas | ❌ No | ✅ Sí |
| 📊 Ver estadísticas | ❌ No | ✅ Sí |
| 👥 Gestionar usuarios | ❌ No | ✅ Sí |

### ✅ Validaciones Implementadas

#### 📅 Anti-Solapamiento
```javascript
function checkAvailability(roomId, checkIn, checkOut) {
  const existingReservations = getReservations(roomId);
  return !existingReservations.some(reservation => {
    return (checkIn < reservation.checkOut && checkOut > reservation.checkIn);
  });
}
```
**Regla:** No permite reservas si las fechas se solapan con otra existente.

#### 👥 Capacidad y 🛎️ Servicios
- Solo muestra habitaciones con capacidad suficiente
- Filtra por servicios incluidos (todos los seleccionados)

#### 📆 Fechas
- Check-in: hoy o fecha futura
- Check-out: posterior a check-in
- Mínimo: 1 noche de estadía

---


## 🐛 Solución de Problemas

### ❌ Error CORS (Cross-Origin Request Blocked)

**Síntoma:** `Access to script at 'file:///' has been blocked by CORS policy`

**Causa:** Abrir `index.html` directamente desde archivos (`file://`)

**Solución:** Usar servidor HTTP local (ver [Instalación](#-instalación))

---

### ❌ Página en Blanco

**Síntomas:**
- Navbar/footer no aparecen
- Errores 404 en consola

**Solución:**
```javascript
// ✅ CORRECTO (ruta relativa)
import { loadNavbar } from '../assets/js/ui.js';

// ❌ INCORRECTO (ruta absoluta)
import { loadNavbar } from '/assets/js/ui.js';
```

---

### ⚠️ LocalStorage no Guarda

**Causas:**
- Modo incógnito (se limpia al cerrar)
- Límite de 5-10 MB excedido
- Cookies deshabilitadas

**Limpiar datos:**
```javascript
// Consola del navegador (F12)
localStorage.clear();
location.reload();
```

**Verificar disponibilidad:**
```javascript
function testLocalStorage() {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch(e) {
    console.error('❌ LocalStorage no disponible:', e);
    return false;
  }
}
```

---

### 🔐 No Accedo al Panel Admin

**Solución 1:** Usar cuenta admin: `admin@rincon.com` / `admin123`

**Solución 2:** Modificar rol manualmente:
```javascript
// Consola del navegador (F12)
const users = JSON.parse(localStorage.getItem('users'));
const user = users.find(u => u.email === 'tu-email@ejemplo.com');
user.role = 'admin';
localStorage.setItem('users', JSON.stringify(users));

const session = JSON.parse(localStorage.getItem('session'));
session.role = 'admin';
localStorage.setItem('session', JSON.stringify(session));
location.reload();
```

---

### 🛏️ Habitaciones no Aparecen en Búsqueda

**Depuración:**
```javascript
console.log('🔍 Parámetros:', { checkIn, checkOut, persons, services });
console.log('🛏️ Total habitaciones:', allRooms.length);
console.log('👥 Tras filtro capacidad:', afterCapacity.length);
console.log('📅 Tras filtro disponibilidad:', finalRooms.length);
```

**Soluciones:**
- Reducir número de personas
- Quitar servicios opcionales
- Cambiar rango de fechas

---

### 🔍 Herramientas de Depuración (F12)

| Pestaña | Uso |
|---------|-----|
| **Console** | Ver logs, errores y ejecutar código |
| **Network** | Verificar carga de archivos (404s) |
| **Application** | Inspeccionar localStorage |
| **Elements** | Verificar HTML generado |

**Logs útiles:**
```javascript
console.group('🔄 Operación: Guardar Reserva');
console.log('📥 Datos:', reservationData);
console.log('💾 Guardando...');
console.groupEnd();
```

---

## 🤝 Contribuciones


### 📝 Convenciones de Commits

```
✨ :sparkles:     Nueva característica
🐛 :bug:          Corrección de bug
📝 :memo:         Documentación
🎉 :tada:         inicio de proyecto

---

## 📄 Licencia

MIT License © 2025 Hotel El Rincón del Carmen

---


⭐ Si este proyecto te fue útil, ¡considera darle una estrella en GitHub!