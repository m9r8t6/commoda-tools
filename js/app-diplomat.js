document.addEventListener("DOMContentLoaded", () => {
    const translateBtn = document.getElementById('translateBtn');
    const copyBtn = document.getElementById('copyDiplomatBtn');
    const copySubjectBtn = document.getElementById('copyDiplomatSubjectBtn');
    
    if (translateBtn) {
        translateBtn.addEventListener('click', rewriteText);
    }
    if (copyBtn) {
        copyBtn.addEventListener('click', copyRewrittenText);
    }
    if (copySubjectBtn) {
        copySubjectBtn.addEventListener('click', copySubjectText);
    }

    // Toggle showing the email to be answered
    const replyToggle = document.getElementById('diplomatReplyToggle');
    const emailToAnswerContainer = document.getElementById('diplomatEmailToAnswerContainer');
    if (replyToggle && emailToAnswerContainer) {
        const updateReplyVisibility = () => {
            if (replyToggle.checked) {
                emailToAnswerContainer.style.display = 'flex';
            } else {
                emailToAnswerContainer.style.display = 'none';
            }
        };
        replyToggle.addEventListener('change', updateReplyVisibility);
        updateReplyVisibility();
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
    const subjectBox = document.getElementById('diplomatSubject');
    const translateBtn = document.getElementById('translateBtn');
    const copyBtn = document.getElementById('copyDiplomatBtn');
    const copySubjectBtn = document.getElementById('copyDiplomatSubjectBtn');

    subjectBox.value = "";
    outputBox.value = "";
    copyBtn.disabled = true;
    copySubjectBtn.disabled = true;
    loader.style.display = 'flex';
    translateBtn.disabled = true;
    translateBtn.innerText = "Schreibt um...";

    const language = document.getElementById('diplomatLanguageToggle').checked ? 'en' : 'de';
    const anonymize = document.getElementById('diplomatAnonymToggle').checked;
    const replyMode = document.getElementById('diplomatReplyToggle').checked;
    const emailToAnswer = replyMode ? document.getElementById('diplomatEmailToAnswer').value.trim() : "";

    const payload = { 
        text: inputText,
        sender: senderName,
        recipient: recipientName,
        language: language,
        isReply: replyMode,
        anonymize: anonymize
    };
    if (replyMode) {
        payload.emailToAnswer = emailToAnswer;
    }
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
        return response.text();
    })
    .then(rawResponse => {
        displayRewrittenText(rawResponse);
    })
    .catch(error => {
        console.error("Kanzlei-Diplomat Fehler:", error);
        outputBox.value = "Fehler: Die Umschreibung konnte nicht durchgeführt werden. Bitte überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später noch einmal.";
    })
    .finally(() => {
        loader.style.display = 'none';
        translateBtn.disabled = false;
        translateBtn.innerText = "Umformulieren";
    });
}

function displayRewrittenText(rawResponse) {
    const outputBox = document.getElementById('diplomatOutput');
    const subjectBox = document.getElementById('diplomatSubject');
    const copyBtn = document.getElementById('copyDiplomatBtn');
    const copySubjectBtn = document.getElementById('copyDiplomatSubjectBtn');

    let subject = "";
    let emailText = "";

    try {
        const json = JSON.parse(rawResponse);
        
        // Handle case where n8n returns an array containing the object
        if (Array.isArray(json) && json.length > 0) {
            const firstItem = json[0];
            subject = firstItem.betreff || "";
            emailText = firstItem.email_text || firstItem.text || JSON.stringify(firstItem);
        } else {
            subject = json.betreff || "";
            emailText = json.email_text || json.text || rawResponse;
        }
    } catch (e) {
        // Fallback for plain text responses
        emailText = rawResponse;
    }

    // Standardize newline characters if escaped
    if (typeof emailText === 'string') {
        emailText = emailText.replace(/\\n/g, '\n');
    }
    if (typeof subject === 'string') {
        subject = subject.replace(/\\n/g, '\n');
    }

    subjectBox.value = subject;
    outputBox.value = emailText;

    copyBtn.disabled = !emailText;
    copySubjectBtn.disabled = !subject;
}

function copyRewrittenText() {
    const outputText = document.getElementById('diplomatOutput').value;
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

function copySubjectText() {
    const subjectText = document.getElementById('diplomatSubject').value;
    const copyBtn = document.getElementById('copyDiplomatSubjectBtn');

    navigator.clipboard.writeText(subjectText)
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
