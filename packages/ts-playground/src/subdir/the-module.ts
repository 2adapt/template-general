// comment 1...
export type User2 = {
	name: string;
	age: number;
	somethingElse: boolean;
};

// comment 2...
export const PI = 3.14;

// comment 3...
function now(u: User2 | boolean): number {
	if (typeof u === 'boolean') {
		return Date.now();
	}

	return u.age;
}

// comment 4
let x = () => true;

// comment 5
export class Cat {
	public tail: number;

	constructor(tail: number) {
		this.tail = tail;
	}
}

export {
	now,
	x
}