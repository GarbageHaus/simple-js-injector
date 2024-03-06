// Forked from https://github.com/joeperpetua/simple-js-injector/blob/main/popup.js
// Storage Documentation: https://developer.chrome.com/extensions/storage
document.addEventListener('DOMContentLoaded', function() {
  var urlTextarea = document.getElementById('url');
  var codeTextarea = document.getElementById('jscode');
  var injectButton = document.getElementById('inject');
  var importButton = document.getElementById('import'); //added new elements to HTML
  var exportButton = document.getElementById('export');

  chrome.tabs.query({active: true},function(tab) {
    var tabURL = tab[0].url;

    chrome.storage.sync.get(null, function(theValue) {
      var url = getLongestURLMatch(theValue, tabURL);
      urlTextarea.value = url;
      if (url.length > 0) {
        urlTextarea.value = url;
        codeTextarea.value = theValue[url];
      } else {
        urlTextarea.value = tabURL;
        codeTextarea.value = '';
      }
    });

    injectButton.addEventListener('click', function() {
      var theValue = codeTextarea.value;
      if (!theValue) {
        chrome.storage.sync.remove(urlTextarea.value, function() {
          // Notify that we saved.
          console.log('REMOVED script for ' + urlTextarea.value);
        });
        window.close();
        return;
      }

      chrome.tabs.executeScript({
        code: theValue
      });

      // Save it using the Chrome extension storage API.
      var keypair = {};
      keypair[urlTextarea.value] = theValue;
      chrome.storage.sync.set(keypair, function() {
        // Notify that we saved.
        console.log('SAVED ' + JSON.stringify(keypair));
      });
      window.close();
    });
	
	//Function above was copied to make import function here INCOMPLETE!!! Need to swap out for() loop for the compatible version.
	importButton.addEventListener('click', function() {
	var inputElement = document.createElement('input');
	inputElement.type = 'file';
	inputElement.accept = '.json';
	inputElement.onchange = function() {
		var file = inputElement.files[0];
		var reader = new FileReader();
		reader.onload = function() {
			var jsonContent = JSON.parse(reader.result);
			var keypair = {};
			for (var i = 0; i< jsonContent.length; i++) {
				keypair[jsonContent[i]] = theValue;
			}
			chrome.storage.sync.set(keypair, function() {
				console.log("Saved the keypair: " + JSON.stringify(keypair));
				
			});
		};
		reader.readAsText(file);
	};
	inputElement.click();
    });
	
	//Export files: WORKS!
	exportButton.addEventListener('click', function() {
		var key = urlTextarea.value;
	
		chrome.storage.sync.get(null, function(items) {
		// Convert the items to a JSON string
		var itemsString = JSON.stringify(items);
		
		// Convert the JSON string to a Blob
		var blob = new Blob([itemsString], {type: "application/json"});
		
		var a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = "injector_config.json";
		document.body.appendChild(a);    
		a.click();    
		document.body.removeChild(a);
			setTimeout(function() {
			window.close();
			}, 200);
		});
	});
  });
});
