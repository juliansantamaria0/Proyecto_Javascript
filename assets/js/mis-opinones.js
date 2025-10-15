document.getElementById('nav').innerHTML = UI.navbar();
document.getElementById('foot').innerHTML = UI.footer();
const me = HotelCore.Auth.me(); if(!me){ window.location.href='/pages/login.html'; }
const rooms = HotelCore.DB.rooms();
const all = HotelCore.DB.reservations().filter(r => r.userId === me.id);
const tbody = document.querySelector('#table tbody');
all.forEach(r => {
  const room = rooms.find(x=>x.id===r.roomId);
  tbody.insertAdjacentHTML('beforeend', `
    <tr>
      <td>${room ? room.name : r.roomId}</td>
      <td>${r.checkIn} → ${r.checkOut}</td>
      <td>${r.people}</td>
      <td>${UI.fmtCurrency(r.total)}</td>
      <td><span class="pill">${r.status}</span></td>
      <td><!-- No cancelar hasta que se solucione --></td>
    </tr>`);
});