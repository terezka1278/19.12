document.addEventListener("DOMContentLoaded", () => {

    console.log("client-account.js loaded");

    const clientId = localStorage.getItem("clientID");

    if (!clientId) {
        window.location.href = "login.html";
        return;
    }

    loadClientAccountDetails(clientId);

    const accountForm =
        document.getElementById("account-changes");

    accountForm.addEventListener(
        "submit",
        updateClientAccountDetails
    );
});

async function loadClientAccountDetails(clientId) {

    const clientResponse =
        await fetch(`/api/client-account/${clientId}`);

    if (!clientResponse.ok) {
        console.error("Failed to load client info");
        return;
    }

    const clientDetails =
        await clientResponse.json();

    document.getElementById("current-address").innerHTML =
        `<p>${clientDetails.address}</p>`;

    document.getElementById("current-postcode").innerHTML =
        `<p>${clientDetails.postcode}</p>`;

    document.getElementById("current-email").innerHTML =
        `<p>${clientDetails.email}</p>`;

    document.getElementById("current-phoneNum").innerHTML =
        `<p>${clientDetails.phoneNum}</p>`;

    document.getElementById("current-password").innerHTML =
        `<p>********</p>`;
}

async function updateClientAccountDetails(event) {

    event.preventDefault();

    const clientId =
        localStorage.getItem("clientID");

    const submittedFormData =
        new FormData(event.target);

    const updatedAccountData = {
        address: submittedFormData.get("address") || null,
        postcode: submittedFormData.get("postcode") || null,
        email: submittedFormData.get("email") || null,
        phoneNum: submittedFormData.get("phoneNum") || null,
        password: submittedFormData.get("password") || null
    };

    Object.keys(updatedAccountData).forEach(field => {
        if (
            !updatedAccountData[field] ||
            updatedAccountData[field].trim() === ""
        ) {
            updatedAccountData[field] = null;
        }
    });

    const updateResponse =
        await fetch(`/api/client-account/${clientId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedAccountData)
        });

    if (updateResponse.ok) {
        alert("Your account has been updated!");
        loadClientAccountDetails(clientId);
    } else {
        alert("Update failed.");
    }
}
