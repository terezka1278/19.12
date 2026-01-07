document.addEventListener("DOMContentLoaded", () => {

    console.log("client-home.js loaded");

    const clientId = localStorage.getItem("clientID");

    if (!clientId) {
        window.location.href = "login.html";
        return;
    }

    const upcomingBookingsContainer =
        document.getElementById("upcoming-output");

    const previousBookingsContainer =
        document.getElementById("previous-output");

    loadUpcomingBooking(clientId, upcomingBookingsContainer);
    loadPreviousBookings(clientId, previousBookingsContainer);
});

async function loadUpcomingBooking(clientId, container) {

    if (!container) {
        return;
    }

    container.textContent = "Loading next booking...";

    const bookingResponse =
        await fetch(
            `/api/client-bookings/${encodeURIComponent(clientId)}/next`
        );

    if (!bookingResponse.ok) {
        container.textContent =
            "Could not load upcoming booking.";
        return;
    }

    const bookingDetails =
        await bookingResponse.json();

    if (!bookingDetails.hasBooking) {
        container.textContent =
            "You have no upcoming bookings.";
        return;
    }

    const bookingDateText =
        new Date(bookingDetails.scheduledDate)
            .toLocaleDateString();

    let timeSlotText;

    if (bookingDetails.timeSlotPm === 0) {
        timeSlotText = "PM";
    } else {
        timeSlotText = "AM";
    }

    container.innerHTML = `
        <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
        <p><strong>Date:</strong> ${bookingDateText} (${timeSlotText})</p>
        <p><strong>Status:</strong> ${bookingDetails.status}</p>
        <p><strong>Job ID:</strong> ${bookingDetails.jobID}</p>
    `;

    const quoteActionsContainer =
        document.getElementById("quote-actions");

    const quoteMessage =
        document.getElementById("quote-summary");

    if (bookingDetails.status === "Quote Submitted") {

        quoteActionsContainer.hidden = false;

        quoteMessage.textContent =
            "A quote has been given for this job. Please accept or decline to continue.";

        document.getElementById("acceptQuoteButton").onclick =
            async () => {

                await fetch(
                    `/api/client-bookings/quotes/${bookingDetails.quoteID}/accept`,
                    { method: "POST" }
                );

                alert("Quote accepted.");
                location.reload();
            };

        document.getElementById("declineQuoteButton").onclick =
            async () => {

                await fetch(
                    `/api/client-bookings/quotes/${bookingDetails.quoteID}/decline`,
                    { method: "POST" }
                );

                alert("Quote declined.");
                location.reload();
            };
    }
}

async function loadPreviousBookings(clientId, container) {

    if (!container) {
        return;
    }

    container.textContent = "Loading bookings...";

    const bookingsResponse =
        await fetch(
            `/api/client-bookings/${encodeURIComponent(clientId)}`
        );

    if (!bookingsResponse.ok) {
        container.textContent =
            "Could not load bookings.";
        return;
    }

    const bookingList =
        await bookingsResponse.json();

    if (!Array.isArray(bookingList) || bookingList.length === 0) {
        container.textContent =
            "You have no bookings yet.";
        return;
    }

    const currentDate = new Date();

    const previousBookings =
        bookingList.filter(booking => {

            const bookingDate =
                new Date(booking.scheduledDate);

            const isPastDate =
                bookingDate < currentDate;

            const isCompleted =
                booking.status &&
                booking.status.toLowerCase() === "completed";

            return isPastDate || isCompleted;
        });

    if (previousBookings.length === 0) {
        container.textContent =
            "You have no previous bookings yet.";
        return;
    }

    const tableRows =
        previousBookings.map(booking => {

            const bookingDateText =
                new Date(booking.scheduledDate)
                    .toLocaleDateString();

            let timeSlotText;

            if (booking.timeSlotPm) {
                timeSlotText = "PM";
            } else {
                timeSlotText = "AM";
            }

            let quotedPrice;

            if (booking.estPrice != null) {
                quotedPrice =
                    "£" + Number(booking.estPrice).toFixed(2);
            } else {
                quotedPrice = "-";
            }

            return `
                <tr>
                    <td>${booking.jobID}</td>
                    <td>${booking.serviceName}</td>
                    <td>${bookingDateText} (${timeSlotText})</td>
                    <td>${booking.status}</td>
                    <td>${quotedPrice}</td>
                </tr>
            `;
        }).join("");

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Quote (£)</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}
