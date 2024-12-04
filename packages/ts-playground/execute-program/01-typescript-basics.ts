// let sum: string = 'a';
// let sum2: number = sum;
// let result = sum2;

// let anything: any = 'any' + 1;
// let result = anything;

// function double(x: number, y: number, z: string): number {
// 	// return x + y;
// 	return z.length;
// }
//
// let myVar = 2;
// let result = double(3, myVar, 'xxxxx');

// let n = 1 + 1;
// let x: string = '';
// x = n;
// let result = x;

// let array: string[] = ['aaaaa', 'b', 'c'];
// let element = array[0];
// let result = element.length;
// let array2: number[] = array;
// array2.push(result)

// function identity<T>(val: Array<T>): number {
// 	return val.length;
// }
//
// let result = identity(['a']);
// let a = [1, 2];
// let temp: number = 0;
//
// if (Date.now() % 2 === 0) {
// 	temp = 3;
// }
//
//
// if (true) {
// 	a.push(temp)
// }
// console.log({ a })
// let result2 = identity(a);

// type User = {
// 	email: string;
// 	admin: boolean;
// 	first_name: string;
// 	last_name: string;
// }
//
// type UserSlim = {
// 	email: string;
// 	admin: boolean;
//
// }
//
// let theUser: User = {
// 	email: 'x@y.com',
// 	admin: true,
// 	first_name: 'first',
// 	last_name: 'last',
// }
//
// let theUserSlim: UserSlim = theUser;
// let theUserSlim2: UserSlim = {
// 	email: 'x@y.com',
// 	admin: true,
// };
//
// console.log({ theUser, theUserSlim, theUserSlim2 })

//
// let temp: UserSlim = {
// 	email: 'bbb2',
// };
//
// let result2 = temp;
// console.log({ result2 })
//
// function fn(val: UserSlim): string {
// 	return val.email
// }
//
// let result3 = fn(xyz);
// console.log({ result3 })


// type T = (n: number, n2: number) => number;
//
// function fn(val: number, val2: number): number {
// 	return val + val2 + 1;
// }
//
// let fn2: ((val: number, val2: number) => number) = (x, y) => {
// 	return x + y + 1;
// }
//
// let fn3 = (x: number, y: number): number => {
// 	return x + y + 1;
// }
//
//
// let temp: T = fn;
//
// // console.log({ result: temp(3) })
// console.log({ result: fn3(3, 21, 0) })



// function first<T>(val: Array<T>): T {
// 	return val[0];
// }
//
// let result = first<number>([1,2,3])
// console.log("[01-typescript-basics.ts:117] result", result);
//
//
//
// type First<T> = (array: Array<T>) => T;
// const firstForNumber: First<number> = first;
//
// let result2 = firstForNumber([1,2,3]);
// console.log("[01-typescript-basics.ts:125] result2", result2);






// function len<T>(array: Array<T>): number {
// 	return array.length
// }
//
// let result = len<any>(['a', 'a', 1]);
// console.log("[01-typescript-basics.ts:135] result", result);






// type User = {
// 	name: string,
// 	email: string,
// 	other: number
// }
//
// type LiteralEmail = 'email';
//
// let x: Pick<User, 'name' | LiteralEmail> = {
// 	name: 'x',
// 	email: 'uuu'
//
// }
// console.log("[01-typescript-basics.ts:146] x", x);
//


/*
type StartedCourse = {
	started: 'a'
	x: number,
	y: 1,
	lastInteractionTime: Date
};

type UnstartedCourse = {
	//started: 'b'
	x: number,
	y: 2,
};

type Course = StartedCourse | UnstartedCourse;

const course: Course = {

	//lastInteractionTime: new Date(2000, 1, 1)
	x: 1
	// y: 2,
};

// let result = course.lastInteractionTime.getFullYear();
let result = course;
console.log("[01-typescript-basics.ts:179] result", result);
*/
