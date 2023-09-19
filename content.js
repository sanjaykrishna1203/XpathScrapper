// content.js

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "scrape") {
    const xpath = request.xpath;
    const elements = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    const results = [];

    let element;
    while ((element = elements.iterateNext())) {
      results.push(element.textContent);
    }

    sendResponse(results);
  }
});
