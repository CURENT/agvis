//Table containing the sidebar
const layers_html = `
<div>
    <input type="button" value="Add Layer" name="opt_addlayer">
</div>
<hr>
<div id= layerstore>
Added Layers:
</div>
`


//Swaps rows and columns in a 2D array
function transpose(a) {
	return Object.keys(a[0]).map(function(c) {
		return a.map(function(r) { return r[c]; });
	});
}

//Adds in the Layers Sidebar
function addSidebarLayers(win, options, sidebar) {
	const table_id = "layerpanel" + win.num;

	sidebar.addPanel({
		id: table_id,
		tab: '<span>\u00b1</span>',
		pane: layers_html,
		title: 'Add Layers'

	});

	const opt_addlayer = document.querySelector(`#${table_id} input[name='opt_addlayer']`);

	//Upon clicking the Add Layer button, bring up the file selector
	const opt_addlayer_input = document.createElement("input");
	opt_addlayer_input.style.display = "none";
	opt_addlayer_input.id = "fin";
	opt_addlayer_input.type = "file";
	opt_addlayer_input.accept = ".xlsx";
	document.body.appendChild(opt_addlayer_input);

	//Once the file is uploaded
	opt_addlayer_input.onchange = function() {

		//Check if a file was actually uploaded
		if (opt_addlayer_input.files.length > 0) {

			//Get its name and check for the proper file extension
			fname = opt_addlayer_input.files[0].name;
			ext = fname.substring(fname.lastIndexOf(".") + 1);

			if (ext != "xlsx") {

				alert("Please use a specified file type.");
				return;

			}


			var reader = new FileReader();
			
			//Newlayer is where the data is stored
			/*
			 newlayer.name
			 newlayer.num
			 newlayer.data
			 */
			const newlayer = {};

			if (reader.readAsBinaryString) {

				//Reads the data
				reader.onload = function (dat) {

					//Convert the data to csv and then that to an array
					let wb = XLSX.read(dat.target.result, {type: "binary"});
					let rows = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);

					let csv = Papa.parse(rows);

					
					newlayer.name = fname;

					//If there isn't a free space in the array, add the new layer to it
					if (win.mnumfree == 0) {

						newlayer.num = win.multilayer.length;
						win.multilayer.push(newlayer);
					}

					//If there is free space, put it in the most recent freed space and then check if there is another free space for the next layer
					else {

						newlayer.num = win.mlayercur;
						win.mnumfree = win.mnumfree - 1;
						win.multilayer[newlayer.num] = newlayer;

						for (let j = 0; j < win.multilayer.length; j++) {

							if (win.multilayer[j] == null) {

								win.mlayercur = j;
								break;
							}
						}
					}

					newlayer.data = transpose(csv.data);
					console.log(newlayer.data);
					console.log(newlayer);


					//ids for the dynamically generated elements
					let lstring = "line" + newlayer.num;
					let ltog = "toggle" + newlayer.num;
					let lbut = "button" + newlayer.num;
					let lid = "id" + newlayer.num;


					//Div that stores the other elements it gets deleted when the newlayer is delted
					const elem = document.createElement("div");
					elem.id = lid;
					elem.style.marginBottom = "10px";
					elem.style.marginTop = "10px";

					//Shows the name of the file the layer is based off of (might allow user to customize names)
					var ltext = document.createElement("p");
					ltext.innerText = newlayer.name + ":";
					elem.appendChild(ltext);

					//Checkbox for toggling if it the layer will be rendered or not
					const cbox = document.createElement("input");
					cbox.id = ltog;
					cbox.type = "checkbox";
					cbox.value = "Render";
					cbox.style.marginLeft = "15px";
					cbox.style.marginRight = "5px";

					//Label for the checkbox
					const clabel = document.createElement("label");
					clabel.for = ltog;
					clabel.innerText = "Toggle Rendering";

					//Right now it just lists data pertaining to the newlayer
					cbox.onchange = function() {

						let cid = this.id.slice(6);
						let cnum = Number(cid);
						console.log("CNUM: " + cnum); 
						let clayer = win.multilayer[cnum];
						console.log("CBOX TEST:");
						console.log(clayer);
						//Here is where we would toggle it
					};

					//Add the checkbox to the div
					elem.appendChild(cbox);
					elem.appendChild(clabel);

					//Delete button. Removes newlayer from the array and deletes its div
					const dbutton = document.createElement("input"); 
					dbutton.id = lbut;
					dbutton.type = "button";
					dbutton.value = "Delete Layer";
					dbutton.style.marginLeft = "50px";

					dbutton.onclick = function() {

						//List some basic info on what's deleted
						let bid = this.id.slice(6);
						let bnum = Number(bid);
						console.log("BNUM: " + bnum); 
						let blayer = win.multilayer[bnum];
						console.log("DELETE TEST:");
						console.log(blayer);

						//Set the nelayer to null in the array, increase the amount of free spaces, and set the current free layer to this newlayer's num
						win.multilayer[bnum] = null;
						win.mlayercur = bnum;
						win.mnumfree = win.mnumfree + 1;
						//set render to false - will be added once the rendering is added

						//Remove the div, thus removing all the other elements in it
						let delem = document.getElementById("id" + bnum);
						let dls = document.getElementById("layerstore");
						dls.removeChild(delem);


					};

					//Add the delete button to the div
					elem.appendChild(dbutton);

					//Add the div to the table
					let ls = document.getElementById("layerstore");
					ls.appendChild(elem);	
				};
				
				//Read the first file they input
				reader.readAsBinaryString(opt_addlayer_input.files[0]);
			}

		}
	};

	opt_addlayer.onclick = function() {
		opt_addlayer_input.click();
	};

	return table_id;
}
