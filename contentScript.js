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

function isGeoRestricted(youtubeapi) {
    const videoMessage = document.querySelector('#reason');
    if (videoMessage && videoMessage.textContent === 'Video unavailable') {
        const videoId = getVideoId(window.location.href);
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${youtubeapi}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const blockedCountries = data.items[0].contentDetails.regionRestriction.blocked;
                videoMessage.textContent = `This video is blocked in ${blockedCountries.join(", ")}.`;

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