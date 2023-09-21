/* ***********************************************************************************
 * File Name:   LayerControl.js
 * Authors:     Nicholas West, Nicholas Parsly
 * Date:        9/20/2023 (last modified)
 * 
 * Description: LayerControl.js contains the code for the “Add Layers” menu, which 
 * 				handles the data parsing, variable management, and UI for the IDR and 
 * 				MultiLayer functionality. Effectively, LayerControl.js contains the 
 * 				dynamic equivalent of Window.js, ControlLayer.js, and SimTimeBox.js. 
 * 				This partially explains why it is one of the largest files currently 
 * 				in AGVis. LayerControl uses both the Papa Parse library and the 
 * 				SheetJs library for file reading.
 * ***********************************************************************************/

//Table containing the sidebar
const layers_html = `
	<div>
		<input type="button" value="Add Layer" name="opt_addlayer">
	</div>
	<hr>
	<div id= layerstore>
	Added Layers:
	</div>`;

/**
 * A function that takes a xlsx file and returns an object 
 * of objects with arrays representing each column of data in each sheet
 * 
 * @author Nicholas Parsly
 * @returns 
 */

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
*/

/**
 * Swaps rows and columns in a 2D array
 * 
 * @param {Array} a - The array to transpose
 * @returns 
 */
function transpose(a) {
	return Object.keys(a[0]).map(function(c) {
		return a.map(function(r) { return r[c]; });
	});
}

/**
 * Begins the setup for the animation. Stores where the info relating to 
 * the three possible variables is stored. Does some initial setup for letting 
 * a MultiContLayer display a simulation animation. Called in tandem with endMultiSim().
 *
 * @param {Object} newlayer - The newlayer containing the MultiContLayer that needs to start its simulation.
 * @returns
 */
function startMultiSim(newlayer) {
    let nBus = newlayer.data["history"]["nBus"];
	let variableRelIndices = {};
	variableRelIndices["V"] = {"begin": 0, "end": nBus};
    variableRelIndices["theta"] = {"begin": nBus, "end": 2 * nBus};
    variableRelIndices["freq"] = {"begin": 2 * nBus, "end": 3 * nBus};

    // Update variable Range
    newlayer.cont.storeRelativeIndices(variableRelIndices);
	newlayer.cont.updateRange(newlayer.options.fmin, newlayer.options.fmax);
    newlayer.cont.showVariable("freq");
}

/**
 * Turns on the display for a MultiContLayer and requests it to draw its current frame.
 * 
 * @param {Object} newlayer - The newlayer containing the MultiContLayer that needs to display its simulation.
 * @param {Window} win      - AGVis’s Window. Passed to the function for updating the MultiContLayer.
 * @returns
 */
function endMultiSim(newlayer, win) {
	newlayer.time = newlayer.end_time;
	newlayer.cont.toggleRender();
	newlayer.cont.update(win.workspace);
}

