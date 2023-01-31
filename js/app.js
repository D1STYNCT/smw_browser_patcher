	
	const MAX_SOURCE_FILESIZE = 1000000;
	
	// source file storage
	let source_file_contents = null;
	let source_file_name = null;
	
	// file selection => read selected file => save to memory
	let source_file_el = document.getElementById('source_file');
	
	// event: source file change
	source_file_el.addEventListener('change', (event) => {
		const fileList = event.target.files;
		
		if(!fileList || !fileList.length || fileList.length < 1) {
			return;
		}
		
		let file = fileList.item(0);
		
		readSourceFile(file, (data_url) => {
			source_file_name = file.name;
			source_file_contents = dataURItoBlob(data_url);
			
			updateSourceFileInfobox();
			activatePatchButtons();
		});
	});
	
	// load patches
	document.getElementById('load_smw_patches').addEventListener('click', (e) => {
		let patches_btn_el = document.getElementById('load_smw_patches');
		
		let patches_source_url = patches_btn_el.getAttribute('data-patch-source') || "";
		
		if(!patches_source_url) {
			alert("Unable to find patches source URL, refresh and try again");
			
			return;
		}
		
		patches_btn_el.disabled = true;
		patches_btn_el.innerText = "Loading...";
		
		// fetch patches
		fetch(patches_source_url).then(response => response.json()).then(data => {
			console.log("data=", data);
			
			let patch_table_el = document.getElementById('patch_table');
			
			let html = [];
			
			for(let key in data) {
				let patch = data[ key ];
				let patch_url = `./patches/${patch.filename}`;
				
				html.push("<tr>");
				html.push("<td>");
				html.push("<button type=\"button\" class=\"btn btn-sm btn-primary patch_me\" data-patch-url=\""+ patch_url +"\" disabled>patch</button>");
				html.push("</td>");
				
				// patch details
				html.push("<td>");
				html.push(`<a href="${patch.url}" target="_blank" class="text-secondary">${patch.title}</a>`);
				html.push("</td>");
				
				// type
				html.push("<td>");
				html.push(`${patch.type}`);
				html.push("</td>");
				
				// length
				html.push("<td class=\"text-end\">");
				html.push(`${patch.length}`);
				html.push("</td>");
				
				// authors
				html.push("<td>");
				
				if(patch.authors && patch.authors.length) {
					let i = 0;
					
					for(let akey in patch.authors) {
						let author = patch.authors[ akey ];
						
						if(i > 0) {
							html.push(", ");
						}
						
						html.push(`<a href="${author.url}" target="_blank" class="text-secondary">${author.name}</a>`);
						
						i++;
					}
				}
				
				html.push("</td>");
				
				html.push("</tr>");
			}
			
			patch_table_el.innerHTML = html.join("");
			
			// delete load patches button
			patches_btn_el.remove();
		}).catch(err => {
			console.log("Error:", err);
			
			updateAppStatus('danger', "Failed fetching patch list");
		});
	});
	
	// drag+drop source file upload
	let drop_area = document.getElementById('source_drop');
	
	// drop_area.addEventListener('dragover', (event) => {
	// 	console.log("drop_area.dragover");
	// 	
	// 	event.preventDefault();
	// });
	
	// check dropped file for validness, save into source_file_contents
	drop_area.addEventListener('drop', (event) => {
		console.log("drop_area.drop");
		
		event.preventDefault();
		
		if(event.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			[...event.dataTransfer.items].forEach((item, i) => {
				// If dropped items aren't files, reject them
				if(item.kind !== 'file') {
					console.log("Invalid drop item type, ignoring...");
					console.log(`… item[${i}].kind = ${item.kind}`);
					
					return;
				}
				
				const file = item.getAsFile();
				console.log(`… file[${i}].name = ${file.name}`);
				
				if(MAX_SOURCE_FILESIZE && (file.size > MAX_SOURCE_FILESIZE)) {
					console.log("Invalid filesize");
					
					return;
				}
				
				readSourceFile(file, (data_url) => {
					source_file_name = file.name;
					source_file_contents = dataURItoBlob(data_url);
					
					updateSourceFileInfobox();
					activatePatchButtons();
				});
			});
		} else {
			// Use DataTransfer interface to access the file(s)
			[...event.dataTransfer.files].forEach((file, i) => {
				console.log(`… file[${i}].name = ${file.name}`);
				
				if(MAX_SOURCE_FILESIZE && (file.size > MAX_SOURCE_FILESIZE)) {
					console.log("Invalid filesize");
					
					return;
				}
				
				readSourceFile(file, (data_url) => {
					source_file_name = file.name;
					source_file_contents = dataURItoBlob(data_url);
					
					updateSourceFileInfobox();
					activatePatchButtons();
				});
			});
		}
	});
	
	// event: click .patch_me
	patch_table_el.addEventListener('click', (event) => {
		if(!event.target.classList.contains("patch_me")) {
			return;
		}
		
		event.preventDefault();
		
		if(null === typeof source_file_contents) {
			console.log("source_file_contents is NULL");
			
			return;
		}
		
		if(null === typeof source_file_name) {
			console.log("source_file_name is NULL");
			
			return;
		}
		
		console.log("ready to patch");
		
		let patch_url = event.target.getAttribute('data-patch-url') || "";
		
		if(!patch_url || ("#" === patch_url)) {
			console.log("patch_url empty for target_el");
			
			return;
		}
		
		// create patch .smw filename
		let patch_filename = patch_url.split("/").pop();
		patch_filename = patch_filename.replace(/\.[A-Za-z]+$/i, ".smc");
		
		// fetch patch, apply patch to source rom, then save file
		fetch(patch_url).then(response => response.blob()).then(patch_blob => {
			// apply patch
			// @TODO
			
			// @TMP save patch
			saveBlobData(patch_blob, patch_filename);
			
			// @TODO
			// save patched file
			//saveBlobData(patched_file_blob, patch_filename);
		});
	});
	