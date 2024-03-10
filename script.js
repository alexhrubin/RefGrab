document.addEventListener('DOMContentLoaded', function() {
    var copyButton = document.getElementById('copyCitation');
    copyButton.addEventListener('click', function() {
        // Send a message to the content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "copyCitation"});
        });
    });
});
