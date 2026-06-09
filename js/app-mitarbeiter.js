document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) {
        searchBtn.addEventListener('click', startSearch);
    }

    // Datalist Fix (Zeigt immer alle Optionen beim Klicken)
    const datalistInputs = document.querySelectorAll('input[list]');
    datalistInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.dataset.oldValue = this.value; 
            this.value = ''; 
        });

        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.value = this.dataset.oldValue || '';
            }
        });
    });
});

function startSearch() {
    const job = document.getElementById('jobFilter').value;
    const ort = document.getElementById('ortFilter').value;
    const distanz = document.getElementById('distanzFilter').value;
    let anzahl = document.getElementById('anzahlFilter').value;

    if(!job || !ort) {
        alert("Bitte mindestens den Job und den Ort ausfüllen!");
        return;
    }

    anzahl = parseInt(anzahl);
    if (anzahl > 10) {
        anzahl = 10;
        document.getElementById('anzahlFilter').value = 10;
        alert("Sicherheitslimit: Es werden maximal 10 Ergebnisse gesucht.");
    } else if (anzahl < 1 || isNaN(anzahl)) {
        anzahl = 5;
        document.getElementById('anzahlFilter').value = 5;
    }

    const resultsGrid = document.getElementById('resultsGrid');
    const loader = document.getElementById('loader');
    const searchBtn = document.getElementById('searchBtn');
    
    resultsGrid.innerHTML = '';
    loader.style.display = 'flex';
    searchBtn.innerText = "Sucht...";
    searchBtn.disabled = true;

    const payload = {
        jobtitel: job,
        ort: ort,
        distanz: distanz || "0 km (Vor Ort)",
        anzahl: anzahl
    };

    console.log("Sende Daten an n8n:", payload);

    const webhookUrl = 'https://n8n.baeuerlein-dev.de/webhook-test/mitarbeitersuche';
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

function renderResults(dataArray) {
    sessionStorage.setItem('searchResults', JSON.stringify(dataArray));
    
    const resultsContainer = document.getElementById('resultsGrid');
    resultsContainer.className = 'results-list';
    resultsContainer.innerHTML = '';
    
    // UI nach erfolgreichem Empfang zurücksetzen
    resetUI();

    if (!dataArray || dataArray.length === 0) {
        resultsContainer.innerHTML = '<p style="color: #6B7280; margin-top: 20px;">Keine passenden Profile gefunden.</p>';
        return;
    }
    
    dataArray.forEach((person, index) => {
        // Sicherstellen, dass ein Name für die Initialen existiert
        const initials = person.name && person.name !== 'null'
            ? person.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
            : '??';
        
        // Hilfsfunktion: Prüft auf Existenz, echten Inhalt und schließt den n8n-String 'null' aus
        const cleanValue = (val) => (val && val !== 'null' && val !== null) ? val : 'nicht gefunden';
        
        const displayName = cleanValue(person.name);
        const displayRole = cleanValue(person.role);
        const displayLocation = cleanValue(person.location);
        const displayEmployment = cleanValue(person.employment_type);
        
        let actionsHTML = ``;
        
        // BEDINGTES RENDERING: Buttons erscheinen nur, wenn der Wert existiert und ungleich 'null' ist
        if (person.email && person.email !== 'null' && person.email !== null) {
            actionsHTML += `<button onclick="copyEmail('${person.email}')" class="icon-btn" title="E-Mail kopieren">✉️</button>`;
        }
        if (person.url && person.url !== 'null' && person.url !== null) {
            actionsHTML += `<a href="${person.url}" target="_blank" class="icon-btn" title="Profil öffnen">🔗</a>`;
        }
        
        actionsHTML += `<button onclick="saveCandidate(${index})" class="add-btn" title="Speichern">+</button>`;

        // Ausgabe inklusive dem neuen Typ (z. B. Freelancer / Kanzleiname)
        resultsContainer.innerHTML += `
            <div class="candidate-row">
                <div class="row-left">
                    <div class="card-avatar">${initials}</div>
                    <div class="card-info">
                        <h3>${displayName}</h3>
                        <p><strong>${displayRole}</strong> <span class="status-badge" style="font-size: 0.85em; color: #6B7280;">(${displayEmployment})</span></p>
                    </div>
                </div>
                <div class="row-middle">
                    <span>📍 ${displayLocation}</span>
                </div>
                <div class="action-links">${actionsHTML}</div>
            </div>
        `;
    });
}

function resetUI() {
    const loader = document.getElementById('loader');
    if(loader) loader.style.display = 'none';
    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) {
        searchBtn.innerText = "Suchen";
        searchBtn.disabled = false;
    }
}


function saveCandidate(personIndex) {
    const results = JSON.parse(sessionStorage.getItem('searchResults'));
    const candidate = results[personIndex];
    let saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    
    if(!saved.find(c => c.url === candidate.url)) {
        saved.push(candidate);
        localStorage.setItem('savedCandidates', JSON.stringify(saved));
        updateSavedCount(); // NEU: Zähler sofort aktualisieren
        alert("Kandidat gespeichert!");
    } else {
        alert("Dieser Kandidat ist bereits gespeichert.");
    }
}

