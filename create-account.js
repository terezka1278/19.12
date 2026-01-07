document.addEventListener("DOMContentLoaded", () => {

    console.log("create-account.js loaded");

    const createAccountForm =
        document.getElementById("create-account-form");

    const statusOutput =
        document.getElementById("create-output");

    const successPopup =
        document.getElementById("nextPopup");

    if (!createAccountForm) {
        console.log("Create account form not found");
        return;
    }

    createAccountForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const passwordValue =
                document.getElementById("password").value;

            const confirmPasswordValue =
                document.getElementById("confirm").value;

            if (passwordValue !== confirmPasswordValue) {
                if (statusOutput) {
                    statusOutput.textContent =
                        "Passwords do not match.";
                }
                return;
            }

            const accountDetails = {
                firstName:
                    document.getElementById("firstname").value.trim(),
                lastName:
                    document.getElementById("lastname").value.trim(),
                email:
                    document.getElementById("email").value.trim(),
                phoneNum:
                    document.getElementById("phoneNum").value.trim(),
                address:
                    document.getElementById("address").value.trim(),
                postcode:
                    document.getElementById("postcode").value.trim(),
                password:
                    passwordValue
            };

            console.log(
                "Sending create-account request",
                accountDetails
            );

            if (statusOutput) {
                statusOutput.textContent =
                    "Creating account...";
            }

            const createAccountResponse =
                await fetch(
                    "/api/client/create-account",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(accountDetails)
                    }
                );

            const createAccountResult =
                await createAccountResponse.json();

            console.log(
                "Create-account response",
                createAccountResponse.status,
                createAccountResult
            );

            if (!createAccountResponse.ok) {
                if (statusOutput) {
                    statusOutput.textContent =
                        createAccountResult.message ||
                        "Error creating account.";
                }
                return;
            }

            if (statusOutput) {
                statusOutput.textContent =
                    "Account created! Your ID is: " +
                    createAccountResult.clientId;
            }

            localStorage.setItem(
                "clientID",
                createAccountResult.clientId
            );

            localStorage.setItem(
                "clientEmail",
                accountDetails.email
            );

            if (successPopup) {
                successPopup.style.display = "flex";
            } else {
                window.location.href = "login.html";
            }
        }
    );
});
