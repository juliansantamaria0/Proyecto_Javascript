    document.getElementById('nav').innerHTML = UI.navbar();
    document.getElementById('foot').innerHTML = UI.footer();
    document.getElementById('btnReg').addEventListener('click', ()=>{
      const payload = {
        id: document.getElementById('id').value.trim(),
        name: document.getElementById('name').value.trim(),
        nation: document.getElementById('nation').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password: document.getElementById('pass').value
      };
      try {
        HotelCore.Auth.register(payload);
        alert('Cuenta creada. Sesión iniciada.'); window.location.href='/index.html';
      } catch(e){ alert(e.message); }
    });