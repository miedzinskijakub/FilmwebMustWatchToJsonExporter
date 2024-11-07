function formatTitle(title) {
    if (!title) {
        return "";
    }
    return title.includes(",") ? `"${title}"` : title;
}

async function fetchApi(endpoint) {
    const dataJSON = await fetch(`https://www.filmweb.pl/api/v1/${endpoint}`, {
        method: "GET",
        headers: {
            Cookie: document.cookie,
            'X-Locale': 'pl',
        }
    }).then((response) => {
        if (!response.ok) {
            throw Error(`Błąd skryptu podczas fetchowania, endpoint: ${endpoint}`);
        }
        return response.json();
    });

    return dataJSON;
}

async function getMoviesList() {
    const moviesList = [];

    const dataJSON = await fetchApi(`logged/want2see?entityName=film`);
    const allSavedIds = dataJSON.filter((entry) => entry[1] > 0).map((entry) => entry[0]);

    for (let i = 0; i < allSavedIds.length; i++) {
        const id = allSavedIds[i];

        // Pobierz tytuł i rok
        const descriptionData = await fetchApi(`title/${id}/info`);

        moviesList.push({
            title: formatTitle(descriptionData["originalTitle"]),
            year: descriptionData.year,
        });

        console.log(`Pobrano film ${i + 1}`);
    }

    return moviesList;
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
    const moviesList = await getMoviesList();
    console.log("Zapisuję dane do pliku JSON...");
    downloadJSON("Filmweb_watchlist_film.json", moviesList);
}

main();
