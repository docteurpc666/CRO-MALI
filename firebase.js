import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDs-3TYY-ituu4GqtBbPdFzcH6XYkdEB3o",
    authDomain: "maintenanceinformatique-d9b17.firebaseapp.com",
    projectId: "maintenanceinformatique-d9b17",
    storageBucket: "maintenanceinformatique-d9b17.appspot.com",
    messagingSenderId: "271885214932",
    appId: "1:271885214932:web:e26b80eb6ff3dce0228741"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const serviceForm = document.getElementById("serviceForm");
if (serviceForm) {
    serviceForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            service: document.getElementById("selectedService").value,
         name: document.getElementById("fullName").value,
phone: document.getElementById("phoneNumber").value,

            address: document.getElementById("address").value,
            issue: document.getElementById("issue").value,
            date: new Date().toISOString()
        };

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
