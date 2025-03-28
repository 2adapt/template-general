import tsBlankSpace from "ts-blank-space";
import * as fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";


const srcDir = path.join(import.meta.dirname, '..', 'src');
const outDir = path.join(import.meta.dirname, '..', 'build-blank');
fs.mkdirSync(outDir, { recursive: true });

console.log({ srcDir, outDir })

/**
 * @param {string} filename
 */
function compile(dirent) {
	console.log({ dirent })
	let inputPathRelative = path.join(dirent.path.split(srcDir)[1], dirent.name);
	inputPathRelative = inputPathRelative.startsWith(path.sep) ? inputPathRelative.slice(1) : inputPathRelative;
	let inputPathAbsolute = path.join(srcDir, inputPathRelative)
	assert.equal(inputPathAbsolute, path.join(dirent.path, dirent.name), 'invalid path');

	console.log(`[ts-blank-space] compiling ${inputPathRelative}...`)
	let srcOriginal = fs.readFileSync(inputPathAbsolute, { encoding: 'utf-8' });
	console.log('<srcOriginal>')
	console.log(srcOriginal)
	console.log('</srcOriginal>')

	let srcBlank = tsBlankSpace(srcOriginal)
	console.log('<srcBlank>')
	console.log(srcBlank)
	console.log('</srcBlank>')


	let ouputPathAbsolute = path.join(outDir, inputPathRelative)
	console.log({ ouputPathAbsolute })

	let outputDirname = path.dirname(ouputPathAbsolute);
	fs.mkdirSync(outputDirname, { recursive: true });
	let outputFilename = dirent.name;
	if (outputFilename.endsWith(".ts")) {
		outputFilename = outputFilename.slice(0, -3) + '.js';
	}
	else if (outputFilename.endsWith(".js")) {
		// nothing to do
	}
	else {
		throw new Error('invalid extension')
	}

	// TODO: check if the file already exists; this could happen if we have file.ts and file.js

	fs.writeFileSync(path.join(outputDirname, outputFilename), srcBlank);
}

for (const dirent of fs.readdirSync(srcDir, { encoding: 'utf-8', withFileTypes: true, recursive: true})) {
	// better: use glob to match all files; try

	if (dirent.isFile() /*&& dirent.name.endsWith(".ts")*/) {
		// let includesPattern = '';
		// let includesPattern = '00-main';
		// let includesPattern = '02-not-ts';
		let includesPattern = '03-reexport';
		if (includesPattern === '' || dirent.name.includes(includesPattern)) {
			compile(dirent);
		}

	}
}