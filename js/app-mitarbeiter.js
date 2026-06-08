document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) {
        searchBtn.addEventListener('click', startSearch);
    }
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

    /* --- ECHTER FETCH CALL (Für später) --- 
    const webhookUrl = 'https://n8n.deine-domain.de/webhook/mitarbeitersuche';
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
    -------------------------------------------------------- */

    // --- MOCK-DATEN FÜR DEN PROTOTYPEN ---
    setTimeout(() => {
        const mockData = [
            { name: "Max Mustermann", role: job, location: ort + (distanz ? ` (Umkreis: ${distanz})` : ""), platform: "LinkedIn", url: "#" },
            { name: "Anna Schmidt", role: "Senior " + job, location: ort, platform: "Xing", url: "#" },
            { name: "Thomas Weber", role: job, location: ort, platform: "LinkedIn", url: "#" }
        ];
        
        // Wir kürzen die Mock-Daten auf die eingestellte Anzahl (falls jemand z.B. 2 eingibt)
        renderResults(mockData.slice(0, anzahl));
    }, 2000); 
}

function renderResults(dataArray) {
    const resultsGrid = document.getElementById('resultsGrid');
    const loader = document.getElementById('loader');
    const searchBtn = document.getElementById('searchBtn');
    
    loader.style.display = 'none';
    searchBtn.innerText = "Suchen";
    searchBtn.disabled = false;

    dataArray.forEach(person => {
        const initials = person.name.split(' ').map(n => n[0]).join('').substring(0,2);

        const cardHTML = `
            <div class="candidate-card">
                <div class="card-header">
                    <div class="card-avatar">${initials}</div>
                    <div class="card-info">
                        <h3>${person.name}</h3>
                        <p>${person.role}</p>
                    </div>
                </div>
                <div class="card-meta">
                    📍 ${person.location} <br>
                    🔗 Gefunden auf ${person.platform}
                </div>
                <a href="${person.url}" target="_blank" class="btn-outline">Profil öffnen</a>
            </div>
        `;
        resultsGrid.innerHTML += cardHTML;
    });
}

function resetUI() {
    document.getElementById('loader').style.display = 'none';
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.innerText = "Suchen";
    searchBtn.disabled = false;
}