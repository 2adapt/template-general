import { now } from './01-simple-stuff.ts';
import { type User } from './01-simple-stuff.ts';

// comment a

let newUser: User = {
	name: 'aaa',
	age: 123,

}

// comment b

console.log('newUser', newUser);

// comment c

console.log('now', now(true), process.argv);
console.log('now', now(newUser));
