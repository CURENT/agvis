/* ****************************************************************************************
 * File Name:   ContMulti.js
 * Authors:     Nicholas West, Nicholas Parsly
 * Date:        9/16/2023 (last modified)
 * 
 * Description: ContMulti.js contains the code relating to the MultiContiLayer. 
 * 				MultiContLayer shares many things with the ContourLayer (like 
 * 				MultiTopLayer does with TopologyLayer). Once again, the main difference 
 * 				is that the MultiContLayer uses data from a newlayer as opposed to the 
 * 				Window's workspace.
 * 
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/modeling/contmulti.html
 * ****************************************************************************************/

/*
	const contourVertexShader = `
	precision mediump float;
	attribute vec2 aPosition;
	attribute float aValue;
	uniform mat4 uProjection;
	varying float vValue;

	void main() {
		gl_Position = uProjection * vec4(aPosition, 0, 1);
		vValue = aValue;
	}
	`;

	const contourFragmentShader = `
	precision mediump float;
	varying float vValue;
	uniform sampler2D uColormapSampler;
	uniform float uScaleMin;
	uniform float uScaleMax;

	void main() {
		float value = (vValue - uScaleMin) / (uScaleMax - uScaleMin);
		gl_FragColor = texture2D(uColormapSampler, vec2(value, 0.0));
	}
	`;
*/

/**
 * Render the multi contour layer
 * 
 * @param   {HTML Canvas Element}    canvas                - The canvas that the layer will be drawn on.
 * @param   {Point Class}            size                  - Represents the current size of the map in pixels.
 * @param   {LatLngBounds Class}     bounds                - Represents the geographical bounds of the map.
 * @param   {Function}               project               - The latLngToContainerPoint function specifically for CanvasLayer._map.
 * @param   {Boolean}                needsProjectionUpdate - Determines whether the Layer’s projection needs to be updated.
 * 
 * @var     {NDArray}                busLatLngCoords       - Stores the latitude and longitude for each node.
 * @var     {NDArray}                busPixelCoords        - Stores the pixel coordinates for each node.
 * @var     {NDArray}                busTriangles          - Stores the triangles used to create the heat map.
 * @var     {WebGL2RenderingContext} gl				       - The WebGL2RenderingContext for the canvas.
 * @var     {ProgramInfo}            programInfo		   - The ProgramInfo for the canvas.
 * @var     {WebGLTexture}           uColormapSampler	   - The WebGLTexture for the canvas.
 * @returns
 */
