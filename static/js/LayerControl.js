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

//A function that takes a xlsx file and returns an object of objects with arrays representing each column of data in each sheet
/*
function xlsxReader() {
	
	const opt_addlayer_input = document.createElement("input");
	opt_addlayer_input.style.display = "none";
	opt_addlayer_input.id = "fin";
	opt_addlayer_input.type = "file";
	opt_addlayer_input.accept = ".xlsx";
	document.body.appendChild(opt_addlayer_input);
	const output = {};

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
			

			if (reader.readAsBinaryString) {

				//Reads the data
				reader.onload = function (dat) {

					//Convert the data to csv and then that to an array
					let wb = XLSX.read(dat.target.result, {type: "binary"});
					
					for (let k = 0; k < wb.SheetNames.length; k++) {

						//Each object in output is named after a sheet
						output[wb.SheetNames[k]] = {};
						let rows = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[k]]);
						let data = Papa.parse(rows);

						let csv = transpose(data.data);

						//Then each array in the object is named after a column
						for (let m = 0; m < csv.length; m++) {

							if (csv[m][0] == "") {

								continue;
							}

							const temp = csv[m].slice(1, csv[m].length);
							output[wb.SheetNames[k]][csv[m][0]] = temp;
						}
					}
					
					output.name = fname;

				};
				
				reader.readAsBinaryString(opt_addlayer_input.files[0]);

			}
		}
	};

	return output;

}
*/

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
					
					for (let k = 0; k < wb.SheetNames.length; k++) {

						newlayer[wb.SheetNames[k]] = {};
						let rows = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[k]]);
						let data = Papa.parse(rows);

						let csv = transpose(data.data);

						for (let m = 0; m < csv.length; m++) {

							if (csv[m][0] == "") {

								continue;
							}

							const temp = csv[m].slice(1, csv[m].length);
							newlayer[wb.SheetNames[k]][csv[m][0]] = temp;
						}
					}
					
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

					console.log(newlayer);
					newlayer.topo = L.multitopLayer(newlayer).addTo(win.map);
					//newlayer.cont = L.multicontLayer(newlayer).addTo(win.map);


					//ids for the dynamically generated elements
					let lstring = "line" + newlayer.num;
					let ltog = "toggle" + newlayer.num;
					let lbut = "button" + newlayer.num;
					let ldiv1 = "div1_" + newlayer.num;
					let ldiv2 = "div2_" + newlayer.num;
					let ldiv3 = "div3_" + newlayer.num;
					let ldiv4 = "div4_" + newlayer.num;
					let lcolor1 = "color1_" + newlayer.num;
					let lcolor2 = "color2_" + newlayer.num;
					let ltog2 = "toggle2_" + newlayer.num;
					let ltog3 = "toggle3_" + newlayer.num;
				
					
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
						//console.log("CNUM: " + cnum); 
						let clayer = win.multilayer[cnum];
						//console.log(win.topologyLayer);
						console.log(win.workspace.SysParam);
						clayer.topo.toggleRender();
						clayer.topo.update(win.workspace);
						//console.log(clayer.topo);
						//console.log("CBOX TEST:");
						//console.log(clayer);
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
					dbutton.style.marginLeft = "150px";

					dbutton.onclick = function() {

						//List some basic info on what's deleted
						let bid = this.id.slice(6);
						let bnum = Number(bid);
						//console.log("BNUM: " + bnum); 
						let blayer = win.multilayer[bnum];
						//blayer.topo.remove();
						blayer.topo._render = false;
						blayer.topo.redraw();
						//console.log("DELETE TEST:");
						//console.log(blayer);

						//Set the nelayer to null in the array, increase the amount of free spaces, and set the current free layer to this newlayer's num
						win.multilayer[bnum] = null;
						win.mlayercur = bnum;
						win.mnumfree = win.mnumfree + 1;
						//set render to false - will be added once the rendering is added

						//Remove the div, thus removing all the other elements in it
						let delem = document.getElementById("id" + bnum);
						//let dls = document.getElementById("layerstore");
						delem.remove();


					};
					
					//Add the delete button to the div
					elem.appendChild(dbutton);

					//Custom color settings
					const ndiv1 = document.createElement("div");
					ndiv1.id = ldiv1;
					elem.appendChild(ndiv1);
					
					const ctog2 = document.createElement("input");
					ctog2.id = ltog2;
					ctog2.type = "checkbox";
					ctog2.value = "Color1";
					ctog2.style.marginLeft = "15px";
					ctog2.style.marginRight = "5px";

					//Label for the checkbox
					const clabel2 = document.createElement("label");
					clabel2.for = ltog2;
					clabel2.innerText = "Toggle Custom Node Colors";
					
					const ctog3 = document.createElement("input");
					ctog3.id = ltog3;
					ctog3.type = "checkbox";
					ctog3.value = "Color1";
					ctog3.style.marginLeft = "15px";
					ctog3.style.marginRight = "5px";
					
					//Label for the checkbox
					const clabel3 = document.createElement("label");
					clabel3.for = ltog3;
					clabel3.innerText = "Toggle Custom Line Colors";
					
					ctog2.onchange = function() {
						
						let cid = this.id.slice(8);
						let cnum = Number(cid);
						//console.log("CNUM: " + cnum); 
						let clayer = win.multilayer[cnum];
						//console.log(win.topologyLayer);
						console.log(win.workspace.SysParam);
						clayer.topo.toggleCNode();
						clayer.topo.update(win.workspace);
					};
					
					ctog3.onchange = function() {
						
						let cid = this.id.slice(8);
						let cnum = Number(cid);
						//console.log("CNUM: " + cnum); 
						let clayer = win.multilayer[cnum];
						//console.log(win.topologyLayer);
						console.log(win.workspace.SysParam);
						clayer.topo.toggleCLine();
						clayer.topo.update(win.workspace);
					};
					
					
					elem.appendChild(ctog2);
					elem.appendChild(clabel2);
					
					const ndiv2 = document.createElement("div");
					ndiv2.id = ldiv2;
					elem.appendChild(ndiv2);
					
					elem.appendChild(ctog3);
					elem.appendChild(clabel3);

					const ndiv3 = document.createElement("div");
					ndiv3.id = ldiv3;
					elem.appendChild(ndiv3);
					

					const color1 = document.createElement("input");
					color1.id = lcolor1;
					color1.type = "color";
					color1.value = "#FFFFFF";
					color1.style.marginLeft = "15px";
					color1.style.marginRight = "5px";

					//Label for the checkbox
					const clabel4 = document.createElement("label");
					clabel4.for = lcolor1;
					clabel4.innerText = "Custom Node Color";
					
					color1.onchange = function() {
												
						let cid = this.id.slice(7);
						let cnum = Number(cid);
						//console.log("CNUM: " + cnum); 
						let clayer = win.multilayer[cnum];
						clayer.topo.updateCNVal(this.value);
						clayer.topo.update(win.workspace);
						
					};
					
					elem.appendChild(color1);
					elem.appendChild(clabel4);
					
					const ndiv4 = document.createElement("div");
					ndiv4.id = ldiv4;
					elem.appendChild(ndiv4);
					
					
					const color2 = document.createElement("input");
					color2.id = lcolor2;
					color2.type = "color";
					color2.value = "#000000";
					color2.style.marginLeft = "15px";
					color2.style.marginRight = "5px";

					//Label for the checkbox
					const clabel5 = document.createElement("label");
					clabel5.for = lcolor2;
					clabel5.innerText = "Custom Line Color";
					
					color2.onchange = function() {
												
						let cid = this.id.slice(7);
						let cnum = Number(cid);
						//console.log("CNUM: " + cnum); 
						let clayer = win.multilayer[cnum];
						clayer.topo.updateCLVal(this.value);
						clayer.topo.update(win.workspace);
						
					};
					
					elem.appendChild(color2);
					elem.appendChild(clabel5);
					
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
