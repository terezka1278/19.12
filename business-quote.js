document.addEventListener("DOMContentLoaded", async () => {

    const jobId = localStorage.getItem("selectedJobId");

    if (!jobId) {
        alert("No booking selected.");
        return;
    }

    const jobResponse =
        await fetch(`/api/business/jobs/${encodeURIComponent(jobId)}`);

    if (!jobResponse.ok) {
        alert("Failed to load job details.");
        return;
    }

    const jobDetails =
        await jobResponse.json();

    document.getElementById("jobId").value =
        jobDetails.jobID;

    document.getElementById("clientId").value =
        jobDetails.clientID;

    document.getElementById("firstName").value =
        jobDetails.clientFirstName;

    document.getElementById("lastName").value =
        jobDetails.clientLastName;

    document.getElementById("phone").value =
        jobDetails.phoneNumber;

    document.getElementById("email").value =
        jobDetails.email;

    document.getElementById("postcode").value =
        jobDetails.postcode;

    document.getElementById("serviceName").value =
        jobDetails.serviceName;

    const numberOfPoints =
        Number(jobDetails.points || 1);

    document.getElementById("points").value =
        numberOfPoints;

    const suppliesResponse =
        await fetch(
            `/api/business/services/${encodeURIComponent(
                jobDetails.serviceID
            )}/supplies`
        );

    if (!suppliesResponse.ok) {
        alert("Failed to load service supplies.");
        return;
    }

    const supplyList =
        await suppliesResponse.json();

    const suppliesTableBody =
        document.getElementById("suppliesTable");

    suppliesTableBody.innerHTML = "";

    supplyList.forEach(supply => {

        const estimatedQuantity =
            Number(supply.baseQuantity) * numberOfPoints;

        const tableRow =
            document.createElement("tr");

        tableRow.innerHTML = `
            <td>${supply.supplyName}</td>
            <td>${supply.supplyID}</td>
            <td>${estimatedQuantity}</td>
        `;

        suppliesTableBody.appendChild(tableRow);
    });

    const createQuoteButton =
        document.getElementById("createQuoteButton");

    createQuoteButton.addEventListener(
        "click",
        async () => {

            const createQuoteResponse =
                await fetch(
                    "/api/business/documents/quotes/create",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(jobId)
                    }
                );

            const quoteResult =
                await createQuoteResponse.json();

            if (!createQuoteResponse.ok) {
                alert(
                    quoteResult.message ||
                    "Failed to create quote."
                );
                return;
            }

            document.getElementById("quoteTotal").textContent =
                "£" + Number(quoteResult.total).toFixed(2);

            if (quoteResult.estDurationMins != null) {
                document.getElementById("timeEst").value =
                    quoteResult.estDurationMins + " mins";
            }

            alert("Quote created successfully.");
        }
    );
});
