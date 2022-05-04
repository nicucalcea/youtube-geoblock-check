document.addEventListener('yt-navigate-finish', addRateLaterButton);

if (document.body) {
    addRateLaterButton();
} else {
    document.addEventListener('DOMContentLoaded', addRateLaterButton);
}

function getPage() {
    browser.tabs.query({ currentWindow: true, active: true })
        .then((tabs) => {
            console.log(tabs[0].url);
        })
}

function getRestrictions(id) {
    const choice = document.querySelector('input').value
    console.log(choice)
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=AIzaSyCCPJyAMEEzOemcIcxkF1TN9nDR7O-mBO4`

    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            const restrictions = data.items[0].contentDetails.regionRestriction.blocked;
            console.log(restrictions)
        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

// const restrictedCountries = getRestrictions(videoId);

function addRateLaterButton() {
    const videoId = new URL(location.href).searchParams.get('v');

    // Only enable on youtube.com/watch?v=* pages
    if (!location.pathname.startsWith('/watch') || !videoId) return;

    // Timers will run until needed elements are generated
    const timer = window.setInterval(createButtonIsReady, 300);

    /**
     * Create the Rate Later button.
     */
    function createButtonIsReady() {
        /*
         ** Wait for needed elements to be generated
         ** It seems those elements are generated via javascript, so run-at document_idle in manifest is not enough to prevent errors
         **
         ** Some ids on video pages are duplicated, so I take the first non-duplicated id and search in its childs the correct div to add the button
         ** Note: using .children[index] when child has no id
         */
        if (
            !document.getElementById('menu-container') ||
            !document.getElementById('menu-container').children['menu'] ||
            !document.getElementById('menu-container').children['menu'].children[0] ||
            !document.getElementById('menu-container').children['menu'].children[0]
                .children['top-level-buttons-computed']
        )
            return;

        // If the button already exists, don't create a new one
        if (document.getElementById('tournesol-rate-button')) {
            window.clearInterval(timer);
            return;
        }

        window.clearInterval(timer);

        // Get list of restricted countries
        let restrictedCountries = getRestrictions(videoId);

        // Create Button
        const rateLaterButton = document.createElement('button');
        rateLaterButton.setAttribute('id', 'tournesol-rate-button');

        // Text td for better vertical alignment
        const text_td = document.createElement('td');
        const text_td_text = document.createTextNode(`ID: ${videoId}; Restricted: ${restrictedCountries[0]}`);
        text_td.append(text_td_text);
        rateLaterButton.append(text_td);

        // Insert after like and dislike buttons
        const div =
            document.getElementById('menu-container').children['menu'].children[0]
                .children['top-level-buttons-computed'];
        div.insertBefore(rateLaterButton, div.children[2]);
    }
}