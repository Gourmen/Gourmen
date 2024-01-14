/*//// Hamburger ////*/
const menu_btn = document.querySelector('.hamburger');
const mobile_menu = document.querySelector('.mobile-nav');

menu_btn.addEventListener('click', function() { 
    menu_btn.classList.toggle('is-active');
    mobile_menu.classList.toggle('is-active');
});


/*//// Accordion ////*/
document.querySelectorAll('.accordion').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('active');
        let panel = button.nextElementSibling;
        if (panel.style.maxHeight){
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        } 
    });
});





/*//// Nächste Termine ////*/

function ladeUndZeigeAgendaNaechsteTermine(url) {
    fetch(url)
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSVNaechsteTermine(csvText);
            zeigeNaechsteTermine(data);
        })
        .catch(error => console.error('Fehler beim Laden der CSV:', error));
}

function parseCSVNaechsteTermine(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    const headers = lines[0].split(';');

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(';');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);
    }

    return result;
}


function formatiereDatumNaechsteTermine(isoDatum) {
    const datumObj = new Date(isoDatum);
    const tag = datumObj.getDate().toString().padStart(2, '0');
    const monat = (datumObj.getMonth() + 1).toString().padStart(2, '0'); // Monat beginnt bei 0
    const jahr = datumObj.getFullYear();
    return `${tag}.${monat}.${jahr}`; // Format: TT.MM.JJJJ
}


function zeigeNaechsteTermine(data) {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0); // Setzt die Zeit auf Mitternacht, um nur das Datum zu berücksichtigen

    // Filtern Sie die Termine, um nur zukünftige Termine zu behalten
    const zukuenftigeTermine = data.filter(termin => new Date(termin.Datum) >= heute);

    // Sortieren Sie die Termine nach dem Datum
    zukuenftigeTermine.sort((a, b) => new Date(a.Datum) - new Date(b.Datum));

    // Nehmen Sie die nächsten drei Termine
    const naechsteTermine = zukuenftigeTermine.slice(0, 3);

    // Tabelle erstellen
    let tabelle = "<table border='1'><tr><th>Datum</th><th>Event</th><th>Lead</th></tr>";
    naechsteTermine.forEach(termin => {
        const formatiertesDatum = formatiereDatumNaechsteTermine(termin.Datum);
        tabelle += `<tr><td>${formatiertesDatum}</td><td>${termin.Anlass}</td><td>${termin.Lead}</td></tr>`;
    });
    tabelle += "</table>";

    document.getElementById('naechsteTermine').innerHTML = tabelle;
}


// URL der CSV-Datei im Repository
ladeUndZeigeAgendaNaechsteTermine('https://gourmen.github.io/Homepage/data/agenda.csv');



/*///// BillBoy ////*/
function berechneTotalBillBoy() {
    const restaurantName = document.getElementById('restaurant').value;
    const rechnung = parseFloat(document.getElementById('rechnung').value);
    const vielfrasse = parseInt(document.getElementById('vielfrasse').value);
    const genuegsame = parseInt(document.getElementById('genuegsame').value);
    const trinkgeldOption = document.getElementById('trinkgeld').value;
    let trinkgeldProzent = 0;

    if (trinkgeldOption === 'Auto') {
        trinkgeldProzent = berechneAutoTrinkgeldBillBoy(rechnung);
    } else {
        trinkgeldProzent = parseFloat(trinkgeldOption);
    }

    const total = rechnung + (rechnung * trinkgeldProzent);
    const gruppe = vielfrasse + genuegsame;
    const durchschnitt = total / gruppe;
    const betrag1 = (total / gruppe) + (total / gruppe * 0.25 * genuegsame / vielfrasse);
    const betrag2 = (total / gruppe) * 0.75 * genuegsame / genuegsame;

    document.getElementById('restaurantErgebnis').textContent = restaurantName || "Nicht angegeben";
    document.getElementById('totalErgebnis').textContent = total.toFixed(0) + ' CHF';
    document.getElementById('gruppeErgebnis').textContent = gruppe + ' Pers.';
    document.getElementById('durchschnittErgebnis').textContent = durchschnitt.toFixed(2) + ' CHF';
    document.getElementById('betrag1Ergebnis').textContent = betrag1.toFixed(2) + ' CHF';
    document.getElementById('betrag2Ergebnis').textContent = betrag2.toFixed(2) + ' CHF';
}

