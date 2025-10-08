  // Burger menu
    const btnMenu = document.getElementById('btnMenu');
    const menu = document.getElementById('menu');
    btnMenu?.addEventListener('click', () => menu.classList.toggle('open'));

    // Sesión (si existe HotelCore de tu simulación)
    (function(){
      const hasCore = typeof window !== 'undefined' && window.HotelCore && HotelCore.Auth;
      const lnkLogin = document.getElementById('lnkLogin');
      const btnLogout = document.getElementById('btnLogout');

      if (!hasCore) return;

      const me = HotelCore.Auth.me && HotelCore.Auth.me();
      if (me) {
        if (lnkLogin) lnkLogin.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'inline-block';

        // Badge con nombre
        const badge = document.createElement('span');
        badge.textContent = me.name || 'Usuario';
        badge.style.marginLeft = '6px';
        badge.style.padding = '6px 10px';
        badge.style.border = '1px solid #d7e9e0';
        badge.style.borderRadius = '999px';
        badge.style.background = '#F1FBF7';
        badge.style.color = '#1f5136';
        menu?.insertBefore(badge, btnLogout);
      } else {
        if (lnkLogin) lnkLogin.style.display = 'inline-block';
        if (btnLogout) btnLogout.style.display = 'none';
      }

      btnLogout?.addEventListener('click', () => {
        try { HotelCore.Auth.logout(); } catch(_) {}
        window.location.href = '../index.html';
      });
    })();