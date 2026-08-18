// =====================================================
// ASTRAVIA — NASA API
// =====================================================

const NASA_API_KEY = "PEX0J9gcYKVaRAxQyrAUZ2ZnZSbcIDHCtkhFE";

const NASA_BASE = "https://api.nasa.gov";

// =====================================================
// APOD
// =====================================================

export async function getAPOD(date = null) {

    let url =
        `${NASA_BASE}/planetary/apod?api_key=${NASA_API_KEY}`;

    if (date) {
        url += `&date=${date}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("NASA APOD request failed");
    }

    return await response.json();
}


// =====================================================
// NEAR EARTH OBJECTS
// =====================================================

export async function getNearEarthObjects(
    startDate,
    endDate
) {

    const url =
        `${NASA_BASE}/neo/rest/v1/feed` +
        `?start_date=${startDate}` +
        `&end_date=${endDate}` +
        `&api_key=${NASA_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("NASA NEO request failed");
    }

    return await response.json();
}


// =====================================================
// MARS ROVER PHOTOS
// =====================================================

export async function getMarsPhotos(
    rover = "curiosity",
    sol = 1000
) {

    const url =
        `${NASA_BASE}/mars-photos/api/v1/rovers/` +
        `${rover}/photos?sol=${sol}` +
        `&api_key=${NASA_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("NASA Mars Rover request failed");
    }

    return await response.json();
}