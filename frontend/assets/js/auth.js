// ==========================
// REGISTER
// ==========================
async function registerUser(event) {
    if (event) event.preventDefault();
    
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
        const res = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        alert(data.msg);

        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
        }
    } catch (err) {
        alert("Error connecting to server");
    }
}

// ==========================
// LOGIN
// ==========================
async function loginUser(event) {
    if (event) event.preventDefault();
    
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            return alert(data.msg);
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        // Store isAdmin flag if user is admin (optional, backend will verify on API calls)
        if (data.user.isAdmin) {
            localStorage.setItem("isAdmin", "true");
        }

        alert("Login successful!");

        bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
        updateNavbarUI();

    } catch (err) {
        alert("Error connecting to server");
    }
}

// ==========================
// LOGOUT
// ==========================
function logoutUser(event) {
    if (event) event.preventDefault();
    
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    updateNavbarUI();
    alert("You have been logged out.");
}

// ==========================
// NAVBAR UI UPDATE
// ==========================
function updateNavbarUI() {
    const loginNav = document.getElementById("loginNav");
    const userGreeting = document.getElementById("userGreeting");
    const logoutNav = document.getElementById("logoutNav");
    const greetText = document.getElementById("greetText");
    const orderStatusNav = document.getElementById("orderStatusNav");
    const adminNav = document.getElementById("adminNav");

    const user = localStorage.getItem("userName");
    const isAdmin = localStorage.getItem("isAdmin");

    if (user) {
        loginNav.classList.add("d-none");
        userGreeting.classList.remove("d-none");
        logoutNav.classList.remove("d-none");

        // Show admin link if user is admin
        if (isAdmin === "true") {
            adminNav.classList.remove("d-none");
            orderStatusNav.classList.add("d-none"); // Hide Order Status for admins
        } else {
            adminNav.classList.add("d-none");
            orderStatusNav.classList.remove("d-none"); // Show Order Status for regular users
        }

        greetText.innerText = `Welcome, ${user}!`;

    } else {
        loginNav.classList.remove("d-none");
        userGreeting.classList.add("d-none");
        logoutNav.classList.add("d-none");
        orderStatusNav.classList.add("d-none");
        adminNav.classList.add("d-none");
    }
}

window.onload = updateNavbarUI;
