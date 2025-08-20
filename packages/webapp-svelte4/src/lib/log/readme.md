# log-header

Small and dependency-free wrapper for `console.log` or `console.trace`. Will display a useful header in the output, which helps to quickly identify the location of the log.

Screenshot with console.log vs log

Advantadges:
- Display a nice and customizable header as the first argument to console.log
- Show a cloned version of the data (to avoid confusion when data is mutated after console.log was called)
- Output can be easily turned off (or adjusted) in production

This library is meant to be used in a development environment as simple improvement to the honorable `console.log`. For production you might want to consider more sophisticated solutions such as Pino, Winston or Bunyan (for nodejs), or Sentry (for client-side). 

Goals:
- Quickly identify the location of the log call 
- Have an accurate view of the data that was logged (at the moment the logging was done)
- Provide a flexible way to customize the header message 

Non-goals
- Log-levels 
- Child loggers

## Example

A default `log` instance is provided. It uses the default options.

```js
import { log } from 'log-header'

let data = { now: Date.now() }
log('the message', data)
```

<screenshot>

Create an instance with custom options:

```js
import { createLogger } from 'log-header'

const log = createLogger({
    name: 'the name',
    headerFormat: (header) => `...`,
    colors: ['green']
})

let data = { now: Date.now() }
log('the message', data)
```

<screenshot>

## options

	active: boolean;
	name: string | null;
	messageArg: 'first' | 'last' | null;
	stackTraceLimit: number;
	// argSeparator: string | null;
	colors: [string, string] | string | null;
	headerFormat: (header: Header) => string;
	footerFormat: (header: Header) => string;
	clone: (val: any) => any;
	// replaceOriginal: boolean;
	mode: 'header' | 'console.log' | 'console.trace'


`messageArg`
    - if `'first'`: will check if the first argument is a non-empty string; if so, add it `header.message` 
    - if `'last'`: will check if the last argument is a non-empty string; if so, add it `header.message`
    - if `null`: will not make the checks above (so `header.message` will be null)


## using the `header` mode

When the `mode` option is `'header'`, the output from the `log()` is just the header string. This is mean to be used with `console.trace` directly (as the first argument). Example:


```js
import { createLogger } from 'log-header'

const h = createLogger({
    mode: 'header'
})

let data = { now: Date.now() }
console.trace(h('the message'), data)
```

This might be useful when the stack trace obtained internally is not accurate (wrong line numbers). This happens for sveltekit applications (or more generally, happens for Vite-based applications, and probably webpack).

In those cases using `console.trace` directly might give us ethe correct locations. In this case we can use the output `log` as a simple string. 
