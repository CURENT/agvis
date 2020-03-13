L.ZoneLayer = L.LayerGroup.extend({
	initialize(options) {
		this._context = null;
		this._cache = new WeakMap();

		L.LayerGroup.prototype.initialize.call(this, options);
	},

	update(context) {
        if (!context) return;
		this._context = context;

        const SysParam = context.SysParam;
        if (!SysParam) return;
        const Bus = SysParam.Bus;

        let paramCache = this._cache.get(SysParam);
        if (!paramCache) {
            paramCache = {};
            this._cache.set(SysParam, paramCache);
        }

        //let { zoneCoords } = paramCache;

        let zoneCoords = [
            {
                name: "Zone A",
                color: "#8000FF",
                coords: new NDArray('C', [40, 2]);
            },
            {
                name: "Zone B",
                color: "#FF0080",
                coords: new NDArray('C', [50, 2]);
            },
        ];

        this.clearLayers();

        for (let zone in zoneCoords) {
            for (let i = 0; i < zone.coords.shape[0]; i++) {
                //const geojson = L.geoJSON(...);
                //geojson.addTo(this);
            }
        }
	}
});

L.zoneLayer = function(options) {
	return new L.ZoneLayer(options);
};
