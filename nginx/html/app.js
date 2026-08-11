const API = "http://localhost:8000";


async function loadDashboard() {

    try {

        // ==========================
        // STATISTICS
        // ==========================

        const statsResponse =
            await fetch(
                `${API}/api/statistics`
            );

        const stats =
            await statsResponse.json();


        document.getElementById("total")
            .innerText = stats.total;

        document.getElementById("critical")
            .innerText = stats.critical;

        document.getElementById("high")
            .innerText = stats.high;

        document.getElementById("medium")
            .innerText = stats.medium;

        document.getElementById("low")
            .innerText = stats.low;


        // ==========================
        // INCIDENTS
        // ==========================

        const incidentsResponse =
            await fetch(
                `${API}/api/incidents`
            );

        const data =
            await incidentsResponse.json();


        const table =
            document.getElementById(
                "incidentTable"
            );


        table.innerHTML = "";


        data.incidents.forEach(
            incident => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${incident.timestamp || "-"}
                    </td>

                    <td>
                        ${incident.source || "-"}
                    </td>

                    <td>
                        ${incident.incident_type || "-"}
                    </td>

                    <td>
                        ${incident.severity || "-"}
                    </td>

                    <td>
                        ${incident.description || "-"}
                    </td>

                `;


                table.appendChild(row);

            }
        );


        document.getElementById(
            "status"
        ).innerText = "● API connectée";


    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "status"
        ).innerText =
            "● API indisponible";

    }

}


loadDashboard();


setInterval(
    loadDashboard,
    10000
);