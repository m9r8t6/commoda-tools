document.addEventListener("DOMContentLoaded", () => {
    const checkBtn = document.getElementById('checkBewirtungBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkBewirtungsbeleg);
    }
});

function checkBewirtungsbeleg() {
    const text = document.getElementById('bewirtungText').value.trim();
    if (!text) {
        alert("Bitte gib den Text oder die Belegdaten ein!");
        return;
    }

    const loader = document.getElementById('bewirtungLoader');
    const resultDiv = document.getElementById('bewirtungResult');
    const checkBtn = document.getElementById('checkBewirtungBtn');

    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';
    loader.style.display = 'flex';
    checkBtn.disabled = true;
    checkBtn.innerText = "Prüfe...";

    const payload = { text: text };
    const webhookUrl = typeof getWebhookUrl === 'function' 
        ? getWebhookUrl('bewirtungsbeleg') 
        : 'https://n8n.baeuerlein-dev.de/webhook/bewirtungsbeleg';

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Fehler bei der Serverantwort");
        }
        return response.text().then(responseText => {
            try {
                return JSON.parse(responseText);
            } catch(e) {
                // Falls die KI reinen Text zurückgibt
                return { isRawText: true, text: responseText };
            }
        });
    })
    .then(data => {
        renderBewirtungResult(data);
    })
    .catch(error => {
        console.error("Bewirtung-Checker Fehler:", error);
        if (typeof isFallbackMockEnabled !== 'function' || isFallbackMockEnabled()) {
            renderBewirtungFallback(text);
        } else {
            alert("Fehler bei der Serververbindung: Der n8n Webhook konnte nicht erreicht werden und lokale Mocks sind deaktiviert.");
        }
    })
    .finally(() => {
        loader.style.display = 'none';
        checkBtn.disabled = false;
        checkBtn.innerText = "Beleg prüfen";
    });
}

function renderBewirtungResult(data) {
    const resultDiv = document.getElementById('bewirtungResult');
    resultDiv.style.display = 'block';

    if (data.isRawText) {
        // Text-Antwort formatieren
        const alertClass = data.text.toLowerCase().includes("achtung") || data.text.toLowerCase().includes("fehler")
            ? 'status-card-warning' : 'status-card-success';
        const icon = alertClass === 'status-card-success' ? '✅' : '⚠️';
        
        resultDiv.innerHTML = `
            <div class="status-card ${alertClass}">
                <div class="status-icon">${icon}</div>
                <div class="status-content">
                    <h4>Prüfergebnis (Text)</h4>
                    <p style="white-space: pre-wrap;">${data.text}</p>
                </div>
            </div>
        `;
        return;
    }

    // Strukturiertes JSON rendern
    const isValid = data.isValid ?? true;
    const summary = data.summary || (isValid ? "Alle Pflichtangaben scheinen vorhanden zu sein." : "Es wurden formelle Mängel festgestellt.");
    const checks = data.checks || [];

    const cardClass = isValid ? 'status-card-success' : 'status-card-warning';
    const mainIcon = isValid ? '✅' : '⚠️';

    let checksHTML = '';
    if (checks.length > 0) {
        checksHTML = `<div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">`;
        checks.forEach(check => {
            let statusIcon = '⚪';
            let statusColor = 'inherit';
            if (check.status === 'ok') {
                statusIcon = '✅';
                statusColor = '#059669';
            } else if (check.status === 'warning') {
                statusIcon = '⚠️';
                statusColor = '#D97706';
            } else if (check.status === 'danger') {
                statusIcon = '❌';
                statusColor = '#DC2626';
            }
            checksHTML += `
                <div class="checklist-item" style="color: ${statusColor};">
                    <span style="font-size: 1.1rem; margin-right: 4px;">${statusIcon}</span>
                    <strong>${check.name}:</strong>&nbsp;<span>${check.detail}</span>
                </div>
            `;
        });
        checksHTML += `</div>`;
    }

    resultDiv.innerHTML = `
        <div class="status-card ${cardClass}">
            <div class="status-icon">${mainIcon}</div>
            <div class="status-content" style="width: 100%;">
                <h4>${isValid ? 'Beleg formal in Ordnung' : 'Kritische Mängel gefunden'}</h4>
                <p>${summary}</p>
                ${checksHTML}
            </div>
        </div>
    `;
}

