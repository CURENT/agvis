class NDArray {
	constructor(order, shape, typedArray) {
		this.order = order;
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

	_makeIndex(index, strict) {
		const shape = this.shape;
		if (index.length !== shape.length) {
			throw 'bad index ' + index.length + ' !== ' + shape.length;
		}

		const len = index.length;
		let realIndex = 0;
		for (let i=0; i<len; ++i) {
			const shapeIndex = this.order === 'F' ? len-i-1 : i;
			const s = shape[shapeIndex];
			const j = index[shapeIndex];
			if (strict && j >= s) {
				throw 'bad index: index=' + index + ', shape=' + shape;
			}
			realIndex = realIndex * s + j;
		}

		return realIndex;
	}

	get(...index) {
		const realIndex = this._makeIndex(index, true);
		return this.typedArray[realIndex];
	}

	set(value, ...index) {
		const realIndex = this._makeIndex(index, true);
		this.typedArray[realIndex] = value;
	}

	column(n) {
		if (this.order !== 'F') {
			throw 'bad order, expected "' + this.order + '"';
		}
		const start = this._makeIndex([0, n], false);
		const end = this._makeIndex([0, n+1], false);
		//console.log({ start, end });
		return this.typedArray.slice(start, end);
	}

	row(n) {
		if (this.order !== 'C') {
			throw 'bad order, expected "' + this.order + '"';
		}
		const start = this._makeIndex([n, 0], false);
		const end = this._makeIndex([n+1, 0], false);
		//console.log({ start, end });
		return this.typedArray.slice(start, end);
	}

	extents() {
		if (this.shape[0] !== 1) {
			throw 'extents: expected column vector';
		}
		const typedArray = this.typedArray;
		let prev = typedArray[0];
		for (let i=1; i<typedArray.length; ++i) {
			const cur = typedArray[i];
			if (cur !== prev + 1) {
				throw 'extents: non contiguous';
			}
			prev = cur;
		}
		return { begin: typedArray[0], end: typedArray[typedArray.length - 1] + 1 };
	}

	subarray({ begin, end }) {
		return new NDArray(this.order, [1, end - begin - 1], this.typedArray.subarray(begin, end));
	}

	subindex(idx){
		if (this.shape[0] !== 1) {
			throw 'extents: expected column vector';
		}

		if (idx.shape[0] !== 1) {
			throw 'extents: expected column vector';
		}

		const out_values = new Float64Array(idx.shape[1]);

		for (let i=0; i<idx.typedArray.length; i++){
			const pos = idx.typedArray[i];
			out_values[i] = this.get(0, pos);
		}

		return new NDArray(this.order, [1, idx.shape[1]], out_values)
	}
}
