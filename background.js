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


async function fetchCitation(citationUrl) {
    const response = await fetch(citationUrl);
    if (response.ok) {
        return response.text();
    } else {
        throw new Error('Network response was not ok.');
    }
}
