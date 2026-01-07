document.addEventListener("DOMContentLoaded", () => {
    console.log("business-home.js loaded");
    loadBusinessDashboard();
});

async function loadBusinessDashboard() {

    const todayJobsList = document.getElementById("JobsToday");
    const weekCalendarTable = document.getElementById("week-calendar");
    const monthCalendarTable = document.getElementById("month-calendar");

    if (!todayJobsList || !weekCalendarTable || !monthCalendarTable) {
        console.error("Dashboard elements missing");
        return;
    }

    const weekTableBody = weekCalendarTable.querySelector("tbody");
    const monthTableBody = monthCalendarTable.querySelector("tbody");

    todayJobsList.innerHTML = "<li>Loading...</li>";
    weekTableBody.innerHTML = "";
    monthTableBody.innerHTML = "";

    try {
        const jobsResponse = await fetch("/api/business/jobs");

        if (!jobsResponse.ok) {
            todayJobsList.innerHTML = "<li>Failed to load jobs.</li>";
            return;
        }

        const rawJobList = await jobsResponse.json();

        const cleanedJobs = rawJobList.map(jobItem => {
            return normaliseJobData(jobItem);
        });

        renderJobsForToday(cleanedJobs, todayJobsList);
        renderJobsForWeek(cleanedJobs, weekCalendarTable);
        renderJobsForMonth(cleanedJobs, monthCalendarTable);

    } catch (error) {
        console.error(error);
        todayJobsList.innerHTML = "<li>Error loading jobs.</li>";
    }
}

function normaliseJobData(rawJob) {

    let jobId;
    if (rawJob.jobId) {
        jobId = rawJob.jobId;
    } else if (rawJob.JobID) {
        jobId = rawJob.JobID;
    } else {
        jobId = rawJob.jobID;
    }

    let clientFullName;
    if (rawJob.clientName) {
        clientFullName = rawJob.clientName;
    } else {
        clientFullName = rawJob.ClientName;
    }

    let scheduledDateValue;
    if (rawJob.scheduledDate) {
        scheduledDateValue = rawJob.scheduledDate;
    } else {
        scheduledDateValue = rawJob.ScheduledDate;
    }

    let jobStatus;
    if (rawJob.status) {
        jobStatus = rawJob.status;
    } else {
        jobStatus = rawJob.Status;
    }

    let serviceTitle;
    if (rawJob.serviceName) {
        serviceTitle = rawJob.serviceName;
    } else {
        serviceTitle = rawJob.ServiceName;
    }

    let jobAddress;
    if (rawJob.address) {
        jobAddress = rawJob.address;
    } else {
        jobAddress = rawJob.Address;
    }

    let jobPostcode;
    if (rawJob.postcode) {
        jobPostcode = rawJob.postcode;
    } else {
        jobPostcode = rawJob.Postcode;
    }

    let scheduledDateObject;
    if (scheduledDateValue) {
        scheduledDateObject = new Date(scheduledDateValue);
    } else {
        scheduledDateObject = null;
    }

    return {
        jobId: jobId,
        clientName: clientFullName,
        status: jobStatus,
        serviceName: serviceTitle,
        address: jobAddress,
        postcode: jobPostcode,
        dateObject: scheduledDateObject
    };
}

function datesMatch(dateOne, dateTwo) {
    return (
        dateOne.getFullYear() === dateTwo.getFullYear() &&
        dateOne.getMonth() === dateTwo.getMonth() &&
        dateOne.getDate() === dateTwo.getDate()
    );
}

function renderJobsForToday(jobList, listElement) {

    const todayDate = new Date();
    listElement.innerHTML = "";

    const jobsToday = jobList.filter(job => {
        return job.dateObject && datesMatch(job.dateObject, todayDate);
    });

    if (jobsToday.length === 0) {
        listElement.innerHTML = "<li>No jobs scheduled for today.</li>";
        return;
    }

    jobsToday.forEach(job => {
        const listItem = document.createElement("li");
        listItem.textContent =
            job.clientName + " – " +
            job.serviceName + " – " +
            job.address + " (" + job.status + ")";
        listElement.appendChild(listItem);
    });
}

function renderJobsForWeek(jobList, weekTable) {

    const tableBody = weekTable.querySelector("tbody");
    tableBody.innerHTML = "";

    const weekRow = document.createElement("tr");
    const todayDate = new Date();

    const dayIndex = todayDate.getDay();
    let daysBackToMonday;

    if (dayIndex === 0) {
        daysBackToMonday = -6;
    } else {
        daysBackToMonday = 1 - dayIndex;
    }

    const mondayDate = new Date(todayDate);
    mondayDate.setDate(todayDate.getDate() + daysBackToMonday);

    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {

        const currentDate = new Date(mondayDate);
        currentDate.setDate(mondayDate.getDate() + dayOffset);

        const tableCell = document.createElement("td");

        const dateHeader = document.createElement("div");
        dateHeader.classList.add("day-header");
        dateHeader.textContent = currentDate.toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
        tableCell.appendChild(dateHeader);

        const jobsForDay = jobList.filter(job => {
            return job.dateObject && datesMatch(job.dateObject, currentDate);
        });

        if (jobsForDay.length === 0) {
            const noJobsText = document.createElement("p");
            noJobsText.classList.add("no-jobs");
            noJobsText.textContent = "No jobs";
            tableCell.appendChild(noJobsText);
        } else {
            jobsForDay.forEach(job => {
                const jobParagraph = document.createElement("p");
                jobParagraph.classList.add("job-item");
                jobParagraph.textContent =
                    job.clientName + " – " +
                    job.serviceName + " – " +
                    job.address + " (" + job.status + ")";
                tableCell.appendChild(jobParagraph);
            });
        }

        weekRow.appendChild(tableCell);
    }

    tableBody.appendChild(weekRow);
}

function renderJobsForMonth(jobList, monthTable) {

    const tableBody = monthTable.querySelector("tbody");
    tableBody.innerHTML = "";

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstWeekdayIndex =
        (firstDayOfMonth.getDay() + 6) % 7;

    const numberOfDaysInMonth =
        new Date(currentYear, currentMonth + 1, 0).getDate();

    let displayedDay = 1 - firstWeekdayIndex;

    for (let weekIndex = 0; weekIndex < 6; weekIndex++) {

        const tableRow = document.createElement("tr");

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {

            const tableCell = document.createElement("td");

            if (displayedDay < 1 || displayedDay > numberOfDaysInMonth) {
                tableCell.classList.add("empty-day");
            } else {

                const cellDate = new Date(
                    currentYear,
                    currentMonth,
                    displayedDay
                );

                const dateLabel = document.createElement("div");
                dateLabel.classList.add("date-label");
                dateLabel.textContent = displayedDay.toString();
                tableCell.appendChild(dateLabel);

                const jobsForDate = jobList.filter(job => {
                    return job.dateObject && datesMatch(job.dateObject, cellDate);
                });

                jobsForDate.forEach(job => {
                    const jobParagraph = document.createElement("p");
                    jobParagraph.classList.add("job-item");
                    jobParagraph.textContent =
                        job.clientName + " – " +
                        job.serviceName + " – " +
                        job.address + " (" + job.status + ")";
                    tableCell.appendChild(jobParagraph);
                });
            }

            tableRow.appendChild(tableCell);
            displayedDay++;
        }

        tableBody.appendChild(tableRow);

        if (displayedDay > numberOfDaysInMonth) {
            break;
        }
    }
}
