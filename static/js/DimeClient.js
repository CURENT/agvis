function pymatbridgeReviver(key, value) {
	//console.log(JSON.parse(JSON.stringify({ this: this, key, value })));
	if (value !== null && value.ndarray) {
		const buffer = base64arraybuffer.decode(value.data);
		const f64array = new Float64Array(buffer);
		const f32array = Float32Array.from(f64array);
		return new NDArray('F', value.shape, f32array);
	}
	return value;
};

const S_NAME = 0;
const S_VALUE = 1;

class DimeClient {
	constructor(url) {
		const ws = new WebSocket(url);

		let readyResolve, readyReject;
		const ready = new Promise((resolve, reject) => {
			readyResolve = resolve;
			readyReject = reject;
		});

		ws.addEventListener('open', () => {
			this._onopen();
		});

		ws.addEventListener('message', (msg) => {
			this._onmessage(msg);
		});

		const syncResolve = null, syncReject = null;

		const syncState = S_NAME;
		const syncName = null, syncValue = null;

		Object.assign(this, {
			ws,
			ready,
			readyResolve,
			readyReject,
			syncResolve,
			syncReject,
			syncState,
			syncName,
			syncValue,
		});
	}

	_onopen() {
		const { readyResolve } = this;
		readyResolve(this);
	}

	_onmessage(msg) {
		const { syncState, syncName, syncValue } = this;
		if (syncState === S_NAME) {
			const syncName = msg.data;
			Object.assign(this, {
				syncName,
				syncState: S_VALUE,
			});
		} else if (syncState === S_VALUE) {
			const syncValue = JSON.parse(msg.data, pymatbridgeReviver);
			Object.assign(this, {
				syncValue,
				syncState: S_NAME,
			});

			this.syncResolve({
				name: syncName,
				value: syncValue,
			});
		}
	}

	sync() {
		return new Promise((resolve, reject) => {
			Object.assign(this, {
				syncResolve: resolve,
				syncReject: reject,
			});
		});
	}

	send_var(target, name, value) {
		const { ws } = this;
		ws.send(name);
		ws.send(target);
		//console.log({ target, name, value });
		ws.send(JSON.stringify(value));
	}

	close() {
		const { ws } = this;
		ws.close();
	}
};
