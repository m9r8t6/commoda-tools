document.addEventListener("DOMContentLoaded", () => {
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    const extractNameFromEmail = (email) => {
        if (!email) return "Benutzer";
        const localPart = email.split('@')[0];
        const parts = localPart.split(/[._-]/);
        const capitalizedParts = parts.map(part => {
            if (!part) return "";
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        });
        return capitalizedParts.filter(Boolean).join(" ");
    };

    const checkLoginStatus = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            if (loginScreen) loginScreen.style.display = 'none';
            if (appContainer) appContainer.style.display = 'flex';
            
            // Dynamic user profile updates
            const name = localStorage.getItem('userName') || 'Benutzer';
            const email = localStorage.getItem('userEmail') || 'user@firma.de';
            
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const avatar = document.querySelector('.user-profile .avatar');
            
            if (profileName) profileName.innerText = name;
            if (profileEmail) profileEmail.innerText = email;
            if (avatar) {
                avatar.style.backgroundImage = `url('https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D1D5DB&color=111827')`;
            }
        } else {
            if (loginScreen) loginScreen.style.display = 'flex';
            if (appContainer) appContainer.style.display = 'none';
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginUser').value.trim();
            const password = document.getElementById('loginPassword').value;
            // Dummy password validation
            if (password === 'commoda123' || password === 'admin') {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', emailInput);
                localStorage.setItem('userName', extractNameFromEmail(emailInput));
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
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            checkLoginStatus();
        });
    }

    checkLoginStatus();
});
