// popup.js

document.addEventListener("DOMContentLoaded", function() {
  const xpathInput = document.getElementById("xpathInput");
  const scrapeButton = document.getElementById("scrapeButton");
  const outputDiv = document.getElementById("output");
  const csvBtn = document.getElementById("csv")
  const txtBtn = document.getElementById("txt")
  csvBtn.hidden = true;
  txtBtn.hidden = true;

  scrapeButton.addEventListener("click", function() {
    const xpath = xpathInput.value.trim();

    if (xpath === "") {
      outputDiv.textContent = "Please enter a valid XPath expression.";
      return;
    }

    // Send a message to the content script to scrape data using the provided XPath
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: scrapeData,
        args: [xpath],
      });
    });
  });

  // Function to scrape data from the content script
  function scrapeData(xpath) {
    const results = [];
    const elements = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);

    let element;
    while ((element = elements.iterateNext())) {
      results.push(element.textContent);
    }
    

    chrome.runtime.sendMessage({ data: results });
  }

  // Listen for messages from the content script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.data) {
      outputDiv.textContent = request.data.join(", ");

      // Save the scraped data to a text file
      const dataBlob = new Blob([request.data.join("\n")], { type: "text/csv" });
      const fileName = "scraped_data.csv";
      const downloadUrl = URL.createObjectURL(dataBlob);
      //const a = document.createElement("a");
      csvBtn.hidden = false;
      csvBtn.href = downloadUrl;
      csvBtn.textContent = 'Download CSV';
      csvBtn.download = fileName;
     // document.body.appendChild(csvBtn);

      const dataBlobText = new Blob([request.data.join(", ")], { type: "text/plain" });
      const fileNameText = "scraped_data.txt";
      const downloadUrl1 = URL.createObjectURL(dataBlobText);
      //const aText = document.createElement("a");
      txtBtn.hidden = false;
      txtBtn.href = downloadUrl1;
      txtBtn.textContent = 'Download Text';
      txtBtn.download = fileNameText;
      //document.body.appendChild(txtBtn);


      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([request.data]);
      XLSX.utils.book_append_sheet(wb, ws, "ScrapedData");

      // Save the XLSX file
      XLSX.writeFile(wb, "scraped_data.xlsx");


    //   chrome.downloads.download({
    //     url: downloadUrl,
    //     filename: fileName,
    //     saveAs: true,
    //   });
    }
  });
});
