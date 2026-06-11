document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('afaSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', performAfaSearch);
    }
});

function performAfaSearch() {
    const query = document.getElementById('afaSearchInput').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('afaResults');

    if (!query) {
        resultsContainer.innerHTML = '<p style="color: #6B7280; text-align: center; padding: 20px;">Tippe einen Suchbegriff in die obere Suchleiste ein.</p>';
        return;
    }

    // Filtere die Datenbank
    const matches = AFA_DATABASE.filter(item => item.name.toLowerCase().includes(query));

    if (matches.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #EF4444; font-weight: 600; margin-bottom: 4px;">Keine Treffer in der lokalen Datenbank.</p>
                <p style="color: #6B7280; font-size: 0.9rem;">Versuche es mit Begriffen wie "PC", "Stuhl", "Auto", "Software" oder "Handy".</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = '';
    matches.forEach(item => {
        // Suchbegriff hervorheben
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        const highlightedName = item.name.replace(regex, '<mark style="background-color: #FDE047; color: #000; border-radius: 2px; padding: 0 2px;">$1</mark>');

        const displayYears = item.years === 1 ? '1 Jahr (Sofort-AfA)' : `${item.years} Jahre`;

        resultsContainer.innerHTML += `
            <div class="afa-row">
                <div>
                    <div class="afa-item-title">${highlightedName}</div>
                    <div class="afa-item-source">📍 Quelle: ${item.source}</div>
                </div>
                <div>
                    <span class="afa-item-years">${displayYears}</span>
                </div>
            </div>
        `;
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
