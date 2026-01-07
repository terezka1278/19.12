document.addEventListener("DOMContentLoaded", async () => {

    const selectedJobId =
        localStorage.getItem("selectedJobId");

    if (!selectedJobId) {
        alert("No booking selected.");
        return;
    }

    const jobDetailsResponse =
        await fetch(`/api/business/jobs/${selectedJobId}`);

    if (!jobDetailsResponse.ok) {
        alert("Failed to load job details.");
        return;
    }

    const jobDetails =
        await jobDetailsResponse.json();

    document.getElementById("jobId").value =
        jobDetails.jobID;

    document.getElementById("clientId").value =
        jobDetails.clientID;

    document.getElementById("firstName").value =
        jobDetails.clientFirstName;

    document.getElementById("lastName").value =
        jobDetails.clientLastName;

    document.getElementById("email").value =
        jobDetails.email;

    document.getElementById("postcode").value =
        jobDetails.postcode;

    const suppliesResponse =
        await fetch("/api/business/supplies");

    if (!suppliesResponse.ok) {
        alert("Failed to load supplies.");
        return;
    }

    const supplyList =
        await suppliesResponse.json();

    const invoiceItemsTableBody =
        document.getElementById("invoiceItems");

    supplyList.forEach(supplyItem => {

        const tableRow =
            document.createElement("tr");

        tableRow.innerHTML = `
            <td>
                <select class="supply-select">
                    <option value="">-- Select supply --</option>
                    <option value="${supplyItem.supplyID}">
                        ${supplyItem.supplyName}
                    </option>
                </select>
            </td>
            <td>
                <input
                    type="number"
                    min="0"
                    step="0.1"
                    value="0"
                    class="qty-input">
            </td>
        `;

        invoiceItemsTableBody.appendChild(tableRow);
    });

    const createInvoiceButton =
        document.getElementById("createInvoiceButton");

    createInvoiceButton.addEventListener(
        "click",
        async () => {

            const labourCostValue =
                Number(
                    document.getElementById("labourCost").value || 0
                );

            const extraCostValue =
                Number(
                    document.getElementById("extraCost").value || 0
                );

            const invoiceItems = [];

            document
                .querySelectorAll("#invoiceItems tr")
                .forEach(tableRow => {

                    const selectedSupplyId =
                        tableRow.querySelector(".supply-select").value;

                    const quantityValue =
                        Number(
                            tableRow.querySelector(".qty-input").value
                        );

                    if (selectedSupplyId && quantityValue > 0) {
                        invoiceItems.push({
                            supplyID: selectedSupplyId,
                            quantity: quantityValue
                        });
                    }
                });

            if (invoiceItems.length === 0) {
                alert("Please add at least one supply.");
                return;
            }

            const createInvoiceResponse =
                await fetch(
                    "/api/business/documents/invoices/create",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            jobID: selectedJobId,
                            labourCost: labourCostValue,
                            extraCost: extraCostValue,
                            items: invoiceItems
                        })
                    }
                );

            if (!createInvoiceResponse.ok) {
                alert("Failed to create invoice.");
                return;
            }

            alert("Invoice created successfully.");
            window.location.href =
                "business-documents.html";
        }
    );
});
