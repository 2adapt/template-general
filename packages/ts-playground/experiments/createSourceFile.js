import * as fs from "node:fs";
import path from "node:path";


// Copyright 2024 Bloomberg Finance L.P.
// Distributed under the terms of the Apache 2.0 license.

//import type * as ts from "typescript";
import tslib from "typescript";
//import BlankString from "./blank-string.js";
// const SK = tslib.SyntaxKind;

// These values must be 'falsey' to not stop TypeScript's walk
// const VISIT_BLANKED = "";
// const VISITED_JS = null;

// type VisitResult = typeof VISIT_BLANKED | typeof VISITED_JS;
// type ErrorCb = (n: ts.Node) => void;

const languageOptions = {
	// languageVersion: tslib.ScriptTarget.ESNext,
	// impliedNodeFormat: tslib.ModuleKind.ESNext,
	languageVersion: 99,
	impliedNodeFormat: 99,

};

const scanner = tslib.createScanner(99, /*skipTrivia: */ true, 0);
// if (tslib.JSDocParsingMode) {
// 	// TypeScript >= 5.3
// 	languageOptions.jsDocParsingMode = tslib.JSDocParsingMode.ParseNone;
// 	scanner.setJSDocParsingMode(tslib.JSDocParsingMode.ParseNone);
// }

// State is hoisted to module scope so we can avoid creating per-run closures
// let src = "";
// let str = new BlankString("");
// let ast: ts.SourceFile;
// let onError: ErrorCb | undefined;
// let seenJS = false;
// let parentStatement: ts.Node | undefined = undefined;

/**
 * @param input string containing TypeScript
 * @param onErrorArg callback when unsupported syntax is encountered
 * @returns the resulting JavaScript
 */

//const inputPathRel = "src/00-main.ts";
const inputPathRel = "src/02-not-ts.js";
const inputPathAbs = path.join(import.meta.dirname, '..', inputPathRel);
let srcOriginal = fs.readFileSync(inputPathAbs, { encoding: 'utf-8' });

console.log('<srcOriginal>')
console.log(srcOriginal)
console.log('</srcOriginal>')

//tslib.createSourceFile("input.ts", input, languageOptions, /* setParentNodes: */ false, tslib.ScriptKind.TS)
let src = tslib.createSourceFile("input.ts", srcOriginal, languageOptions, /* setParentNodes: */ false, 3);

console.log('<src>')
console.log(src)
console.log('</src>')


console.log('<src.statements>')
console.log(src.statements)
console.log('</src.statements>')
