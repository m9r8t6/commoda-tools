document.addEventListener("DOMContentLoaded", () => {
    // --- MOCK REPORTS DATA ---
    const initialReports = [];

    // Pool of new reports to fetch via the button (Empty for production)
    const fetchableReportsPool = [];

    // Initialize state from localStorage
    let reports = [];
    let starredLinks = JSON.parse(localStorage.getItem("starredNewsLinks") || "[]");
    let selectedReport = null;
    let poolIndex = 0;
    let isFetchingArchive = true;

    // DOM References
    const archiveList = document.getElementById("archiveList");
    const searchInput = document.getElementById("newsSearchInput");
    const reportTitle = document.getElementById("reportTitle");
    const reportDate = document.getElementById("reportDate");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const saveBtn = document.getElementById("saveArchiveBtn");
    const bookmarkPath = document.getElementById("bookmarkPath");
    const saveBtnText = document.getElementById("saveBtnText");
    const deleteBtn = document.getElementById("deleteArchiveBtn");
    const deleteBtnText = document.getElementById("deleteBtnText");
    const reportDisplay = document.getElementById("reportDisplay");
    const fetchBtn = document.getElementById("fetchNewsBtn");
    const spinner = document.getElementById("newsSpinner");
    const fetchWeeklyReportBtn = document.getElementById("fetchWeeklyReportBtn");
    const weeklySpinner = document.getElementById("weeklySpinner");

    let deleteConfirmActive = false;

    // SVG paths for Bookmark button icon
    const bookmarkFilledPath = "M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z";
    const bookmarkOutlinePath = "M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z";

    // --- RENDERING LOGIC ---

    function renderArchive() {
        if (!archiveList) return;
        
        if (isFetchingArchive && reports.length === 0) {
            archiveList.innerHTML = `
                <div style="padding: 30px 16px; text-align: center;">
                    <div class="spinner-small" style="border-color: var(--primary-color); border-bottom-color: transparent; width: 22px; height: 22px; margin: 0 auto 12px auto; display: inline-block;"></div>
                    <div style="color: var(--primary-color); font-size: 13px; font-weight: 600;">Lade Datenbank...</div>
                </div>`;
            return;
        }

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
            if (downloadPdfBtn) downloadPdfBtn.style.display = "none";
            if (saveBtn) saveBtn.style.display = "none";
            if (deleteBtn) deleteBtn.style.display = "none";
            return;
        }

        // Show buttons
        if (downloadPdfBtn) downloadPdfBtn.style.display = "inline-flex";
        if (saveBtn) saveBtn.style.display = "inline-flex";

        // Title and Date
        if (reportTitle) reportTitle.innerText = selectedReport.title;
        if (reportDate) reportDate.innerText = `Datum: ${selectedReport.date}`;

        // Body Content
        if (reportDisplay) {
            reportDisplay.innerHTML = selectedReport.htmlContent;
            processReportLinks(reportDisplay);
        }

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

    // --- LINK BOOKMARKING LOGIC ---

    function processReportLinks(container) {
        if (!container) return;
        const anchors = container.querySelectorAll("a");
        anchors.forEach(a => {
            if (a.dataset.linkProcessed) return;
            a.dataset.linkProcessed = "true";

            const href = a.getAttribute("href");
            if (!href) return;
            const text = a.textContent.trim() || href;

            // Wrap anchor and star button in a span to keep them together
            const wrapper = document.createElement("span");
            wrapper.className = "report-link-wrapper";

            // Insert wrapper before anchor
            a.parentNode.insertBefore(wrapper, a);
            // Move anchor inside wrapper
            wrapper.appendChild(a);

            // Create star button
            const starBtn = document.createElement("button");
            starBtn.className = "link-star-btn";
            
            // Check if starred
            const isStarred = starredLinks.some(link => link.url === href);
            updateStarButtonState(starBtn, isStarred);

            starBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleStarLink(href, text, selectedReport ? selectedReport.title : "Steuer-News", starBtn);
            });

            wrapper.appendChild(starBtn);
        });
    }

    function updateStarButtonState(btn, isStarred) {
        if (isStarred) {
            btn.classList.add("starred");
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
            btn.setAttribute("title", "Link gemerkt");
        } else {
            btn.classList.remove("starred");
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`;
            btn.setAttribute("title", "Link merken");
        }
    }

    function toggleStarLink(url, text, sourceTitle, btn) {
        const index = starredLinks.findIndex(link => link.url === url);
        if (index > -1) {
            // Already starred, remove it
            starredLinks.splice(index, 1);
        } else {
            // Add new starred link
            starredLinks.push({
                url: url,
                text: text,
                source: sourceTitle,
                timestamp: Date.now()
            });
        }

        // Persist to localStorage
        localStorage.setItem("starredNewsLinks", JSON.stringify(starredLinks));

        // Update all star buttons inside the current report that match this URL
        if (reportDisplay) {
            const btns = reportDisplay.querySelectorAll(".link-star-btn");
            btns.forEach(b => {
                const siblingLink = b.previousElementSibling;
                if (siblingLink && siblingLink.tagName === "A" && siblingLink.getAttribute("href") === url) {
                    const isStarred = starredLinks.some(link => link.url === url);
                    updateStarButtonState(b, isStarred);
                }
            });
        }
    }

    // --- EVENT LISTENERS ---

    // Download PDF (Print)
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener("click", () => {
            window.print();
        });
    }

    // Save current report to database via Webhook
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            if (selectedReport && !selectedReport.saved) {
                // Extrahiere den reinen Text aus dem HTML
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = selectedReport.htmlContent || "";
                const plainText = tempDiv.innerText || tempDiv.textContent || "";

                const payload = {
                    title: selectedReport.title || "Steuer-News",
                    text: plainText,
                    url: selectedReport.sourceUrl || "",
                    date: new Date().toISOString()
                };

                const saveWebhookUrl = "https://n8n.baeuerlein-dev.de/webhook/save-article";

                // Zeige Ladezustand an
                const originalBtnText = saveBtnText ? saveBtnText.innerText : "";
                if (saveBtnText) saveBtnText.innerText = "Speichere...";
                saveBtn.disabled = true;

                fetch(saveWebhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Fehler beim Speichern in der Datenbank");
                    }
                    selectedReport.saved = true;
                    
                    // Add to reports list if not already present
                    if (!reports.some(r => r.id === selectedReport.id)) {
                        reports.push(selectedReport);
                    }

                    renderCurrentReport();
                    renderArchive();
                })
                .catch(err => {
                    console.error("Speichern fehlgeschlagen:", err);
                    alert("Fehler beim Speichern des Artikels.");
                    if (saveBtnText) saveBtnText.innerText = originalBtnText;
                    saveBtn.disabled = false;
                });
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
                const reportIdToDelete = selectedReport.id;
                
                // Show loading state
                deleteBtn.disabled = true;
                if (deleteBtnText) deleteBtnText.innerText = "Löscht...";

                fetch("https://n8n.baeuerlein-dev.de/webhook/delete-article", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: reportIdToDelete })
                })
                .then(response => {
                    if (!response.ok) throw new Error("Fehler beim Löschen via Webhook");
                    
                    deleteConfirmActive = false;
                    deleteBtn.disabled = false;
                    if (deleteBtnText) deleteBtnText.innerText = "Löschen";
                    deleteBtn.style.backgroundColor = "#FFF5F5";
                    deleteBtn.style.color = "#DC2626";

                    // Remove from local memory
                    reports = reports.filter(r => r.id !== reportIdToDelete);

                    // Clear currently selected report if it was the deleted one
                    if (selectedReport && selectedReport.id === reportIdToDelete) {
                        selectedReport.saved = false;
                        selectedReport = null;
                    }

                    renderCurrentReport();
                    renderArchive();
                })
                .catch(err => {
                    console.error("Fehler beim Löschen:", err);
                    alert("Konnte den Artikel nicht aus der Datenbank löschen.");
                    deleteConfirmActive = false;
                    deleteBtn.disabled = false;
                    if (deleteBtnText) deleteBtnText.innerText = "Löschen";
                    deleteBtn.style.backgroundColor = "#FFF5F5";
                    deleteBtn.style.color = "#DC2626";
                });
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

    // Editable title handler
    if (reportTitle) {
        reportTitle.addEventListener("blur", () => {
            if (!selectedReport) return;
            // Clean up any newlines or extra spaces
            const newTitle = reportTitle.innerText.replace(/[\r\n]+/g, " ").trim();
            if (newTitle && newTitle !== selectedReport.title) {
                selectedReport.title = newTitle;
                reportTitle.innerText = newTitle; // Update the UI to show cleaned title
                
                // (No local storage update needed since we save to DB)
                
                renderArchive();
            } else {
                // Revert to old title if empty
                reportTitle.innerText = selectedReport.title;
            }
        });

        reportTitle.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                reportTitle.blur();
            }
        });
    }

    const editTitleIcon = document.querySelector(".edit-title-icon");
    if (editTitleIcon && reportTitle) {
        editTitleIcon.addEventListener("click", () => {
            reportTitle.focus();
            
            // Move cursor to the end
            if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
                const range = document.createRange();
                range.selectNodeContents(reportTitle);
                range.collapse(false);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        });
    }

    // Search input handler
    if (searchInput) {
        searchInput.addEventListener("input", renderArchive);
    }

    // Fetch news button handler
    if (fetchBtn) {
        fetchBtn.addEventListener("click", () => {
            // Disable button and show spinner
            fetchBtn.disabled = true;
            if (spinner) spinner.style.display = "inline-block";
            const originalText = fetchBtn.querySelector(".btn-text");
            if (originalText) originalText.innerText = "Prüfe Feeds...";

            const webhookUrl = `${window.APP_CONFIG.API_BASE_URL}/webhook/fetch-tax-news`;

            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
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

                const sourceLabel = "Alle Quellen";
                const fetchedReport = {
                    id: Date.now(),
                    title: `Steuer-News (${sourceLabel})`,
                    date: new Date().toLocaleDateString("de-DE"),
                    source: sourceLabel,
                    saved: false,
                    summary: `Live-Bericht für ${sourceLabel}.`,
                    htmlContent: reportData.html_report,
                    sourceUrl: reportData.source_url || reportData.link || ""
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
                newReport.sourceUrl = "";

                reports.push(newReport);
                selectedReport = newReport;

                resetFetchUI();
                renderCurrentReport();
                renderArchive();
            });

            function resetFetchUI() {
                fetchBtn.disabled = false;
                if (spinner) spinner.style.display = "none";
                if (originalText) originalText.innerText = "Jetzt auf Neuigkeiten prüfen";
            }
        });
    }

    if (fetchWeeklyReportBtn) {
        fetchWeeklyReportBtn.addEventListener("click", () => {
            fetchWeeklyReportBtn.disabled = true;
            if (weeklySpinner) weeklySpinner.style.display = "inline-block";
            const originalText = fetchWeeklyReportBtn.querySelector(".btn-text");
            if (originalText) originalText.innerText = "Lade...";

            // Placeholder webhook for weekly report
            const webhookUrl = `${window.APP_CONFIG.API_BASE_URL}/webhook/fetch-weekly-report`;

            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "generate_weekly" })
            })
            .then(response => {
                if (!response.ok) throw new Error("Netzwerkantwort war nicht ok");
                return response.json();
            })
            .then(data => {
                let reportData = Array.isArray(data) ? data[0] : data;
                
                if (!reportData || reportData.status !== "success" || !reportData.html_report) {
                    throw new Error("Ungültiges Datenformat vom Webhook erhalten");
                }

                const fetchedReport = {
                    id: Date.now(),
                    title: `Wöchentlicher KI-Bericht`,
                    date: new Date().toLocaleDateString("de-DE"),
                    source: "KI Zusammenfassung",
                    saved: false,
                    summary: `Zusammenfassung der wichtigsten Urteile und Schreiben der Woche.`,
                    htmlContent: reportData.html_report,
                    sourceUrl: "Wochenbericht"
                };

                reports.push(fetchedReport);
                selectedReport = fetchedReport;

                resetWeeklyUI();
                renderCurrentReport();
                renderArchive();
            })
            .catch(error => {
                console.warn("Webhook-Fehler, nutze Offline-Fallback für Wochenbericht:", error);
                
                // Fallback for weekly report
                const fallbackReport = {
                    id: Date.now(),
                    title: `Wöchentlicher KI-Bericht (Offline)`,
                    date: new Date().toLocaleDateString("de-DE"),
                    source: "KI Zusammenfassung",
                    saved: false,
                    summary: `Offline Fallback für den wöchentlichen Bericht.`,
                    htmlContent: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h1 style="color: var(--primary-color);">Wöchentlicher KI-Bericht</h1>
                        <p>Dies ist ein Platzhalter-Bericht, da der Webhook nicht erreicht werden konnte.</p>
                        <ul>
                            <li><strong>BMF:</strong> Neue Richtlinien zur Home-Office-Pauschale. <a href="https://bundesfinanzministerium.de" target="_blank">BMF Link</a></li>
                            <li><strong>Haufe:</strong> Wichtige BFH Urteile zur Umsatzsteuer. <a href="https://haufe.de" target="_blank">Haufe Link</a></li>
                        </ul>
                    </div>`,
                    sourceUrl: "Wochenbericht"
                };

                reports.push(fallbackReport);
                selectedReport = fallbackReport;

                resetWeeklyUI();
                renderCurrentReport();
                renderArchive();
            });

            function resetWeeklyUI() {
                fetchWeeklyReportBtn.disabled = false;
                if (weeklySpinner) weeklySpinner.style.display = "none";
                if (originalText) originalText.innerText = "Wöchentlicher Bericht";
            }
        });
    }

    // --- INITIALIZATION ---

    function formatTextToHTML(text) {
        if (!text) return "<p>Kein Text verfügbar.</p>";
        // Einfache Umwandlung von Text zu HTML-Paragraphen
        const paragraphs = text.split(/\n\s*\n/);
        let html = '<div class="report-body" style="padding: 20px;">';
        paragraphs.forEach(p => {
            const lines = p.trim().replace(/\n/g, "<br>");
            html += `<p style="margin-bottom: 1em; line-height: 1.6;">${lines}</p>`;
        });
        html += '</div>';
        return html;
    }

    // Lade gespeicherte Berichte aus der Datenbank
    fetch("https://n8n.baeuerlein-dev.de/webhook/get-archive?t=" + Date.now(), {
        method: "GET"
    })
    .then(res => {
        if (!res.ok) {
            console.error("HTTP-Fehler beim Laden:", res.status);
            throw new Error("Fehler beim Laden des Archivs");
        }
        return res.json();
    })
    .then(data => {
        isFetchingArchive = false;
        console.log("Geladene Daten aus get-archive:", data);
        if (data && Array.isArray(data.data)) {
            data.data.forEach(article => {
                const fetchedReport = {
                    id: article.id,
                    title: article.title || "Gespeicherter Bericht",
                    date: article.date ? new Date(article.date).toLocaleDateString("de-DE") : "Unbekannt",
                    source: "Datenbank",
                    saved: true,
                    summary: "Aus der Datenbank geladen.",
                    htmlContent: formatTextToHTML(article.text),
                    sourceUrl: article.url || ""
                };
                // Nur hinzufügen, falls noch nicht vorhanden
                if (!reports.some(r => r.id === article.id)) {
                    reports.push(fetchedReport);
                }
            });
            console.log("Aktualisiere Archiv mit", reports.length, "Berichten.");
            renderArchive();
            // Wenn kein Bericht aktuell ausgewählt ist, zeige den ersten an
            if (!selectedReport && reports.length > 0) {
                selectedReport = reports[0];
                renderCurrentReport();
            }
        } else {
            console.warn("Unerwartetes Datenformat:", data);
            renderArchive();
        }
    })
    .catch(err => {
        isFetchingArchive = false;
        console.error("Konnte das Archiv nicht laden:", err);
        renderArchive();
    });

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
