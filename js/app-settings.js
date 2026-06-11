document.addEventListener("DOMContentLoaded", () => {
    // Standardwerte in localStorage initialisieren, falls nicht vorhanden
    if (localStorage.getItem('n8nBaseUrl') === null) {
        localStorage.setItem('n8nBaseUrl', 'https://n8n.baeuerlein-dev.de/webhook');
    }
    if (localStorage.getItem('fallbackMockEnabled') === null) {
        localStorage.setItem('fallbackMockEnabled', 'true');
    }

    // inputs befüllen
    const n8nUrlInput = document.getElementById('settingsN8nUrl');
    const fallbackMockInput = document.getElementById('settingsFallbackMock');
    const saveBtn = document.getElementById('saveSettingsBtn');

    if (n8nUrlInput) {
        n8nUrlInput.value = localStorage.getItem('n8nBaseUrl');
    }
    if (fallbackMockInput) {
        fallbackMockInput.checked = localStorage.getItem('fallbackMockEnabled') === 'true';
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveKanzleiSettings);
    }
});

function saveKanzleiSettings() {
    const n8nUrlInput = document.getElementById('settingsN8nUrl');
    const fallbackMockInput = document.getElementById('settingsFallbackMock');
    const saveBtn = document.getElementById('saveSettingsBtn');

    if (!n8nUrlInput) return;

    let urlValue = n8nUrlInput.value.trim();
    // Falls der Benutzer den schrägen Slash am Ende vergisst
    if (urlValue.endsWith('/')) {
        urlValue = urlValue.slice(0, -1);
    }

    localStorage.setItem('n8nBaseUrl', urlValue);
    localStorage.setItem('fallbackMockEnabled', fallbackMockInput.checked ? 'true' : 'false');

    // Visuelles Feedback
    if (saveBtn) {
        const oldText = saveBtn.innerText;
        saveBtn.innerText = "Gespeichert! ✓";
        saveBtn.style.backgroundColor = '#10B981'; // Grün
        
        setTimeout(() => {
            saveBtn.innerText = oldText;
            saveBtn.style.backgroundColor = ''; // Zurücksetzen auf CSS Standard
        }, 2000);
    }
}

// Hilfsfunktion für andere Module, um die Webhook-URL zu bestimmen
function getWebhookUrl(endpointPath) {
    const baseUrl = localStorage.getItem('n8nBaseUrl') || 'https://n8n.baeuerlein-dev.de/webhook';
    // Pfad anhängen (stellt sicher, dass wir einen führenden Slash haben)
    const cleanPath = endpointPath.startsWith('/') ? endpointPath : '/' + endpointPath;
    return baseUrl + cleanPath;
}

// Hilfsfunktion für andere Module, um zu prüfen, ob der Fallback-Mock aktiv sein soll
function isFallbackMockEnabled() {
    return localStorage.getItem('fallbackMockEnabled') === 'true';
}
