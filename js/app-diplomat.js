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

    const payload = { text: inputText };
    const webhookUrl = 'https://n8n.baeuerlein-dev.de/webhook/kanzlei-diplomat';

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
        rewriteFallback(inputText);
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

function rewriteFallback(text) {
    console.warn("Nutze lokalen Fallback-Umschreiber für den Kanzlei-Diplomaten");
    
    // Simples humorvolles / professionelles Regelwerk für Steuerberater-Kanzleien
    let responseText = "";
    const lower = text.toLowerCase();

    if (lower.includes("werbungskosten") || lower.includes("belege") || lower.includes("einreichen")) {
        responseText = 
`Sehr geehrte Damen und Herren,
Sehr geehrte(r) Mandant(in),

wir beziehen uns auf Ihre Einkommensteuererklärung für das Jahr 2024. Um eine sachgerechte und für Sie vorteilhafte Erklärung ausarbeiten zu können, benötigen wir noch die entsprechenden Werbungskostenbelege.

Wir bitten höflich darum, uns diese Belege bis zum Ablauf der laufenden Kalenderwoche zukommen zu lassen. Bitte beachten Sie, dass das zuständige Finanzamt andernfalls eine Schätzung der Besteuerungsgrundlagen vornehmen kann, was in der Regel zu steuerlichen Nachteilen führt.

Für Rückfragen stehen wir Ihnen selbstverständlich jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen,
Ihre Kanzlei commoda`;
    } else if (lower.includes("zahlen") || lower.includes("rechnung") || lower.includes("honorar")) {
        responseText =
`Sehr geehrte(r) Mandant(in),

wir hoffen, es geht Ihnen gut.

Bei der Durchsicht unserer Außenstände haben wir festgestellt, dass unsere Rechnung Nr. [Nummer] vom [Datum] über das erbrachte Honorar in Höhe von [Betrag] EUR bisher nicht ausgeglichen wurde. 

Sicherlich handelt es sich hierbei lediglich um ein Versehen. Wir wären Ihnen dankbar, wenn Sie den offenen Betrag innerhalb der nächsten 7 Tage auf unser Kanzleikonto überweisen würden. Sollten Sie Fragen zur Abrechnung haben, sprechen Sie uns gerne an.

Vielen Dank für Ihre Unterstützung.

Mit freundlichen Grüßen,
Ihre Kanzlei commoda`;
    } else {
        // Generischer höflicher Text
        responseText = 
`Sehr geehrte(r) Mandant(in),

wir bedanken uns für das angenehme Telefonat und die gute Zusammenarbeit.

Um die Bearbeitung Ihres laufenden steuerlichen Vorgangs termingerecht fortzuführen und Verzögerungen mit den Finanzbehörden zu vermeiden, bitten wir Sie um zeitnahe Ergänzung der noch ausstehenden Unterlagen bzw. Angaben.

Sobald uns die Informationen vorliegen, werden wir uns unverzüglich an die Fertigstellung machen.

Wir bedanken uns für Ihre Kooperation und verbleiben 

mit freundlichen Grüßen,
Ihre Kanzlei commoda`;
    }

    displayRewrittenText(responseText);
}
