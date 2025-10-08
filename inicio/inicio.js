document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let currentIndex = 0;

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function scrollToIndex(index) {
        const itemWidth = items[0].offsetWidth + 20; // Include gap
        currentIndex = Math.max(0, Math.min(index, items.length - 1));
        currentTranslate = -currentIndex * itemWidth;
        track.style.transform = `translateX(${currentTranslate}px)`;
        updateDots();
    }

    // Drag to scroll
    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startPos = e.clientX - currentTranslate;
        track.style.cursor = 'grabbing';
    });

    track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const currentPosition = e.clientX;
        currentTranslate = currentPosition - startPos;
        track.style.transform = `translateX(${currentTranslate}px)`;
    });

    track.addEventListener('mouseup', () => {
        isDragging = false;
        track.style.cursor = 'grab';
        const itemWidth = items[0].offsetWidth + 20;
        currentIndex = Math.round(-currentTranslate / itemWidth);
        scrollToIndex(currentIndex);
    });

    track.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            track.style.cursor = 'grab';
            const itemWidth = items[0].offsetWidth + 20;
            currentIndex = Math.round(-currentTranslate / itemWidth);
            scrollToIndex(currentIndex);
        }
    });

    // Touch support
    track.addEventListener('touchstart', (e) => {
        isDragging = true;
        startPos = e.touches[0].clientX - currentTranslate;
    });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentPosition = e.touches[0].clientX;
        currentTranslate = currentPosition - startPos;
        track.style.transform = `translateX(${currentTranslate}px)`;
    });

    track.addEventListener('touchend', () => {
        isDragging = false;
        const itemWidth = items[0].offsetWidth + 20;
        currentIndex = Math.round(-currentTranslate / itemWidth);
        scrollToIndex(currentIndex);
    });

    // Navigation buttons
    prevButton.addEventListener('click', () => scrollToIndex(currentIndex - 1));
    nextButton.addEventListener('click', () => scrollToIndex(currentIndex + 1));

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => scrollToIndex(index));
    });

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') scrollToIndex(currentIndex - 1);
        if (e.key === 'ArrowRight') scrollToIndex(currentIndex + 1);
    });

    // Auto-slide every 5 seconds
    let autoSlide = setInterval(() => {
        scrollToIndex(currentIndex + 1);
    }, 5000);

    // Pause auto-slide on hover or drag
    carousel.addEventListener('mouseenter', () => clearInterval(autoSlide));
    carousel.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => {
            scrollToIndex(currentIndex + 1);
        }, 5000);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        scrollToIndex(currentIndex);
    });

    // Initial setup
    scrollToIndex(0);
});