/**
 * Adds the “Add Layers” menu and sets up the “Add Layer” button.
 * 
 * @param   {Window}  win      - AGVis’s Window. Passed to stepRead() when files are uploaded.
 * @param   {Object}  options  - The Window’s options variable. Passed to stepRead() when files are uploaded.
 * @param   {Sidebar} sidebar  - Adds the “Add Layers” menu to its display. Passed to stepRead() when files are uploaded.
 * @returns {String}  table_id - A string containing the element id of the configuration panel
 */
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

	/**
	 * Upon a user uploading a file, creates a newlayer, sets its initial values, 
	 * and calls stepRead() on the files.
	 * 
	 * @returns
	 */
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
			
			const newlayer = {};
			newlayer.data = {};
			newlayer.sim = false;		//Stores whether the file had simulation data
			newlayer.preset = false;	//Stores whether the file had presets for the simulation configuration
			newlayer.options = {};
			newlayer.options.fmin = 0.9998;
			newlayer.options.fmax = 1.0002;
			newlayer.options.vmin = 0.8;
			newlayer.options.vmax = 1.2;
			newlayer.options.tmin = -1;
			newlayer.options.tmax = 1;
			
			if (reader.readAsBinaryString) {
				//Reads the data
				reader.onload = function (dat) {
					//Convert the data to csv and then that to an array
					let wb = XLSX.read(dat.target.result, {type: "binary"});
					
					for (let k = 0; k < wb.SheetNames.length; k++) {
						//Check for simulation sheet
						if (wb.SheetNames[k] == "O_His") {
							newlayer.sim = true;
							newlayer.time = 0.0;
							newlayer.timescale = 1;
							
							newlayer.data["history"] = {};
							let rows = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[k]]);
							let data = Papa.parse(rows);
							
							//How many buses there are must be included because we don't necessarily know when this sheet is read
							newlayer.data["history"]["nBus"] = data.data[0][0];
							
							let turn = transpose(data.data);
							
							//Store time column
							const ttemp = turn[1].slice(1, turn[1].length);
							newlayer.data["history"]["t"] = ttemp;

							//Store the simulation data
							let dlength = newlayer.data["history"]["t"].length;
							newlayer.end_time = Number(newlayer.data["history"]["t"][dlength - 1]);
							newlayer.start_time = Number(newlayer.data["history"]["t"][0]);
							newlayer.data["history"]["varvgs"] = [];
							for (let m = 0; m < dlength; m++) {
								
								const temp = data.data[m + 1].slice(2, data.data[m + 1].length);
								newlayer.data["history"]["varvgs"].push(temp);
							}	
						}

						//Check for the simulation presets
						else if (wb.SheetNames[k] == "S_Set") {
							newlayer.preset = true;
							newlayer.s_show = "freq";
							newlayer.s_tstamp = false;
							newlayer.s_tdate = "01/01/2000";
							newlayer.s_ttime = "00:00:00:";
							newlayer.s_tinc = "ms";
							newlayer.s_tnum = 1;
							newlayer.s_string = "Milliseconds";
							let rows = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[k]]);
							let data = Papa.parse(rows);
							
							let turn = transpose(data.data);
							
							//Loop through each column, checking for specific data types and assigning them accordingly
							for (let n = 0; n < turn.length; n++) {
								let typeval = turn[n][0];
								let sval = turn[n][1];

								if (typeval == "") {
									continue;
								}
								else if (typeval == "show") {
									if (sval.toLowerCase() == "v") {
										newlayer.s_show = "V";
									}
									else if (sval.toLowerCase() == "t") {
										newlayer.s_show = "theta";
									}
								}
								else if (typeval == "freq") {
									newlayer.options.fmin = Number(sval);
									newlayer.options.fmax = Number(turn[n][2]);	
								}
								else if (typeval == "v_mag") {
									newlayer.options.vmin = Number(sval);
									newlayer.options.vmax = Number(turn[n][2]);
								}
								else if (typeval == "v_ang") {
									newlayer.options.tmin = Number(sval);
									newlayer.options.tmax = Number(turn[n][2]);
								}
								else if (typeval == "tstamp") {
									if (sval.toLowerCase() == "y" || sval.toLowerCase() == "yes") {
										newlayer.s_tstamp = true;
									}																			
								}
								else if (typeval == "tdate") {
									newlayer.s_tdate = sval;
								}
								else if (typeval == "ttime") {
									newlayer.s_ttime = sval;
								}
								else if (typeval == "tinc") {
									if (sval.toLowerCase() == "seconds") {
										newlayer.s_string = "Seconds";
										newlayer.s_tinc = "s";
									}
									else if (sval.toLowerCase() == "minutes") {
										newlayer.s_string = "Minutes";
										newlayer.s_tinc = "min";
									}
									else if (sval.toLowerCase() == "hours") {
										newlayer.s_string = "Hours";
										newlayer.s_tinc = "h";
									}
									else if (sval.toLowerCase() == "days") {
										newlayer.s_string = "Days";
										newlayer.s_tinc = "day";
									}
								}
								else if (typeval == "tnum") {
									newlayer.s_tnum = Number(sval);
								}
							}
						}
							
						//Otherwise store the data based on the sheet and column names
						else {	
							newlayer.data[wb.SheetNames[k]] = {};
							let rows = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[k]]);
							let data = Papa.parse(rows);

							let csv = transpose(data.data);

							for (let m = 0; m < csv.length; m++) {
								if (csv[m][0] == "") {
									continue;
								}

								const temp = csv[m].slice(1, csv[m].length);
								newlayer.data[wb.SheetNames[k]][csv[m][0]] = temp;
							}
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
					let lbut2 = "button2_" + newlayer.num;
					
					let lrange1 = "range1_" + newlayer.num;
					let lrange2 = "range2_" + newlayer.num;
					let lrange3 = "range3_" + newlayer.num;
					let lrange4 = "range4_" + newlayer.num;
					let llabel1 = "label1_" + newlayer.num;
					let llabel2 = "label2_" + newlayer.num;					
					let llabel3 = "label3_" + newlayer.num;
					let llabel4 = "label4_" + newlayer.num;
					
					let lid = "id" + newlayer.num;

					//Div that stores the other elements it gets deleted when the newlayer is delted
					const elem = document.createElement("div");
					const br = document.createElement("br");
					elem.appendChild(br);
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

					/**
					 * Toggles the rendering for a newlayer’s MultiTopLayer.
					 * 
					 * @returns
					 */
					cbox.onchange = function() {
						let cid = this.id.slice(6);
						let cnum = Number(cid); 
						let clayer = win.multilayer[cnum];
						clayer.topo.toggleRender();
						clayer.topo.update(win.workspace);
						win.searchLayer.update(win.searchLayer._context, win);
					};

					//Add the checkbox to the div
					elem.appendChild(cbox);
					elem.appendChild(clabel);

					//Delete button. Removes newlayer from the array and deletes its div
					const dbutton = document.createElement("input"); 
					dbutton.id = lbut;
					dbutton.type = "button";
					dbutton.value = "Delete Layer";
					dbutton.style.cssFloat = "right";

					/**
					 * Deletes the newlayer it is associated with. Turns off the rendering for both 
					 * the newlayer’s MultiTopLayer and MultiContLayer, and removes it from 
					 * Window.multilayer. Also removes it from the SearchLayer and removes its UI elements.
					 * 
					 * @returns
					 */
					dbutton.onclick = function() {
						//List some basic info on what's deleted
						let bid = this.id.slice(6);
						let bnum = Number(bid);
						let blayer = win.multilayer[bnum];
						
						//Set the rendering for multitop and multicont to false because there isn't currently a good way to get rid of them
						blayer.topo._render = false;
						blayer.topo.redraw();
						
						if (newlayer.sim) {
							blayer.cont._render = false;
							blayer.cont.redraw();
						}

						//Set the newlayer to null in the array, increase the amount of free spaces, and set the current free layer to this newlayer's num
						win.multilayer[bnum] = null;
						win.mlayercur = bnum;
						win.mnumfree = win.mnumfree + 1;

						//Remove the div, thus removing all the other elements in it
						let delem = document.getElementById("id" + bnum);
						delem.remove();
						
						win.searchLayer.update(win.searchLayer._context, win);
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
					
					/**
					 * Toggles whether to use custome node colors for a newlayer.
					 * 
					 * @returns
					 */
					ctog2.onchange = function() {	
						let cid = this.id.slice(8);
						let cnum = Number(cid);
						let clayer = win.multilayer[cnum];
						clayer.topo.toggleCNode();
						clayer.topo.update(win.workspace);
					};
					
					/**
					 * Toggles whether to use custom line colors for a newlayer.
					 * 
					 * @returns
					 */
					ctog3.onchange = function() {
						
						let cid = this.id.slice(8);
						let cnum = Number(cid);
						let clayer = win.multilayer[cnum];
						clayer.topo.toggleCLine();
						clayer.topo.update(win.workspace);
					};
					
					//Prioritize layer puts the given layer on top of the others
					const pbut = document.createElement("input");
					pbut.id = lbut2;
					pbut.type = "button";
					pbut.value = "Prioritize Layer";
					pbut.style.cssFloat = "right";

					/**
					 * Create an identical copy of the prioritized newlayer, add it to the map 
					 * so it renders above everything, and then delete the old one.
					 * 
					 * @returns
					 */
					pbut.onclick = function() {
						
						let bid = this.id.slice(8);
						let bnum = Number(bid);
						let blayer = win.multilayer[bnum];

						let replayer = {};
						replayer.num = blayer.num;
						replayer.name = blayer.name;
						replayer.data = blayer.data;
						win.multilayer[bnum] = replayer;
						replayer.topo = L.multitopLayer(replayer).addTo(win.map);
						replayer.topo.stealVals(blayer.topo);
						replayer.topo.update(win.workspace);

						blayer.topo._render = false;
						blayer.topo.redraw();
						
						//Check for if there is a multicont
						if (newlayer.sim) {
							
							replayer.cont = L.multicontLayer(replayer).addTo(win.map);
							replayer.cont.stealVals(blayer.cont);
							replayer.cont.update(win.workspace);
							blayer.cont._render = false;
							blayer.cont.redraw();
						}
					}
					
					elem.appendChild(ctog2);
					elem.appendChild(clabel2);
					
					const ndiv2 = document.createElement("div");
					ndiv2.id = ldiv2;
					elem.appendChild(ndiv2);
					
					elem.appendChild(ctog3);
					elem.appendChild(clabel3);
					elem.appendChild(pbut);

					const ndiv3 = document.createElement("div");
					ndiv3.id = ldiv3;
					elem.appendChild(ndiv3);
					
					//Color input for the nodes
					const color1 = document.createElement("input");
					color1.id = lcolor1;
					color1.type = "color";
					color1.value = "#FFFFFF";
					color1.style.marginLeft = "15px";
					color1.style.marginRight = "5px";

					//Label node color input
					const clabel4 = document.createElement("label");
					clabel4.for = lcolor1;
					clabel4.innerText = "Custom Node Color";
					
					/**
					 * Prompts the user to select a color for a newlayer's nodes
					 * 
					 * @returns
					 */
					color1.onchange = function() {						
						let cid = this.id.slice(7);
						let cnum = Number(cid);
						let clayer = win.multilayer[cnum];
						clayer.topo.updateCNVal(this.value);
						clayer.topo.update(win.workspace);
					};
					
					elem.appendChild(color1);
					elem.appendChild(clabel4);
					
					const ndiv4 = document.createElement("div");
					ndiv4.id = ldiv4;
					elem.appendChild(ndiv4);
					
					//Same as above, just for the lines
					const color2 = document.createElement("input");
					color2.id = lcolor2;
					color2.type = "color";
					color2.value = "#000000";
					color2.style.marginLeft = "15px";
					color2.style.marginRight = "5px";

					//Label for the line colors
					const clabel5 = document.createElement("label");
					clabel5.for = lcolor2;
					clabel5.innerText = "Custom Line Color";
					
					/**
					 * Prompts the user to select a color for a newlayer’s lines.
					 * 
					 * @returns
					 */
					color2.onchange = function() {
						let cid = this.id.slice(7);
						let cnum = Number(cid);
						let clayer = win.multilayer[cnum];
						clayer.topo.updateCLVal(this.value);
						clayer.topo.update(win.workspace);
					};
					
					elem.appendChild(color2);
					elem.appendChild(clabel5);
					
					//Node opacity
					const ndiv5 = document.createElement("div");
					elem.appendChild(ndiv5);
					
					const range1 = document.createElement("input");
					range1.id = lrange1;
					range1.type = "range";
					range1.max = 100;
					range1.min = 0;
					range1.step = 1;
					range1.value = 100;
					range1.style.marginLeft = "15px";
					range1.style.marginRight = "5px";

					const rlabel1 = document.createElement("label");
					rlabel1.for = lrange1;
					rlabel1.id = llabel1;
					rlabel1.innerText = "Node Opacity (0-100) -- Value: " + range1.value;

					/**
					 * Updates the node opacity for a newlayer along with the UI.
					 * 
					 * @returns
					 */
					range1.onchange = function() {
						let cid = this.id.slice(7);
						let cnum = Number(cid); 
						let clayer = win.multilayer[cnum];
						let lab1 = document.getElementById("label1_" + cnum);
						lab1.innerText = "Node Opacity (0-100) -- Value: " + this.value;
						clayer.topo.updateNOp(this.value);
						clayer.topo.update(win.workspace);
					};
					
					elem.appendChild(range1);
					elem.appendChild(rlabel1);
										
					//Line opacity
					const ndiv6 = document.createElement("div");
					elem.appendChild(ndiv6);
					
					const range2 = document.createElement("input");
					range2.id = lrange2;
					range2.type = "range";
					range2.max = 100;
					range2.min = 0;
					range2.step = 1;
					range2.value = 50;
					range2.style.marginLeft = "15px";
					range2.style.marginRight = "5px";
					
					const rlabel2 = document.createElement("label");
					rlabel2.for = lrange2;
					rlabel2.id = llabel2;
					rlabel2.innerText = "Line Opacity (0-100) -- Value: " + range2.value;
					
					/**
					 * Change the line opacity values and change the display on the input
					 * 
					 * @returns
					 */
					range2.onchange = function() {
						let cid = this.id.slice(7);
						let cnum = Number(cid); 
						let clayer = win.multilayer[cnum];
						let lab2 = document.getElementById("label2_" + cnum);
						lab2.innerText = "Line Opacity (0-100) -- Value: " + this.value;
						clayer.topo.updateLOp(this.value);
						clayer.topo.update(win.workspace);
					};
					
					elem.appendChild(range2);
					elem.appendChild(rlabel2);
					
					//Line width was requested before node size, which is why it appears earlier
					const ndiv7 = document.createElement("div");
					elem.appendChild(ndiv7)
					
					const range3 = document.createElement("input");
					range3.id = lrange3;
					range3.type = "range";
					range3.max = 7;
					range3.min = 1;
					range3.step = 1;
					range3.value = 2;
					range3.style.marginLeft = "15px";
					range3.style.marginRight = "5px";
					
					const rlabel3 = document.createElement("label");
					rlabel3.for = lrange3;
					rlabel3.id = llabel3;
					rlabel3.innerText = "Line Thickness (1-7) -- Value: " + range3.value;
					
					/**
					 * Change the line width values and change the display on the input
					 * 
					 * @returns
					 */
					range3.onchange = function() {
						let cid = this.id.slice(7);
						let cnum = Number(cid);
						let clayer = win.multilayer[cnum];
						let lab3 = document.getElementById("label3_" + cnum);
						lab3.innerText = "Line Thickness (1-7) -- Value: " + this.value;
						clayer.topo.updateLThick(this.value);
						clayer.topo.update(win.workspace);
					};
					
					elem.appendChild(range3);
					elem.appendChild(rlabel3);
					
					//Node size
					const ndiv8 = document.createElement("div");
					elem.appendChild(ndiv8)
					
					const range4 = document.createElement("input");
					range4.id = lrange4;
					range4.type = "range";
					range4.max = 36;
					range4.min = 4;
					range4.step = 1;
					range4.value = 12;
					range4.style.marginLeft = "15px";
					range4.style.marginRight = "5px";

					const rlabel4 = document.createElement("label");
					rlabel4.for = lrange4;
					rlabel4.id = llabel4;
					rlabel4.innerText = "Node Size (4-36) -- Value: " + range4.value;
					
					/**
					 * Change the node size values and change the display on the input
					 * 
					 * @returns
					 */
					range4.onchange = function() {
												
						let cid = this.id.slice(7);
						let cnum = Number(cid);
						let clayer = win.multilayer[cnum];
						let lab4 = document.getElementById("label4_" + cnum);
						lab4.innerText = "Node Size (4-36) -- Value: " + this.value;
						clayer.topo.updateNSize(this.value);
						clayer.topo.update(win.workspace);
						
					};
					
					elem.appendChild(range4);
					elem.appendChild(rlabel4);
					
					//These handle if the node and line colors were preset in the file
					if (newlayer.data.Bus.color != null) {
						color1.value = newlayer.data.Bus.color[0];
						newlayer.topo.updateCNVal(color1.value);
						ctog2.click();
					}

					if (newlayer.data.Line.color != null) {
						color2.value = newlayer.data.Line.color[0];
						newlayer.topo.updateCLVal(color2.value);
						ctog3.click();
					}
								
					// =========================================
					// Simulation Utility
					// =========================================
					if (newlayer.sim) {
						newlayer.cont = L.multicontLayer(newlayer).addTo(win.map);
						
						startMultiSim(newlayer);
						endMultiSim(newlayer, win);

						//Add a small divider, just so it's obvious what is multitop and what is multicont
						const hr1 = document.createElement("hr");
						hr1.style.marginTop = "5px";
						elem.appendChild(hr1);

						//Create the playback bar for the animation
						newlayer.pbar = new PlayMulti(newlayer, options, elem, win);

						//Settings for determining what variable to look at (default: frequency, voltage magnitude, voltage angle)
						const simdiv1 = document.createElement("div");
						const fbut = document.createElement("input");
						const vbut = document.createElement("input");
						const tbut = document.createElement("input");

						fbut.type = "radio";
						vbut.type = "radio";
						tbut.type = "radio";
						fbut.id = "frequency_" + newlayer.num;
						vbut.id = "voltage_" + newlayer.num;
						tbut.id = "theta_" + newlayer.num;
						fbut.name = "variable_show_" + newlayer.num;
						vbut.name = "variable_show_" + newlayer.num;
						tbut.name = "variable_show_" + newlayer.num;
						fbut.value = "freq";
						vbut.value = "V";
						tbut.value = "theta";

						fbut.style.marginRight = "5px";
						vbut.style.marginLeft = "15px";
						vbut.style.marginRight = "5px";
						tbut.style.marginLeft = "15px";
						tbut.style.marginRight = "5px";

						const slabel1 = document.createElement("label");
						const slabel2 = document.createElement("label");
						const slabel3 = document.createElement("label");
						slabel1.for = "frequency_" + newlayer.num;
						slabel2.for = "voltage_" + newlayer.num;
						slabel3.for = "theta_" + newlayer.num;
						slabel1.id = "slabel1_" + newlayer.num;
						slabel2.id = "slabel2_" + newlayer.num;
						slabel3.id = "slabel3_" + newlayer.num;
						slabel1.innerText = "Frequency";
						slabel2.innerText = "Voltage";
						slabel3.innerText = "Theta";
						
						//By default, frequency is chosen
						if (!newlayer.preset) {
							
							fbut.checked = true;
						}
						
						//If presets are available, the chosen variable is set
						else {
							newlayer.cont.variableName = newlayer.s_show;
							if (newlayer.s_show == "freq") {
								fbut.checked = true;
								newlayer.cont.showVariable("freq");
								newlayer.cont.updateRange(newlayer.options.fmin, newlayer.options.fmax);
							}
							else if (newlayer.s_show == "V") {
								vbut.checked = true;
								newlayer.cont.showVariable("V");
								newlayer.cont.updateRange(newlayer.options.vmin, newlayer.options.vmax);
							}
							else if (newlayer.s_show == "theta") {
								tbut.checked = true;
								newlayer.cont.showVariable("theta");
								newlayer.cont.updateRange(newlayer.options.tmin, newlayer.options.tmax);
							}
						}

						/**
						 * Updates the displayed simulation variable to be Voltage Frequency, or whatever 
						 * values have been put in place of Voltage Frequency. Also updates the heatmap 
						 * ranges to those corresponding with Voltage Frequency.
						 * 
						 * @returns
						 */
						fbut.onchange = function() {
							let cid = this.id.slice(10);
							console.log(cid);
							let cnum = Number(cid);
							let clayer = win.multilayer[cnum];
							clayer.cont.showVariable("freq");
							clayer.cont.updateRange(newlayer.options.fmin, newlayer.options.fmax);
						};


						/**
						 * Updates the displayed simulation variable to be Voltage Magnitude, or whatever 
						 * values have been put in place of Voltage Magnitude. Also updates the heatmap 
						 * ranges to those corresponding with Voltage Magnitude.
						 * 
						 * @returns
						 */
						vbut.onchange = function() {
							let cid = this.id.slice(8);
							console.log(cid);
							let cnum = Number(cid);
							let clayer = win.multilayer[cnum];
							clayer.cont.showVariable("V");
							clayer.cont.updateRange(newlayer.options.vmin, newlayer.options.vmax);
						};

						/**
						 * Updates the displayed simulation variable to be Voltage Angle, or whatever 
						 * values have been put in place of Voltage Angle. Also updates the heatmap 
						 * ranges to those corresponding with Voltage Angle.
						 * 
						 * @returns
						 */
						tbut.onchange = function() {
							let cid = this.id.slice(6);
							console.log(cid);
							let cnum = Number(cid);
							let clayer = win.multilayer[cnum];
							clayer.cont.showVariable("theta");
							clayer.cont.updateRange(newlayer.options.tmin, newlayer.options.tmax);
						};

						simdiv1.appendChild(fbut);
						simdiv1.appendChild(slabel1);
						simdiv1.appendChild(vbut);
						simdiv1.appendChild(slabel2);
						simdiv1.appendChild(tbut);
						simdiv1.appendChild(slabel3);

						elem.appendChild(simdiv1);

						//This is the timer setting. It is updated in PlayMulti
						const simdiv2 = document.createElement("div");
						const sp1 = document.createElement("p");
						sp1.innerText = "Simulation Time: ";
						sp1.id = "sp1_" + newlayer.num;
						simdiv2.appendChild(sp1);
						elem.appendChild(simdiv2);
						
						const simdiv3 = document.createElement("div");
						const stable1 = document.createElement("table");

						//Table containing the range settings
						stable1.style.width = "100%";
						stable1.id = "stable1_" + newlayer.num;
						let fminid = "fmin_" + newlayer.num; 
						let fmaxid = "fmax_" + newlayer.num; 
						let vminid = "vmin_" + newlayer.num; 
						let vmaxid = "vmax_" + newlayer.num; 
						let tminid = "tmin_" + newlayer.num; 
						let tmaxid = "tmax_" + newlayer.num;

						const str1 = document.createElement("tr");
						const str2 = document.createElement("tr");
						const str3 = document.createElement("tr");

						const std1 = document.createElement("td");
						const std2 = document.createElement("td");
						const std3 = document.createElement("td");
						const std4 = document.createElement("td");
						const std5 = document.createElement("td");
						const std6 = document.createElement("td");

						const sspan1 = document.createElement("span");
						const sspan2 = document.createElement("span");
						const sspan3 = document.createElement("span");

						const sinput1 = document.createElement("input");
						const sinput2 = document.createElement("input");
						const sinput3 = document.createElement("input");
						const sinput4 = document.createElement("input");
						const sinput5 = document.createElement("input");
						const sinput6 = document.createElement("input");

						const spara1 = document.createElement("span");
						const spara2 = document.createElement("span");
						const spara3 = document.createElement("span");

						//Once again, by default it is frequency, voltage magnitude and voltage angle
						//Might allow user to customize the names of the variables later
						spara1.innerText = " - ";
						spara2.innerText = " - ";
						spara3.innerText = " - ";

						sspan1.innerText = "Frequency (p.u.) min/max\n";
						sspan2.innerText = "Voltage Magnitude (p.u.) min/max\n";
						sspan3.innerText = "Voltage Angle (rad) min/max\n";

						std2.style.whiteSpace = "nowrap";
						std4.style.whiteSpace = "nowrap";
						std6.style.whiteSpace = "nowrap";

						//Only allow number inputs
						sinput1.type = "text";
						sinput1.id = fminid;
						sinput1.pattern = "[0-9]*(\.[0-9]*)?"
						sinput1.size = "7";

						sinput2.type = "text";
						sinput2.id = fmaxid;
						sinput2.pattern = "[0-9]*(\.[0-9]*)?"
						sinput2.size = "7";

						std1.appendChild(sspan1);
						std2.appendChild(sinput1);
						std2.appendChild(spara1);
						std2.appendChild(sinput2);
						
						sinput3.type = "text";
						sinput3.id = vminid;
						sinput3.pattern = "[0-9]*(\.[0-9]*)?"
						sinput3.size = "7";

						sinput4.type = "text";
						sinput4.id = vmaxid;
						sinput4.pattern = "[0-9]*(\.[0-9]*)?"
						sinput4.size = "7";

						std3.appendChild(sspan2);
						std4.appendChild(sinput3);
						std4.appendChild(spara2);
						std4.appendChild(sinput4);

						sinput5.type = "text";
						sinput5.id = tminid;
						sinput5.pattern = "[0-9]*(\.[0-9]*)?"
						sinput5.size = "7";

						sinput6.type = "text";
						sinput6.id = tmaxid;
						sinput6.pattern = "[0-9]*(\.[0-9]*)?"
						sinput6.size = "7";

						std5.appendChild(sspan3);
						std6.appendChild(sinput5);
						std6.appendChild(spara3);
						std6.appendChild(sinput6);

						str1.appendChild(std1);
						str1.appendChild(std2);

						str2.appendChild(std3);
						str2.appendChild(std4);
						
						str3.appendChild(std5);
						str3.appendChild(std6);

						stable1.appendChild(str1);
						stable1.appendChild(str2);
						stable1.appendChild(str3);

						simdiv3.appendChild(stable1);
						elem.appendChild(stable1);
						console.log(stable1);

						//Set defaults
						sinput1.value = newlayer.options.fmin;
						sinput2.value = newlayer.options.fmax;
						sinput3.value = newlayer.options.vmin;
						sinput4.value = newlayer.options.vmax;
						sinput5.value = newlayer.options.tmin;
						sinput6.value = newlayer.options.tmax;

						// ======================================================
						// Update Ranges
						// ======================================================

						/**
						 * Updates the minimum range variable for Voltage Frequency in the newlayer. Also 
						 * updates ranges in the newlayer’s MultiContLayer if Voltage Frequency is the currently 
						 * shown variable.
						 * 
						 * @returns
						 */
						sinput1.oninput = function() {
							let val = Number(sinput1.value);

							if (val === val) {
								newlayer.options.fmin = val;
								
								if (newlayer.cont.variableName == "freq") {
									newlayer.cont.updateRange(newlayer.options.fmin, newlayer.options.fmax);
								}
							}
						};

						/**
						 * Updates the maximum range variable for Voltage Frequency in the newlayer. Also 
						 * updates ranges in the newlayer’s MultiContLayer if Voltage Frequency is the currently 
						 * shown variable.
						 * 
						 * @returns
						 */
						sinput2.oninput = function() {
							let val = Number(sinput2.value);

							if (val === val) {
								newlayer.options.fmax = val;
								
								if (newlayer.cont.variableName == "freq") {
									newlayer.cont.updateRange(newlayer.options.fmin, newlayer.options.fmax);
								}
							}
						};

						/**
						 * Updates the minimum range variable for Voltage Magnitude in the newlayer. Also 
						 * updates ranges in the newlayer’s MultiContLayer if Voltage Magnitude is the currently 
						 * shown variable.
						 * 
						 * @returns
						 */
						sinput3.oninput = function() {
							let val = Number(sinput3.value);

							if (val === val) {
								newlayer.options.vmin = val;
								
								if (newlayer.cont.variableName == "V") {
									newlayer.cont.updateRange(newlayer.options.vmin, newlayer.options.vmax);
								}
							}
						};

						/**
						 * Updates the maximum range variable for Voltage Magnitude in the newlayer. Also 
						 * updates ranges in the newlayer’s MultiContLayer if Voltage Magnitude is the currently 
						 * shown variable.
						 * 
						 * @returns
						 */
						sinput4.oninput = function() {
							let val = Number(sinput4.value);

							if (val === val) {
								newlayer.options.vmax = val;
								
								if (newlayer.cont.variableName == "V") {
									newlayer.cont.updateRange(newlayer.options.vmin, newlayer.options.vmax);
								}
							}
						};

						/**
						 * Updates the minimum range variable for Voltage Angle in the newlayer. Also 
						 * updates ranges in the newlayer’s MultiContLayer if Voltage Angle is the currently 
						 * shown variable.
						 * 
						 * @returns
						 */
						sinput5.oninput = function() {
							let val = Number(sinput5.value);

							if (val === val) {
								newlayer.options.tmin = val;
								
								if (newlayer.cont.variableName == "theta") {
									newlayer.cont.updateRange(newlayer.options.tmin, newlayer.options.tmax);
								}
							}
						};
						
						/**
						 * Updates the maximum range variable for Voltage Angle in the newlayer. Also 
						 * updates ranges in the newlayer’s MultiContLayer if Voltage Angle is the currently 
						 * shown variable.
						 * 
						 * @returns
						 */
						sinput6.oninput = function() {
							let val = Number(sinput6.value);

							if (val === val) {
								newlayer.options.tmax = val;
								
								if (newlayer.cont.variableName == "theta") {
									newlayer.cont.updateRange(newlayer.options.tmin, newlayer.options.tmax);
								}
							}
						};

					
						//Put a break between the animation settings and the timestamp settings
						const hr3 = document.createElement("hr");
						hr3.style.marginTop = "10px";
						hr3.style.marginBottom = "10px";
						elem.appendChild(hr3);
						
						const h3 = document.createElement("h3");
						h3.innerText = "Timestamp Settings";
						elem.appendChild(h3);

						const simdiv4 = document.createElement("div");
						
						//Check if user wants to use timestamp
						const stog1 = document.createElement("input");
						stog1.id = "ny_" + newlayer.num;
						stog1.type = "checkbox";
						stog1.value = "ny";
						ctog3.style.marginLeft = "15px";
						ctog3.style.marginRight = "5px";
						
						const slabel4 = document.createElement("label");
						slabel4.for = "ny_" + newlayer.num;
						slabel4.innerText = "Use Timestamp?";
						
						if (newlayer.preset) {
							
							stog1.checked = newlayer.s_tstamp;
						}
					
						simdiv4.appendChild(slabel4);
						simdiv4.appendChild(stog1);
						
						
						elem.appendChild(simdiv4);
						
						//Date setting
						const simdiv5 = document.createElement("div");
						const sdate1 = document.createElement("input");
						sdate1.id = "ts_date_" + newlayer.num;
						sdate1.type = "date";
						
						const slabel5 = document.createElement("label");
						slabel5.for = "ts_date_" + newlayer.num;
						slabel5.innerText = "Select a Date: ";
						
						if (newlayer.preset) {
							
							sdate1.value = newlayer.s_tdate;
						}
						
						simdiv5.appendChild(slabel5);
						simdiv5.appendChild(sdate1);
						
						
						elem.appendChild(simdiv5);
						
						//Time of day setting
						const simdiv6 = document.createElement("div");
						const stime1 = document.createElement("input");
						stime1.id = "ts_time_" + newlayer.num;
						stime1.type = "time";
						
						const slabel6 = document.createElement("label");
						slabel6.for = "ts_time_" + newlayer.num;
						slabel6.innerText = "Select a Time: ";
						
						if (!newlayer.preset) {

							stime1.value = "00:00:00";					
						}
						
						else {
							
							stime1.value = newlayer.s_ttime;
						}

						simdiv6.appendChild(slabel6);
						simdiv6.appendChild(stime1);
						
						elem.appendChild(simdiv6);

						// ================================================================
						// Select option for what increment the timer should increase in
						// ================================================================

						const simdiv7 = document.createElement("div");
						const sselect1 = document.createElement("select");
						sselect1.id = "ts_inc_" + newlayer.num;
						
						const soption1 = document.createElement("option");					
						soption1.value = "ms";
						soption1.id = "ms_" + newlayer.num;
						soption1.innerText = "Milliseconds";
						
						const soption2 = document.createElement("option");
						soption2.value = "s";
						soption2.id = "s_" + newlayer.num;
						soption2.innerText = "Seconds";
						
						const soption3 = document.createElement("option");
						soption3.value = "min";
						soption3.id = "min_" + newlayer.num;
						soption3.innerText = "Minutes";
						
						const soption4 = document.createElement("option");
						soption4.value = "h";
						soption4.id = "h_" + newlayer.num;
						soption4.innerText = "Hours";
						
						const soption5 = document.createElement("option");
						soption5.value = "day";
						soption5.id = "day_" + newlayer.num;
						soption5.innerText = "Days";
						
						//And by how much of that increment per second
						const slabel7 = document.createElement("label");
						slabel7.for = "ts_inc_" + newlayer.num;
						slabel7.innerText = "Select an Increment: ";
						
						const simdiv8 = document.createElement("div");
						const sinput7 = document.createElement("input");
						sinput7.type = "number";
						sinput7.id = "ts_num_" + newlayer.num;
						sinput7.value = "1";
						sinput7.min = "0";
						sinput7.step = "1";
						
						const slabel8 = document.createElement("label");
						slabel8.for = "ts_num_" + newlayer.num;
						
						slabel8.id = "ts_lab_" + newlayer.num;
						
						if (!newlayer.preset) {
							slabel8.innerText = "Number of Milliseconds per Second:";
							soption1.selected = true;
						}
						else {
							sinput7.value = newlayer.s_tnum;
							sselect1.value = newlayer.s_tinc;

							switch(newlayer.s_tinc) {
								case "s":
								soption2.selected = true;
								slabel8.innerText = "Number of Seconds per Second:";
								break;
								
								case "min":
								soption3.selected = true;
								slabel8.innerText = "Number of Minutes per Second:";
								break;
								
								case "h":
								soption4.selected = true;
								slabel8.innerText = "Number of Hours per Second:";
								break;
								
								case "day":
								soption5.selected = true;
								slabel8.innerText = "Number of Days per Second:";
								break;
							
								default:
								soption1.select = "selected";
								slabel8.innerText = "Number of Milliseconds per Second:";
							}
						}
					
						sselect1.appendChild(soption1);
						sselect1.appendChild(soption2);
						sselect1.appendChild(soption3);
						sselect1.appendChild(soption4);
						sselect1.appendChild(soption5);
						simdiv7.appendChild(slabel7);
						simdiv7.appendChild(sselect1);
						simdiv8.appendChild(slabel8);
						simdiv8.appendChild(sinput7);
						
						elem.appendChild(simdiv7);
						elem.appendChild(simdiv8);

						/**
						 * Update the text for the increments per second label on change
						 * 
						 * Updates the text in the newlayer’s Custom Timestamp UI when a new 
						 * increment type is selected. As a side note, most of the UI elements 
						 * for the newlayer Custom Timestamp features do not have event functions 
						 * because their values are simply checked by the PlayMulti.
						 * 
						 * @returns
						 */
						sselect1.onchange = function() {
							const slab8 = document.getElementById("ts_lab_" + newlayer.num);
							switch(this.value) {
					
								case "s":
							
								slab8.innerText = "Number of Seconds per Second:";
								break;
								
								case "min":
							
								slab8.innerText = "Number of Minutes per Second:";
								break;
								
								case "h":
							
								slab8.innerText = "Number of Hours per Second:";
								break;
						
								case "day":
						
								slab8.innerText = "Number of Days per Second:";
								break;
							
								default:
								slab8.innerText = "Number of Milliseconds per Second:";
								
							}
						};
					}
				
					//Add the div to the table
					let ls = document.getElementById("layerstore");
					const hr2 = document.createElement("hr");
					hr2.style.marginTop = "10px";
					hr2.style.marginBottom = "10px";
					elem.appendChild(hr2);
					ls.appendChild(elem);

				};
				
				//Read the first file they input
				reader.readAsBinaryString(opt_addlayer_input.files[0]);
			}

		}
	};

	/**
	 * Calls the addlayer_input function.
	 * 
	 * @returns
	 * @see opt_addlayer_input
	 */
	opt_addlayer.onclick = function() {
		opt_addlayer_input.click();
	};

	return table_id;
}
