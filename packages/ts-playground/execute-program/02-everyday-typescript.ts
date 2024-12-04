/****************************************************************/
/* 2 - descriminated unions */
/****************************************************************/

/*
type StartedCourse = {
	isStarted: true
	name: string,
	lastVisitedAt: Date,
	startedAt: Date,
};

type UnstartedCourse = {
	isStarted: false
	name: string,
	lastVisitedAt: Date,
};

// typescript will infer which of these 2 types will be used;
// the isStarted is a bit like a "primary key"

const course: StartedCourse | UnstartedCourse = {
	isStarted: false,
	name: '...',
	lastVisitedAt: new Date(),
};

const course2: StartedCourse | UnstartedCourse = {
	isStarted: true,
	name: '...',
	lastVisitedAt: new Date(),
	startedAt: new Date,
};

let result = course;
let result2 = course2;
console.log({ result });
console.log({ result2 });


*/

/****************************************************************/
/* 2 - descriminated unions with type intersection */
/****************************************************************/

// this is the same as before, but we move the common properties to a shared type (BaseCourse)
// and create the previous types using Type Intersection (&)

/*
type BaseCourse = {
	name: string,
	lastVisitedAt: Date,
}

type StartedCourse = BaseCourse & {
	isStarted: true
	startedAt: Date,
};

type UnstartedCourse = BaseCourse & {
	isStarted: false
};

// typescript will infer which of these 2 types will be used;
// the isStarted is a bit like a "primary key"

const course: StartedCourse | UnstartedCourse = {
	isStarted: false,
	name: '...',
	lastVisitedAt: new Date(),
};

const course2: StartedCourse | UnstartedCourse = {
	isStarted: true,
	name: '...',
	lastVisitedAt: new Date(),
	startedAt: new Date,
};

let result = course;
let result2 = course2;
console.log({ result });
console.log({ result2 });
*/

/****************************************************************/
/* 2 - error handling with discriminated unions */
/****************************************************************/

/*
type ConversionSucceeded = {
	kind: 'success'
	value: number
};

type ConversionFailed = {
	kind: 'failure'
	reason: string
};


function safeNumber(str: string): ConversionSucceeded | ConversionFailed {
	const n: number = Number(str);
	if (Number.isNaN(n)) {
		return {kind: 'failure', reason: 'conversion returned a NaN'};
	} else {
		return {kind: 'success', value: n};
	}
}

let result = safeNumber('1.2');
console.log({ result })

// this will not work! "Property 'value' does not exist on type 'ConversionSucceeded | ConversionFailed'"

// if (result.value != null) {
// 	let result3 = result.value + 1;
// 	console.log({ result3 })
// }

// to use the value property, we must use a conditional which checks on the "primary key"!

if (result.kind === 'success') {
	let result2 = result.value + 1;
	console.log({ result2 })
}
*/

/****************************************************************/
/* 2 - "Safe Array Access" with discriminated union */
/****************************************************************/

/*
type T1 = {kind: 'failure', reason: 'array is empty'};
type T2 = {kind: 'failure', reason: 'no element at that index'};
type T3 = {kind: 'success', value: any}

function elemAt<T>(input: Array<T>, idx: number): T1 | T2 | T3 {


	if (input.length === 0) {
		return {kind: 'failure', reason: 'array is empty'}
	}

	if (idx < 0 || idx >= input.length) {
		return {kind: 'failure', reason: 'no element at that index'}
	}

	return {kind: 'success', value: input[idx]}
}

let result = elemAt([1, 2, 3], 1);
console.log({ result })
*/

/****************************************************************/
/* 2 - type narrowing with logical operators && and || */
/****************************************************************/

// In JavaScript and TypeScript, "&&" works on any value (not only boolean)
// the "falsey" values are these 6: false, 0, '', undefined, null, NaN;

// behavior of the "&&" logical operator
// - returns the first falsey value that it finds;
// - if it can't find a falsey (that is, both values are truthy), then returns the second value.

// similar for "||":
// - returns the first truthy value it finds;
// - if it can't find a truthy (that is, both values are falsey), then returns the second value;
// - particular case: if the first value is null or undefined, will return the second value

// to handle this particular case we have the "??" operator

// using "&&", "||" and "??" is safer in TypeScript than in JavaScript because the compiler can catch mistakes.


/*
type T1 = { kind: 'failure' };
type T2 = { kind: 'success', value: number };

function safeSqrt(n: number): T1 | T2 {
	let value = Math.sqrt(n);
	//let out1: T1 = { kind: 'failure' };
	//let out = Number.isNaN(value) ?  : { kind: 'success', value }
	//return out
	if (Number.isNaN(value)) {
		let out1: T1 = { kind: 'failure' };
		return out1;
	}

	let out2: T2 = { kind: 'success', value };
	return out2;



}

*/



/****************************************************************/
/* 2 - Union types and exhaustiveness checking
/****************************************************************/

// Some TypeScript features look esoteric but are actually important. This is one of those features!
// Type unions are useful. But a union isn't useful unless you actually unpack it somewhere by running ' +
// 'different code for the different cases, like User | Cat | Dog. Each time we unpack a union, ' +
// 'there's a chance we'll forget to handle a case.

/*

type Dog = {kind: 'dog'};
type Cat = {kind: 'cat'};
type Horse = {kind: 'horse'};
type Animal = Dog | Cat | Horse;

// works with switch...

function species(animal: Animal): string {
	let { kind } = animal;

	switch (kind) {
		case 'dog':
			return 'canis familiaris';
		case 'cat':
			return 'felis catus';
		case 'horse':
			return 'equus ferus caballus';
	}
}

// but doesn't work with if-else if???

// function species(animal: Animal): string {
// 	let { kind } = animal;
//
// 	if (kind === 'dog') {
// 		return 'canis familiaris';
// 	}
// 	else if (kind === 'cat') {
// 		return 'felis catus';
// 	}
// 	else if (kind === 'horse') {
// 		return 'equus ferus caballus';
// 	}
// }


let result = [
	species({kind: 'dog'}),
	species({kind: 'cat'}),
	species({kind: 'horse'}),
];

console.log({ result });
*/



// function callFunction(f: (x: string) => number) {
// 	return f('10');
// }
//
// let result = callFunction(
// 	x => Number(x) + 1
// );
//
// console.log({ result });



/****************************************************************/
/* 2 - Examples of unsoundness
/****************************************************************/

// const names: string[] = ['Amir', 'Betty'];
// const name: string = names[2];
// let result = name;
//
// console.log({ result });



/****************************************************************/
/* 2 - The "void" type
/****************************************************************/

// The void type indicates no value at all;
// but we can create a variable of type void; . It can only hold the value undefined.

function f() {
}

const n: void = f();
