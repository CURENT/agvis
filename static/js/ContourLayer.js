const contourVertexShader = `
attribute vec2 aPosition;

void main() {
	gl_PointSize = 10.0;
	gl_Position = vec4(aPosition, 0, 1);
}
`;

const contourFragmentShader = `
void main() {
	gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`;

function renderContour(canvas, { size, bounds, project, needsUpdate }) {
	console.log('render');
	const context = this._context;
	if (!context) return;
	const SysParam = context.SysParam;
	if (!SysParam) return;
	const Bus = SysParam.Bus;

	console.log('here', Bus);

	let busCache = this._cache.get(Bus);
	if (!busCache || needsUpdate) {
		console.log('reset');
		busCache = new NDArray([Bus.shape[0], 2]);
		this._cache.set(Bus, busCache);

		for (let i=0; i<Bus.shape[0]; ++i) {
			const lat = Bus.get(i, 6);
			const lng = Bus.get(i, 7);
			const point = project(L.latLng(lat, lng));
			busCache.set(point.x, i, 0);
			busCache.set(point.y, i, 1);
		}
	}

	console.log('there', busCache);

	let gl = this._cache.get(canvas);
	if (!gl || needsUpdate) {
		gl = canvas.getContext('webgl');
		this._cache.set(canvas, gl);
	}

	let glCache = this._cache.get(gl);
	let { programInfo, bufferInfo } = glCache ? glCache : {};
	if (!glCache || needsUpdate) {
		console.log('rebuilding glCache');

		glCache = {};
		this._cache.set(gl, glCache);
		programInfo = glCache.programInfo =
			twgl.createProgramInfo(gl, [contourVertexShader, contourFragmentShader]);
		
		const arrays = {
			aPosition: [-0.8, -0.8, 0.2, 0.8, -0.8, 0.2, -0.8, 0.8, 0.2, -0.8, 0.8, 0.2, 0.8, -0.8, 0.2, 0.8, 0.8, 0.2],
		};

		bufferInfo = glCache.bufferInfo =
			twgl.createBufferInfoFromArrays(gl, arrays);
	}

	console.log('size', { w: gl.canvas.width, h: gl.canvas.height });

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.useProgram(programInfo.program);
	twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
	//twgl.setUniforms(programInfo, uniforms);
	twgl.drawBufferInfo(gl, bufferInfo, gl.POINTS);
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