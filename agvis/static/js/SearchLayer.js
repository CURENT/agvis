L.SearchLayer = L.LayerGroup.extend({
	initialize(options) {
		this._context = null;
		this._cache = new WeakMap();
        this._needs_update = true;

		L.LayerGroup.prototype.initialize.call(this, options);

        this.control = new L.Control.Search({
            layer: this,
            initial: false,
            zoom: 12,
            marker: false
        });
	},

	update(context, win) {
		
		if (win.multilayer.length > 0) {
		
			this.clearLayers();
			
			for (let i = 0; i < win.multilayer.length; i++) {
				
				let mlayer = win.multilayer[i];
				
				if (mlayer == null) {
					
					continue;
				}
				
				if (!mlayer.topo._render) {					
					
					continue;
				}
				
				for (let j = 0; j < mlayer.data.Bus.idx.length; j++) {
					
					
					const lat = mlayer.data.Bus.ycoord[j];
					const lng = mlayer.data.Bus.xcoord[j];
					const idx = mlayer.data.Bus.idx[j];
					const title = mlayer.data.Bus.name[j];

					const coords = new L.latLng(lat, lng);
					let marker = new L.Marker(coords, {icon: L.divIcon(), opacity: 0, title: mlayer.name + ": " + idx + ", " + title});
					
					this.addLayer(marker);
				}
			}
		}
		
		
        if (!this._needs_update) {
            return;
        }

        if (!context) {
            return;
        }

		this._context = context;

        const SysParam = context.SysParam;
        if (!SysParam) {
            return;
        }

        let paramCache = this._cache.get(SysParam);
        if (!paramCache) {
            paramCache = {};
            this._cache.set(SysParam, paramCache);
        } else {
            return;
        }

        const Bus = SysParam.Bus;

        
		if (win.multilayer.length == 0) {
			
			this.clearLayers();
		}

        for (let i = 0; i < Bus.idx.length; i++) {
			const lat = Bus.ycoord[i];
			const lng = Bus.xcoord[i];
			const idx = Bus.idx[i];
			const title = Bus.name[i];

            const coords = new L.latLng(lat, lng);
            let marker = new L.Marker(coords, {icon: L.divIcon(), opacity: 0, title: idx + ", " + title});

            this.addLayer(marker);
        }

        this._needs_update = (Bus.idx.length > 0);
	}
});

L.searchLayer = function(options) {
    return new L.SearchLayer(options);
}

/*
	//sample data values for populate map
	var data = [
		{"loc":[41.575330,13.102411], "title":"aquamarine"},
		{"loc":[41.575730,13.002411], "title":"black"},
		{"loc":[41.807149,13.162994], "title":"blue"},
		{"loc":[41.507149,13.172994], "title":"chocolate"},
		{"loc":[41.847149,14.132994], "title":"coral"},
		{"loc":[41.219190,13.062145], "title":"cyan"},
		{"loc":[41.344190,13.242145], "title":"darkblue"},
		{"loc":[41.679190,13.122145], "title":"Darkred"},
		{"loc":[41.329190,13.192145], "title":"Darkgray"},
		{"loc":[41.379290,13.122545], "title":"dodgerblue"},
		{"loc":[41.409190,13.362145], "title":"gray"},
		{"loc":[41.794008,12.583884], "title":"green"},
		{"loc":[41.805008,12.982884], "title":"greenyellow"},
		{"loc":[41.536175,13.273590], "title":"red"},
		{"loc":[41.516175,13.373590], "title":"rosybrown"},
		{"loc":[41.506175,13.273590], "title":"royalblue"},
		{"loc":[41.836175,13.673590], "title":"salmon"},
		{"loc":[41.796175,13.570590], "title":"seagreen"},
		{"loc":[41.436175,13.573590], "title":"seashell"},
		{"loc":[41.336175,13.973590], "title":"silver"},
		{"loc":[41.236175,13.273590], "title":"skyblue"},
		{"loc":[41.546175,13.473590], "title":"yellow"},
		{"loc":[41.239190,13.032145], "title":"white"}
	];

	var map = new L.Map('map', {zoom: 9, center: new L.latLng(data[0].loc) });	//set center from first location

	map.addLayer(new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));	//base layer

	var markersLayer = new L.LayerGroup();	//layer contain searched elements

	map.addLayer(markersLayer);

	var controlSearch = new L.Control.Search({
		position:'topright',
		layer: markersLayer,
		initial: false,
		zoom: 12,
		marker: false
	});

	map.addControl( controlSearch );

	////////////populate map with markers from sample data
	for(i in data) {
		var title = data[i].title,	//value searched
			loc = data[i].loc,		//position found
			marker = new L.Marker(new L.latLng(loc), {title: title} );//se property searched
		marker.bindPopup('title: '+ title );
		markersLayer.addLayer(marker);
	}
*/
