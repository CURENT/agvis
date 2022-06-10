const layers_html = `
<div>
    <input type="button" value="Add Layer" name="opt_addlayer">
</div>

<div id=
`

//Use win.map when adding layers and the like
//const SIDEBAR_CALLBACKS = [];
var layerarray = [];

function addSidebarLayers(win, options, sidebar) {
    const table_id = "layerpanel" + win.num;

    sidebar.addPanel({
        id: table_id,
        tab: '<span>\u00b1</span>',
        pane: layers_html,
        title: 'Add Layers'

    });
	
	const opt_addlayer = document.querySelector(`#${table_id} input[name='opt_addlayer']`);
	
    const opt_addlayer_input = document.createElement("input");

    opt_addlayer_input.style.display = "none";
	opt_addlayer_input.id = "fin";
    opt_addlayer_input.type = "file";
	opt_addlayer_input.accept = ".xlsx, .csv";
    document.body.appendChild(opt_addlayer_input);

    opt_addlayer_input.onchange = function() {
        if (opt_addlayer_input.files.length > 0) {

			fname = opt_addlayer_input.files[0].name;
			ext = fname.substring(fname.lastIndexOf(".") + 1);
			
			if (ext === "csv") {
	
				Papa.parse(opt_addlayer_input.files[0], {
					complete: function(results) {
						console.log(results);
					}
				});
			}
			
			else if (ext === "xlsx") {
				
				var reader = new FileReader();
				
				
				if (reader.readAsBinaryString) {
				
					reader.onload = function (dat) {
						
						var wb = XLSX.read(dat.target.result, {type: "binary"});
						console.log(wb);
						var rows = XLSX.utils.sheet_to_row_object_array(wb.Sheets[wb.SheetNames[0]]);
						console.log(rows);					
					};
					
					reader.readAsBinaryString(opt_addlayer_input.files[0]);
				}
			}
			
			else {
				
				alert("Please use a specified file type.");
			}
		}
    };

    opt_addlayer.onclick = function() {
        opt_addlayer_input.click();
    };

  //  updateInputs();
  //  SIDEBAR_CALLBACKS.push(updateInputs);

    return table_id;
}
