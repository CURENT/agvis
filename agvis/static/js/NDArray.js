/* ****************************************************************************************
 * File Name:   NDArray.js
 * Authors:     Nicholas West, Nicholas Parsly (Comments by Zack Malkmus)
 * Date:        9/21/2023 (last modified)
 * 
 * Description: This JavaScript file defines a class called NDArray, which represents
 *              a multidimensional array with various methods for manipulation. It
 *              supports both row-major ('C') and column-major ('F') storage orders.
 * 
 * Warning:     I did not write create this file, and there was no documentation left 
 * 			    behind by the creator(s). As such, some of the developer comments may be
 * 				incorrect. I have also left out specifying typing as I am unfamiliar with
 * 				the NDArray class structure.
 * 
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/?badge=stable
 * ****************************************************************************************/

class NDArray {
	/**
	 * Creates an NDArray class object with the specified order and shape.
	 * 
	 * @constructs NDArray
	 * 
	 * @param {*} order      - Storage Order
	 * @param {*} shape      - Array Dimensions
	 * @param {*} typedArray - (Optional)
	 */
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
		this.array = typedArray;
	}

	/**
	 * Calculates real index from the given index based on the storage order
	 * 
	 * @memberof NDArray
	 * @param    {*} index 
	 * @param    {*} strict 
	 * @returns  {*}
	 */
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

	/**
	 * Grabs the value at the current index
	 * 
	 * @memberof NDArray
	 * @param    {*} index 
	 * @returns  {*}
	 */
	get(...index) {
		const realIndex = this._makeIndex(index, true);
		return this.array[realIndex];
	}

	/**
	 * Set the given value to the supplied index.
	 * 
	 * @memberof NDArray
	 * @param    {*} value 
	 * @param    {*} index 
	 */
	set(value, ...index) {
		const realIndex = this._makeIndex(index, true);
		this.array[realIndex] = value;
	}

	/**
	 * Retrieves a column from the NDArray (only applicable for column-major storage).
	 * 
	 * @memberof NDArray
	 * @param    {*} n - The column number to retrieve
	 * @returns  {*}   - The nth column of the NDArray
	 */
	column(n) {
		if (this.order !== 'F') {
			throw 'bad order, expected "' + this.order + '"';
		}
		const start = this._makeIndex([0, n], false);
		const end = this._makeIndex([0, n+1], false);
		//console.log({ start, end });
		return this.array.slice(start, end);
	}

	/**
	 * Retrieves a row from the NDArray (only applicable for row-major storage).
	 * 
	 * @memberof NDArray
	 * @param    {*} n - The row number to retrieve
	 * @returns  {*}   - The nth row of the NDArray
	 */
	row(n) {
		if (this.order !== 'C') {
			throw 'bad order, expected "' + this.order + '"';
		}
		const start = this._makeIndex([n, 0], false);
		const end = this._makeIndex([n+1, 0], false);
		//console.log({ start, end });
		return this.array.slice(start, end);
	}

	/**
	 * Checks if the NDArray represents a column vector and calculates its extents.
	 * !I'm not entirely sure what this one is used for.
	 * 
	 * @memberof NDArray
	 * @returns {*} - New NDArray representing the subarray
	 */
	extents() {
		if (this.shape[0] !== 1) {
			throw 'extents: expected column vector';
		}
		const typedArray = this.array;
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

	/**
	 * Create a new subarray from begin to end
	 * 
	 * @memberof NDArray
	 * @param    {*} begin - Starting index
	 * @param    {*} end   - Final index
	 * @returns  {NDArray} - New subarray
	 */
	subarray({ begin, end }) {
		return new NDArray(this.order, [1, end - begin - 1], this.array.subarray(begin, end));
	}

	/**
	 * Retrieves values from the NDArray based on an input index array
	 * 
	 * @memberof NDArray
	 * @param    {NDArray} idx - NDArray representing the indices to retrieve
	 * @returns  {NDArray}     - New NDArray containing values at the specified indices
	 */
	subindex(idx){
		if (this.shape[0] !== 1) {
			throw 'extents: expected column vector';
		}

		if (idx.shape[0] !== 1) {
			throw 'extents: expected column vector';
		}

		const out_values = new Float64Array(idx.shape[1]);

		for (let i=0; i<idx.array.length; i++){
			const pos = idx.array[i];
			out_values[i] = this.get(0, pos);
		}

		return new NDArray(this.order, [1, idx.shape[1]], out_values)
	}
}
