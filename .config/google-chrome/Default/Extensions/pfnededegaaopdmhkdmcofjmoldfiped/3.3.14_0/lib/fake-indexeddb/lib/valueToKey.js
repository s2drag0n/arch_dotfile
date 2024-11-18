import{DataError}from"./errors.js";const valueToKey=(input,seen)=>{if("number"==typeof input){if(isNaN(input))throw new DataError;return input}if("[object Date]"===Object.prototype.toString.call(input)){const ms=input.valueOf();if(isNaN(ms))throw new DataError;return new Date(ms)}if("string"==typeof input)return input;if(input instanceof ArrayBuffer||"undefined"!=typeof SharedArrayBuffer&&input instanceof SharedArrayBuffer||"undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView&&ArrayBuffer.isView(input)){let arrayBuffer,offset=0,length=0;return input instanceof ArrayBuffer||"undefined"!=typeof SharedArrayBuffer&&input instanceof SharedArrayBuffer?(arrayBuffer=input,length=input.byteLength):(arrayBuffer=input.buffer,offset=input.byteOffset,length=input.byteLength),arrayBuffer.detached?new ArrayBuffer(0):arrayBuffer.slice(offset,offset+length)}if(Array.isArray(input)){if(void 0===seen)seen=new Set;else if(seen.has(input))throw new DataError;seen.add(input);const keys=[];for(let i=0;i<input.length;i++){if(!Object.hasOwn(input,i))throw new DataError;const entry=input[i],key=valueToKey(entry,seen);keys.push(key)}return keys}throw new DataError};export default valueToKey;