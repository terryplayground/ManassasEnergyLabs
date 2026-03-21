document.addEventListener('DOMContentLoaded', () => {
    
    // Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Paywall Modal Logic
    const paywallBtns = document.querySelectorAll('.btn-paywall');
    const modal = document.getElementById('payment-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalProductName = document.getElementById('modal-product-name');

    // Report Product Mapping
    const productMap = {
        'data-centers-report': 'Data Centers and the Next Phase of Energy Infrastructure'
    };

    // Open Modal
    paywallBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productKey = btn.getAttribute('data-product');
            if (productKey && productMap[productKey]) {
                modalProductName.textContent = productMap[productKey];
            } else {
                modalProductName.textContent = "Premium Research Report";
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    // Close Modal via button
    closeModalBtn.addEventListener('click', () => {
        closeModal();
    });

    // Close Modal by clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // PayPal Mock Button click
    const paypalBtn = document.querySelector('.paypal-button-mock');
    if (paypalBtn) {
        paypalBtn.addEventListener('click', () => {
            alert('This is a simulated demo environment. In a real website, this would redirect to the PayPal checkout gateway.');
        });
    }

    // Optional: Add a subtle parallax effect to the hero content
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
        }
    });
});