function renderMultiCont(canvas, { size, bounds, project, needsProjectionUpdate }) {

	// ===================================================
	// Initialize variables
	// ===================================================

	const context = this._context;
	if (!context) return;
	const SysParam = this._newlayer.data;
	if (!SysParam) return;
	const Bus = SysParam.Bus;
	//const Idxvgs = this._newlayer.Idxvgs;
	//if (!Idxvgs) return;
	//const Varvgs = this._newlayer.Varvgs;
	//if (!Varvgs) return;

	const temparr = [];
	let x;
	
	// Select data based on where the timer for the animation is at
	for (let j = 0; j < this._newlayer.data["history"]["t"].length; j++) {

		let val = Number(this._newlayer.data["history"]["t"][j]);
		if (val >= Number(this._newlayer.time)) {

			x = j;
			break;
		}
	}
	
	temparr.push(this._newlayer.data["history"]["varvgs"][x].length);
	
	const Varvgs = new dime.NDArray("F", temparr, this._newlayer.data["history"]["varvgs"][x]);
	
	let paramCache = this._cache.get(SysParam);
	if (!paramCache) {
		paramCache = {};
		this._cache.set(SysParam, paramCache);
	}

	/** 
	 * I don't entirely understand how it works, but it basically uses delauney 
	 * triangles to create heat maps between nodes, then it uses a gradient function to smooth it over.
	 */
    const nelems = Bus.idx.length;

	let { busLatLngCoords } = paramCache;
	if (!busLatLngCoords) {
		busLatLngCoords = paramCache.busLatLngCoords =
			new NDArray('C', [nelems, 2]);

		for (let i=0; i < nelems; ++i) {
			const lat = Bus.ycoord[i];
			const lng = Bus.xcoord[i];
			busLatLngCoords.set(lat, i, 0);
			busLatLngCoords.set(lng, i, 1);
		}
	}

	let { busPixelCoords } = paramCache;
	if (!busPixelCoords || needsProjectionUpdate) {
		busPixelCoords = paramCache.busPixelCoords = new NDArray('C', [nelems, 2]);
		for (let i=0; i < nelems; ++i) {
			const lat = busLatLngCoords.get(i, 0);
			const lng = busLatLngCoords.get(i, 1);
			const point = project(L.latLng(lat, lng));
			busPixelCoords.set(point.x, i, 0);
			busPixelCoords.set(point.y, i, 1);
		}
	}

	let { busTriangles } = paramCache;
	if (!busTriangles || needsProjectionUpdate) {
		const delaunay = new d3.Delaunay(busLatLngCoords.array);

		busTriangles = paramCache.busTriangles =
			new NDArray('C', [delaunay.triangles.length/3, 3], delaunay.triangles);
	}
/*
	let idxvgsCache = this._cache.get(Idxvgs);
	if (!idxvgsCache) {
		idxvgsCache = {};
		this._cache.set(idxvgsCache);
	}

	let { variableSubIndices } = idxvgsCache;

	if (!variableSubIndices) {
		variableSubIndices = idxvgsCache.variableSubIndices =
			Idxvgs.Bus.V.extents();

		variableSubIndices.end -= variableSubIndices.begin - 1;
		variableSubIndices.begin = 0;
	}
*/
	let gl = this._cache.get(canvas);
	if (!gl) {
		gl = canvas.getContext('webgl2');
		this._cache.set(canvas, gl);
	}

	let glCache = this._cache.get(gl);
	if (!glCache) {
		glCache = {};
		this._cache.set(gl, glCache);
	}

	let { programInfo } = glCache;
	if (!programInfo) {
		programInfo = glCache.programInfo =
			twgl.createProgramInfo(gl, [contourVertexShader, contourFragmentShader]);
	}

	let { aPositionBufferInfo } = glCache;
	if (!aPositionBufferInfo || needsProjectionUpdate) {
		aPositionBufferInfo = glCache.aPositionBufferInfo = twgl.createBufferInfoFromArrays(gl, {
			aPosition: {
				data: busPixelCoords.array,
				numComponents: 2,
			},
		});
	}

	let { aIndicesBufferInfo } = glCache;
	if (!aIndicesBufferInfo) {
		aIndicesBufferInfo = glCache.aIndicesBufferInfo = twgl.createBufferInfoFromArrays(gl, {
			indices: {
				data: busTriangles.array,
				numComponents: 3,
			},
		});
	}

	let { uColormapSampler } = glCache;
	if (!uColormapSampler) {
		uColormapSampler = glCache.uColormapSampler = twgl.createTexture(gl, {
			src: '/img/map256.png',
			wrapS: gl.CLAMP_TO_EDGE,
			wrapT: gl.CLAMP_TO_EDGE,
			min: gl.LINEAR_MIPMAP_LINEAR,
		});
	}

	const uProjection = [
		2.0 / +gl.canvas.width, 0, 0, 0,
		0, -2.0 / +gl.canvas.height, 0, 0,
		0, 0, 0, 0,
		-1, 1, 0, 1,
	];

	const vars = new dime.NDArray(Varvgs.order, Varvgs.shape, Float32Array.from(Varvgs.array));
	const variableValue = vars.subarray(this._variableRange);

	let maxVoltageDifference = Math.abs(variableValue.get(0, 0) - 1.0);
	for (let i=1, l=variableValue.shape[1]; i<l; ++i) {
		const v = Math.abs(variableValue.get(0, i) - 1.0);
		maxVoltageDifference = Math.max(maxVoltageDifference, v);
	}

	const uScaleMin = this._uScaleMin;
	const uScaleMax = this._uScaleMax;

	const aValueBufferInfo = twgl.createBufferInfoFromArrays(gl, {
		aValue: {
			data: variableValue.array,
			numComponents: 1,
		},
	});

    if(this._render) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(programInfo.program);
        twgl.setBuffersAndAttributes(gl, programInfo, aPositionBufferInfo);
        twgl.setBuffersAndAttributes(gl, programInfo, aValueBufferInfo);
        twgl.setBuffersAndAttributes(gl, programInfo, aIndicesBufferInfo);
        twgl.setUniforms(programInfo, {
            uScaleMin,
            uScaleMax,
            uProjection,
            uColormapSampler,
        });
        twgl.drawBufferInfo(gl, aIndicesBufferInfo, gl.TRIANGLES);

    }
    else {
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    }
}

