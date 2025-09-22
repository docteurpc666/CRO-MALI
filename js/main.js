import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Config Firebase (pas besoin d'y toucher)
const firebaseConfig = {
    apiKey: "AIzaSyDs-3TYY-ituu4GqtBbPdFzcH6XYkdEB3o",
    authDomain: "maintenanceinformatique-d9b17.firebaseapp.com",
    projectId: "maintenanceinformatique-d9b17",
    storageBucket: "maintenanceinformatique-d9b17.appspot.com",
    messagingSenderId: "271885214932",
    appId: "1:271885214932:web:e26b80eb6ff3dce0228741"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// jQuery init (animations, navbar, scroll...)
(function ($) {
    "use strict";
    var spinner = function () {
        setTimeout(() => $('#spinner').removeClass('show'), 1);
    };
    spinner();

    new WOW().init();

    $(window).scroll(function () {
        const top = $(this).scrollTop();
        $('.sticky-top').toggleClass('shadow-sm', top > 300).css('top', top > 300 ? '0px' : '-100px');
        $('.back-to-top').fadeToggle(top > 300, 'slow');
    });

    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

    $('[data-toggle="counter-up"]').counterUp({ delay: 10, time: 2000 });

    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: false,
        loop: true,
        nav: true,
        navText: [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });
})(jQuery);

// Modal ouverture
function openModal(service) {
    document.getElementById("selectedService").value = service;
    document.getElementById("serviceTitle").innerText = `Demande: ${service}`;
    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    modal.show();
}

// Ajouter l'événement sur les services
document.querySelectorAll('.service-item a.h4').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', e => {
        e.preventDefault();
        openModal(el.textContent.trim());
    });
});

// Envoi du formulaire vers Firebase
document.addEventListener("DOMContentLoaded", function() {
    const serviceForm = document.getElementById("serviceForm");

    if (serviceForm) {
        serviceForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Récupérer les valeurs des champs
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const service = document.getElementById("selectedService").value.trim(); // Valeur cachée pour le service
            const message = document.getElementById("message").value.trim();

            // Paramètres EmailJS
            const templateParams = {
                from_name: name,
                from_email: email,
                phone: phone,
                service: service,
                message: message
            };

            try {
                // Envoi avec EmailJS
                const response = await emailjs.send("service_ox0o5nz", "template_5okrnq9", templateParams);
                if (response.status === 200) {
                    alert("✅ Message envoyé avec succès !");
                    serviceForm.reset();
                    bootstrap.Modal.getInstance(document.getElementById('serviceModal')).hide(); // Fermer la modale
                } else {
                    alert("❌ Échec de l'envoi.");
                }
            } catch (error) {
                console.error("Erreur:", error);
                alert("❌ Erreur lors de l'envoi.");
            }
        });
    }
});

// Charger les produits depuis Firestore
document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    try {
        const querySnapshot = await getDocs(collection(db, "produits"));
        if (querySnapshot.empty) {
            productGrid.innerHTML = "<p>Aucun produit disponible pour le moment.</p>";
            return;
        }

        querySnapshot.forEach(doc => {
            const product = doc.data();
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-id', doc.id);

            // Génération des images dans un carousel
            let imagesHTML = "";

            if (Array.isArray(product.images) && product.images.length > 0) {
                const images = product.images.map((url, i) => `
                    <div class="slide" style="flex: 0 0 100%; display: flex; justify-content: center; align-items: center;">
                        <img src="${url}" alt="${product.name} - Image ${i + 1}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                    </div>
                `).join("");

                imagesHTML = `
                    <div class="carousel-container" style="position: relative; overflow: hidden; width: 100%; border-radius: 8px; margin-bottom: 10px;">
                        <div class="carousel-track" style="display: flex; transition: transform 0.5s ease;">
                            ${images}
                        </div>
                        <button class="carousel-btn prev" style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; padding: 5px 10px; border-radius: 50%; cursor: pointer;">‹</button>
                        <button class="carousel-btn next" style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; padding: 5px 10px; border-radius: 50%; cursor: pointer;">›</button>
                    </div>
                `;
            } else {
                imagesHTML = `
                    <img src="https://via.placeholder.com/300x200?text=Pas+d'image" alt="Aucune image" class="product-image" style="width: 100%; margin-bottom: 10px; border-radius: 8px;">
                `;
            }

            card.innerHTML = `
                ${imagesHTML}
                <div class="product-content">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${parseFloat(product.price).toFixed(2)} CFA</div>
                </div>
                <button class="add-to-cart-btn">Ajouter au panier</button>
            `;

            productGrid.appendChild(card);

            // Ajouter un événement de clic pour rediriger vers la page de détails du produit
            card.addEventListener('click', () => {
                const productId = doc.id;
                window.location.href = `product-details.html?id=${productId}`;  // Redirection vers la page de détails
            });
        });

        // Gestion du carousel
        document.querySelectorAll('.carousel-btn').forEach(button => {
            button.addEventListener('click', function () {
                const carousel = button.closest('.carousel-container');
                const track = carousel.querySelector('.carousel-track');
                const slides = carousel.querySelectorAll('.slide');
                const slideWidth = slides[0].getBoundingClientRect().width;
                let currentTransform = parseInt(getComputedStyle(track).transform.split(',')[4]) || 0;

                if (button.classList.contains('next')) {
                    // Slide next
                    currentTransform -= slideWidth;
                } else {
                    // Slide prev
                    currentTransform += slideWidth;
                }

                // Clamp the transform value to prevent scrolling beyond the images
                if (currentTransform > 0) currentTransform = 0;
                if (currentTransform < -(slideWidth * (slides.length - 1))) {
                    currentTransform = -(slideWidth * (slides.length - 1));
                }

                track.style.transform = `translateX(${currentTransform}px)`;
            });
        });

    } catch (error) {
        console.error("Erreur chargement produits :", error);
        productGrid.innerHTML = "<p>Erreur lors du chargement des produits.</p>";
    }
});


// Initialisation d'EmailJS avec ta clé publique
if (typeof emailjs !== "undefined") {
    emailjs.init("gvYaxYkO7CBf54-6s"); // Ta clé publique ici
} else {
    console.error("EmailJS n'a pas été chargé correctement.");
}

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Récupère les valeurs du formulaire
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const service = document.getElementById("service").value.trim();
            const message = document.getElementById("message").value.trim();

            // Validation des champs
            if (!name || !email || !phone || !service || !message) {
                alert("❗ Veuillez remplir tous les champs.");
                return;
            }

            // Validation de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("❗ L'adresse email n'est pas valide.");
                return;
            }

            const templateParams = {
                from_name: name,
                from_email: email,
                phone: phone,
                service: service,
                message: message
            };

            const loadingMessage = document.getElementById("loadingMessage");
            if (loadingMessage) {
                loadingMessage.style.display = "block";
            }

            try {
                const response = await emailjs.send("service_ox0o5nz", "template_5okrnq9", templateParams);
                if (response.status === 200) {
                    alert("✅ Message envoyé avec succès !");
                    contactForm.reset();
                } else {
                    alert("❌ Échec de l'envoi, réessayez.");
                }
            } catch (error) {
                console.error("❌ Erreur EmailJS :", error);
                alert("❌ Erreur lors de l'envoi. Vérifiez votre connexion ou réessayez.");
            } finally {
                if (loadingMessage) {
                    loadingMessage.style.display = "none";
                }
            }
        });
    }
});
