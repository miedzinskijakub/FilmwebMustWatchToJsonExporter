function formatDate(dateNumber) {
    const dateStr = dateNumber?.toString();
    if (!dateStr) {
        return ""
    }

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    return `${year}-${month}-${day}`;
}

function formatTitle(title) {
    if (!title) {
        return ""
    }

    if (title.includes(",")) {
        return `"${title}"`
    }

    return title
}

async function fetchApi(endpoint) {
    const dataJSON = await fetch(`https://www.filmweb.pl/api/v1/${endpoint}`, {
        method: "GET",
        headers: {
            Cookie: document.cookie,
            'X-Locale': 'pl',
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw Error(`Błąd skryptu podczas fetchowania, endpoint: ${endpoint}, reponse: ${JSON.stringify(response)}`)
            }
            return response.json()
        })

    return dataJSON;
}

async function getAllRates() {
    const allData = [];

    const serialJSON = await fetchApi(`logged/want2see?entityName=serial`);
    const tvshowJSON = await fetchApi(`logged/want2see?entityName=tvshow`);
    const allSavedIds = [...serialJSON, ...tvshowJSON].filter((entry) => entry[1] > 0).map((entry) => entry[0]);

    for (let i = 0; i < allSavedIds.length; i++) {
        const id = allSavedIds[i];

        // get title, year
        const descriptionData = await fetchApi(`title/${id}/info`);

        // get rating, voteCount
        const ratingData = await fetchApi(`film/${id}/rating`);

        allData.push({
            title: formatTitle(descriptionData["originalTitle"]),
            year: descriptionData.year,
        })

        console.log("pobrano " + (i + 1))
    }

    return allData;
}

function downloadJSON(filename, data) {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

async function main() {
    console.log("Rozpoczynam pobieranie, cierpliwości...");
    const seriesList = await getAllRates();
    console.log("Zapisuję dane do pliku JSON...");
    downloadJSON("watchlist_tvSeries.json", seriesList);
}

main();