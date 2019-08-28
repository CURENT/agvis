const contourVertexShader = `
attribute vec2 aPosition;
attribute float aValue;
uniform mat4 uProjection;

void main() {
	gl_PointSize = 10.0 * aValue;
	gl_Position = uProjection * vec4(aPosition, 0, 1);
}
`;

const contourFragmentShader = `
void main() {
	gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
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
	let { busPixelCoords } = busCache ? busCache : {};
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
	}

	let idxvgsCache = this._cache.get(Idxvgs);
	let { busVoltageExtents } = idxvgsCache ? idxvgsCache : {};
	if (!idxvgsCache || needsUpdate) {
		idxvgsCache = {};
		this._cache.set(idxvgsCache);

		busVoltageExtents = idxvgsCache.busVoltageExtents =
			Idxvgs.Bus.V.extents();
	}

	let gl = this._cache.get(canvas);
	if (!gl || needsUpdate) {
		gl = canvas.getContext('webgl');
		this._cache.set(canvas, gl);
	}

	let glCache = this._cache.get(gl);
	let { programInfo, aPositionBufferInfo, uProjection } = glCache ? glCache : {};
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
	twgl.setUniforms(programInfo, uProjection);
	twgl.drawBufferInfo(gl, aValueBufferInfo, gl.POINTS);
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