/* ***********************************************************************************
 * File Name:   ContourLayer.js
 * Authors:     Nicholas West, Nicholas Parsley
 * Date:        9/20/2023 (last modified)
 * 
 * ContourLayer.js contains the code for the ContourLayer class. This class handles 
 * displaying the heatmap animations for a given power system. The heatmap bounds are 
 * done using the Delaunay Triangulation implementation from the D3.js library. The 
 * actual visuals for each heatmap are done using TWGL to apply a texture to each 
 * triangle’s fragments based on their interpolated values.
 * ***********************************************************************************/

/**
 * The vertex shader for the Contour-type Layers. Passes the values for a given 
 * variable to the fragment shader so that they can be interpolated for rendering 
 * the heat map.
 */
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

/**
 * The fragment shader for the Contour-type Layers. Maps the color in a texture 
 * to each fragment based on the interpolated variable value, the minimum of the 
 * variable range, and the maximum of the variable range.
 */
const contourFragmentShader = `
	precision mediump float;
	varying float vValue;
	uniform sampler2D uColormapSampler;
	uniform float uScaleMin;
	uniform float uScaleMax;
	uniform float uOpacity;

	void main() {
		float value = (vValue - uScaleMin) / (uScaleMax - uScaleMin);
		vec4 color = texture2D(uColormapSampler, vec2(value, 0.0));
		color.a *= uOpacity;
		gl_FragColor = color;
	}
`;

/**
 * Handles rendering for the ContourLayer. Most of the function consists of determining 
 * locations of the nodes if they aren’t in the cache yet, creating all the triangles,
 * and then setting up WebGL with TWGL. A gradient texture is applied to each fragment, 
 * which is rendered on the canvas. The color of each fragment is based off the variable 
 * data from known locations. Any major modifications to ContourLayer’s rendering 
 * function are probably best left to those with a decent level of familiarity with WebGL.
 * 
 * @param {HTMLCanvasElement}  canvas                - The canvas element to render to.
 * @param {Point Class}        size                  - (Unused) The size of the canvas.
 * @param {LatLngBounds Class} bounds                - (Unused) The geographical bounds of the map.
 * @param {Function}           project               - The latLngToContainerPoint function specifically for CanvasLayer._map.
 * @param {Boolean}            needsProjectionUpdate - Determines whether the Layer’s projection needs to be updated.
 * @returns
 */
function renderContour(canvas, { size, bounds, project, needsProjectionUpdate }) {
	// ==================================================
	// Initialize variables
	// ==================================================

	const context = this._context;
	if (!context) return;
	const SysParam = context.SysParam;
	if (!SysParam) return;
	const Bus = SysParam.Bus;
	const Idxvgs = context.Idxvgs;
	if (!Idxvgs) return;
	const Varvgs = context.Varvgs;
	if (!Varvgs) return;

	let paramCache = this._cache.get(SysParam);
	if (!paramCache) {
		paramCache = {};
		this._cache.set(SysParam, paramCache);
	}

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

	const vars = new dime.NDArray(Varvgs.vars.order, Varvgs.vars.shape, Float32Array.from(Varvgs.vars.array));
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

	const uOpacity = this._opacity;

	// ==================================================
	// Render
	// ==================================================

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
			uOpacity,
        });
        twgl.drawBufferInfo(gl, aIndicesBufferInfo, gl.TRIANGLES);

    }
    else {
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    }
}

L.ContourLayer = L.CanvasLayer.extend({
	options: {
		render: renderContour,
	},

	/**
	 * Set the ContourLayer's starting variables.
	 * 
	 * @memberof ContourLayer
	 * @param {Object} options - The options Object from Window. Unused beyond being passed to CanvasLayer's 
	 * 							 initialization function, seemed to be initially used to set certain variables, 
	 * 							 but those values are instead hardcoded into the initialization.
	 * @returns 
	 */
	initialize(options) {
		this._context = null;
		this._variableRange = null;
		this._variableRelIndices = null;
		this._uScaleMin = 0.8;
		this._uScaleMax = 1.2;
		this._opacity = 1.0;
		this._cache = new WeakMap();
        this._render = true;

        this.variableName = null;
		L.CanvasLayer.prototype.initialize.call(this, options);
	},

	/**
	 * Updates the values for the variables and then re-renders the ContourLayer.
	 * 
	 * @memberof ContourLayer
	 * @param {Object} context - The context Object from Window.
	 * @returns
	 */
	update(context) {
		this._context = context;
            this.redraw();
    },

	/**
	 * Add the CountourLayer to the map.
	 * @memberof ContourLayer
	 * @param {Map Class} map 
	 * @returns
	 */
    onAdd(map) {
        L.CanvasLayer.prototype.onAdd.call(this, map);
        this.getPane().classList.add("contour-pane");
    },

	/**
	 * Passes the relative indices for the simulation variables from Window to ContourLayer.
	 * 
	 * @memberof ContourLayer
	 * @param {Object} idx - Relative indices 
	 * @returns
	 */
	storeRelativeIndices(idx) {
		this._variableRelIndices = idx;
	},

	/**
	 * Changes the simulation variable being used for the animation and requests 
	 * that the current frame be redrawn.
	 * 
	 * @memberof ContourLayer
	 * @param {String} name - The name of the variable used to key into the ContourLayer._variableRelIndices Object.
	 * @returns
	 */
	showVariable(name) {
		// updates the name of variables for the contour map
        this.variableName = name;

		this._variableRange = this._variableRelIndices[name];
            this.redraw();
    },

	/**
	 * Passes the range values used in the animation from the configuration 
	 * settings to the ContourLayer.
	 * 
	 * @memberof ContourLayer
	 * @param {Number} lower - The lower bound of the range.
	 * @param {Number} upper - The upper bound of the range.
	 * @returns
	 */
	updateRange(lower, upper){
		this._uScaleMax = upper;
		this._uScaleMin = lower;
	},

	/**
	 * The function that switches the state of ContourLayer._render.
	 * 
	 * @memberof ContourLayer
	 * @returns
	 */
    toggleRender() {
        this._render = !this._render;
        console.log("Contour rendering: ", this._render);
    },

	/**
	 * Updates the opacity value of ContourLayer using the value passed from the Playback Bar.
	 * 
	 * @memberof ContourLayer
	 * @returns
	 */
	updateOpacity(opacity) {
        this._opacity = opacity;
		this.redraw();
    },

});

L.contourLayer = function(options) {
	return new L.ContourLayer(options);
};
