function getVideoId(url) {
    const urlObject = new URL(url);
    const pathname = urlObject.pathname;
    if (pathname.startsWith("/clip")) {
        return document.querySelector("meta[itemprop='videoId']").content;
    }
    return pathname.startsWith("/shorts") ? pathname.slice(8) : urlObject.searchParams.get("v");
}

function isVideoLoaded() {
    const videoId = getVideoId(window.location.href);
    return (
        document.querySelector(`ytd-watch-flexy[video-id='${videoId}']`) !== null ||
        // mobile: no video-id attribute
        document.querySelector('#player[loading="false"]:not([hidden])') !== null
    );
}

function loadD3() {
    const script = document.createElement("script");
    script.src = browser.runtime.getURL("lib/d3.v6.min.js");
    document.head.appendChild(script);
}

function insertMap(countries) {
    loadD3();

    const width = 975;
    const height = width * 9 / 16;

    // The svg
    const svg = d3.select("#svg-map").attr("viewBox", [0, 0, width, height])

    // Map and projection
    const projection = d3.geoMercator()
        .translate([width / 2, height / 1.5]);

    console.log('GEO: Set the projection')
        // get the URL of the countries.geojson file
    const url = browser.runtime.getURL('data/countries.geojson');

    // load the geojson file using D3.json()
    d3.json(url)
        .then(data => {
            svg.selectAll("path")
                .data(data.features)
                .join("path")
                .attr("d", d3.geoPath().projection(projection))
                .attr("fill", d => countries.includes(d.properties.id) ? "#ff0000" : "#3f3f3f");
        })
        .catch(error => {
            console.error('Error loading countries.geojson:', error);
        });
}

function isGeoRestricted(youtubeapi) {
    const videoMessage = document.querySelector('#reason');
    if (videoMessage && videoMessage.textContent === 'Video unavailable') {
        const videoId = getVideoId(window.location.href);
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${youtubeapi}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const blockedCountries = data.items[0].contentDetails.regionRestriction.blocked;
                // videoMessage.textContent = `This video is blocked in ${blockedCountries.join(", ")}.`;
                document.querySelector('yt-player-error-message-renderer').innerHTML = '<svg id="svg-map"></svg>';
                insertMap(blockedCountries);
            })
            .catch(error => console.warn('GEO: Error:', error));
    }
}

browser.storage.sync.get("youtubeapi")
    .then(result => {
        const youtubeapi = result.youtubeapi || "";
        const intervalId = setInterval(() => {
            if (isVideoLoaded()) {
                clearInterval(intervalId);
                isGeoRestricted(youtubeapi);
            }
        }, 100);
    })
    .catch(error => console.error('Storage Error:', error));