/**
 * The MultContLayer Class
 * 
 * @var     {Object}  MultiContLayer._context            - Another name for the Window's workspace
 * @var     {Object}  MultiContLayer._variableRange      - Minimum and maximum index for a given variable in "begin" and "end" respectively
 * @var     {Object}  MultiContLayer._variableRelIndices - Stores the ranges for all the variables
 * @var     {Number}  MultiContLayer._uScaleMin          - Minimum range of a variable
 * @var     {Number}  MultiContLayer._uScaleMax          - Maximum range of a variable
 * @var     {Number}  MultiContLayer._opacity            - The opacity for the heatmap. Applied in a fragment shader.
 * @var     {Boolean} MultiContLayer._render             - Determines if MultiContLayer has been rendered or not.
 * @returns
 */
L.MultiContLayer = L.CanvasLayer.extend({
	options: {
		render: renderMultiCont,
	},

	/**
	 * Initializes the MultiContLayer's setting
	 * 
	 * @constructs MultiContLayer
	 * @param {*}      newlayer 
	 * @param {Object} options  - (Optional) The options Object from Window. Unused beyond being passed to the CanvasLayer initialization function.
	 * @returns
	 */
	initialize(newlayer, options) {
		this._context = null;
		this._variableRange = null;
		this._variableRelIndices = null;
		this._uScaleMin = 0.8;
		this._uScaleMax = 1.2;
		this._cache = new WeakMap();
        this._render = false;
		this._newlayer = newlayer;

        this.variableName = null;
		L.CanvasLayer.prototype.initialize.call(this, options);
	},

	/**
	 * Updates the values for the variables and then re-renders the MultiContLayer.
	 * 
	 * @memberof MultiContLayer
	 * @param {Object} - The workspace from Window.
	 * @returns
	 */
	update(context) {
		this._context = context;
        this.redraw();
    },

	/**
	 * Handles adding the MultiContLayer to the map.
	 * 
	 * @memberof MultiContLayer
	 * @param {map} map - The map from Window
	 * @returns 
	 */
    onAdd(map) {
        L.CanvasLayer.prototype.onAdd.call(this, map);
        this.getPane().classList.add("multicont-pane" + this._newlayer.num);
    },

	/**
	 * Passes the relative indices for the simulation variables from Window to MultiContLayer.
	 * 
	 * @memberof MultiContLayer
	 * @param {Object} idx - Relative indices
	 * @returns
	 */
	storeRelativeIndices(idx) {
		this._variableRelIndices = idx;
	},

	/**
	 * Changes the simulation variable being used for the animation and requests that the current frame be redrawn.
	 * 
	 * @param {String} name - The name of the variable used to key into the MultiContLayer._variableRelIndices Object.
	 * @returns 
	 */
	showVariable(name) {
		// updates the name of variables for the contour map
        this.variableName = name;

		this._variableRange = this._variableRelIndices[name];
            this.redraw();
    },

	/**
	 * Passes the range values used in the animation from the configuration settings to the MultiContLayer.
	 * 
	 * @memberof MultiContLayer
	 * 
	 * @param {Number} lower 
	 * @param {Number} upper 
	 * @returns
	 */
	updateRange(lower, upper){
		this._uScaleMax = upper;
		this._uScaleMin = lower;
	},

	/**
	 * Switches the state of MultiContLayer._render
	 * 
	 * @memberof MultiContLayer
	 * @returns
	 */
    toggleRender() {
        this._render = !this._render;
        console.log("MultiContour rendering: ", this._render);
    },

	/**
	 * Changes the newlayer’s current values to be those from another newlayer. Used exclusively for the “Prioritize Layer” button.
	 * 
	 * @memberof MultiContLayer
	 * @param {Object} oldlayer - The newlayer that the values are being taken from.
	 * @returns
	 */
	stealVals(oldlayer) {
		
		this._context = oldlayer._context;
		this._variableRange = oldlayer._variableRange;
		this._variableRelIndices = oldlayer._variableRelIndices;
		this._uScaleMin = oldlayer._uScaleMin;
		this._uScaleMax = oldlayer._uScaleMax;
		this._cache = oldlayer._cache;
		this.variableName = oldlayer.variableName;
		this._render = oldlayer._render;
	}
});

L.multicontLayer = function(newlayer, options) {
	console.log("New multicont");
	return new L.MultiContLayer(newlayer, options);
};
