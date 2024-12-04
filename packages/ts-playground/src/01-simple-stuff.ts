// comment a...

type User = {
	name: string;
	age: number;
	somethingElse?: boolean;
}

// comment b1...

function isAdult(user: User) {
	return user.age >= 18;
}

// comment b2...

let isAdultAgain = (user: User) => user.age >= 18;

// comment c...

function inc(x: number, y: number) {
	return x + 1;
}

// comment d...

function now(u: User | boolean): number | string {
	if (typeof u === 'boolean') {
		return Date.now();
	}
	else {
		return `${u.age} years old`;
	}
}

// comment e

class Cat {
	public tail: number;

	constructor(tail: number) {
		this.tail = tail;
	}
}

export {
	type User
}

export {
	inc,
	isAdult,
	isAdultAgain,
	now,
	Cat
}
