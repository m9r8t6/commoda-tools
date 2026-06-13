document.addEventListener("DOMContentLoaded", () => {
    // --- MOCK REPORTS DATA ---
    const initialReports = [];

    // Pool of new reports to fetch via the button (Empty for production)
    const fetchableReportsPool = [];

    // Initialize state from localStorage
    let reports = JSON.parse(localStorage.getItem("savedNewsReports") || "[]");
    let selectedReport = null;
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
        if (!selectedReport) {
            if (reportTitle) reportTitle.innerText = "Kein Bericht geladen";
            if (reportDate) reportDate.innerText = "";
            const sourceLink = document.getElementById("reportSourceLink");
            if (sourceLink) sourceLink.style.display = "none";
            if (reportDisplay) {
                reportDisplay.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); text-align: center; padding: 60px 20px;">
                        <svg viewBox="0 0 24 24" style="width: 64px; height: 64px; fill: currentColor; margin-bottom: 16px; opacity: 0.35;">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Kein Bericht ausgewählt</h3>
                        <p style="max-width: 420px; font-size: 14px; line-height: 1.5;">Wähle links einen archivierten Steuer-Report aus oder klicke unten auf "Jetzt auf Neuigkeiten prüfen", um aktuelle News über den n8n-Webhook live abzurufen.</p>
                    </div>
                `;
            }
            if (saveBtn) saveBtn.style.display = "none";
            if (deleteBtn) deleteBtn.style.display = "none";
            return;
        }

        // Show buttons
        if (saveBtn) saveBtn.style.display = "inline-flex";

        // Title and Date
        if (reportTitle) reportTitle.innerText = selectedReport.title;
        if (reportDate) reportDate.innerText = `Datum: ${selectedReport.date}`;

        // Update original source link next to title
        const sourceLink = document.getElementById("reportSourceLink");
        if (sourceLink) {
            if (selectedReport.sourceUrl) {
                sourceLink.href = selectedReport.sourceUrl;
                sourceLink.style.display = "inline-flex";
            } else {
                sourceLink.style.display = "none";
            }
        }

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
                
                // Add to reports list if not already present
                if (!reports.some(r => r.id === selectedReport.id)) {
                    reports.push(selectedReport);
                }

                // Persist only saved reports in localStorage
                const savedReports = reports.filter(r => r.saved);
                localStorage.setItem("savedNewsReports", JSON.stringify(savedReports));

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

                // Filter out the deleted report
                reports = reports.filter(r => r.id !== selectedReport.id);

                // Persist the updated archive
                const savedReports = reports.filter(r => r.saved);
                localStorage.setItem("savedNewsReports", JSON.stringify(savedReports));

                selectedReport = null; // Set to null to show empty state

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
                    htmlContent: reportData.html_report,
                    sourceUrl: reportData.source_url || reportData.link || selectedSource
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
                newReport.sourceUrl = selectedSource;

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
