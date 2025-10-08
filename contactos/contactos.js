    /**
         * Muestra una notificación personalizada en la esquina superior derecha.
         */
        function showNotification() {
            const notificationBox = document.getElementById('notification-box');
            
            // 1. Mostrar la notificación
            notificationBox.classList.add('show');

            // 2. Ocultar la notificación después de 4 segundos
            setTimeout(() => {
                notificationBox.classList.remove('show');
            }, 4000);
        }

        /**
         * Maneja la sumisión del formulario de contacto.
         */
        document.getElementById('contactForm').addEventListener('submit', function(event) {
            // Previene el comportamiento por defecto de recargar la página
            event.preventDefault(); 
            
            // Simulación de envío de datos
            console.log('Datos del formulario enviados (simulado):');
            console.log('Nombre:', document.getElementById('name').value);
            console.log('Email:', document.getElementById('email').value);
            console.log('Mensaje:', document.getElementById('message').value);

            // Muestra el mensaje de éxito
            showNotification();
            
            // Limpia el formulario
            this.reset();
        });