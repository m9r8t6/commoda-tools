document.addEventListener("DOMContentLoaded", () => {
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    const checkLoginStatus = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            if (loginScreen) loginScreen.style.display = 'none';
            if (appContainer) appContainer.style.display = 'flex';
        } else {
            if (loginScreen) loginScreen.style.display = 'flex';
            if (appContainer) appContainer.style.display = 'none';
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('loginPassword').value;
            // Dummy password validation
            if (password === 'commoda123' || password === 'admin') {
                localStorage.setItem('isLoggedIn', 'true');
                if (loginError) loginError.style.display = 'none';
                checkLoginStatus();
                // Clear password input
                document.getElementById('loginPassword').value = '';
            } else {
                if (loginError) loginError.style.display = 'block';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            checkLoginStatus();
        });
    }

    checkLoginStatus();
});
