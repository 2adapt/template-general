import type { ColorCode, StackTrace } from './utils.ts';
import { colorTable, fileNameReplacer, wrapStringInColor, timestampFormatter, klona, getStackTrace } from './utils.ts';

type LoggerOptions = {
	active: boolean;
	name: string | null;
	messageArg: 'first' | 'last' | null;
	stackTraceLimit: number;
	// argSeparator: string | null;
	colors: [string, string] | string | null;
	headerFormat: (header: Header) => string;
	footerFormat: (header: Header) => string;
	clone: (val: any) => any;
	// replaceOriginal: boolean;
	mode: 'header' | 'console.log' | 'console.trace'
};

type Header = {
	timestamp: Date | null;
	duration: number | null;
	name: string | null;
	message: string | null;
	// location: string | null;
	// fileName: string | null;
	// functionName: string | null;
	// lineNumber: number | null;
	// columnNumber: number | null;
	stackTrace: StackTrace;
};

const argSeparator = '\n';
// const originalLog: (...args: any[]) => void = console.log;

function createLogger(initialOptions: Partial<LoggerOptions> = {}) {
	let defaultOptions: LoggerOptions = {
		active: true,
		name: null,
		messageArg: 'first',
		stackTraceLimit: 10, // set to 0 to disable
		// argSeparator: null,
		colors: ['blue', 'red'],
		headerFormat: (header: Header) => `${JSON.stringify(header)}`,
		footerFormat: (header: Header) => '',
		clone: (val: any) => klona(val),
		// replaceOriginal: false
		mode: 'console.log'
	};

	let finalOptions: LoggerOptions = Object.assign({}, defaultOptions, initialOptions);

	// if (!Array.isArray(finalOptions.fileNameReplacement)) {
	// 	finalOptions.fileNameReplacement = [finalOptions.fileNameReplacement];
	// }

	let previousTs: Date = new Date();

	let log: (...args: any[]) => string | StackTrace;
	log = function log(...args: Array<any>) {

		let stackTrace: StackTrace = [];

		if (!finalOptions.active) {
			return stackTrace;
		}

		let currentTs = new Date();
		let duration = currentTs.getTime() - previousTs.getTime();
		previousTs = currentTs;

		let header: Header = {
			timestamp: currentTs,
			duration: duration,
			name: null,
			message: null,
			// location: null,
			// fileName: null,
			// functionName: null,
			// lineNumber: null,
			// columnNumber: null,
			stackTrace: []
		};

		// 1 - name

		if (finalOptions.name != null) {
			if (finalOptions.name.trim() !== '') {
				header.name = finalOptions.name;
			}
		}

		// 2 - check for the message and remove it from args

		if (finalOptions.messageArg != null) {
			let idx: number;

			switch (finalOptions.messageArg) {
				case 'first':
					idx = 0;
					break;
				case 'last':
					idx = args.length - 1;
					break;
			}

			if (typeof args[idx] === 'string' && args[idx].trim() !== '') {
				header.message = args[idx];
				args.splice(idx, 1);
			}
		}

		// 5 - process stack trace

		if (finalOptions.stackTraceLimit > 0) {
			// assertArrayOfFileNameReplacement(finalOptions.fileNameReplacement);
			stackTrace = getStackTrace(finalOptions.stackTraceLimit /*, finalOptions.fileNameReplacement*/);
			//header.location = `at ${stackTrace[0].functionName} (${stackTrace[0].fileName}:${stackTrace[0].lineNumber})`;

			// header.fileName = stackTrace[0].fileName;
			// header.functionName = stackTrace[0].functionName;
			// header.lineNumber = stackTrace[0].lineNumber;
			// header.columnNumber = stackTrace[0].columnNumber;
			header.stackTrace = stackTrace;
		}

		// 6 - detect if we are logging error values
		// if one of the args is an error, the log message will always have the error message;
		// we also detect if arg is an object and one of the values is an error (at the top level of the obj)

		let errMessage: string | null = null;

		for (let arg of args) {
			if (arg instanceof Error) {
				errMessage = arg.toString();
				break;
			} else if (typeof arg === 'object') {
				for (let [_, val] of Object.entries(arg)) {
					if (val instanceof Error) {
						errMessage = val.toString();
						break;
					}
				}
			}
		}

		// if we have an error message, always add it to the start of the message

		if (typeof errMessage === 'string') {
			if (errMessage.startsWith('Error:')) {
				// show upper case here
				errMessage = 'ERROR:' + errMessage.slice(6);
			}

			if (typeof header.message === 'string') {
				header.message = errMessage + ', ' + header.message;
			} else {
				header.message = errMessage;
			}
		}

		// 7 - color

		let color: string | null = null;

		if (finalOptions.colors !== null) {
			if (Array.isArray(finalOptions.colors)) {
				let color0 = finalOptions.colors[0] as ColorCode;
				finalOptions.colors[0] = color0.startsWith('\x1b') ? color0 : colorTable[color0];

				let color1 = finalOptions.colors[1] as ColorCode;
				finalOptions.colors[1] = color1.startsWith('\x1b') ? color1 : colorTable[color1];
			} else {
				let color0 = finalOptions.colors as ColorCode;
				finalOptions.colors = color0.startsWith('\x1b') ? [color0, color0] : [colorTable[color0], colorTable[color0]];
			}

			color = typeof errMessage === 'string' ? finalOptions.colors[1] : finalOptions.colors[0];
			// colorReset = colorTable['reset'];
		}

		// 8 - create the final array for console.log

		let finalArray: Array<any> = [];
		let headerStr = finalOptions.headerFormat(header);
		// console.log('headerStr', headerStr)

		if (headerStr !== '') {
			if (color !== null) {
				headerStr = wrapStringInColor(headerStr, color);
			}
			// console.log('headerStr', headerStr)

			finalArray.push(headerStr);
			finalArray.push(argSeparator);
		}

		for (let idx = 0; idx < args.length; idx += 1) {
			finalArray.push(finalOptions.clone(args[idx]));
			finalArray.push(argSeparator);
		}

		let footerStr = finalOptions.footerFormat(header);

		if (footerStr !== '') {
			// footer color won't work in browser's devtool

			// if (color !== null) {
			// 	footerStr = wrapStringInColor(footerStr, color);
			// }

			finalArray.push(footerStr);
			finalArray.push(argSeparator);
		}

		finalArray.pop();

		switch(finalOptions.mode) {
			case 'console.log':
				console.log(...finalArray);
				return stackTrace;
			case 'console.trace':
				console.log(...finalArray);
				return stackTrace;
			case 'header':
				return finalArray[0] as string;
		}

	};

	return log;
}



