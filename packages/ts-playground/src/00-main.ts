import * from 'xyz/some-module';
//import    { now    } from          './01-simple-stuff.ts';
//import type User = require('./01-simple-stuff.ts');
// import { type User } from './01-simple-stuff.ts';

// comment a - line 4

type UserInline = {
	name: string;
	age: number;
	somethingElse?: boolean;
}

let newUser: UserInline = {
	name: 'aaa',
	age: 123,
}

let newUser2: User = {};

// comment b - line 17

console.log('newUser', newUser);

// comment c - line 21

console.log('now', now(true), process.argv);
console.log('now', now(newUser));
