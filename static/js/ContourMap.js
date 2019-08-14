class ContourMap extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({ mode: 'open' });

		const style = document.createElement('style');
		shadow.appendChild(style);

		const canvas = document.createElement('canvas');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		shadow.appendChild(canvas);

		const ctx = canvas.getContext('2d');

		const usGeoJson = null;
		const bounds = {
			lat: { min: -178.123152, max: 173.304726 },
			lng: { min: 17.929556, max: 71.351633 },
		};

		Object.assign(this, {
			shadow,
			style,
			canvas,
			ctx,
			usGeoJson,
			bounds,
		});
	}

	connectedCallback() {
		const { usGeoJson } = this;

		if (usGeoJson === null) {
			fetch('/static/us-states.json').then((r) => r.json()).then((usGeoJson) => {
				Object.assign(this, {
					usGeoJson,
				});
				this.redraw();
			});
		} else {
			this.redraw();
		}
	}

	redraw() {
		const { canvas, ctx, usGeoJson, bounds } = this;
		
		ctx.resetTransform();
		ctx.transform(1, 0, 0, -1, 0, +canvas.height);
		ctx.transform(+canvas.width, 0, 0, +canvas.height, 0, 0);
		ctx.transform(1. / (bounds.lat.max - bounds.lat.min), 0, 0, 1. / (bounds.lng.max - bounds.lng.min), 0, 0);
		ctx.transform(1, 0, 0, 1, -bounds.lat.min, -bounds.lng.min);

		const { features } = usGeoJson;
		for (let feature of features) {
			const { type } = feature;
			console.log('feature.type', type);
			if (type === 'Feature') {
				const { geometry } = feature;
				const { type } = geometry;
				console.log('geometry.type', type);
				if (type === 'Polygon') {
					const { coordinates } = geometry;
					for (let path of coordinates) {
						let first = null;
						ctx.beginPath();
						for (let [lat, lng] of path) {
							if (first === null) {
								first = { lat, lng };
								ctx.moveTo(lat, lng);
							} else {
								ctx.lineTo(lat, lng);
							}
						}
						ctx.lineTo(first.lat, first.lng);
						ctx.stroke();
					}

				} else if (type === 'MultiPolygon') {
					const { coordinates } = geometry;
					for (let paths of coordinates) {
						let first = null;
						for (let path of paths) {
							ctx.beginPath();
							for (let [lat, lng] of path) {
								if (first === null) {
									first = { lat, lng };
									ctx.moveTo(lat, lng);
								} else {
									ctx.lineTo(lat, lng);
								}
							}
							ctx.lineTo(first.lat, first.lng);
							ctx.stroke();
						}
					}
				} else {
					throw 'bad geometry type: ' + type;
				}
			} else {
				throw 'bad feature type: ' + type;
			}
		}
	}
};

customElements.define('contour-map', ContourMap);

