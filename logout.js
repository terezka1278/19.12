document.addEventListener("DOMContentLoaded", () => {

    console.log("client.js loaded");

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                localStorage.removeItem("clientID");
                localStorage.removeItem("clientEmail");
                localStorage.removeItem("role");
                localStorage.removeItem("currentJobID");
                localStorage.clear();

                alert("You have been logged out.");
                window.location.href = "index.html";
            }
        );
    }
});
