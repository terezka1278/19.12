let selectedJobId = null;
let selectedQuoteId = null;

document.addEventListener("DOMContentLoaded", () => {

    const clientId = localStorage.getItem("clientID");

    if (!clientId) {
        window.location.href = "login.html";
        return;
    }

    const bookingsContainer =
        document.getElementById("manage-output");

    const quotesContainer =
        document.getElementById("quotes-list");

    const invoicesContainer =
        document.getElementById("invoices-list");

    const cancelBookingButton =
        document.getElementById("cancelButton");

    const acceptQuoteButton =
        document.getElementById("acceptQuoteButton");

    const declineQuoteButton =
        document.getElementById("declineQuoteButton");

    loadClientBookings(clientId, bookingsContainer);
    loadClientQuotes(clientId, quotesContainer);
    loadClientInvoices(clientId, invoicesContainer);

    if (cancelBookingButton) {
        cancelBookingButton.addEventListener(
            "click",
            async () => {

                if (!selectedJobId) {
                    alert("Please select a booking first.");
                    return;
                }

                const confirmCancel =
                    confirm("Are you sure you want to cancel this booking?");

                if (!confirmCancel) {
                    return;
                }

                const cancelResponse =
                    await fetch(
                        `/api/client-bookings/${selectedJobId}`,
                        { method: "DELETE" }
                    );

                if (!cancelResponse.ok) {
                    alert("Failed to cancel booking.");
                    return;
                }

                const clientEmail =
                    localStorage.getItem("clientEmail");

                const businessEmail =
                    "terezkakovalova07@gmail.com";

                const clientEmailForm =
                    document.getElementById("cancelClientEmail");

                clientEmailForm.action =
                    "https://formsubmit.co/" + clientEmail;

                clientEmailForm.submit();

                document.getElementById("cancelJobId").value =
                    selectedJobId;

                const businessEmailForm =
                    document.getElementById("cancelBusinessEmail");

                businessEmailForm.action =
                    "https://formsubmit.co/" + businessEmail;

                businessEmailForm.submit();

                alert("Booking cancelled.");
                location.reload();
            }
        );
    }

    if (acceptQuoteButton) {
        acceptQuoteButton.addEventListener(
            "click",
            async () => {

                if (!selectedQuoteId || !selectedJobId) {
                    alert("Select a quote first.");
                    return;
                }

                const acceptResponse =
                    await fetch(
                        `/api/client-bookings/quotes/${selectedQuoteId}/accept`,
                        { method: "POST" }
                    );

                if (!acceptResponse.ok) {
                    alert("Failed to accept quote.");
                    return;
                }

                const businessEmail =
                    "terezkakovalova07@gmail.com";

                document.getElementById("acceptedQuoteJobId").value =
                    selectedJobId;

                document.getElementById("acceptedQuoteId").value =
                    selectedQuoteId;

                const acceptEmailForm =
                    document.getElementById("quoteAcceptedEmail");

                acceptEmailForm.action =
                    "https://formsubmit.co/" + businessEmail;

                acceptEmailForm.submit();

                alert("Quote accepted.");
                location.reload();
            }
        );
    }

    if (declineQuoteButton) {
        declineQuoteButton.addEventListener(
            "click",
            async () => {

                if (!selectedQuoteId) {
                    alert("Select a quote first.");
                    return;
                }

                await fetch(
                    `/api/client-bookings/quotes/${selectedQuoteId}/decline`,
                    { method: "POST" }
                );

                alert("Quote declined.");
                location.reload();
            }
        );
    }
});

async function loadClientBookings(clientId, container) {

    container.textContent = "Loading bookings...";

    const bookingsResponse =
        await fetch(`/api/client-bookings/${clientId}`);

    if (!bookingsResponse.ok) {
        container.textContent =
            "Failed to load bookings.";
        return;
    }

    const bookingList =
        await bookingsResponse.json();

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${bookingList.map(booking => `
                    <tr class="booking-row"
                        onclick="selectBooking('${booking.jobID}', this)">
                        <td>${booking.jobID}</td>
                        <td>${booking.serviceName}</td>
                        <td>${booking.status}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function selectBooking(jobId, selectedRow) {

    selectedJobId = jobId;

    document
        .querySelectorAll(".booking-row")
        .forEach(row => {
            row.classList.remove("selected");
        });

    selectedRow.classList.add("selected");
}

async function loadClientQuotes(clientId, container) {

    container.textContent = "Loading quotes...";

    const quotesResponse =
        await fetch(`/api/client-bookings/${clientId}/quotes`);

    if (!quotesResponse.ok) {
        container.textContent =
            "Failed to load quotes.";
        return;
    }

    const quoteList =
        await quotesResponse.json();

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Quote ID</th>
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${quoteList.map(quote => {

        let statusText = "Pending";

        if (quote.accepted === 1) {
            statusText = "Accepted";
        }

        if (quote.accepted === 0) {
            statusText = "Declined";
        }

        return `
                        <tr onclick="selectQuote(
                            '${quote.quoteID}',
                            '${quote.jobID}',
                            ${quote.accepted}
                        )">
                            <td>${quote.quoteID}</td>
                            <td>${quote.jobID}</td>
                            <td>${quote.serviceName}</td>
                            <td>£${quote.estPrice.toFixed(2)}</td>
                            <td>${quote.estDuration} hrs</td>
                            <td>${statusText}</td>
                        </tr>
                    `;
    }).join("")}
            </tbody>
        </table>
    `;
}

function selectQuote(quoteId, jobId, accepted) {

    selectedQuoteId = quoteId;
    selectedJobId = jobId;

    const statusDisplay =
        document.getElementById("quoteStatus");

    const actionsContainer =
        document.getElementById("quoteActions");

    if (accepted === 1) {
        statusDisplay.textContent =
            "Status: Accepted. The business will proceed.";
        actionsContainer.style.display = "none";
    }
    else if (accepted === 0) {
        statusDisplay.textContent =
            "Status: Declined. You declined this quote.";
        actionsContainer.style.display = "none";
    }
    else {
        statusDisplay.textContent =
            "Status: Awaiting your decision.";
        actionsContainer.style.display = "block";
    }
}

async function loadClientInvoices(clientId, container) {

    container.textContent = "Loading invoices...";

    const invoicesResponse =
        await fetch(`/api/client-bookings/${clientId}/invoices`);

    if (!invoicesResponse.ok) {
        container.textContent =
            "Failed to load invoices.";
        return;
    }

    const invoiceList =
        await invoicesResponse.json();

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Invoice ID</th>
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${invoiceList.map(invoice => `
                    <tr>
                        <td>${invoice.invoiceID}</td>
                        <td>${invoice.jobID}</td>
                        <td>${invoice.serviceName}</td>
                        <td>£${invoice.finalPrice.toFixed(2)}</td>
                        <td>${invoice.paymentStatus}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}
