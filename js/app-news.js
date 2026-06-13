document.addEventListener("DOMContentLoaded", () => {
    // --- MOCK REPORTS DATA ---
    const initialReports = [
        {
            id: 1,
            title: "BMF: E-Rechnungspflicht ab 2025",
            date: "28.05.2026",
            source: "BMF",
            saved: true,
            summary: "BMF-Schreiben zur Einführung der obligatorischen E-Rechnung ab 01.01.2025 im B2B-Bereich.",
            htmlContent: `
                <div class="news-section-card">
                    <h4>
                        <span class="news-source-tag tag-bmf">BMF</span>
                        BMF-Schreiben zur Einführung der obligatorischen E-Rechnung
                    </h4>
                    <p><strong>Hintergrund:</strong> Ab dem 1. Januar 2025 sind alle inländischen Unternehmer verpflichtet, elektronische Rechnungen für steuerbare Umsätze im B2B-Bereich zu empfangen. Das BMF hat nun die finalen Richtlinien veröffentlicht.</p>
                    <p><strong>Wichtige Fristen & Details:</strong></p>
                    <ul>
                        <li><strong>Empfangspflicht:</strong> Gilt ab 01.01.2025 ausnahmslos für alle inländischen Unternehmen.</li>
                        <li><strong>Ausstellungspflicht:</strong> Übergangsregelungen bis Ende 2026 für Papierrechnungen und einfache PDF-Rechnungen (Zustimmung des Empfängers erforderlich).</li>
                        <li><strong>Format-Vorgaben:</strong> Zulässig sind Formate, die der europäischen Norm EN 16931 entsprechen (z. B. ZUGFeRD ab Version 2.0.1 oder XRechnung).</li>
                    </ul>
                    <p><em>Tipp: Kanzleien sollten Mandanten proaktiv auf die technische Empfangsbereitschaft hinweisen und E-Mail-Postfächer anpassen.</em></p>
                </div>
                <div class="news-section-card">
                    <h4>
                        <span class="news-source-tag tag-bmf">BMF</span>
                        Ergänzende Hinweise zur Archivierung von strukturierten Daten
                    </h4>
                    <p>Zusammen mit der E-Rechnung müssen die strukturierten XML-Daten im Originalzustand unveränderbar archiviert werden (GoBD-konform). Das bloße Aufbewahren eines PDF-Abbilds reicht rechtlich nicht aus.</p>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-top: 32px;">
                    Disclaimer: Dieser Report dient der Erstinformation und ersetzt keine individuelle Steuerberatung.
                </p>
            `
        },
        {
            id: 2,
            title: "Haufe: Reform der Erbschaftsteuer",
            date: "05.06.2026",
            source: "Haufe",
            saved: true,
            summary: "Aktuelle Entwicklungen bei der Bewertung von Betriebsvermögen für die Erbschaftsteuer.",
            htmlContent: `
                <div class="news-section-card">
                    <h4>
                        <span class="news-source-tag tag-haufe">Haufe</span>
                        Vereinfachtes Ertragswertverfahren: Zinsanpassung
                    </h4>
                    <p><strong>Problemstellung:</strong> Der Basiszins für das vereinfachte Ertragswertverfahren wurde für Bewertungsstichtage im Jahr 2026 an die Zinsentwicklung angepasst. Dies führt tendenziell zu geringeren Multiplikatoren und damit zu niedrigeren steuerlichen Unternehmenswerten im Vergleich zum Vorjahr.</p>
                    <p><strong>Auswirkungen für KMU:</strong></p>
                    <ul>
                        <li>Erleichtert die steuerfreie oder vergünstigte Übertragung von mittelständischen Betriebsstrukturen im Schenkungsfall.</li>
                        <li>Die Einhaltung der Lohnsummenfristen bleibt jedoch durch die Inflation und den Fachkräftemangel das größte Risiko.</li>
                    </ul>
                </div>
                <div class="news-section-card">
                    <h4>
                        <span class="news-source-tag tag-haufe">Haufe</span>
                        Lohnsummenregelung unter Druck
                    </h4>
                    <p>Fachbeiräte weisen darauf hin, dass Kanzleien bei laufenden Verschonungsfristen die Lohnsummen der Mandantenbetriebe engmaschig überwachen müssen, um Nachversteuerungen zu vermeiden.</p>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-top: 32px;">
                    Disclaimer: Dieser Report dient der Erstinformation und ersetzt keine individuelle Steuerberatung.
                </p>
            `
        },
        {
            id: 3,
            title: "Steuer-Update: BMF & Haufe (KW 24)",
            date: "12.06.2026",
            source: "BMF & Haufe",
            saved: false,
            summary: "Aktueller Wochen-Report mit Neuigkeiten zu Inflationsausgleichsprämien und doppelter Haushaltsführung.",
            htmlContent: `
                <div class="news-section-card">
                    <h4>
                        <span class="news-source-tag tag-bmf">BMF</span>
                        Präzisierung zur Auszahlung der Inflationsausgleichsprämie
                    </h4>
                    <p>Das BMF hat in einem FAQ-Update klargestellt, dass steuerfreie Prämien, die bis zum gesetzlichen Stichtag am 31.12.2024 arbeitsrechtlich vereinbart wurden, auch bei ratenweiser Auszahlung bis weit in das Jahr 2026 steuerfrei abgerechnet werden können. Voraussetzung ist eine lückenlose Dokumentation der Vereinbarung vor dem Stichtag.</p>
                </div>
                <div class="news-section-card">
                    <h4>
                        <span class="news-source-tag tag-haufe">Haufe</span>
                        Verschärfte Anforderungen an die doppelte Haushaltsführung
                    </h4>
                    <p><strong>Entscheidung des BFH:</strong> Die finanzielle Beteiligung am Haupthausstand bei einer doppelten Haushaltsführung wurde präzisiert. Eine rein symbolische Beteiligung (z. B. geringfügiger Nebenkostenbeitrag) reicht nicht mehr aus. Der Arbeitnehmer muss sich substanziell an den laufenden Kosten des Haushalts beteiligen (mindestens 10% der monatlichen Kosten).</p>
                    <p><strong>Praxishinweis:</strong> Bei Betriebsprüfungen werden zunehmend Nachweise wie Überweisungsbelege oder Mietverträge für den Erstwohnsitz verlangt.</p>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-top: 32px;">
                    Disclaimer: Dieser Report dient der Erstinformation und ersetzt keine individuelle Steuerberatung.
                </p>
            `
        }
    ];

    // Pool of new reports to fetch via the button
    const fetchableReportsPool = [
        {
            id: 4,
            title: "Haufe: USt in der Gastronomie",
            date: "13.06.2026",
            source: "Haufe",
            saved: false,
            summary: "Rückkehr zu 19% Umsatzsteuer bei Verzehr vor Ort und Abgrenzungsschwierigkeiten.",
            htmlContent: `
                <div class="news-section-card">
                    <h4>
                        <span class="news-source-tag tag-haufe">Haufe</span>
                        Gastronomie: Ende der 7% Regelung für Restaurantdienstleistungen
                    </h4>
                    <p><strong>Aktueller Stand:</strong> Die Sonderregelung zur Absenkung des Steuersatzes auf 7% für Speisen vor Ort ist endgültig beendet. Alle Speisen und Getränke, die in einem Restaurant verzehrt werden, unterliegen wieder dem Regelsatz von 19%.</p>
                    <p><strong>Die Abgrenzungsfalle:</strong></p>
                    <ul>
                        <li><strong>Außer-Haus-Verkauf (Lieferung):</strong> 7% Steuer gilt weiterhin für zubereitete Speisen zur Mitnahme.</li>
                        <li><strong>In-House-Verzehr (Dienstleistung):</strong> 19% Steuer fällt an, sobald dem Gast Sitzgelegenheiten, Geschirr oder Service bereitgestellt werden.</li>
                    </ul>
                    <p>Kassensysteme müssen sauber getrennt programmiert sein, da Betriebsprüfer die Verteilungsquote (In-House vs. Außer-Haus) vermehrt statistisch prüfen.</p>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-top: 32px;">
                    Disclaimer: Dieser Report dient der Erstinformation und ersetzt keine individuelle Steuerberatung.
                </p>
            `
        },
        {
            id: 5,
            title: "BMF: Krypto-Besteuerung Richtlinie",
            date: "13.06.2026",
            source: "BMF",
            saved: false,
            summary: "Klarstellung zu Haltefristen bei Staking und Lending von Krypto-Assets.",
            htmlContent: `
                <div class="news-section-card">
                    <h4>
                        <span class="news-source-tag tag-bmf">BMF</span>
                        Haltefrist bei Krypto-Assets bleibt bei einem Jahr
                    </h4>
                    <p><strong>Erleichterung für Anleger:</strong> Entgegen ursprünglichen Befürchtungen hat das BMF klargestellt, dass die Nutzung von Kryptowährungen für Staking, Lending oder Liquidity Mining die Haltefrist für den privaten Veräußerungsgewinn nicht von 1 Jahr auf 10 Jahre verlängert. Gewinne aus der Veräußerung nach einem Jahr Haltedauer bleiben steuerfrei.</p>
                    <p><strong>Dokumentationspflichten:</strong></p>
                    <ul>
                        <li>Steuerzahler sind in der Nachweispflicht für sämtliche Transaktionen.</li>
                        <li>Die Nutzung automatisierter Krypto-Steuer-Tools wird vom Finanzamt empfohlen, sofern die Rohdaten (CSV-Exporte) archiviert sind.</li>
                    </ul>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-top: 32px;">
                    Disclaimer: Dieser Report dient der Erstinformation und ersetzt keine individuelle Steuerberatung.
                </p>
            `
        }
    ];

    // Initialize state
    let reports = [...initialReports];
    let selectedReport = reports.find(r => r.id === 3); // Start with KW 24 report loaded in main area
    let poolIndex = 0;

    // DOM References
    const archiveList = document.getElementById("archiveList");
    const searchInput = document.getElementById("newsSearchInput");
    const reportTitle = document.getElementById("reportTitle");
    const reportDate = document.getElementById("reportDate");
    const saveBtn = document.getElementById("saveArchiveBtn");
    const bookmarkPath = document.getElementById("bookmarkPath");
    const saveBtnText = document.getElementById("saveBtnText");
    const deleteBtn = document.getElementById("deleteArchiveBtn");
    const deleteBtnText = document.getElementById("deleteBtnText");
    const reportDisplay = document.getElementById("reportDisplay");
    const fetchBtn = document.getElementById("fetchNewsBtn");
    const spinner = document.getElementById("newsSpinner");

    let deleteConfirmActive = false;

    // SVG paths for Bookmark button icon
    const bookmarkFilledPath = "M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z";
    const bookmarkOutlinePath = "M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z";

    // --- RENDERING LOGIC ---

    function renderArchive() {
        if (!archiveList) return;
        archiveList.innerHTML = "";
        
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const savedReports = reports.filter(r => r.saved);

        // Filter based on search query
        const filtered = savedReports.filter(r => {
            return r.title.toLowerCase().includes(query) || 
                   r.date.toLowerCase().includes(query) ||
                   r.summary.toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            archiveList.innerHTML = `<div style="padding: 16px; color: var(--text-muted); font-style: italic; text-align: center; font-size: 13px;">Keine Berichte gefunden</div>`;
            return;
        }

        filtered.forEach(report => {
            const item = document.createElement("div");
            item.className = "archive-item";
            if (selectedReport && selectedReport.id === report.id) {
                item.classList.add("active");
            }

            const sourceTagClass = report.source === "BMF" ? "tag-bmf" : (report.source === "Haufe" ? "tag-haufe" : "tag-bmf");

            item.innerHTML = `
                <div class="archive-item-title">${report.title}</div>
                <div class="archive-item-meta">
                    <span>${report.date}</span>
                    <span class="news-source-tag ${sourceTagClass}" style="font-size: 9px; padding: 1px 4px;">${report.source}</span>
                </div>
            `;

            item.addEventListener("click", () => {
                selectedReport = report;
                renderCurrentReport();
                renderArchive();
            });

            archiveList.appendChild(item);
        });
    }

    function renderCurrentReport() {
        if (!selectedReport) return;

        // Title and Date
        if (reportTitle) reportTitle.innerText = selectedReport.title;
        if (reportDate) reportDate.innerText = `Datum: ${selectedReport.date}`;

        // Body Content
        if (reportDisplay) reportDisplay.innerHTML = selectedReport.htmlContent;

        // Bookmark Button State
        if (saveBtn && bookmarkPath && saveBtnText) {
            if (selectedReport.saved) {
                bookmarkPath.setAttribute("d", bookmarkFilledPath);
                saveBtnText.innerText = "Im Archiv gespeichert";
                saveBtn.disabled = true;
                saveBtn.style.opacity = "0.75";
                saveBtn.style.cursor = "default";
            } else {
                bookmarkPath.setAttribute("d", bookmarkOutlinePath);
                saveBtnText.innerText = "Im Archiv speichern";
                saveBtn.disabled = false;
                saveBtn.style.opacity = "1";
                saveBtn.style.cursor = "pointer";
            }
        }

        // Delete Button State & Confirmation Reset
        deleteConfirmActive = false;
        if (deleteBtnText) deleteBtnText.innerText = "Löschen";
        if (deleteBtn) {
            deleteBtn.style.backgroundColor = "#FFF5F5";
            deleteBtn.style.color = "#DC2626";
            if (selectedReport.saved) {
                deleteBtn.style.display = "inline-flex";
            } else {
                deleteBtn.style.display = "none";
            }
        }

        // Scroll to top of report content
        const wrapper = document.getElementById("reportContentWrapper");
        if (wrapper) wrapper.scrollTop = 0;
    }

    // --- EVENT LISTENERS ---

    // Save current report to archive
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (selectedReport && !selectedReport.saved) {
                selectedReport.saved = true;
                renderCurrentReport();
                renderArchive();
            }
        });
    }

    // Delete current report from archive (with double confirmation)
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            if (!selectedReport || !selectedReport.saved) return;

            if (!deleteConfirmActive) {
                deleteConfirmActive = true;
                if (deleteBtnText) deleteBtnText.innerText = "Bericht Wirklich Löschen?";
                deleteBtn.style.backgroundColor = "#DC2626";
                deleteBtn.style.color = "#FFFFFF";
            } else {
                selectedReport.saved = false;
                deleteConfirmActive = false;
                if (deleteBtnText) deleteBtnText.innerText = "Löschen";
                deleteBtn.style.backgroundColor = "#FFF5F5";
                deleteBtn.style.color = "#DC2626";

                renderCurrentReport();
                renderArchive();
            }
        });

        // Reset confirmation state if cursor leaves the button to prevent accidental clicks
        deleteBtn.addEventListener("mouseleave", () => {
            if (deleteConfirmActive) {
                deleteConfirmActive = false;
                if (deleteBtnText) deleteBtnText.innerText = "Löschen";
                deleteBtn.style.backgroundColor = "#FFF5F5";
                deleteBtn.style.color = "#DC2626";
            }
        });
    }

    // Search input handler
    if (searchInput) {
        searchInput.addEventListener("input", renderArchive);
    }

    function getSourceLabel(url) {
        if (url.includes("haufe.de")) return "Haufe";
        if (url.includes("nwb.de")) return "NWB";
        if (url.includes("bundesfinanzministerium.de")) return "BMF";
        return "Mix Feed";
    }

    // Fetch news button handler
    if (fetchBtn) {
        fetchBtn.addEventListener("click", () => {
            const sourceFilter = document.getElementById("news-source-filter");
            const selectedSource = sourceFilter ? sourceFilter.value : "";

            // Disable button and show spinner
            fetchBtn.disabled = true;
            if (sourceFilter) sourceFilter.disabled = true;
            if (spinner) spinner.style.display = "inline-block";
            const originalText = fetchBtn.querySelector(".btn-text");
            if (originalText) originalText.innerText = "Prüfe Feeds...";

            const webhookUrl = `${window.APP_CONFIG.API_BASE_URL}/webhook/fetch-tax-news`;

            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceUrl: selectedSource })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Netzwerkantwort war nicht ok");
                }
                return response.json();
            })
            .then(data => {
                // If it is an array containing the data, take the first element
                let reportData = Array.isArray(data) ? data[0] : data;
                
                if (!reportData || reportData.status !== "success" || !reportData.html_report) {
                    throw new Error("Ungültiges Datenformat vom Webhook erhalten");
                }

                const sourceLabel = getSourceLabel(selectedSource);
                const fetchedReport = {
                    id: Date.now(),
                    title: `Steuer-News (${sourceLabel})`,
                    date: new Date().toLocaleDateString("de-DE"),
                    source: sourceLabel,
                    saved: false,
                    summary: `Live-Bericht für ${sourceLabel}.`,
                    htmlContent: reportData.html_report
                };

                reports.push(fetchedReport);
                selectedReport = fetchedReport;

                resetFetchUI();
                renderCurrentReport();
                renderArchive();
            })
            .catch(error => {
                console.warn("Webhook-Fehler, nutze Offline-Fallback:", error);

                if (poolIndex >= fetchableReportsPool.length) {
                    alert("Keine weiteren Offline-Berichte verfügbar und Webhook-Verbindung fehlgeschlagen.");
                    resetFetchUI();
                    return;
                }

                const newReport = fetchableReportsPool[poolIndex];
                poolIndex++;

                if (selectedSource.includes("haufe.de")) {
                    newReport.source = "Haufe";
                } else if (selectedSource.includes("bundesfinanzministerium.de")) {
                    newReport.source = "BMF";
                }

                reports.push(newReport);
                selectedReport = newReport;

                resetFetchUI();
                renderCurrentReport();
                renderArchive();
            });

            function resetFetchUI() {
                fetchBtn.disabled = false;
                if (sourceFilter) sourceFilter.disabled = false;
                if (spinner) spinner.style.display = "none";
                if (originalText) originalText.innerText = "Jetzt auf Neuigkeiten prüfen";
            }
        });
    }

    // --- INITIALIZATION ---
    renderArchive();
    renderCurrentReport();

    // Attach listener to sidebar links so it updates when switching views
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            if (target === 'news') {
                renderArchive();
                renderCurrentReport();
            }
        });
    });
});
