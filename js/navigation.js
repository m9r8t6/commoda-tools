document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll('.nav-item');
    const appViews = document.querySelectorAll('.app-view');
    const appTitle = document.getElementById('appTitle');
    const filterContainers = document.querySelectorAll('.topbar-filters');
    const savedBtn = document.getElementById('nav-saved-btn');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); // Verhindert das Springen der Seite bei # Links

            const targetApp = this.getAttribute('data-target');
            const targetTitle = this.getAttribute('data-title');

            // 1. Sidebar Active-State aktualisieren
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // 2. Titel im Topbar ändern
            appTitle.innerText = targetTitle;

            // 3. Views im Content-Bereich umschalten
            appViews.forEach(view => view.classList.remove('active-view'));
            const targetView = document.getElementById('view-' + targetApp);
            if (targetView) {
                targetView.classList.add('active-view');
            }

            // 4. Passende Filter im Topbar ein- und ausblenden
            filterContainers.forEach(filter => {
                filter.classList.remove('active-filters');
                // Ensure inline display resets (like inline style block resets from other apps)
                filter.style.display = ''; 
            });
            const targetFilter = document.getElementById('filters-' + targetApp);
            if(targetFilter) {
                targetFilter.classList.add('active-filters');
            }

            // 5. 'Gespeichert' Button nur bei Mitarbeitersuche einblenden
            if (savedBtn) {
                if (targetApp === 'mitarbeiter') {
                    savedBtn.style.display = 'flex';
                } else {
                    savedBtn.style.display = 'none';
                }
            }
        });
    });
});