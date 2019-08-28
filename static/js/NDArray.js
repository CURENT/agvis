class NDArray {
	constructor(shape, typedArray) {
		this.shape = shape;
		if (!typedArray) {
			let total = 1;
			for (let x of shape) {
				total *= x;
			}
			typedArray = new Float32Array(total);
		}
		this.typedArray = typedArray;
	}

	_makeIndex(index) {
		const shape = this.shape;
		if (index.length !== shape.length) {
			throw 'bad index ' + index.length + ' !== ' + shape.length;
		}

		const len = index.length;
		let realIndex = 0;
		for (let i=0; i<len; ++i) {
			const s = shape[len-i-1];
			const j = index[len-i-1];
			if (j >= s) {
				throw 'bad index: index=' + index + ', shape=' + shape;
			}
			realIndex = realIndex * s + j;
		}

		return realIndex;
	}

	get(...index) {
		const realIndex = this._makeIndex(index);
		return this.typedArray[realIndex];
	}

	set(value, ...index) {
		const realIndex = this._makeIndex(index);
		this.typedArray[realIndex] = value;
	}
}