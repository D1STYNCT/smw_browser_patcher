	
	// https://stackoverflow.com/questions/12168909/blob-from-dataurl
	function dataURItoBlob(dataURI) {
		// convert base64 to raw binary data held in a string
		// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
		const byteString = atob(dataURI.split(',')[1]);
		
		// separate out the mime component
		const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
		
		// write the bytes of the string to an ArrayBuffer
		const ab = new ArrayBuffer(byteString.length);
		
		// create a view into the buffer
		let ia = new Uint8Array(ab);
		
		// set the bytes of the buffer to the correct values
		for(let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		
		// write the ArrayBuffer to a blob, and you're done
		const blob = new Blob([ab], {type: mimeString});
		
		return blob;
	}
	
	const b64toBlob = (b64Data, contentType="", sliceSize=512) => {
		const byteCharacters = atob(b64Data);
		const byteArrays = [];
		
		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			const slice = byteCharacters.slice(offset, offset + sliceSize);
			
			const byteNumbers = new Array(slice.length);
			
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
			
			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}
		
		const blob = new Blob(byteArrays, {type: contentType});
		
		return blob;
	}
	
	function readSourceFile(file, cb) {
		// Check if the file is an image.
		if (file.type && !file.type.startsWith('image/')) {
			console.log('File is not an image.', file.type, file);
			return;
		}
		
		const reader = new FileReader();
		
		reader.addEventListener('load', (event) => {
			cb(event.target.result);
		});
		
		reader.readAsDataURL(file);
	}
	
	// utility: start download of blob data
	let saveBlobData = (function() {
		let a = document.createElement("a");
		document.body.appendChild(a);
		a.style = "display: none;";
		
		return (blobInstance, fileName) => {
			//let json = JSON.stringify(data);
			//let blob = new Blob([json], {
			//	'type': "octet/stream"
			//});
			//let url = window.URL.createObjectURL(blob);
			let url = window.URL.createObjectURL(blobInstance);
			
			a.href = url;
			a.download = fileName;
			a.click();
			
			window.URL.revokeObjectURL(url);
		};
	}());
	
	// set app status
	function hideAppStatus() {
		let app_status_el = document.getElementById('app_status');
		
		app_status_el.className.replace(/alert\-[A-Za-z]+\s*/i, "");
		
		app_status_el.innerText = "";
		
		app_status_el.classList.add("d-none");
	};
	
	// set app status
	function updateAppStatus(status_type="", status_msg="") {
		if(!status_type && !status_msg) {
			hideAppStatus();
			
			return;
		}
		
		let app_status_el = document.getElementById('app_status');
		
		status_type = status_type.toLowerCase();
		
		app_status_el.className.replace(/alert\-[A-Za-z]+\s*/i, "");
		
		app_status_el.classList.add(`alert-${status_type}`);
		
		// @TODO allow simple html
		app_status_el.innerText = status_msg;
		
		app_status_el.classList.remove("d-none");
	};
	
	// update the source file infobox (hide or show w/selected source file name)
	function updateSourceFileInfobox() {
		let source_drop_el = document.getElementById('source_drop');
		let source_file_info_el = document.getElementById('source_file_info');
		
		if(!source_file_name || ("" == source_file_name)) {
			// hide infobox, show upload box
			console.log("hide infobox, show upload box");
			source_file_info_el.classList.add("d-none");
			source_file_info_el.innerText = "";
			source_drop_el.classList.remove("d-none");
			
			updateAppStatus('info', "Please provide a valid SMW rom above");
			
			return;
		}
		
		// show infobox, hide upload box
		console.log("show infobox, hide upload box");
		source_drop_el.classList.add("d-none");
		source_file_info_el.innerText = source_file_name;
		source_file_info_el.classList.remove("d-none");
		hideAppStatus();
	}
	
	// activate all patch buttons
	function activatePatchButtons() {
		document.querySelectorAll(".patch_me").forEach(btn_el => {
			btn_el.removeAttribute("disabled");
		});
	}
	