/* ***********************************************************************************
 * File Name:   CanvasLayer.js
 * Authors:     Nicholas West, Nicholas Parsley
 * Date:        9/15/2023 (last modified)
 * 
 * Description: CanvasLayer class. The CanvasLayer is an intermediary class, extending 
 * 				from Leaflet’s Layer class and being extended from by most of the other 
 * 				Layer-type classes in AGVis.Contains basic functions for rendering, 
 * 				removing, and adding layers to the map.
 * ***********************************************************************************/

L.CanvasLayer = L.Layer.extend({

	options: {
		render() {
			console.warn('Using default render function');
		},
		repeat: false,
	},

	/**
	 * Initializes the canvas layer with options
	 * 
	 * @memberof CanvasLayer
	 * @param   {Object} options 
	 * @returns
	 */
	initialize(options) {
		L.Util.setOptions(this, options);
	},

	/**
	 * Creates the canvas element and appends it to the map.
	 * Establishes how resizing works for the Layer.
	 * 
	 * @memberof CanvasLayer
	 * @param   {Object} map
	 * @returns
	 */
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

	/**
	 * Redraws the canvas layer
	 *
	 * @memberof CanvasLayer
	 * @returns
	 */
	redraw() {
		if (!this._frame) {
			this._frame = L.Util.requestAnimFrame(this._redraw, this);
		}
		return this;
	},

	/**
	 * Clean up for the canvas layer
	 * 
	 * @memberof CanvasLayer
	 * @param   {Object} map
	 * @returns
	 */
	onRemove(map) {
		this._map.getPane('overlayPane').removeChild(this._canvas);

		map.off('moveend', this._reset, this);
		map.off('resize', this._resize, this);

		this._canvas = null;
		this._map = null;
	},

	/**
	 * Adds the canvas layer to the map
	 * 
	 * @memberof CanvasLayer
	 * @param   {Object} map
	 * @returns {Object} CanvasLayer object
	 */
	addTo(map) {
		map.addLayer(this);
		return this;
	},

	/**
	 * Resizes the canvas layer from a resize event
	 * 
	 * @memberof CanvasLayer
	 * @param   {Object} resizeEvent
	 * @returns
	 */
	_resize(resizeEvent) {
		this._canvas.width = this._map.getSize().x;
		this._canvas.height = this._map.getSize().y;
	},

	/**
	 * Initially starts drawing the Layer. Sets the position of the canvas 
	 * and requests a projection update.
	 * 
	 * @memberof CanvasLayer
	 * @returns
	 */
	_reset() {
		var topLeft = this._map.containerPointToLayerPoint([0, 0]);
		L.DomUtil.setPosition(this._canvas, topLeft);
		this._needsProjectionUpdate = true;
		this.redraw();
	},

	/**
	 * Calls the rendering function for a given Layer if it has one. 
	 * Sets up the variables mentioned above that are passed to the Topology-type 
	 * and Contour-type Layers.
	 * 
	 * @memberof CanvasLayer
	 * @returns
	 */
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
