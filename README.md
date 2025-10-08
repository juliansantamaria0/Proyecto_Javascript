# Hotel El Rincón del Carmen — v2 (LocalStorage Simulation)

> **Stack:** HTML5 + CSS3 + JavaScript (ES6 modules-free), sin backend real. Todos los datos se guardan en `localStorage` para simular un sistema.

## Estructura
```
assets/
  css/main.css
  js/core.js       # Modelos, reglas de negocio y persistencia
  js/ui.js         # Navbar, footer y helpers UI
pages/
  disponibilidad.html
  contacto.html
  login.html
  register.html
  mis-reservas.html
  admin.html
index.html
Images/, Habitaciones/, Patrocinadores/  # Activos originales
```

## Reglas de negocio clave
- **Cancelar reservas:** Solo **ADMIN** puede cancelar o eliminar reservas.
- **Solapamiento:** Se evita por rango de fechas en la misma habitación.
- **Asignación:** Se muestran solo habitaciones con capacidad >= personas y con servicios seleccionados.
- **Autenticación:** Registro + login simples; sesión en `localStorage.session`.

## Usuarios demo
- Admin: `admin@rincon.com` / `admin123`

## Cómo correr
Sirve la carpeta con un servidor estático (por CORS de rutas absolutas). Ejemplos:
- VS Code Live Server
- `python -m http.server` en el directorio raíz y navega a `http://localhost:8000/`

