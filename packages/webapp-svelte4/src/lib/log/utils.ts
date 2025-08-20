// reference: https://v8.dev/docs/stack-trace-api#customizing-stack-traces

type CallSite = {
	// these 2 are the ones we are most interested in; we might make some adjustments, but keep the original values
	functionName: string;
	fileName: string;

	// for reference we keep the respective original values
	functionNameOriginal: string | null | undefined;
	fileNameOriginal: string | null | undefined;

	// these 2 are useful, but might not correspond to the actual line/column numbers when using vite or similar tools
	lineNumber: number | null;
	columnNumber: number | null;

	// these don't seem to be usually available (?)
	// this: any;
	typeName: string | null | undefined;
	// function: any;
	methodName: string | null | undefined;
	evalOrigin: string | null | undefined;
	promiseIndex: any | null;
	isToplevel: boolean;
	isEval: boolean;
	isNative: boolean;
	isConstructor: boolean;
	isAsync: boolean;
	isPromiseAll: boolean;
};

type StackTrace = Array<CallSite>;

function fileNameReplacer(fileName: string | null, replacerList: Array<{ regex: RegExp; replacer: string }>) {
	if (fileName === null) {
		return '';
	}

	for (const { regex, replacer } of replacerList) {
		if (regex.test(fileName)) {
			return fileName.replace(regex, replacer);
		}
	}

	return fileName;
}

function wrapStringInColor(s: string, color: string) {
	return color + s + colorTable['reset'];
}

let colorTable = {
	reset: '\x1b[0m',
	// bold: "\x1b[1m",
	// dim: "\x1b[2m",
	// underscore: "\x1b[4m",
	// blink: "\x1b[5m",
	// reverse: "\x1b[7m",
	// hidden: "\x1b[8m",

	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
};

type ColorCode = keyof typeof colorTable;
// type ColorValue = typeof colorTable[keyof typeof colorTable];

function timestampFormatter(ts: Date | null, formatCode: 'long' | 'short') {
	if (ts === null) {
		return '';
	}

	let idxStart = formatCode === 'long' ? 0 : 11;
	let idxEnd = 23;

	return `${ts.toISOString().substring(idxStart, idxEnd)}`;
}

// taken from https://github.com/lukeed/klona/blob/master/src/json.js

function klona<T>(val: T): T {
	var k, out, tmp;

	if (Array.isArray(val)) {
		out = Array(k=val.length);
		while (k--) out[k] = (tmp=val[k]) && typeof tmp === 'object' ? klona(tmp) : tmp;
		return out;
	}

	if (Object.prototype.toString.call(val) === '[object Object]') {
		out = {}; // null
		for (k in val) {
			if (k === '__proto__') {
				Object.defineProperty(out, k, {
					value: klona(val[k]),
					configurable: true,
					enumerable: true,
					writable: true,
				});
			} else {
				out[k] = (tmp=val[k]) && typeof tmp === 'object' ? klona(tmp) : tmp;
			}
		}
		return out;
	}

	return val;
}

// taken from https://www.npmjs.com/package/stack-trace
// https://github.com/felixge/node-stack-trace/blob/master/index.js
// https://v8.dev/docs/stack-trace-api

// alternatives that might be more general:
// https://github.com/errwischt/stacktrace-parser/blob/master/src/stack-trace-parser.js
// https://github.com/csnover/TraceKit

function getStackTrace(
	_stackTraceLimit: number /*, fileNameReplacement: Array<FileNameReplacement>*/,
): StackTrace {
	const stackTraceLimitOriginal = Error.stackTraceLimit;
	const prepareStackTraceOriginal = Error.prepareStackTrace;

	Error.stackTraceLimit = _stackTraceLimit + 1;

	const dummyObject: { stack?: any } = {};
	Error.prepareStackTrace = function (dummyObject, v8StackTrace) {
		return v8StackTrace;
	};

	// adds a stack property to the given error object
	Error.captureStackTrace(dummyObject, getStackTrace);

	const v8StackTrace = dummyObject.stack;

	Error.stackTraceLimit = stackTraceLimitOriginal;
	Error.prepareStackTrace = prepareStackTraceOriginal;

	// return v8StackTrace;

	let stackTrace: StackTrace = [];

	for (let idx = 1; idx < v8StackTrace.length; idx++) {
		let callSiteOriginal = v8StackTrace[idx];
		let callSite: CallSite = {
			functionName: callSiteOriginal.getFunctionName(),
			fileName: callSiteOriginal.getFileName(),

			functionNameOriginal: callSiteOriginal.getFunctionName(),
			fileNameOriginal: callSiteOriginal.getFileName(),
			// this: callSiteOriginal.getThis(),
			typeName: callSiteOriginal.getTypeName(),
			// function: callSiteOriginal.getFunction(),
			methodName: callSiteOriginal.getMethodName(),
			lineNumber: callSiteOriginal.getLineNumber(),
			columnNumber: callSiteOriginal.getColumnNumber(),
			evalOrigin: callSiteOriginal.getEvalOrigin(),
			promiseIndex: callSiteOriginal.getPromiseIndex(),
			isToplevel: callSiteOriginal.isToplevel(),
			isEval: callSiteOriginal.isEval(),
			isNative: callSiteOriginal.isNative(),
			isConstructor: callSiteOriginal.isConstructor(),
			isAsync: callSiteOriginal.isAsync(),
			isPromiseAll: callSiteOriginal.isPromiseAll(),
		};

		if (callSite.functionName === null || callSite.functionName === undefined) {
			callSite.functionName = '<anonymous>';
		}

		// tweak for vite/sveltekit: the correct filename sometimes comes from evalOrigin;
		// this happens in +page.server.js files, where getFileName() will return undefined;

		if (callSite.fileName === null || callSite.fileName === undefined) {
			if (typeof callSite.evalOrigin === 'string') {
				callSite.fileName = callSite.evalOrigin;
			} else {
				callSite.fileName = '(missing fileName)';
			}
		}

		// tweak for vite/sveltekit: fileName might be something like this:
		// "http://localhost:5000/src/routes/+page.svelte?t=1733793578173"
		// this happens in +page.svelte files

		if (callSite.fileName.includes('?t=')) {
			callSite.fileName = callSite.fileName.split('?t=')[0];
		}

		stackTrace.push(callSite);
	}

	return stackTrace;
}

export { fileNameReplacer, wrapStringInColor, colorTable, timestampFormatter, klona, getStackTrace };
export type { ColorCode, StackTrace };
