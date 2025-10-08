  (function(){
      // Espera a que UI esté cargado
      window.addEventListener('DOMContentLoaded', () => {
        // Render dinámico del navbar/footer (reemplaza el fallback)
        if (window.UI && typeof UI.navbar === 'function') {
          document.getElementById('nav').innerHTML = UI.navbar();
        }
        if (window.UI && typeof UI.footer === 'function') {
          document.getElementById('foot').innerHTML = UI.footer();
        }

        const $ = (sel, el=document) => el.querySelector(sel);
        const results = $('#results');
        const resultsWrap = $('#resultsWrap');

        // --------- Utilidades ----------
        function todayStr(d=new Date()){
          const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
          return `${y}-${m}-${day}`;
        }
        function addDays(s, n){
          const d = new Date(s+'T12:00:00'); d.setDate(d.getDate()+n);
          const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
          return `${y}-${m}-${day}`;
        }
        function setBusy(on){ results.setAttribute('aria-busy', on?'true':'false'); }

        // --------- Inicialización de fechas ----------
        const inEl = $('#checkIn'), outEl = $('#checkOut'), pplEl = $('#people');
        const t = todayStr();
        inEl.min = t;
        outEl.min = t;

        // Defaults: hoy y mañana
        inEl.value ||= t;
        outEl.value ||= addDays(inEl.value, 1);

        // Corrección automática: si checkOut <= checkIn, forzar día siguiente
        function normalizeDates(){
          if (!inEl.value) inEl.value = t;
          if (!outEl.value || outEl.value <= inEl.value) {
            outEl.value = addDays(inEl.value, 1);
          }
          outEl.min = addDays(inEl.value, 1);
        }
        inEl.addEventListener('change', normalizeDates);
        outEl.addEventListener('change', normalizeDates);
        normalizeDates();

        // --------- Lectura de filtros ----------
        function getFilters(){
          const features = Array.from($('#feature').selectedOptions).map(o=>o.value);
          return {
            checkIn: inEl.value,
            checkOut: outEl.value,
            people: Math.max(1, Number(pplEl.value || 1)),
            features
          };
        }

        // --------- UI: vacíos/loader ----------
        function showLoader(){
          results.innerHTML = `<div class="loader">Buscando disponibilidad…</div>`;
        }
        function showEmpty(){
          results.innerHTML = `
            <div class="empty">
              <strong>No encontramos habitaciones para esos criterios.</strong><br>
              Intenta ajustar fechas, personas o servicios.
            </div>`;
        }

        // --------- Render ----------
        function renderCard(room, f, total){
          return `
          <article class="card">
            <img src="/${room.photo}" alt="${room.name}">
            <div class="pad">
              <h3>${room.name}</h3>
              <p class="muted">Hasta ${room.maxPeople} personas · ${room.beds} camas</p>
              <ul style="display:flex; gap:8px; flex-wrap:wrap; padding-left:0; list-style:none;">
                ${room.features.map(x => `<li class="pill">${x}</li>`).join('')}
              </ul>
              <p><strong>${UI.fmtCurrency(room.priceNight)}/noche</strong></p>
              <p>Total: <strong>${UI.fmtCurrency(total)}</strong></p>
              <button class="btn" data-book="${room.id}" aria-label="Reservar ${room.name} del ${f.checkIn} al ${f.checkOut} para ${f.people} personas">Reservar</button>
            </div>
          </article>`;
        }

        function bindBookButtons(f){
          document.querySelectorAll('[data-book]').forEach(btn=>{
            btn.addEventListener('click', ()=>{
              try{
                const me = HotelCore.Auth.me();
                if(!me){
                  alert('Debes iniciar sesión para reservar.');
                  window.location.href='/pages/login.html';
                  return;
                }
                const roomId = btn.getAttribute('data-book');
                const res = HotelCore.Reservations.create({
                  roomId, userId: me.id, checkIn: f.checkIn, checkOut: f.checkOut, people: f.people
                });
                alert('Reserva confirmada ✅');
                window.location.href = '/pages/mis-reservas.html';
              }catch(e){
                alert(e.message || 'No fue posible completar la reserva.');
              }
            });
          });
        }

        // --------- Búsqueda ----------
        function search(){
          const f = getFilters();
          if(!f.checkIn || !f.checkOut){
            alert('Selecciona fechas de entrada y salida.');
            return;
          }
          setBusy(true);
          showLoader();

          // Simula latencia breve para UX
          setTimeout(()=>{
            try{
              const list = HotelCore.Rooms.list({ people: f.people, features: f.features });
              const available = list.filter(r =>
                r.maxPeople >= f.people && HotelCore.Reservations.isAvailable(r.id, f.checkIn, f.checkOut)
              );

              if(!available.length){
                showEmpty();
                setBusy(false);
                return;
              }

              results.innerHTML = '';
              available.forEach(r=>{
                const total = HotelCore.Reservations.computeTotal(r, f.checkIn, f.checkOut, f.people);
                results.insertAdjacentHTML('beforeend', renderCard(r, f, total));
              });
              bindBookButtons(f);
            }catch(e){
              results.innerHTML = `<div class="alert err">${e.message || 'Ha ocurrido un error realizando la búsqueda.'}</div>`;
            }finally{
              setBusy(false);
            }
          }, 200);
        }

        // Botones
        $('#btnSearch').addEventListener('click', search);
        $('#btnClear').addEventListener('click', ()=>{
          // Reseteo simple conservando hoy/mañana y personas=2
          $('#feature').selectedIndex = -1;
          pplEl.value = 2;
          inEl.value = todayStr();
          outEl.value = addDays(inEl.value, 1);
          results.innerHTML = '';
        });

        // Enter en cualquier campo ejecuta búsqueda
        document.getElementById('filter').addEventListener('keydown', (ev)=>{
          if (ev.key === 'Enter') { ev.preventDefault(); search(); }
        });
      });
    })();