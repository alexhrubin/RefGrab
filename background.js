chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.includes('journals.aps.org')) {
        const citationUrl = physRevCitationUrl(tab.url);
        try {
            const citationText = await fetchCitation(citationUrl);
            copyToClipboard(tab.id, citationText);
            console.log('Citation copied to clipboard.');
        } catch (error) {
            console.error('Failed to copy citation:', error);
        }
    } else if (tab.url.includes('nature.com')) {
        // Trigger content script to fetch Nature DOI
        chrome.tabs.sendMessage(tab.id, {action: "natureCitationUrl"}, async function(citationUrl) {
            console.log(citationUrl)
            const citationText = await fetchCitation(citationUrl.url);
            copyToClipboard(tab.id, citationText);
            console.log('Citation copied to clipboard.');
        });
    } else if (tab.url.includes('arxiv.org')) {
        const citationUrl = tab.url.replace(/\/(pdf|abs)\//, '/bibtex/');
        try {
            const citationText = await fetchCitation(citationUrl);
            copyToClipboard(tab.id, citationText);
            console.log('Citation copied to clipboard.');
        } catch (error) {
            console.error('Failed to copy citation:', error);
        }
    } else if (tab.url.includes("pubs.acs.org")) {
        try {
            const citationText = await fetchAcsCitation(tab.url);
            copyToClipboard(tab.id, citationText.trim());
            console.log('Citation copied to clipboard.');
        } catch (error) {
            console.error('Failed to copy citation:', error);
        }
    }
});


function copyToClipboard(tabId, text) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: textToCopy => {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      },
      args: [text]
    });
  }


// For Physical Review journals
function physRevCitationUrl(currentUrl) {
    // Strip off any query string
    let baseUrl = currentUrl.split('?')[0];
    // Replace "pdf" or "abstract" with "export"
    let exportUrl = baseUrl.replace(/\/(pdf|abstract)\//, '/export/');
    return exportUrl;
}

// For ACS journals
function extractAcsDoi(currentUrl) {
    const parsedUrl = new URL(currentUrl);

    // Get the pathname part of the URL and split it into segments
    const pathSegments = parsedUrl.pathname.split('/');

    // Assuming the DOI is always after '/doi/full/', join the remaining parts.
    const doiIndex = pathSegments.indexOf('doi');
    if (doiIndex !== -1 && pathSegments.length > doiIndex + 2) {
      // Join the segments from the segment after 'full' to the end to form the DOI
      const doiSegments = pathSegments.slice(doiIndex + 2);
      const doi = doiSegments.join('/');
      return doi;
    }
    return null;
}

async function fetchAcsCitation(currentUrl) {
    const url = "https://pubs.acs.org/action/downloadCitation";
    const data = new URLSearchParams();
    console.log(extractAcsDoi(currentUrl))
    data.append('doi', extractAcsDoi(currentUrl));
    data.append('format', 'bibtex');

    let citationText = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not OK');
        }
        return response.text();
    })
    .catch(error => console.error('Failed to fetch citation:', error));

    return citationText;
}


async function fetchCitation(citationUrl) {
    const response = await fetch(citationUrl);
    if (response.ok) {
        return response.text();
    } else {
        throw new Error('Network response was not ok.');
    }
}
