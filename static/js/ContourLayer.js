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

void main() {
	float value = (vValue - 0.9) / (1.1 - 0.9);
	gl_FragColor = vec4(value, value, value, 1.0);
}
`;

function renderContour(canvas, { size, bounds, project, needsUpdate }) {
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
	let { busPixelCoords, busTriangles } = busCache ? busCache : {};
	if (!busCache || needsUpdate) {
		busCache = {};
		this._cache.set(Bus, busCache);

		busPixelCoords = busCache.busPixelCoords = new NDArray('C', [Bus.shape[0], 2]);

		for (let i=0; i<Bus.shape[0]; ++i) {
			const lat = Bus.get(i, 6);
			const lng = Bus.get(i, 7);
			const point = project(L.latLng(lat, lng));
			busPixelCoords.set(point.x, i, 0);
			busPixelCoords.set(point.y, i, 1);
		}

		const delaunay = new d3.Delaunay(busPixelCoords.typedArray);
		busTriangles = busCache.busTriangles = new NDArray('C', [delaunay.triangles.length/3, 3], delaunay.triangles);
		console.log({ busTriangles });
	}

	let idxvgsCache = this._cache.get(Idxvgs);
	let { busVoltageExtents } = idxvgsCache ? idxvgsCache : {};
	if (!idxvgsCache || needsUpdate) {
		idxvgsCache = {};
		this._cache.set(idxvgsCache);

		busVoltageExtents = idxvgsCache.busVoltageExtents =
			Idxvgs.Bus.V.extents();
		busVoltageExtents.end -= busVoltageExtents.begin - 1;
		busVoltageExtents.begin = 0;
	}

	let gl = this._cache.get(canvas);
	if (!gl || needsUpdate) {
		gl = canvas.getContext('webgl2');
		this._cache.set(canvas, gl);
	}

	let glCache = this._cache.get(gl);
	let { programInfo, aPositionBufferInfo, uProjection, aIndicesBufferInfo } = glCache ? glCache : {};
	if (!glCache || needsUpdate) {
		console.log('rebuilding glCache');

		glCache = {};
		this._cache.set(gl, glCache);
		programInfo = glCache.programInfo =
			twgl.createProgramInfo(gl, [contourVertexShader, contourFragmentShader]);
		
		aPositionBufferInfo = glCache.aPositionBufferInfo = twgl.createBufferInfoFromArrays(gl, {
			aPosition: {
				data: busPixelCoords.typedArray,
				numComponents: 2,
			},
		});

		aIndicesBufferInfo = glCache.aIndicesBufferInfo = twgl.createBufferInfoFromArrays(gl, {
			indices: {
				data: busTriangles.typedArray,
				numComponents: 3,
			},
		});
		console.log({ aIndicesBufferInfo });

		uProjection = glCache.uProjection = {
			uProjection: [
				2.0 / +gl.canvas.width, 0, 0, 0,
				0, -2.0 / +gl.canvas.height, 0, 0,
				0, 0, 0, 0,
				-1, 1, 0, 1,
			],
		};
	}
	
	const busVoltage = vars.subarray(busVoltageExtents);
	console.log(busVoltage.get(0, 0));
	console.log({ vars, busVoltageExtents, busVoltage });

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
	twgl.setUniforms(programInfo, uProjection);
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