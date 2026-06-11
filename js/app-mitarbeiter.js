document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) {
        searchBtn.addEventListener('click', startSearch);
    }

    // Datalist Fix
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

    // Sidebar Fix: Wenn in der Sidebar wieder auf "Mitarbeitersuche" geklickt wird, Filter zurückholen
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            if(target === 'mitarbeiter') {
                goToSearch();
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

    // --- NEU: Blacklist erstellen ---
    // Wir holen deine gespeicherten Kandidaten und extrahieren nur deren URLs
    const saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    const blacklistUrls = saved.map(person => person.url).filter(url => url && url !== 'null');

    // Wir fügen die Blacklist in den Payload für n8n ein
    const payload = {
        jobtitel: job,
        ort: ort,
        distanz: distanz || "0 km (Vor Ort)",
        anzahl: anzahl,
        blacklist: blacklistUrls 
    };

    const webhookUrl = typeof getWebhookUrl === 'function' 
        ? getWebhookUrl('mitarbeitersuche') 
        : 'https://n8n.baeuerlein-dev.de/webhook/mitarbeitersuche';
        
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
    // Array speichern, damit wir es später filtern können
    sessionStorage.setItem('searchResults', JSON.stringify(dataArray));
    
    const resultsContainer = document.getElementById('resultsGrid');
    resultsContainer.className = 'results-list';
    resultsContainer.innerHTML = '';
    
    resetUI();

    if (!dataArray || dataArray.length === 0) {
        resultsContainer.innerHTML = '<p style="color: #6B7280; margin-top: 20px;">Keine passenden Profile gefunden.</p>';
        return;
    }
    
    // NEU: Lade bereits gespeicherte Profile
    const saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    
    // NEU: Filtere Profile heraus, die bereits gespeichert sind
    const filteredData = dataArray.filter(person => !saved.find(c => c.url === person.url));

    if (filteredData.length === 0) {
        resultsContainer.innerHTML = '<p style="color: #10B981; margin-top: 20px;">Alle gefundenen Profile in dieser Suche wurden bereits gespeichert!</p>';
        return;
    }

    filteredData.forEach((person) => {
        const initials = person.name && person.name !== 'null'
            ? person.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
            : '??';
        
        const cleanValue = (val) => (val && val !== 'null' && val !== null) ? val : 'nicht gefunden';
        
        const displayName = cleanValue(person.name);
        const displayRole = cleanValue(person.role);
        const displayLocation = cleanValue(person.location);
        const displayEmployment = cleanValue(person.employment_type);
        
        let actionsHTML = ``;
        
        if (person.email && person.email !== 'null' && person.email !== null) {
            actionsHTML += `<button onclick="copyEmail('${person.email}')" class="icon-btn" title="E-Mail kopieren">✉️</button>`;
        }
        if (person.url && person.url !== 'null' && person.url !== null) {
            actionsHTML += `<a href="${person.url}" target="_blank" class="icon-btn" title="Profil öffnen">🔗</a>`;
        }
        
        // NEU: Wir übergeben jetzt die URL statt den Index
        actionsHTML += `<button onclick="saveCandidateByUrl('${person.url}')" class="add-btn" title="Speichern">+</button>`;

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

// NEU: Speichert anhand der URL und entfernt das Element sofort
function saveCandidateByUrl(url) {
    const results = JSON.parse(sessionStorage.getItem('searchResults') || '[]');
    const candidate = results.find(c => c.url === url);
    
    if(!candidate) return;

    let saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    
    if(!saved.find(c => c.url === candidate.url)) {
        saved.push(candidate);
        localStorage.setItem('savedCandidates', JSON.stringify(saved));
        updateSavedCount(); 
        
        // Liste sofort neu rendern (gefiltert ohne den gerade gespeicherten)
        renderResults(results); 
    }
}

function copyEmail(email) {
    navigator.clipboard.writeText(email);
    alert("E-Mail kopiert: " + email);
}

// --- NAVIGATION & GESPEICHERT MODUL LOGIK ---

// NEU: Funktion um verlässlich zur Suche zurückzukehren
function goToSearch() {
    // Ansichten umschalten
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active-view'));
    document.getElementById('view-mitarbeiter').classList.add('active-view');
    
    // Sidebar-Highlight wieder auf Mitarbeitersuche setzen
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const mitarbeiterTab = document.querySelector('.nav-item[data-target="mitarbeiter"]');
    if(mitarbeiterTab) mitarbeiterTab.classList.add('active');

    // Filter wieder einblenden und Titel zurücksetzen
    document.getElementById('filters-mitarbeiter').style.display = 'flex';
    document.getElementById('appTitle').innerText = "Mitarbeitersuche";
}

document.addEventListener("DOMContentLoaded", () => {
    updateSavedCount();

    const savedBtn = document.getElementById('nav-saved-btn');
    if (savedBtn) {
        savedBtn.addEventListener('click', () => {
            document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active-view'));
            document.getElementById('view-saved').classList.add('active-view');
            
            // Sidebar-Highlight entfernen
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            
            // Filter ausblenden & Titel ändern
            document.getElementById('filters-mitarbeiter').style.display = 'none';
            document.getElementById('appTitle').innerText = "Gespeicherte Profile";
            
            renderSavedCandidates();
        });
    }
});

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

function removeCandidate(url) {
    let saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    saved = saved.filter(c => c.url !== url);
    localStorage.setItem('savedCandidates', JSON.stringify(saved));
    
    updateSavedCount();
    renderSavedCandidates(); 
}

function updateSavedCount() {
    const saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    const countBadge = document.getElementById('saved-count');
    if (countBadge) countBadge.innerText = saved.length;
}

function exportCSV() {
    const saved = JSON.parse(localStorage.getItem('savedCandidates') || '[]');
    
    if (saved.length === 0) {
        alert("Keine Profile zum Exportieren vorhanden.");
        return;
    }

    let csvContent = "\uFEFF";
    csvContent += "Name;Rolle;Status;Ort;Profil-Link;E-Mail\n";

    saved.forEach(person => {
        const clean = (val) => {
            if (!val || val === 'null') return 'nicht gefunden';
            return val.replace(/"/g, '""'); 
        };

        const row = [
            `"${clean(person.name)}"`,
            `"${clean(person.role)}"`,
            `"${clean(person.employment_type)}"`,
            `"${clean(person.location)}"`,
            `"${clean(person.url)}"`,
            `"${clean(person.email)}"`
        ];

        csvContent += row.join(";") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "commoda_kandidaten_pipeline.csv");
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link); 
}