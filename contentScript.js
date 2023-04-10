const YOUTUBE_API_KEY = 'AIzaSyC_Ms6NQD4h6EwV3RibF44774fETecNI4U';

function getVideoId(url) {
    const urlObject = new URL(url);
    const pathname = urlObject.pathname;
    if (pathname.startsWith("/clip")) {
        return document.querySelector("meta[itemprop='videoId']").content;
    } else {
        if (pathname.startsWith("/shorts")) {
            return pathname.slice(8);
        }
        return urlObject.searchParams.get("v");
    }
}

function isVideoLoaded() {
    const videoId = getVideoId(window.location.href);
    return (
        document.querySelector(`ytd-watch-flexy[video-id='${videoId}']`) !== null ||
        // mobile: no video-id attribute
        document.querySelector('#player[loading="false"]:not([hidden])') !== null
    );
}


// this function checks if the video is georestricted
function isGeoRestricted() {
    const videoMessage = document.querySelector('#reason');
    if (videoMessage && videoMessage.textContent === 'Video unavailable') {
        const videoId = getVideoId(window.location.href);
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const blockedCountries = data.items[0].contentDetails.regionRestriction.blocked;
                videoMessage.textContent = `This video is not available in your region. Blocked in ${blockedCountries.join(", ")}.`;

            })
            .catch(error => console.error('GEO: Error:', error));
    }
}



// wait for the video to be fully loaded
const intervalId = setInterval(() => {
    if (isVideoLoaded()) {
        clearInterval(intervalId);
        isGeoRestricted();
    }
}, 100);