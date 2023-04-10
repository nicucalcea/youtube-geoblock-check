function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        youtubeapi: document.querySelector("#youtubeapi").value
    });
}

function restoreOptions() {
    function setCurrentChoice(result) {
        document.querySelector("#youtubeapi").value = result.youtubeapi || "";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getting = browser.storage.sync.get("youtubeapi");
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);