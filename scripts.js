document.addEventListener("DOMContentLoaded", () => {

    console.log("scripts.js loaded");

    const accountButton =
        document.getElementById("accountButton");

    const accountPopup =
        document.getElementById("accountPopup");

    console.log("accountButton =", accountButton);
    console.log("popup =", accountPopup);

    if (!accountButton || !accountPopup) {
        console.log("Missing account button or popup");
        return;
    }

    accountPopup.style.display = "none";

    accountButton.addEventListener(
        "click",
        event => {

            event.preventDefault();
            console.log("Account clicked");

            accountPopup.style.display = "flex";
        }
    );

    accountPopup.addEventListener(
        "click",
        event => {

            console.log("Overlay clicked");

            if (event.target === accountPopup) {
                console.log("Closing popup");
                accountPopup.style.display = "none";
            }
        }
    );
});
