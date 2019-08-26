const S_START = 0;
const S_SIMPLE = 1;
const S_ERROR = 2;
const S_INT = 3;
const S_BULK = 4;
const S_ARRAY = 5;
const T_PLUS = '+'.charCodeAt(0);
const T_MINUS = '-'.charCodeAt(0);
const T_COLON = ':'.charCodeAt(0);
const T_DOLLAR = '$'.charCodeAt(0);
const T_STAR = '*'.charCodeAt(0);
const T_ZERO = '0'.charCodeAt(0);
const T_CR = '\r'.charCodeAt(0);
const T_NL = '\n'.charCodeAt(0);

async function* RESP(response) {
	const reader = response.body.getReader();
	const decoder = new TextDecoder('utf-8');
	let data = '';
	let state = S_START;
	let start;
	let end;

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			console.log('done');
			return;
		}
		console.log(value);
		let view = value;
		while (view.length > 0) {
			const i = view.indexOf(T_NL);
			if (i === -1) {
				decoder.decode(view, { stream: true });
				break;
			}

			const line = decoder.decode(view.subarray(0, i+1));
			view = view.subarray(i+1);

			const control = line.substring(0, 1);
			const rest = line.substring(1).substring(0, line.length-3);
			switch (control) {
			case '+':
				yield { type: 'simple', value: rest };
				break;
			case '-':
				yield { type: 'error', value: rest };
				break;
			case ':':
				yield { type: 'int', value: +rest };
				break;
			case '$':
				const len = +rest;
				if (len === -1) {
					throw 'notimpl';
				} else if (view.length >= len+2) {
					const value = view.subarray(0, len);
					view = view.subarray(len+2);
					yield { type: 'bulk', value };
				} else {
					for (;;) {
						const { done, value } = await reader.read();
						if (done) {
							throw 'done?';
						}
						console.log({ value });
					}
				}
				break;
			case '*':
				throw 'not impl';
				break;
			default:
				throw 'unknown control: "' + control + '"';
				break;
			}
		}

		/*
		for (let i=0; i<value.length; ++i)
		switch (state) {
		case S_START:
			switch (value[i]) {
			case T_PLUS: state = S_SIMPLE; break;
			case T_MINUS: state = S_ERROR; break;
			case T_COLON: state = S_INT; break;
			case T_DOLLAR: state = S_BULK; break;
			case T_STAR: state = S_ARRAY; break;
			default:
				throw 'bad start char: ' + value[i];
			}
			break;
		case S_SIMPLE:
			switch (value[i]) {
			case T_CR: 
			case T_NL:
				break;
			default:
				break;
			}
			break;
		default:
			throw 'unknown state: ' + state;
			break;
		}
		continue;
		*/

		/*
		data += decoder.decode(value);
		while (true) {
			const index = data.indexOf('\n');
			if (index === -1) break;
			const line = data.substring(0, index);
			yield line;
			data = data.substring(index + 1);
		}
		*/
	}
}