let replacerList = [
	{ regex: /.*\/src\/(.+)$/, replacer: 'src/$1' },
	// { regex: /.*\/node_modules\/(.+)$/, replacer: 'node_modules/$1' }
];

let log = createLogger({
	// active: false,
	name: 'name',
	//detectInlineMessage: 'start',
	//stackTraceLimit: 10,
	//colors: ['blue', 'red'],
	headerFormat: (header: Header) => {

		let { message, timestamp, duration, stackTrace } = header;
		// let timestampISO = timestampFormatter(timestamp, 'short');
		// let { functionName, fileName, lineNumber } = stackTrace[0];

		let headerStr = '';
		//headerStr += `[${message}; ${timestampISO} (${duration}ms)]`
		headerStr += `[${message}; ${duration}ms]`

		for (let callSite of stackTrace) {

			let { functionName, fileName, lineNumber } = callSite;

			if (fileName.includes('node_modules/.vite/deps/')) {
				break;
			}

			headerStr += `\n    at ${functionName} (${fileNameReplacer(fileName, replacerList)}:${lineNumber})`;
		}

		headerStr += `\n`;

		return headerStr;
	},
	footerFormat: function (header: Header) {

		let isNodejs = typeof process === 'object' && typeof process.pid === 'number';
		let separator = '————————————————————————————————————————————————————————————————————————————————';

		return isNodejs ? separator : '';
	},
	mode: 'header'
});




export { createLogger, log };