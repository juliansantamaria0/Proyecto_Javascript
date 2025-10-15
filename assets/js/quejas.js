// =======================
// SISTEMA DE OPINIONES
// =======================
document.addEventListener("DOMContentLoaded", () => {
    // Insertar navbar y footer
    document.getElementById("nav").innerHTML = UI.navbar();
    document.getElementById("foot").innerHTML = UI.footer();
  
    // Clave de almacenamiento
    const STORAGE_KEY = "hotelOpiniones";
    let opiniones = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  
    // Referencias del DOM
    const form = document.getElementById("formOpinion");
    const nombre = document.getElementById("nombre");
    const comentario = document.getElementById("comentario");
    const estrellas = document.getElementById("estrellas");
    const lista = document.getElementById("listaOpiniones");
    const btnEnviar = document.getElementById("btnEnviar");
    const btnLimpiar = document.getElementById("btnLimpiar");
  
    // Validar existencia de elementos (evita errores si el script carga en otra página)
    if (!form || !lista) return;
  
    // Guardar en localStorage
    function guardar() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(opiniones));
    }
  
    // Renderizar opiniones
    function renderizar() {
      if (opiniones.length === 0) {
        lista.innerHTML = "<p class='no-comments'>Aún no hay opiniones.</p>";
        return;
      }
  
      lista.innerHTML = opiniones
        .map(
          (o, i) => `
          <div class="comment" data-idx="${i}">
            <div class="comment-header">
              <strong>${o.nombre}</strong>
              <span>${"⭐".repeat(o.estrellas)}</span>
            </div>
            <p>${o.comentario}</p>
            <div class="comment-actions">
              <button class="btn ghost btn-delete" data-idx="${i}">Eliminar</button>
            </div>
          </div>
        `
        )
        .join("");
    }
  
    // Evento: Enviar opinión
    btnEnviar.addEventListener("click", () => {
      const nombreVal = nombre.value.trim();
      const comentarioVal = comentario.value.trim();
      const estrellasVal = parseInt(estrellas.value);
  
      if (!nombreVal || !comentarioVal) {
        alert("Por favor completa todos los campos.");
        return;
      }
  
      opiniones.push({
        nombre: nombreVal,
        comentario: comentarioVal,
        estrellas: estrellasVal,
      });
  
      guardar();
      renderizar();
      form.reset();
    });
  
    // Evento: Limpiar opiniones (solo del formulario)
    btnLimpiar.addEventListener("click", () => form.reset());
  
    // Evento: Eliminar opinión (delegación)
    lista.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-delete");
      if (!btn) return;
  
      const idx = Number(btn.dataset.idx);
      if (Number.isNaN(idx)) return;
  
      if (confirm("¿Eliminar esta opinión?")) {
        opiniones.splice(idx, 1);
        guardar();
        renderizar();
      }
      
    });
  
    // Render inicial
    renderizar();
  });