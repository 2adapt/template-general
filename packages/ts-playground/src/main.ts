// comment 0...
//import type { User2 } from './subdir/the-module.js';
//import { PI, now } from './subdir/the-module.ts';


import type { User2 } from './subdir/the-module.js';
import { PI, now } from './subdir/the-module.js';

// comment 1...
type User = {
	name: string;
	age: number;
};

// comment 2...
function isAdult(user: User): boolean {
	return user.age >= 18;
}

// comment 3...
let fn = () => 123;

// comment 4...
class Cat<T> {
	public whiskers: number;
	public tail: T;

	foo = 100;

	constructor(count: number, tail: T) {
		this.whiskers = count;
		this.tail = tail;
	}
}

// comment 5...
const justine = {
	name: 'Justine',
	// age: '23',
	age: 30
} satisfies User;

const isJustineAnAdult = isAdult(justine);
console.log({ isJustineAnAdult })

// comment 6...
let otherUser: User2 = {
	name: 'Justine',
	age: now(true),
	somethingElse: true
}

// comment 7...
console.log({ otherUser, PI, now: Date.now() })

type User3 = {
	name: string;
	age: number;
}


// type overlap: object literal vs assigning to variable first

// let uA: User3 = {
// 	name: 'a',
// 	age: 123,
// 	extra: 999
// }
//
// console.log('uA', uA);

let temp = {
	name: 'a',
	age: 123,
	extra: 999
};

let uB: User3 = temp;

console.log('uB', uB);

