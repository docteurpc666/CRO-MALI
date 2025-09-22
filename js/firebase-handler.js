import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Config Firebase
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

// Ouvrir modal + renseigner service
window.openModal = function(service) {
  document.getElementById("selectedService").value = service;
  document.getElementById("serviceTitle").innerText = `Demande: ${service}`;
  const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
  modal.show();
};

// Gestion des clics sur les liens services (remplace onclick inline)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.service-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();  // Bloque le scroll vers le haut
      const service = this.dataset.service;
      window.openModal(service);
    });
  });

  // Soumettre le formulaire
  const serviceForm = document.getElementById("serviceForm");
  if (serviceForm) {
    serviceForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Récupérer les données
      const data = {
        service: document.getElementById("selectedService").value,
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        address: document.getElementById("address").value.trim(),
        issue: document.getElementById("issue").value.trim(),
        date: new Date().toISOString()
      };

      // Validation simple
      if (!data.name || !data.phone || !data.address || !data.issue) {
        alert("Veuillez remplir tous les champs.");
        return;
      }

      try {
        await addDoc(collection(db, "demandes"), data);
        alert("Votre demande a été envoyée avec succès !");
        serviceForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('serviceModal')).hide();
      } catch (error) {
        alert("Erreur lors de l'envoi: " + error.message);
      }
    });
  }
});
