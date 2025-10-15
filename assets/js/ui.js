// ===============================================
// Minimal client-side router & rendering helpers
// ===============================================
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

function fmtCurrency(v) { return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(v); }

function ensureAuth(needAdmin=false){
  const me = HotelCore.Auth.me();
  if(!me){ window.location.href = 'pages/login.html'; return null; }
  if(needAdmin && me.role!=='ADMIN'){ window.location.href = '/index.html'; return null; }
  return me;
}

// La función ahora solo genera la estructura base
function navbar(){
  const me = HotelCore.Auth.me();
  return `
  <div class="header">
    <div class="container nav">
      <a class="logo link" href="/index.html">Rincón del Carmen</a>
      
      <button class="menu-toggle" id="btnMenuToggle">☰</button>

      <div class="grow"></div>
      
            <a class="link" href="/index.html">Inicio</a>
      <a class="link" href="/pages/disponibilidad.html">Disponibilidad</a>
      <a class="link" href="/pages/quejas.html">quejas</a>
      <a class="link" href="/pages/servicios.html">Servicios</a>
      <a class="link" href="/Habitaciones/rooms.html">Habitaciones</a>
      <a class="link" href="/pages/historia.html">Historia</a>
      <a class="link" href="/pages/patrocinadores.html">Patrocinadores</a>
      <a class="link" href="/pages/contacto.html">Contacto</a>
      <a class="link" href="/pages/mis-reservas.html">Mis reservas</a>
      <a class="link" href="/pages/admin.html">Admin</a>
      
            ${ me ? `<span class="badge"><span class="dot"></span>${me.name}</span> <button class="logout" id="btnLogout">Salir</button>` : `<a class="cta" href="/pages/login.html">Ingresar</a>`}
    </div>

    <div class="nav-drawer" id="navDrawer">
        <a href="/index.html">Inicio</a>
        <a href="/pages/disponibilidad.html">Disponibilidad</a>
        <a href="/pages/servicios.html">Servicios</a>
        <a href="/Habitaciones/rooms.html">Habitaciones</a>
        <a href="/pages/historia.html">Historia</a>
        <a href="/pages/patrocinadores.html">Patrocinadores</a>
        <a href="/pages/contacto.html">Contacto</a>
        <a href="/pages/mis-reservas.html">Mis reservas</a>
        <a href="/pages/admin.html">Admin</a>
    </div>
  </div>`;
}

// Lógica de JavaScript para manejar el menú (DEBE EJECUTARSE DESPUÉS DE RENDERIZAR EL NAVBAR)
document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btnMenuToggle');
    const navDrawer = document.getElementById('navDrawer');

    if(btnToggle && navDrawer) {
        btnToggle.addEventListener('click', () => {
            navDrawer.classList.toggle('open');
            // Cambiar el ícono: ☰ (Menú) o × (Cerrar)
            btnToggle.textContent = navDrawer.classList.contains('open') ? '×' : '☰';
        });
    }
});

function footer(){
  return `
  <div class="footer">
    <div class="container">
      © ${new Date().getFullYear()} Hotel El Rincón del Carmen — <a href="/pages/contacto.html">Contáctanos</a> 
      <p><a href="https://facebook.com">Facebook</a> </p>
      <p><a href="https://instagram.com">Instagram</a> </p>
      <p><a href="https://twitter.com">Twitter</a></p>
      <p>Desarrollado por <a href="https://github.com/juliansantamaria0">juliansantamaria</a></p>
    </div>
  </div>`;
}

window.UI = { $, $$, fmtCurrency, ensureAuth, navbar, footer };

// Bind logout if present
window.addEventListener('DOMContentLoaded', ()=>{
  const b = document.getElementById('btnLogout');
  if(b){ b.addEventListener('click', ()=>{ HotelCore.Auth.logout(); window.location.href='/index.html'; }); }
});
