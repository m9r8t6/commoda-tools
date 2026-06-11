document.addEventListener("DOMContentLoaded", () => {
    const translateBtn = document.getElementById('translateBtn');
    const copyBtn = document.getElementById('copyDiplomatBtn');
    
    if (translateBtn) {
        translateBtn.addEventListener('click', rewriteText);
    }
    if (copyBtn) {
        copyBtn.addEventListener('click', copyRewrittenText);
    }
});

function rewriteText() {
    const inputText = document.getElementById('diplomatInput').value.trim();
    const senderName = document.getElementById('diplomatSender').value.trim();
    const recipientName = document.getElementById('diplomatRecipient').value.trim();

    if (!inputText) {
        alert("Bitte gib einen Rohtext ein, der diplomatisch umschrieben werden soll!");
        return;
    }

    const loader = document.getElementById('diplomatLoader');
    const outputBox = document.getElementById('diplomatOutput');
    const translateBtn = document.getElementById('translateBtn');
    const copyBtn = document.getElementById('copyDiplomatBtn');

    outputBox.classList.add('placeholder');
    outputBox.innerText = "Die diplomatische Antwort erscheint hier...";
    copyBtn.disabled = true;
    loader.style.display = 'flex';
    translateBtn.disabled = true;
    translateBtn.innerText = "Schreibt um...";

    const payload = { 
        text: inputText,
        sender: senderName,
        recipient: recipientName
    };
    const webhookUrl = 'https://n8n.baeuerlein-dev.de/webhook/aidiplomat';

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Fehler bei der Serverantwort");
        }
        return response.text().then(text => {
            try {
                const json = JSON.parse(text);
                return json.rewritten || json.text || text;
            } catch(e) {
                return text;
            }
        });
    })
    .then(rewrittenText => {
        displayRewrittenText(rewrittenText);
    })
    .catch(error => {
        console.error("Kanzlei-Diplomat Fehler:", error);
        outputBox.classList.remove('placeholder');
        outputBox.innerText = "Fehler: Die Umschreibung konnte nicht durchgeführt werden. Bitte überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später noch einmal.";
    })
    .finally(() => {
        loader.style.display = 'none';
        translateBtn.disabled = false;
        translateBtn.innerText = "Umformulieren";
    });
}

function displayRewrittenText(text) {
    const outputBox = document.getElementById('diplomatOutput');
    const copyBtn = document.getElementById('copyDiplomatBtn');

    outputBox.classList.remove('placeholder');
    outputBox.innerText = text;
    copyBtn.disabled = false;
}

function copyRewrittenText() {
    const outputText = document.getElementById('diplomatOutput').innerText;
    const copyBtn = document.getElementById('copyDiplomatBtn');

    navigator.clipboard.writeText(outputText)
        .then(() => {
            const oldText = copyBtn.innerText;
            copyBtn.innerText = "Kopiert! ✓";
            copyBtn.classList.remove('btn-secondary');
            copyBtn.classList.add('btn-primary');
            copyBtn.style.backgroundColor = '#10B981'; // Green accent
            
            setTimeout(() => {
                copyBtn.innerText = oldText;
                copyBtn.classList.remove('btn-primary');
                copyBtn.classList.add('btn-secondary');
                copyBtn.style.backgroundColor = '';
            }, 2000);
        })
        .catch(err => {
            console.error("Fehler beim Kopieren:", err);
            alert("Kopieren fehlgeschlagen.");
        });
}
