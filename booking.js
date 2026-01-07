document.addEventListener("DOMContentLoaded", () => {

    console.log("booking.js loaded");

    const urlParams = new URLSearchParams(window.location.search);
    const isFromQuote = urlParams.get("fromQuote") === "true";

    const bookingForm = document.getElementById("booking-form");
    const nextStepButton = document.getElementById("nextButton");
    const stepOneMessage = document.getElementById("stage1-output");

    const confirmationPopup = document.getElementById("confirm-popup");
    const confirmationText = document.getElementById("confirm-popup-message");
    const closePopupButton = document.getElementById("confirm-popup-close");

    if (!bookingForm) return;

    // If arriving from quote acceptance, hide step 1 and only allow step 2
    if (isFromQuote) {
        const storedJobId = localStorage.getItem("currentJobID");

        if (!storedJobId) {
            alert("Booking session expired.");
            window.location.href = "client-documents.html";
            return;
        }

        const stage1 = document.getElementById("stage1");
        const personal = document.querySelector(".personal");
        const jobInfo = document.querySelector(".job-info");

        if (stage1) stage1.style.display = "none";
        if (personal) personal.style.display = "none";
        if (jobInfo) jobInfo.style.display = "none";
    }

    // ------------------------------
    // STEP 1 (only if not from quote)
    // ------------------------------
    if (!isFromQuote && nextStepButton) {
        nextStepButton.addEventListener("click", async () => {

            const firstName = document.getElementById("firstname")?.value.trim();
            const lastName = document.getElementById("lastname")?.value.trim();
            const emailAddress = document.getElementById("email")?.value.trim();
            const phoneNumber = document.getElementById("phoneNum")?.value.trim();
            const homeAddress = document.getElementById("address")?.value.trim();
            const postcode = document.getElementById("postcode")?.value.trim();
            const selectedService = document.getElementById("service")?.value;
            const jobSummary = document.getElementById("summary")?.value.trim();
            const jobPoints = Number(document.getElementById("points")?.value);

            if (
                !firstName || !lastName || !emailAddress || !phoneNumber ||
                !homeAddress || !postcode || !selectedService ||
                !jobSummary || !jobPoints
            ) {
                if (stepOneMessage) stepOneMessage.textContent = "Please fill in all required fields.";
                return;
            }

            const bookingDetails = {
                firstName,
                lastName,
                email: emailAddress,
                phoneNum: phoneNumber,
                address: homeAddress,
                postcode,
                service: selectedService,
                points: jobPoints,
                summary: jobSummary,
                clientId: localStorage.getItem("clientID") || null
            };

            if (stepOneMessage) stepOneMessage.textContent = "Saving your details...";

            let response;
            try {
                response = await fetch("/api/booking/step1", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bookingDetails)
                });
            } catch {
                if (stepOneMessage) stepOneMessage.textContent = "Server not responding. Please try again.";
                return;
            }

            let bookingResponse = {};
            try {
                bookingResponse = await response.json();
            } catch {
                if (stepOneMessage) stepOneMessage.textContent = "Unexpected server response.";
                return;
            }

            if (!response.ok) {
                if (stepOneMessage) stepOneMessage.textContent =
                    bookingResponse.message || "Failed to create booking.";
                return;
            }

            localStorage.setItem("clientID", bookingResponse.clientId);
            localStorage.setItem("clientEmail", emailAddress);
            localStorage.setItem("clientName", `${firstName} ${lastName}`);
            localStorage.setItem("currentJobID", bookingResponse.jobId);

            if (stepOneMessage) stepOneMessage.textContent = "Details saved. Continue to Step 2.";
        });
    }

    // ------------------------------
    // STEP 2 (find available dates)
    // ------------------------------
    bookingForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const currentJobId = localStorage.getItem("currentJobID");
        if (!currentJobId) {
            alert("Missing job information.");
            return;
        }

        const chosenDays = [];
        document.querySelectorAll(".days").forEach(box => {
            if (box.checked) chosenDays.push(box.name);
        });

        const output = document.getElementById("date-output");

        if (chosenDays.length === 0) {
            if (output) output.textContent = "Please select at least one day.";
            return;
        }

        let response;
        try {
            response = await fetch("/api/booking/step2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId: currentJobId, days: chosenDays })
            });
        } catch {
            if (output) output.textContent = "Server not responding. Please try again.";
            return;
        }

        let availableDatesResponse = {};
        try {
            availableDatesResponse = await response.json();
        } catch {
            if (output) output.textContent = "Unexpected server response.";
            return;
        }

        if (!response.ok) {
            if (output) output.textContent =
                availableDatesResponse.message || "Could not find available dates.";
            return;
        }

        showAvailableDates(availableDatesResponse.suggestedDates, currentJobId);
    });

    // ------------------------------
    // Render available dates + confirm
    // ------------------------------
    function showAvailableDates(availableDates, jobId) {

        const outputArea = document.getElementById("date-output");
        if (!outputArea) return;

        outputArea.innerHTML = "<p>Please choose a date and time:</p>";

        availableDates.forEach(dateOption => {
            const label = document.createElement("label");

            const formattedDate = new Date(dateOption.date).toLocaleDateString(
                undefined,
                { weekday: "long", year: "numeric", month: "short", day: "numeric" }
            );

            label.innerHTML = `${formattedDate} `;

            if (dateOption.amAvailable) {
                label.innerHTML +=
                    `<input type="radio" name="slot" value="${dateOption.date}|AM"> AM `;
            } else {
                label.innerHTML += "(AM full) ";
            }

            if (dateOption.pmAvailable) {
                label.innerHTML +=
                    `<input type="radio" name="slot" value="${dateOption.date}|PM"> PM `;
            } else {
                label.innerHTML += "(PM full) ";
            }

            outputArea.appendChild(label);
            outputArea.appendChild(document.createElement("br"));
        });

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.textContent = "Confirm booking";
        outputArea.appendChild(confirmButton);

        confirmButton.onclick = async () => {

            const selectedSlot = document.querySelector("input[name='slot']:checked");
            if (!selectedSlot) {
                alert("Select a date and time.");
                return;
            }

            const [chosenDate, chosenTime] = selectedSlot.value.split("|");

            let response;
            try {
                response = await fetch("/api/booking/step2/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jobId,
                        selectedDate: chosenDate,
                        selectedSlot: chosenTime
                    })
                });
            } catch {
                alert("Server not responding. Please try again.");
                return;
            }

            let confirmationResponse = {};
            try {
                confirmationResponse = await response.json();
            } catch {
                alert("Unexpected server response.");
                return;
            }

            if (!response.ok) {
                alert(confirmationResponse.message || "Booking failed.");
                return;
            }

            // Fill hidden email inputs (only if they exist)
            const emailServiceEl = document.getElementById("emailService");
            const emailDateEl = document.getElementById("emailDate");
            const emailTimeEl = document.getElementById("emailTime");

            if (emailServiceEl) {
                const serviceSelect = document.getElementById("service");
                if (serviceSelect && serviceSelect.selectedOptions && serviceSelect.selectedOptions[0]) {
                    emailServiceEl.value = serviceSelect.selectedOptions[0].text;
                } else {
                    emailServiceEl.value = "Service";
                }
            }

            if (emailDateEl) emailDateEl.value = confirmationResponse.selectedDate;
            if (emailTimeEl) emailTimeEl.value = confirmationResponse.timeSlot;

            // Send email (only if form exists)
            const clientEmail = localStorage.getItem("clientEmail");
            const emailForm = document.getElementById("bookingConfirm");

            if (emailForm && clientEmail) {
                emailForm.action = "https://formsubmit.co/" + clientEmail;
                emailForm.submit();
            }

            // Show popup if available, otherwise fallback alert
            const displayDate = new Date(confirmationResponse.selectedDate).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric"
            });

            const message = `Your booking is confirmed for ${displayDate} (${confirmationResponse.timeSlot}).`;

            if (confirmationPopup && confirmationText) {
                confirmationText.textContent = message;
                confirmationPopup.hidden = false;
            } else {
                alert(message);
            }
        };
    }

    if (closePopupButton && confirmationPopup) {
        closePopupButton.onclick = () => confirmationPopup.hidden = true;
    }
});
