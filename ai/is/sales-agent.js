document.addEventListener("DOMContentLoaded", () => {
    loadLeads();
});

async function loadLeads() {
    const response = await fetch("assets/mock-data.json");
    const leads = await response.json();

    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = "";

    let qualifiedCount = 0;

    leads.forEach(lead => {
        const score = generateScore(lead);
        const status = getStatus(score);

        if (status === "Ideal") qualifiedCount++;

        const row = `
            <tr class="border-b">
                <td class="p-2">${lead.company}</td>
                <td class="p-2">${lead.industry}</td>
                <td class="p-2 font-bold ${score > 75 ? 'text-green-600' : 'text-yellow-600'}">${score}</td>
                <td class="p-2 ${status === 'Ideal' ? 'text-green-500' : 'text-yellow-500'}">${status}</td>
            </tr>
        `;

        tableBody.innerHTML += row;
    });

    updateKPIs(leads.length, qualifiedCount);
    generateEmail(leads[0]);
}

function generateScore(lead) {
    let base = Math.floor(Math.random() * 40) + 60;

    if (lead.industry === "SaaS") base += 10;

    return base > 100 ? 100 : base;
}

function getStatus(score) {
    if (score > 75) return "Ideal";
    if (score > 60) return "Medium";
    return "Low";
}

function updateKPIs(total, qualified) {
    document.querySelectorAll(".text-2xl")[0].innerText = total;
    document.querySelectorAll(".text-2xl")[1].innerText = qualified;
    document.querySelectorAll(".text-2xl")[2].innerText = total;
    document.querySelectorAll(".text-2xl")[3].innerText = `$${qualified * 8000}`;
}

function generateEmail(lead) {
    const emailBox = document.querySelector(".bg-gray-50");
    emailBox.innerHTML = `
        Hi ${lead.company} Team,<br><br>
        We noticed your presence in the ${lead.industry} space. 
        Our AI-driven automation system helps companies like yours increase 
        qualified demo bookings by 30–40%.<br><br>
        Would you be open to a short 10-minute call this week?<br><br>
        Best,<br>
        Indus AI Team
    `;
}