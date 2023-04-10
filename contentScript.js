console.log('GEO: contentScript.js loaded');
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
    console.log('GEO: Checking if video is loaded.');
    return (
        document.querySelector(`ytd-watch-flexy[video-id='${videoId}']`) !== null ||
        // mobile: no video-id attribute
        document.querySelector('#player[loading="false"]:not([hidden])') !== null
    );
}


// this function checks if the video is georestricted
function isGeoRestricted() {
    const videoMessage = document.querySelector('#reason');
    console.log('GEO: Error: ' + videoMessage.textContent);
    if (videoMessage && videoMessage.textContent === 'Video unavailable') {
        console.log('GEO: This video is not available in your region.');
        const videoId = getVideoId(window.location.href);
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const blockedCountries = data.items[0].contentDetails.regionRestriction.blocked;
                console.log('GEO: This video is blocked in these countries:');
                console.log(blockedCountries);
            })
            .catch(error => console.error('GEO: Error:', error));
    }
}



// wait for the video to be fully loaded before logging the title
const intervalId = setInterval(() => {
    if (isVideoLoaded()) {
        console.log('GEO: Video is loaded.');
        clearInterval(intervalId);
        isGeoRestricted();
    }
}, 100);