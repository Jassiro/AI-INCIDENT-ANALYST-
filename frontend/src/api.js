const API_URL = "http://localhost:5000/api";

export async function getIncidents() {

    const response = await fetch(`${API_URL}/incidents`);

    if (!response.ok) {

        throw new Error(
            `Erreur API : ${response.status} ${response.statusText}`
        );

    }

    const data = await response.json();

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.incidents)) {
        return data.incidents;
    }

    if (Array.isArray(data.data)) {
        return data.data;
    }

    console.error("Format API inconnu :", data);

    return [];
}