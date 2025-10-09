
// Renderizar navegación + pie de página
    document.getElementById('nav').innerHTML = UI.navbar();
    document.getElementById('foot').innerHTML = UI.footer();

// Renderizar algunas habitaciones desde la base de datos
    const root = document.getElementById('home-rooms');
    HotelCore.Rooms.list().slice(0,6).forEach(r=>{
      root.insertAdjacentHTML('beforeend', `
        <article class="card">
          <img src="/${r.photo}" alt="${r.name}">
          <div class="pad">
            <h3>${r.name}</h3>
            <p class="muted">Hasta ${r.maxPeople} personas · ${r.beds} camas</p>
            <p><strong>${UI.fmtCurrency(r.priceNight)}/noche</strong></p>
            <div style="display:flex; gap:10px; margin-top:10px;">
              <a class="btn" href="/pages/disponibilidad.html">Reservar</a>
              <a class="btn ghost" href="/Habitaciones/rooms.html">Ver detalles</a>
            </div>
          </div>
        </article>`);
    });