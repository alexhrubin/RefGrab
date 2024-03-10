chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "natureCitationUrl") {
        const citationUrl = natureCitationUrl();
        sendResponse({url: citationUrl}); // Send the URL back to the background script
        return true;
    }
});


function natureCitationUrl() {
    const doiElements = document.getElementsByClassName('c-bibliographic-information__value');
    let doi = null;

    // Iterate over all elements to find the one that contains the DOI
    for (const element of doiElements) {
        if (element.innerText.includes('doi')) {
            doi = element.innerText.trim().replace('https://doi.org/', '');
            break;
        }
    }

    if (doi) {
        // Form the citation URL
        return `https://citation-needed.springer.com/v2/references/${doi}?format=bibtex`;
    } else {
        console.error('DOI element not found.');
    }
}