function berechneAutoTrinkgeldBillBoy(rechnungsbetrag) {
    let trinkgeldProzent;
    let aufgerundeterBetrag;

    if (rechnungsbetrag <= 200) {
        trinkgeldProzent = 0.095; 
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 5) * 5;
    } else if (rechnungsbetrag <= 500) {
        trinkgeldProzent = 0.085    ; // 9% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 10) * 10;
    } else if (rechnungsbetrag <= 1000) {
        trinkgeldProzent = 0.085; // 9% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 10) * 10;
    } else if (rechnungsbetrag <= 1500) {
        trinkgeldProzent = 0.08; // 8% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 10) * 10;
    } else if (rechnungsbetrag <= 2000) {
        trinkgeldProzent = 0.07; // 7% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 20) * 20;
    } else {
        trinkgeldProzent = 0.05; // 6% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 50) * 50;
    }

    let trinkgeld = aufgerundeterBetrag - rechnungsbetrag;
    let trinkgeldProzentEffektiv = trinkgeld / rechnungsbetrag;
    
    document.getElementById ('trinkgeldBetragErgebnis').textContent = trinkgeld.toFixed(0) + ' CHF';
    document.getElementById ('trinkgeldProzentErgebnis').textContent = (trinkgeldProzentEffektiv * 100).toFixed(2) + '%';
    return trinkgeldProzentEffektiv;
}


