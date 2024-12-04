import tsBlankSpace from "ts-blank-space";
import * as fs from "node:fs";
import { join, dirname, sep } from "node:path";
import assert from "node:assert/strict";


const srcDir = join(import.meta.dirname, "src");
const outDir = join(import.meta.dirname, "build2");
fs.mkdirSync(outDir, { recursive: true });

console.log({ srcDir, outDir })

/**
 * @param {string} filename
 */
function compile(dirent) {
	// console.log({ dirent })
	let inputPathRelative = join(dirent.path.split(srcDir)[1], dirent.name);
	inputPathRelative = inputPathRelative.startsWith(sep) ? inputPathRelative.slice(1) : inputPathRelative;
	let inputPathAbsolute = join(srcDir, inputPathRelative)
	assert.equal(inputPathAbsolute, join(dirent.path, dirent.name), 'invalid path');

	console.log(`[ts-blank-space] compiling ${inputPathRelative}...`)
	let srcOriginal = fs.readFileSync(inputPathAbsolute, { encoding: 'utf-8' });
	let srcStripped = tsBlankSpace(srcOriginal)
	// console.log({ input })

	let ouputPathAbsolute = join(outDir, inputPathRelative)
	// console.log({ ouputPathAbsolute })

	fs.mkdirSync(dirname(ouputPathAbsolute), { recursive: true });
	fs.writeFileSync(ouputPathAbsolute.replace(/\.ts$/, ".js"), srcStripped);
}

for (const dirent of fs.readdirSync(srcDir, { encoding: 'utf-8', withFileTypes: true, recursive: true})) {
	// better: use glob to match all files; try
	if (dirent.isFile() && dirent.name.endsWith(".ts")) {
		compile(dirent);
	}
}