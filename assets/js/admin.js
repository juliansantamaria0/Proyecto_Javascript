 const me = UI.ensureAuth(true); // require admin
    document.getElementById('nav').innerHTML = UI.navbar();
    document.getElementById('foot').innerHTML = UI.footer();

    // Rooms table
    function renderRooms(){
      const tbody = document.querySelector('#roomTable tbody');
      tbody.innerHTML='';
      HotelCore.DB.rooms().forEach(r=>{
        tbody.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${r.id}</td><td>${r.name}</td><td>${r.maxPeople}</td><td>${UI.fmtCurrency(r.priceNight)}</td>
            <td>
              <button class="btn ghost" data-edit="${r.id}">Editar</button>
              <button class="btn" style="background:var(--danger);" data-del="${r.id}">Eliminar</button>
            </td>
          </tr>`);
      });

      document.querySelectorAll('[data-edit]').forEach(b=> b.onclick = ()=>{
        const id = b.getAttribute('data-edit');
        const r = HotelCore.DB.rooms().find(x=>x.id===id);
        if(!r) return;
        r_id.value=r.id; r_name.value=r.name; r_beds.value=r.beds; r_max.value=r.maxPeople;
        r_price.value=r.priceNight; r_photo.value=r.photo; r_features.value=r.features.join(',');
      });
      document.querySelectorAll('[data-del]').forEach(b=> b.onclick = ()=>{
        if(confirm('¿Eliminar habitación?')){ HotelCore.Rooms.remove(b.getAttribute('data-del'), me); renderRooms(); }
      });
    }
    renderRooms();

    // Save room
    btnSaveRoom.onclick = ()=>{
      try{
        HotelCore.Rooms.upsert({
          id: r_id.value.trim(),
          name: r_name.value.trim(),
          beds: Number(r_beds.value||1),
          maxPeople: Number(r_max.value||2),
          priceNight: Number(r_price.value||0),
          photo: r_photo.value.trim()||'Images/estandar.jpg',
          features: r_features.value.split(',').map(s=>s.trim()).filter(Boolean)
        }, me);
        renderRooms();
        alert('Habitación guardada');
      }catch(e){ alert(e.message); }
    };

    // Reservations
    function renderRes(){
      const tbody = document.querySelector('#resTable tbody'); tbody.innerHTML='';
      const users = HotelCore.DB.users(), rooms = HotelCore.DB.rooms();
      HotelCore.DB.reservations().forEach(r=>{
        const user = users.find(u=>u.id===r.userId);
        const room = rooms.find(x=>x.id===r.roomId);
        tbody.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${r.id.slice(0,8)}…</td>
            <td>${user ? user.name : r.userId}</td>
            <td>${room ? room.name : r.roomId}</td>
            <td>${r.checkIn} → ${r.checkOut}</td>
            <td>${UI.fmtCurrency(r.total)}</td>
            <td><span class="pill">${r.status}</span></td>
            <td>
              <button class="btn ghost" data-cancel="${r.id}">Cancelar</button>
              <button class="btn" style="background:var(--danger);" data-remove="${r.id}">Eliminar</button>
            </td>
          </tr>`);
      });
      document.querySelectorAll('[data-cancel]').forEach(b=> b.onclick=()=>{ HotelCore.Reservations.cancel(b.getAttribute('data-cancel'), me); renderRes(); });
      document.querySelectorAll('[data-remove]').forEach(b=> b.onclick=()=>{ if(confirm('¿Eliminar reserva?')){ HotelCore.Reservations.remove(b.getAttribute('data-remove'), me); renderRes(); }});
    }
    renderRes();