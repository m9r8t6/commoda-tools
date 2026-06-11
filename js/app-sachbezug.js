document.addEventListener("DOMContentLoaded", () => {
    const addItemBtn = document.getElementById('addSachbezugItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => addSachbezugItem("", 0));
    }

    // Initialwert setzen, um den Nutzen direkt sichtbar zu machen (z. B. Tankkarte und Fitness)
    addSachbezugItem("Tankgutschein", 44.00);
    addSachbezugItem("Fitnessstudio-Zuschuss", 15.00);
    
    // Erste Berechnung anstoßen
    calculateSachbezug();
});

let itemCounter = 0;

function addSachbezugItem(name = "", amount = 0) {
    const container = document.getElementById('sachbezugItems');
    const itemId = `sachbezug-item-${itemCounter++}`;

    const row = document.createElement('div');
    row.className = 'sachbezug-item-row';
    row.id = itemId;

    row.innerHTML = `
        <input type="text" class="filter-input sachbezug-name" placeholder="Art der Zuwendung (z. B. Tankkarte)" value="${name}">
        <input type="number" class="filter-input sachbezug-val" placeholder="Betrag in €" step="0.01" min="0" value="${amount > 0 ? amount.toFixed(2) : ''}">
        <button class="icon-btn remove-sachbezug-item" style="color: #EF4444; border-color: var(--border-color); width: 38px; height: 38px;" title="Löschen">🗑️</button>
    `;

    container.appendChild(row);

    // Event Listener für Echtzeit-Berechnungen anhängen
    const nameInput = row.querySelector('.sachbezug-name');
    const valInput = row.querySelector('.sachbezug-val');
    const removeBtn = row.querySelector('.remove-sachbezug-item');

    nameInput.addEventListener('input', calculateSachbezug);
    valInput.addEventListener('input', calculateSachbezug);
    removeBtn.addEventListener('click', () => {
        row.remove();
        calculateSachbezug();
    });

    calculateSachbezug();
}

function calculateSachbezug() {
    const valInputs = document.querySelectorAll('.sachbezug-val');
    let total = 0;

    valInputs.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val) && val > 0) {
            total += val;
        }
    });

    // Runden auf 2 Nachkommastellen
    total = Math.round(total * 100) / 100;

    // UI-Elemente
    const totalText = document.getElementById('sachbezugTotalText');
    const progressBar = document.getElementById('sachbezugProgress');
    const statusCard = document.getElementById('sachbezugStatus');

    totalText.innerText = total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

    // Progress Bar berechnen (max. 50 Euro)
    let percentage = (total / 50) * 100;
    if (percentage > 100) percentage = 100;
    progressBar.style.width = `${percentage}%`;

    // Reset classes
    progressBar.className = "progress-bar";
    statusCard.className = "status-card";

    const titleEl = statusCard.querySelector('h4');
    const descEl = statusCard.querySelector('p');

    if (total === 0) {
        progressBar.style.width = "0%";
        titleEl.innerText = "Keine Zuwendungen";
        descEl.innerText = "Trage Werte ein, um die steuerfreie Sachbezugs-Grenze von 50,00 € zu überwachen.";
        statusCard.classList.add('status-card-success');
    } else if (total <= 50.00) {
        // Steuerfrei
        titleEl.innerText = "Steuer- & Sozialversicherungsfrei";
        descEl.innerText = `Die Summe von ${total.toFixed(2)} € liegt innerhalb der monatlichen Freigrenze von 50,00 € (§ 8 Abs. 2 Satz 11 EStG).`;
        statusCard.classList.add('status-card-success');
        
        if (total >= 45.00) {
            progressBar.classList.add('warning'); // Orange, wenn nahe dem Limit
        }
    } else {
        // Steuerpflichtig (Überschritten!)
        progressBar.classList.add('danger'); // Rot
        titleEl.innerText = "Kritisch: VOLL steuerpflichtig!";
        descEl.innerHTML = `
            <strong>Achtung Freigrenze!</strong> Die Summe von <span style="color:#DC2626; font-weight:700;">${total.toFixed(2)} €</span> überschreitet das Limit um ${(total - 50.00).toFixed(2)} €.<br>
            Da es sich um eine <em>Freigrenze</em> (nicht um einen Freibetrag) handelt, wird bei Überschreitung ab 50,01 € der <strong>gesamte Betrag</strong> voll steuer- und sozialversicherungspflichtig!
        `;
        statusCard.classList.add('status-card-danger');
    }
}
