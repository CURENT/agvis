L.CanvasLayer = L.Layer.extend({

	options: {
		render() {
			console.warn('Using default render function');
		},
		repeat: false,
	},

	initialize(options) {
		L.Util.setOptions(this, options);
	},

	onAdd(map) {
		this._map = map;
		this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-layer');

		this._canvas.style.pointerEvents = 'none';

		var size = this._map.getSize();
		this._canvas.width = size.x;
		this._canvas.height = size.y;

		this._map.createPane('overlayPane').appendChild(this._canvas);

		map.on('moveend', this._reset, this);
		map.on('resize', this._resize, this);
		map.on('viewreset', this._resize, this);

		this._reset();
	},

	redraw() {
		if (!this._frame) {
			this._frame = L.Util.requestAnimFrame(this._redraw, this);
		}
		return this;
	},

	onRemove(map) {
		this._map.getPane('overlayPane').removeChild(this._canvas);

		map.off('moveend', this._reset, this);
		map.off('resize', this._resize, this);

		this._canvas = null;
		this._map = null;
	},

	addTo(map) {
		map.addLayer(this);
		return this;
	},

	_resize(resizeEvent) {
		this._canvas.width = this._map.getSize().x;
		this._canvas.height = this._map.getSize().y;
	},

	_reset() {
		var topLeft = this._map.containerPointToLayerPoint([0, 0]);
		L.DomUtil.setPosition(this._canvas, topLeft);
		this._needsProjectionUpdate = true;
		this.redraw();
	},

	_redraw() {
		const size = this._map.getSize();
		const bounds = this._map.getBounds();
		const project = this._map.latLngToContainerPoint.bind(this._map);

		if (this.options.render) {
			var params = {
				size,
				bounds,
				project,
				needsProjectionUpdate: this._needsProjectionUpdate,
			};

			this.options.render.call(this, this._canvas, params);
		}

		this._frame = null;
		this._needsProjectionUpdate = false;

		if (this.options.repeat) {
			this.redraw();
		}
	},

});

L.canvasLayer = function(options) {
	return new L.CanvasLayer(options);
};
