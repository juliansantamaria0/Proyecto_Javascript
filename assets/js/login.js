    document.getElementById('nav').innerHTML = UI.navbar();
    document.getElementById('foot').innerHTML = UI.footer();
    document.getElementById('btnLogin').addEventListener('click', () => {
      const email = document.getElementById('email').value.trim();
      const pass = document.getElementById('pass').value;
      try {
        HotelCore.Auth.login(email, pass);
        window.location.href = '/index.html';
      } catch(e){
        alert(e.message);
      }
    });