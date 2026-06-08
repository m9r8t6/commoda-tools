document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) {
        searchBtn.addEventListener('click', startSearch);
    }

    // --- NEU: Datalist Fix (Zeigt immer alle Optionen beim Klicken) ---
    const datalistInputs = document.querySelectorAll('input[list]');
    datalistInputs.forEach(input => {
        // Wenn das Feld angeklickt wird: Aktuellen Wert merken und Feld leeren
        input.addEventListener('focus', function() {
            this.dataset.oldValue = this.value; 
            this.value = ''; 
        });

        // Wenn man woanders hinklickt: Alten Wert wiederherstellen, falls es leer blieb
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.value = this.dataset.oldValue || '';
            }
        });
    });
    // ----------------------------------------------------------------
});

function startSearch() {
    // 1. Werte aus den neuen Feldern auslesen
    const job = document.getElementById('jobFilter').value;
    const ort = document.getElementById('ortFilter').value;
    const distanz = document.getElementById('distanzFilter').value;
    let anzahl = document.getElementById('anzahlFilter').value;

    // 2. Basis-Validierung (Job und Ort sind Pflicht)
    if(!job || !ort) {
        alert("Bitte mindestens den Job und den Ort ausfüllen!");
        return;
    }

    // 3. Sicherheits-Check für die Anzahl (Maximal 10 erlauben)
    anzahl = parseInt(anzahl);
    if (anzahl > 10) {
        anzahl = 10;
        document.getElementById('anzahlFilter').value = 10;
        alert("Sicherheitslimit: Es werden maximal 10 Ergebnisse gesucht, um Server-Timeouts zu vermeiden.");
    } else if (anzahl < 1 || isNaN(anzahl)) {
        anzahl = 5; // Fallback, falls jemand Quatsch eingibt
        document.getElementById('anzahlFilter').value = 5;
    }

    // UI auf Ladezustand setzen
    const resultsGrid = document.getElementById('resultsGrid');
    const loader = document.getElementById('loader');
    const searchBtn = document.getElementById('searchBtn');
    
    resultsGrid.innerHTML = '';
    loader.style.display = 'flex';
    searchBtn.innerText = "Sucht...";
    searchBtn.disabled = true;

    // 4. Payload für n8n (inklusive dem neuen Distanz-Filter)
    const payload = {
        jobtitel: job,
        ort: ort,
        distanz: distanz || "0 km (Vor Ort)", // Standardwert, falls leer gelassen
        anzahl: anzahl
    };

    console.log("Sende Daten an n8n:", payload);

    //FETCH CALL 
    const webhookUrl = 'https://ce1cc93ab937d3.lhr.life/webhook-test/mitarbeitersuche';
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => renderResults(data))
    .catch(error => {
        console.error(error);
        alert("Fehler bei der Serververbindung");
        resetUI();
    });
}
ok 

function renderResults(dataArray) {
    // Ergebnisse für später speichern (für den Speicher-Button)
    sessionStorage.setItem('searchResults', JSON.stringify(dataArray));
    
    const resultsContainer = document.getElementById('resultsGrid');
    resultsContainer.className = 'results-list';
    resultsContainer.innerHTML = '';
    
    dataArray.forEach((person, index) => {
        const initials = person.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        
        let actionsHTML = ``;
        
        // Bedingtes Rendering: Nur anzeigen, wenn Daten vorhanden
        if (person.email) {
            actionsHTML += `<button onclick="copyEmail('${person.email}')" class="icon-btn" title="E-Mail kopieren">✉️</button>`;
        }
        if (person.url) {
            actionsHTML += `<a href="${person.url}" target="_blank" class="icon-btn">🔗</a>`;
        }
        
        // Add Button
        actionsHTML += `<button onclick="saveCandidate(${index})" class="add-btn" title="Speichern">+</button>`;

        resultsContainer.innerHTML += `
            <div class="candidate-row">
                <div class="row-left">
                    <div class="card-avatar">${initials}</div>
                    <div class="card-info">
                        <h3>${person.name}</h3>
                        <p>${person.role}</p>
                    </div>
                </div>
                <div class="row-middle">
                    <span>📍 ${person.location}</span>
                </div>
                <div class="action-links">${actionsHTML}</div>
            </div>
        `;
    });
}

function resetUI() {
    document.getElementById('loader').style.display = 'none';
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.innerText = "Suchen";
    searchBtn.disabled = false;
}

// --- NEUE FUNKTION: Speichern ---
function saveCandidate(personIndex) {
    const results = JSON.parse(sessionStorage.getItem('searchResults'));
    const candidate = results[personIndex];
    let saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    
    // Verhindere Duplikate
    if(!saved.find(c => c.url === candidate.url)) {
        saved.push(candidate);
        localStorage.setItem('savedCandidates', JSON.stringify(saved));
        alert("Kandidat gespeichert!");
    }
}

// --- NEUE FUNKTION: E-Mail kopieren ---
function copyEmail(email) {
    navigator.clipboard.writeText(email);
    alert("E-Mail kopiert: " + email);
}