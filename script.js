// Intersection Observer for scroll reveal animations
const revealElements = document.querySelectorAll('.scroll-reveal, .fade-up');

const revealOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, revealOptions);

revealElements.forEach(element => {
    revealOnScroll.observe(element);
});

// Form submission handler
const rsvpForm = document.querySelector('.rsvp-form');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(rsvpForm);
        const name = formData.get('name') || '이름';
        const attendance = formData.get('attendance') || '미정';
        const guests = formData.get('guests') || '1';

        console.log('RSVP 제출:', {
            name,
            attendance,
            guests
        });

        // Show confirmation message
        alert('참석 의사가 접수되었습니다.\n감사합니다!');
        rsvpForm.reset();
    });
}

// Smooth parallax effect for hero section
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroContent = hero.querySelector('.hero-content');
        if (scrollY < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.5}px)`;
            heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 1.5);
        }
    });
}

// Map button handlers
const mapButtons = document.querySelectorAll('.location .btn');
mapButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const buttonText = btn.textContent;
        if (buttonText === '카카오맵') {
            // Open Kakao Map
            window.open('https://map.kakao.com/', '_blank');
        } else if (buttonText === '네이버지도') {
            // Open Naver Map
            window.open('https://map.naver.com/', '_blank');
        } else if (buttonText === '주소 복사') {
            // Copy address to clipboard
            const address = document.querySelector('.location .address').textContent;
            navigator.clipboard.writeText(address).then(() => {
                alert('주소가 복사되었습니다.');
            });
        }
    });
});

// Gallery modal (optional enhancement)
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        // Add gallery modal functionality here if needed
        console.log('Gallery item clicked');
    });
});
