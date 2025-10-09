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

function navbar(){
  const me = HotelCore.Auth.me();
  return `
  <div class="header">
    <div class="container nav">
      <a class="logo link" href="/index.html">Rincón del Carmen</a>
      <div class="grow"></div>
      <a class="link" href="/index.html">Inicio</a>
      <a class="link" href="/pages/disponibilidad.html">Disponibilidad</a>
      <a class="link" href="/pages/servicios.html">Servicios</a>
      <a class="link" href="/Habitaciones/rooms.html">Habitaciones</a>
      <a class="link" href="/pages/historia.html">Historia</a>
      <a class="link" href="/pages/patrocinadores.html">Patrocinadores</a>
      <a class="link" href="/pages/contacto.html">Contacto</a>
      <a class="link" href="/pages/mis-reservas.html">Mis reservas</a>
      <a class="link" href="/pages/admin.html">Admin</a>
      ${ me ? `<span class="badge"><span class="dot"></span>${me.name}</span> <button class="logout" id="btnLogout">Salir</button>` : `<a class="cta" href="/pages/login.html">Ingresar</a>`}
    </div>
  </div>`;
}

function footer() {
  return `
    <footer role="contentinfo">
      <div class="foot-inner">
        <p>&copy; ${new Date().getFullYear()} Hotel El Rincón del Carmen. Todos los derechos reservados.</p>
        <p>Contáctanos: <a href="/contactos/contactos.html">Formulario de contacto</a></p>
        <div class="social-links">
          <a href="https://facebook.com" target="_blank" rel="noopener">Facebook</a> |
          <a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a> |
          <a href="https://twitter.com" target="_blank" rel="noopener">Twitter</a>
        </div>
        <p>Desarrollado por: <a href="https://github.com/juliansantamaria0" target="_blank" rel="noopener">juliansantamaria</a></p>
      </div>
    </footer>
  `;
}

window.UI = { $, $$, fmtCurrency, ensureAuth, navbar, footer };

// Bind logout if present
window.addEventListener('DOMContentLoaded', ()=>{
  const b = document.getElementById('btnLogout');
  if(b){ b.addEventListener('click', ()=>{ HotelCore.Auth.logout(); window.location.href='/index.html'; }); }
});
