document.addEventListener("DOMContentLoaded", () => {
    console.log("business-jobs.js loaded");
    loadBusinessJobs();
});

async function loadBusinessJobs() {

    const jobsContainer =
        document.getElementById("manage-output");

    if (!jobsContainer) {
        console.error("#manage-output not found");
        return;
    }

    jobsContainer.innerHTML =
        "<p>Loading bookings...</p>";

    const jobsResponse =
        await fetch("/api/business/jobs");

    if (!jobsResponse.ok) {
        jobsContainer.innerHTML =
            "<p>Failed to load bookings.</p>";
        return;
    }

    const jobList =
        await jobsResponse.json();

    if (!Array.isArray(jobList) || jobList.length === 0) {
        jobsContainer.innerHTML =
            "<p>No bookings found.</p>";
        return;
    }

    const jobsTable =
        document.createElement("table");

    jobsTable.classList.add("jobs-table");

    const tableHeader =
        document.createElement("thead");

    tableHeader.innerHTML = `
        <tr>
            <th>Job ID</th>
            <th>Date</th>
            <th>Client</th>
            <th>Status</th>
            <th>Action</th>
        </tr>
    `;

    jobsTable.appendChild(tableHeader);

    const tableBody =
        document.createElement("tbody");

    jobList.forEach(jobItem => {

        const tableRow =
            document.createElement("tr");

        const formattedDate =
            new Date(jobItem.scheduledDate)
                .toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                });

        tableRow.innerHTML = `
            <td>${jobItem.jobID}</td>
            <td>${formattedDate}</td>
            <td>${jobItem.clientName}</td>
            <td class="status-cell">${jobItem.status}</td>
            <td></td>
        `;

        const actionCell =
            tableRow.lastElementChild;

        const completeButton =
            document.createElement("button");

        completeButton.type = "button";
        completeButton.textContent = "Mark Completed";
        completeButton.classList.add("button");

        if (jobItem.status === "Completed") {
            completeButton.disabled = true;
        }

        completeButton.addEventListener(
            "click",
            () => markJobAsCompleted(jobItem.jobID, tableRow)
        );

        actionCell.appendChild(completeButton);
        tableBody.appendChild(tableRow);
    });

    jobsTable.appendChild(tableBody);

    jobsContainer.innerHTML = "";
    jobsContainer.appendChild(jobsTable);
}

async function markJobAsCompleted(jobId, tableRow) {

    const confirmUpdate =
        confirm(`Mark job ${jobId} as Completed?`);

    if (!confirmUpdate) {
        return;
    }

    const updateResponse =
        await fetch(
            `/api/business/jobs/${encodeURIComponent(jobId)}/complete`,
            { method: "PUT" }
        );

    if (!updateResponse.ok) {
        alert("Failed to update job.");
        return;
    }

    const statusCell =
        tableRow.querySelector(".status-cell");

    if (statusCell) {
        statusCell.textContent = "Completed";
    }

    const actionButton =
        tableRow.querySelector("button");

    if (actionButton) {
        actionButton.disabled = true;
    }
}
