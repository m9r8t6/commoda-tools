document.addEventListener("DOMContentLoaded", () => {
    // Event-Listener an den Such-Button binden
    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) {
        searchBtn.addEventListener('click', startSearch);
    }
});

function startSearch() {
    const job = document.getElementById('jobFilter').value;
    const ort = document.getElementById('distanzFilter').value;
    const anzahl = document.getElementById('anzahlFilter').value;

    if(!job || !ort) {
        alert("Bitte Job und Ort ausfüllen!");
        return;
    }

    // UI Elemente holen
    const resultsGrid = document.getElementById('resultsGrid');
    const loader = document.getElementById('loader');
    const searchBtn = document.getElementById('searchBtn');
    
    // UI auf Ladezustand setzen
    resultsGrid.innerHTML = '';
    loader.style.display = 'flex';
    searchBtn.innerText = "Sucht...";
    searchBtn.disabled = true;

    // Payload für n8n
    const payload = {
        jobtitel: job,
        ort: ort,
        anzahl: anzahl
    };

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
            { name: "Max Mustermann", role: job, location: ort, platform: "LinkedIn", url: "#" },
            { name: "Anna Schmidt", role: "Senior " + job, location: ort + " (Umkreis 10km)", platform: "Xing", url: "#" },
            { name: "Thomas Weber", role: job, location: ort, platform: "LinkedIn", url: "#" }
        ];
        renderResults(mockData);
    }, 2000); // 2 Sekunden Lade-Simulation
}

function renderResults(dataArray) {
    const resultsGrid = document.getElementById('resultsGrid');
    const loader = document.getElementById('loader');
    const searchBtn = document.getElementById('searchBtn');
    
    // Loader verstecken, Button zurücksetzen
    loader.style.display = 'none';
    searchBtn.innerText = "Suchen";
    searchBtn.disabled = false;

    // Karten generieren
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