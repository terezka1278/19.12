let selectedJobId = null;

document.addEventListener("DOMContentLoaded", () => {

    console.log("business-documents.js loaded");

    loadAllQuotes();
    loadAllInvoices();
    loadAllBookings();

    const cancelBookingButton = document.getElementById("cancelButton");

    if (cancelBookingButton) {
        cancelBookingButton.addEventListener("click", async () => {

            if (!selectedJobId) {
                alert("Please select a booking first.");
                return;
            }

            const confirmCancel = confirm(
                "Are you sure you want to cancel this booking?"
            );

            if (!confirmCancel) {
                return;
            }

            const cancelResponse = await fetch(
                `/api/client-bookings/${selectedJobId}`,
                { method: "DELETE" }
            );

            if (!cancelResponse.ok) {
                alert("Failed to cancel booking.");
                return;
            }

            const clientEmailAddress = prompt(
                "Enter client email to notify:"
            );

            const businessEmailAddress = "terezkakovalova07@gmail.com";

            if (clientEmailAddress) {
                const clientEmailForm =
                    document.getElementById("cancelClientEmail");

                clientEmailForm.action =
                    "https://formsubmit.co/" + clientEmailAddress;

                clientEmailForm.submit();
            }

            document.getElementById("cancelJobId").value = selectedJobId;

            const businessEmailForm =
                document.getElementById("cancelBusinessEmail");

            businessEmailForm.action =
                "https://formsubmit.co/" + businessEmailAddress;

            businessEmailForm.submit();

            alert("Booking cancelled.");
            location.reload();
        });
    }
});

async function loadAllBookings() {

    const bookingsContainer =
        document.getElementById("manage-output");

    if (!bookingsContainer) {
        return;
    }

    bookingsContainer.textContent = "Loading bookings...";

    const bookingsResponse =
        await fetch("/api/business/jobs");

    if (!bookingsResponse.ok) {
        bookingsContainer.textContent =
            "Could not load bookings.";
        return;
    }

    const bookingList =
        await bookingsResponse.json();

    if (!Array.isArray(bookingList) || bookingList.length === 0) {
        bookingsContainer.textContent =
            "No bookings found.";
        return;
    }

    const tableRows = bookingList.map(booking => `
        <tr class="booking-row"
            onclick="selectBooking('${booking.jobID}', this)">
            <td>${booking.jobID}</td>
            <td>${booking.clientName}</td>
            <td>${booking.serviceName}</td>
            <td>${booking.status}</td>
        </tr>
    `).join("");

    bookingsContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Job ID</th>
                    <th>Client</th>
                    <th>Service</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

function selectBooking(jobId, selectedRow) {

    selectedJobId = jobId;

    const allRows =
        document.querySelectorAll(".booking-row");

    allRows.forEach(row => {
        row.classList.remove("selected");
    });

    selectedRow.classList.add("selected");
}

async function loadAllQuotes() {

    const quotesContainer =
        document.getElementById("quote-output");

    if (!quotesContainer) {
        return;
    }

    quotesContainer.textContent = "Loading quotes...";

    const quotesResponse =
        await fetch("/api/business/documents/quotes");

    if (!quotesResponse.ok) {
        quotesContainer.textContent =
            "Could not load quotes.";
        return;
    }

    const quoteList =
        await quotesResponse.json();

    if (!Array.isArray(quoteList) || quoteList.length === 0) {
        quotesContainer.textContent =
            "There are currently no quotes.";
        return;
    }

    const tableRows = quoteList.map(quote => {

        let quoteStatusText;

        if (quote.accepted === 1) {
            quoteStatusText = "Accepted";
        }
        else if (quote.accepted === 0) {
            quoteStatusText = "Declined";
        }
        else {
            quoteStatusText = "Pending";
        }

        return `
            <tr>
                <td>${quote.quoteID}</td>
                <td>${quote.jobID}</td>
                <td>${quote.serviceName}</td>
                <td>£${Number(quote.estPrice).toFixed(2)}</td>
                <td>${quote.estDuration} hrs</td>
                <td>${quoteStatusText}</td>
            </tr>
        `;
    }).join("");

    quotesContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Quote ID</th>
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Estimated Price</th>
                    <th>Estimated Duration</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

async function loadAllInvoices() {

    const invoicesContainer =
        document.getElementById("invoice-output");

    if (!invoicesContainer) {
        return;
    }

    invoicesContainer.textContent =
        "Loading invoices...";

    const invoicesResponse =
        await fetch("/api/business/documents/invoices");

    if (!invoicesResponse.ok) {
        invoicesContainer.textContent =
            "Could not load invoices.";
        return;
    }

    const invoiceList =
        await invoicesResponse.json();

    if (!Array.isArray(invoiceList) || invoiceList.length === 0) {
        invoicesContainer.textContent =
            "There are currently no invoices.";
        return;
    }

    const tableRows = invoiceList.map(invoice => `
        <tr>
            <td>${invoice.invoiceID}</td>
            <td>${invoice.jobID}</td>
            <td>${invoice.serviceName}</td>
            <td>£${Number(invoice.finalPrice).toFixed(2)}</td>
            <td>${invoice.paymentStatus}</td>
            <td>£${Number(invoice.depositPaid).toFixed(2)}</td>
        </tr>
    `).join("");

    invoicesContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Invoice ID</th>
                    <th>Job ID</th>
                    <th>Service</th>
                    <th>Final Price</th>
                    <th>Payment Status</th>
                    <th>Deposit Paid</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}
