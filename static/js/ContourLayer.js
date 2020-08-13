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

function renderContour(canvas, { size, bounds, project, needsProjectionUpdate }) {
	const context = this._context;
	if (!context) return;
	const SysParam = context.SysParam;
	if (!SysParam) return;
	const Bus = SysParam.Bus;
	const Idxvgs = context.Idxvgs;
	if (!Idxvgs) return;
	const Varvgs = context.Varvgs;
	if (!Varvgs) return;
	let vars = Varvgs.vars;

	let paramCache = this._cache.get(SysParam);
	if (!paramCache) {
		paramCache = {};
		this._cache.set(SysParam, paramCache);
	}

	let { busLatLngCoords } = paramCache;
	if (!busLatLngCoords) {
		busLatLngCoords = paramCache.busLatLngCoords =
			new NDArray('C', [Bus.shape[0], 2]);

		for (let i=0; i<Bus.shape[0]; ++i) {
			const lat = Bus.get(i, 6);
			const lng = Bus.get(i, 7);
			busLatLngCoords.set(lat, i, 0);
			busLatLngCoords.set(lng, i, 1);
		}
	}

	let { busPixelCoords } = paramCache;
	if (!busPixelCoords || needsProjectionUpdate) {
		busPixelCoords = paramCache.busPixelCoords = new NDArray('C', [Bus.shape[0], 2]);
		for (let i=0; i<Bus.shape[0]; ++i) {
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
				data: Float32Array.from(busPixelCoords.array),
				numComponents: 2,
			},
		});
	}

	let { aIndicesBufferInfo } = glCache;
	if (!aIndicesBufferInfo) {
		aIndicesBufferInfo = glCache.aIndicesBufferInfo = twgl.createBufferInfoFromArrays(gl, {
			indices: {
				data: Float32Array.from(busTriangles.array),
				numComponents: 3,
			},
		});
	}

	let { uColormapSampler } = glCache;
	if (!uColormapSampler) {
		uColormapSampler = glCache.uColormapSampler = twgl.createTexture(gl, {
			src: '/static/img/map256.png',
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
			data: Float32Array.from(variableValue.array),
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

L.ContourLayer = L.CanvasLayer.extend({
	options: {
		render: renderContour,
	},

	initialize(options) {
		this._context = null;
		this._variableRange = null;
		this._variableRelIndices = null;
		this._uScaleMin = 0.8;
		this._uScaleMax = 1.2;
		this._cache = new WeakMap();
        this._render = true;
		L.CanvasLayer.prototype.initialize.call(this, options);
	},

	update(context) {
		this._context = context;
            this.redraw();
    },

    onAdd(map) {
        L.CanvasLayer.prototype.onAdd.call(this, map);
        this.getPane().classList.add("contour-pane");
    },

	storeRelativeIndices(idx) {
		this._variableRelIndices = idx;
	},

	showVariable(name) {
		// updates the name of variables for the contour map
		this._variableRange = this._variableRelIndices[name];
            this.redraw();
    },

	updateRange(lower, upper){
		this._uScaleMax = upper;
		this._uScaleMin = lower;
	},

    toggleRender() {
        this._render = !this._render;
        //console.log("Contour rendering: ", this._render);
    }

});

L.contourLayer = function(options) {
	return new L.ContourLayer(options);
};