function copyEmail(email) {
    navigator.clipboard.writeText(email);
    alert("E-Mail kopiert: " + email);
}

// --- GESPEICHERT MODUL LOGIK ---

// 1. Event-Listener für den neuen Topnav-Button
document.addEventListener("DOMContentLoaded", () => {
    updateSavedCount(); // Zähler beim Start laden

    const savedBtn = document.getElementById('nav-saved-btn');
    if (savedBtn) {
        savedBtn.addEventListener('click', () => {
            // Ansichten umschalten
            document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active-view'));
            document.getElementById('view-saved').classList.add('active-view');
            
            // Filter ausblenden & Titel ändern
            document.getElementById('filters-mitarbeiter').style.display = 'none';
            document.getElementById('appTitle').innerText = "Gespeicherte Profile";
            
            // Daten rendern
            renderSavedCandidates();
        });
    }
});

// 2. Funktion zum Rendern der gespeicherten Liste
function renderSavedCandidates() {
    const savedGrid = document.getElementById('savedGrid');
    const saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    
    savedGrid.innerHTML = '';

    if (saved.length === 0) {
        savedGrid.innerHTML = '<p style="color: #6B7280; padding: 20px;">Du hast noch keine Profile gespeichert.</p>';
        return;
    }

    saved.forEach((person) => {
        const initials = person.name && person.name !== 'null' ? person.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : '??';
        const cleanValue = (val) => (val && val !== 'null' && val !== null) ? val : 'nicht gefunden';
        
        let actionsHTML = ``;
        if (person.email && person.email !== 'null') {
            actionsHTML += `<button onclick="copyEmail('${person.email}')" class="icon-btn" title="E-Mail kopieren">✉️</button>`;
        }
        if (person.url && person.url !== 'null') {
            actionsHTML += `<a href="${person.url}" target="_blank" class="icon-btn" title="Profil öffnen">🔗</a>`;
        }
        // Neuer Löschen-Button (Mülleimer)
        actionsHTML += `<button onclick="removeCandidate('${person.url}')" class="icon-btn" style="color: #EF4444;" title="Löschen">🗑️</button>`;

        savedGrid.innerHTML += `
            <div class="candidate-row">
                <div class="row-left">
                    <div class="card-avatar">${initials}</div>
                    <div class="card-info">
                        <h3>${cleanValue(person.name)}</h3>
                        <p><strong>${cleanValue(person.role)}</strong> <span class="status-badge" style="font-size: 0.85em; color: #6B7280;">(${cleanValue(person.employment_type)})</span></p>
                    </div>
                </div>
                <div class="row-middle">
                    <span>📍 ${cleanValue(person.location)}</span>
                </div>
                <div class="action-links">${actionsHTML}</div>
            </div>
        `;
    });
}

// 3. Funktion zum Löschen eines Profils
function removeCandidate(url) {
    let saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    // Alle Profile behalten, die NICHT diese URL haben
    saved = saved.filter(c => c.url !== url);
    localStorage.setItem('savedCandidates', JSON.stringify(saved));
    
    updateSavedCount();
    renderSavedCandidates(); // Liste sofort aktualisieren
}

// 4. Funktion zum Aktualisieren des Zählers oben rechts
function updateSavedCount() {
    const saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    const countBadge = document.getElementById('saved-count');
    if (countBadge) countBadge.innerText = saved.length;
}

// --- NEU: CSV EXPORT FUNKTION ---
function exportCSV() {
    const saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    
    if (saved.length === 0) {
        alert("Keine Profile zum Exportieren vorhanden.");
        return;
    }

    // 1. UTF-8 BOM hinzufügen, damit Microsoft Excel Umlaute (ä,ö,ü) richtig erkennt!
    let csvContent = "\uFEFF";
    
    // 2. Kopfzeile (Header) anlegen, getrennt mit Semikolon für das europäische Excel
    csvContent += "Name;Rolle;Status;Ort;Profil-Link;E-Mail\n";

    // 3. Daten durchgehen und Zeile für Zeile anhängen
    saved.forEach(person => {
        // Hilfsfunktion: Wandelt fehlende Daten in "nicht gefunden" um und schützt vor Fehlern
        const clean = (val) => {
            if (!val || val === 'null') return 'nicht gefunden';
            // Falls in der Rolle ein Anführungszeichen steht, wird es escapt
            return val.replace(/"/g, '""'); 
        };

        // Einzelne Spalten bauen und in Anführungszeichen setzen (schützt vor Kommas im Text)
        const row = [
            `"${clean(person.name)}"`,
            `"${clean(person.role)}"`,
            `"${clean(person.employment_type)}"`,
            `"${clean(person.location)}"`,
            `"${clean(person.url)}"`,
            `"${clean(person.email)}"`
        ];

        // Zeile mit Semikolons zusammensetzen und Zeilenumbruch anhängen
        csvContent += row.join(";") + "\n";
    });

    // 4. Virtuelle Datei erzeugen und Download triggern
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "commoda_kandidaten_pipeline.csv");
    document.body.appendChild(link);
    link.click(); // Automatischer Klick löst den Download aus
    document.body.removeChild(link); // Aufräumen
}