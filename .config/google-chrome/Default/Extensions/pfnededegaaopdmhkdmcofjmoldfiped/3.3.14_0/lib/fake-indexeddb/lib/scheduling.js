function getSetImmediateFromJsdom(){if("undefined"!=typeof navigator&&/jsdom/.test(navigator.userAgent)){return new(0,Node.constructor)("return setImmediate")()}}export const queueTask=fn=>{const setImmediate=globalThis.setImmediate||getSetImmediateFromJsdom()||(fn=>setTimeout(fn,0));setImmediate(fn)};