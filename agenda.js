// Importiere die Firebase-Konfiguration
import firebaseConfig from './firebase-config.js';

// Verwende firebaseConfig, um Firebase zu initialisieren
firebase.initializeApp(firebaseConfig);

// Firestore-Referenz
const db = firebase.firestore();

// Referenz auf die Agenda-Tabelle
const agendaTable = document.getElementById('agendaTable');

// Daten aus Firestore abrufen und in die Tabelle einfügen
db.collection('events').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        const event = doc.data();
        console.log('Event:', event); // Überprüfen der abgerufenen Daten
        const row = agendaTable.insertRow();
        row.insertCell(0).textContent = event.Datum;
        row.insertCell(1).textContent = event.Anlass;
        row.insertCell(2).textContent = event.Restaurant;
        row.insertCell(3).textContent = event.Lead;
    });
}).catch((error) => {
    console.error('Fehler beim Abrufen der Daten:', error);
});





