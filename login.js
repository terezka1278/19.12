document.addEventListener("DOMContentLoaded", () => {
    console.log("login.js loaded");

    const loginForm = document.getElementById("login-form");
    const messageOutput = document.getElementById("login-output");
    const confirmationPopup = document.getElementById("confirmationPopup");

    if (!loginForm) {
        console.log("Login form not found on page");
        return;
    }

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // stop page reload

        const emailInput = document.getElementById("email").value.trim();
        const passwordInput = document.getElementById("password").value;

        const loginRequest = {
            email: emailInput,
            password: passwordInput
        };

        if (messageOutput) {
            messageOutput.textContent = "Logging in...";
        }

        const response = await fetch("/api/client/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginRequest)
        });

        const loginResponse = await response.json();
        console.log("Login response:", response.status, loginResponse);

        if (!response.ok) {
            if (messageOutput) {
                messageOutput.textContent =
                    loginResponse.message || "Invalid login details.";
            }
            return;
        }

        // store login details
        localStorage.setItem("clientID", loginResponse.clientId);
        localStorage.setItem("clientEmail", emailInput);
        localStorage.setItem("role", loginResponse.role);

        const wasBooking = localStorage.getItem("returnToBooking");

        if (wasBooking === "true") {
            localStorage.removeItem("returnToBooking");
            window.location.href = "booking.html";
            return;
        }

        if (loginResponse.role === "B") {
            window.location.href = "business-home.html";
        } else {
            if (confirmationPopup) {
                confirmationPopup.style.display = "flex";
            } else {
                window.location.href = "client-home.html";
            }
        }
    });
});