// Fallback/Mock für Entwicklungszwecke oder wenn n8n nicht erreichbar ist
function renderBewirtungFallback(inputText) {
    console.warn("Nutze lokalen Fallback-Prüfer für Bewirtungsbeleg");
    const lower = inputText.toLowerCase();
    const checks = [];
    let isValid = true;
    let summary = "Der Beleg wurde lokal analysiert. Folgende Punkte wurden identifiziert:";

    // Simples lokales Regelwerk für die Demo
    // 1. Ort
    if (lower.includes("restaurant") || lower.includes("gaststätte") || lower.includes("wirtshaus") || lower.includes("xy")) {
        checks.push({ name: "Ort der Bewirtung", status: "ok", detail: "Gefunden im Text." });
    } else {
        checks.push({ name: "Ort der Bewirtung", status: "warning", detail: "Kein eindeutiger Bewirtungsort (Restaurantname) erkannt." });
        isValid = false;
    }

    // 2. Datum
    const dateMatch = inputText.match(/\d{2}\.\d{2}\.\d{4}/);
    if (dateMatch) {
        checks.push({ name: "Datum der Bewirtung", status: "ok", detail: dateMatch[0] });
    } else {
        checks.push({ name: "Datum der Bewirtung", status: "danger", detail: "Kein Datum im Format DD.MM.YYYY gefunden." });
        isValid = false;
    }

    // 3. Teilnehmer
    if (lower.includes("teilnehmer") || lower.includes("personen") || lower.includes("herr") || lower.includes("frau") || lower.includes("mitarbeiter") || lower.includes("gäst")) {
        checks.push({ name: "Teilnehmer (namentlich)", status: "ok", detail: "Teilnehmerangaben vorhanden." });
    } else {
        checks.push({ name: "Teilnehmer (namentlich)", status: "danger", detail: "Es wurden keine Teilnehmernamen gefunden. Jede Person muss einzeln namentlich erfasst sein." });
        isValid = false;
    }

    // 4. Anlass
    if (lower.includes("anlass") || lower.includes("grund")) {
        if (lower.includes("geschäftsessen") || lower.includes("arbeitsgespräch") || lower.includes("besprechung")) {
            checks.push({ name: "Konkreter Anlass", status: "danger", detail: "Der Anlass ('Geschäftsessen' / 'Arbeitsgespräch') ist steuerlich zu vage. Konkretisiere z.B. 'Besprechung des Projekts X' oder 'Akquise Mandant Y'." });
            isValid = false;
        } else {
            checks.push({ name: "Konkreter Anlass", status: "ok", detail: "Anlass erfasst." });
        }
    } else {
        checks.push({ name: "Konkreter Anlass", status: "danger", detail: "Es wurde kein Bewirtungsanlass gefunden." });
        isValid = false;
    }

    // 5. Betrag
    if (lower.includes("betrag") || lower.includes("eur") || lower.includes("€")) {
        checks.push({ name: "Aufwendungen", status: "ok", detail: "Betrag erfasst." });
    } else {
        checks.push({ name: "Aufwendungen", status: "warning", detail: "Keine Betragsangabe (z.B. in EUR / €) erkannt." });
    }

    // 6. Trinkgeld
    if (lower.includes("trinkgeld")) {
        if (lower.includes("quittung") || lower.includes("quittiert") || lower.includes("bestätigt")) {
            checks.push({ name: "Trinkgeld-Quittung", status: "ok", detail: "Trinkgeld ordnungsgemäß quittiert." });
        } else {
            checks.push({ name: "Trinkgeld-Quittung", status: "warning", detail: "Trinkgeld angegeben, aber keine Quittungsbestätigung vom Kellner vermerkt." });
        }
    }

    const data = {
        isValid: isValid,
        summary: isValid ? "Der Beleg erfüllt alle formalen Kriterien." : "Der Beleg weist formale Mängel auf, die bei einer Betriebsprüfung zur Nichtanerkennung führen können.",
        checks: checks
    };
    renderBewirtungResult(data);
}
