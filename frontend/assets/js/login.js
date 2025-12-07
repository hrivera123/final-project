window.onload = function () {
    let loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
    loginModal.show();
};

// open register modal
document.addEventListener("DOMContentLoaded", function () {

    const registerBtn = document.querySelector(".modal-content .btn-outline-pink");
    const loginModalEl = document.getElementById("loginModal");
    const registerModalEl = document.getElementById("registerModal");

    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            const loginModal = bootstrap.Modal.getInstance(loginModalEl);
            loginModal.hide();

            const regModal = new bootstrap.Modal(registerModalEl);
            regModal.show();
        });
    }

    // go back to login modal
    const goToLogin = document.getElementById("goToLogin");
    if (goToLogin) {
        goToLogin.addEventListener("click", () => {
            const regModal = bootstrap.Modal.getInstance(registerModalEl);
            regModal.hide();

            const loginModal = new bootstrap.Modal(loginModalEl);
            loginModal.show();
        });
    }
});
