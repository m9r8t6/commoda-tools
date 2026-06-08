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
    const webhookUrl = 'https://90a7b7f39b7d5f.lhr.life/webhook-test/mitarbeitersuche';
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
    const resultsContainer = document.getElementById('resultsGrid');
    // Wir ändern die Klasse per JS von Grid auf Liste, damit das neue CSS greift
    resultsContainer.className = 'results-list'; 
    
    const loader = document.getElementById('loader');
    const searchBtn = document.getElementById('searchBtn');
    
    loader.style.display = 'none';
    searchBtn.innerText = "Suchen";
    searchBtn.disabled = false;

    dataArray.forEach(person => {
        // Initialen für das Avatarbild
        const initials = person.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

        // Logik für das Plattform-Icon
        let platformIcon = person.platform.charAt(0).toUpperCase(); // Standard: 1. Buchstabe
        let platformNameLC = person.platform.toLowerCase();
        
        if (platformNameLC.includes('linkedin')) platformIcon = 'in';
        if (platformNameLC.includes('xing')) platformIcon = 'X';

        // HTML für eine Listen-Zeile
        const rowHTML = `
            <div class="candidate-row">
                
                <div class="row-left">
                    <div class="card-avatar">${initials}</div>
                    <div class="card-info">
                        <h3 style="font-size: 16px; margin-bottom: 2px;">${person.name}</h3>
                        <p style="font-size: 13px; color: var(--text-muted);">${person.role}</p>
                    </div>
                </div>

                <div class="row-middle">
                    <span style="font-size: 14px; color: var(--text-main); font-weight: 500;">📍 ${person.location}</span>
                    <span style="font-size: 13px; color: var(--text-muted);">Gefunden auf: ${person.platform}</span>
                </div>

                <div class="action-links">
                    <a href="mailto:?subject=Kontaktanfrage Steuerkanzlei&body=Hallo ${person.name}," title="E-Mail schreiben" class="icon-btn">✉️</a>
                    
                    <a href="${person.url}" target="_blank" title="Auf ${person.platform} ansehen" class="icon-btn">${platformIcon}</a>
                </div>

            </div>
        `;
        resultsContainer.innerHTML += rowHTML;
    });
}

function resetUI() {
    document.getElementById('loader').style.display = 'none';
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.innerText = "Suchen";
    searchBtn.disabled = false;
}