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
	const vars = Varvgs.vars;

	let busCache = this._cache.get(Bus);
	if (!busCache) {
		busCache = {};
		this._cache.set(Bus, busCache);
	}

	let { busLatLngCoords } = busCache;
	if (!busLatLngCoords) {
		busLatLngCoords = busCache.busLatLngCoords =
			new NDArray('C', [Bus.shape[0], 2]);
		
		for (let i=0; i<Bus.shape[0]; ++i) {
			const lat = Bus.get(i, 6);
			const lng = Bus.get(i, 7);
			busLatLngCoords.set(lat, i, 0);
			busLatLngCoords.set(lng, i, 1);
		}
	}

	let { busPixelCoords } = busCache;
	if (!busPixelCoords || needsProjectionUpdate) {
		busPixelCoords = busCache.busPixelCoords = new NDArray('C', [Bus.shape[0], 2]);
		for (let i=0; i<Bus.shape[0]; ++i) {
			const lat = busLatLngCoords.get(i, 0);
			const lng = busLatLngCoords.get(i, 1);
			const point = project(L.latLng(lat, lng));
			busPixelCoords.set(point.x, i, 0);
			busPixelCoords.set(point.y, i, 1);
		}
	}
	
	let { busTriangles } = busCache;
	if (!busTriangles || needsProjectionUpdate) {
		const delaunay = new d3.Delaunay(busLatLngCoords.typedArray);

		busTriangles = busCache.busTriangles =
			new NDArray('C', [delaunay.triangles.length/3, 3], delaunay.triangles);
	}

	let idxvgsCache = this._cache.get(Idxvgs);
	if (!idxvgsCache) {
		idxvgsCache = {};
		this._cache.set(idxvgsCache);
	}

	let { busVoltageExtents } = idxvgsCache;
	if (!busVoltageExtents) {
		busVoltageExtents = idxvgsCache.busVoltageExtents =
			Idxvgs.Bus.V.extents();

		busVoltageExtents.end -= busVoltageExtents.begin - 1;
		busVoltageExtents.begin = 0;
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
				data: busPixelCoords.typedArray,
				numComponents: 2,
			},
		});
	}

	let { aIndicesBufferInfo } = glCache;
	if (!aIndicesBufferInfo) {
		aIndicesBufferInfo = glCache.aIndicesBufferInfo = twgl.createBufferInfoFromArrays(gl, {
			indices: {
				data: busTriangles.typedArray,
				numComponents: 3,
			},
		});
	}

	let { uColormapSampler } = glCache;
	if (!uColormapSampler) {
		uColormapSampler = glCache.uColormapSampler = twgl.createTexture(gl, {
			src: '/static/img/map256.png',
		});
	}
	
	const uProjection = [
		2.0 / +gl.canvas.width, 0, 0, 0,
		0, -2.0 / +gl.canvas.height, 0, 0,
		0, 0, 0, 0,
		-1, 1, 0, 1,
	];
	
	const busVoltage = vars.subarray(busVoltageExtents);

	let maxVoltageDifference = Math.abs(busVoltage.get(0, 0) - 1.0);
	for (let i=1, l=busVoltage.shape[1]; i<l; ++i) {
		const v = Math.abs(busVoltage.get(0, i) - 1.0);
		maxVoltageDifference = Math.max(maxVoltageDifference, v);
	}
	const uScaleMin = 1.0 - maxVoltageDifference;
	const uScaleMax = 1.0 + maxVoltageDifference;

	const aValueBufferInfo = twgl.createBufferInfoFromArrays(gl, {
		aValue: {
			data: busVoltage.typedArray,
			numComponents: 1,
		},
	});

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
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

L.ContourLayer = L.CanvasLayer.extend({
	options: {
		render: renderContour,
	},

	initialize(options) {
		this._context = null;
		this._cache = new WeakMap();
		L.CanvasLayer.prototype.initialize.call(this, options);
	},

	update(context) {
		this._context = context;
		this.redraw();
	},
});

L.contourLayer = function(options) {
	return new L.ContourLayer(options);
};