/**
 * Polyfill for node:util module
 * Provides browser-compatible utility functions
 */

export function deprecate(fn: Function, message: string): Function {
  let warned = false;
  return function(this: any, ...args: any[]) {
    if (!warned) {
      console.warn(message);
      warned = true;
    }
    return fn.apply(this, args);
  };
}

export function promisify(fn: Function): Function {
  return function(this: any, ...args: any[]) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err: Error, result: any) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

export const types = {
  isAnyArrayBuffer: (value: any) => value instanceof ArrayBuffer || value instanceof SharedArrayBuffer,
  isArrayBufferView: (value: any) => ArrayBuffer.isView(value),
  isArgumentsObject: (value: any) => Object.prototype.toString.call(value) === '[object Arguments]',
  isArrayBuffer: (value: any) => value instanceof ArrayBuffer,
  isAsyncFunction: (value: any) => Object.prototype.toString.call(value) === '[object AsyncFunction]',
  isBigInt64Array: (value: any) => value instanceof BigInt64Array,
  isBigUint64Array: (value: any) => value instanceof BigUint64Array,
  isBooleanObject: (value: any) => value instanceof Boolean,
  isBoxedPrimitive: (value: any) => {
    return value instanceof Boolean ||
           value instanceof Number ||
           value instanceof String ||
           value instanceof Symbol ||
           (typeof value === 'object' && value !== null && typeof value.valueOf() !== 'object');
  },
  isDataView: (value: any) => value instanceof DataView,
  isDate: (value: any) => value instanceof Date,
  isExternal: () => false,
  isFloat32Array: (value: any) => value instanceof Float32Array,
  isFloat64Array: (value: any) => value instanceof Float64Array,
  isGeneratorFunction: (value: any) => Object.prototype.toString.call(value) === '[object GeneratorFunction]',
  isGeneratorObject: (value: any) => Object.prototype.toString.call(value) === '[object Generator]',
  isInt8Array: (value: any) => value instanceof Int8Array,
  isInt16Array: (value: any) => value instanceof Int16Array,
  isInt32Array: (value: any) => value instanceof Int32Array,
  isMap: (value: any) => value instanceof Map,
  isMapIterator: () => false,
  isModuleNamespaceObject: () => false,
  isNativeError: (value: any) => value instanceof Error,
  isNumberObject: (value: any) => value instanceof Number,
  isPromise: (value: any) => value instanceof Promise,
  isProxy: () => false,
  isRegExp: (value: any) => value instanceof RegExp,
  isSet: (value: any) => value instanceof Set,
  isSetIterator: () => false,
  isSharedArrayBuffer: (value: any) => value instanceof SharedArrayBuffer,
  isStringObject: (value: any) => value instanceof String,
  isSymbolObject: (value: any) => value instanceof Symbol || (typeof value === 'object' && value !== null && value.constructor === Symbol),
  isTypedArray: (value: any) => ArrayBuffer.isView(value) && !(value instanceof DataView),
  isUint8Array: (value: any) => value instanceof Uint8Array,
  isUint8ClampedArray: (value: any) => value instanceof Uint8ClampedArray,
  isUint16Array: (value: any) => value instanceof Uint16Array,
  isUint32Array: (value: any) => value instanceof Uint32Array,
  isWeakMap: (value: any) => value instanceof WeakMap,
  isWeakSet: (value: any) => value instanceof WeakSet,
};

// Stub implementations for inspect and format
export function inspect(value: any): string {
  return JSON.stringify(value, null, 2);
}

export function format(formatStr: string, ...args: any[]): string {
  let i = 0;
  return formatStr.replace(/%[sdifjoO]/g, () => {
    if (i >= args.length) return '%';
    return String(args[i++]);
  });
}

export function formatWithOptions(_options: any, formatStr: string, ...args: any[]): string {
  return format(formatStr, ...args);
}

export default {
  deprecate,
  promisify,
  types,
  inspect,
  format,
  formatWithOptions
};