function speichereErgebnisseBillBoy() {
    // Bestätigungsdialog anzeigen
    var bestaetigung = confirm("Ergebnisse werden heruntergeladen. Schicke die Datei Andy oder stelle sie in unseren Chat. Yay, Statistik! :)");

    // Wenn der Benutzer auf "OK" klickt
    if (bestaetigung) {
        const ergebnisse = document.getElementById('ergebnisse').textContent;
        const blob = new Blob([ergebnisse], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = "ergebnisse.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}    

function zeigeErgebnisTabelleBillBoy(differenzen) {
        let tabelle = "<table><tr><th>Name</th><th>Differenz</th><th>Rang</th></tr>";
        differenzen.forEach(d => {
            tabelle += `<tr><td>${d.name}</td><td>${d.differenz.toFixed(2)}</td><td>${d.rang}</td></tr>`;
        });
        tabelle += "</table>";
        document.getElementById('rangliste').innerHTML = tabelle;
        }

function seiteZuruecksetzenBillBoy() {
    var bestaetigung = confirm("Wirklich alles löschen?");
    if (bestaetigung) {
        location.reload(); // Aktualisiert die Seite
    }
}



/*//// BillBro ////*/


function zeigeErgebnisTabelleBillBro(differenzen) {
    let tabelle = "<table><tr><th>Name</th><th>Differenz</th><th>Rang</th></tr>";
    differenzen.forEach(d => {
        tabelle += `<tr><td>${d.name}</td><td>${d.differenz.toFixed(2)}</td><td>${d.rang}</td></tr>`;
    });
    tabelle += "</table>";
    document.getElementById('ergebnisse').innerHTML = tabelle;
}

function berechneTotalBillBro() {
    const rechnung = parseFloat(document.getElementById('rechnung').value) || 0;
    const trinkgeldOption = document.getElementById('trinkgeld').value;
    let trinkgeldProzent = 0;
        if (trinkgeldOption === 'Auto') {
            trinkgeldProzent = berechneAutoTrinkgeld(rechnung);
        } else {
            trinkgeldProzent = parseFloat(trinkgeldOption);
        };
    const restaurantName = document.getElementById('restaurant').value;

    const namen = ["Andy", "Cedi", "Dave", "Fabio", "Kevin", "Marco", "Mo", "Ramon", "Raphi", "Roman", "Thomi"];
    let anzahlVielfrass = 0;
    let anzahlGenuegsam = 0;

    namen.forEach(name => {
        const typ = document.getElementById(`typ${name}`).value;
        if (typ === "Vielfrass") {
            anzahlVielfrass += 1;
        } else if (typ === "Genügsam") {
            anzahlGenuegsam += 1;
        }
    });

    const total = rechnung + (rechnung * trinkgeldProzent);
    const gruppe = anzahlVielfrass + anzahlGenuegsam;
    const durchschnitt = total / gruppe;
    const betrag1 = (total / gruppe) + (total / gruppe * 0.25 * anzahlGenuegsam / anzahlVielfrass);
    const betrag2 = (total / gruppe) * 0.75 * anzahlGenuegsam / anzahlGenuegsam;

    // Setzen der Ergebniswerte
    document.getElementById('restaurantErgebnis').textContent = restaurantName || "Nicht angegeben";
    document.getElementById('totalErgebnis').textContent = total.toFixed(0) + ' CHF';
    document.getElementById('gruppeErgebnis').textContent = gruppe + ' Pers.';
    document.getElementById('vielfrassErgebnis').textContent = anzahlVielfrass + ' Pers.';
    document.getElementById('genuegsamErgebnis').textContent = anzahlGenuegsam + ' Pers.';
    document.getElementById('durchschnittErgebnis').textContent = durchschnitt.toFixed(2) + ' CHF';
    document.getElementById('betrag1Ergebnis').textContent = betrag1.toFixed(2) + ' CHF';
    document.getElementById('betrag2Ergebnis').textContent = betrag2.toFixed(2) + ' CHF';

    // Berechnen der Differenzen und Anzeigen in der Rangliste
    berechneDifferenzenUndZeigeErgebnisse();
}

function berechneDifferenzenUndZeigeErgebnisse() {
    const rechnungsbetrag = parseFloat(document.getElementById('rechnung').value) || 0;
    const namen = ["Andy", "Cedi", "Dave", "Fabio", "Kevin", "Marco", "Mo", "Ramon", "Raphi", "Roman", "Thomi"];
    let differenzen = [];

    namen.forEach(name => {
        const typ = document.getElementById(`typ${name}`).value;
        const tipp = parseFloat(document.getElementById(`betrag${name}`).value) || 0;

        if (typ !== "NA") {
            const differenz = Math.abs(tipp - rechnungsbetrag);
            differenzen.push({ name, differenz });
        }
    });

    // Sortieren der Differenzen
    differenzen.sort((a, b) => a.differenz - b.differenz);

    // Zuweisung der Ränge
    for (let i = 0; i < differenzen.length; i++) {
        differenzen[i].rang = i + 1;
    }

    // Anzeigen der Tabelle
    zeigeErgebnisTabelleBillBro(differenzen);
}

function berechneAutoTrinkgeld(rechnungsbetrag) {
    let trinkgeldProzent;
    let aufgerundeterBetrag;

    if (rechnungsbetrag <= 200) {
        trinkgeldProzent = 0.095; 
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 5) * 5;
    } else if (rechnungsbetrag <= 500) {
        trinkgeldProzent = 0.085    ; // 9% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 10) * 10;
    } else if (rechnungsbetrag <= 1000) {
        trinkgeldProzent = 0.085; // 9% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 10) * 10;
    } else if (rechnungsbetrag <= 1500) {
        trinkgeldProzent = 0.08; // 8% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 10) * 10;
    } else if (rechnungsbetrag <= 2000) {
        trinkgeldProzent = 0.07; // 7% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 20) * 20;
    } else {
        trinkgeldProzent = 0.05; // 6% Trinkgeld
        aufgerundeterBetrag = Math.ceil((rechnungsbetrag * (1 + trinkgeldProzent)) / 50) * 50;
    }

    let trinkgeld = aufgerundeterBetrag - rechnungsbetrag;
    let trinkgeldProzentEffektiv = trinkgeld / rechnungsbetrag;
    
    document.getElementById ('trinkgeldBetragErgebnis').textContent = trinkgeld.toFixed(0) + ' CHF';
    document.getElementById ('trinkgeldProzentErgebnis').textContent = (trinkgeldProzentEffektiv * 100).toFixed(2) + '%';
    return trinkgeldProzentEffektiv;
}

function zeigeErgebnisTabelleBillBro(differenzen) {
        let tabelle = "<table><tr><th>Name</th><th>Differenz</th><th>Rang</th></tr>";
        differenzen.forEach(d => {
            tabelle += `<tr><td>${d.name}</td><td>${d.differenz.toFixed(2)}</td><td>${d.rang}</td></tr>`;
        });
        tabelle += "</table>";
        document.getElementById('rangliste').innerHTML = tabelle;
        }

        function seiteZuruecksetzen() {
            var bestaetigung = confirm("Wirklich alles löschen?");
            if (bestaetigung) {
                location.reload(); // Aktualisiert die Seite
            }
}

function speichereErgebnisseBillBro() {
    // Bestätigungsdialog anzeigen
    var bestaetigung = confirm("Ergebnisse werden heruntergeladen. Schicke die Datei Andy oder stelle sie in unseren Chat. Yay, Statistik! :)");

    // Wenn der Benutzer auf "OK" klickt
    if (bestaetigung) {
        // Ergebnisse aus dem Rechner extrahieren
        const rechnerErgebnisse = document.getElementById('ergebnisse').textContent;

        // Ergebnisse aus der Rangliste extrahieren
        const ranglisteTabelle = document.getElementById('rangliste').getElementsByTagName('table')[0];
        let ranglisteErgebnisse = "Name,Differenz,Rang\n";
        for (let i = 1; i < ranglisteTabelle.rows.length; i++) {
            for (let j = 0; j < ranglisteTabelle.rows[i].cells.length; j++) {
                ranglisteErgebnisse += ranglisteTabelle.rows[i].cells[j].textContent.trim() + (j < ranglisteTabelle.rows[i].cells.length - 1 ? ',' : '\n');
            }
        }

        // CSV-Daten zusammensetzen
        const csvDaten = "Rechner Ergebnisse:\n" + rechnerErgebnisse + "\n\nRangliste:\n" + ranglisteErgebnisse;

        // CSV-Datei erstellen und zum Download anbieten
        const blob = new Blob([csvDaten], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = "ergebnisse.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}


/*//// Agenda ////*/

function ladeCSVDateiAgenda(url) {
    fetch(url)
        .then(response => response.text())
        .then(text => {
            const data = parseCSVAgenda(text);
            zeigeTabelleAgenda(data);
        })
    .catch(error => console.error('Fehler beim Laden der CSV:', error));
}

function parseCSVAgenda(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    const headers = lines[0].split(';');

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(';');

        for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
        }

        result.push(obj);
    }

    return result;
}

function formatiereDatumAgenda(isoDatum) {
    const datumObj = new Date(isoDatum);
    const tag = datumObj.getDate().toString().padStart(2, '0');
    const monat = (datumObj.getMonth() + 1).toString().padStart(2, '0'); // Monat beginnt bei 0
    const jahr = datumObj.getFullYear();
    return `${tag}.${monat}.${jahr}`; // Format: TT.MM.JJJJ
}

function zeigeTabelleAgenda(data) {
    let groupedByYear = data.reduce((acc, row) => {
        if (!row["Datum"] || row["Datum"].trim() === "") return acc; // Überspringt Zeilen ohne gültiges Datum
        const year = new Date(row["Datum"]).getFullYear();
        acc[year] = acc[year] || [];
        acc[year].push(row);
        return acc;
    }, {});

    let content = "";
    for (let year in groupedByYear) {
        content += `<h2>${year}</h2>`; // Fügt eine Überschrift für jedes Jahr hinzu
        content += "<table border='1'><tr><th>Datum</th><th>Event</th><th>Lead</th><th>Restaurant</th></tr>";
        groupedByYear[year].forEach(row => {
            const formatiertesDatum = formatiereDatumAgenda(row["Datum"]);
            content += "<tr>";
            content += `<td>${formatiertesDatum}</td>`;
            content += `<td>${row["Anlass"]}</td>`;
            content += `<td>${row["Lead"]}</td>`;
            content += `<td>${row["Restaurant"]}</td>`;
            content += "</tr>";
        });
        content += "</table><br>";
    }

        document.getElementById('agendaTabelle').innerHTML = content; 
}
        
// URL der CSV-Datei im Repository
ladeCSVDateiAgenda('https://maxandul.github.io/Gourmen/data/agenda.csv');






/*//// Liga Tabelle ////*/
async function ladeUndVerarbeiteCSVLigaTabelle(url) {
    const response = await fetch(url);
    const text = await response.text();
    return parseCSVLigaTabelle(text);
}

function parseCSVLigaTabelle(csvText) {
    let lines = csvText.split('\n').filter(line => line.trim() !== '');
    let headers = lines[0].split(';').slice(13); // Die Namen beginnen ab der 13. Spalte
    let data = lines.slice(1);

    let stats = headers.map(name => ({ name, sum: 0, count: 0, spiele: [] }));

    for (let line of data) {
        let values = line.split(';').slice(13);
        let isSpiel = values.some(value => value.trim() !== '' && value !== 'N/A');

        if (isSpiel) {
            values.forEach((value, index) => {
                if (value.trim() !== '' && value !== 'N/A') {
                    stats[index].sum += parseFloat(value);
                    stats[index].count++;
                    stats[index].spiele.push(value); // Füge das Ergebnis dem jeweiligen Spieler hinzu
                } else {
                    stats[index].spiele.push(''); // Füge einen leeren String hinzu, wenn kein Ergebnis vorhanden ist
                }
            });
        }
    }

    // Berechnen des Durchschnitts und Sortieren
    stats.forEach(player => {
        player.average = player.count > 0 ? player.sum / player.count : "N/A";
    });
    stats.sort((a, b) => (a.average === "N/A" ? 1 : b.average === "N/A" ? -1 : a.average - b.average));

    return { stats, spieleAnzahl: stats[0].spiele.length };
}

function erstelleRanglisteLigaTabelle(stats) {
    let tabelle = '<table><tr><th>Rang</th><th>Name</th><th>Diff. Schnitt</th><th>Spiele</th></tr>';
    stats.forEach((player, index) => {
        tabelle += `<tr><td>${index + 1}</td><td>${player.name}</td><td>${player.average !== "N/A" ? player.average.toFixed(2) : "N/A"}</td><td>${player.count}</td></tr>`;
    });
    tabelle += '</table>';
    document.getElementById('ranglisteLiga').innerHTML = tabelle;
}

function erstelleSpielplan(stats) {
    let tabelle = '<table><tr><th>Namen</th>';
    for (let i = 1; i <= stats[0].spiele.length; i++) {
        tabelle += `<th>${i}</th>`;
    }
    tabelle += '</tr>';

    stats.forEach(player => {
        tabelle += `<tr><td>${player.name}</td>`;
        player.spiele.forEach(spiel => {
            tabelle += `<td>${spiel}</td>`; // Füge das Ergebnis für jedes Spiel ein
        });
        tabelle += '</tr>';
    });

    tabelle += '</table>';
    document.getElementById('spielplan').innerHTML = tabelle;
}

ladeUndVerarbeiteCSVLigaTabelle('https://gourmen.github.io/Homepage/data/agenda.csv')
    .then(({ stats }) => {
        erstelleRanglisteLigaTabelle(stats);
        erstelleSpielplan(stats);
    })
    .catch(error => console.error('Fehler beim Laden der CSV:', error));
