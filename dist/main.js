// node_modules/convex/dist/esm/index.js
var version = "1.33.0";

// node_modules/convex/dist/esm/values/base64.js
var lookup = [];
var revLookup = [];
var Arr = Uint8Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (i2 = 0, len = code.length; i2 < len; ++i2) {
  lookup[i2] = code[i2];
  revLookup[code.charCodeAt(i2)] = i2;
}
var i2;
var len;
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  var validLen = b64.indexOf("=");
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function _byteLength(_b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr2 = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0;
  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i2;
  for (i2 = 0; i2 < len; i2 += 4) {
    tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
    arr2[curByte++] = tmp >> 16 & 255;
    arr2[curByte++] = tmp >> 8 & 255;
    arr2[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
    arr2[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
    arr2[curByte++] = tmp >> 8 & 255;
    arr2[curByte++] = tmp & 255;
  }
  return arr2;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i2 = start; i2 < end; i2 += 3) {
    tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var parts = [];
  var maxChunkLength = 16383;
  for (var i2 = 0, len2 = len - extraBytes; i2 < len2; i2 += maxChunkLength) {
    parts.push(
      encodeChunk(
        uint8,
        i2,
        i2 + maxChunkLength > len2 ? len2 : i2 + maxChunkLength
      )
    );
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
    );
  }
  return parts.join("");
}

// node_modules/convex/dist/esm/common/index.js
function parseArgs(args) {
  if (args === void 0) {
    return {};
  }
  if (!isSimpleObject(args)) {
    throw new Error(
      `The arguments to a Convex function must be an object. Received: ${args}`
    );
  }
  return args;
}
function validateDeploymentUrl(deploymentUrl) {
  if (typeof deploymentUrl === "undefined") {
    throw new Error(
      `Client created with undefined deployment address. If you used an environment variable, check that it's set.`
    );
  }
  if (typeof deploymentUrl !== "string") {
    throw new Error(
      `Invalid deployment address: found ${deploymentUrl}".`
    );
  }
  if (!(deploymentUrl.startsWith("http:") || deploymentUrl.startsWith("https:"))) {
    throw new Error(
      `Invalid deployment address: Must start with "https://" or "http://". Found "${deploymentUrl}".`
    );
  }
  try {
    new URL(deploymentUrl);
  } catch {
    throw new Error(
      `Invalid deployment address: "${deploymentUrl}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
    );
  }
  if (deploymentUrl.endsWith(".convex.site")) {
    throw new Error(
      `Invalid deployment address: "${deploymentUrl}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
    );
  }
}
function isSimpleObject(value) {
  const isObject = typeof value === "object";
  const prototype = Object.getPrototypeOf(value);
  const isSimple = prototype === null || prototype === Object.prototype || // Objects generated from other contexts (e.g. across Node.js `vm` modules) will not satisfy the previous
  // conditions but are still simple objects.
  prototype?.constructor?.name === "Object";
  return isObject && isSimple;
}

// node_modules/convex/dist/esm/values/value.js
var LITTLE_ENDIAN = true;
var MIN_INT64 = BigInt("-9223372036854775808");
var MAX_INT64 = BigInt("9223372036854775807");
var ZERO = BigInt("0");
var EIGHT = BigInt("8");
var TWOFIFTYSIX = BigInt("256");
function isSpecial(n2) {
  return Number.isNaN(n2) || !Number.isFinite(n2) || Object.is(n2, -0);
}
function slowBigIntToBase64(value) {
  if (value < ZERO) {
    value -= MIN_INT64 + MIN_INT64;
  }
  let hex = value.toString(16);
  if (hex.length % 2 === 1) hex = "0" + hex;
  const bytes = new Uint8Array(new ArrayBuffer(8));
  let i2 = 0;
  for (const hexByte of hex.match(/.{2}/g).reverse()) {
    bytes.set([parseInt(hexByte, 16)], i2++);
    value >>= EIGHT;
  }
  return fromByteArray(bytes);
}
function slowBase64ToBigInt(encoded) {
  const integerBytes = toByteArray(encoded);
  if (integerBytes.byteLength !== 8) {
    throw new Error(
      `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
    );
  }
  let value = ZERO;
  let power = ZERO;
  for (const byte of integerBytes) {
    value += BigInt(byte) * TWOFIFTYSIX ** power;
    power++;
  }
  if (value > MAX_INT64) {
    value += MIN_INT64 + MIN_INT64;
  }
  return value;
}
function modernBigIntToBase64(value) {
  if (value < MIN_INT64 || MAX_INT64 < value) {
    throw new Error(
      `BigInt ${value} does not fit into a 64-bit signed integer.`
    );
  }
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setBigInt64(0, value, true);
  return fromByteArray(new Uint8Array(buffer));
}
function modernBase64ToBigInt(encoded) {
  const integerBytes = toByteArray(encoded);
  if (integerBytes.byteLength !== 8) {
    throw new Error(
      `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
    );
  }
  const intBytesView = new DataView(integerBytes.buffer);
  return intBytesView.getBigInt64(0, true);
}
var bigIntToBase64 = DataView.prototype.setBigInt64 ? modernBigIntToBase64 : slowBigIntToBase64;
var base64ToBigInt = DataView.prototype.getBigInt64 ? modernBase64ToBigInt : slowBase64ToBigInt;
var MAX_IDENTIFIER_LEN = 1024;
function validateObjectField(k2) {
  if (k2.length > MAX_IDENTIFIER_LEN) {
    throw new Error(
      `Field name ${k2} exceeds maximum field name length ${MAX_IDENTIFIER_LEN}.`
    );
  }
  if (k2.startsWith("$")) {
    throw new Error(`Field name ${k2} starts with a '$', which is reserved.`);
  }
  for (let i2 = 0; i2 < k2.length; i2 += 1) {
    const charCode = k2.charCodeAt(i2);
    if (charCode < 32 || charCode >= 127) {
      throw new Error(
        `Field name ${k2} has invalid character '${k2[i2]}': Field names can only contain non-control ASCII characters`
      );
    }
  }
}
function jsonToConvex(value) {
  if (value === null) {
    return value;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((value2) => jsonToConvex(value2));
  }
  if (typeof value !== "object") {
    throw new Error(`Unexpected type of ${value}`);
  }
  const entries = Object.entries(value);
  if (entries.length === 1) {
    const key = entries[0][0];
    if (key === "$bytes") {
      if (typeof value.$bytes !== "string") {
        throw new Error(`Malformed $bytes field on ${value}`);
      }
      return toByteArray(value.$bytes).buffer;
    }
    if (key === "$integer") {
      if (typeof value.$integer !== "string") {
        throw new Error(`Malformed $integer field on ${value}`);
      }
      return base64ToBigInt(value.$integer);
    }
    if (key === "$float") {
      if (typeof value.$float !== "string") {
        throw new Error(`Malformed $float field on ${value}`);
      }
      const floatBytes = toByteArray(value.$float);
      if (floatBytes.byteLength !== 8) {
        throw new Error(
          `Received ${floatBytes.byteLength} bytes, expected 8 for $float`
        );
      }
      const floatBytesView = new DataView(floatBytes.buffer);
      const float = floatBytesView.getFloat64(0, LITTLE_ENDIAN);
      if (!isSpecial(float)) {
        throw new Error(`Float ${float} should be encoded as a number`);
      }
      return float;
    }
    if (key === "$set") {
      throw new Error(
        `Received a Set which is no longer supported as a Convex type.`
      );
    }
    if (key === "$map") {
      throw new Error(
        `Received a Map which is no longer supported as a Convex type.`
      );
    }
  }
  const out = {};
  for (const [k2, v3] of Object.entries(value)) {
    validateObjectField(k2);
    out[k2] = jsonToConvex(v3);
  }
  return out;
}
var MAX_VALUE_FOR_ERROR_LEN = 16384;
function stringifyValueForError(value) {
  const str = JSON.stringify(value, (_key, value2) => {
    if (value2 === void 0) {
      return "undefined";
    }
    if (typeof value2 === "bigint") {
      return `${value2.toString()}n`;
    }
    return value2;
  });
  if (str.length > MAX_VALUE_FOR_ERROR_LEN) {
    const rest = "[...truncated]";
    let truncateAt = MAX_VALUE_FOR_ERROR_LEN - rest.length;
    const codePoint = str.codePointAt(truncateAt - 1);
    if (codePoint !== void 0 && codePoint > 65535) {
      truncateAt -= 1;
    }
    return str.substring(0, truncateAt) + rest;
  }
  return str;
}
function convexToJsonInternal(value, originalValue, context, includeTopLevelUndefined) {
  if (value === void 0) {
    const contextText = context && ` (present at path ${context} in original object ${stringifyValueForError(
      originalValue
    )})`;
    throw new Error(
      `undefined is not a valid Convex value${contextText}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
    );
  }
  if (value === null) {
    return value;
  }
  if (typeof value === "bigint") {
    if (value < MIN_INT64 || MAX_INT64 < value) {
      throw new Error(
        `BigInt ${value} does not fit into a 64-bit signed integer.`
      );
    }
    return { $integer: bigIntToBase64(value) };
  }
  if (typeof value === "number") {
    if (isSpecial(value)) {
      const buffer = new ArrayBuffer(8);
      new DataView(buffer).setFloat64(0, value, LITTLE_ENDIAN);
      return { $float: fromByteArray(new Uint8Array(buffer)) };
    } else {
      return value;
    }
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return { $bytes: fromByteArray(new Uint8Array(value)) };
  }
  if (Array.isArray(value)) {
    return value.map(
      (value2, i2) => convexToJsonInternal(value2, originalValue, context + `[${i2}]`, false)
    );
  }
  if (value instanceof Set) {
    throw new Error(
      errorMessageForUnsupportedType(context, "Set", [...value], originalValue)
    );
  }
  if (value instanceof Map) {
    throw new Error(
      errorMessageForUnsupportedType(context, "Map", [...value], originalValue)
    );
  }
  if (!isSimpleObject(value)) {
    const theType = value?.constructor?.name;
    const typeName = theType ? `${theType} ` : "";
    throw new Error(
      errorMessageForUnsupportedType(context, typeName, value, originalValue)
    );
  }
  const out = {};
  const entries = Object.entries(value);
  entries.sort(([k1, _v1], [k2, _v2]) => k1 === k2 ? 0 : k1 < k2 ? -1 : 1);
  for (const [k2, v3] of entries) {
    if (v3 !== void 0) {
      validateObjectField(k2);
      out[k2] = convexToJsonInternal(v3, originalValue, context + `.${k2}`, false);
    } else if (includeTopLevelUndefined) {
      validateObjectField(k2);
      out[k2] = convexOrUndefinedToJsonInternal(
        v3,
        originalValue,
        context + `.${k2}`
      );
    }
  }
  return out;
}
function errorMessageForUnsupportedType(context, typeName, value, originalValue) {
  if (context) {
    return `${typeName}${stringifyValueForError(
      value
    )} is not a supported Convex type (present at path ${context} in original object ${stringifyValueForError(
      originalValue
    )}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`;
  } else {
    return `${typeName}${stringifyValueForError(
      value
    )} is not a supported Convex type.`;
  }
}
function convexOrUndefinedToJsonInternal(value, originalValue, context) {
  if (value === void 0) {
    return { $undefined: null };
  } else {
    if (originalValue === void 0) {
      throw new Error(
        `Programming error. Current value is ${stringifyValueForError(
          value
        )} but original value is undefined`
      );
    }
    return convexToJsonInternal(value, originalValue, context, false);
  }
}
function convexToJson(value) {
  return convexToJsonInternal(value, value, "", false);
}

// node_modules/convex/dist/esm/values/validators.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var UNDEFINED_VALIDATOR_ERROR_URL = "https://docs.convex.dev/error#undefined-validator";
function throwUndefinedValidatorError(context, fieldName) {
  const fieldInfo = fieldName !== void 0 ? ` for field "${fieldName}"` : "";
  throw new Error(
    `A validator is undefined${fieldInfo} in ${context}. This is often caused by circular imports. See ${UNDEFINED_VALIDATOR_ERROR_URL} for details.`
  );
}
var BaseValidator = class {
  constructor({ isOptional }) {
    __publicField(this, "type");
    __publicField(this, "fieldPaths");
    __publicField(this, "isOptional");
    __publicField(this, "isConvexValidator");
    this.isOptional = isOptional;
    this.isConvexValidator = true;
  }
};
var VId = class _VId extends BaseValidator {
  /**
   * Usually you'd use `v.id(tableName)` instead.
   */
  constructor({
    isOptional,
    tableName
  }) {
    super({ isOptional });
    __publicField(this, "tableName");
    __publicField(this, "kind", "id");
    if (typeof tableName !== "string") {
      throw new Error("v.id(tableName) requires a string");
    }
    this.tableName = tableName;
  }
  /** @internal */
  get json() {
    return { type: "id", tableName: this.tableName };
  }
  /** @internal */
  asOptional() {
    return new _VId({
      isOptional: "optional",
      tableName: this.tableName
    });
  }
};
var VFloat64 = class _VFloat64 extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "float64");
  }
  /** @internal */
  get json() {
    return { type: "number" };
  }
  /** @internal */
  asOptional() {
    return new _VFloat64({
      isOptional: "optional"
    });
  }
};
var VInt64 = class _VInt64 extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "int64");
  }
  /** @internal */
  get json() {
    return { type: "bigint" };
  }
  /** @internal */
  asOptional() {
    return new _VInt64({ isOptional: "optional" });
  }
};
var VBoolean = class _VBoolean extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "boolean");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VBoolean({
      isOptional: "optional"
    });
  }
};
var VBytes = class _VBytes extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "bytes");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VBytes({ isOptional: "optional" });
  }
};
var VString = class _VString extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "string");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VString({
      isOptional: "optional"
    });
  }
};
var VNull = class _VNull extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "null");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VNull({ isOptional: "optional" });
  }
};
var VAny = class _VAny extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "any");
  }
  /** @internal */
  get json() {
    return {
      type: this.kind
    };
  }
  /** @internal */
  asOptional() {
    return new _VAny({
      isOptional: "optional"
    });
  }
};
var VObject = class _VObject extends BaseValidator {
  /**
   * Usually you'd use `v.object({ ... })` instead.
   */
  constructor({
    isOptional,
    fields
  }) {
    super({ isOptional });
    __publicField(this, "fields");
    __publicField(this, "kind", "object");
    globalThis.Object.entries(fields).forEach(([fieldName, validator]) => {
      if (validator === void 0) {
        throwUndefinedValidatorError("v.object()", fieldName);
      }
      if (!validator.isConvexValidator) {
        throw new Error("v.object() entries must be validators");
      }
    });
    this.fields = fields;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: globalThis.Object.fromEntries(
        globalThis.Object.entries(this.fields).map(([k2, v3]) => [
          k2,
          {
            fieldType: v3.json,
            optional: v3.isOptional === "optional" ? true : false
          }
        ])
      )
    };
  }
  /** @internal */
  asOptional() {
    return new _VObject({
      isOptional: "optional",
      fields: this.fields
    });
  }
  /**
   * Create a new VObject with the specified fields omitted.
   * @param fields The field names to omit from this VObject.
   */
  omit(...fields) {
    const newFields = { ...this.fields };
    for (const field of fields) {
      delete newFields[field];
    }
    return new _VObject({
      isOptional: this.isOptional,
      fields: newFields
    });
  }
  /**
   * Create a new VObject with only the specified fields.
   * @param fields The field names to pick from this VObject.
   */
  pick(...fields) {
    const newFields = {};
    for (const field of fields) {
      newFields[field] = this.fields[field];
    }
    return new _VObject({
      isOptional: this.isOptional,
      fields: newFields
    });
  }
  /**
   * Create a new VObject with all fields marked as optional.
   */
  partial() {
    const newFields = {};
    for (const [key, validator] of globalThis.Object.entries(this.fields)) {
      newFields[key] = validator.asOptional();
    }
    return new _VObject({
      isOptional: this.isOptional,
      fields: newFields
    });
  }
  /**
   * Create a new VObject with additional fields merged in.
   * @param fields An object with additional validators to merge into this VObject.
   */
  extend(fields) {
    return new _VObject({
      isOptional: this.isOptional,
      fields: { ...this.fields, ...fields }
    });
  }
};
var VLiteral = class _VLiteral extends BaseValidator {
  /**
   * Usually you'd use `v.literal(value)` instead.
   */
  constructor({ isOptional, value }) {
    super({ isOptional });
    __publicField(this, "value");
    __publicField(this, "kind", "literal");
    if (typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number" && typeof value !== "bigint") {
      throw new Error("v.literal(value) must be a string, number, or boolean");
    }
    this.value = value;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: convexToJson(this.value)
    };
  }
  /** @internal */
  asOptional() {
    return new _VLiteral({
      isOptional: "optional",
      value: this.value
    });
  }
};
var VArray = class _VArray extends BaseValidator {
  /**
   * Usually you'd use `v.array(element)` instead.
   */
  constructor({
    isOptional,
    element
  }) {
    super({ isOptional });
    __publicField(this, "element");
    __publicField(this, "kind", "array");
    if (element === void 0) {
      throwUndefinedValidatorError("v.array()");
    }
    this.element = element;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: this.element.json
    };
  }
  /** @internal */
  asOptional() {
    return new _VArray({
      isOptional: "optional",
      element: this.element
    });
  }
};
var VRecord = class _VRecord extends BaseValidator {
  /**
   * Usually you'd use `v.record(key, value)` instead.
   */
  constructor({
    isOptional,
    key,
    value
  }) {
    super({ isOptional });
    __publicField(this, "key");
    __publicField(this, "value");
    __publicField(this, "kind", "record");
    if (key === void 0) {
      throwUndefinedValidatorError("v.record()", "key");
    }
    if (value === void 0) {
      throwUndefinedValidatorError("v.record()", "value");
    }
    if (key.isOptional === "optional") {
      throw new Error("Record validator cannot have optional keys");
    }
    if (value.isOptional === "optional") {
      throw new Error("Record validator cannot have optional values");
    }
    if (!key.isConvexValidator || !value.isConvexValidator) {
      throw new Error("Key and value of v.record() but be validators");
    }
    this.key = key;
    this.value = value;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      // This cast is needed because TypeScript thinks the key type is too wide
      keys: this.key.json,
      values: {
        fieldType: this.value.json,
        optional: false
      }
    };
  }
  /** @internal */
  asOptional() {
    return new _VRecord({
      isOptional: "optional",
      key: this.key,
      value: this.value
    });
  }
};
var VUnion = class _VUnion extends BaseValidator {
  /**
   * Usually you'd use `v.union(...members)` instead.
   */
  constructor({ isOptional, members }) {
    super({ isOptional });
    __publicField(this, "members");
    __publicField(this, "kind", "union");
    members.forEach((member, index) => {
      if (member === void 0) {
        throwUndefinedValidatorError("v.union()", `member at index ${index}`);
      }
      if (!member.isConvexValidator) {
        throw new Error("All members of v.union() must be validators");
      }
    });
    this.members = members;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: this.members.map((v3) => v3.json)
    };
  }
  /** @internal */
  asOptional() {
    return new _VUnion({
      isOptional: "optional",
      members: this.members
    });
  }
};

// node_modules/convex/dist/esm/values/validator.js
function isValidator(v22) {
  return !!v22.isConvexValidator;
}
var v = {
  /**
   * Validates that the value is a document ID for the given table.
   *
   * IDs are strings at runtime but are typed as `Id<"tableName">` in
   * TypeScript for type safety.
   *
   * @example
   * ```typescript
   * args: { userId: v.id("users") }
   * ```
   *
   * @param tableName The name of the table.
   */
  id: (tableName) => {
    return new VId({
      isOptional: "required",
      tableName
    });
  },
  /**
   * Validates that the value is `null`.
   *
   * Use `returns: v.null()` for functions that don't return a meaningful value.
   * JavaScript `undefined` is not a valid Convex value, it is automatically
   * converted to `null`.
   */
  null: () => {
    return new VNull({ isOptional: "required" });
  },
  /**
   * Validates that the value is a JavaScript `number` (Convex Float64).
   *
   * Supports all IEEE-754 double-precision floating point numbers including
   * NaN and Infinity.
   *
   * Alias for `v.float64()`.
   */
  number: () => {
    return new VFloat64({ isOptional: "required" });
  },
  /**
   * Validates that the value is a JavaScript `number` (Convex Float64).
   *
   * Supports all IEEE-754 double-precision floating point numbers.
   */
  float64: () => {
    return new VFloat64({ isOptional: "required" });
  },
  /**
   * @deprecated Use `v.int64()` instead.
   */
  bigint: () => {
    return new VInt64({ isOptional: "required" });
  },
  /**
   * Validates that the value is a JavaScript `bigint` (Convex Int64).
   *
   * Supports BigInts between -2^63 and 2^63-1.
   *
   * @example
   * ```typescript
   * args: { timestamp: v.int64() }
   * // Usage: createDoc({ timestamp: 1234567890n })
   * ```
   */
  int64: () => {
    return new VInt64({ isOptional: "required" });
  },
  /**
   * Validates that the value is a `boolean`.
   */
  boolean: () => {
    return new VBoolean({ isOptional: "required" });
  },
  /**
   * Validates that the value is a `string`.
   *
   * Strings are stored as UTF-8 and their storage size is calculated as their
   * UTF-8 encoded size.
   */
  string: () => {
    return new VString({ isOptional: "required" });
  },
  /**
   * Validates that the value is an `ArrayBuffer` (Convex Bytes).
   *
   * Use for binary data.
   */
  bytes: () => {
    return new VBytes({ isOptional: "required" });
  },
  /**
   * Validates that the value is exactly equal to the given literal.
   *
   * Useful for discriminated unions and enum-like patterns.
   *
   * @example
   * ```typescript
   * // Discriminated union pattern:
   * v.union(
   *   v.object({ kind: v.literal("error"), message: v.string() }),
   *   v.object({ kind: v.literal("success"), value: v.number() }),
   * )
   * ```
   *
   * @param literal The literal value to compare against.
   */
  literal: (literal) => {
    return new VLiteral({ isOptional: "required", value: literal });
  },
  /**
   * Validates that the value is an `Array` where every element matches the
   * given validator.
   *
   * Arrays can have at most 8192 elements.
   *
   * @example
   * ```typescript
   * args: { tags: v.array(v.string()) }
   * args: { coordinates: v.array(v.number()) }
   * args: { items: v.array(v.object({ name: v.string(), qty: v.number() })) }
   * ```
   *
   * @param element The validator for the elements of the array.
   */
  array: (element) => {
    return new VArray({ isOptional: "required", element });
  },
  /**
   * Validates that the value is an `Object` with the specified properties.
   *
   * Objects can have at most 1024 entries. Field names must be non-empty and
   * must not start with `"$"` or `"_"` (`_` is reserved for system fields
   * like `_id` and `_creationTime`; `$` is reserved for Convex internal use).
   *
   * @example
   * ```typescript
   * args: {
   *   user: v.object({
   *     name: v.string(),
   *     email: v.string(),
   *     age: v.optional(v.number()),
   *   })
   * }
   * ```
   *
   * @param fields An object mapping property names to their validators.
   */
  object: (fields) => {
    return new VObject({ isOptional: "required", fields });
  },
  /**
   * Validates that the value is a `Record` (object with dynamic keys).
   *
   * Records are objects at runtime but allow dynamic keys, unlike `v.object()`
   * which requires known property names. Keys must be ASCII characters only,
   * non-empty, and not start with `"$"` or `"_"`.
   *
   * @example
   * ```typescript
   * // Map of user IDs to scores:
   * args: { scores: v.record(v.id("users"), v.number()) }
   *
   * // Map of string keys to string values:
   * args: { metadata: v.record(v.string(), v.string()) }
   * ```
   *
   * @param keys The validator for the keys of the record.
   * @param values The validator for the values of the record.
   */
  record: (keys, values) => {
    return new VRecord({
      isOptional: "required",
      key: keys,
      value: values
    });
  },
  /**
   * Validates that the value matches at least one of the given validators.
   *
   * @example
   * ```typescript
   * // Allow string or number:
   * args: { value: v.union(v.string(), v.number()) }
   *
   * // Discriminated union (recommended pattern):
   * v.union(
   *   v.object({ kind: v.literal("text"), body: v.string() }),
   *   v.object({ kind: v.literal("image"), url: v.string() }),
   * )
   *
   * // Nullable value:
   * returns: v.union(v.object({ ... }), v.null())
   * ```
   *
   * @param members The validators to match against.
   */
  union: (...members) => {
    return new VUnion({
      isOptional: "required",
      members
    });
  },
  /**
   * A validator that accepts any Convex value without validation.
   *
   * Prefer using specific validators when possible for better type safety
   * and runtime validation.
   */
  any: () => {
    return new VAny({ isOptional: "required" });
  },
  /**
   * Makes a property optional in an object validator.
   *
   * An optional property can be omitted entirely when creating a document or
   * calling a function. This is different from `v.nullable()` which requires
   * the property to be present but allows `null`.
   *
   * @example
   * ```typescript
   * v.object({
   *   name: v.string(),              // required
   *   nickname: v.optional(v.string()), // can be omitted
   * })
   *
   * // Valid: { name: "Alice" }
   * // Valid: { name: "Alice", nickname: "Ali" }
   * // Invalid: { name: "Alice", nickname: null }  - use v.nullable() for this
   * ```
   *
   * @param value The property value validator to make optional.
   */
  optional: (value) => {
    return value.asOptional();
  },
  /**
   * Allows a value to be either the given type or `null`.
   *
   * This is shorthand for `v.union(value, v.null())`. Unlike `v.optional()`,
   * the property must still be present, but may be `null`.
   *
   * @example
   * ```typescript
   * v.object({
   *   name: v.string(),
   *   deletedAt: v.nullable(v.number()), // must be present, can be null
   * })
   *
   * // Valid: { name: "Alice", deletedAt: null }
   * // Valid: { name: "Alice", deletedAt: 1234567890 }
   * // Invalid: { name: "Alice" }  - deletedAt is required
   * ```
   */
  nullable: (value) => {
    return v.union(value, v.null());
  }
};

// node_modules/convex/dist/esm/values/errors.js
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
var _b;
var IDENTIFYING_FIELD = /* @__PURE__ */ Symbol.for("ConvexError");
var ConvexError = class extends (_b = Error, _a = IDENTIFYING_FIELD, _b) {
  constructor(data) {
    super(typeof data === "string" ? data : stringifyValueForError(data));
    __publicField2(this, "name", "ConvexError");
    __publicField2(this, "data");
    __publicField2(this, _a, true);
    this.data = data;
  }
};

// node_modules/convex/dist/esm/values/compare_utf8.js
var arr = () => Array.from({ length: 4 }, () => 0);
var aBytes = arr();
var bBytes = arr();

// node_modules/convex/dist/esm/browser/logging.js
var __defProp3 = Object.defineProperty;
var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField3 = (obj, key, value) => __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);
var INFO_COLOR = "color:rgb(0, 145, 255)";
function prefix_for_source(source) {
  switch (source) {
    case "query":
      return "Q";
    case "mutation":
      return "M";
    case "action":
      return "A";
    case "any":
      return "?";
  }
}
var DefaultLogger = class {
  constructor(options) {
    __publicField3(this, "_onLogLineFuncs");
    __publicField3(this, "_verbose");
    this._onLogLineFuncs = {};
    this._verbose = options.verbose;
  }
  addLogLineListener(func) {
    let id = Math.random().toString(36).substring(2, 15);
    for (let i2 = 0; i2 < 10; i2++) {
      if (this._onLogLineFuncs[id] === void 0) {
        break;
      }
      id = Math.random().toString(36).substring(2, 15);
    }
    this._onLogLineFuncs[id] = func;
    return () => {
      delete this._onLogLineFuncs[id];
    };
  }
  logVerbose(...args) {
    if (this._verbose) {
      for (const func of Object.values(this._onLogLineFuncs)) {
        func("debug", `${(/* @__PURE__ */ new Date()).toISOString()}`, ...args);
      }
    }
  }
  log(...args) {
    for (const func of Object.values(this._onLogLineFuncs)) {
      func("info", ...args);
    }
  }
  warn(...args) {
    for (const func of Object.values(this._onLogLineFuncs)) {
      func("warn", ...args);
    }
  }
  error(...args) {
    for (const func of Object.values(this._onLogLineFuncs)) {
      func("error", ...args);
    }
  }
};
function instantiateDefaultLogger(options) {
  const logger = new DefaultLogger(options);
  logger.addLogLineListener((level, ...args) => {
    switch (level) {
      case "debug":
        console.debug(...args);
        break;
      case "info":
        console.log(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      case "error":
        console.error(...args);
        break;
      default: {
        level;
        console.log(...args);
      }
    }
  });
  return logger;
}
function instantiateNoopLogger(options) {
  return new DefaultLogger(options);
}
function logForFunction(logger, type, source, udfPath, message) {
  const prefix = prefix_for_source(source);
  if (typeof message === "object") {
    message = `ConvexError ${JSON.stringify(message.errorData, null, 2)}`;
  }
  if (type === "info") {
    const match = message.match(/^\[.*?\] /);
    if (match === null) {
      logger.error(
        `[CONVEX ${prefix}(${udfPath})] Could not parse console.log`
      );
      return;
    }
    const level = message.slice(1, match[0].length - 2);
    const args = message.slice(match[0].length);
    logger.log(`%c[CONVEX ${prefix}(${udfPath})] [${level}]`, INFO_COLOR, args);
  } else {
    logger.error(`[CONVEX ${prefix}(${udfPath})] ${message}`);
  }
}

// node_modules/convex/dist/esm/server/functionName.js
var functionName = /* @__PURE__ */ Symbol.for("functionName");

// node_modules/convex/dist/esm/server/components/paths.js
var toReferencePath = /* @__PURE__ */ Symbol.for("toReferencePath");
function extractReferencePath(reference) {
  return reference[toReferencePath] ?? null;
}
function isFunctionHandle(s2) {
  return s2.startsWith("function://");
}
function getFunctionAddress(functionReference) {
  let functionAddress;
  if (typeof functionReference === "string") {
    if (isFunctionHandle(functionReference)) {
      functionAddress = { functionHandle: functionReference };
    } else {
      functionAddress = { name: functionReference };
    }
  } else if (functionReference[functionName]) {
    functionAddress = { name: functionReference[functionName] };
  } else {
    const referencePath = extractReferencePath(functionReference);
    if (!referencePath) {
      throw new Error(`${functionReference} is not a functionReference`);
    }
    functionAddress = { reference: referencePath };
  }
  return functionAddress;
}

// node_modules/convex/dist/esm/server/api.js
function getFunctionName(functionReference) {
  const address = getFunctionAddress(functionReference);
  if (address.name === void 0) {
    if (address.functionHandle !== void 0) {
      throw new Error(
        `Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${address.functionHandle}`
      );
    } else if (address.reference !== void 0) {
      throw new Error(
        `Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${address.reference}`
      );
    }
    throw new Error(
      `Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(address)}`
    );
  }
  if (typeof functionReference === "string") return functionReference;
  const name = functionReference[functionName];
  if (!name) {
    throw new Error(`${functionReference} is not a functionReference`);
  }
  return name;
}
function createApi(pathParts = []) {
  const handler = {
    get(_2, prop) {
      if (typeof prop === "string") {
        const newParts = [...pathParts, prop];
        return createApi(newParts);
      } else if (prop === functionName) {
        if (pathParts.length < 2) {
          const found = ["api", ...pathParts].join(".");
          throw new Error(
            `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${found}\``
          );
        }
        const path = pathParts.slice(0, -1).join("/");
        const exportName = pathParts[pathParts.length - 1];
        if (exportName === "default") {
          return path;
        } else {
          return path + ":" + exportName;
        }
      } else if (prop === Symbol.toStringTag) {
        return "FunctionReference";
      } else {
        return void 0;
      }
    }
  };
  return new Proxy({}, handler);
}
var anyApi = createApi();

// node_modules/convex/dist/esm/vendor/long.js
var __defProp4 = Object.defineProperty;
var __defNormalProp4 = (obj, key, value) => key in obj ? __defProp4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField4 = (obj, key, value) => __defNormalProp4(obj, typeof key !== "symbol" ? key + "" : key, value);
var Long = class _Long {
  constructor(low, high) {
    __publicField4(this, "low");
    __publicField4(this, "high");
    __publicField4(this, "__isUnsignedLong__");
    this.low = low | 0;
    this.high = high | 0;
    this.__isUnsignedLong__ = true;
  }
  static isLong(obj) {
    return (obj && obj.__isUnsignedLong__) === true;
  }
  // prettier-ignore
  static fromBytesLE(bytes) {
    return new _Long(
      bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
      bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24
    );
  }
  // prettier-ignore
  toBytesLE() {
    const hi2 = this.high;
    const lo2 = this.low;
    return [
      lo2 & 255,
      lo2 >>> 8 & 255,
      lo2 >>> 16 & 255,
      lo2 >>> 24,
      hi2 & 255,
      hi2 >>> 8 & 255,
      hi2 >>> 16 & 255,
      hi2 >>> 24
    ];
  }
  static fromNumber(value) {
    if (isNaN(value)) return UZERO;
    if (value < 0) return UZERO;
    if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
    return new _Long(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0);
  }
  toString() {
    return (BigInt(this.high) * BigInt(TWO_PWR_32_DBL) + BigInt(this.low)).toString();
  }
  equals(other) {
    if (!_Long.isLong(other)) other = _Long.fromValue(other);
    if (this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  }
  notEquals(other) {
    return !this.equals(other);
  }
  comp(other) {
    if (!_Long.isLong(other)) other = _Long.fromValue(other);
    if (this.equals(other)) return 0;
    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  }
  lessThanOrEqual(other) {
    return this.comp(
      /* validates */
      other
    ) <= 0;
  }
  static fromValue(val) {
    if (typeof val === "number") return _Long.fromNumber(val);
    return new _Long(val.low, val.high);
  }
};
var UZERO = new Long(0, 0);
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var MAX_UNSIGNED_VALUE = new Long(4294967295 | 0, 4294967295 | 0);

// node_modules/convex/dist/esm/vendor/jwt-decode/index.js
var InvalidTokenError = class extends Error {
};
InvalidTokenError.prototype.name = "InvalidTokenError";

// node_modules/convex/dist/esm/browser/sync/authentication_manager.js
var MAXIMUM_REFRESH_DELAY = 20 * 24 * 60 * 60 * 1e3;

// node_modules/convex/dist/esm/browser/http_client.js
var __defProp5 = Object.defineProperty;
var __defNormalProp5 = (obj, key, value) => key in obj ? __defProp5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField5 = (obj, key, value) => __defNormalProp5(obj, typeof key !== "symbol" ? key + "" : key, value);
var STATUS_CODE_UDF_FAILED = 560;
var specifiedFetch = void 0;
var ConvexHttpClient = class {
  /**
   * Create a new {@link ConvexHttpClient}.
   *
   * @param address - The url of your Convex deployment, often provided
   * by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
   * @param options - An object of options.
   * - `skipConvexDeploymentUrlCheck` - Skip validating that the Convex deployment URL looks like
   * `https://happy-animal-123.convex.cloud` or localhost. This can be useful if running a self-hosted
   * Convex backend that uses a different URL.
   * - `logger` - A logger or a boolean. If not provided, logs to the console.
   * You can construct your own logger to customize logging to log elsewhere
   * or not log at all, or use `false` as a shorthand for a no-op logger.
   * A logger is an object with 4 methods: log(), warn(), error(), and logVerbose().
   * These methods can receive multiple arguments of any types, like console.log().
   * - `auth` - A JWT containing identity claims accessible in Convex functions.
   * This identity may expire so it may be necessary to call `setAuth()` later,
   * but for short-lived clients it's convenient to specify this value here.
   * - `fetch` - A custom fetch implementation to use for all HTTP requests made by this client.
   */
  constructor(address, options) {
    __publicField5(this, "address");
    __publicField5(this, "auth");
    __publicField5(this, "adminAuth");
    __publicField5(this, "encodedTsPromise");
    __publicField5(this, "debug");
    __publicField5(this, "fetchOptions");
    __publicField5(this, "fetch");
    __publicField5(this, "logger");
    __publicField5(this, "mutationQueue", []);
    __publicField5(this, "isProcessingQueue", false);
    if (typeof options === "boolean") {
      throw new Error(
        "skipConvexDeploymentUrlCheck as the second argument is no longer supported. Please pass an options object, `{ skipConvexDeploymentUrlCheck: true }`."
      );
    }
    const opts = options ?? {};
    if (opts.skipConvexDeploymentUrlCheck !== true) {
      validateDeploymentUrl(address);
    }
    this.logger = options?.logger === false ? instantiateNoopLogger({ verbose: false }) : options?.logger !== true && options?.logger ? options.logger : instantiateDefaultLogger({ verbose: false });
    this.address = address;
    this.debug = true;
    this.auth = void 0;
    this.adminAuth = void 0;
    this.fetch = options?.fetch;
    if (options?.auth) {
      this.setAuth(options.auth);
    }
  }
  /**
   * Obtain the {@link ConvexHttpClient}'s URL to its backend.
   * @deprecated Use url, which returns the url without /api at the end.
   *
   * @returns The URL to the Convex backend, including the client's API version.
   */
  backendUrl() {
    return `${this.address}/api`;
  }
  /**
   * Return the address for this client, useful for creating a new client.
   *
   * Not guaranteed to match the address with which this client was constructed:
   * it may be canonicalized.
   */
  get url() {
    return this.address;
  }
  /**
   * Set the authentication token to be used for subsequent queries and mutations.
   *
   * Should be called whenever the token changes (i.e. due to expiration and refresh).
   *
   * @param value - JWT-encoded OpenID Connect identity token.
   */
  setAuth(value) {
    this.clearAuth();
    this.auth = value;
  }
  /**
   * Set admin auth token to allow calling internal queries, mutations, and actions
   * and acting as an identity.
   *
   * @internal
   */
  setAdminAuth(token, actingAsIdentity) {
    this.clearAuth();
    if (actingAsIdentity !== void 0) {
      const bytes = new TextEncoder().encode(JSON.stringify(actingAsIdentity));
      const actingAsIdentityEncoded = btoa(String.fromCodePoint(...bytes));
      this.adminAuth = `${token}:${actingAsIdentityEncoded}`;
    } else {
      this.adminAuth = token;
    }
  }
  /**
   * Clear the current authentication token if set.
   */
  clearAuth() {
    this.auth = void 0;
    this.adminAuth = void 0;
  }
  /**
   * Sets whether the result log lines should be printed on the console or not.
   *
   * @internal
   */
  setDebug(debug) {
    this.debug = debug;
  }
  /**
   * Used to customize the fetch behavior in some runtimes.
   *
   * @internal
   */
  setFetchOptions(fetchOptions) {
    this.fetchOptions = fetchOptions;
  }
  /**
   * This API is experimental: it may change or disappear.
   *
   * Execute a Convex query function at the same timestamp as every other
   * consistent query execution run by this HTTP client.
   *
   * This doesn't make sense for long-lived ConvexHttpClients as Convex
   * backends can read a limited amount into the past: beyond 30 seconds
   * in the past may not be available.
   *
   * Create a new client to use a consistent time.
   *
   * @param name - The name of the query.
   * @param args - The arguments object for the query. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the query's result.
   *
   * @deprecated This API is experimental: it may change or disappear.
   */
  async consistentQuery(query, ...args) {
    const queryArgs = parseArgs(args[0]);
    const timestampPromise = this.getTimestamp();
    return await this.queryInner(query, queryArgs, { timestampPromise });
  }
  async getTimestamp() {
    if (this.encodedTsPromise) {
      return this.encodedTsPromise;
    }
    return this.encodedTsPromise = this.getTimestampInner();
  }
  async getTimestampInner() {
    const localFetch = this.fetch || specifiedFetch || fetch;
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    const response = await localFetch(`${this.address}/api/query_ts`, {
      ...this.fetchOptions,
      method: "POST",
      headers
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const { ts } = await response.json();
    return ts;
  }
  /**
   * Execute a Convex query function.
   *
   * @param name - The name of the query.
   * @param args - The arguments object for the query. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the query's result.
   */
  async query(query, ...args) {
    const queryArgs = parseArgs(args[0]);
    return await this.queryInner(query, queryArgs, {});
  }
  async queryInner(query, queryArgs, options) {
    const name = getFunctionName(query);
    const args = [convexToJson(queryArgs)];
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const timestamp = options.timestampPromise ? await options.timestampPromise : void 0;
    const body = JSON.stringify({
      path: name,
      format: "convex_encoded_json",
      args,
      ...timestamp ? { ts: timestamp } : {}
    });
    const endpoint = timestamp ? `${this.address}/api/query_at_ts` : `${this.address}/api/query`;
    const response = await localFetch(endpoint, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "query", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
  async mutationInner(mutation, mutationArgs) {
    const name = getFunctionName(mutation);
    const body = JSON.stringify({
      path: name,
      format: "convex_encoded_json",
      args: [convexToJson(mutationArgs)]
    });
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const response = await localFetch(`${this.address}/api/mutation`, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "mutation", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
  async processMutationQueue() {
    if (this.isProcessingQueue) {
      return;
    }
    this.isProcessingQueue = true;
    while (this.mutationQueue.length > 0) {
      const { mutation, args, resolve, reject } = this.mutationQueue.shift();
      try {
        const result = await this.mutationInner(mutation, args);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    this.isProcessingQueue = false;
  }
  enqueueMutation(mutation, args) {
    return new Promise((resolve, reject) => {
      this.mutationQueue.push({ mutation, args, resolve, reject });
      void this.processMutationQueue();
    });
  }
  /**
   * Execute a Convex mutation function. Mutations are queued by default.
   *
   * @param name - The name of the mutation.
   * @param args - The arguments object for the mutation. If this is omitted,
   * the arguments will be `{}`.
   * @param options - An optional object containing
   * @returns A promise of the mutation's result.
   */
  async mutation(mutation, ...args) {
    const [fnArgs, options] = args;
    const mutationArgs = parseArgs(fnArgs);
    const queued = !options?.skipQueue;
    if (queued) {
      return await this.enqueueMutation(mutation, mutationArgs);
    } else {
      return await this.mutationInner(mutation, mutationArgs);
    }
  }
  /**
   * Execute a Convex action function. Actions are not queued.
   *
   * @param name - The name of the action.
   * @param args - The arguments object for the action. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the action's result.
   */
  async action(action, ...args) {
    const actionArgs = parseArgs(args[0]);
    const name = getFunctionName(action);
    const body = JSON.stringify({
      path: name,
      format: "convex_encoded_json",
      args: [convexToJson(actionArgs)]
    });
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const response = await localFetch(`${this.address}/api/action`, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "action", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
  /**
   * Execute a Convex function of an unknown type. These function calls are not queued.
   *
   * @param name - The name of the function.
   * @param args - The arguments object for the function. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the function's result.
   *
   * @internal
   */
  async function(anyFunction, componentPath, ...args) {
    const functionArgs = parseArgs(args[0]);
    const name = typeof anyFunction === "string" ? anyFunction : getFunctionName(anyFunction);
    const body = JSON.stringify({
      componentPath,
      path: name,
      format: "convex_encoded_json",
      args: convexToJson(functionArgs)
    });
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const response = await localFetch(`${this.address}/api/function`, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "any", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
};
function forwardErrorData(errorData, error) {
  error.data = jsonToConvex(errorData);
  return error;
}

// node_modules/@auth0/auth0-spa-js/dist/auth0-spa-js.production.esm.js
function e(e3, t2) {
  var n2 = {};
  for (var o2 in e3) Object.prototype.hasOwnProperty.call(e3, o2) && t2.indexOf(o2) < 0 && (n2[o2] = e3[o2]);
  if (null != e3 && "function" == typeof Object.getOwnPropertySymbols) {
    var r2 = 0;
    for (o2 = Object.getOwnPropertySymbols(e3); r2 < o2.length; r2++) t2.indexOf(o2[r2]) < 0 && Object.prototype.propertyIsEnumerable.call(e3, o2[r2]) && (n2[o2[r2]] = e3[o2[r2]]);
  }
  return n2;
}
var t = { timeoutInSeconds: 60 };
var n = "memory";
var o = { name: "auth0-spa-js", version: "2.17.1" };
var r = () => Date.now();
var i = "default";
var a = class _a3 extends Error {
  constructor(e3, t2) {
    super(t2), this.error = e3, this.error_description = t2, Object.setPrototypeOf(this, _a3.prototype);
  }
  static fromPayload(e3) {
    let { error: t2, error_description: n2 } = e3;
    return new _a3(t2, n2);
  }
};
var s = class _s extends a {
  constructor(e3, t2, n2) {
    let o2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : null;
    super(e3, t2), this.state = n2, this.appState = o2, Object.setPrototypeOf(this, _s.prototype);
  }
};
var c = class _c extends a {
  constructor(e3, t2, n2, o2) {
    let r2 = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : null;
    super(e3, t2), this.connection = n2, this.state = o2, this.appState = r2, Object.setPrototypeOf(this, _c.prototype);
  }
};
var u = class _u extends a {
  constructor() {
    super("timeout", "Timeout"), Object.setPrototypeOf(this, _u.prototype);
  }
};
var l = class _l extends u {
  constructor(e3) {
    super(), this.popup = e3, Object.setPrototypeOf(this, _l.prototype);
  }
};
var h = class _h extends a {
  constructor(e3) {
    super("cancelled", "Popup closed"), this.popup = e3, Object.setPrototypeOf(this, _h.prototype);
  }
};
var d = class _d extends a {
  constructor() {
    super("popup_open", "Unable to open a popup for loginWithPopup - window.open returned `null`"), Object.setPrototypeOf(this, _d.prototype);
  }
};
var p = class _p extends a {
  constructor(e3, t2, n2, o2) {
    super(e3, t2), this.mfa_token = n2, this.mfa_requirements = o2, Object.setPrototypeOf(this, _p.prototype);
  }
};
var f = class _f extends a {
  constructor(e3, t2) {
    super("missing_refresh_token", "Missing Refresh Token (audience: '".concat(w(e3, ["default"]), "', scope: '").concat(w(t2), "')")), this.audience = e3, this.scope = t2, Object.setPrototypeOf(this, _f.prototype);
  }
};
var m = class _m extends a {
  constructor(e3, t2) {
    super("missing_scopes", "Missing requested scopes after refresh (audience: '".concat(w(e3, ["default"]), "', missing scope: '").concat(w(t2), "')")), this.audience = e3, this.scope = t2, Object.setPrototypeOf(this, _m.prototype);
  }
};
var y = class _y extends a {
  constructor(e3) {
    super("use_dpop_nonce", "Server rejected DPoP proof: wrong nonce"), this.newDpopNonce = e3, Object.setPrototypeOf(this, _y.prototype);
  }
};
function w(e3) {
  return e3 && !(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : []).includes(e3) ? e3 : "";
}
var g = () => window.crypto;
var v2 = () => {
  const e3 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.";
  let t2 = "";
  return Array.from(g().getRandomValues(new Uint8Array(43))).forEach((n2) => t2 += e3[n2 % 66]), t2;
};
var b = (e3) => btoa(e3);
var _ = [{ key: "name", type: ["string"] }, { key: "version", type: ["string", "number"] }, { key: "env", type: ["object"] }];
var k = function(e3) {
  let t2 = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
  return Object.keys(e3).reduce((n2, o2) => {
    if (t2 && "env" === o2) return n2;
    const r2 = _.find((e4) => e4.key === o2);
    return r2 && r2.type.includes(typeof e3[o2]) && (n2[o2] = e3[o2]), n2;
  }, {});
};
var S = (t2) => {
  var { clientId: n2 } = t2, o2 = e(t2, ["clientId"]);
  return new URLSearchParams(((e3) => Object.keys(e3).filter((t3) => void 0 !== e3[t3]).reduce((t3, n3) => Object.assign(Object.assign({}, t3), { [n3]: e3[n3] }), {}))(Object.assign({ client_id: n2 }, o2))).toString();
};
var T = async (e3) => {
  const t2 = g().subtle.digest({ name: "SHA-256" }, new TextEncoder().encode(e3));
  return await t2;
};
var E = (e3) => ((e4) => decodeURIComponent(atob(e4).split("").map((e5) => "%" + ("00" + e5.charCodeAt(0).toString(16)).slice(-2)).join("")))(e3.replace(/_/g, "/").replace(/-/g, "+"));
var P = (e3) => {
  const t2 = new Uint8Array(e3);
  return ((e4) => {
    const t3 = { "+": "-", "/": "_", "=": "" };
    return e4.replace(/[+/=]/g, (e5) => t3[e5]);
  })(window.btoa(String.fromCharCode(...Array.from(t2))));
};
var A = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};
var I = {};
var x = {};
Object.defineProperty(x, "__esModule", { value: true });
var R = (function() {
  function e3() {
    var e4 = this;
    this.locked = /* @__PURE__ */ new Map(), this.addToLocked = function(t2, n2) {
      var o2 = e4.locked.get(t2);
      void 0 === o2 ? void 0 === n2 ? e4.locked.set(t2, []) : e4.locked.set(t2, [n2]) : void 0 !== n2 && (o2.unshift(n2), e4.locked.set(t2, o2));
    }, this.isLocked = function(t2) {
      return e4.locked.has(t2);
    }, this.lock = function(t2) {
      return new Promise(function(n2, o2) {
        e4.isLocked(t2) ? e4.addToLocked(t2, n2) : (e4.addToLocked(t2), n2());
      });
    }, this.unlock = function(t2) {
      var n2 = e4.locked.get(t2);
      if (void 0 !== n2 && 0 !== n2.length) {
        var o2 = n2.pop();
        e4.locked.set(t2, n2), void 0 !== o2 && setTimeout(o2, 0);
      } else e4.locked.delete(t2);
    };
  }
  return e3.getInstance = function() {
    return void 0 === e3.instance && (e3.instance = new e3()), e3.instance;
  }, e3;
})();
x.default = function() {
  return R.getInstance();
};
var O = A && A.__awaiter || function(e3, t2, n2, o2) {
  return new (n2 || (n2 = Promise))(function(r2, i2) {
    function a2(e4) {
      try {
        c2(o2.next(e4));
      } catch (e5) {
        i2(e5);
      }
    }
    function s2(e4) {
      try {
        c2(o2.throw(e4));
      } catch (e5) {
        i2(e5);
      }
    }
    function c2(e4) {
      e4.done ? r2(e4.value) : new n2(function(t3) {
        t3(e4.value);
      }).then(a2, s2);
    }
    c2((o2 = o2.apply(e3, t2 || [])).next());
  });
};
var C = A && A.__generator || function(e3, t2) {
  var n2, o2, r2, i2, a2 = { label: 0, sent: function() {
    if (1 & r2[0]) throw r2[1];
    return r2[1];
  }, trys: [], ops: [] };
  return i2 = { next: s2(0), throw: s2(1), return: s2(2) }, "function" == typeof Symbol && (i2[Symbol.iterator] = function() {
    return this;
  }), i2;
  function s2(i3) {
    return function(s3) {
      return (function(i4) {
        if (n2) throw new TypeError("Generator is already executing.");
        for (; a2; ) try {
          if (n2 = 1, o2 && (r2 = 2 & i4[0] ? o2.return : i4[0] ? o2.throw || ((r2 = o2.return) && r2.call(o2), 0) : o2.next) && !(r2 = r2.call(o2, i4[1])).done) return r2;
          switch (o2 = 0, r2 && (i4 = [2 & i4[0], r2.value]), i4[0]) {
            case 0:
            case 1:
              r2 = i4;
              break;
            case 4:
              return a2.label++, { value: i4[1], done: false };
            case 5:
              a2.label++, o2 = i4[1], i4 = [0];
              continue;
            case 7:
              i4 = a2.ops.pop(), a2.trys.pop();
              continue;
            default:
              if (!(r2 = a2.trys, (r2 = r2.length > 0 && r2[r2.length - 1]) || 6 !== i4[0] && 2 !== i4[0])) {
                a2 = 0;
                continue;
              }
              if (3 === i4[0] && (!r2 || i4[1] > r2[0] && i4[1] < r2[3])) {
                a2.label = i4[1];
                break;
              }
              if (6 === i4[0] && a2.label < r2[1]) {
                a2.label = r2[1], r2 = i4;
                break;
              }
              if (r2 && a2.label < r2[2]) {
                a2.label = r2[2], a2.ops.push(i4);
                break;
              }
              r2[2] && a2.ops.pop(), a2.trys.pop();
              continue;
          }
          i4 = t2.call(e3, a2);
        } catch (e4) {
          i4 = [6, e4], o2 = 0;
        } finally {
          n2 = r2 = 0;
        }
        if (5 & i4[0]) throw i4[1];
        return { value: i4[0] ? i4[1] : void 0, done: true };
      })([i3, s3]);
    };
  }
};
var j = A;
Object.defineProperty(I, "__esModule", { value: true });
var D = x;
var W = "browser-tabs-lock-key";
var U = { key: function(e3) {
  return O(j, void 0, void 0, function() {
    return C(this, function(e4) {
      throw new Error("Unsupported");
    });
  });
}, getItem: function(e3) {
  return O(j, void 0, void 0, function() {
    return C(this, function(e4) {
      throw new Error("Unsupported");
    });
  });
}, clear: function() {
  return O(j, void 0, void 0, function() {
    return C(this, function(e3) {
      return [2, window.localStorage.clear()];
    });
  });
}, removeItem: function(e3) {
  return O(j, void 0, void 0, function() {
    return C(this, function(e4) {
      throw new Error("Unsupported");
    });
  });
}, setItem: function(e3, t2) {
  return O(j, void 0, void 0, function() {
    return C(this, function(e4) {
      throw new Error("Unsupported");
    });
  });
}, keySync: function(e3) {
  return window.localStorage.key(e3);
}, getItemSync: function(e3) {
  return window.localStorage.getItem(e3);
}, clearSync: function() {
  return window.localStorage.clear();
}, removeItemSync: function(e3) {
  return window.localStorage.removeItem(e3);
}, setItemSync: function(e3, t2) {
  return window.localStorage.setItem(e3, t2);
} };
function K(e3) {
  return new Promise(function(t2) {
    return setTimeout(t2, e3);
  });
}
function L(e3) {
  for (var t2 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz", n2 = "", o2 = 0; o2 < e3; o2++) {
    n2 += t2[Math.floor(61 * Math.random())];
  }
  return n2;
}
var M = (function() {
  function e3(t2) {
    this.acquiredIatSet = /* @__PURE__ */ new Set(), this.storageHandler = void 0, this.id = Date.now().toString() + L(15), this.acquireLock = this.acquireLock.bind(this), this.releaseLock = this.releaseLock.bind(this), this.releaseLock__private__ = this.releaseLock__private__.bind(this), this.waitForSomethingToChange = this.waitForSomethingToChange.bind(this), this.refreshLockWhileAcquired = this.refreshLockWhileAcquired.bind(this), this.storageHandler = t2, void 0 === e3.waiters && (e3.waiters = []);
  }
  return e3.prototype.acquireLock = function(t2, n2) {
    return void 0 === n2 && (n2 = 5e3), O(this, void 0, void 0, function() {
      var o2, r2, i2, a2, s2, c2, u2;
      return C(this, function(l2) {
        switch (l2.label) {
          case 0:
            o2 = Date.now() + L(4), r2 = Date.now() + n2, i2 = W + "-" + t2, a2 = void 0 === this.storageHandler ? U : this.storageHandler, l2.label = 1;
          case 1:
            return Date.now() < r2 ? [4, K(30)] : [3, 8];
          case 2:
            return l2.sent(), null !== a2.getItemSync(i2) ? [3, 5] : (s2 = this.id + "-" + t2 + "-" + o2, [4, K(Math.floor(25 * Math.random()))]);
          case 3:
            return l2.sent(), a2.setItemSync(i2, JSON.stringify({ id: this.id, iat: o2, timeoutKey: s2, timeAcquired: Date.now(), timeRefreshed: Date.now() })), [4, K(30)];
          case 4:
            return l2.sent(), null !== (c2 = a2.getItemSync(i2)) && (u2 = JSON.parse(c2)).id === this.id && u2.iat === o2 ? (this.acquiredIatSet.add(o2), this.refreshLockWhileAcquired(i2, o2), [2, true]) : [3, 7];
          case 5:
            return e3.lockCorrector(void 0 === this.storageHandler ? U : this.storageHandler), [4, this.waitForSomethingToChange(r2)];
          case 6:
            l2.sent(), l2.label = 7;
          case 7:
            return o2 = Date.now() + L(4), [3, 1];
          case 8:
            return [2, false];
        }
      });
    });
  }, e3.prototype.refreshLockWhileAcquired = function(e4, t2) {
    return O(this, void 0, void 0, function() {
      var n2 = this;
      return C(this, function(o2) {
        return setTimeout(function() {
          return O(n2, void 0, void 0, function() {
            var n3, o3, r2;
            return C(this, function(i2) {
              switch (i2.label) {
                case 0:
                  return [4, D.default().lock(t2)];
                case 1:
                  return i2.sent(), this.acquiredIatSet.has(t2) ? (n3 = void 0 === this.storageHandler ? U : this.storageHandler, null === (o3 = n3.getItemSync(e4)) ? (D.default().unlock(t2), [2]) : ((r2 = JSON.parse(o3)).timeRefreshed = Date.now(), n3.setItemSync(e4, JSON.stringify(r2)), D.default().unlock(t2), this.refreshLockWhileAcquired(e4, t2), [2])) : (D.default().unlock(t2), [2]);
              }
            });
          });
        }, 1e3), [2];
      });
    });
  }, e3.prototype.waitForSomethingToChange = function(t2) {
    return O(this, void 0, void 0, function() {
      return C(this, function(n2) {
        switch (n2.label) {
          case 0:
            return [4, new Promise(function(n3) {
              var o2 = false, r2 = Date.now(), i2 = false;
              function a2() {
                if (i2 || (window.removeEventListener("storage", a2), e3.removeFromWaiting(a2), clearTimeout(s2), i2 = true), !o2) {
                  o2 = true;
                  var t3 = 50 - (Date.now() - r2);
                  t3 > 0 ? setTimeout(n3, t3) : n3(null);
                }
              }
              window.addEventListener("storage", a2), e3.addToWaiting(a2);
              var s2 = setTimeout(a2, Math.max(0, t2 - Date.now()));
            })];
          case 1:
            return n2.sent(), [2];
        }
      });
    });
  }, e3.addToWaiting = function(t2) {
    this.removeFromWaiting(t2), void 0 !== e3.waiters && e3.waiters.push(t2);
  }, e3.removeFromWaiting = function(t2) {
    void 0 !== e3.waiters && (e3.waiters = e3.waiters.filter(function(e4) {
      return e4 !== t2;
    }));
  }, e3.notifyWaiters = function() {
    void 0 !== e3.waiters && e3.waiters.slice().forEach(function(e4) {
      return e4();
    });
  }, e3.prototype.releaseLock = function(e4) {
    return O(this, void 0, void 0, function() {
      return C(this, function(t2) {
        switch (t2.label) {
          case 0:
            return [4, this.releaseLock__private__(e4)];
          case 1:
            return [2, t2.sent()];
        }
      });
    });
  }, e3.prototype.releaseLock__private__ = function(t2) {
    return O(this, void 0, void 0, function() {
      var n2, o2, r2, i2;
      return C(this, function(a2) {
        switch (a2.label) {
          case 0:
            return n2 = void 0 === this.storageHandler ? U : this.storageHandler, o2 = W + "-" + t2, null === (r2 = n2.getItemSync(o2)) ? [2] : (i2 = JSON.parse(r2)).id !== this.id ? [3, 2] : [4, D.default().lock(i2.iat)];
          case 1:
            a2.sent(), this.acquiredIatSet.delete(i2.iat), n2.removeItemSync(o2), D.default().unlock(i2.iat), e3.notifyWaiters(), a2.label = 2;
          case 2:
            return [2];
        }
      });
    });
  }, e3.lockCorrector = function(t2) {
    for (var n2 = Date.now() - 5e3, o2 = t2, r2 = [], i2 = 0; ; ) {
      var a2 = o2.keySync(i2);
      if (null === a2) break;
      r2.push(a2), i2++;
    }
    for (var s2 = false, c2 = 0; c2 < r2.length; c2++) {
      var u2 = r2[c2];
      if (u2.includes(W)) {
        var l2 = o2.getItemSync(u2);
        if (null !== l2) {
          var h2 = JSON.parse(l2);
          (void 0 === h2.timeRefreshed && h2.timeAcquired < n2 || void 0 !== h2.timeRefreshed && h2.timeRefreshed < n2) && (o2.removeItemSync(u2), s2 = true);
        }
      }
    }
    s2 && e3.notifyWaiters();
  }, e3.waiters = void 0, e3;
})();
var N = I.default = M;
var z = class {
  async runWithLock(e3, t2, n2) {
    const o2 = new AbortController(), r2 = setTimeout(() => o2.abort(), t2);
    try {
      return await navigator.locks.request(e3, { mode: "exclusive", signal: o2.signal }, async (e4) => {
        if (clearTimeout(r2), !e4) throw new Error("Lock not available");
        return await n2();
      });
    } catch (e4) {
      if (clearTimeout(r2), "AbortError" === (null == e4 ? void 0 : e4.name)) throw new u();
      throw e4;
    }
  }
};
var H = class {
  constructor() {
    this.activeLocks = /* @__PURE__ */ new Set(), this.lock = new N(), this.pagehideHandler = () => {
      this.activeLocks.forEach((e3) => this.lock.releaseLock(e3)), this.activeLocks.clear();
    };
  }
  async runWithLock(e3, t2, n2) {
    let o2 = false;
    for (let n3 = 0; n3 < 10 && !o2; n3++) o2 = await this.lock.acquireLock(e3, t2);
    if (!o2) throw new u();
    this.activeLocks.add(e3), 1 === this.activeLocks.size && "undefined" != typeof window && window.addEventListener("pagehide", this.pagehideHandler);
    try {
      return await n2();
    } finally {
      this.activeLocks.delete(e3), await this.lock.releaseLock(e3), 0 === this.activeLocks.size && "undefined" != typeof window && window.removeEventListener("pagehide", this.pagehideHandler);
    }
  }
};
function J() {
  return "undefined" != typeof navigator && "function" == typeof (null === (e3 = navigator.locks) || void 0 === e3 ? void 0 : e3.request) ? new z() : new H();
  var e3;
}
var Z = null;
var F = new TextEncoder();
var V = new TextDecoder();
function q(e3) {
  return "string" == typeof e3 ? F.encode(e3) : V.decode(e3);
}
function X(e3) {
  if ("number" != typeof e3.modulusLength || e3.modulusLength < 2048) throw new $(`${e3.name} modulusLength must be at least 2048 bits`);
}
async function G(e3, t2, n2) {
  if (false === n2.usages.includes("sign")) throw new TypeError('private CryptoKey instances used for signing assertions must include "sign" in their "usages"');
  const o2 = `${Y(q(JSON.stringify(e3)))}.${Y(q(JSON.stringify(t2)))}`;
  return `${o2}.${Y(await crypto.subtle.sign((function(e4) {
    switch (e4.algorithm.name) {
      case "ECDSA":
        return { name: e4.algorithm.name, hash: "SHA-256" };
      case "RSA-PSS":
        return X(e4.algorithm), { name: e4.algorithm.name, saltLength: 32 };
      case "RSASSA-PKCS1-v1_5":
        return X(e4.algorithm), { name: e4.algorithm.name };
      case "Ed25519":
        return { name: e4.algorithm.name };
    }
    throw new Q();
  })(n2), n2, q(o2)))}`;
}
var B;
if (Uint8Array.prototype.toBase64) B = (e3) => (e3 instanceof ArrayBuffer && (e3 = new Uint8Array(e3)), e3.toBase64({ alphabet: "base64url", omitPadding: true }));
else {
  const e3 = 32768;
  B = (t2) => {
    t2 instanceof ArrayBuffer && (t2 = new Uint8Array(t2));
    const n2 = [];
    for (let o2 = 0; o2 < t2.byteLength; o2 += e3) n2.push(String.fromCharCode.apply(null, t2.subarray(o2, o2 + e3)));
    return btoa(n2.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };
}
function Y(e3) {
  return B(e3);
}
var Q = class extends Error {
  constructor(e3) {
    var t2;
    super(null != e3 ? e3 : "operation not supported"), this.name = this.constructor.name, null === (t2 = Error.captureStackTrace) || void 0 === t2 || t2.call(Error, this, this.constructor);
  }
};
var $ = class extends Error {
  constructor(e3) {
    var t2;
    super(e3), this.name = this.constructor.name, null === (t2 = Error.captureStackTrace) || void 0 === t2 || t2.call(Error, this, this.constructor);
  }
};
function ee(e3) {
  switch (e3.algorithm.name) {
    case "RSA-PSS":
      return (function(e4) {
        if ("SHA-256" === e4.algorithm.hash.name) return "PS256";
        throw new Q("unsupported RsaHashedKeyAlgorithm hash name");
      })(e3);
    case "RSASSA-PKCS1-v1_5":
      return (function(e4) {
        if ("SHA-256" === e4.algorithm.hash.name) return "RS256";
        throw new Q("unsupported RsaHashedKeyAlgorithm hash name");
      })(e3);
    case "ECDSA":
      return (function(e4) {
        if ("P-256" === e4.algorithm.namedCurve) return "ES256";
        throw new Q("unsupported EcKeyAlgorithm namedCurve");
      })(e3);
    case "Ed25519":
      return "Ed25519";
    default:
      throw new Q("unsupported CryptoKey algorithm name");
  }
}
function te(e3) {
  return e3 instanceof CryptoKey;
}
function ne(e3) {
  return te(e3) && "public" === e3.type;
}
async function oe(e3, t2, n2, o2, r2, i2) {
  const a2 = null == e3 ? void 0 : e3.privateKey, s2 = null == e3 ? void 0 : e3.publicKey;
  if (!te(c2 = a2) || "private" !== c2.type) throw new TypeError('"keypair.privateKey" must be a private CryptoKey');
  var c2;
  if (!ne(s2)) throw new TypeError('"keypair.publicKey" must be a public CryptoKey');
  if (true !== s2.extractable) throw new TypeError('"keypair.publicKey.extractable" must be true');
  if ("string" != typeof t2) throw new TypeError('"htu" must be a string');
  if ("string" != typeof n2) throw new TypeError('"htm" must be a string');
  if (void 0 !== o2 && "string" != typeof o2) throw new TypeError('"nonce" must be a string or undefined');
  if (void 0 !== r2 && "string" != typeof r2) throw new TypeError('"accessToken" must be a string or undefined');
  if (void 0 !== i2 && ("object" != typeof i2 || null === i2 || Array.isArray(i2))) throw new TypeError('"additional" must be an object');
  return G({ alg: ee(a2), typ: "dpop+jwt", jwk: await re(s2) }, Object.assign(Object.assign({}, i2), { iat: Math.floor(Date.now() / 1e3), jti: crypto.randomUUID(), htm: n2, nonce: o2, htu: t2, ath: r2 ? Y(await crypto.subtle.digest("SHA-256", q(r2))) : void 0 }), a2);
}
async function re(e3) {
  const { kty: t2, e: n2, n: o2, x: r2, y: i2, crv: a2 } = await crypto.subtle.exportKey("jwk", e3);
  return { kty: t2, crv: a2, e: n2, n: o2, x: r2, y: i2 };
}
var ie = "dpop-nonce";
var ae = ["authorization_code", "refresh_token", "urn:ietf:params:oauth:grant-type:token-exchange", "http://auth0.com/oauth/grant-type/mfa-oob", "http://auth0.com/oauth/grant-type/mfa-otp", "http://auth0.com/oauth/grant-type/mfa-recovery-code"];
function se() {
  return (async function(e3, t2) {
    var n2;
    let o2;
    if ("string" != typeof e3 || 0 === e3.length) throw new TypeError('"alg" must be a non-empty string');
    switch (e3) {
      case "PS256":
        o2 = { name: "RSA-PSS", hash: "SHA-256", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) };
        break;
      case "RS256":
        o2 = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) };
        break;
      case "ES256":
        o2 = { name: "ECDSA", namedCurve: "P-256" };
        break;
      case "Ed25519":
        o2 = { name: "Ed25519" };
        break;
      default:
        throw new Q();
    }
    return crypto.subtle.generateKey(o2, null !== (n2 = null == t2 ? void 0 : t2.extractable) && void 0 !== n2 && n2, ["sign", "verify"]);
  })("ES256", { extractable: false });
}
function ce(e3) {
  return (async function(e4) {
    if (!ne(e4)) throw new TypeError('"publicKey" must be a public CryptoKey');
    if (true !== e4.extractable) throw new TypeError('"publicKey.extractable" must be true');
    const t2 = await re(e4);
    let n2;
    switch (t2.kty) {
      case "EC":
        n2 = { crv: t2.crv, kty: t2.kty, x: t2.x, y: t2.y };
        break;
      case "OKP":
        n2 = { crv: t2.crv, kty: t2.kty, x: t2.x };
        break;
      case "RSA":
        n2 = { e: t2.e, kty: t2.kty, n: t2.n };
        break;
      default:
        throw new Q("unsupported JWK kty");
    }
    return Y(await crypto.subtle.digest({ name: "SHA-256" }, q(JSON.stringify(n2))));
  })(e3.publicKey);
}
function ue(e3) {
  let { keyPair: t2, url: n2, method: o2, nonce: r2, accessToken: i2 } = e3;
  const a2 = (function(e4) {
    const t3 = new URL(e4);
    return t3.search = "", t3.hash = "", t3.href;
  })(n2);
  return oe(t2, a2, o2, r2, i2);
}
var le = async (e3, t2) => {
  const n2 = await fetch(e3, t2);
  return { ok: n2.ok, json: await n2.json(), headers: (o2 = n2.headers, [...o2].reduce((e4, t3) => {
    let [n3, o3] = t3;
    return e4[n3] = o3, e4;
  }, {})) };
  var o2;
};
var he = async (e3, t2, n2) => {
  const o2 = new AbortController();
  let r2;
  return t2.signal = o2.signal, Promise.race([le(e3, t2), new Promise((e4, t3) => {
    r2 = setTimeout(() => {
      o2.abort(), t3(new Error("Timeout when executing 'fetch'"));
    }, n2);
  })]).finally(() => {
    clearTimeout(r2);
  });
};
var de = async (e3, t2, n2, o2, r2, i2, a2, s2) => ((e4, t3) => new Promise(function(n3, o3) {
  const r3 = new MessageChannel();
  r3.port1.onmessage = function(e5) {
    e5.data.error ? o3(new Error(e5.data.error)) : n3(e5.data), r3.port1.close();
  }, t3.postMessage(e4, [r3.port2]);
}))({ auth: { audience: t2, scope: n2 }, timeout: r2, fetchUrl: e3, fetchOptions: o2, useFormData: a2, useMrrt: s2 }, i2);
var pe = async function(e3, t2, n2, o2, r2, i2) {
  let a2 = arguments.length > 6 && void 0 !== arguments[6] ? arguments[6] : 1e4;
  return r2 ? de(e3, t2, n2, o2, a2, r2, i2, arguments.length > 7 ? arguments[7] : void 0) : he(e3, o2, a2);
};
async function fe(t2, n2, o2, r2, i2, s2, c2, u2, l2, h2) {
  if (l2) {
    const e3 = await l2.generateProof({ url: t2, method: i2.method || "GET", nonce: await l2.getNonce() });
    i2.headers = Object.assign(Object.assign({}, i2.headers), { dpop: e3 });
  }
  let d2, m2 = null;
  for (let e3 = 0; e3 < 3; e3++) try {
    d2 = await pe(t2, o2, r2, i2, s2, c2, n2, u2), m2 = null;
    break;
  } catch (e4) {
    m2 = e4;
  }
  if (m2) throw m2;
  const w2 = d2.json, { error: g2, error_description: v3 } = w2, b2 = e(w2, ["error", "error_description"]), { headers: _2, ok: k2 } = d2;
  let S2;
  if (l2 && (S2 = _2[ie], S2 && await l2.setNonce(S2)), !k2) {
    const e3 = v3 || "HTTP error. Unable to fetch ".concat(t2);
    if ("mfa_required" === g2) throw new p(g2, e3, b2.mfa_token, b2.mfa_requirements);
    if ("missing_refresh_token" === g2) throw new f(o2, r2);
    if ("use_dpop_nonce" === g2) {
      if (!l2 || !S2 || h2) throw new y(S2);
      return fe(t2, n2, o2, r2, i2, s2, c2, u2, l2, true);
    }
    throw new a(g2 || "request_error", e3);
  }
  return b2;
}
async function me(t2, n2) {
  var { baseUrl: r2, timeout: a2, audience: s2, scope: c2, auth0Client: u2, useFormData: l2, useMrrt: h2, dpop: d2 } = t2, p2 = e(t2, ["baseUrl", "timeout", "audience", "scope", "auth0Client", "useFormData", "useMrrt", "dpop"]);
  const f2 = "urn:ietf:params:oauth:grant-type:token-exchange" === p2.grant_type, m2 = "refresh_token" === p2.grant_type && h2, y2 = Object.assign(Object.assign(Object.assign(Object.assign({}, p2), f2 && s2 && { audience: s2 }), f2 && c2 && { scope: c2 }), m2 && { audience: s2, scope: c2 }), w2 = l2 ? S(y2) : JSON.stringify(y2), g2 = (v3 = p2.grant_type, ae.includes(v3));
  var v3;
  return await fe("".concat(r2, "/oauth/token"), a2, s2 || i, c2, { method: "POST", body: w2, headers: { "Content-Type": l2 ? "application/x-www-form-urlencoded" : "application/json", "Auth0-Client": btoa(JSON.stringify(k(u2 || o))) } }, n2, l2, h2, g2 ? d2 : void 0);
}
var ye = function() {
  for (var e3 = arguments.length, t2 = new Array(e3), n2 = 0; n2 < e3; n2++) t2[n2] = arguments[n2];
  return (o2 = t2.filter(Boolean).join(" ").trim().split(/\s+/), Array.from(new Set(o2))).join(" ");
  var o2;
};
var we = (e3, t2, n2) => {
  let o2;
  return n2 && (o2 = e3[n2]), o2 || (o2 = e3[i]), ye(o2, t2);
};
var ge = "@@auth0spajs@@";
var ve = "@@user@@";
var be = class _be {
  constructor(e3) {
    let t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : ge, n2 = arguments.length > 2 ? arguments[2] : void 0;
    this.prefix = t2, this.suffix = n2, this.clientId = e3.clientId, this.scope = e3.scope, this.audience = e3.audience;
  }
  toKey() {
    return [this.prefix, this.clientId, this.audience, this.scope, this.suffix].filter(Boolean).join("::");
  }
  static fromKey(e3) {
    const [t2, n2, o2, r2] = e3.split("::");
    return new _be({ clientId: n2, scope: r2, audience: o2 }, t2);
  }
  static fromCacheEntry(e3) {
    const { scope: t2, audience: n2, client_id: o2 } = e3;
    return new _be({ scope: t2, audience: n2, clientId: o2 });
  }
};
var _e = class {
  set(e3, t2) {
    localStorage.setItem(e3, JSON.stringify(t2));
  }
  get(e3) {
    const t2 = window.localStorage.getItem(e3);
    if (t2) try {
      return JSON.parse(t2);
    } catch (e4) {
      return;
    }
  }
  remove(e3) {
    localStorage.removeItem(e3);
  }
  allKeys() {
    return Object.keys(window.localStorage).filter((e3) => e3.startsWith(ge));
  }
};
var ke = class {
  constructor() {
    this.enclosedCache = /* @__PURE__ */ (function() {
      let e3 = {};
      return { set(t2, n2) {
        e3[t2] = n2;
      }, get(t2) {
        const n2 = e3[t2];
        if (n2) return n2;
      }, remove(t2) {
        delete e3[t2];
      }, allKeys: () => Object.keys(e3) };
    })();
  }
};
var Se = class {
  constructor(e3, t2, n2) {
    this.cache = e3, this.keyManifest = t2, this.nowProvider = n2 || r;
  }
  async setIdToken(e3, t2, n2) {
    var o2;
    const r2 = this.getIdTokenCacheKey(e3);
    await this.cache.set(r2, { id_token: t2, decodedToken: n2 }), await (null === (o2 = this.keyManifest) || void 0 === o2 ? void 0 : o2.add(r2));
  }
  async getIdToken(e3) {
    const t2 = await this.cache.get(this.getIdTokenCacheKey(e3.clientId));
    if (!t2 && e3.scope && e3.audience) {
      const t3 = await this.get(e3);
      if (!t3) return;
      if (!t3.id_token || !t3.decodedToken) return;
      return { id_token: t3.id_token, decodedToken: t3.decodedToken };
    }
    if (t2) return { id_token: t2.id_token, decodedToken: t2.decodedToken };
  }
  async get(e3) {
    let t2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0, n2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], o2 = arguments.length > 3 ? arguments[3] : void 0;
    var r2;
    let i2 = await this.cache.get(e3.toKey());
    if (!i2) {
      const t3 = await this.getCacheKeys();
      if (!t3) return;
      const r3 = this.matchExistingCacheKey(e3, t3);
      if (r3 && (i2 = await this.cache.get(r3)), !i2 && n2 && "cache-only" !== o2) return this.getEntryWithRefreshToken(e3, t3);
    }
    if (!i2) return;
    const a2 = await this.nowProvider(), s2 = Math.floor(a2 / 1e3);
    return i2.expiresAt - t2 < s2 ? i2.body.refresh_token ? this.modifiedCachedEntry(i2, e3) : (await this.cache.remove(e3.toKey()), void await (null === (r2 = this.keyManifest) || void 0 === r2 ? void 0 : r2.remove(e3.toKey()))) : i2.body;
  }
  async modifiedCachedEntry(e3, t2) {
    return e3.body = { refresh_token: e3.body.refresh_token, audience: e3.body.audience, scope: e3.body.scope }, await this.cache.set(t2.toKey(), e3), { refresh_token: e3.body.refresh_token, audience: e3.body.audience, scope: e3.body.scope };
  }
  async set(e3) {
    var t2;
    const n2 = new be({ clientId: e3.client_id, scope: e3.scope, audience: e3.audience }), o2 = await this.wrapCacheEntry(e3);
    await this.cache.set(n2.toKey(), o2), await (null === (t2 = this.keyManifest) || void 0 === t2 ? void 0 : t2.add(n2.toKey()));
  }
  async remove(e3, t2, n2) {
    const o2 = new be({ clientId: e3, scope: n2, audience: t2 });
    await this.cache.remove(o2.toKey());
  }
  async clear(e3) {
    var t2;
    const n2 = await this.getCacheKeys();
    n2 && (await n2.filter((t3) => !e3 || t3.includes(e3)).reduce(async (e4, t3) => {
      await e4, await this.cache.remove(t3);
    }, Promise.resolve()), await (null === (t2 = this.keyManifest) || void 0 === t2 ? void 0 : t2.clear()));
  }
  async wrapCacheEntry(e3) {
    const t2 = await this.nowProvider();
    return { body: e3, expiresAt: Math.floor(t2 / 1e3) + e3.expires_in };
  }
  async getCacheKeys() {
    var e3;
    return this.keyManifest ? null === (e3 = await this.keyManifest.get()) || void 0 === e3 ? void 0 : e3.keys : this.cache.allKeys ? this.cache.allKeys() : void 0;
  }
  getIdTokenCacheKey(e3) {
    return new be({ clientId: e3 }, ge, ve).toKey();
  }
  matchExistingCacheKey(e3, t2) {
    return t2.filter((t3) => {
      var n2;
      const o2 = be.fromKey(t3), r2 = new Set(o2.scope && o2.scope.split(" ")), i2 = (null === (n2 = e3.scope) || void 0 === n2 ? void 0 : n2.split(" ")) || [], a2 = o2.scope && i2.reduce((e4, t4) => e4 && r2.has(t4), true);
      return o2.prefix === ge && o2.clientId === e3.clientId && o2.audience === e3.audience && a2;
    })[0];
  }
  async getEntryWithRefreshToken(e3, t2) {
    var n2;
    for (const o2 of t2) {
      const t3 = be.fromKey(o2);
      if (t3.prefix === ge && t3.clientId === e3.clientId) {
        const t4 = await this.cache.get(o2);
        if (null === (n2 = null == t4 ? void 0 : t4.body) || void 0 === n2 ? void 0 : n2.refresh_token) return this.modifiedCachedEntry(t4, e3);
      }
    }
  }
  async updateEntry(e3, t2) {
    var n2;
    const o2 = await this.getCacheKeys();
    if (o2) for (const r2 of o2) {
      const o3 = await this.cache.get(r2);
      (null === (n2 = null == o3 ? void 0 : o3.body) || void 0 === n2 ? void 0 : n2.refresh_token) === e3 && (o3.body.refresh_token = t2, await this.cache.set(r2, o3));
    }
  }
};
var Te = class {
  constructor(e3, t2, n2) {
    this.storage = e3, this.clientId = t2, this.cookieDomain = n2, this.storageKey = "".concat("a0.spajs.txs", ".").concat(this.clientId);
  }
  create(e3) {
    this.storage.save(this.storageKey, e3, { daysUntilExpire: 1, cookieDomain: this.cookieDomain });
  }
  get() {
    return this.storage.get(this.storageKey);
  }
  remove() {
    this.storage.remove(this.storageKey, { cookieDomain: this.cookieDomain });
  }
};
var Ee = (e3) => "number" == typeof e3;
var Pe = ["iss", "aud", "exp", "nbf", "iat", "jti", "azp", "nonce", "auth_time", "at_hash", "c_hash", "acr", "amr", "sub_jwk", "cnf", "sip_from_tag", "sip_date", "sip_callid", "sip_cseq_num", "sip_via_branch", "orig", "dest", "mky", "events", "toe", "txn", "rph", "sid", "vot", "vtm"];
var Ae = (e3) => {
  if (!e3.id_token) throw new Error("ID token is required but missing");
  const t2 = ((e4) => {
    const t3 = e4.split("."), [n3, o3, r3] = t3;
    if (3 !== t3.length || !n3 || !o3 || !r3) throw new Error("ID token could not be decoded");
    const i2 = JSON.parse(E(o3)), a2 = { __raw: e4 }, s2 = {};
    return Object.keys(i2).forEach((e5) => {
      a2[e5] = i2[e5], Pe.includes(e5) || (s2[e5] = i2[e5]);
    }), { encoded: { header: n3, payload: o3, signature: r3 }, header: JSON.parse(E(n3)), claims: a2, user: s2 };
  })(e3.id_token);
  if (!t2.claims.iss) throw new Error("Issuer (iss) claim must be a string present in the ID token");
  if (t2.claims.iss !== e3.iss) throw new Error('Issuer (iss) claim mismatch in the ID token; expected "'.concat(e3.iss, '", found "').concat(t2.claims.iss, '"'));
  if (!t2.user.sub) throw new Error("Subject (sub) claim must be a string present in the ID token");
  if ("RS256" !== t2.header.alg) throw new Error('Signature algorithm of "'.concat(t2.header.alg, '" is not supported. Expected the ID token to be signed with "RS256".'));
  if (!t2.claims.aud || "string" != typeof t2.claims.aud && !Array.isArray(t2.claims.aud)) throw new Error("Audience (aud) claim must be a string or array of strings present in the ID token");
  if (Array.isArray(t2.claims.aud)) {
    if (!t2.claims.aud.includes(e3.aud)) throw new Error('Audience (aud) claim mismatch in the ID token; expected "'.concat(e3.aud, '" but was not one of "').concat(t2.claims.aud.join(", "), '"'));
    if (t2.claims.aud.length > 1) {
      if (!t2.claims.azp) throw new Error("Authorized Party (azp) claim must be a string present in the ID token when Audience (aud) claim has multiple values");
      if (t2.claims.azp !== e3.aud) throw new Error('Authorized Party (azp) claim mismatch in the ID token; expected "'.concat(e3.aud, '", found "').concat(t2.claims.azp, '"'));
    }
  } else if (t2.claims.aud !== e3.aud) throw new Error('Audience (aud) claim mismatch in the ID token; expected "'.concat(e3.aud, '" but found "').concat(t2.claims.aud, '"'));
  if (e3.nonce) {
    if (!t2.claims.nonce) throw new Error("Nonce (nonce) claim must be a string present in the ID token");
    if (t2.claims.nonce !== e3.nonce) throw new Error('Nonce (nonce) claim mismatch in the ID token; expected "'.concat(e3.nonce, '", found "').concat(t2.claims.nonce, '"'));
  }
  if (e3.max_age && !Ee(t2.claims.auth_time)) throw new Error("Authentication Time (auth_time) claim must be a number present in the ID token when Max Age (max_age) is specified");
  if (null == t2.claims.exp || !Ee(t2.claims.exp)) throw new Error("Expiration Time (exp) claim must be a number present in the ID token");
  if (!Ee(t2.claims.iat)) throw new Error("Issued At (iat) claim must be a number present in the ID token");
  const n2 = e3.leeway || 60, o2 = new Date(e3.now || Date.now()), r2 = /* @__PURE__ */ new Date(0);
  if (r2.setUTCSeconds(t2.claims.exp + n2), o2 > r2) throw new Error("Expiration Time (exp) claim error in the ID token; current time (".concat(o2, ") is after expiration time (").concat(r2, ")"));
  if (null != t2.claims.nbf && Ee(t2.claims.nbf)) {
    const e4 = /* @__PURE__ */ new Date(0);
    if (e4.setUTCSeconds(t2.claims.nbf - n2), o2 < e4) throw new Error("Not Before time (nbf) claim in the ID token indicates that this token can't be used just yet. Current time (".concat(o2, ") is before ").concat(e4));
  }
  if (null != t2.claims.auth_time && Ee(t2.claims.auth_time)) {
    const r3 = /* @__PURE__ */ new Date(0);
    if (r3.setUTCSeconds(parseInt(t2.claims.auth_time) + e3.max_age + n2), o2 > r3) throw new Error("Authentication Time (auth_time) claim in the ID token indicates that too much time has passed since the last end-user authentication. Current time (".concat(o2, ") is after last auth at ").concat(r3));
  }
  if (e3.organization) {
    const n3 = e3.organization.trim();
    if (n3.startsWith("org_")) {
      const e4 = n3;
      if (!t2.claims.org_id) throw new Error("Organization ID (org_id) claim must be a string present in the ID token");
      if (e4 !== t2.claims.org_id) throw new Error('Organization ID (org_id) claim mismatch in the ID token; expected "'.concat(e4, '", found "').concat(t2.claims.org_id, '"'));
    } else {
      const e4 = n3.toLowerCase();
      if (!t2.claims.org_name) throw new Error("Organization Name (org_name) claim must be a string present in the ID token");
      if (e4 !== t2.claims.org_name) throw new Error('Organization Name (org_name) claim mismatch in the ID token; expected "'.concat(e4, '", found "').concat(t2.claims.org_name, '"'));
    }
  }
  return t2;
};
var Ie = A && A.__assign || function() {
  return Ie = Object.assign || function(e3) {
    for (var t2, n2 = 1, o2 = arguments.length; n2 < o2; n2++) for (var r2 in t2 = arguments[n2]) Object.prototype.hasOwnProperty.call(t2, r2) && (e3[r2] = t2[r2]);
    return e3;
  }, Ie.apply(this, arguments);
};
function xe(e3, t2) {
  if (!t2) return "";
  var n2 = "; " + e3;
  return true === t2 ? n2 : n2 + "=" + t2;
}
function Re(e3, t2, n2) {
  return encodeURIComponent(e3).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/\(/g, "%28").replace(/\)/g, "%29") + "=" + encodeURIComponent(t2).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent) + (function(e4) {
    if ("number" == typeof e4.expires) {
      var t3 = /* @__PURE__ */ new Date();
      t3.setMilliseconds(t3.getMilliseconds() + 864e5 * e4.expires), e4.expires = t3;
    }
    return xe("Expires", e4.expires ? e4.expires.toUTCString() : "") + xe("Domain", e4.domain) + xe("Path", e4.path) + xe("Secure", e4.secure) + xe("SameSite", e4.sameSite);
  })(n2);
}
function Oe() {
  return (function(e3) {
    for (var t2 = {}, n2 = e3 ? e3.split("; ") : [], o2 = /(%[\dA-F]{2})+/gi, r2 = 0; r2 < n2.length; r2++) {
      var i2 = n2[r2].split("="), a2 = i2.slice(1).join("=");
      '"' === a2.charAt(0) && (a2 = a2.slice(1, -1));
      try {
        t2[i2[0].replace(o2, decodeURIComponent)] = a2.replace(o2, decodeURIComponent);
      } catch (e4) {
      }
    }
    return t2;
  })(document.cookie);
}
var Ce = function(e3) {
  return Oe()[e3];
};
function je(e3, t2, n2) {
  document.cookie = Re(e3, t2, Ie({ path: "/" }, n2));
}
var De = je;
var We = function(e3, t2) {
  je(e3, "", Ie(Ie({}, t2), { expires: -1 }));
};
var Ue = { get(e3) {
  const t2 = Ce(e3);
  if (void 0 !== t2) return JSON.parse(t2);
}, save(e3, t2, n2) {
  let o2 = {};
  "https:" === window.location.protocol && (o2 = { secure: true, sameSite: "none" }), (null == n2 ? void 0 : n2.daysUntilExpire) && (o2.expires = n2.daysUntilExpire), (null == n2 ? void 0 : n2.cookieDomain) && (o2.domain = n2.cookieDomain), De(e3, JSON.stringify(t2), o2);
}, remove(e3, t2) {
  let n2 = {};
  (null == t2 ? void 0 : t2.cookieDomain) && (n2.domain = t2.cookieDomain), We(e3, n2);
} };
var Ke = "_legacy_";
var Le = { get(e3) {
  const t2 = Ue.get(e3);
  return t2 || Ue.get("".concat(Ke).concat(e3));
}, save(e3, t2, n2) {
  let o2 = {};
  "https:" === window.location.protocol && (o2 = { secure: true }), (null == n2 ? void 0 : n2.daysUntilExpire) && (o2.expires = n2.daysUntilExpire), (null == n2 ? void 0 : n2.cookieDomain) && (o2.domain = n2.cookieDomain), De("".concat(Ke).concat(e3), JSON.stringify(t2), o2), Ue.save(e3, t2, n2);
}, remove(e3, t2) {
  let n2 = {};
  (null == t2 ? void 0 : t2.cookieDomain) && (n2.domain = t2.cookieDomain), We(e3, n2), Ue.remove(e3, t2), Ue.remove("".concat(Ke).concat(e3), t2);
} };
var Me = { get(e3) {
  if ("undefined" == typeof sessionStorage) return;
  const t2 = sessionStorage.getItem(e3);
  return null != t2 ? JSON.parse(t2) : void 0;
}, save(e3, t2) {
  sessionStorage.setItem(e3, JSON.stringify(t2));
}, remove(e3) {
  sessionStorage.removeItem(e3);
} };
var Ne;
!(function(e3) {
  e3.Code = "code", e3.ConnectCode = "connect_code";
})(Ne || (Ne = {}));
function He(e3, t2, n2) {
  var o2 = void 0 === t2 ? null : t2, r2 = (function(e4, t3) {
    var n3 = atob(e4);
    if (t3) {
      for (var o3 = new Uint8Array(n3.length), r3 = 0, i3 = n3.length; r3 < i3; ++r3) o3[r3] = n3.charCodeAt(r3);
      return String.fromCharCode.apply(null, new Uint16Array(o3.buffer));
    }
    return n3;
  })(e3, void 0 !== n2 && n2), i2 = r2.indexOf("\n", 10) + 1, a2 = r2.substring(i2) + (o2 ? "//# sourceMappingURL=" + o2 : ""), s2 = new Blob([a2], { type: "application/javascript" });
  return URL.createObjectURL(s2);
}
var Je;
var Ze;
var Fe;
var Ve;
var qe = (Je = "Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwohZnVuY3Rpb24oKXsidXNlIHN0cmljdCI7Y2xhc3MgZSBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKHQscil7c3VwZXIociksdGhpcy5lcnJvcj10LHRoaXMuZXJyb3JfZGVzY3JpcHRpb249cixPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcyxlLnByb3RvdHlwZSl9c3RhdGljIGZyb21QYXlsb2FkKHQpe2xldHtlcnJvcjpyLGVycm9yX2Rlc2NyaXB0aW9uOnN9PXQ7cmV0dXJuIG5ldyBlKHIscyl9fWNsYXNzIHQgZXh0ZW5kcyBle2NvbnN0cnVjdG9yKGUscyl7c3VwZXIoIm1pc3NpbmdfcmVmcmVzaF90b2tlbiIsIk1pc3NpbmcgUmVmcmVzaCBUb2tlbiAoYXVkaWVuY2U6ICciLmNvbmNhdChyKGUsWyJkZWZhdWx0Il0pLCInLCBzY29wZTogJyIpLmNvbmNhdChyKHMpLCInKSIpKSx0aGlzLmF1ZGllbmNlPWUsdGhpcy5zY29wZT1zLE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLHQucHJvdG90eXBlKX19ZnVuY3Rpb24gcihlKXtyZXR1cm4gZSYmIShhcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06W10pLmluY2x1ZGVzKGUpP2U6IiJ9ImZ1bmN0aW9uIj09dHlwZW9mIFN1cHByZXNzZWRFcnJvciYmU3VwcHJlc3NlZEVycm9yO2NvbnN0IHM9ZT0+e3ZhcntjbGllbnRJZDp0fT1lLHI9ZnVuY3Rpb24oZSx0KXt2YXIgcj17fTtmb3IodmFyIHMgaW4gZSlPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZSxzKSYmdC5pbmRleE9mKHMpPDAmJihyW3NdPWVbc10pO2lmKG51bGwhPWUmJiJmdW5jdGlvbiI9PXR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKXt2YXIgbz0wO2ZvcihzPU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7bzxzLmxlbmd0aDtvKyspdC5pbmRleE9mKHNbb10pPDAmJk9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChlLHNbb10pJiYocltzW29dXT1lW3Nbb11dKX1yZXR1cm4gcn0oZSxbImNsaWVudElkIl0pO3JldHVybiBuZXcgVVJMU2VhcmNoUGFyYW1zKChlPT5PYmplY3Qua2V5cyhlKS5maWx0ZXIodD0+dm9pZCAwIT09ZVt0XSkucmVkdWNlKCh0LHIpPT5PYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sdCkse1tyXTplW3JdfSkse30pKShPYmplY3QuYXNzaWduKHtjbGllbnRfaWQ6dH0scikpKS50b1N0cmluZygpfTtsZXQgbz17fTtjb25zdCBuPShlLHQpPT4iIi5jb25jYXQoZSwifCIpLmNvbmNhdCh0KTthZGRFdmVudExpc3RlbmVyKCJtZXNzYWdlIixhc3luYyBlPT57bGV0IHIsYyx7ZGF0YTp7dGltZW91dDppLGF1dGg6YSxmZXRjaFVybDpmLGZldGNoT3B0aW9uczpsLHVzZUZvcm1EYXRhOnAsdXNlTXJydDpofSxwb3J0czpbdV19PWUsZD17fTtjb25zdHthdWRpZW5jZTpnLHNjb3BlOnl9PWF8fHt9O3RyeXtjb25zdCBlPXA/KGU9Pntjb25zdCB0PW5ldyBVUkxTZWFyY2hQYXJhbXMoZSkscj17fTtyZXR1cm4gdC5mb3JFYWNoKChlLHQpPT57clt0XT1lfSkscn0pKGwuYm9keSk6SlNPTi5wYXJzZShsLmJvZHkpO2lmKCFlLnJlZnJlc2hfdG9rZW4mJiJyZWZyZXNoX3Rva2VuIj09PWUuZ3JhbnRfdHlwZSl7aWYoYz0oKGUsdCk9Pm9bbihlLHQpXSkoZyx5KSwhYyYmaCl7Y29uc3QgZT1vLmxhdGVzdF9yZWZyZXNoX3Rva2VuLHQ9KChlLHQpPT57Y29uc3Qgcj1PYmplY3Qua2V5cyhvKS5maW5kKHI9PntpZigibGF0ZXN0X3JlZnJlc2hfdG9rZW4iIT09cil7Y29uc3Qgcz0oKGUsdCk9PnQuc3RhcnRzV2l0aCgiIi5jb25jYXQoZSwifCIpKSkodCxyKSxvPXIuc3BsaXQoInwiKVsxXS5zcGxpdCgiICIpLG49ZS5zcGxpdCgiICIpLmV2ZXJ5KGU9Pm8uaW5jbHVkZXMoZSkpO3JldHVybiBzJiZufX0pO3JldHVybiEhcn0pKHksZyk7ZSYmIXQmJihjPWUpfWlmKCFjKXRocm93IG5ldyB0KGcseSk7bC5ib2R5PXA/cyhPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sZSkse3JlZnJlc2hfdG9rZW46Y30pKTpKU09OLnN0cmluZ2lmeShPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sZSkse3JlZnJlc2hfdG9rZW46Y30pKX1sZXQgYSxrOyJmdW5jdGlvbiI9PXR5cGVvZiBBYm9ydENvbnRyb2xsZXImJihhPW5ldyBBYm9ydENvbnRyb2xsZXIsbC5zaWduYWw9YS5zaWduYWwpO3RyeXtrPWF3YWl0IFByb21pc2UucmFjZShbKGo9aSxuZXcgUHJvbWlzZShlPT5zZXRUaW1lb3V0KGUsaikpKSxmZXRjaChmLE9iamVjdC5hc3NpZ24oe30sbCkpXSl9Y2F0Y2goZSl7cmV0dXJuIHZvaWQgdS5wb3N0TWVzc2FnZSh7ZXJyb3I6ZS5tZXNzYWdlfSl9aWYoIWspcmV0dXJuIGEmJmEuYWJvcnQoKSx2b2lkIHUucG9zdE1lc3NhZ2Uoe2Vycm9yOiJUaW1lb3V0IHdoZW4gZXhlY3V0aW5nICdmZXRjaCcifSk7Xz1rLmhlYWRlcnMsZD1bLi4uX10ucmVkdWNlKChlLHQpPT57bGV0W3Isc109dDtyZXR1cm4gZVtyXT1zLGV9LHt9KSxyPWF3YWl0IGsuanNvbigpLHIucmVmcmVzaF90b2tlbj8oaCYmKG8ubGF0ZXN0X3JlZnJlc2hfdG9rZW49ci5yZWZyZXNoX3Rva2VuLE89YyxiPXIucmVmcmVzaF90b2tlbixPYmplY3QuZW50cmllcyhvKS5mb3JFYWNoKGU9PntsZXRbdCxyXT1lO3I9PT1PJiYob1t0XT1iKX0pKSwoKGUsdCxyKT0+e29bbih0LHIpXT1lfSkoci5yZWZyZXNoX3Rva2VuLGcseSksZGVsZXRlIHIucmVmcmVzaF90b2tlbik6KChlLHQpPT57ZGVsZXRlIG9bbihlLHQpXX0pKGcseSksdS5wb3N0TWVzc2FnZSh7b2s6ay5vayxqc29uOnIsaGVhZGVyczpkfSl9Y2F0Y2goZSl7dS5wb3N0TWVzc2FnZSh7b2s6ITEsanNvbjp7ZXJyb3I6ZS5lcnJvcixlcnJvcl9kZXNjcmlwdGlvbjplLm1lc3NhZ2V9LGhlYWRlcnM6ZH0pfXZhciBPLGIsXyxqfSl9KCk7Cgo=", Ze = null, Fe = false, function(e3) {
  return Ve = Ve || He(Je, Ze, Fe), new Worker(Ve, e3);
});
var Xe = {};
var Ge = class {
  constructor(e3, t2) {
    this.cache = e3, this.clientId = t2, this.manifestKey = this.createManifestKeyFrom(this.clientId);
  }
  async add(e3) {
    var t2;
    const n2 = new Set((null === (t2 = await this.cache.get(this.manifestKey)) || void 0 === t2 ? void 0 : t2.keys) || []);
    n2.add(e3), await this.cache.set(this.manifestKey, { keys: [...n2] });
  }
  async remove(e3) {
    const t2 = await this.cache.get(this.manifestKey);
    if (t2) {
      const n2 = new Set(t2.keys);
      return n2.delete(e3), n2.size > 0 ? await this.cache.set(this.manifestKey, { keys: [...n2] }) : await this.cache.remove(this.manifestKey);
    }
  }
  get() {
    return this.cache.get(this.manifestKey);
  }
  clear() {
    return this.cache.remove(this.manifestKey);
  }
  createManifestKeyFrom(e3) {
    return "".concat(ge, "::").concat(e3);
  }
};
var Be = "auth0.is.authenticated";
var Ye = { memory: () => new ke().enclosedCache, localstorage: () => new _e() };
var Qe = (e3) => Ye[e3];
var $e = (t2) => {
  const { openUrl: n2, onRedirect: o2 } = t2, r2 = e(t2, ["openUrl", "onRedirect"]);
  return Object.assign(Object.assign({}, r2), { openUrl: false === n2 || n2 ? n2 : o2 });
};
var et = (e3, t2) => {
  const n2 = (null == t2 ? void 0 : t2.split(" ")) || [];
  return ((null == e3 ? void 0 : e3.split(" ")) || []).every((e4) => n2.includes(e4));
};
var tt = { NONCE: "nonce", KEYPAIR: "keypair" };
var nt = class {
  constructor(e3) {
    this.clientId = e3;
  }
  getVersion() {
    return 1;
  }
  createDbHandle() {
    const e3 = window.indexedDB.open("auth0-spa-js", this.getVersion());
    return new Promise((t2, n2) => {
      e3.onupgradeneeded = () => Object.values(tt).forEach((t3) => e3.result.createObjectStore(t3)), e3.onerror = () => n2(e3.error), e3.onsuccess = () => t2(e3.result);
    });
  }
  async getDbHandle() {
    return this.dbHandle || (this.dbHandle = await this.createDbHandle()), this.dbHandle;
  }
  async executeDbRequest(e3, t2, n2) {
    const o2 = n2((await this.getDbHandle()).transaction(e3, t2).objectStore(e3));
    return new Promise((e4, t3) => {
      o2.onsuccess = () => e4(o2.result), o2.onerror = () => t3(o2.error);
    });
  }
  buildKey(e3) {
    const t2 = e3 ? "_".concat(e3) : "auth0";
    return "".concat(this.clientId, "::").concat(t2);
  }
  setNonce(e3, t2) {
    return this.save(tt.NONCE, this.buildKey(t2), e3);
  }
  setKeyPair(e3) {
    return this.save(tt.KEYPAIR, this.buildKey(), e3);
  }
  async save(e3, t2, n2) {
    await this.executeDbRequest(e3, "readwrite", (e4) => e4.put(n2, t2));
  }
  findNonce(e3) {
    return this.find(tt.NONCE, this.buildKey(e3));
  }
  findKeyPair() {
    return this.find(tt.KEYPAIR, this.buildKey());
  }
  find(e3, t2) {
    return this.executeDbRequest(e3, "readonly", (e4) => e4.get(t2));
  }
  async deleteBy(e3, t2) {
    const n2 = await this.executeDbRequest(e3, "readonly", (e4) => e4.getAllKeys());
    null == n2 || n2.filter(t2).map((t3) => this.executeDbRequest(e3, "readwrite", (e4) => e4.delete(t3)));
  }
  deleteByClientId(e3, t2) {
    return this.deleteBy(e3, (e4) => "string" == typeof e4 && e4.startsWith("".concat(t2, "::")));
  }
  clearNonces() {
    return this.deleteByClientId(tt.NONCE, this.clientId);
  }
  clearKeyPairs() {
    return this.deleteByClientId(tt.KEYPAIR, this.clientId);
  }
};
var ot = class {
  constructor(e3) {
    this.storage = new nt(e3);
  }
  getNonce(e3) {
    return this.storage.findNonce(e3);
  }
  setNonce(e3, t2) {
    return this.storage.setNonce(e3, t2);
  }
  async getOrGenerateKeyPair() {
    let e3 = await this.storage.findKeyPair();
    return e3 || (e3 = await se(), await this.storage.setKeyPair(e3)), e3;
  }
  async generateProof(e3) {
    const t2 = await this.getOrGenerateKeyPair();
    return ue(Object.assign({ keyPair: t2 }, e3));
  }
  async calculateThumbprint() {
    return ce(await this.getOrGenerateKeyPair());
  }
  async clear() {
    await Promise.all([this.storage.clearNonces(), this.storage.clearKeyPairs()]);
  }
};
var rt;
!(function(e3) {
  e3.Bearer = "Bearer", e3.DPoP = "DPoP";
})(rt || (rt = {}));
var it = class {
  constructor(e3, t2) {
    this.hooks = t2, this.config = Object.assign(Object.assign({}, e3), { fetch: e3.fetch || ("undefined" == typeof window ? fetch : window.fetch.bind(window)) });
  }
  isAbsoluteUrl(e3) {
    return /^(https?:)?\/\//i.test(e3);
  }
  buildUrl(e3, t2) {
    if (t2) {
      if (this.isAbsoluteUrl(t2)) return t2;
      if (e3) return "".concat(e3.replace(/\/?\/$/, ""), "/").concat(t2.replace(/^\/+/, ""));
    }
    throw new TypeError("`url` must be absolute or `baseUrl` non-empty.");
  }
  getAccessToken(e3) {
    return this.config.getAccessToken ? this.config.getAccessToken(e3) : this.hooks.getAccessToken(e3);
  }
  extractUrl(e3) {
    return "string" == typeof e3 ? e3 : e3 instanceof URL ? e3.href : e3.url;
  }
  buildBaseRequest(e3, t2) {
    if (!this.config.baseUrl) return new Request(e3, t2);
    const n2 = this.buildUrl(this.config.baseUrl, this.extractUrl(e3)), o2 = e3 instanceof Request ? new Request(n2, e3) : n2;
    return new Request(o2, t2);
  }
  setAuthorizationHeader(e3, t2) {
    let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : rt.Bearer;
    e3.headers.set("authorization", "".concat(n2, " ").concat(t2));
  }
  async setDpopProofHeader(e3, t2) {
    if (!this.config.dpopNonceId) return;
    const n2 = await this.hooks.getDpopNonce(), o2 = await this.hooks.generateDpopProof({ accessToken: t2, method: e3.method, nonce: n2, url: e3.url });
    e3.headers.set("dpop", o2);
  }
  async prepareRequest(e3, t2) {
    const n2 = await this.getAccessToken(t2);
    let o2, r2;
    "string" == typeof n2 ? (o2 = this.config.dpopNonceId ? rt.DPoP : rt.Bearer, r2 = n2) : (o2 = n2.token_type, r2 = n2.access_token), this.setAuthorizationHeader(e3, r2, o2), o2 === rt.DPoP && await this.setDpopProofHeader(e3, r2);
  }
  getHeader(e3, t2) {
    return Array.isArray(e3) ? new Headers(e3).get(t2) || "" : "function" == typeof e3.get ? e3.get(t2) || "" : e3[t2] || "";
  }
  hasUseDpopNonceError(e3) {
    if (401 !== e3.status) return false;
    const t2 = this.getHeader(e3.headers, "www-authenticate");
    return t2.includes("invalid_dpop_nonce") || t2.includes("use_dpop_nonce");
  }
  async handleResponse(e3, t2) {
    const n2 = this.getHeader(e3.headers, ie);
    if (n2 && await this.hooks.setDpopNonce(n2), !this.hasUseDpopNonceError(e3)) return e3;
    if (!n2 || !t2.onUseDpopNonceError) throw new y(n2);
    return t2.onUseDpopNonceError();
  }
  async internalFetchWithAuth(e3, t2, n2, o2) {
    const r2 = this.buildBaseRequest(e3, t2);
    await this.prepareRequest(r2, o2);
    const i2 = await this.config.fetch(r2);
    return this.handleResponse(i2, n2);
  }
  fetchWithAuth(e3, t2, n2) {
    const o2 = { onUseDpopNonceError: () => this.internalFetchWithAuth(e3, t2, Object.assign(Object.assign({}, o2), { onUseDpopNonceError: void 0 }), n2) };
    return this.internalFetchWithAuth(e3, t2, o2, n2);
  }
};
var at = class {
  constructor(e3, t2) {
    this.myAccountFetcher = e3, this.apiBase = t2;
  }
  async connectAccount(e3) {
    const t2 = await this.myAccountFetcher.fetchWithAuth("".concat(this.apiBase, "v1/connected-accounts/connect"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e3) });
    return this._handleResponse(t2);
  }
  async completeAccount(e3) {
    const t2 = await this.myAccountFetcher.fetchWithAuth("".concat(this.apiBase, "v1/connected-accounts/complete"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e3) });
    return this._handleResponse(t2);
  }
  async _handleResponse(e3) {
    let t2;
    try {
      t2 = await e3.text(), t2 = JSON.parse(t2);
    } catch (n2) {
      throw new st({ type: "invalid_json", status: e3.status, title: "Invalid JSON response", detail: t2 || String(n2) });
    }
    if (e3.ok) return t2;
    throw new st(t2);
  }
};
var st = class _st extends Error {
  constructor(e3) {
    let { type: t2, status: n2, title: o2, detail: r2, validation_errors: i2 } = e3;
    super(r2), this.name = "MyAccountApiError", this.type = t2, this.status = n2, this.title = o2, this.detail = r2, this.validation_errors = i2, Object.setPrototypeOf(this, _st.prototype);
  }
};
var ct = { otp: { authenticatorTypes: ["otp"] }, sms: { authenticatorTypes: ["oob"], oobChannels: ["sms"] }, email: { authenticatorTypes: ["oob"], oobChannels: ["email"] }, push: { authenticatorTypes: ["oob"], oobChannels: ["auth0"] }, voice: { authenticatorTypes: ["oob"], oobChannels: ["voice"] } };
var ut = "http://auth0.com/oauth/grant-type/mfa-otp";
var lt = "http://auth0.com/oauth/grant-type/mfa-oob";
var ht = "http://auth0.com/oauth/grant-type/mfa-recovery-code";
function dt(e3, t2) {
  this.v = e3, this.k = t2;
}
function pt(e3, t2, n2) {
  if ("function" == typeof e3 ? e3 === t2 : e3.has(t2)) return arguments.length < 3 ? t2 : n2;
  throw new TypeError("Private element is not present on this object");
}
function ft(e3) {
  return new dt(e3, 0);
}
function mt(e3, t2) {
  if (t2.has(e3)) throw new TypeError("Cannot initialize the same private elements twice on an object");
}
function yt(e3, t2) {
  return e3.get(pt(e3, t2));
}
function wt(e3, t2, n2) {
  mt(e3, t2), t2.set(e3, n2);
}
function gt(e3, t2, n2) {
  return e3.set(pt(e3, t2), n2), n2;
}
function vt(e3, t2, n2) {
  return (t2 = (function(e4) {
    var t3 = (function(e5, t4) {
      if ("object" != typeof e5 || !e5) return e5;
      var n3 = e5[Symbol.toPrimitive];
      if (void 0 !== n3) {
        var o2 = n3.call(e5, t4 || "default");
        if ("object" != typeof o2) return o2;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === t4 ? String : Number)(e5);
    })(e4, "string");
    return "symbol" == typeof t3 ? t3 : t3 + "";
  })(t2)) in e3 ? Object.defineProperty(e3, t2, { value: n2, enumerable: true, configurable: true, writable: true }) : e3[t2] = n2, e3;
}
function bt(e3, t2) {
  var n2 = Object.keys(e3);
  if (Object.getOwnPropertySymbols) {
    var o2 = Object.getOwnPropertySymbols(e3);
    t2 && (o2 = o2.filter(function(t3) {
      return Object.getOwnPropertyDescriptor(e3, t3).enumerable;
    })), n2.push.apply(n2, o2);
  }
  return n2;
}
function _t(e3) {
  for (var t2 = 1; t2 < arguments.length; t2++) {
    var n2 = null != arguments[t2] ? arguments[t2] : {};
    t2 % 2 ? bt(Object(n2), true).forEach(function(t3) {
      vt(e3, t3, n2[t3]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e3, Object.getOwnPropertyDescriptors(n2)) : bt(Object(n2)).forEach(function(t3) {
      Object.defineProperty(e3, t3, Object.getOwnPropertyDescriptor(n2, t3));
    });
  }
  return e3;
}
function kt(e3, t2) {
  if (null == e3) return {};
  var n2, o2, r2 = (function(e4, t3) {
    if (null == e4) return {};
    var n3 = {};
    for (var o3 in e4) if ({}.hasOwnProperty.call(e4, o3)) {
      if (-1 !== t3.indexOf(o3)) continue;
      n3[o3] = e4[o3];
    }
    return n3;
  })(e3, t2);
  if (Object.getOwnPropertySymbols) {
    var i2 = Object.getOwnPropertySymbols(e3);
    for (o2 = 0; o2 < i2.length; o2++) n2 = i2[o2], -1 === t2.indexOf(n2) && {}.propertyIsEnumerable.call(e3, n2) && (r2[n2] = e3[n2]);
  }
  return r2;
}
function St(e3) {
  return function() {
    return new Tt(e3.apply(this, arguments));
  };
}
function Tt(e3) {
  var t2, n2;
  function o2(t3, n3) {
    try {
      var i2 = e3[t3](n3), a2 = i2.value, s2 = a2 instanceof dt;
      Promise.resolve(s2 ? a2.v : a2).then(function(n4) {
        if (s2) {
          var c2 = "return" === t3 ? "return" : "next";
          if (!a2.k || n4.done) return o2(c2, n4);
          n4 = e3[c2](n4).value;
        }
        r2(i2.done ? "return" : "normal", n4);
      }, function(e4) {
        o2("throw", e4);
      });
    } catch (e4) {
      r2("throw", e4);
    }
  }
  function r2(e4, r3) {
    switch (e4) {
      case "return":
        t2.resolve({ value: r3, done: true });
        break;
      case "throw":
        t2.reject(r3);
        break;
      default:
        t2.resolve({ value: r3, done: false });
    }
    (t2 = t2.next) ? o2(t2.key, t2.arg) : n2 = null;
  }
  this._invoke = function(e4, r3) {
    return new Promise(function(i2, a2) {
      var s2 = { key: e4, arg: r3, resolve: i2, reject: a2, next: null };
      n2 ? n2 = n2.next = s2 : (t2 = n2 = s2, o2(e4, r3));
    });
  }, "function" != typeof e3.return && (this.return = void 0);
}
var Et;
var Pt;
var At;
if (Tt.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
  return this;
}, Tt.prototype.next = function(e3) {
  return this._invoke("next", e3);
}, Tt.prototype.throw = function(e3) {
  return this._invoke("throw", e3);
}, Tt.prototype.return = function(e3) {
  return this._invoke("return", e3);
}, "undefined" == typeof navigator || null === (Et = navigator.userAgent) || void 0 === Et || null === (Pt = Et.startsWith) || void 0 === Pt || !Pt.call(Et, "Mozilla/5.0 ")) {
  const e3 = "v3.8.5";
  At = "".concat("oauth4webapi", "/").concat(e3);
}
function It(e3, t2) {
  if (null == e3) return false;
  try {
    return e3 instanceof t2 || Object.getPrototypeOf(e3)[Symbol.toStringTag] === t2.prototype[Symbol.toStringTag];
  } catch (e4) {
    return false;
  }
}
var xt = "ERR_INVALID_ARG_VALUE";
var Rt = "ERR_INVALID_ARG_TYPE";
function Ot(e3, t2, n2) {
  const o2 = new TypeError(e3, { cause: n2 });
  return Object.assign(o2, { code: t2 }), o2;
}
var Ct = /* @__PURE__ */ Symbol();
var jt = /* @__PURE__ */ Symbol();
var Dt = /* @__PURE__ */ Symbol();
var Wt = /* @__PURE__ */ Symbol();
var Ut = /* @__PURE__ */ Symbol();
var Kt = /* @__PURE__ */ Symbol();
var Lt = new TextEncoder();
var Mt = new TextDecoder();
function Nt(e3) {
  return "string" == typeof e3 ? Lt.encode(e3) : Mt.decode(e3);
}
var zt;
var Ht;
if (Uint8Array.prototype.toBase64) zt = (e3) => (e3 instanceof ArrayBuffer && (e3 = new Uint8Array(e3)), e3.toBase64({ alphabet: "base64url", omitPadding: true }));
else {
  const e3 = 32768;
  zt = (t2) => {
    t2 instanceof ArrayBuffer && (t2 = new Uint8Array(t2));
    const n2 = [];
    for (let o2 = 0; o2 < t2.byteLength; o2 += e3) n2.push(String.fromCharCode.apply(null, t2.subarray(o2, o2 + e3)));
    return btoa(n2.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };
}
function Jt(e3) {
  return "string" == typeof e3 ? Ht(e3) : zt(e3);
}
Ht = Uint8Array.fromBase64 ? (e3) => {
  try {
    return Uint8Array.fromBase64(e3, { alphabet: "base64url" });
  } catch (e4) {
    throw Ot("The input to be decoded is not correctly encoded.", xt, e4);
  }
} : (e3) => {
  try {
    const t2 = atob(e3.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")), n2 = new Uint8Array(t2.length);
    for (let e4 = 0; e4 < t2.length; e4++) n2[e4] = t2.charCodeAt(e4);
    return n2;
  } catch (e4) {
    throw Ot("The input to be decoded is not correctly encoded.", xt, e4);
  }
};
var Zt = class extends Error {
  constructor(e3, t2) {
    var n2;
    super(e3, t2), vt(this, "code", void 0), this.name = this.constructor.name, this.code = Vn, null === (n2 = Error.captureStackTrace) || void 0 === n2 || n2.call(Error, this, this.constructor);
  }
};
var Ft = class extends Error {
  constructor(e3, t2) {
    var n2;
    super(e3, t2), vt(this, "code", void 0), this.name = this.constructor.name, null != t2 && t2.code && (this.code = null == t2 ? void 0 : t2.code), null === (n2 = Error.captureStackTrace) || void 0 === n2 || n2.call(Error, this, this.constructor);
  }
};
function Vt(e3, t2, n2) {
  return new Ft(e3, { code: t2, cause: n2 });
}
function qt(e3, t2) {
  if ((function(e4, t3) {
    if (!(e4 instanceof CryptoKey)) throw Ot("".concat(t3, " must be a CryptoKey"), Rt);
  })(e3, t2), "private" !== e3.type) throw Ot("".concat(t2, " must be a private CryptoKey"), xt);
}
function Xt(e3) {
  return null !== e3 && "object" == typeof e3 && !Array.isArray(e3);
}
function Gt(e3) {
  It(e3, Headers) && (e3 = Object.fromEntries(e3.entries()));
  const t2 = new Headers(null != e3 ? e3 : {});
  if (At && !t2.has("user-agent") && t2.set("user-agent", At), t2.has("authorization")) throw Ot('"options.headers" must not include the "authorization" header name', xt);
  return t2;
}
function Bt(e3, t2) {
  if (void 0 !== t2) {
    if ("function" == typeof t2 && (t2 = t2(e3.href)), !(t2 instanceof AbortSignal)) throw Ot('"options.signal" must return or be an instance of AbortSignal', Rt);
    return t2;
  }
}
function Yt(e3) {
  return e3.includes("//") ? e3.replace("//", "/") : e3;
}
async function Qt(e3, t2) {
  return (async function(e4, t3, n2, o2) {
    if (!(e4 instanceof URL)) throw Ot('"'.concat(t3, '" must be an instance of URL'), Rt);
    pn(e4, true !== (null == o2 ? void 0 : o2[Ct]));
    const r2 = n2(new URL(e4.href)), i2 = Gt(null == o2 ? void 0 : o2.headers);
    return i2.set("accept", "application/json"), ((null == o2 ? void 0 : o2[Wt]) || fetch)(r2.href, { body: void 0, headers: Object.fromEntries(i2.entries()), method: "GET", redirect: "manual", signal: Bt(r2, null == o2 ? void 0 : o2.signal) });
  })(e3, "issuerIdentifier", (e4) => {
    switch (null == t2 ? void 0 : t2.algorithm) {
      case void 0:
      case "oidc":
        !(function(e5, t3) {
          e5.pathname = Yt("".concat(e5.pathname, "/").concat(t3));
        })(e4, ".well-known/openid-configuration");
        break;
      case "oauth2":
        !(function(e5, t3) {
          let n2 = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
          "/" === e5.pathname ? e5.pathname = t3 : e5.pathname = Yt("".concat(t3, "/").concat(n2 ? e5.pathname : e5.pathname.replace(/(\/)$/, "")));
        })(e4, ".well-known/oauth-authorization-server");
        break;
      default:
        throw Ot('"options.algorithm" must be "oidc" (default), or "oauth2"', xt);
    }
    return e4;
  }, t2);
}
function $t(e3, t2, n2, o2, r2) {
  try {
    if ("number" != typeof e3 || !Number.isFinite(e3)) throw Ot("".concat(n2, " must be a number"), Rt, r2);
    if (e3 > 0) return;
    if (t2) {
      if (0 !== e3) throw Ot("".concat(n2, " must be a non-negative number"), xt, r2);
      return;
    }
    throw Ot("".concat(n2, " must be a positive number"), xt, r2);
  } catch (e4) {
    if (o2) throw Vt(e4.message, o2, r2);
    throw e4;
  }
}
function en(e3, t2, n2, o2) {
  try {
    if ("string" != typeof e3) throw Ot("".concat(t2, " must be a string"), Rt, o2);
    if (0 === e3.length) throw Ot("".concat(t2, " must not be empty"), xt, o2);
  } catch (e4) {
    if (n2) throw Vt(e4.message, n2, o2);
    throw e4;
  }
}
function tn(e3) {
  !(function(e4, t2) {
    if (In(e4) !== t2) throw (function(e5) {
      let t3 = '"response" content-type must be ';
      for (var n2 = arguments.length, o2 = new Array(n2 > 1 ? n2 - 1 : 0), r2 = 1; r2 < n2; r2++) o2[r2 - 1] = arguments[r2];
      if (o2.length > 2) {
        const e6 = o2.pop();
        t3 += "".concat(o2.join(", "), ", or ").concat(e6);
      } else 2 === o2.length ? t3 += "".concat(o2[0], " or ").concat(o2[1]) : t3 += o2[0];
      return Vt(t3, Bn, e5);
    })(e4, t2);
  })(e3, "application/json");
}
function nn() {
  return Jt(crypto.getRandomValues(new Uint8Array(32)));
}
function on(e3) {
  switch (e3.algorithm.name) {
    case "RSA-PSS":
      return (function(e4) {
        switch (e4.algorithm.hash.name) {
          case "SHA-256":
            return "PS256";
          case "SHA-384":
            return "PS384";
          case "SHA-512":
            return "PS512";
          default:
            throw new Zt("unsupported RsaHashedKeyAlgorithm hash name", { cause: e4 });
        }
      })(e3);
    case "RSASSA-PKCS1-v1_5":
      return (function(e4) {
        switch (e4.algorithm.hash.name) {
          case "SHA-256":
            return "RS256";
          case "SHA-384":
            return "RS384";
          case "SHA-512":
            return "RS512";
          default:
            throw new Zt("unsupported RsaHashedKeyAlgorithm hash name", { cause: e4 });
        }
      })(e3);
    case "ECDSA":
      return (function(e4) {
        switch (e4.algorithm.namedCurve) {
          case "P-256":
            return "ES256";
          case "P-384":
            return "ES384";
          case "P-521":
            return "ES512";
          default:
            throw new Zt("unsupported EcKeyAlgorithm namedCurve", { cause: e4 });
        }
      })(e3);
    case "Ed25519":
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87":
      return e3.algorithm.name;
    case "EdDSA":
      return "Ed25519";
    default:
      throw new Zt("unsupported CryptoKey algorithm name", { cause: e3 });
  }
}
function rn(e3) {
  const t2 = null == e3 ? void 0 : e3[jt];
  return "number" == typeof t2 && Number.isFinite(t2) ? t2 : 0;
}
function an(e3) {
  const t2 = null == e3 ? void 0 : e3[Dt];
  return "number" == typeof t2 && Number.isFinite(t2) && -1 !== Math.sign(t2) ? t2 : 30;
}
function sn() {
  return Math.floor(Date.now() / 1e3);
}
function cn(e3) {
  if ("object" != typeof e3 || null === e3) throw Ot('"as" must be an object', Rt);
  en(e3.issuer, '"as.issuer"');
}
function un(e3) {
  if ("object" != typeof e3 || null === e3) throw Ot('"client" must be an object', Rt);
  en(e3.client_id, '"client.client_id"');
}
function ln(e3) {
  return en(e3, '"clientSecret"'), (t2, n2, o2, r2) => {
    o2.set("client_id", n2.client_id), o2.set("client_secret", e3);
  };
}
function hn(e3, t2) {
  const { key: n2, kid: o2 } = (r2 = e3) instanceof CryptoKey ? { key: r2 } : (null == r2 ? void 0 : r2.key) instanceof CryptoKey ? (void 0 !== r2.kid && en(r2.kid, '"kid"'), { key: r2.key, kid: r2.kid }) : {};
  var r2;
  return qt(n2, '"clientPrivateKey.key"'), async (e4, r3, i2, a2) => {
    var s2;
    const c2 = { alg: on(n2), kid: o2 }, u2 = (function(e5, t3) {
      const n3 = sn() + rn(t3);
      return { jti: nn(), aud: e5.issuer, exp: n3 + 60, iat: n3, nbf: n3, iss: t3.client_id, sub: t3.client_id };
    })(e4, r3);
    null == t2 || null === (s2 = t2[Ut]) || void 0 === s2 || s2.call(t2, c2, u2), i2.set("client_id", r3.client_id), i2.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), i2.set("client_assertion", await (async function(e5, t3, n3) {
      if (!n3.usages.includes("sign")) throw Ot('CryptoKey instances used for signing assertions must include "sign" in their "usages"', xt);
      const o3 = "".concat(Jt(Nt(JSON.stringify(e5))), ".").concat(Jt(Nt(JSON.stringify(t3)))), r4 = Jt(await crypto.subtle.sign((function(e6) {
        switch (e6.algorithm.name) {
          case "ECDSA":
            return { name: e6.algorithm.name, hash: so(e6) };
          case "RSA-PSS":
            switch (ao(e6), e6.algorithm.hash.name) {
              case "SHA-256":
              case "SHA-384":
              case "SHA-512":
                return { name: e6.algorithm.name, saltLength: parseInt(e6.algorithm.hash.name.slice(-3), 10) >> 3 };
              default:
                throw new Zt("unsupported RSA-PSS hash name", { cause: e6 });
            }
          case "RSASSA-PKCS1-v1_5":
            return ao(e6), e6.algorithm.name;
          case "ML-DSA-44":
          case "ML-DSA-65":
          case "ML-DSA-87":
          case "Ed25519":
            return e6.algorithm.name;
        }
        throw new Zt("unsupported CryptoKey algorithm name", { cause: e6 });
      })(n3), n3, Nt(o3)));
      return "".concat(o3, ".").concat(r4);
    })(c2, u2, n2));
  };
}
var dn = URL.parse ? (e3, t2) => URL.parse(e3, t2) : (e3, t2) => {
  try {
    return new URL(e3, t2);
  } catch (e4) {
    return null;
  }
};
function pn(e3, t2) {
  if (t2 && "https:" !== e3.protocol) throw Vt("only requests to HTTPS are allowed", Qn, e3);
  if ("https:" !== e3.protocol && "http:" !== e3.protocol) throw Vt("only HTTP and HTTPS requests are allowed", $n, e3);
}
function fn(e3, t2, n2, o2) {
  let r2;
  if ("string" != typeof e3 || !(r2 = dn(e3))) throw Vt("authorization server metadata does not contain a valid ".concat(n2 ? '"as.mtls_endpoint_aliases.'.concat(t2, '"') : '"as.'.concat(t2, '"')), void 0 === e3 ? oo : ro, { attribute: n2 ? "mtls_endpoint_aliases.".concat(t2) : t2 });
  return pn(r2, o2), r2;
}
function mn(e3, t2, n2, o2) {
  return n2 && e3.mtls_endpoint_aliases && t2 in e3.mtls_endpoint_aliases ? fn(e3.mtls_endpoint_aliases[t2], t2, n2, o2) : fn(e3[t2], t2, n2, o2);
}
var yn = class extends Error {
  constructor(e3, t2) {
    var n2;
    super(e3, t2), vt(this, "cause", void 0), vt(this, "code", void 0), vt(this, "error", void 0), vt(this, "status", void 0), vt(this, "error_description", void 0), vt(this, "response", void 0), this.name = this.constructor.name, this.code = Fn, this.cause = t2.cause, this.error = t2.cause.error, this.status = t2.response.status, this.error_description = t2.cause.error_description, Object.defineProperty(this, "response", { enumerable: false, value: t2.response }), null === (n2 = Error.captureStackTrace) || void 0 === n2 || n2.call(Error, this, this.constructor);
  }
};
var wn = class extends Error {
  constructor(e3, t2) {
    var n2, o2;
    super(e3, t2), vt(this, "cause", void 0), vt(this, "code", void 0), vt(this, "error", void 0), vt(this, "error_description", void 0), this.name = this.constructor.name, this.code = qn, this.cause = t2.cause, this.error = t2.cause.get("error"), this.error_description = null !== (n2 = t2.cause.get("error_description")) && void 0 !== n2 ? n2 : void 0, null === (o2 = Error.captureStackTrace) || void 0 === o2 || o2.call(Error, this, this.constructor);
  }
};
var gn = class extends Error {
  constructor(e3, t2) {
    var n2;
    super(e3, t2), vt(this, "cause", void 0), vt(this, "code", void 0), vt(this, "response", void 0), vt(this, "status", void 0), this.name = this.constructor.name, this.code = Zn, this.cause = t2.cause, this.status = t2.response.status, this.response = t2.response, Object.defineProperty(this, "response", { enumerable: false }), null === (n2 = Error.captureStackTrace) || void 0 === n2 || n2.call(Error, this, this.constructor);
  }
};
var vn = "[a-zA-Z0-9!#$%&\\'\\*\\+\\-\\.\\^_`\\|~]+";
var bn = "(" + vn + ')\\s*=\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"';
var _n = "(" + vn + ")\\s*=\\s*(" + vn + ")";
var kn = new RegExp("^[,\\s]*(" + vn + ")");
var Sn = new RegExp("^[,\\s]*" + bn + "[,\\s]*(.*)");
var Tn = new RegExp("^[,\\s]*" + _n + "[,\\s]*(.*)");
var En = new RegExp("^([a-zA-Z0-9\\-\\._\\~\\+\\/]+={0,2})(?:$|[,\\s])(.*)");
async function Pn(e3, t2, n2) {
  if (e3.status !== t2) {
    let t3;
    var o2;
    if ((function(e4) {
      let t4;
      if (t4 = (function(e5) {
        if (!It(e5, Response)) throw Ot('"response" must be an instance of Response', Rt);
        const t5 = e5.headers.get("www-authenticate");
        if (null === t5) return;
        const n3 = [];
        let o3 = t5;
        for (; o3; ) {
          var r2;
          let e6 = o3.match(kn);
          const t6 = null === (r2 = e6) || void 0 === r2 ? void 0 : r2[1].toLowerCase();
          if (!t6) return;
          const i2 = o3.substring(e6[0].length);
          if (i2 && !i2.match(/^[\s,]/)) return;
          const a2 = i2.match(/^\s+(.*)$/), s2 = !!a2;
          o3 = a2 ? a2[1] : void 0;
          const c2 = {};
          let u2;
          if (s2) for (; o3; ) {
            let t7, n4;
            if (e6 = o3.match(Sn)) {
              if ([, t7, n4, o3] = e6, n4.includes("\\")) try {
                n4 = JSON.parse('"'.concat(n4, '"'));
              } catch (e7) {
              }
              c2[t7.toLowerCase()] = n4;
            } else {
              if (!(e6 = o3.match(Tn))) {
                if (e6 = o3.match(En)) {
                  if (Object.keys(c2).length) break;
                  [, u2, o3] = e6;
                  break;
                }
                return;
              }
              [, t7, n4, o3] = e6, c2[t7.toLowerCase()] = n4;
            }
          }
          else o3 = i2 || void 0;
          const l2 = { scheme: t6, parameters: c2 };
          u2 && (l2.token68 = u2), n3.push(l2);
        }
        return n3.length ? n3 : void 0;
      })(e4)) throw new gn("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: t4, response: e4 });
    })(e3), t3 = await (async function(e4) {
      if (e4.status > 399 && e4.status < 500) {
        io(e4), tn(e4);
        try {
          const t4 = await e4.clone().json();
          if (Xt(t4) && "string" == typeof t4.error && t4.error.length) return t4;
        } catch (e5) {
        }
      }
    })(e3)) throw await (null === (o2 = e3.body) || void 0 === o2 ? void 0 : o2.cancel()), new yn("server responded with an error in the response body", { cause: t3, response: e3 });
    throw Vt('"response" is not a conform '.concat(n2, " response (unexpected HTTP status code)"), Yn, e3);
  }
}
function An(e3) {
  if (!Kn.has(e3)) throw Ot('"options.DPoP" is not a valid DPoPHandle', xt);
}
function In(e3) {
  var t2;
  return null === (t2 = e3.headers.get("content-type")) || void 0 === t2 ? void 0 : t2.split(";")[0];
}
async function xn(e3, t2, n2, o2, r2, i2, a2) {
  return await n2(e3, t2, r2, i2), i2.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"), ((null == a2 ? void 0 : a2[Wt]) || fetch)(o2.href, { body: r2, headers: Object.fromEntries(i2.entries()), method: "POST", redirect: "manual", signal: Bt(o2, null == a2 ? void 0 : a2.signal) });
}
async function Rn(e3, t2, n2, o2, r2, i2) {
  var a2;
  const s2 = mn(e3, "token_endpoint", t2.use_mtls_endpoint_aliases, true !== (null == i2 ? void 0 : i2[Ct]));
  r2.set("grant_type", o2);
  const c2 = Gt(null == i2 ? void 0 : i2.headers);
  c2.set("accept", "application/json"), void 0 !== (null == i2 ? void 0 : i2.DPoP) && (An(i2.DPoP), await i2.DPoP.addProof(s2, c2, "POST"));
  const u2 = await xn(e3, t2, n2, s2, r2, c2, i2);
  return null == i2 || null === (a2 = i2.DPoP) || void 0 === a2 || a2.cacheNonce(u2, s2), u2;
}
var On = /* @__PURE__ */ new WeakMap();
var Cn = /* @__PURE__ */ new WeakMap();
function jn(e3) {
  if (!e3.id_token) return;
  const t2 = On.get(e3);
  if (!t2) throw Ot('"ref" was already garbage collected or did not resolve from the proper sources', xt);
  return t2;
}
async function Dn(e3, t2, n2, o2, r2, i2) {
  if (cn(e3), un(t2), !It(n2, Response)) throw Ot('"response" must be an instance of Response', Rt);
  await Pn(n2, 200, "Token Endpoint"), io(n2);
  const a2 = await mo(n2);
  if (en(a2.access_token, '"response" body "access_token" property', Gn, { body: a2 }), en(a2.token_type, '"response" body "token_type" property', Gn, { body: a2 }), a2.token_type = a2.token_type.toLowerCase(), void 0 !== a2.expires_in) {
    let e4 = "number" != typeof a2.expires_in ? parseFloat(a2.expires_in) : a2.expires_in;
    $t(e4, true, '"response" body "expires_in" property', Gn, { body: a2 }), a2.expires_in = e4;
  }
  if (void 0 !== a2.refresh_token && en(a2.refresh_token, '"response" body "refresh_token" property', Gn, { body: a2 }), void 0 !== a2.scope && "string" != typeof a2.scope) throw Vt('"response" body "scope" property must be a string', Gn, { body: a2 });
  if (void 0 !== a2.id_token) {
    en(a2.id_token, '"response" body "id_token" property', Gn, { body: a2 });
    const i3 = ["aud", "exp", "iat", "iss", "sub"];
    true === t2.require_auth_time && i3.push("auth_time"), void 0 !== t2.default_max_age && ($t(t2.default_max_age, true, '"client.default_max_age"'), i3.push("auth_time")), null != o2 && o2.length && i3.push(...o2);
    const { claims: s2, jwt: c2 } = await (async function(e4, t3, n3, o3, r3) {
      let i4, a3, { 0: s3, 1: c3, length: u2 } = e4.split(".");
      if (5 === u2) {
        if (void 0 === r3) throw new Zt("JWE decryption is not configured", { cause: e4 });
        e4 = await r3(e4), { 0: s3, 1: c3, length: u2 } = e4.split(".");
      }
      if (3 !== u2) throw Vt("Invalid JWT", Gn, e4);
      try {
        i4 = JSON.parse(Nt(Jt(s3)));
      } catch (e5) {
        throw Vt("failed to parse JWT Header body as base64url encoded JSON", Xn, e5);
      }
      if (!Xt(i4)) throw Vt("JWT Header must be a top level object", Gn, e4);
      if (t3(i4), void 0 !== i4.crit) throw new Zt('no JWT "crit" header parameter extensions are supported', { cause: { header: i4 } });
      try {
        a3 = JSON.parse(Nt(Jt(c3)));
      } catch (e5) {
        throw Vt("failed to parse JWT Payload body as base64url encoded JSON", Xn, e5);
      }
      if (!Xt(a3)) throw Vt("JWT Payload must be a top level object", Gn, e4);
      const l2 = sn() + n3;
      if (void 0 !== a3.exp) {
        if ("number" != typeof a3.exp) throw Vt('unexpected JWT "exp" (expiration time) claim type', Gn, { claims: a3 });
        if (a3.exp <= l2 - o3) throw Vt('unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp', eo, { claims: a3, now: l2, tolerance: o3, claim: "exp" });
      }
      if (void 0 !== a3.iat && "number" != typeof a3.iat) throw Vt('unexpected JWT "iat" (issued at) claim type', Gn, { claims: a3 });
      if (void 0 !== a3.iss && "string" != typeof a3.iss) throw Vt('unexpected JWT "iss" (issuer) claim type', Gn, { claims: a3 });
      if (void 0 !== a3.nbf) {
        if ("number" != typeof a3.nbf) throw Vt('unexpected JWT "nbf" (not before) claim type', Gn, { claims: a3 });
        if (a3.nbf > l2 + o3) throw Vt('unexpected JWT "nbf" (not before) claim value', eo, { claims: a3, now: l2, tolerance: o3, claim: "nbf" });
      }
      if (void 0 !== a3.aud && "string" != typeof a3.aud && !Array.isArray(a3.aud)) throw Vt('unexpected JWT "aud" (audience) claim type', Gn, { claims: a3 });
      return { header: i4, claims: a3, jwt: e4 };
    })(a2.id_token, uo.bind(void 0, t2.id_token_signed_response_alg, e3.id_token_signing_alg_values_supported, "RS256"), rn(t2), an(t2), r2).then(Nn.bind(void 0, i3)).then(Un.bind(void 0, e3)).then(Wn.bind(void 0, t2.client_id));
    if (Array.isArray(s2.aud) && 1 !== s2.aud.length) {
      if (void 0 === s2.azp) throw Vt('ID Token "aud" (audience) claim includes additional untrusted audiences', to, { claims: s2, claim: "aud" });
      if (s2.azp !== t2.client_id) throw Vt('unexpected ID Token "azp" (authorized party) claim value', to, { expected: t2.client_id, claims: s2, claim: "azp" });
    }
    void 0 !== s2.auth_time && $t(s2.auth_time, true, 'ID Token "auth_time" (authentication time)', Gn, { claims: s2 }), Cn.set(n2, c2), On.set(a2, s2);
  }
  if (void 0 !== (null == i2 ? void 0 : i2[a2.token_type])) i2[a2.token_type](n2, a2);
  else if ("dpop" !== a2.token_type && "bearer" !== a2.token_type) throw new Zt("unsupported `token_type` value", { cause: { body: a2 } });
  return a2;
}
function Wn(e3, t2) {
  if (Array.isArray(t2.claims.aud)) {
    if (!t2.claims.aud.includes(e3)) throw Vt('unexpected JWT "aud" (audience) claim value', to, { expected: e3, claims: t2.claims, claim: "aud" });
  } else if (t2.claims.aud !== e3) throw Vt('unexpected JWT "aud" (audience) claim value', to, { expected: e3, claims: t2.claims, claim: "aud" });
  return t2;
}
function Un(e3, t2) {
  var n2, o2;
  const r2 = null !== (n2 = null === (o2 = e3[wo]) || void 0 === o2 ? void 0 : o2.call(e3, t2)) && void 0 !== n2 ? n2 : e3.issuer;
  if (t2.claims.iss !== r2) throw Vt('unexpected JWT "iss" (issuer) claim value', to, { expected: r2, claims: t2.claims, claim: "iss" });
  return t2;
}
var Kn = /* @__PURE__ */ new WeakSet();
var Ln = /* @__PURE__ */ Symbol();
var Mn = { aud: "audience", c_hash: "code hash", client_id: "client id", exp: "expiration time", iat: "issued at", iss: "issuer", jti: "jwt id", nonce: "nonce", s_hash: "state hash", sub: "subject", ath: "access token hash", htm: "http method", htu: "http uri", cnf: "confirmation", auth_time: "authentication time" };
function Nn(e3, t2) {
  for (const n2 of e3) if (void 0 === t2.claims[n2]) throw Vt('JWT "'.concat(n2, '" (').concat(Mn[n2], ") claim missing"), Gn, { claims: t2.claims });
  return t2;
}
var zn = /* @__PURE__ */ Symbol();
var Hn = /* @__PURE__ */ Symbol();
async function Jn(e3, t2, n2, o2) {
  return "string" == typeof (null == o2 ? void 0 : o2.expectedNonce) || "number" == typeof (null == o2 ? void 0 : o2.maxAge) || null != o2 && o2.requireIdToken ? (async function(e4, t3, n3, o3, r2, i2, a2) {
    const s2 = [];
    switch (o3) {
      case void 0:
        o3 = zn;
        break;
      case zn:
        break;
      default:
        en(o3, '"expectedNonce" argument'), s2.push("nonce");
    }
    switch (null != r2 || (r2 = t3.default_max_age), r2) {
      case void 0:
        r2 = Hn;
        break;
      case Hn:
        break;
      default:
        $t(r2, true, '"maxAge" argument'), s2.push("auth_time");
    }
    const c2 = await Dn(e4, t3, n3, s2, i2, a2);
    en(c2.id_token, '"response" body "id_token" property', Gn, { body: c2 });
    const u2 = jn(c2);
    if (r2 !== Hn) {
      const e5 = sn() + rn(t3), n4 = an(t3);
      if (u2.auth_time + r2 < e5 - n4) throw Vt("too much time has elapsed since the last End-User authentication", eo, { claims: u2, now: e5, tolerance: n4, claim: "auth_time" });
    }
    if (o3 === zn) {
      if (void 0 !== u2.nonce) throw Vt('unexpected ID Token "nonce" claim value', to, { expected: void 0, claims: u2, claim: "nonce" });
    } else if (u2.nonce !== o3) throw Vt('unexpected ID Token "nonce" claim value', to, { expected: o3, claims: u2, claim: "nonce" });
    return c2;
  })(e3, t2, n2, o2.expectedNonce, o2.maxAge, o2[Kt], o2.recognizedTokenTypes) : (async function(e4, t3, n3, o3, r2) {
    const i2 = await Dn(e4, t3, n3, void 0, o3, r2), a2 = jn(i2);
    if (a2) {
      if (void 0 !== t3.default_max_age) {
        $t(t3.default_max_age, true, '"client.default_max_age"');
        const e5 = sn() + rn(t3), n4 = an(t3);
        if (a2.auth_time + t3.default_max_age < e5 - n4) throw Vt("too much time has elapsed since the last End-User authentication", eo, { claims: a2, now: e5, tolerance: n4, claim: "auth_time" });
      }
      if (void 0 !== a2.nonce) throw Vt('unexpected ID Token "nonce" claim value', to, { expected: void 0, claims: a2, claim: "nonce" });
    }
    return i2;
  })(e3, t2, n2, null == o2 ? void 0 : o2[Kt], null == o2 ? void 0 : o2.recognizedTokenTypes);
}
var Zn = "OAUTH_WWW_AUTHENTICATE_CHALLENGE";
var Fn = "OAUTH_RESPONSE_BODY_ERROR";
var Vn = "OAUTH_UNSUPPORTED_OPERATION";
var qn = "OAUTH_AUTHORIZATION_RESPONSE_ERROR";
var Xn = "OAUTH_PARSE_ERROR";
var Gn = "OAUTH_INVALID_RESPONSE";
var Bn = "OAUTH_RESPONSE_IS_NOT_JSON";
var Yn = "OAUTH_RESPONSE_IS_NOT_CONFORM";
var Qn = "OAUTH_HTTP_REQUEST_FORBIDDEN";
var $n = "OAUTH_REQUEST_PROTOCOL_FORBIDDEN";
var eo = "OAUTH_JWT_TIMESTAMP_CHECK_FAILED";
var to = "OAUTH_JWT_CLAIM_COMPARISON_FAILED";
var no = "OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED";
var oo = "OAUTH_MISSING_SERVER_METADATA";
var ro = "OAUTH_INVALID_SERVER_METADATA";
function io(e3) {
  if (e3.bodyUsed) throw Ot('"response" body has been used already', xt);
}
function ao(e3) {
  const { algorithm: t2 } = e3;
  if ("number" != typeof t2.modulusLength || t2.modulusLength < 2048) throw new Zt("unsupported ".concat(t2.name, " modulusLength"), { cause: e3 });
}
function so(e3) {
  const { algorithm: t2 } = e3;
  switch (t2.namedCurve) {
    case "P-256":
      return "SHA-256";
    case "P-384":
      return "SHA-384";
    case "P-521":
      return "SHA-512";
    default:
      throw new Zt("unsupported ECDSA namedCurve", { cause: e3 });
  }
}
async function co(e3) {
  if ("POST" !== e3.method) throw Ot("form_post responses are expected to use the POST method", xt, { cause: e3 });
  if ("application/x-www-form-urlencoded" !== In(e3)) throw Ot("form_post responses are expected to use the application/x-www-form-urlencoded content-type", xt, { cause: e3 });
  return (async function(e4) {
    if (e4.bodyUsed) throw Ot("form_post Request instances must contain a readable body", xt, { cause: e4 });
    return e4.text();
  })(e3);
}
function uo(e3, t2, n2, o2) {
  if (void 0 === e3) if (Array.isArray(t2)) {
    if (!t2.includes(o2.alg)) throw Vt('unexpected JWT "alg" header parameter', Gn, { header: o2, expected: t2, reason: "authorization server metadata" });
  } else {
    if (void 0 === n2) throw Vt('missing client or server configuration to verify used JWT "alg" header parameter', void 0, { client: e3, issuer: t2, fallback: n2 });
    if ("string" == typeof n2 ? o2.alg !== n2 : "function" == typeof n2 ? !n2(o2.alg) : !n2.includes(o2.alg)) throw Vt('unexpected JWT "alg" header parameter', Gn, { header: o2, expected: n2, reason: "default value" });
  }
  else if ("string" == typeof e3 ? o2.alg !== e3 : !e3.includes(o2.alg)) throw Vt('unexpected JWT "alg" header parameter', Gn, { header: o2, expected: e3, reason: "client configuration" });
}
function lo(e3, t2) {
  const { 0: n2, length: o2 } = e3.getAll(t2);
  if (o2 > 1) throw Vt('"'.concat(t2, '" parameter must be provided only once'), Gn);
  return n2;
}
var ho = /* @__PURE__ */ Symbol();
var po = /* @__PURE__ */ Symbol();
function fo(e3, t2, n2, o2) {
  if (cn(e3), un(t2), n2 instanceof URL && (n2 = n2.searchParams), !(n2 instanceof URLSearchParams)) throw Ot('"parameters" must be an instance of URLSearchParams, or URL', Rt);
  if (lo(n2, "response")) throw Vt('"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()', Gn, { parameters: n2 });
  const r2 = lo(n2, "iss"), i2 = lo(n2, "state");
  if (!r2 && e3.authorization_response_iss_parameter_supported) throw Vt('response parameter "iss" (issuer) missing', Gn, { parameters: n2 });
  if (r2 && r2 !== e3.issuer) throw Vt('unexpected "iss" (issuer) response parameter value', Gn, { expected: e3.issuer, parameters: n2 });
  switch (o2) {
    case void 0:
    case po:
      if (void 0 !== i2) throw Vt('unexpected "state" response parameter encountered', Gn, { expected: void 0, parameters: n2 });
      break;
    case ho:
      break;
    default:
      if (en(o2, '"expectedState" argument'), i2 !== o2) throw Vt(void 0 === i2 ? 'response parameter "state" missing' : 'unexpected "state" response parameter value', Gn, { expected: o2, parameters: n2 });
  }
  if (lo(n2, "error")) throw new wn("authorization response from the server is an error", { cause: n2 });
  const a2 = lo(n2, "id_token"), s2 = lo(n2, "token");
  if (void 0 !== a2 || void 0 !== s2) throw new Zt("implicit and hybrid flows are not supported");
  return c2 = new URLSearchParams(n2), Kn.add(c2), c2;
  var c2;
}
async function mo(e3) {
  let t2, n2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : tn;
  try {
    t2 = await e3.json();
  } catch (t3) {
    throw n2(e3), Vt('failed to parse "response" body as JSON', Xn, t3);
  }
  if (!Xt(t2)) throw Vt('"response" body must be a top level object', Gn, { body: t2 });
  return t2;
}
var yo = /* @__PURE__ */ Symbol();
var wo = /* @__PURE__ */ Symbol();
var go = new TextEncoder();
var vo = new TextDecoder();
function bo(e3) {
  const t2 = new Uint8Array(e3.length);
  for (let n2 = 0; n2 < e3.length; n2++) {
    const o2 = e3.charCodeAt(n2);
    if (o2 > 127) throw new TypeError("non-ASCII string encountered in encode()");
    t2[n2] = o2;
  }
  return t2;
}
function _o(e3) {
  if (Uint8Array.fromBase64) return Uint8Array.fromBase64(e3);
  const t2 = atob(e3), n2 = new Uint8Array(t2.length);
  for (let e4 = 0; e4 < t2.length; e4++) n2[e4] = t2.charCodeAt(e4);
  return n2;
}
function ko(e3) {
  if (Uint8Array.fromBase64) return Uint8Array.fromBase64("string" == typeof e3 ? e3 : vo.decode(e3), { alphabet: "base64url" });
  let t2 = e3;
  t2 instanceof Uint8Array && (t2 = vo.decode(t2)), t2 = t2.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return _o(t2);
  } catch (e4) {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}
var So = function(e3) {
  return new TypeError("CryptoKey does not support this operation, its ".concat(arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "algorithm.name", " must be ").concat(e3));
};
var To = (e3, t2) => e3.name === t2;
function Eo(e3, t2) {
  var n2;
  if ((n2 = e3.hash, parseInt(n2.name.slice(4), 10)) !== t2) throw So("SHA-".concat(t2), "algorithm.hash");
}
function Po(e3, t2, n2) {
  switch (t2) {
    case "HS256":
    case "HS384":
    case "HS512":
      if (!To(e3.algorithm, "HMAC")) throw So("HMAC");
      Eo(e3.algorithm, parseInt(t2.slice(2), 10));
      break;
    case "RS256":
    case "RS384":
    case "RS512":
      if (!To(e3.algorithm, "RSASSA-PKCS1-v1_5")) throw So("RSASSA-PKCS1-v1_5");
      Eo(e3.algorithm, parseInt(t2.slice(2), 10));
      break;
    case "PS256":
    case "PS384":
    case "PS512":
      if (!To(e3.algorithm, "RSA-PSS")) throw So("RSA-PSS");
      Eo(e3.algorithm, parseInt(t2.slice(2), 10));
      break;
    case "Ed25519":
    case "EdDSA":
      if (!To(e3.algorithm, "Ed25519")) throw So("Ed25519");
      break;
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87":
      if (!To(e3.algorithm, t2)) throw So(t2);
      break;
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!To(e3.algorithm, "ECDSA")) throw So("ECDSA");
      const n3 = (function(e4) {
        switch (e4) {
          case "ES256":
            return "P-256";
          case "ES384":
            return "P-384";
          case "ES512":
            return "P-521";
          default:
            throw new Error("unreachable");
        }
      })(t2);
      if (e3.algorithm.namedCurve !== n3) throw So(n3, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  !(function(e4, t3) {
    if (t3 && !e4.usages.includes(t3)) throw new TypeError("CryptoKey does not support this operation, its usages must include ".concat(t3, "."));
  })(e3, n2);
}
function Ao(e3, t2) {
  for (var n2 = arguments.length, o2 = new Array(n2 > 2 ? n2 - 2 : 0), r2 = 2; r2 < n2; r2++) o2[r2 - 2] = arguments[r2];
  if ((o2 = o2.filter(Boolean)).length > 2) {
    const t3 = o2.pop();
    e3 += "one of type ".concat(o2.join(", "), ", or ").concat(t3, ".");
  } else 2 === o2.length ? e3 += "one of type ".concat(o2[0], " or ").concat(o2[1], ".") : e3 += "of type ".concat(o2[0], ".");
  if (null == t2) e3 += " Received ".concat(t2);
  else if ("function" == typeof t2 && t2.name) e3 += " Received function ".concat(t2.name);
  else if ("object" == typeof t2 && null != t2) {
    var i2;
    null !== (i2 = t2.constructor) && void 0 !== i2 && i2.name && (e3 += " Received an instance of ".concat(t2.constructor.name));
  }
  return e3;
}
var Io = function(e3, t2) {
  for (var n2 = arguments.length, o2 = new Array(n2 > 2 ? n2 - 2 : 0), r2 = 2; r2 < n2; r2++) o2[r2 - 2] = arguments[r2];
  return Ao("Key for the ".concat(e3, " algorithm must be "), t2, ...o2);
};
var xo = class extends Error {
  constructor(e3, t2) {
    var n2;
    super(e3, t2), vt(this, "code", "ERR_JOSE_GENERIC"), this.name = this.constructor.name, null === (n2 = Error.captureStackTrace) || void 0 === n2 || n2.call(Error, this, this.constructor);
  }
};
vt(xo, "code", "ERR_JOSE_GENERIC");
var Ro = class extends xo {
  constructor(e3, t2) {
    let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "unspecified", o2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : "unspecified";
    super(e3, { cause: { claim: n2, reason: o2, payload: t2 } }), vt(this, "code", "ERR_JWT_CLAIM_VALIDATION_FAILED"), vt(this, "claim", void 0), vt(this, "reason", void 0), vt(this, "payload", void 0), this.claim = n2, this.reason = o2, this.payload = t2;
  }
};
vt(Ro, "code", "ERR_JWT_CLAIM_VALIDATION_FAILED");
var Oo = class extends xo {
  constructor(e3, t2) {
    let n2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "unspecified", o2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : "unspecified";
    super(e3, { cause: { claim: n2, reason: o2, payload: t2 } }), vt(this, "code", "ERR_JWT_EXPIRED"), vt(this, "claim", void 0), vt(this, "reason", void 0), vt(this, "payload", void 0), this.claim = n2, this.reason = o2, this.payload = t2;
  }
};
vt(Oo, "code", "ERR_JWT_EXPIRED");
var Co = class extends xo {
  constructor() {
    super(...arguments), vt(this, "code", "ERR_JOSE_ALG_NOT_ALLOWED");
  }
};
vt(Co, "code", "ERR_JOSE_ALG_NOT_ALLOWED");
var jo = class extends xo {
  constructor() {
    super(...arguments), vt(this, "code", "ERR_JOSE_NOT_SUPPORTED");
  }
};
vt(jo, "code", "ERR_JOSE_NOT_SUPPORTED");
vt(class extends xo {
  constructor() {
    super(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "decryption operation failed", arguments.length > 1 ? arguments[1] : void 0), vt(this, "code", "ERR_JWE_DECRYPTION_FAILED");
  }
}, "code", "ERR_JWE_DECRYPTION_FAILED");
vt(class extends xo {
  constructor() {
    super(...arguments), vt(this, "code", "ERR_JWE_INVALID");
  }
}, "code", "ERR_JWE_INVALID");
var Do = class extends xo {
  constructor() {
    super(...arguments), vt(this, "code", "ERR_JWS_INVALID");
  }
};
vt(Do, "code", "ERR_JWS_INVALID");
var Wo = class extends xo {
  constructor() {
    super(...arguments), vt(this, "code", "ERR_JWT_INVALID");
  }
};
vt(Wo, "code", "ERR_JWT_INVALID");
vt(class extends xo {
  constructor() {
    super(...arguments), vt(this, "code", "ERR_JWK_INVALID");
  }
}, "code", "ERR_JWK_INVALID");
var Uo = class extends xo {
  constructor() {
    super(...arguments), vt(this, "code", "ERR_JWKS_INVALID");
  }
};
vt(Uo, "code", "ERR_JWKS_INVALID");
var Ko = class extends xo {
  constructor() {
    super(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "no applicable key found in the JSON Web Key Set", arguments.length > 1 ? arguments[1] : void 0), vt(this, "code", "ERR_JWKS_NO_MATCHING_KEY");
  }
};
vt(Ko, "code", "ERR_JWKS_NO_MATCHING_KEY");
var Lo = class extends xo {
  constructor() {
    super(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "multiple matching keys found in the JSON Web Key Set", arguments.length > 1 ? arguments[1] : void 0), vt(this, Symbol.asyncIterator, void 0), vt(this, "code", "ERR_JWKS_MULTIPLE_MATCHING_KEYS");
  }
};
vt(Lo, "code", "ERR_JWKS_MULTIPLE_MATCHING_KEYS");
var Mo = class extends xo {
  constructor() {
    super(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "request timed out", arguments.length > 1 ? arguments[1] : void 0), vt(this, "code", "ERR_JWKS_TIMEOUT");
  }
};
vt(Mo, "code", "ERR_JWKS_TIMEOUT");
var No = class extends xo {
  constructor() {
    super(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "signature verification failed", arguments.length > 1 ? arguments[1] : void 0), vt(this, "code", "ERR_JWS_SIGNATURE_VERIFICATION_FAILED");
  }
};
vt(No, "code", "ERR_JWS_SIGNATURE_VERIFICATION_FAILED");
var zo = (e3) => {
  if ("CryptoKey" === (null == e3 ? void 0 : e3[Symbol.toStringTag])) return true;
  try {
    return e3 instanceof CryptoKey;
  } catch (e4) {
    return false;
  }
};
var Ho = (e3) => "KeyObject" === (null == e3 ? void 0 : e3[Symbol.toStringTag]);
var Jo = (e3) => zo(e3) || Ho(e3);
function Zo(e3, t2, n2) {
  try {
    return ko(e3);
  } catch (e4) {
    throw new n2("Failed to base64url decode the ".concat(t2));
  }
}
function Fo(e3) {
  if ("object" != typeof (t2 = e3) || null === t2 || "[object Object]" !== Object.prototype.toString.call(e3)) return false;
  var t2;
  if (null === Object.getPrototypeOf(e3)) return true;
  let n2 = e3;
  for (; null !== Object.getPrototypeOf(n2); ) n2 = Object.getPrototypeOf(n2);
  return Object.getPrototypeOf(e3) === n2;
}
var Vo = (e3) => Fo(e3) && "string" == typeof e3.kty;
async function qo(e3, t2, n2) {
  if (t2 instanceof Uint8Array) {
    if (!e3.startsWith("HS")) throw new TypeError((function(e4) {
      for (var t3 = arguments.length, n3 = new Array(t3 > 1 ? t3 - 1 : 0), o2 = 1; o2 < t3; o2++) n3[o2 - 1] = arguments[o2];
      return Ao("Key must be ", e4, ...n3);
    })(t2, "CryptoKey", "KeyObject", "JSON Web Key"));
    return crypto.subtle.importKey("raw", t2, { hash: "SHA-".concat(e3.slice(-3)), name: "HMAC" }, false, [n2]);
  }
  return Po(t2, e3, n2), t2;
}
async function Xo(e3, t2, n2, o2) {
  const r2 = await qo(e3, t2, "verify");
  !(function(e4, t3) {
    if (e4.startsWith("RS") || e4.startsWith("PS")) {
      const { modulusLength: n3 } = t3.algorithm;
      if ("number" != typeof n3 || n3 < 2048) throw new TypeError("".concat(e4, " requires key modulusLength to be 2048 bits or larger"));
    }
  })(e3, r2);
  const i2 = (function(e4, t3) {
    const n3 = "SHA-".concat(e4.slice(-3));
    switch (e4) {
      case "HS256":
      case "HS384":
      case "HS512":
        return { hash: n3, name: "HMAC" };
      case "PS256":
      case "PS384":
      case "PS512":
        return { hash: n3, name: "RSA-PSS", saltLength: parseInt(e4.slice(-3), 10) >> 3 };
      case "RS256":
      case "RS384":
      case "RS512":
        return { hash: n3, name: "RSASSA-PKCS1-v1_5" };
      case "ES256":
      case "ES384":
      case "ES512":
        return { hash: n3, name: "ECDSA", namedCurve: t3.namedCurve };
      case "Ed25519":
      case "EdDSA":
        return { name: "Ed25519" };
      case "ML-DSA-44":
      case "ML-DSA-65":
      case "ML-DSA-87":
        return { name: e4 };
      default:
        throw new jo("alg ".concat(e4, " is not supported either by JOSE or your javascript runtime"));
    }
  })(e3, r2.algorithm);
  try {
    return await crypto.subtle.verify(i2, r2, n2, o2);
  } catch (e4) {
    return false;
  }
}
var Go = 'Invalid or unsupported JWK "alg" (Algorithm) Parameter value';
async function Bo(e3) {
  var t2, n2;
  if (!e3.alg) throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  const { algorithm: o2, keyUsages: r2 } = (function(e4) {
    let t3, n3;
    switch (e4.kty) {
      case "AKP":
        switch (e4.alg) {
          case "ML-DSA-44":
          case "ML-DSA-65":
          case "ML-DSA-87":
            t3 = { name: e4.alg }, n3 = e4.priv ? ["sign"] : ["verify"];
            break;
          default:
            throw new jo(Go);
        }
        break;
      case "RSA":
        switch (e4.alg) {
          case "PS256":
          case "PS384":
          case "PS512":
            t3 = { name: "RSA-PSS", hash: "SHA-".concat(e4.alg.slice(-3)) }, n3 = e4.d ? ["sign"] : ["verify"];
            break;
          case "RS256":
          case "RS384":
          case "RS512":
            t3 = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-".concat(e4.alg.slice(-3)) }, n3 = e4.d ? ["sign"] : ["verify"];
            break;
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            t3 = { name: "RSA-OAEP", hash: "SHA-".concat(parseInt(e4.alg.slice(-3), 10) || 1) }, n3 = e4.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
            break;
          default:
            throw new jo(Go);
        }
        break;
      case "EC":
        switch (e4.alg) {
          case "ES256":
          case "ES384":
          case "ES512":
            t3 = { name: "ECDSA", namedCurve: { ES256: "P-256", ES384: "P-384", ES512: "P-521" }[e4.alg] }, n3 = e4.d ? ["sign"] : ["verify"];
            break;
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW":
            t3 = { name: "ECDH", namedCurve: e4.crv }, n3 = e4.d ? ["deriveBits"] : [];
            break;
          default:
            throw new jo(Go);
        }
        break;
      case "OKP":
        switch (e4.alg) {
          case "Ed25519":
          case "EdDSA":
            t3 = { name: "Ed25519" }, n3 = e4.d ? ["sign"] : ["verify"];
            break;
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW":
            t3 = { name: e4.crv }, n3 = e4.d ? ["deriveBits"] : [];
            break;
          default:
            throw new jo(Go);
        }
        break;
      default:
        throw new jo('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
    }
    return { algorithm: t3, keyUsages: n3 };
  })(e3), i2 = _t({}, e3);
  return "AKP" !== i2.kty && delete i2.alg, delete i2.use, crypto.subtle.importKey("jwk", i2, o2, null !== (t2 = e3.ext) && void 0 !== t2 ? t2 : !e3.d && !e3.priv, null !== (n2 = e3.key_ops) && void 0 !== n2 ? n2 : r2);
}
var Yo = "given KeyObject instance cannot be used for this algorithm";
var Qo;
var $o = async function(e3, t2, n2) {
  let o2 = arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
  Qo || (Qo = /* @__PURE__ */ new WeakMap());
  let r2 = Qo.get(e3);
  if (null != r2 && r2[n2]) return r2[n2];
  const i2 = await Bo(_t(_t({}, t2), {}, { alg: n2 }));
  return o2 && Object.freeze(e3), r2 ? r2[n2] = i2 : Qo.set(e3, { [n2]: i2 }), i2;
};
async function er(e3, t2) {
  if (e3 instanceof Uint8Array) return e3;
  if (zo(e3)) return e3;
  if (Ho(e3)) {
    if ("secret" === e3.type) return e3.export();
    if ("toCryptoKey" in e3 && "function" == typeof e3.toCryptoKey) try {
      return ((e4, t3) => {
        Qo || (Qo = /* @__PURE__ */ new WeakMap());
        let n3 = Qo.get(e4);
        if (null != n3 && n3[t3]) return n3[t3];
        const o2 = "public" === e4.type, r2 = !!o2;
        let i2;
        if ("x25519" === e4.asymmetricKeyType) {
          switch (t3) {
            case "ECDH-ES":
            case "ECDH-ES+A128KW":
            case "ECDH-ES+A192KW":
            case "ECDH-ES+A256KW":
              break;
            default:
              throw new TypeError(Yo);
          }
          i2 = e4.toCryptoKey(e4.asymmetricKeyType, r2, o2 ? [] : ["deriveBits"]);
        }
        if ("ed25519" === e4.asymmetricKeyType) {
          if ("EdDSA" !== t3 && "Ed25519" !== t3) throw new TypeError(Yo);
          i2 = e4.toCryptoKey(e4.asymmetricKeyType, r2, [o2 ? "verify" : "sign"]);
        }
        switch (e4.asymmetricKeyType) {
          case "ml-dsa-44":
          case "ml-dsa-65":
          case "ml-dsa-87":
            if (t3 !== e4.asymmetricKeyType.toUpperCase()) throw new TypeError(Yo);
            i2 = e4.toCryptoKey(e4.asymmetricKeyType, r2, [o2 ? "verify" : "sign"]);
        }
        if ("rsa" === e4.asymmetricKeyType) {
          let n4;
          switch (t3) {
            case "RSA-OAEP":
              n4 = "SHA-1";
              break;
            case "RS256":
            case "PS256":
            case "RSA-OAEP-256":
              n4 = "SHA-256";
              break;
            case "RS384":
            case "PS384":
            case "RSA-OAEP-384":
              n4 = "SHA-384";
              break;
            case "RS512":
            case "PS512":
            case "RSA-OAEP-512":
              n4 = "SHA-512";
              break;
            default:
              throw new TypeError(Yo);
          }
          if (t3.startsWith("RSA-OAEP")) return e4.toCryptoKey({ name: "RSA-OAEP", hash: n4 }, r2, o2 ? ["encrypt"] : ["decrypt"]);
          i2 = e4.toCryptoKey({ name: t3.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: n4 }, r2, [o2 ? "verify" : "sign"]);
        }
        if ("ec" === e4.asymmetricKeyType) {
          var a2;
          const n4 = (/* @__PURE__ */ new Map([["prime256v1", "P-256"], ["secp384r1", "P-384"], ["secp521r1", "P-521"]])).get(null === (a2 = e4.asymmetricKeyDetails) || void 0 === a2 ? void 0 : a2.namedCurve);
          if (!n4) throw new TypeError(Yo);
          const s2 = { ES256: "P-256", ES384: "P-384", ES512: "P-521" };
          s2[t3] && n4 === s2[t3] && (i2 = e4.toCryptoKey({ name: "ECDSA", namedCurve: n4 }, r2, [o2 ? "verify" : "sign"])), t3.startsWith("ECDH-ES") && (i2 = e4.toCryptoKey({ name: "ECDH", namedCurve: n4 }, r2, o2 ? [] : ["deriveBits"]));
        }
        if (!i2) throw new TypeError(Yo);
        return n3 ? n3[t3] = i2 : Qo.set(e4, { [t3]: i2 }), i2;
      })(e3, t2);
    } catch (e4) {
      if (e4 instanceof TypeError) throw e4;
    }
    let n2 = e3.export({ format: "jwk" });
    return $o(e3, n2, t2);
  }
  if (Vo(e3)) return e3.k ? ko(e3.k) : $o(e3, e3, t2, true);
  throw new Error("unreachable");
}
var tr = (e3, t2) => {
  if (e3.byteLength !== t2.length) return false;
  for (let n2 = 0; n2 < e3.byteLength; n2++) if (e3[n2] !== t2[n2]) return false;
  return true;
};
var nr = (e3) => {
  const t2 = e3.data[e3.pos++];
  if (128 & t2) {
    const n2 = 127 & t2;
    let o2 = 0;
    for (let t3 = 0; t3 < n2; t3++) o2 = o2 << 8 | e3.data[e3.pos++];
    return o2;
  }
  return t2;
};
var or = (e3, t2, n2) => {
  if (e3.data[e3.pos++] !== t2) throw new Error(n2);
};
var rr = (e3, t2) => {
  const n2 = e3.data.subarray(e3.pos, e3.pos + t2);
  return e3.pos += t2, n2;
};
var ir = (e3) => {
  const t2 = ((e4) => {
    or(e4, 6, "Expected algorithm OID");
    const t3 = nr(e4);
    return rr(e4, t3);
  })(e3);
  if (tr(t2, [43, 101, 110])) return "X25519";
  if (!tr(t2, [42, 134, 72, 206, 61, 2, 1])) throw new Error("Unsupported key algorithm");
  or(e3, 6, "Expected curve OID");
  const n2 = nr(e3), o2 = rr(e3, n2);
  for (const { name: e4, oid: t3 } of [{ name: "P-256", oid: [42, 134, 72, 206, 61, 3, 1, 7] }, { name: "P-384", oid: [43, 129, 4, 0, 34] }, { name: "P-521", oid: [43, 129, 4, 0, 35] }]) if (tr(o2, t3)) return e4;
  throw new Error("Unsupported named curve");
};
var ar = async (e3, t2, n2, o2) => {
  var r2;
  let i2, a2;
  const s2 = "spki" === e3, c2 = () => s2 ? ["verify"] : ["sign"];
  switch (n2) {
    case "PS256":
    case "PS384":
    case "PS512":
      i2 = { name: "RSA-PSS", hash: "SHA-".concat(n2.slice(-3)) }, a2 = c2();
      break;
    case "RS256":
    case "RS384":
    case "RS512":
      i2 = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-".concat(n2.slice(-3)) }, a2 = c2();
      break;
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512":
      i2 = { name: "RSA-OAEP", hash: "SHA-".concat(parseInt(n2.slice(-3), 10) || 1) }, a2 = s2 ? ["encrypt", "wrapKey"] : ["decrypt", "unwrapKey"];
      break;
    case "ES256":
    case "ES384":
    case "ES512":
      i2 = { name: "ECDSA", namedCurve: { ES256: "P-256", ES384: "P-384", ES512: "P-521" }[n2] }, a2 = c2();
      break;
    case "ECDH-ES":
    case "ECDH-ES+A128KW":
    case "ECDH-ES+A192KW":
    case "ECDH-ES+A256KW":
      try {
        const e4 = o2.getNamedCurve(t2);
        i2 = "X25519" === e4 ? { name: "X25519" } : { name: "ECDH", namedCurve: e4 };
      } catch (e4) {
        throw new jo("Invalid or unsupported key format");
      }
      a2 = s2 ? [] : ["deriveBits"];
      break;
    case "Ed25519":
    case "EdDSA":
      i2 = { name: "Ed25519" }, a2 = c2();
      break;
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87":
      i2 = { name: n2 }, a2 = c2();
      break;
    default:
      throw new jo('Invalid or unsupported "alg" (Algorithm) value');
  }
  return crypto.subtle.importKey(e3, t2, i2, null !== (r2 = null == o2 ? void 0 : o2.extractable) && void 0 !== r2 ? r2 : !!s2, a2);
};
var sr = (e3, t2, n2) => {
  var o2;
  const r2 = ((e4, t3) => _o(e4.replace(t3, "")))(e3, /(?:-----(?:BEGIN|END) PRIVATE KEY-----|\s)/g);
  let i2 = n2;
  return null != t2 && null !== (o2 = t2.startsWith) && void 0 !== o2 && o2.call(t2, "ECDH-ES") && (i2 || (i2 = {}), i2.getNamedCurve = (e4) => {
    const t3 = { data: e4, pos: 0 };
    return (function(e5) {
      or(e5, 48, "Invalid PKCS#8 structure"), nr(e5), or(e5, 2, "Expected version field");
      const t4 = nr(e5);
      e5.pos += t4, or(e5, 48, "Expected algorithm identifier");
      const n3 = nr(e5);
      e5.pos;
    })(t3), ir(t3);
  }), ar("pkcs8", r2, t2, i2);
};
var cr = (e3) => null == e3 ? void 0 : e3[Symbol.toStringTag];
var ur = (e3, t2, n2) => {
  if (void 0 !== t2.use) {
    let e4;
    switch (n2) {
      case "sign":
      case "verify":
        e4 = "sig";
        break;
      case "encrypt":
      case "decrypt":
        e4 = "enc";
    }
    if (t2.use !== e4) throw new TypeError('Invalid key for this operation, its "use" must be "'.concat(e4, '" when present'));
  }
  if (void 0 !== t2.alg && t2.alg !== e3) throw new TypeError('Invalid key for this operation, its "alg" must be "'.concat(e3, '" when present'));
  if (Array.isArray(t2.key_ops)) {
    var o2, r2;
    let i2;
    switch (true) {
      case ("sign" === n2 || "verify" === n2):
      case "dir" === e3:
      case e3.includes("CBC-HS"):
        i2 = n2;
        break;
      case e3.startsWith("PBES2"):
        i2 = "deriveBits";
        break;
      case /^A\d{3}(?:GCM)?(?:KW)?$/.test(e3):
        i2 = !e3.includes("GCM") && e3.endsWith("KW") ? "encrypt" === n2 ? "wrapKey" : "unwrapKey" : n2;
        break;
      case ("encrypt" === n2 && e3.startsWith("RSA")):
        i2 = "wrapKey";
        break;
      case "decrypt" === n2:
        i2 = e3.startsWith("RSA") ? "unwrapKey" : "deriveBits";
    }
    if (i2 && false === (null === (o2 = t2.key_ops) || void 0 === o2 || null === (r2 = o2.includes) || void 0 === r2 ? void 0 : r2.call(o2, i2))) throw new TypeError('Invalid key for this operation, its "key_ops" must include "'.concat(i2, '" when present'));
  }
  return true;
};
function lr(e3, t2, n2) {
  switch (e3.substring(0, 2)) {
    case "A1":
    case "A2":
    case "di":
    case "HS":
    case "PB":
      ((e4, t3, n3) => {
        if (!(t3 instanceof Uint8Array)) {
          if (Vo(t3)) {
            if (((e5) => "oct" === e5.kty && "string" == typeof e5.k)(t3) && ur(e4, t3, n3)) return;
            throw new TypeError('JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present');
          }
          if (!Jo(t3)) throw new TypeError(Io(e4, t3, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
          if ("secret" !== t3.type) throw new TypeError("".concat(cr(t3), ' instances for symmetric algorithms must be of type "secret"'));
        }
      })(e3, t2, n2);
      break;
    default:
      ((e4, t3, n3) => {
        if (Vo(t3)) switch (n3) {
          case "decrypt":
          case "sign":
            if (((e5) => "oct" !== e5.kty && ("AKP" === e5.kty && "string" == typeof e5.priv || "string" == typeof e5.d))(t3) && ur(e4, t3, n3)) return;
            throw new TypeError("JSON Web Key for this operation must be a private JWK");
          case "encrypt":
          case "verify":
            if (((e5) => "oct" !== e5.kty && void 0 === e5.d && void 0 === e5.priv)(t3) && ur(e4, t3, n3)) return;
            throw new TypeError("JSON Web Key for this operation must be a public JWK");
        }
        if (!Jo(t3)) throw new TypeError(Io(e4, t3, "CryptoKey", "KeyObject", "JSON Web Key"));
        if ("secret" === t3.type) throw new TypeError("".concat(cr(t3), ' instances for asymmetric algorithms must not be of type "secret"'));
        if ("public" === t3.type) switch (n3) {
          case "sign":
            throw new TypeError("".concat(cr(t3), ' instances for asymmetric algorithm signing must be of type "private"'));
          case "decrypt":
            throw new TypeError("".concat(cr(t3), ' instances for asymmetric algorithm decryption must be of type "private"'));
        }
        if ("private" === t3.type) switch (n3) {
          case "verify":
            throw new TypeError("".concat(cr(t3), ' instances for asymmetric algorithm verifying must be of type "public"'));
          case "encrypt":
            throw new TypeError("".concat(cr(t3), ' instances for asymmetric algorithm encryption must be of type "public"'));
        }
      })(e3, t2, n2);
  }
}
var hr;
var dr;
var pr;
var fr;
if ("undefined" == typeof navigator || null === (hr = navigator.userAgent) || void 0 === hr || null === (dr = hr.startsWith) || void 0 === dr || !dr.call(hr, "Mozilla/5.0 ")) {
  const e3 = "v6.8.2";
  fr = "".concat("openid-client", "/").concat(e3), pr = { "user-agent": fr };
}
var mr = (e3) => yr.get(e3);
var yr;
var wr;
function gr(e3) {
  return void 0 !== e3 ? ln(e3) : (wr || (wr = /* @__PURE__ */ new WeakMap()), (e4, t2, n2, o2) => {
    let r2;
    return (r2 = wr.get(t2)) || (!(function(e5, t3) {
      if ("string" != typeof e5) throw kr("".concat(t3, " must be a string"), _r);
      if (0 === e5.length) throw kr("".concat(t3, " must not be empty"), br);
    })(t2.client_secret, '"metadata.client_secret"'), r2 = ln(t2.client_secret), wr.set(t2, r2)), r2(e4, t2, n2, o2);
  });
}
var vr = Wt;
var br = "ERR_INVALID_ARG_VALUE";
var _r = "ERR_INVALID_ARG_TYPE";
function kr(e3, t2, n2) {
  const o2 = new TypeError(e3, { cause: n2 });
  return Object.assign(o2, { code: t2 }), o2;
}
function Sr(e3) {
  return (async function(e4) {
    return en(e4, "codeVerifier"), Jt(await crypto.subtle.digest("SHA-256", Nt(e4)));
  })(e3);
}
function Tr() {
  return nn();
}
var Er = class extends Error {
  constructor(e3, t2) {
    var n2;
    super(e3, t2), vt(this, "code", void 0), this.name = this.constructor.name, this.code = null == t2 ? void 0 : t2.code, null === (n2 = Error.captureStackTrace) || void 0 === n2 || n2.call(Error, this, this.constructor);
  }
};
function Pr(e3, t2, n2) {
  return new Er(e3, { cause: t2, code: n2 });
}
function Ar(e3) {
  if (e3 instanceof TypeError || e3 instanceof Er || e3 instanceof yn || e3 instanceof wn || e3 instanceof gn) throw e3;
  if (e3 instanceof Ft) switch (e3.code) {
    case Qn:
      throw Pr("only requests to HTTPS are allowed", e3, e3.code);
    case $n:
      throw Pr("only requests to HTTP or HTTPS are allowed", e3, e3.code);
    case Yn:
      throw Pr("unexpected HTTP response status code", e3.cause, e3.code);
    case Bn:
      throw Pr("unexpected response content-type", e3.cause, e3.code);
    case Xn:
      throw Pr("parsing error occured", e3, e3.code);
    case Gn:
      throw Pr("invalid response encountered", e3, e3.code);
    case to:
      throw Pr("unexpected JWT claim value encountered", e3, e3.code);
    case no:
      throw Pr("unexpected JSON attribute value encountered", e3, e3.code);
    case eo:
      throw Pr("JWT timestamp claim value failed validation", e3, e3.code);
    default:
      throw Pr(e3.message, e3, e3.code);
  }
  if (e3 instanceof Zt) throw Pr("unsupported operation", e3, e3.code);
  if (e3 instanceof DOMException) switch (e3.name) {
    case "OperationError":
      throw Pr("runtime operation error", e3, Vn);
    case "NotSupportedError":
      throw Pr("runtime unsupported operation", e3, Vn);
    case "TimeoutError":
      throw Pr("operation timed out", e3, "OAUTH_TIMEOUT");
    case "AbortError":
      throw Pr("operation aborted", e3, "OAUTH_ABORT");
  }
  throw new Er("something went wrong", { cause: e3 });
}
async function Ir(e3, t2, n2, o2, r2) {
  const i2 = await (async function(e4, t3) {
    var n3, o3;
    if (!(e4 instanceof URL)) throw kr('"server" must be an instance of URL', _r);
    const r3 = !e4.href.includes("/.well-known/"), i3 = null !== (n3 = null == t3 ? void 0 : t3.timeout) && void 0 !== n3 ? n3 : 30, a3 = AbortSignal.timeout(1e3 * i3), s3 = await (r3 ? Qt(e4, { algorithm: null == t3 ? void 0 : t3.algorithm, [Wt]: null == t3 ? void 0 : t3[vr], [Ct]: null == t3 || null === (o3 = t3.execute) || void 0 === o3 ? void 0 : o3.includes(Ur), signal: a3, headers: new Headers(pr) }) : ((null == t3 ? void 0 : t3[vr]) || fetch)((pn(e4, null == t3 || null === (c2 = t3.execute) || void 0 === c2 || !c2.includes(Ur)), e4.href), { headers: Object.fromEntries(new Headers(_t({ accept: "application/json" }, pr)).entries()), body: void 0, method: "GET", redirect: "manual", signal: a3 })).then((e5) => (async function(e6, t4) {
      const n4 = e6;
      if (!(n4 instanceof URL) && n4 !== yo) throw Ot('"expectedIssuerIdentifier" must be an instance of URL', Rt);
      if (!It(t4, Response)) throw Ot('"response" must be an instance of Response', Rt);
      if (200 !== t4.status) throw Vt('"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)', Yn, t4);
      io(t4);
      const o4 = await mo(t4);
      if (en(o4.issuer, '"response" body "issuer" property', Gn, { body: o4 }), n4 !== yo && new URL(o4.issuer).href !== n4.href) throw Vt('"response" body "issuer" property does not match the expected value', no, { expected: n4.href, body: o4, attribute: "issuer" });
      return o4;
    })(yo, e5)).catch(Ar);
    var c2;
    r3 && new URL(s3.issuer).href !== e4.href && ((function(e5, t4, n4) {
      return !("https://login.microsoftonline.com" !== e5.origin || null != n4 && n4.algorithm && "oidc" !== n4.algorithm || (t4[xr] = true, 0));
    })(e4, s3, t3) || (function(e5, t4) {
      return !(!e5.hostname.endsWith(".b2clogin.com") || null != t4 && t4.algorithm && "oidc" !== t4.algorithm);
    })(e4, t3) || (() => {
      throw new Er("discovered metadata issuer does not match the expected issuer", { code: no, cause: { expected: e4.href, body: s3, attribute: "issuer" } });
    })());
    return s3;
  })(e3, r2), a2 = new Rr(i2, t2, n2, o2);
  let s2 = mr(a2);
  if (null != r2 && r2[vr] && (s2.fetch = r2[vr]), null != r2 && r2.timeout && (s2.timeout = r2.timeout), null != r2 && r2.execute) for (const e4 of r2.execute) e4(a2);
  return a2;
}
new TextDecoder();
var xr = /* @__PURE__ */ Symbol();
var Rr = class {
  constructor(e3, t2, n2, o2) {
    var r2, i2, a2, s2, c2;
    if ("string" != typeof t2 || !t2.length) throw kr('"clientId" must be a non-empty string', _r);
    if ("string" == typeof n2 && (n2 = { client_secret: n2 }), void 0 !== (null === (r2 = n2) || void 0 === r2 ? void 0 : r2.client_id) && t2 !== n2.client_id) throw kr('"clientId" and "metadata.client_id" must be the same', br);
    const u2 = _t(_t({}, structuredClone(n2)), {}, { client_id: t2 });
    let l2;
    u2[jt] = null !== (i2 = null === (a2 = n2) || void 0 === a2 ? void 0 : a2[jt]) && void 0 !== i2 ? i2 : 0, u2[Dt] = null !== (s2 = null === (c2 = n2) || void 0 === c2 ? void 0 : c2[Dt]) && void 0 !== s2 ? s2 : 30, l2 = o2 || ("string" == typeof u2.client_secret && u2.client_secret.length ? gr(u2.client_secret) : (e4, t3, n3, o3) => {
      n3.set("client_id", t3.client_id);
    });
    let h2 = Object.freeze(u2);
    const d2 = structuredClone(e3);
    xr in e3 && (d2[wo] = (t3) => {
      let { claims: { tid: n3 } } = t3;
      return e3.issuer.replace("{tenantid}", n3);
    });
    let p2 = Object.freeze(d2);
    yr || (yr = /* @__PURE__ */ new WeakMap()), yr.set(this, { __proto__: null, as: p2, c: h2, auth: l2, tlsOnly: true, jwksCache: {} });
  }
  serverMetadata() {
    const e3 = structuredClone(mr(this).as);
    return (function(e4) {
      Object.defineProperties(e4, /* @__PURE__ */ (function(e5) {
        return { supportsPKCE: { __proto__: null, value() {
          var t2;
          let n2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "S256";
          return true === (null === (t2 = e5.code_challenge_methods_supported) || void 0 === t2 ? void 0 : t2.includes(n2));
        } } };
      })(e4));
    })(e3), e3;
  }
  clientMetadata() {
    return structuredClone(mr(this).c);
  }
  get timeout() {
    return mr(this).timeout;
  }
  set timeout(e3) {
    mr(this).timeout = e3;
  }
  get [vr]() {
    return mr(this).fetch;
  }
  set [vr](e3) {
    mr(this).fetch = e3;
  }
};
function Or(e3) {
  Object.defineProperties(e3, (function(e4) {
    let t2;
    if (void 0 !== e4.expires_in) {
      const n2 = /* @__PURE__ */ new Date();
      n2.setSeconds(n2.getSeconds() + e4.expires_in), t2 = n2.getTime();
    }
    return { expiresIn: { __proto__: null, value() {
      if (t2) {
        const e5 = Date.now();
        return t2 > e5 ? Math.floor((t2 - e5) / 1e3) : 0;
      }
    } }, claims: { __proto__: null, value() {
      try {
        return jn(this);
      } catch (e5) {
        return;
      }
    } } };
  })(e3));
}
async function Cr(e3, t2, n2) {
  var o2;
  let r2 = arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
  const i2 = null === (o2 = e3.headers.get("retry-after")) || void 0 === o2 ? void 0 : o2.trim();
  if (void 0 === i2) return;
  let a2;
  if (/^\d+$/.test(i2)) a2 = parseInt(i2, 10);
  else {
    const e4 = new Date(i2);
    if (Number.isFinite(e4.getTime())) {
      const t3 = /* @__PURE__ */ new Date(), n3 = e4.getTime() - t3.getTime();
      n3 > 0 && (a2 = Math.ceil(n3 / 1e3));
    }
  }
  if (r2 && !Number.isFinite(a2)) throw new Ft("invalid Retry-After header value", { cause: e3 });
  a2 > t2 && await jr(a2 - t2, n2);
}
function jr(e3, t2) {
  return new Promise((n2, o2) => {
    const r2 = (e4) => {
      try {
        t2.throwIfAborted();
      } catch (e5) {
        return void o2(e5);
      }
      if (e4 <= 0) return void n2();
      const i2 = Math.min(e4, 5);
      setTimeout(() => r2(e4 - i2), 1e3 * i2);
    };
    r2(e3);
  });
}
async function Dr(e3, t2) {
  Hr(e3);
  const { as: n2, c: o2, auth: r2, fetch: i2, tlsOnly: a2, timeout: s2 } = mr(e3);
  return (async function(e4, t3, n3, o3, r3) {
    cn(e4), un(t3);
    const i3 = mn(e4, "backchannel_authentication_endpoint", t3.use_mtls_endpoint_aliases, true !== (null == r3 ? void 0 : r3[Ct])), a3 = new URLSearchParams(o3);
    a3.set("client_id", t3.client_id);
    const s3 = Gt(null == r3 ? void 0 : r3.headers);
    return s3.set("accept", "application/json"), xn(e4, t3, n3, i3, a3, s3, r3);
  })(n2, o2, r2, t2, { [Wt]: i2, [Ct]: !a2, headers: new Headers(pr), signal: Jr(s2) }).then((e4) => (async function(e5, t3, n3) {
    if (cn(e5), un(t3), !It(n3, Response)) throw Ot('"response" must be an instance of Response', Rt);
    await Pn(n3, 200, "Backchannel Authentication Endpoint"), io(n3);
    const o3 = await mo(n3);
    en(o3.auth_req_id, '"response" body "auth_req_id" property', Gn, { body: o3 });
    let r3 = "number" != typeof o3.expires_in ? parseFloat(o3.expires_in) : o3.expires_in;
    return $t(r3, true, '"response" body "expires_in" property', Gn, { body: o3 }), o3.expires_in = r3, void 0 !== o3.interval && $t(o3.interval, false, '"response" body "interval" property', Gn, { body: o3 }), o3;
  })(n2, o2, e4)).catch(Ar);
}
async function Wr(e3, t2, n2, o2) {
  var r2, i2;
  Hr(e3), n2 = new URLSearchParams(n2);
  let a2 = null !== (r2 = t2.interval) && void 0 !== r2 ? r2 : 5;
  const s2 = null !== (i2 = null == o2 ? void 0 : o2.signal) && void 0 !== i2 ? i2 : AbortSignal.timeout(1e3 * t2.expires_in);
  try {
    await jr(a2, s2);
  } catch (e4) {
    Ar(e4);
  }
  const { as: c2, c: u2, auth: l2, fetch: h2, tlsOnly: d2, nonRepudiation: p2, timeout: f2, decrypt: m2 } = mr(e3), y2 = (r3, i3) => Wr(e3, _t(_t({}, t2), {}, { interval: r3 }), n2, _t(_t({}, o2), {}, { signal: s2, flag: i3 })), w2 = await (async function(e4, t3, n3, o3, r3) {
    cn(e4), un(t3), en(o3, '"authReqId"');
    const i3 = new URLSearchParams(null == r3 ? void 0 : r3.additionalParameters);
    return i3.set("auth_req_id", o3), Rn(e4, t3, n3, "urn:openid:params:grant-type:ciba", i3, r3);
  })(c2, u2, l2, t2.auth_req_id, { [Wt]: h2, [Ct]: !d2, additionalParameters: n2, DPoP: null == o2 ? void 0 : o2.DPoP, headers: new Headers(pr), signal: s2.aborted ? s2 : Jr(f2) }).catch(Ar);
  var g2;
  if (503 === w2.status && w2.headers.has("retry-after")) return await Cr(w2, a2, s2, true), await (null === (g2 = w2.body) || void 0 === g2 ? void 0 : g2.cancel()), y2(a2);
  const v3 = (async function(e4, t3, n3, o3) {
    return Dn(e4, t3, n3, void 0, null == o3 ? void 0 : o3[Kt], null == o3 ? void 0 : o3.recognizedTokenTypes);
  })(c2, u2, w2, { [Kt]: m2 });
  let b2;
  try {
    b2 = await v3;
  } catch (e4) {
    if (Zr(e4, o2)) return y2(a2, Fr);
    if (e4 instanceof yn) switch (e4.error) {
      case "slow_down":
        a2 += 5;
      case "authorization_pending":
        return await Cr(e4.response, a2, s2), y2(a2);
    }
    Ar(e4);
  }
  return b2.id_token && await (null == p2 ? void 0 : p2(w2)), Or(b2), b2;
}
function Ur(e3) {
  mr(e3).tlsOnly = false;
}
async function Kr(e3, t2, n2, o2, r2) {
  if (Hr(e3), !((null == r2 ? void 0 : r2.flag) === Fr || t2 instanceof URL || (function(e4, t3) {
    try {
      return Object.getPrototypeOf(e4)[Symbol.toStringTag] === t3;
    } catch (e5) {
      return false;
    }
  })(t2, "Request"))) throw kr('"currentUrl" must be an instance of URL, or Request', _r);
  let i2, a2;
  const { as: s2, c: c2, auth: u2, fetch: l2, tlsOnly: h2, jarm: d2, hybrid: p2, nonRepudiation: f2, timeout: m2, decrypt: y2, implicit: w2 } = mr(e3);
  if ((null == r2 ? void 0 : r2.flag) === Fr) i2 = r2.authResponse, a2 = r2.redirectUri;
  else {
    if (!(t2 instanceof URL)) {
      const e4 = t2;
      switch (t2 = new URL(t2.url), e4.method) {
        case "GET":
          break;
        case "POST":
          const n3 = new URLSearchParams(await co(e4));
          if (p2) t2.hash = n3.toString();
          else for (const [e5, o3] of n3.entries()) t2.searchParams.append(e5, o3);
          break;
        default:
          throw kr("unexpected Request HTTP method", br);
      }
    }
    switch (a2 = (function(e4) {
      return (e4 = new URL(e4)).search = "", e4.hash = "", e4.href;
    })(t2), true) {
      case !!d2:
        i2 = await d2(t2, null == n2 ? void 0 : n2.expectedState);
        break;
      case !!p2:
        i2 = await p2(t2, null == n2 ? void 0 : n2.expectedNonce, null == n2 ? void 0 : n2.expectedState, null == n2 ? void 0 : n2.maxAge);
        break;
      case !!w2:
        throw new TypeError("authorizationCodeGrant() cannot be used by response_type=id_token clients");
      default:
        try {
          i2 = fo(s2, c2, t2.searchParams, null == n2 ? void 0 : n2.expectedState);
        } catch (e4) {
          Ar(e4);
        }
    }
  }
  const g2 = await (async function(e4, t3, n3, o3, r3, i3, a3) {
    if (cn(e4), un(t3), !Kn.has(o3)) throw Ot('"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()', xt);
    en(r3, '"redirectUri"');
    const s3 = lo(o3, "code");
    if (!s3) throw Vt('no authorization code in "callbackParameters"', Gn);
    const c3 = new URLSearchParams(null == a3 ? void 0 : a3.additionalParameters);
    return c3.set("redirect_uri", r3), c3.set("code", s3), i3 !== Ln && (en(i3, '"codeVerifier"'), c3.set("code_verifier", i3)), Rn(e4, t3, n3, "authorization_code", c3, a3);
  })(s2, c2, u2, i2, a2, (null == n2 ? void 0 : n2.pkceCodeVerifier) || Ln, { additionalParameters: o2, [Wt]: l2, [Ct]: !h2, DPoP: null == r2 ? void 0 : r2.DPoP, headers: new Headers(pr), signal: Jr(m2) }).catch(Ar);
  "string" != typeof (null == n2 ? void 0 : n2.expectedNonce) && "number" != typeof (null == n2 ? void 0 : n2.maxAge) || (n2.idTokenExpected = true);
  const v3 = Jn(s2, c2, g2, { expectedNonce: null == n2 ? void 0 : n2.expectedNonce, maxAge: null == n2 ? void 0 : n2.maxAge, requireIdToken: null == n2 ? void 0 : n2.idTokenExpected, [Kt]: y2 });
  let b2;
  try {
    b2 = await v3;
  } catch (t3) {
    if (Zr(t3, r2)) return Kr(e3, void 0, n2, o2, _t(_t({}, r2), {}, { flag: Fr, authResponse: i2, redirectUri: a2 }));
    Ar(t3);
  }
  return b2.id_token && await (null == f2 ? void 0 : f2(g2)), Or(b2), b2;
}
async function Lr(e3, t2, n2, o2) {
  Hr(e3), n2 = new URLSearchParams(n2);
  const { as: r2, c: i2, auth: a2, fetch: s2, tlsOnly: c2, nonRepudiation: u2, timeout: l2, decrypt: h2 } = mr(e3), d2 = await (async function(e4, t3, n3, o3, r3) {
    cn(e4), un(t3), en(o3, '"refreshToken"');
    const i3 = new URLSearchParams(null == r3 ? void 0 : r3.additionalParameters);
    return i3.set("refresh_token", o3), Rn(e4, t3, n3, "refresh_token", i3, r3);
  })(r2, i2, a2, t2, { [Wt]: s2, [Ct]: !c2, additionalParameters: n2, DPoP: null == o2 ? void 0 : o2.DPoP, headers: new Headers(pr), signal: Jr(l2) }).catch(Ar), p2 = (async function(e4, t3, n3, o3) {
    return Dn(e4, t3, n3, void 0, null == o3 ? void 0 : o3[Kt], null == o3 ? void 0 : o3.recognizedTokenTypes);
  })(r2, i2, d2, { [Kt]: h2 });
  let f2;
  try {
    f2 = await p2;
  } catch (r3) {
    if (Zr(r3, o2)) return Lr(e3, t2, n2, _t(_t({}, o2), {}, { flag: Fr }));
    Ar(r3);
  }
  return f2.id_token && await (null == u2 ? void 0 : u2(d2)), Or(f2), f2;
}
async function Mr(e3, t2, n2) {
  Hr(e3), t2 = new URLSearchParams(t2);
  const { as: o2, c: r2, auth: i2, fetch: a2, tlsOnly: s2, timeout: c2 } = mr(e3), u2 = await (async function(e4, t3, n3, o3, r3) {
    return cn(e4), un(t3), Rn(e4, t3, n3, "client_credentials", new URLSearchParams(o3), r3);
  })(o2, r2, i2, t2, { [Wt]: a2, [Ct]: !s2, DPoP: null == n2 ? void 0 : n2.DPoP, headers: new Headers(pr), signal: Jr(c2) }).catch(Ar), l2 = (async function(e4, t3, n3, o3) {
    return Dn(e4, t3, n3, void 0, null == o3 ? void 0 : o3[Kt], null == o3 ? void 0 : o3.recognizedTokenTypes);
  })(o2, r2, u2);
  let h2;
  try {
    h2 = await l2;
  } catch (o3) {
    if (Zr(o3, n2)) return Mr(e3, t2, _t(_t({}, n2), {}, { flag: Fr }));
    Ar(o3);
  }
  return Or(h2), h2;
}
function Nr(e3, t2) {
  Hr(e3);
  const { as: n2, c: o2, tlsOnly: r2, hybrid: i2, jarm: a2, implicit: s2 } = mr(e3), c2 = mn(n2, "authorization_endpoint", false, r2);
  if ((t2 = new URLSearchParams(t2)).has("client_id") || t2.set("client_id", o2.client_id), !t2.has("request_uri") && !t2.has("request")) {
    if (t2.has("response_type") || t2.set("response_type", i2 ? "code id_token" : s2 ? "id_token" : "code"), s2 && !t2.has("nonce")) throw kr("response_type=id_token clients must provide a nonce parameter in their authorization request parameters", br);
    a2 && t2.set("response_mode", "jwt");
  }
  for (const [e4, n3] of t2.entries()) c2.searchParams.append(e4, n3);
  return c2;
}
async function zr(e3, t2, n2) {
  Hr(e3);
  const o2 = Nr(e3, t2), { as: r2, c: i2, auth: a2, fetch: s2, tlsOnly: c2, timeout: u2 } = mr(e3), l2 = await (async function(e4, t3, n3, o3, r3) {
    var i3;
    cn(e4), un(t3);
    const a3 = mn(e4, "pushed_authorization_request_endpoint", t3.use_mtls_endpoint_aliases, true !== (null == r3 ? void 0 : r3[Ct])), s3 = new URLSearchParams(o3);
    s3.set("client_id", t3.client_id);
    const c3 = Gt(null == r3 ? void 0 : r3.headers);
    c3.set("accept", "application/json"), void 0 !== (null == r3 ? void 0 : r3.DPoP) && (An(r3.DPoP), await r3.DPoP.addProof(a3, c3, "POST"));
    const u3 = await xn(e4, t3, n3, a3, s3, c3, r3);
    return null == r3 || null === (i3 = r3.DPoP) || void 0 === i3 || i3.cacheNonce(u3, a3), u3;
  })(r2, i2, a2, o2.searchParams, { [Wt]: s2, [Ct]: !c2, DPoP: null == n2 ? void 0 : n2.DPoP, headers: new Headers(pr), signal: Jr(u2) }).catch(Ar), h2 = (async function(e4, t3, n3) {
    if (cn(e4), un(t3), !It(n3, Response)) throw Ot('"response" must be an instance of Response', Rt);
    await Pn(n3, 201, "Pushed Authorization Request Endpoint"), io(n3);
    const o3 = await mo(n3);
    en(o3.request_uri, '"response" body "request_uri" property', Gn, { body: o3 });
    let r3 = "number" != typeof o3.expires_in ? parseFloat(o3.expires_in) : o3.expires_in;
    return $t(r3, true, '"response" body "expires_in" property', Gn, { body: o3 }), o3.expires_in = r3, o3;
  })(r2, i2, l2);
  let d2;
  try {
    d2 = await h2;
  } catch (o3) {
    if (Zr(o3, n2)) return zr(e3, t2, _t(_t({}, n2), {}, { flag: Fr }));
    Ar(o3);
  }
  return Nr(e3, { request_uri: d2.request_uri });
}
function Hr(e3) {
  if (!(e3 instanceof Rr)) throw kr('"config" must be an instance of Configuration', _r);
  if (Object.getPrototypeOf(e3) !== Rr.prototype) throw kr("subclassing Configuration is not allowed", br);
}
function Jr(e3) {
  return e3 ? AbortSignal.timeout(1e3 * e3) : void 0;
}
function Zr(e3, t2) {
  return !(null == t2 || !t2.DPoP || t2.flag === Fr) && (function(e4) {
    if (e4 instanceof gn) {
      const { 0: t3, length: n2 } = e4.cause;
      return 1 === n2 && "dpop" === t3.scheme && "use_dpop_nonce" === t3.parameters.error;
    }
    return e4 instanceof yn && "use_dpop_nonce" === e4.error;
  })(e3);
}
Object.freeze(Rr.prototype);
var Fr = /* @__PURE__ */ Symbol();
async function Vr(e3, t2, n2, o2) {
  Hr(e3);
  const { as: r2, c: i2, auth: a2, fetch: s2, tlsOnly: c2, timeout: u2, decrypt: l2 } = mr(e3), h2 = await (async function(e4, t3, n3, o3, r3, i3) {
    return cn(e4), un(t3), en(o3, '"grantType"'), Rn(e4, t3, n3, o3, new URLSearchParams(r3), i3);
  })(r2, i2, a2, t2, new URLSearchParams(n2), { [Wt]: s2, [Ct]: !c2, DPoP: null == o2 ? void 0 : o2.DPoP, headers: new Headers(pr), signal: Jr(u2) }).then((e4) => {
    let n3;
    return "urn:ietf:params:oauth:grant-type:token-exchange" === t2 && (n3 = { n_a: () => {
    } }), (async function(e5, t3, n4, o3) {
      return Dn(e5, t3, n4, void 0, null == o3 ? void 0 : o3[Kt], null == o3 ? void 0 : o3.recognizedTokenTypes);
    })(r2, i2, e4, { [Kt]: l2, recognizedTokenTypes: n3 });
  }).catch(Ar);
  return Or(h2), h2;
}
async function qr(e3, t2, n2) {
  if (!Fo(e3)) throw new Do("Flattened JWS must be an object");
  if (void 0 === e3.protected && void 0 === e3.header) throw new Do('Flattened JWS must have either of the "protected" or "header" members');
  if (void 0 !== e3.protected && "string" != typeof e3.protected) throw new Do("JWS Protected Header incorrect type");
  if (void 0 === e3.payload) throw new Do("JWS Payload missing");
  if ("string" != typeof e3.signature) throw new Do("JWS Signature missing or incorrect type");
  if (void 0 !== e3.header && !Fo(e3.header)) throw new Do("JWS Unprotected Header incorrect type");
  let o2 = {};
  if (e3.protected) try {
    const t3 = ko(e3.protected);
    o2 = JSON.parse(vo.decode(t3));
  } catch (e4) {
    throw new Do("JWS Protected Header is invalid");
  }
  if (!(function() {
    for (var e4 = arguments.length, t3 = new Array(e4), n3 = 0; n3 < e4; n3++) t3[n3] = arguments[n3];
    const o3 = t3.filter(Boolean);
    if (0 === o3.length || 1 === o3.length) return true;
    let r3;
    for (const e5 of o3) {
      const t4 = Object.keys(e5);
      if (r3 && 0 !== r3.size) for (const e6 of t4) {
        if (r3.has(e6)) return false;
        r3.add(e6);
      }
      else r3 = new Set(t4);
    }
    return true;
  })(o2, e3.header)) throw new Do("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  const r2 = _t(_t({}, o2), e3.header), i2 = (function(e4, t3, n3, o3, r3) {
    if (void 0 !== r3.crit && void 0 === (null == o3 ? void 0 : o3.crit)) throw new e4('"crit" (Critical) Header Parameter MUST be integrity protected');
    if (!o3 || void 0 === o3.crit) return /* @__PURE__ */ new Set();
    if (!Array.isArray(o3.crit) || 0 === o3.crit.length || o3.crit.some((e5) => "string" != typeof e5 || 0 === e5.length)) throw new e4('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
    let i3;
    i3 = void 0 !== n3 ? new Map([...Object.entries(n3), ...t3.entries()]) : t3;
    for (const t4 of o3.crit) {
      if (!i3.has(t4)) throw new jo('Extension Header Parameter "'.concat(t4, '" is not recognized'));
      if (void 0 === r3[t4]) throw new e4('Extension Header Parameter "'.concat(t4, '" is missing'));
      if (i3.get(t4) && void 0 === o3[t4]) throw new e4('Extension Header Parameter "'.concat(t4, '" MUST be integrity protected'));
    }
    return new Set(o3.crit);
  })(Do, /* @__PURE__ */ new Map([["b64", true]]), null == n2 ? void 0 : n2.crit, o2, r2);
  let a2 = true;
  if (i2.has("b64") && (a2 = o2.b64, "boolean" != typeof a2)) throw new Do('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
  const { alg: s2 } = r2;
  if ("string" != typeof s2 || !s2) throw new Do('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  const c2 = n2 && (function(e4, t3) {
    if (void 0 !== t3 && (!Array.isArray(t3) || t3.some((e5) => "string" != typeof e5))) throw new TypeError('"'.concat(e4, '" option must be an array of strings'));
    if (t3) return new Set(t3);
  })("algorithms", n2.algorithms);
  if (c2 && !c2.has(s2)) throw new Co('"alg" (Algorithm) Header Parameter value not allowed');
  if (a2) {
    if ("string" != typeof e3.payload) throw new Do("JWS Payload must be a string");
  } else if ("string" != typeof e3.payload && !(e3.payload instanceof Uint8Array)) throw new Do("JWS Payload must be a string or an Uint8Array instance");
  let u2 = false;
  "function" == typeof t2 && (t2 = await t2(o2, e3), u2 = true), lr(s2, t2, "verify");
  const l2 = (function() {
    for (var e4 = arguments.length, t3 = new Array(e4), n3 = 0; n3 < e4; n3++) t3[n3] = arguments[n3];
    const o3 = t3.reduce((e5, t4) => {
      let { length: n4 } = t4;
      return e5 + n4;
    }, 0), r3 = new Uint8Array(o3);
    let i3 = 0;
    for (const e5 of t3) r3.set(e5, i3), i3 += e5.length;
    return r3;
  })(void 0 !== e3.protected ? bo(e3.protected) : new Uint8Array(), bo("."), "string" == typeof e3.payload ? a2 ? bo(e3.payload) : go.encode(e3.payload) : e3.payload), h2 = Zo(e3.signature, "signature", Do), d2 = await er(t2, s2);
  if (!await Xo(s2, d2, h2, l2)) throw new No();
  let p2;
  p2 = a2 ? Zo(e3.payload, "payload", Do) : "string" == typeof e3.payload ? go.encode(e3.payload) : e3.payload;
  const f2 = { payload: p2 };
  return void 0 !== e3.protected && (f2.protectedHeader = o2), void 0 !== e3.header && (f2.unprotectedHeader = e3.header), u2 ? _t(_t({}, f2), {}, { key: d2 }) : f2;
}
var Xr = 86400;
var Gr = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
function Br(e3) {
  const t2 = Gr.exec(e3);
  if (!t2 || t2[4] && t2[1]) throw new TypeError("Invalid time period format");
  const n2 = parseFloat(t2[2]);
  let o2;
  switch (t2[3].toLowerCase()) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      o2 = Math.round(n2);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      o2 = Math.round(60 * n2);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      o2 = Math.round(3600 * n2);
      break;
    case "day":
    case "days":
    case "d":
      o2 = Math.round(n2 * Xr);
      break;
    case "week":
    case "weeks":
    case "w":
      o2 = Math.round(604800 * n2);
      break;
    default:
      o2 = Math.round(31557600 * n2);
  }
  return "-" === t2[1] || "ago" === t2[4] ? -o2 : o2;
}
var Yr = (e3) => e3.includes("/") ? e3.toLowerCase() : "application/".concat(e3.toLowerCase());
function Qr(e3, t2) {
  let n2, o2 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
  try {
    n2 = JSON.parse(vo.decode(t2));
  } catch (e4) {
  }
  if (!Fo(n2)) throw new Wo("JWT Claims Set must be a top-level JSON object");
  const { typ: r2 } = o2;
  if (r2 && ("string" != typeof e3.typ || Yr(e3.typ) !== Yr(r2))) throw new Ro('unexpected "typ" JWT header value', n2, "typ", "check_failed");
  const { requiredClaims: i2 = [], issuer: a2, subject: s2, audience: c2, maxTokenAge: u2 } = o2, l2 = [...i2];
  void 0 !== u2 && l2.push("iat"), void 0 !== c2 && l2.push("aud"), void 0 !== s2 && l2.push("sub"), void 0 !== a2 && l2.push("iss");
  for (const e4 of new Set(l2.reverse())) if (!(e4 in n2)) throw new Ro('missing required "'.concat(e4, '" claim'), n2, e4, "missing");
  if (a2 && !(Array.isArray(a2) ? a2 : [a2]).includes(n2.iss)) throw new Ro('unexpected "iss" claim value', n2, "iss", "check_failed");
  if (s2 && n2.sub !== s2) throw new Ro('unexpected "sub" claim value', n2, "sub", "check_failed");
  if (c2 && (h2 = n2.aud, d2 = "string" == typeof c2 ? [c2] : c2, !("string" == typeof h2 ? d2.includes(h2) : Array.isArray(h2) && d2.some(Set.prototype.has.bind(new Set(h2)))))) throw new Ro('unexpected "aud" claim value', n2, "aud", "check_failed");
  var h2, d2;
  let p2;
  switch (typeof o2.clockTolerance) {
    case "string":
      p2 = Br(o2.clockTolerance);
      break;
    case "number":
      p2 = o2.clockTolerance;
      break;
    case "undefined":
      p2 = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate: f2 } = o2, m2 = (y2 = f2 || /* @__PURE__ */ new Date(), Math.floor(y2.getTime() / 1e3));
  var y2;
  if ((void 0 !== n2.iat || u2) && "number" != typeof n2.iat) throw new Ro('"iat" claim must be a number', n2, "iat", "invalid");
  if (void 0 !== n2.nbf) {
    if ("number" != typeof n2.nbf) throw new Ro('"nbf" claim must be a number', n2, "nbf", "invalid");
    if (n2.nbf > m2 + p2) throw new Ro('"nbf" claim timestamp check failed', n2, "nbf", "check_failed");
  }
  if (void 0 !== n2.exp) {
    if ("number" != typeof n2.exp) throw new Ro('"exp" claim must be a number', n2, "exp", "invalid");
    if (n2.exp <= m2 - p2) throw new Oo('"exp" claim timestamp check failed', n2, "exp", "check_failed");
  }
  if (u2) {
    const e4 = m2 - n2.iat;
    if (e4 - p2 > ("number" == typeof u2 ? u2 : Br(u2))) throw new Oo('"iat" claim timestamp check failed (too far in the past)', n2, "iat", "check_failed");
    if (e4 < 0 - p2) throw new Ro('"iat" claim timestamp check failed (it should be in the past)', n2, "iat", "check_failed");
  }
  return n2;
}
async function $r(e3, t2, n2) {
  var o2;
  const r2 = await (async function(e4, t3, n3) {
    if (e4 instanceof Uint8Array && (e4 = vo.decode(e4)), "string" != typeof e4) throw new Do("Compact JWS must be a string or Uint8Array");
    const { 0: o3, 1: r3, 2: i3, length: a2 } = e4.split(".");
    if (3 !== a2) throw new Do("Invalid Compact JWS");
    const s2 = await qr({ payload: r3, protected: o3, signature: i3 }, t3, n3), c2 = { payload: s2.payload, protectedHeader: s2.protectedHeader };
    return "function" == typeof t3 ? _t(_t({}, c2), {}, { key: s2.key }) : c2;
  })(e3, t2, n2);
  if (null !== (o2 = r2.protectedHeader.crit) && void 0 !== o2 && o2.includes("b64") && false === r2.protectedHeader.b64) throw new Wo("JWTs MUST NOT use unencoded payload");
  const i2 = { payload: Qr(r2.protectedHeader, r2.payload, n2), protectedHeader: r2.protectedHeader };
  return "function" == typeof t2 ? _t(_t({}, i2), {}, { key: r2.key }) : i2;
}
function ei(e3) {
  return Fo(e3);
}
var ti;
var ni;
var oi = /* @__PURE__ */ new WeakMap();
var ri = /* @__PURE__ */ new WeakMap();
var ii = class {
  constructor(e3) {
    if (wt(this, oi, void 0), wt(this, ri, /* @__PURE__ */ new WeakMap()), !(function(e4) {
      return e4 && "object" == typeof e4 && Array.isArray(e4.keys) && e4.keys.every(ei);
    })(e3)) throw new Uo("JSON Web Key Set malformed");
    gt(oi, this, structuredClone(e3));
  }
  jwks() {
    return yt(oi, this);
  }
  async getKey(e3, t2) {
    const { alg: n2, kid: o2 } = _t(_t({}, e3), null == t2 ? void 0 : t2.header), r2 = (function(e4) {
      switch ("string" == typeof e4 && e4.slice(0, 2)) {
        case "RS":
        case "PS":
          return "RSA";
        case "ES":
          return "EC";
        case "Ed":
          return "OKP";
        case "ML":
          return "AKP";
        default:
          throw new jo('Unsupported "alg" value for a JSON Web Key Set');
      }
    })(n2), i2 = yt(oi, this).keys.filter((e4) => {
      let t3 = r2 === e4.kty;
      if (t3 && "string" == typeof o2 && (t3 = o2 === e4.kid), !t3 || "string" != typeof e4.alg && "AKP" !== r2 || (t3 = n2 === e4.alg), t3 && "string" == typeof e4.use && (t3 = "sig" === e4.use), t3 && Array.isArray(e4.key_ops) && (t3 = e4.key_ops.includes("verify")), t3) switch (n2) {
        case "ES256":
          t3 = "P-256" === e4.crv;
          break;
        case "ES384":
          t3 = "P-384" === e4.crv;
          break;
        case "ES512":
          t3 = "P-521" === e4.crv;
          break;
        case "Ed25519":
        case "EdDSA":
          t3 = "Ed25519" === e4.crv;
      }
      return t3;
    }), { 0: a2, length: s2 } = i2;
    if (0 === s2) throw new Ko();
    if (1 !== s2) {
      const e4 = new Lo(), t3 = yt(ri, this);
      throw e4[Symbol.asyncIterator] = St(function* () {
        for (const e5 of i2) try {
          yield yield ft(ai(t3, e5, n2));
        } catch (e6) {
        }
      }), e4;
    }
    return ai(yt(ri, this), a2, n2);
  }
};
async function ai(e3, t2, n2) {
  const o2 = e3.get(t2) || e3.set(t2, {}).get(t2);
  if (void 0 === o2[n2]) {
    const e4 = await (async function(e5, t3, n3) {
      var o3;
      if (!Fo(e5)) throw new TypeError("JWK must be an object");
      let r2;
      switch (null != t3 || (t3 = e5.alg), null != r2 || (r2 = null !== (o3 = null == n3 ? void 0 : n3.extractable) && void 0 !== o3 ? o3 : e5.ext), e5.kty) {
        case "oct":
          if ("string" != typeof e5.k || !e5.k) throw new TypeError('missing "k" (Key Value) Parameter value');
          return ko(e5.k);
        case "RSA":
          if ("oth" in e5 && void 0 !== e5.oth) throw new jo('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
          return Bo(_t(_t({}, e5), {}, { alg: t3, ext: r2 }));
        case "AKP":
          if ("string" != typeof e5.alg || !e5.alg) throw new TypeError('missing "alg" (Algorithm) Parameter value');
          if (void 0 !== t3 && t3 !== e5.alg) throw new TypeError("JWK alg and alg option value mismatch");
          return Bo(_t(_t({}, e5), {}, { ext: r2 }));
        case "EC":
        case "OKP":
          return Bo(_t(_t({}, e5), {}, { alg: t3, ext: r2 }));
        default:
          throw new jo('Unsupported "kty" (Key Type) Parameter value');
      }
    })(_t(_t({}, t2), {}, { ext: true }), n2);
    if (e4 instanceof Uint8Array || "public" !== e4.type) throw new Uo("JSON Web Key Set members must be public keys");
    o2[n2] = e4;
  }
  return o2[n2];
}
function si(e3) {
  const t2 = new ii(e3), n2 = async (e4, n3) => t2.getKey(e4, n3);
  return Object.defineProperties(n2, { jwks: { value: () => structuredClone(t2.jwks()), enumerable: false, configurable: false, writable: false } }), n2;
}
var ci;
if ("undefined" == typeof navigator || null === (ti = navigator.userAgent) || void 0 === ti || null === (ni = ti.startsWith) || void 0 === ni || !ni.call(ti, "Mozilla/5.0 ")) {
  const e3 = "v6.2.1";
  ci = "".concat("jose", "/").concat(e3);
}
var ui = /* @__PURE__ */ Symbol();
var li = /* @__PURE__ */ Symbol();
var hi = /* @__PURE__ */ new WeakMap();
var di = /* @__PURE__ */ new WeakMap();
var pi = /* @__PURE__ */ new WeakMap();
var fi = /* @__PURE__ */ new WeakMap();
var mi = /* @__PURE__ */ new WeakMap();
var yi = /* @__PURE__ */ new WeakMap();
var wi = /* @__PURE__ */ new WeakMap();
var gi = /* @__PURE__ */ new WeakMap();
var vi = /* @__PURE__ */ new WeakMap();
var bi = /* @__PURE__ */ new WeakMap();
var _i = class {
  constructor(e3, t2) {
    if (wt(this, hi, void 0), wt(this, di, void 0), wt(this, pi, void 0), wt(this, fi, void 0), wt(this, mi, void 0), wt(this, yi, void 0), wt(this, wi, void 0), wt(this, gi, void 0), wt(this, vi, void 0), wt(this, bi, void 0), !(e3 instanceof URL)) throw new TypeError("url must be an instance of URL");
    var n2, o2;
    gt(hi, this, new URL(e3.href)), gt(di, this, "number" == typeof (null == t2 ? void 0 : t2.timeoutDuration) ? null == t2 ? void 0 : t2.timeoutDuration : 5e3), gt(pi, this, "number" == typeof (null == t2 ? void 0 : t2.cooldownDuration) ? null == t2 ? void 0 : t2.cooldownDuration : 3e4), gt(fi, this, "number" == typeof (null == t2 ? void 0 : t2.cacheMaxAge) ? null == t2 ? void 0 : t2.cacheMaxAge : 6e5), gt(wi, this, new Headers(null == t2 ? void 0 : t2.headers)), ci && !yt(wi, this).has("User-Agent") && yt(wi, this).set("User-Agent", ci), yt(wi, this).has("accept") || (yt(wi, this).set("accept", "application/json"), yt(wi, this).append("accept", "application/jwk-set+json")), gt(gi, this, null == t2 ? void 0 : t2[ui]), void 0 !== (null == t2 ? void 0 : t2[li]) && (gt(bi, this, null == t2 ? void 0 : t2[li]), n2 = null == t2 ? void 0 : t2[li], o2 = yt(fi, this), "object" == typeof n2 && null !== n2 && "uat" in n2 && "number" == typeof n2.uat && !(Date.now() - n2.uat >= o2) && "jwks" in n2 && Fo(n2.jwks) && Array.isArray(n2.jwks.keys) && Array.prototype.every.call(n2.jwks.keys, Fo) && (gt(mi, this, yt(bi, this).uat), gt(vi, this, si(yt(bi, this).jwks))));
  }
  pendingFetch() {
    return !!yt(yi, this);
  }
  coolingDown() {
    return "number" == typeof yt(mi, this) && Date.now() < yt(mi, this) + yt(pi, this);
  }
  fresh() {
    return "number" == typeof yt(mi, this) && Date.now() < yt(mi, this) + yt(fi, this);
  }
  jwks() {
    var e3;
    return null === (e3 = yt(vi, this)) || void 0 === e3 ? void 0 : e3.jwks();
  }
  async getKey(e3, t2) {
    yt(vi, this) && this.fresh() || await this.reload();
    try {
      return await yt(vi, this).call(this, e3, t2);
    } catch (n2) {
      if (n2 instanceof Ko && false === this.coolingDown()) return await this.reload(), yt(vi, this).call(this, e3, t2);
      throw n2;
    }
  }
  async reload() {
    yt(yi, this) && ("undefined" != typeof WebSocketPair || "undefined" != typeof navigator && "Cloudflare-Workers" === navigator.userAgent || "undefined" != typeof EdgeRuntime && "vercel" === EdgeRuntime) && gt(yi, this, void 0), yt(yi, this) || gt(yi, this, (async function(e3, t2, n2) {
      let o2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : fetch;
      const r2 = await o2(e3, { method: "GET", signal: n2, redirect: "manual", headers: t2 }).catch((e4) => {
        if ("TimeoutError" === e4.name) throw new Mo();
        throw e4;
      });
      if (200 !== r2.status) throw new xo("Expected 200 OK from the JSON Web Key Set HTTP response");
      try {
        return await r2.json();
      } catch (e4) {
        throw new xo("Failed to parse the JSON Web Key Set HTTP response as JSON");
      }
    })(yt(hi, this).href, yt(wi, this), AbortSignal.timeout(yt(di, this)), yt(gi, this)).then((e3) => {
      gt(vi, this, si(e3)), yt(bi, this) && (yt(bi, this).uat = Date.now(), yt(bi, this).jwks = e3), gt(mi, this, Date.now()), gt(yi, this, void 0);
    }).catch((e3) => {
      throw gt(yi, this, void 0), e3;
    })), await yt(yi, this);
  }
};
var ki = ["mfaToken"];
var Si = ["mfaToken"];
var Ti;
var Ei;
var Pi;
var Ai;
var Ii;
var xi;
var Ri;
var Oi;
var Ci;
var ji;
var Di;
var Wi;
var Ui;
var Ki;
var Li;
var Mi;
var Ni = class extends Error {
  constructor(e3, t2) {
    super(t2), vt(this, "code", void 0), this.name = "NotSupportedError", this.code = e3;
  }
};
var zi = class extends Error {
  constructor(e3, t2, n2) {
    super(t2), vt(this, "cause", void 0), vt(this, "code", void 0), this.code = e3, this.cause = n2 && { error: n2.error, error_description: n2.error_description, message: n2.message };
  }
};
var Hi = class extends zi {
  constructor(e3, t2) {
    super("token_by_code_error", e3, t2), this.name = "TokenByCodeError";
  }
};
var Ji = class extends zi {
  constructor(e3, t2) {
    super("token_by_client_credentials_error", e3, t2), this.name = "TokenByClientCredentialsError";
  }
};
var Zi = class extends zi {
  constructor(e3, t2) {
    super("token_by_refresh_token_error", e3, t2), this.name = "TokenByRefreshTokenError";
  }
};
var Fi = class extends zi {
  constructor(e3, t2) {
    super("token_for_connection_error", e3, t2), this.name = "TokenForConnectionErrorCode";
  }
};
var Vi = class extends zi {
  constructor(e3, t2) {
    super("token_exchange_error", e3, t2), this.name = "TokenExchangeError";
  }
};
var qi = class extends Error {
  constructor(e3) {
    super(e3), vt(this, "code", "verify_logout_token_error"), this.name = "VerifyLogoutTokenError";
  }
};
var Xi = class extends zi {
  constructor(e3) {
    super("backchannel_authentication_error", "There was an error when trying to use Client-Initiated Backchannel Authentication.", e3), vt(this, "code", "backchannel_authentication_error"), this.name = "BackchannelAuthenticationError";
  }
};
var Gi = class extends zi {
  constructor(e3) {
    super("build_authorization_url_error", "There was an error when trying to build the authorization URL.", e3), this.name = "BuildAuthorizationUrlError";
  }
};
var Bi = class extends zi {
  constructor(e3) {
    super("build_link_user_url_error", "There was an error when trying to build the Link User URL.", e3), this.name = "BuildLinkUserUrlError";
  }
};
var Yi = class extends zi {
  constructor(e3) {
    super("build_unlink_user_url_error", "There was an error when trying to build the Unlink User URL.", e3), this.name = "BuildUnlinkUserUrlError";
  }
};
var Qi = class extends Error {
  constructor() {
    super("The client secret or client assertion signing key must be provided."), vt(this, "code", "missing_client_auth_error"), this.name = "MissingClientAuthError";
  }
};
function $i(e3) {
  return Object.entries(e3).filter((e4) => {
    let [, t2] = e4;
    return void 0 !== t2;
  }).reduce((e4, t2) => _t(_t({}, e4), {}, { [t2[0]]: t2[1] }), {});
}
var ea = class extends Error {
  constructor(e3, t2, n2) {
    super(t2), vt(this, "cause", void 0), vt(this, "code", void 0), this.code = e3, this.cause = n2 && { error: n2.error, error_description: n2.error_description, message: n2.message };
  }
};
var ta = class extends ea {
  constructor(e3, t2) {
    super("mfa_list_authenticators_error", e3, t2), this.name = "MfaListAuthenticatorsError";
  }
};
var na = class extends ea {
  constructor(e3, t2) {
    super("mfa_enrollment_error", e3, t2), this.name = "MfaEnrollmentError";
  }
};
var oa = class extends ea {
  constructor(e3, t2) {
    super("mfa_delete_authenticator_error", e3, t2), this.name = "MfaDeleteAuthenticatorError";
  }
};
var ra = class extends ea {
  constructor(e3, t2) {
    super("mfa_challenge_error", e3, t2), this.name = "MfaChallengeError";
  }
};
function ia(e3) {
  return { id: e3.id, authenticatorType: e3.authenticator_type, active: e3.active, name: e3.name, oobChannels: e3.oob_channels, type: e3.type };
}
var aa = (Ti = /* @__PURE__ */ new WeakMap(), Ei = /* @__PURE__ */ new WeakMap(), Pi = /* @__PURE__ */ new WeakMap(), class {
  constructor(e3) {
    var t2;
    wt(this, Ti, void 0), wt(this, Ei, void 0), wt(this, Pi, void 0), gt(Ti, this, "https://".concat(e3.domain)), gt(Ei, this, e3.clientId), gt(Pi, this, null !== (t2 = e3.customFetch) && void 0 !== t2 ? t2 : function() {
      return fetch(...arguments);
    });
  }
  async listAuthenticators(e3) {
    const t2 = "".concat(yt(Ti, this), "/mfa/authenticators"), { mfaToken: n2 } = e3, o2 = await yt(Pi, this).call(this, t2, { method: "GET", headers: { Authorization: "Bearer ".concat(n2), "Content-Type": "application/json" } });
    if (!o2.ok) {
      const e4 = await o2.json();
      throw new ta(e4.error_description || "Failed to list authenticators", e4);
    }
    return (await o2.json()).map(ia);
  }
  async enrollAuthenticator(e3) {
    const t2 = "".concat(yt(Ti, this), "/mfa/associate"), { mfaToken: n2 } = e3, o2 = kt(e3, ki), r2 = { authenticator_types: o2.authenticatorTypes };
    "oobChannels" in o2 && (r2.oob_channels = o2.oobChannels), "phoneNumber" in o2 && o2.phoneNumber && (r2.phone_number = o2.phoneNumber), "email" in o2 && o2.email && (r2.email = o2.email);
    const i2 = await yt(Pi, this).call(this, t2, { method: "POST", headers: { Authorization: "Bearer ".concat(n2), "Content-Type": "application/json" }, body: JSON.stringify(r2) });
    if (!i2.ok) {
      const e4 = await i2.json();
      throw new na(e4.error_description || "Failed to enroll authenticator", e4);
    }
    return (function(e4) {
      if ("otp" === e4.authenticator_type) return { authenticatorType: "otp", secret: e4.secret, barcodeUri: e4.barcode_uri, recoveryCodes: e4.recovery_codes, id: e4.id };
      if ("oob" === e4.authenticator_type) return { authenticatorType: "oob", oobChannel: e4.oob_channel, oobCode: e4.oob_code, bindingMethod: e4.binding_method, id: e4.id, barcodeUri: e4.barcode_uri, recoveryCodes: e4.recovery_codes };
      throw new Error("Unexpected authenticator type: ".concat(e4.authenticator_type));
    })(await i2.json());
  }
  async deleteAuthenticator(e3) {
    const { authenticatorId: t2, mfaToken: n2 } = e3, o2 = "".concat(yt(Ti, this), "/mfa/authenticators/").concat(encodeURIComponent(t2)), r2 = await yt(Pi, this).call(this, o2, { method: "DELETE", headers: { Authorization: "Bearer ".concat(n2), "Content-Type": "application/json" } });
    if (!r2.ok) {
      const e4 = await r2.json();
      throw new oa(e4.error_description || "Failed to delete authenticator", e4);
    }
  }
  async challengeAuthenticator(e3) {
    const t2 = "".concat(yt(Ti, this), "/mfa/challenge"), { mfaToken: n2 } = e3, o2 = kt(e3, Si), r2 = { mfa_token: n2, client_id: yt(Ei, this), challenge_type: o2.challengeType };
    o2.authenticatorId && (r2.authenticator_id = o2.authenticatorId);
    const i2 = await yt(Pi, this).call(this, t2, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r2) });
    if (!i2.ok) {
      const e4 = await i2.json();
      throw new ra(e4.error_description || "Failed to challenge authenticator", e4);
    }
    return (function(e4) {
      const t3 = { challengeType: e4.challenge_type };
      return void 0 !== e4.oob_code && (t3.oobCode = e4.oob_code), void 0 !== e4.binding_method && (t3.bindingMethod = e4.binding_method), t3;
    })(await i2.json());
  }
});
var sa = class e2 {
  constructor(e3, t2, n2, o2, r2, i2, a2) {
    vt(this, "accessToken", void 0), vt(this, "idToken", void 0), vt(this, "refreshToken", void 0), vt(this, "expiresAt", void 0), vt(this, "scope", void 0), vt(this, "claims", void 0), vt(this, "authorizationDetails", void 0), vt(this, "tokenType", void 0), vt(this, "issuedTokenType", void 0), this.accessToken = e3, this.idToken = n2, this.refreshToken = o2, this.expiresAt = t2, this.scope = r2, this.claims = i2, this.authorizationDetails = a2;
  }
  static fromTokenEndpointResponse(t2) {
    const n2 = t2.id_token ? t2.claims() : void 0, o2 = new e2(t2.access_token, Math.floor(Date.now() / 1e3) + Number(t2.expires_in), t2.id_token, t2.refresh_token, t2.scope, n2, t2.authorization_details);
    return o2.tokenType = t2.token_type, o2.issuedTokenType = t2.issued_token_type, o2;
  }
};
var ca = (Ai = /* @__PURE__ */ new WeakMap(), Ii = /* @__PURE__ */ new WeakMap(), xi = /* @__PURE__ */ new WeakMap(), class {
  constructor(e3, t2) {
    wt(this, Ai, /* @__PURE__ */ new Map()), wt(this, Ii, void 0), wt(this, xi, void 0), gt(xi, this, Math.max(1, Math.floor(e3))), gt(Ii, this, Math.max(0, Math.floor(t2)));
  }
  get(e3) {
    const t2 = yt(Ai, this).get(e3);
    if (t2) {
      if (!(Date.now() >= t2.expiresAt)) return yt(Ai, this).delete(e3), yt(Ai, this).set(e3, t2), t2.value;
      yt(Ai, this).delete(e3);
    }
  }
  set(e3, t2) {
    for (yt(Ai, this).has(e3) && yt(Ai, this).delete(e3), yt(Ai, this).set(e3, { value: t2, expiresAt: Date.now() + yt(Ii, this) }); yt(Ai, this).size > yt(xi, this); ) {
      const e4 = yt(Ai, this).keys().next().value;
      if (void 0 === e4) break;
      yt(Ai, this).delete(e4);
    }
  }
});
var ua = /* @__PURE__ */ new Map();
function la(e3) {
  return { ttlMs: 1e3 * ("number" == typeof (null == e3 ? void 0 : e3.ttl) ? e3.ttl : 600), maxEntries: "number" == typeof (null == e3 ? void 0 : e3.maxEntries) && e3.maxEntries > 0 ? e3.maxEntries : 100 };
}
var ha = class {
  static createDiscoveryCache(e3) {
    const t2 = (n2 = e3.maxEntries, o2 = e3.ttlMs, "".concat(n2, ":").concat(o2));
    var n2, o2;
    let r2 = (i2 = t2, ua.get(i2));
    var i2;
    return r2 || (r2 = new ca(e3.maxEntries, e3.ttlMs), ua.set(t2, r2)), r2;
  }
  static createJwksCache() {
    return {};
  }
};
var da = "openid profile email offline_access";
var pa = Object.freeze(/* @__PURE__ */ new Set(["grant_type", "client_id", "client_secret", "client_assertion", "client_assertion_type", "subject_token", "subject_token_type", "requested_token_type", "actor_token", "actor_token_type", "audience", "aud", "resource", "resources", "resource_indicator", "scope", "connection", "login_hint", "organization", "assertion"]));
function fa(e3) {
  if (null == e3) throw new Vi("subject_token is required");
  if ("string" != typeof e3) throw new Vi("subject_token must be a string");
  if (0 === e3.trim().length) throw new Vi("subject_token cannot be blank or whitespace");
  if (e3 !== e3.trim()) throw new Vi("subject_token must not include leading or trailing whitespace");
  if (/^bearer\s+/i.test(e3)) throw new Vi("subject_token must not include the 'Bearer ' prefix");
}
function ma(e3, t2) {
  if (t2) {
    for (const [n2, o2] of Object.entries(t2)) if (!pa.has(n2)) if (Array.isArray(o2)) {
      if (o2.length > 20) throw new Vi("Parameter '".concat(n2, "' exceeds maximum array size of ").concat(20));
      o2.forEach((t3) => {
        e3.append(n2, t3);
      });
    } else e3.append(n2, o2);
  }
}
var ya = "urn:ietf:params:oauth:token-type:access_token";
var wa = (Ri = /* @__PURE__ */ new WeakMap(), Oi = /* @__PURE__ */ new WeakMap(), Ci = /* @__PURE__ */ new WeakMap(), ji = /* @__PURE__ */ new WeakMap(), Di = /* @__PURE__ */ new WeakMap(), Wi = /* @__PURE__ */ new WeakMap(), Ui = /* @__PURE__ */ new WeakMap(), Ki = /* @__PURE__ */ new WeakMap(), Li = /* @__PURE__ */ new WeakMap(), Mi = /* @__PURE__ */ new WeakSet(), class {
  constructor(e3) {
    var t2, n2, o2, r2;
    if ((function(e4, t3) {
      mt(e4, t3), t3.add(e4);
    })(this, Mi), wt(this, Ri, void 0), wt(this, Oi, void 0), wt(this, Ci, void 0), wt(this, ji, void 0), wt(this, Di, void 0), wt(this, Wi, void 0), wt(this, Ui, void 0), wt(this, Ki, void 0), wt(this, Li, void 0), vt(this, "mfa", void 0), gt(ji, this, e3), e3.useMtls && !e3.customFetch) throw new Ni("mtls_without_custom_fetch_not_supported", "Using mTLS without a custom fetch implementation is not supported");
    gt(Di, this, (function(e4, t3) {
      if (false === t3.enabled) return e4;
      const n3 = { name: t3.name, version: t3.version }, o3 = btoa(JSON.stringify(n3));
      return async (t4, n4) => {
        const r3 = t4 instanceof Request ? new Headers(t4.headers) : new Headers();
        return null != n4 && n4.headers && new Headers(n4.headers).forEach((e5, t5) => {
          r3.set(t5, e5);
        }), r3.set("Auth0-Client", o3), e4(t4, _t(_t({}, n4), {}, { headers: r3 }));
      };
    })(null !== (t2 = e3.customFetch) && void 0 !== t2 ? t2 : function() {
      return fetch(...arguments);
    }, false === (null == (n2 = e3.telemetry) ? void 0 : n2.enabled) ? n2 : { enabled: true, name: null !== (o2 = null == n2 ? void 0 : n2.name) && void 0 !== o2 ? o2 : "@auth0/auth0-auth-js", version: null !== (r2 = null == n2 ? void 0 : n2.version) && void 0 !== r2 ? r2 : "1.5.0" }));
    const i2 = la(e3.discoveryCache);
    gt(Ui, this, ha.createDiscoveryCache(i2)), gt(Ki, this, /* @__PURE__ */ new Map()), gt(Li, this, ha.createJwksCache()), this.mfa = new aa({ domain: yt(ji, this).domain, clientId: yt(ji, this).clientId, customFetch: yt(Di, this) });
  }
  async getServerMetadata() {
    const { serverMetadata: e3 } = await pt(Mi, this, ba).call(this);
    return e3;
  }
  async buildAuthorizationUrl(e3) {
    const { serverMetadata: t2 } = await pt(Mi, this, ba).call(this);
    if (null != e3 && e3.pushedAuthorizationRequests && !t2.pushed_authorization_request_endpoint) throw new Ni("par_not_supported_error", "The Auth0 tenant does not have pushed authorization requests enabled. Learn how to enable it here: https://auth0.com/docs/get-started/applications/configure-par");
    try {
      return await pt(Mi, this, Ta).call(this, e3);
    } catch (e4) {
      throw new Gi(e4);
    }
  }
  async buildLinkUserUrl(e3) {
    try {
      const t2 = await pt(Mi, this, Ta).call(this, { authorizationParams: _t(_t({}, e3.authorizationParams), {}, { requested_connection: e3.connection, requested_connection_scope: e3.connectionScope, scope: "openid link_account offline_access", id_token_hint: e3.idToken }) });
      return { linkUserUrl: t2.authorizationUrl, codeVerifier: t2.codeVerifier };
    } catch (e4) {
      throw new Bi(e4);
    }
  }
  async buildUnlinkUserUrl(e3) {
    try {
      const t2 = await pt(Mi, this, Ta).call(this, { authorizationParams: _t(_t({}, e3.authorizationParams), {}, { requested_connection: e3.connection, scope: "openid unlink_account", id_token_hint: e3.idToken }) });
      return { unlinkUserUrl: t2.authorizationUrl, codeVerifier: t2.codeVerifier };
    } catch (e4) {
      throw new Yi(e4);
    }
  }
  async backchannelAuthentication(e3) {
    const { configuration: t2, serverMetadata: n2 } = await pt(Mi, this, ba).call(this), o2 = $i(_t(_t({}, yt(ji, this).authorizationParams), null == e3 ? void 0 : e3.authorizationParams)), r2 = new URLSearchParams(_t(_t({ scope: da }, o2), {}, { client_id: yt(ji, this).clientId, binding_message: e3.bindingMessage, login_hint: JSON.stringify({ format: "iss_sub", iss: n2.issuer, sub: e3.loginHint.sub }) }));
    e3.requestedExpiry && r2.append("requested_expiry", e3.requestedExpiry.toString()), e3.authorizationDetails && r2.append("authorization_details", JSON.stringify(e3.authorizationDetails));
    try {
      const e4 = await Dr(t2, r2), n3 = await Wr(t2, e4);
      return sa.fromTokenEndpointResponse(n3);
    } catch (e4) {
      throw new Xi(e4);
    }
  }
  async initiateBackchannelAuthentication(e3) {
    const { configuration: t2, serverMetadata: n2 } = await pt(Mi, this, ba).call(this), o2 = $i(_t(_t({}, yt(ji, this).authorizationParams), null == e3 ? void 0 : e3.authorizationParams)), r2 = new URLSearchParams(_t(_t({ scope: da }, o2), {}, { client_id: yt(ji, this).clientId, binding_message: e3.bindingMessage, login_hint: JSON.stringify({ format: "iss_sub", iss: n2.issuer, sub: e3.loginHint.sub }) }));
    e3.requestedExpiry && r2.append("requested_expiry", e3.requestedExpiry.toString()), e3.authorizationDetails && r2.append("authorization_details", JSON.stringify(e3.authorizationDetails));
    try {
      const e4 = await Dr(t2, r2);
      return { authReqId: e4.auth_req_id, expiresIn: e4.expires_in, interval: e4.interval };
    } catch (e4) {
      throw new Xi(e4);
    }
  }
  async backchannelAuthenticationGrant(e3) {
    let { authReqId: t2 } = e3;
    const { configuration: n2 } = await pt(Mi, this, ba).call(this), o2 = new URLSearchParams({ auth_req_id: t2 });
    try {
      const e4 = await Vr(n2, "urn:openid:params:grant-type:ciba", o2);
      return sa.fromTokenEndpointResponse(e4);
    } catch (e4) {
      throw new Xi(e4);
    }
  }
  async getTokenForConnection(e3) {
    var t2;
    if (e3.refreshToken && e3.accessToken) throw new Fi("Either a refresh or access token should be specified, but not both.");
    const n2 = null !== (t2 = e3.accessToken) && void 0 !== t2 ? t2 : e3.refreshToken;
    if (!n2) throw new Fi("Either a refresh or access token must be specified.");
    try {
      return await this.exchangeToken({ connection: e3.connection, subjectToken: n2, subjectTokenType: e3.accessToken ? ya : "urn:ietf:params:oauth:token-type:refresh_token", loginHint: e3.loginHint });
    } catch (e4) {
      if (e4 instanceof Vi) throw new Fi(e4.message, e4.cause);
      throw e4;
    }
  }
  async exchangeToken(e3) {
    return "connection" in e3 ? pt(Mi, this, _a2).call(this, e3) : pt(Mi, this, ka).call(this, e3);
  }
  async getTokenByCode(e3, t2) {
    const { configuration: n2 } = await pt(Mi, this, ba).call(this);
    try {
      const o2 = await Kr(n2, e3, { pkceCodeVerifier: t2.codeVerifier });
      return sa.fromTokenEndpointResponse(o2);
    } catch (e4) {
      throw new Hi("There was an error while trying to request a token.", e4);
    }
  }
  async getTokenByRefreshToken(e3) {
    const { configuration: t2 } = await pt(Mi, this, ba).call(this), n2 = new URLSearchParams();
    e3.audience && n2.append("audience", e3.audience), e3.scope && n2.append("scope", e3.scope);
    try {
      const o2 = await Lr(t2, e3.refreshToken, n2);
      return sa.fromTokenEndpointResponse(o2);
    } catch (e4) {
      throw new Zi("The access token has expired and there was an error while trying to refresh it.", e4);
    }
  }
  async getTokenByClientCredentials(e3) {
    const { configuration: t2 } = await pt(Mi, this, ba).call(this);
    try {
      const n2 = new URLSearchParams({ audience: e3.audience });
      e3.organization && n2.append("organization", e3.organization);
      const o2 = await Mr(t2, n2);
      return sa.fromTokenEndpointResponse(o2);
    } catch (e4) {
      throw new Ji("There was an error while trying to request a token.", e4);
    }
  }
  async buildLogoutUrl(e3) {
    const { configuration: t2, serverMetadata: n2 } = await pt(Mi, this, ba).call(this);
    if (!n2.end_session_endpoint) {
      const t3 = new URL("https://".concat(yt(ji, this).domain, "/v2/logout"));
      return t3.searchParams.set("returnTo", e3.returnTo), t3.searchParams.set("client_id", yt(ji, this).clientId), t3;
    }
    return (function(e4, t3) {
      Hr(e4);
      const { as: n3, c: o2, tlsOnly: r2 } = mr(e4), i2 = mn(n3, "end_session_endpoint", false, r2);
      (t3 = new URLSearchParams(t3)).has("client_id") || t3.set("client_id", o2.client_id);
      for (const [e5, n4] of t3.entries()) i2.searchParams.append(e5, n4);
      return i2;
    })(t2, { post_logout_redirect_uri: e3.returnTo });
  }
  async verifyLogoutToken(e3) {
    const { serverMetadata: t2 } = await pt(Mi, this, ba).call(this), n2 = la(yt(ji, this).discoveryCache), o2 = t2.jwks_uri;
    yt(Wi, this) || gt(Wi, this, (function(e4, t3) {
      const n3 = new _i(e4, t3), o3 = async (e5, t4) => n3.getKey(e5, t4);
      return Object.defineProperties(o3, { coolingDown: { get: () => n3.coolingDown(), enumerable: true, configurable: false }, fresh: { get: () => n3.fresh(), enumerable: true, configurable: false }, reload: { value: () => n3.reload(), enumerable: true, configurable: false, writable: false }, reloading: { get: () => n3.pendingFetch(), enumerable: true, configurable: false }, jwks: { value: () => n3.jwks(), enumerable: true, configurable: false, writable: false } }), o3;
    })(new URL(o2), { cacheMaxAge: n2.ttlMs, [ui]: yt(Di, this), [li]: yt(Li, this) }));
    const { payload: r2 } = await $r(e3.logoutToken, yt(Wi, this), { issuer: t2.issuer, audience: yt(ji, this).clientId, algorithms: ["RS256"], requiredClaims: ["iat"] });
    if (!("sid" in r2) && !("sub" in r2)) throw new qi('either "sid" or "sub" (or both) claims must be present');
    if ("sid" in r2 && "string" != typeof r2.sid) throw new qi('"sid" claim must be a string');
    if ("sub" in r2 && "string" != typeof r2.sub) throw new qi('"sub" claim must be a string');
    if ("nonce" in r2) throw new qi('"nonce" claim is prohibited');
    if (!("events" in r2)) throw new qi('"events" claim is missing');
    if ("object" != typeof r2.events || null === r2.events) throw new qi('"events" claim must be an object');
    if (!("http://schemas.openid.net/event/backchannel-logout" in r2.events)) throw new qi('"http://schemas.openid.net/event/backchannel-logout" member is missing in the "events" claim');
    if ("object" != typeof r2.events["http://schemas.openid.net/event/backchannel-logout"]) throw new qi('"http://schemas.openid.net/event/backchannel-logout" member in the "events" claim must be an object');
    return { sid: r2.sid, sub: r2.sub };
  }
});
function ga() {
  const e3 = yt(ji, this).domain.toLowerCase();
  return "".concat(e3, "|mtls:").concat(yt(ji, this).useMtls ? "1" : "0");
}
async function va(e3) {
  const t2 = await pt(Mi, this, Sa).call(this), n2 = new Rr(e3, yt(ji, this).clientId, yt(ji, this).clientSecret, t2);
  return n2[vr] = yt(Di, this), n2;
}
async function ba() {
  if (yt(Ri, this) && yt(Oi, this)) return { configuration: yt(Ri, this), serverMetadata: yt(Oi, this) };
  const e3 = pt(Mi, this, ga).call(this), t2 = yt(Ui, this).get(e3);
  if (t2) return gt(Oi, this, t2.serverMetadata), gt(Ri, this, await pt(Mi, this, va).call(this, t2.serverMetadata)), { configuration: yt(Ri, this), serverMetadata: yt(Oi, this) };
  const n2 = yt(Ki, this).get(e3);
  if (n2) {
    const e4 = await n2;
    return gt(Oi, this, e4.serverMetadata), gt(Ri, this, await pt(Mi, this, va).call(this, e4.serverMetadata)), { configuration: yt(Ri, this), serverMetadata: yt(Oi, this) };
  }
  const o2 = (async () => {
    const t3 = await pt(Mi, this, Sa).call(this), n3 = await Ir(new URL("https://".concat(yt(ji, this).domain)), yt(ji, this).clientId, { use_mtls_endpoint_aliases: yt(ji, this).useMtls }, t3, { [vr]: yt(Di, this) }), o3 = n3.serverMetadata();
    return yt(Ui, this).set(e3, { serverMetadata: o3 }), { configuration: n3, serverMetadata: o3 };
  })(), r2 = o2.then((e4) => {
    let { serverMetadata: t3 } = e4;
    return { serverMetadata: t3 };
  });
  r2.catch(() => {
  }), yt(Ki, this).set(e3, r2);
  try {
    const { configuration: e4, serverMetadata: t3 } = await o2;
    gt(Ri, this, e4), gt(Oi, this, t3), yt(Ri, this)[vr] = yt(Di, this);
  } finally {
    yt(Ki, this).delete(e3);
  }
  return { configuration: yt(Ri, this), serverMetadata: yt(Oi, this) };
}
async function _a2(e3) {
  var t2, n2;
  const { configuration: o2 } = await pt(Mi, this, ba).call(this);
  if ("audience" in e3 || "resource" in e3) throw new Vi("audience and resource parameters are not supported for Token Vault exchanges");
  fa(e3.subjectToken);
  const r2 = new URLSearchParams({ connection: e3.connection, subject_token: e3.subjectToken, subject_token_type: null !== (t2 = e3.subjectTokenType) && void 0 !== t2 ? t2 : ya, requested_token_type: null !== (n2 = e3.requestedTokenType) && void 0 !== n2 ? n2 : "http://auth0.com/oauth/token-type/federated-connection-access-token" });
  e3.loginHint && r2.append("login_hint", e3.loginHint), e3.scope && r2.append("scope", e3.scope), ma(r2, e3.extra);
  try {
    const e4 = await Vr(o2, "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token", r2);
    return sa.fromTokenEndpointResponse(e4);
  } catch (t3) {
    throw new Vi("Failed to exchange token for connection '".concat(e3.connection, "'."), t3);
  }
}
async function ka(e3) {
  const { configuration: t2 } = await pt(Mi, this, ba).call(this);
  fa(e3.subjectToken);
  const n2 = new URLSearchParams({ subject_token_type: e3.subjectTokenType, subject_token: e3.subjectToken });
  e3.audience && n2.append("audience", e3.audience), e3.scope && n2.append("scope", e3.scope), e3.requestedTokenType && n2.append("requested_token_type", e3.requestedTokenType), e3.organization && n2.append("organization", e3.organization), ma(n2, e3.extra);
  try {
    const e4 = await Vr(t2, "urn:ietf:params:oauth:grant-type:token-exchange", n2);
    return sa.fromTokenEndpointResponse(e4);
  } catch (t3) {
    throw new Vi("Failed to exchange token of type '".concat(e3.subjectTokenType, "'").concat(e3.audience ? " for audience '".concat(e3.audience, "'") : "", "."), t3);
  }
}
async function Sa() {
  return yt(Ci, this) || gt(Ci, this, (async () => {
    if (!yt(ji, this).clientSecret && !yt(ji, this).clientAssertionSigningKey && !yt(ji, this).useMtls) throw new Qi();
    if (yt(ji, this).useMtls) return (e4, t2, n2, o2) => {
      n2.set("client_id", t2.client_id);
    };
    let e3 = yt(ji, this).clientAssertionSigningKey;
    return !e3 || e3 instanceof CryptoKey || (e3 = await (async function(e4, t2, n2) {
      if ("string" != typeof e4 || 0 !== e4.indexOf("-----BEGIN PRIVATE KEY-----")) throw new TypeError('"pkcs8" must be PKCS#8 formatted string');
      return sr(e4, t2, n2);
    })(e3, yt(ji, this).clientAssertionSigningAlg || "RS256")), e3 ? (function(e4, t2) {
      return hn(e4, t2);
    })(e3) : gr(yt(ji, this).clientSecret);
  })().catch((e3) => {
    throw gt(Ci, this, void 0), e3;
  })), yt(Ci, this);
}
async function Ta(e3) {
  const { configuration: t2 } = await pt(Mi, this, ba).call(this), n2 = Tr(), o2 = await Sr(n2), r2 = $i(_t(_t({}, yt(ji, this).authorizationParams), null == e3 ? void 0 : e3.authorizationParams)), i2 = new URLSearchParams(_t(_t({ scope: da }, r2), {}, { client_id: yt(ji, this).clientId, code_challenge: o2, code_challenge_method: "S256" }));
  return { authorizationUrl: null != e3 && e3.pushedAuthorizationRequests ? await zr(t2, i2) : await Nr(t2, i2), codeVerifier: n2 };
}
var Ea = class _Ea extends a {
  constructor(e3, t2) {
    super(e3, t2), Object.setPrototypeOf(this, _Ea.prototype);
  }
  static fromPayload(e3) {
    let { error: t2, error_description: n2 } = e3;
    return new _Ea(t2, n2);
  }
};
var Pa = class _Pa extends Ea {
  constructor(e3, t2) {
    super(e3, t2), Object.setPrototypeOf(this, _Pa.prototype);
  }
};
var Aa = class _Aa extends Ea {
  constructor(e3, t2) {
    super(e3, t2), Object.setPrototypeOf(this, _Aa.prototype);
  }
};
var Ia = class _Ia extends Ea {
  constructor(e3, t2) {
    super(e3, t2), Object.setPrototypeOf(this, _Ia.prototype);
  }
};
var xa = class _xa extends Ea {
  constructor(e3, t2) {
    super(e3, t2), Object.setPrototypeOf(this, _xa.prototype);
  }
};
var Ra = class _Ra extends Ea {
  constructor(e3, t2) {
    super(e3, t2), Object.setPrototypeOf(this, _Ra.prototype);
  }
};
var Oa = class {
  constructor() {
    let e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 6e5;
    this.contexts = /* @__PURE__ */ new Map(), this.ttlMs = e3;
  }
  set(e3, t2) {
    this.cleanup(), this.contexts.set(e3, Object.assign(Object.assign({}, t2), { createdAt: Date.now() }));
  }
  get(e3) {
    const t2 = this.contexts.get(e3);
    if (t2) {
      if (!(Date.now() - t2.createdAt > this.ttlMs)) return t2;
      this.contexts.delete(e3);
    }
  }
  remove(e3) {
    this.contexts.delete(e3);
  }
  cleanup() {
    const e3 = Date.now();
    for (const [t2, n2] of this.contexts) e3 - n2.createdAt > this.ttlMs && this.contexts.delete(t2);
  }
  get size() {
    return this.contexts.size;
  }
};
var Ca = class {
  constructor(e3, t2) {
    this.authJsMfaClient = e3, this.auth0Client = t2, this.contextManager = new Oa();
  }
  setMFAAuthDetails(e3, t2, n2, o2) {
    this.contextManager.set(e3, { scope: t2, audience: n2, mfaRequirements: o2 });
  }
  async getAuthenticators(e3) {
    var t2, n2;
    const o2 = this.contextManager.get(e3);
    if (!(null === (t2 = null == o2 ? void 0 : o2.mfaRequirements) || void 0 === t2 ? void 0 : t2.challenge) || 0 === o2.mfaRequirements.challenge.length) throw new Pa("invalid_request", "challengeType is required and must contain at least one challenge type, please check mfa_required error payload");
    const r2 = o2.mfaRequirements.challenge.map((e4) => e4.type);
    try {
      return (await this.authJsMfaClient.listAuthenticators({ mfaToken: e3 })).filter((e4) => !!e4.type && r2.includes(e4.type));
    } catch (e4) {
      if (e4 instanceof ta) throw new Pa(null === (n2 = e4.cause) || void 0 === n2 ? void 0 : n2.error, e4.message);
      throw e4;
    }
  }
  async enroll(e3) {
    var t2;
    const n2 = (function(e4) {
      const t3 = ct[e4.factorType];
      return Object.assign(Object.assign(Object.assign({ mfaToken: e4.mfaToken, authenticatorTypes: t3.authenticatorTypes }, t3.oobChannels && { oobChannels: t3.oobChannels }), "phoneNumber" in e4 && { phoneNumber: e4.phoneNumber }), "email" in e4 && { email: e4.email });
    })(e3);
    try {
      return await this.authJsMfaClient.enrollAuthenticator(n2);
    } catch (e4) {
      if (e4 instanceof na) throw new Aa(null === (t2 = e4.cause) || void 0 === t2 ? void 0 : t2.error, e4.message);
      throw e4;
    }
  }
  async challenge(e3) {
    var t2;
    try {
      const t3 = { challengeType: e3.challengeType, mfaToken: e3.mfaToken };
      return e3.authenticatorId && (t3.authenticatorId = e3.authenticatorId), await this.authJsMfaClient.challengeAuthenticator(t3);
    } catch (e4) {
      if (e4 instanceof ra) throw new Ia(null === (t2 = e4.cause) || void 0 === t2 ? void 0 : t2.error, e4.message);
      throw e4;
    }
  }
  async getEnrollmentFactors(e3) {
    const t2 = this.contextManager.get(e3);
    if (!t2 || !t2.mfaRequirements) throw new Ra("mfa_context_not_found", "MFA context not found for this MFA token. Please retry the original request to get a new MFA token.");
    return t2.mfaRequirements.enroll && 0 !== t2.mfaRequirements.enroll.length ? t2.mfaRequirements.enroll : [];
  }
  async verify(e3) {
    const t2 = this.contextManager.get(e3.mfaToken);
    if (!t2) throw new xa("mfa_context_not_found", "MFA context not found for this MFA token. Please retry the original request to get a new MFA token.");
    const n2 = (function(e4) {
      return "otp" in e4 && e4.otp ? ut : "oobCode" in e4 && e4.oobCode ? lt : "recoveryCode" in e4 && e4.recoveryCode ? ht : void 0;
    })(e3);
    if (!n2) throw new xa("invalid_request", "Unable to determine grant type. Provide one of: otp, oobCode, or recoveryCode.");
    const o2 = t2.scope, r2 = t2.audience;
    try {
      const t3 = await this.auth0Client._requestTokenForMfa({ grant_type: n2, mfaToken: e3.mfaToken, scope: o2, audience: r2, otp: e3.otp, oob_code: e3.oobCode, binding_code: e3.bindingCode, recovery_code: e3.recoveryCode });
      return this.contextManager.remove(e3.mfaToken), t3;
    } catch (e4) {
      if (e4 instanceof p) this.setMFAAuthDetails(e4.mfa_token, o2, r2, e4.mfa_requirements);
      else if (e4 instanceof xa) throw new xa(e4.error, e4.error_description);
      throw e4;
    }
  }
};
var ja = class {
  constructor(e3) {
    let t2, o2;
    if (this.userCache = new ke().enclosedCache, this.defaultOptions = { authorizationParams: { scope: "openid profile email" }, useRefreshTokensFallback: false, useFormData: true }, this.options = Object.assign(Object.assign(Object.assign({}, this.defaultOptions), e3), { authorizationParams: Object.assign(Object.assign({}, this.defaultOptions.authorizationParams), e3.authorizationParams) }), "undefined" != typeof window && (() => {
      if (!g()) throw new Error("For security reasons, `window.crypto` is required to run `auth0-spa-js`.");
      if (void 0 === g().subtle) throw new Error("\n      auth0-spa-js must run on a secure origin. See https://github.com/auth0/auth0-spa-js/blob/main/FAQ.md#why-do-i-get-auth0-spa-js-must-run-on-a-secure-origin for more information.\n    ");
    })(), this.lockManager = (Z || (Z = J()), Z), e3.cache && e3.cacheLocation && console.warn("Both `cache` and `cacheLocation` options have been specified in the Auth0Client configuration; ignoring `cacheLocation` and using `cache`."), e3.cache) o2 = e3.cache;
    else {
      if (t2 = e3.cacheLocation || n, !Qe(t2)) throw new Error('Invalid cache location "'.concat(t2, '"'));
      o2 = Qe(t2)();
    }
    var a2;
    this.httpTimeoutMs = e3.httpTimeoutInSeconds ? 1e3 * e3.httpTimeoutInSeconds : 1e4, this.cookieStorage = false === e3.legacySameSiteCookie ? Ue : Le, this.orgHintCookieName = (a2 = this.options.clientId, "auth0.".concat(a2, ".organization_hint")), this.isAuthenticatedCookieName = ((e4) => "auth0.".concat(e4, ".is.authenticated"))(this.options.clientId), this.sessionCheckExpiryDays = e3.sessionCheckExpiryDays || 1;
    const s2 = e3.useCookiesForTransactions ? this.cookieStorage : Me;
    var c2;
    this.scope = (function(e4, t3) {
      for (var n2 = arguments.length, o3 = new Array(n2 > 2 ? n2 - 2 : 0), r2 = 2; r2 < n2; r2++) o3[r2 - 2] = arguments[r2];
      if ("object" != typeof e4) return { [i]: ye(t3, e4, ...o3) };
      let a3 = { [i]: ye(t3, ...o3) };
      return Object.keys(e4).forEach((n3) => {
        const r3 = e4[n3];
        a3[n3] = ye(t3, r3, ...o3);
      }), a3;
    })(this.options.authorizationParams.scope, "openid", this.options.useRefreshTokens ? "offline_access" : ""), this.transactionManager = new Te(s2, this.options.clientId, this.options.cookieDomain), this.nowProvider = this.options.nowProvider || r, this.cacheManager = new Se(o2, o2.allKeys ? void 0 : new Ge(o2, this.options.clientId), this.nowProvider), this.dpop = this.options.useDpop ? new ot(this.options.clientId) : void 0, this.domainUrl = (c2 = this.options.domain, /^https?:\/\//.test(c2) ? c2 : "https://".concat(c2)), this.tokenIssuer = ((e4, t3) => e4 ? e4.startsWith("https://") ? e4 : "https://".concat(e4, "/") : "".concat(t3, "/"))(this.options.issuer, this.domainUrl);
    const u2 = "".concat(this.domainUrl, "/me/"), l2 = this.createFetcher(Object.assign(Object.assign({}, this.options.useDpop && { dpopNonceId: "__auth0_my_account_api__" }), { getAccessToken: () => this.getTokenSilently({ authorizationParams: { scope: "create:me:connected_accounts", audience: u2 }, detailedResponse: true }) }));
    this.myAccountApi = new at(l2, u2), this.authJsClient = new wa({ domain: this.options.domain, clientId: this.options.clientId }), this.mfa = new Ca(this.authJsClient.mfa, this), "undefined" != typeof window && window.Worker && this.options.useRefreshTokens && t2 === n && (this.options.workerUrl ? this.worker = new Worker(this.options.workerUrl) : this.worker = new qe());
  }
  getConfiguration() {
    return Object.freeze({ domain: this.options.domain, clientId: this.options.clientId });
  }
  _url(e3) {
    const t2 = this.options.auth0Client || o, n2 = k(t2, true), r2 = encodeURIComponent(btoa(JSON.stringify(n2)));
    return "".concat(this.domainUrl).concat(e3, "&auth0Client=").concat(r2);
  }
  _authorizeUrl(e3) {
    return this._url("/authorize?".concat(S(e3)));
  }
  async _verifyIdToken(e3, t2, n2) {
    const o2 = await this.nowProvider();
    return Ae({ iss: this.tokenIssuer, aud: this.options.clientId, id_token: e3, nonce: t2, organization: n2, leeway: this.options.leeway, max_age: (r2 = this.options.authorizationParams.max_age, "string" != typeof r2 ? r2 : parseInt(r2, 10) || void 0), now: o2 });
    var r2;
  }
  _processOrgHint(e3) {
    e3 ? this.cookieStorage.save(this.orgHintCookieName, e3, { daysUntilExpire: this.sessionCheckExpiryDays, cookieDomain: this.options.cookieDomain }) : this.cookieStorage.remove(this.orgHintCookieName, { cookieDomain: this.options.cookieDomain });
  }
  async _prepareAuthorizeUrl(e3, t2, n2) {
    var o2;
    const r2 = b(v2()), a2 = b(v2()), s2 = v2(), c2 = await T(s2), u2 = P(c2), l2 = await (null === (o2 = this.dpop) || void 0 === o2 ? void 0 : o2.calculateThumbprint()), h2 = ((e4, t3, n3, o3, r3, i2, a3, s3, c3) => Object.assign(Object.assign(Object.assign({ client_id: e4.clientId }, e4.authorizationParams), n3), { scope: we(t3, n3.scope, n3.audience), response_type: "code", response_mode: s3 || "query", state: o3, nonce: r3, redirect_uri: a3 || e4.authorizationParams.redirect_uri, code_challenge: i2, code_challenge_method: "S256", dpop_jkt: c3 }))(this.options, this.scope, e3, r2, a2, u2, e3.redirect_uri || this.options.authorizationParams.redirect_uri || n2, null == t2 ? void 0 : t2.response_mode, l2), d2 = this._authorizeUrl(h2);
    return { nonce: a2, code_verifier: s2, scope: h2.scope, audience: h2.audience || i, redirect_uri: h2.redirect_uri, state: r2, url: d2 };
  }
  async loginWithPopup(e3, t2) {
    var n2;
    if (e3 = e3 || {}, !(t2 = t2 || {}).popup && (t2.popup = ((e4) => {
      const t3 = window.screenX + (window.innerWidth - 400) / 2, n3 = window.screenY + (window.innerHeight - 600) / 2;
      return window.open(e4, "auth0:authorize:popup", "left=".concat(t3, ",top=").concat(n3, ",width=").concat(400, ",height=").concat(600, ",resizable,scrollbars=yes,status=1"));
    })(""), !t2.popup)) throw new d();
    const o2 = await this._prepareAuthorizeUrl(e3.authorizationParams || {}, { response_mode: "web_message" }, window.location.origin);
    t2.popup.location.href = o2.url;
    const r2 = await ((e4) => new Promise((t3, n3) => {
      let o3;
      const r3 = setInterval(() => {
        e4.popup && e4.popup.closed && (clearInterval(r3), clearTimeout(i3), window.removeEventListener("message", o3, false), n3(new h(e4.popup)));
      }, 1e3), i3 = setTimeout(() => {
        clearInterval(r3), n3(new l(e4.popup)), window.removeEventListener("message", o3, false);
      }, 1e3 * (e4.timeoutInSeconds || 60));
      o3 = function(s2) {
        if (s2.data && "authorization_response" === s2.data.type) {
          if (clearTimeout(i3), clearInterval(r3), window.removeEventListener("message", o3, false), false !== e4.closePopup && e4.popup.close(), s2.data.response.error) return n3(a.fromPayload(s2.data.response));
          t3(s2.data.response);
        }
      }, window.addEventListener("message", o3);
    }))(Object.assign(Object.assign({}, t2), { timeoutInSeconds: t2.timeoutInSeconds || this.options.authorizeTimeoutInSeconds || 60 }));
    if (o2.state !== r2.state) throw new a("state_mismatch", "Invalid state");
    const i2 = (null === (n2 = e3.authorizationParams) || void 0 === n2 ? void 0 : n2.organization) || this.options.authorizationParams.organization;
    await this._requestToken({ audience: o2.audience, scope: o2.scope, code_verifier: o2.code_verifier, grant_type: "authorization_code", code: r2.code, redirect_uri: o2.redirect_uri }, { nonceIn: o2.nonce, organization: i2 });
  }
  async getUser() {
    var e3;
    const t2 = await this._getIdTokenFromCache();
    return null === (e3 = null == t2 ? void 0 : t2.decodedToken) || void 0 === e3 ? void 0 : e3.user;
  }
  async getIdTokenClaims() {
    var e3;
    const t2 = await this._getIdTokenFromCache();
    return null === (e3 = null == t2 ? void 0 : t2.decodedToken) || void 0 === e3 ? void 0 : e3.claims;
  }
  async loginWithRedirect() {
    var t2;
    const n2 = $e(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), { openUrl: o2, fragment: r2, appState: i2 } = n2, a2 = e(n2, ["openUrl", "fragment", "appState"]), s2 = (null === (t2 = a2.authorizationParams) || void 0 === t2 ? void 0 : t2.organization) || this.options.authorizationParams.organization, c2 = await this._prepareAuthorizeUrl(a2.authorizationParams || {}), { url: u2 } = c2, l2 = e(c2, ["url"]);
    this.transactionManager.create(Object.assign(Object.assign(Object.assign({}, l2), { appState: i2, response_type: Ne.Code }), s2 && { organization: s2 }));
    const h2 = r2 ? "".concat(u2, "#").concat(r2) : u2;
    o2 ? await o2(h2) : window.location.assign(h2);
  }
  async handleRedirectCallback() {
    const e3 = (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : window.location.href).split("?").slice(1);
    if (0 === e3.length) throw new Error("There are no query params available for parsing.");
    const t2 = this.transactionManager.get();
    if (!t2) throw new a("missing_transaction", "Invalid state");
    this.transactionManager.remove();
    const n2 = ((e4) => {
      e4.indexOf("#") > -1 && (e4 = e4.substring(0, e4.indexOf("#")));
      const t3 = new URLSearchParams(e4);
      return { state: t3.get("state"), code: t3.get("code") || void 0, connect_code: t3.get("connect_code") || void 0, error: t3.get("error") || void 0, error_description: t3.get("error_description") || void 0 };
    })(e3.join(""));
    return t2.response_type === Ne.ConnectCode ? this._handleConnectAccountRedirectCallback(n2, t2) : this._handleLoginRedirectCallback(n2, t2);
  }
  async _handleLoginRedirectCallback(e3, t2) {
    const { code: n2, state: o2, error: r2, error_description: i2 } = e3;
    if (r2) throw new s(r2, i2 || r2, o2, t2.appState);
    if (!t2.code_verifier || t2.state && t2.state !== o2) throw new a("state_mismatch", "Invalid state");
    const c2 = t2.organization, u2 = t2.nonce, l2 = t2.redirect_uri;
    return await this._requestToken(Object.assign({ audience: t2.audience, scope: t2.scope, code_verifier: t2.code_verifier, grant_type: "authorization_code", code: n2 }, l2 ? { redirect_uri: l2 } : {}), { nonceIn: u2, organization: c2 }), { appState: t2.appState, response_type: Ne.Code };
  }
  async _handleConnectAccountRedirectCallback(e3, t2) {
    const { connect_code: n2, state: o2, error: r2, error_description: i2 } = e3;
    if (r2) throw new c(r2, i2 || r2, t2.connection, o2, t2.appState);
    if (!n2) throw new a("missing_connect_code", "Missing connect code");
    if (!(t2.code_verifier && t2.state && t2.auth_session && t2.redirect_uri && t2.state === o2)) throw new a("state_mismatch", "Invalid state");
    const s2 = await this.myAccountApi.completeAccount({ auth_session: t2.auth_session, connect_code: n2, redirect_uri: t2.redirect_uri, code_verifier: t2.code_verifier });
    return Object.assign(Object.assign({}, s2), { appState: t2.appState, response_type: Ne.ConnectCode });
  }
  async checkSession(e3) {
    if (!this.cookieStorage.get(this.isAuthenticatedCookieName)) {
      if (!this.cookieStorage.get(Be)) return;
      this.cookieStorage.save(this.isAuthenticatedCookieName, true, { daysUntilExpire: this.sessionCheckExpiryDays, cookieDomain: this.options.cookieDomain }), this.cookieStorage.remove(Be);
    }
    try {
      await this.getTokenSilently(e3);
    } catch (e4) {
    }
  }
  async getTokenSilently() {
    let e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    var t2, n2;
    const o2 = Object.assign(Object.assign({ cacheMode: "on" }, e3), { authorizationParams: Object.assign(Object.assign(Object.assign({}, this.options.authorizationParams), e3.authorizationParams), { scope: we(this.scope, null === (t2 = e3.authorizationParams) || void 0 === t2 ? void 0 : t2.scope, (null === (n2 = e3.authorizationParams) || void 0 === n2 ? void 0 : n2.audience) || this.options.authorizationParams.audience) }) }), r2 = await ((e4, t3) => {
      let n3 = Xe[t3];
      return n3 || (n3 = e4().finally(() => {
        delete Xe[t3], n3 = null;
      }), Xe[t3] = n3), n3;
    })(() => this._getTokenSilently(o2), "".concat(this.options.clientId, "::").concat(o2.authorizationParams.audience, "::").concat(o2.authorizationParams.scope));
    return e3.detailedResponse ? r2 : null == r2 ? void 0 : r2.access_token;
  }
  async _getTokenSilently(t2) {
    const { cacheMode: n2 } = t2, o2 = e(t2, ["cacheMode"]);
    if ("off" !== n2) {
      const e3 = await this._getEntryFromCache({ scope: o2.authorizationParams.scope, audience: o2.authorizationParams.audience || i, clientId: this.options.clientId, cacheMode: n2 });
      if (e3) return e3;
    }
    if ("cache-only" === n2) return;
    const r2 = (a2 = this.options.clientId, s2 = o2.authorizationParams.audience || "default", "".concat("auth0.lock.getTokenSilently", ".").concat(a2, ".").concat(s2));
    var a2, s2;
    try {
      return await this.lockManager.runWithLock(r2, 5e3, async () => {
        if ("off" !== n2) {
          const e4 = await this._getEntryFromCache({ scope: o2.authorizationParams.scope, audience: o2.authorizationParams.audience || i, clientId: this.options.clientId });
          if (e4) return e4;
        }
        const e3 = this.options.useRefreshTokens ? await this._getTokenUsingRefreshToken(o2) : await this._getTokenFromIFrame(o2), { id_token: t3, token_type: r3, access_token: a3, oauthTokenScope: s3, expires_in: c2 } = e3;
        return Object.assign(Object.assign({ id_token: t3, token_type: r3, access_token: a3 }, s3 ? { scope: s3 } : null), { expires_in: c2 });
      });
    } catch (e3) {
      if (this._isInteractiveError(e3) && "popup" === this.options.interactiveErrorHandler) return await this._handleInteractiveErrorWithPopup(o2);
      throw e3;
    }
  }
  _isInteractiveError(e3) {
    return e3 instanceof p || e3 instanceof a && this._isIframeMfaError(e3);
  }
  _isIframeMfaError(e3) {
    return "login_required" === e3.error && "Multifactor authentication required" === e3.error_description;
  }
  async _handleInteractiveErrorWithPopup(e3) {
    try {
      await this.loginWithPopup({ authorizationParams: e3.authorizationParams });
      const t2 = await this._getEntryFromCache({ scope: e3.authorizationParams.scope, audience: e3.authorizationParams.audience || i, clientId: this.options.clientId });
      if (!t2) throw new a("interactive_handler_cache_miss", "Token not found in cache after interactive authentication");
      return t2;
    } catch (e4) {
      throw e4;
    }
  }
  async getTokenWithPopup() {
    let e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, n2 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
    var o2, r2;
    const a2 = Object.assign(Object.assign({}, e3), { authorizationParams: Object.assign(Object.assign(Object.assign({}, this.options.authorizationParams), e3.authorizationParams), { scope: we(this.scope, null === (o2 = e3.authorizationParams) || void 0 === o2 ? void 0 : o2.scope, (null === (r2 = e3.authorizationParams) || void 0 === r2 ? void 0 : r2.audience) || this.options.authorizationParams.audience) }) });
    n2 = Object.assign(Object.assign({}, t), n2), await this.loginWithPopup(a2, n2);
    return (await this.cacheManager.get(new be({ scope: a2.authorizationParams.scope, audience: a2.authorizationParams.audience || i, clientId: this.options.clientId }), void 0, this.options.useMrrt)).access_token;
  }
  async isAuthenticated() {
    return !!await this.getUser();
  }
  _buildLogoutUrl(t2) {
    null !== t2.clientId ? t2.clientId = t2.clientId || this.options.clientId : delete t2.clientId;
    const n2 = t2.logoutParams || {}, { federated: o2 } = n2, r2 = e(n2, ["federated"]), i2 = o2 ? "&federated" : "";
    return this._url("/v2/logout?".concat(S(Object.assign({ clientId: t2.clientId }, r2)))) + i2;
  }
  async logout() {
    let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    var n2;
    const o2 = $e(t2), { openUrl: r2 } = o2, i2 = e(o2, ["openUrl"]);
    null === t2.clientId ? await this.cacheManager.clear() : await this.cacheManager.clear(t2.clientId || this.options.clientId), this.cookieStorage.remove(this.orgHintCookieName, { cookieDomain: this.options.cookieDomain }), this.cookieStorage.remove(this.isAuthenticatedCookieName, { cookieDomain: this.options.cookieDomain }), this.userCache.remove(ve), await (null === (n2 = this.dpop) || void 0 === n2 ? void 0 : n2.clear());
    const a2 = this._buildLogoutUrl(i2);
    r2 ? await r2(a2) : false !== r2 && window.location.assign(a2);
  }
  async _getTokenFromIFrame(e3) {
    const t2 = (n2 = this.options.clientId, "".concat("auth0.lock.getTokenFromIFrame", ".").concat(n2));
    var n2;
    try {
      return await this.lockManager.runWithLock(t2, 5e3, async () => {
        const t3 = Object.assign(Object.assign({}, e3.authorizationParams), { prompt: "none" }), n3 = this.cookieStorage.get(this.orgHintCookieName);
        n3 && !t3.organization && (t3.organization = n3);
        const { url: o2, state: r2, nonce: i2, code_verifier: s2, redirect_uri: c2, scope: l2, audience: h2 } = await this._prepareAuthorizeUrl(t3, { response_mode: "web_message" }, window.location.origin);
        if (window.crossOriginIsolated) throw new a("login_required", "The application is running in a Cross-Origin Isolated context, silently retrieving a token without refresh token is not possible.");
        const d2 = e3.timeoutInSeconds || this.options.authorizeTimeoutInSeconds;
        let p2;
        try {
          p2 = new URL(this.domainUrl).origin;
        } catch (e4) {
          p2 = this.domainUrl;
        }
        const f2 = await (function(e4, t4) {
          let n4 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 60;
          return new Promise((o3, r3) => {
            const i3 = window.document.createElement("iframe");
            i3.setAttribute("width", "0"), i3.setAttribute("height", "0"), i3.style.display = "none";
            const s3 = () => {
              window.document.body.contains(i3) && (window.document.body.removeChild(i3), window.removeEventListener("message", c3, false));
            };
            let c3;
            const l3 = setTimeout(() => {
              r3(new u()), s3();
            }, 1e3 * n4);
            c3 = function(e5) {
              if (e5.origin != t4) return;
              if (!e5.data || "authorization_response" !== e5.data.type) return;
              const n5 = e5.source;
              n5 && n5.close(), e5.data.response.error ? r3(a.fromPayload(e5.data.response)) : o3(e5.data.response), clearTimeout(l3), window.removeEventListener("message", c3, false), setTimeout(s3, 2e3);
            }, window.addEventListener("message", c3, false), window.document.body.appendChild(i3), i3.setAttribute("src", e4);
          });
        })(o2, p2, d2);
        if (r2 !== f2.state) throw new a("state_mismatch", "Invalid state");
        const m2 = await this._requestToken(Object.assign(Object.assign({}, e3.authorizationParams), { code_verifier: s2, code: f2.code, grant_type: "authorization_code", redirect_uri: c2, timeout: e3.authorizationParams.timeout || this.httpTimeoutMs }), { nonceIn: i2, organization: t3.organization });
        return Object.assign(Object.assign({}, m2), { scope: l2, oauthTokenScope: m2.scope, audience: h2 });
      });
    } catch (e4) {
      if ("login_required" === e4.error) {
        e4 instanceof a && this._isIframeMfaError(e4) && "popup" === this.options.interactiveErrorHandler || this.logout({ openUrl: false });
      }
      throw e4;
    }
  }
  async _getTokenUsingRefreshToken(e3) {
    var t2, n2;
    const o2 = await this.cacheManager.get(new be({ scope: e3.authorizationParams.scope, audience: e3.authorizationParams.audience || i, clientId: this.options.clientId }), void 0, this.options.useMrrt);
    if (!(o2 && o2.refresh_token || this.worker)) {
      if (this.options.useRefreshTokensFallback) return await this._getTokenFromIFrame(e3);
      throw new f(e3.authorizationParams.audience || i, e3.authorizationParams.scope);
    }
    const r2 = e3.authorizationParams.redirect_uri || this.options.authorizationParams.redirect_uri || window.location.origin, a2 = "number" == typeof e3.timeoutInSeconds ? 1e3 * e3.timeoutInSeconds : null, s2 = ((e4, t3, n3, o3) => {
      var r3;
      if (e4 && n3 && o3) {
        if (t3.audience !== n3) return t3.scope;
        const e5 = o3.split(" "), i2 = (null === (r3 = t3.scope) || void 0 === r3 ? void 0 : r3.split(" ")) || [], a3 = i2.every((t4) => e5.includes(t4));
        return e5.length >= i2.length && a3 ? o3 : t3.scope;
      }
      return t3.scope;
    })(this.options.useMrrt, e3.authorizationParams, null == o2 ? void 0 : o2.audience, null == o2 ? void 0 : o2.scope);
    try {
      const t3 = await this._requestToken(Object.assign(Object.assign(Object.assign({}, e3.authorizationParams), { grant_type: "refresh_token", refresh_token: o2 && o2.refresh_token, redirect_uri: r2 }), a2 && { timeout: a2 }), { scopesToRequest: s2 });
      if (t3.refresh_token && (null == o2 ? void 0 : o2.refresh_token) && await this.cacheManager.updateEntry(o2.refresh_token, t3.refresh_token), this.options.useMrrt) {
        if (c2 = null == o2 ? void 0 : o2.audience, u2 = null == o2 ? void 0 : o2.scope, l2 = e3.authorizationParams.audience, h2 = e3.authorizationParams.scope, c2 !== l2 || !et(h2, u2)) {
          if (!et(s2, t3.scope)) {
            if (this.options.useRefreshTokensFallback) return await this._getTokenFromIFrame(e3);
            await this.cacheManager.remove(this.options.clientId, e3.authorizationParams.audience, e3.authorizationParams.scope);
            const n3 = ((e4, t4) => {
              const n4 = (null == e4 ? void 0 : e4.split(" ")) || [], o3 = (null == t4 ? void 0 : t4.split(" ")) || [];
              return n4.filter((e5) => -1 == o3.indexOf(e5)).join(",");
            })(s2, t3.scope);
            throw new m(e3.authorizationParams.audience || "default", n3);
          }
        }
      }
      return Object.assign(Object.assign({}, t3), { scope: e3.authorizationParams.scope, oauthTokenScope: t3.scope, audience: e3.authorizationParams.audience || i });
    } catch (o3) {
      if (o3.message) {
        if (o3.message.includes("user is blocked")) throw await this.logout({ openUrl: false }), o3;
        if ((o3.message.includes("Missing Refresh Token") || o3.message.includes("invalid refresh token")) && this.options.useRefreshTokensFallback) return await this._getTokenFromIFrame(e3);
      }
      throw o3 instanceof p && this.mfa.setMFAAuthDetails(o3.mfa_token, null === (t2 = e3.authorizationParams) || void 0 === t2 ? void 0 : t2.scope, null === (n2 = e3.authorizationParams) || void 0 === n2 ? void 0 : n2.audience, o3.mfa_requirements), o3;
    }
    var c2, u2, l2, h2;
  }
  async _saveEntryInCache(t2) {
    const { id_token: n2, decodedToken: o2 } = t2, r2 = e(t2, ["id_token", "decodedToken"]);
    this.userCache.set(ve, { id_token: n2, decodedToken: o2 }), await this.cacheManager.setIdToken(this.options.clientId, t2.id_token, t2.decodedToken), await this.cacheManager.set(r2);
  }
  async _getIdTokenFromCache() {
    const e3 = this.options.authorizationParams.audience || i, t2 = this.scope[e3], n2 = await this.cacheManager.getIdToken(new be({ clientId: this.options.clientId, audience: e3, scope: t2 })), o2 = this.userCache.get(ve);
    return n2 && n2.id_token === (null == o2 ? void 0 : o2.id_token) ? o2 : (this.userCache.set(ve, n2), n2);
  }
  async _getEntryFromCache(e3) {
    let { scope: t2, audience: n2, clientId: o2, cacheMode: r2 } = e3;
    const i2 = await this.cacheManager.get(new be({ scope: t2, audience: n2, clientId: o2 }), 60, this.options.useMrrt, r2);
    if (i2 && i2.access_token) {
      const { token_type: e4, access_token: t3, oauthTokenScope: n3, expires_in: o3 } = i2, r3 = await this._getIdTokenFromCache();
      return r3 && Object.assign(Object.assign({ id_token: r3.id_token, token_type: e4 || "Bearer", access_token: t3 }, n3 ? { scope: n3 } : null), { expires_in: o3 });
    }
  }
  async _requestToken(e3, t2) {
    var n2, o2;
    const { nonceIn: r2, organization: a2, scopesToRequest: s2 } = t2 || {}, c2 = await me(Object.assign(Object.assign({ baseUrl: this.domainUrl, client_id: this.options.clientId, auth0Client: this.options.auth0Client, useFormData: this.options.useFormData, timeout: this.httpTimeoutMs, useMrrt: this.options.useMrrt, dpop: this.dpop }, e3), { scope: s2 || e3.scope }), this.worker), u2 = await this._verifyIdToken(c2.id_token, r2, a2);
    if ("authorization_code" === e3.grant_type) {
      const e4 = await this._getIdTokenFromCache();
      (null === (o2 = null === (n2 = null == e4 ? void 0 : e4.decodedToken) || void 0 === n2 ? void 0 : n2.claims) || void 0 === o2 ? void 0 : o2.sub) && e4.decodedToken.claims.sub !== u2.claims.sub && (await this.cacheManager.clear(this.options.clientId), this.userCache.remove(ve));
    }
    return await this._saveEntryInCache(Object.assign(Object.assign(Object.assign(Object.assign({}, c2), { decodedToken: u2, scope: e3.scope, audience: e3.audience || i }), c2.scope ? { oauthTokenScope: c2.scope } : null), { client_id: this.options.clientId })), this.cookieStorage.save(this.isAuthenticatedCookieName, true, { daysUntilExpire: this.sessionCheckExpiryDays, cookieDomain: this.options.cookieDomain }), this._processOrgHint(a2 || u2.claims.org_id), Object.assign(Object.assign({}, c2), { decodedToken: u2 });
  }
  async loginWithCustomTokenExchange(e3) {
    return this._requestToken(Object.assign(Object.assign({}, e3), { grant_type: "urn:ietf:params:oauth:grant-type:token-exchange", subject_token: e3.subject_token, subject_token_type: e3.subject_token_type, scope: we(this.scope, e3.scope, e3.audience || this.options.authorizationParams.audience), audience: e3.audience || this.options.authorizationParams.audience, organization: e3.organization || this.options.authorizationParams.organization }));
  }
  async exchangeToken(e3) {
    return this.loginWithCustomTokenExchange(e3);
  }
  _assertDpop(e3) {
    if (!e3) throw new Error("`useDpop` option must be enabled before using DPoP.");
  }
  getDpopNonce(e3) {
    return this._assertDpop(this.dpop), this.dpop.getNonce(e3);
  }
  setDpopNonce(e3, t2) {
    return this._assertDpop(this.dpop), this.dpop.setNonce(e3, t2);
  }
  generateDpopProof(e3) {
    return this._assertDpop(this.dpop), this.dpop.generateProof(e3);
  }
  createFetcher() {
    let e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
    return new it(e3, { isDpopEnabled: () => !!this.options.useDpop, getAccessToken: (e4) => {
      var t2;
      return this.getTokenSilently({ authorizationParams: { scope: null === (t2 = null == e4 ? void 0 : e4.scope) || void 0 === t2 ? void 0 : t2.join(" "), audience: null == e4 ? void 0 : e4.audience }, detailedResponse: true });
    }, getDpopNonce: () => this.getDpopNonce(e3.dpopNonceId), setDpopNonce: (t2) => this.setDpopNonce(t2, e3.dpopNonceId), generateDpopProof: (e4) => this.generateDpopProof(e4) });
  }
  async connectAccountWithRedirect(e3) {
    const { openUrl: t2, appState: n2, connection: o2, scopes: r2, authorization_params: i2, redirectUri: a2 = this.options.authorizationParams.redirect_uri || window.location.origin } = e3;
    if (!o2) throw new Error("connection is required");
    const s2 = b(v2()), c2 = v2(), u2 = await T(c2), l2 = P(u2), { connect_uri: h2, connect_params: d2, auth_session: p2 } = await this.myAccountApi.connectAccount({ connection: o2, scopes: r2, redirect_uri: a2, state: s2, code_challenge: l2, code_challenge_method: "S256", authorization_params: i2 });
    this.transactionManager.create({ state: s2, code_verifier: c2, auth_session: p2, redirect_uri: a2, appState: n2, connection: o2, response_type: Ne.ConnectCode });
    const f2 = new URL(h2);
    f2.searchParams.set("ticket", d2.ticket), t2 ? await t2(f2.toString()) : window.location.assign(f2);
  }
  async _requestTokenForMfa(t2, n2) {
    const { mfaToken: o2 } = t2, r2 = e(t2, ["mfaToken"]);
    return this._requestToken(Object.assign(Object.assign({}, r2), { mfa_token: o2 }), n2);
  }
};
async function Da(e3) {
  const t2 = new ja(e3);
  return await t2.checkSession(), t2;
}

// src/auth/client.ts
function toAuthUser(user) {
  if (!user) return null;
  return {
    name: user.name,
    email: user.email,
    picture: user.picture
  };
}
function hasRedirectParams(url) {
  return url.searchParams.has("code") && url.searchParams.has("state");
}
function getAuthCallbackError(url) {
  const error = url.searchParams.get("error");
  if (!error) return null;
  const description = url.searchParams.get("error_description");
  return description ? `${error}: ${description}` : error;
}
function isRecoverableAuthError(error) {
  const authError = error;
  const code2 = authError?.error || authError?.code;
  return code2 === "login_required" || code2 === "consent_required" || code2 === "missing_refresh_token";
}
async function createAuthClient(config) {
  const authorizationParams = {
    redirect_uri: window.location.origin,
    scope: "openid profile email"
  };
  if (config.auth0Audience) {
    authorizationParams.audience = config.auth0Audience;
  }
  const client = await Da({
    domain: config.auth0Domain,
    clientId: config.auth0ClientId,
    authorizationParams,
    cacheLocation: "localstorage",
    useRefreshTokens: true
  });
  async function handleRedirectIfPresent() {
    const url = new URL(window.location.href);
    const callbackError = getAuthCallbackError(url);
    if (callbackError) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      throw new Error(callbackError);
    }
    if (!hasRedirectParams(url)) return;
    await client.handleRedirectCallback(window.location.href);
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
  }
  async function initialize() {
    try {
      await handleRedirectIfPresent();
      const isAuthenticated = await client.isAuthenticated();
      if (!isAuthenticated) {
        return {
          isAuthenticated: false,
          user: null
        };
      }
      return {
        isAuthenticated: true,
        user: toAuthUser(await client.getUser())
      };
    } catch (error) {
      if (isRecoverableAuthError(error)) {
        return {
          isAuthenticated: false,
          user: null
        };
      }
      throw error;
    }
  }
  return {
    initialize,
    async login() {
      await client.loginWithRedirect({
        authorizationParams: {
          screen_hint: "login"
        }
      });
    },
    async logout() {
      await client.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    },
    async getToken(options = { forceRefreshToken: false }) {
      try {
        const response = await client.getTokenSilently({
          detailedResponse: true,
          cacheMode: options.forceRefreshToken ? "off" : "on"
        });
        return response.id_token || null;
      } catch (error) {
        if (isRecoverableAuthError(error)) {
          return null;
        }
        throw error;
      }
    },
    async getUser() {
      return toAuthUser(await client.getUser());
    }
  };
}
function formatAuthError(error) {
  if (error instanceof Error) return error.message;
  return "Authentication failed. Check your Auth0 and Convex configuration.";
}

// node_modules/convex/dist/esm/server/pagination.js
var paginationOptsValidator = v.object({
  numItems: v.number(),
  cursor: v.union(v.string(), v.null()),
  endCursor: v.optional(v.union(v.string(), v.null())),
  id: v.optional(v.number()),
  maximumRowsRead: v.optional(v.number()),
  maximumBytesRead: v.optional(v.number())
});

// node_modules/convex/dist/esm/server/components/index.js
function createChildComponents(root, pathParts) {
  const handler = {
    get(_2, prop) {
      if (typeof prop === "string") {
        const newParts = [...pathParts, prop];
        return createChildComponents(root, newParts);
      } else if (prop === toReferencePath) {
        if (pathParts.length < 1) {
          const found = [root, ...pathParts].join(".");
          throw new Error(
            `API path is expected to be of the form \`${root}.childComponent.functionName\`. Found: \`${found}\``
          );
        }
        return `_reference/childComponent/` + pathParts.join("/");
      } else {
        return void 0;
      }
    }
  };
  return new Proxy({}, handler);
}
var componentsGeneric = () => createChildComponents("components", []);

// node_modules/convex/dist/esm/server/schema.js
var __defProp6 = Object.defineProperty;
var __defNormalProp6 = (obj, key, value) => key in obj ? __defProp6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField6 = (obj, key, value) => __defNormalProp6(obj, typeof key !== "symbol" ? key + "" : key, value);
var TableDefinition = class {
  /**
   * @internal
   */
  constructor(documentType) {
    __publicField6(this, "indexes");
    __publicField6(this, "stagedDbIndexes");
    __publicField6(this, "searchIndexes");
    __publicField6(this, "stagedSearchIndexes");
    __publicField6(this, "vectorIndexes");
    __publicField6(this, "stagedVectorIndexes");
    __publicField6(this, "validator");
    this.indexes = [];
    this.stagedDbIndexes = [];
    this.searchIndexes = [];
    this.stagedSearchIndexes = [];
    this.vectorIndexes = [];
    this.stagedVectorIndexes = [];
    this.validator = documentType;
  }
  /**
   * This API is experimental: it may change or disappear.
   *
   * Returns indexes defined on this table.
   * Intended for the advanced use cases of dynamically deciding which index to use for a query.
   * If you think you need this, please chime in on ths issue in the Convex JS GitHub repo.
   * https://github.com/get-convex/convex-js/issues/49
   */
  " indexes"() {
    return this.indexes;
  }
  index(name, indexConfig) {
    if (Array.isArray(indexConfig)) {
      this.indexes.push({
        indexDescriptor: name,
        fields: indexConfig
      });
    } else if (indexConfig.staged) {
      this.stagedDbIndexes.push({
        indexDescriptor: name,
        fields: indexConfig.fields
      });
    } else {
      this.indexes.push({
        indexDescriptor: name,
        fields: indexConfig.fields
      });
    }
    return this;
  }
  searchIndex(name, indexConfig) {
    if (indexConfig.staged) {
      this.stagedSearchIndexes.push({
        indexDescriptor: name,
        searchField: indexConfig.searchField,
        filterFields: indexConfig.filterFields || []
      });
    } else {
      this.searchIndexes.push({
        indexDescriptor: name,
        searchField: indexConfig.searchField,
        filterFields: indexConfig.filterFields || []
      });
    }
    return this;
  }
  vectorIndex(name, indexConfig) {
    if (indexConfig.staged) {
      this.stagedVectorIndexes.push({
        indexDescriptor: name,
        vectorField: indexConfig.vectorField,
        dimensions: indexConfig.dimensions,
        filterFields: indexConfig.filterFields || []
      });
    } else {
      this.vectorIndexes.push({
        indexDescriptor: name,
        vectorField: indexConfig.vectorField,
        dimensions: indexConfig.dimensions,
        filterFields: indexConfig.filterFields || []
      });
    }
    return this;
  }
  /**
   * Work around for https://github.com/microsoft/TypeScript/issues/57035
   */
  self() {
    return this;
  }
  /**
   * Export the contents of this definition.
   *
   * This is called internally by the Convex framework.
   * @internal
   */
  export() {
    const documentType = this.validator.json;
    if (typeof documentType !== "object") {
      throw new Error(
        "Invalid validator: please make sure that the parameter of `defineTable` is valid (see https://docs.convex.dev/database/schemas)"
      );
    }
    return {
      indexes: this.indexes,
      stagedDbIndexes: this.stagedDbIndexes,
      searchIndexes: this.searchIndexes,
      stagedSearchIndexes: this.stagedSearchIndexes,
      vectorIndexes: this.vectorIndexes,
      stagedVectorIndexes: this.stagedVectorIndexes,
      documentType
    };
  }
};
function defineTable(documentSchema) {
  if (isValidator(documentSchema)) {
    return new TableDefinition(documentSchema);
  } else {
    return new TableDefinition(v.object(documentSchema));
  }
}
var SchemaDefinition = class {
  /**
   * @internal
   */
  constructor(tables, options) {
    __publicField6(this, "tables");
    __publicField6(this, "strictTableNameTypes");
    __publicField6(this, "schemaValidation");
    this.tables = tables;
    this.schemaValidation = options?.schemaValidation === void 0 ? true : options.schemaValidation;
  }
  /**
   * Export the contents of this definition.
   *
   * This is called internally by the Convex framework.
   * @internal
   */
  export() {
    return JSON.stringify({
      tables: Object.entries(this.tables).map(([tableName, definition]) => {
        const {
          indexes,
          stagedDbIndexes,
          searchIndexes,
          stagedSearchIndexes,
          vectorIndexes,
          stagedVectorIndexes,
          documentType
        } = definition.export();
        return {
          tableName,
          indexes,
          stagedDbIndexes,
          searchIndexes,
          stagedSearchIndexes,
          vectorIndexes,
          stagedVectorIndexes,
          documentType
        };
      }),
      schemaValidation: this.schemaValidation
    });
  }
};
function defineSchema(schema, options) {
  return new SchemaDefinition(schema, options);
}
var _systemSchema = defineSchema({
  _scheduled_functions: defineTable({
    name: v.string(),
    args: v.array(v.any()),
    scheduledTime: v.float64(),
    completedTime: v.optional(v.float64()),
    state: v.union(
      v.object({ kind: v.literal("pending") }),
      v.object({ kind: v.literal("inProgress") }),
      v.object({ kind: v.literal("success") }),
      v.object({ kind: v.literal("failed"), error: v.string() }),
      v.object({ kind: v.literal("canceled") })
    )
  }),
  _storage: defineTable({
    sha256: v.string(),
    size: v.float64(),
    contentType: v.optional(v.string())
  })
});

// convex/_generated/api.js
var api = anyApi;
var components = componentsGeneric();

// src/data/assistant.ts
var assistantIcons = {
  calendar: '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
  folder: '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
  summary: '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
  prioritize: '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
  suggest: '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
  breakdown: '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
  balance: '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
  reschedule: '<svg class="w-4 h-4 text-stone-400 group-hover:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'
};
function createAssistantConfigs(initialInboxCount) {
  return {
    inbox: {
      title: "ai triage",
      senderLabel: "ai triage",
      quickActionsLabel: "quick triage actions",
      placeholder: "ask ai to help sort...",
      inputHint: "enter to send \xB7 shift+enter for new line",
      initialMessage: `You have ${initialInboxCount} items sitting in your inbox. Want me to draft some quick replies or suggest dates for them based on your calendar?`,
      quickActions: [
        { icon: "calendar", suggestion: "Batch schedule my inbox" },
        { icon: "folder", suggestion: "Suggest folders for these items" },
        { icon: "summary", suggestion: "Summarize what I missed" }
      ],
      defaultReply: "i'm ready to help you clear this out. ask me to batch schedule the inbox or suggest where each item belongs."
    },
    today: {
      title: "ai assistant",
      senderLabel: "ai assistant",
      quickActionsLabel: "quick actions",
      inputHint: "enter to send \xB7 shift+enter for new line",
      placeholder: "ask anything about your tasks...",
      initialMessage: "Hi! I can help you manage your tasks, prioritize your day, or suggest what to tackle next. What would you like help with?",
      quickActions: [
        { icon: "prioritize", suggestion: "Prioritize my tasks for today" },
        { icon: "suggest", suggestion: "Suggest tasks I might be missing" },
        { icon: "breakdown", suggestion: "Break down my overdue task into steps" }
      ],
      defaultReply: "happy to help! try one of the quick actions above, or ask me to prioritize, suggest, or break down your tasks."
    },
    upcoming: {
      title: "ai assistant",
      senderLabel: "ai assistant",
      quickActionsLabel: "quick actions",
      inputHint: "enter to send \xB7 shift+enter for new line",
      placeholder: "ask anything about your future tasks...",
      initialMessage: "Let's look ahead! I can help you balance your workload for the rest of the week or break down larger upcoming projects. What do you need?",
      quickActions: [
        { icon: "balance", suggestion: "Balance my workload for this week" },
        { icon: "reschedule", suggestion: "Reschedule overdue tasks" }
      ],
      defaultReply: "i can help balance the week, suggest a lighter task order, or flag what should move first."
    },
    project: {
      title: "bay",
      senderLabel: "bay",
      quickActionsLabel: "project prompts",
      inputHint: "enter to send \xB7 shift+enter for new line",
      placeholder: "ask bay about this project...",
      initialMessage: "",
      quickActions: [
        { icon: "prioritize", suggestion: "What's the next best step?" },
        { icon: "suggest", suggestion: "Spot risks in this plan" },
        { icon: "breakdown", suggestion: "Break down the next step" }
      ],
      defaultReply: "ask me for the next step, pressure-test the plan, or break down the immediate work."
    }
  };
}
function createInitialMessages(assistantConfigs2) {
  return {
    inbox: [
      {
        sender: "assistant",
        text: assistantConfigs2.inbox.initialMessage,
        rich: false,
        tasks: []
      }
    ],
    today: [
      {
        sender: "assistant",
        text: assistantConfigs2.today.initialMessage,
        rich: false,
        tasks: []
      }
    ],
    upcoming: [
      {
        sender: "assistant",
        text: assistantConfigs2.upcoming.initialMessage,
        rich: false,
        tasks: []
      }
    ]
  };
}

// src/config.ts
function getAppConfig() {
  const config = window.__APP_CONFIG__ ?? {};
  const missing = [];
  if (!config.convexUrl) missing.push("convexUrl");
  if (!config.auth0Domain) missing.push("auth0Domain");
  if (!config.auth0ClientId) missing.push("auth0ClientId");
  if (missing.length) {
    throw new Error(`Missing app config: ${missing.join(", ")}. Check dist/config.js.`);
  }
  return {
    convexUrl: config.convexUrl,
    auth0Domain: config.auth0Domain,
    auth0ClientId: config.auth0ClientId,
    auth0Audience: config.auth0Audience || void 0
  };
}

// src/utils/date.ts
var DAY_MS = 24 * 60 * 60 * 1e3;
function startOfLocalDay(value = /* @__PURE__ */ new Date()) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}
function parseLocalISODate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}
function toLocalISODate(value) {
  const date = startOfLocalDay(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function addDays(value, days) {
  const date = startOfLocalDay(value);
  date.setDate(date.getDate() + days);
  return date;
}
function diffInDays(dateA, dateB) {
  return Math.round(
    (startOfLocalDay(dateA).getTime() - startOfLocalDay(dateB).getTime()) / DAY_MS
  );
}
function startOfWeekMonday(value) {
  const date = startOfLocalDay(value);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(date, offset);
}
function endOfWeekSunday(value) {
  return addDays(startOfWeekMonday(value), 6);
}
var TODAY = startOfLocalDay(/* @__PURE__ */ new Date());
var TODAY_ISO = toLocalISODate(TODAY);
var formatters = {
  weekdayShort: new Intl.DateTimeFormat(void 0, { weekday: "short" }),
  weekdayLong: new Intl.DateTimeFormat(void 0, { weekday: "long" }),
  monthDay: new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric" }),
  modalDate: new Intl.DateTimeFormat(void 0, {
    weekday: "long",
    month: "short",
    day: "numeric"
  })
};

// src/state/selectors.ts
function cloneTask(task) {
  return {
    ...task,
    tags: task.tags.map((tag) => ({ ...tag })),
    subtasks: task.subtasks.map((subtask) => ({ ...subtask }))
  };
}
function cloneProject(project) {
  return {
    ...project,
    bayMessages: project.bayMessages.map((message) => ({
      ...message,
      tasks: message.tasks.map((task) => ({ ...task }))
    }))
  };
}
function decorateTask(state2, task) {
  const project = task.projectId ? getProject(state2, task.projectId) : null;
  return {
    ...task,
    projectName: project?.name || "inbox"
  };
}
function getInboxTasks(state2) {
  return state2.tasks.filter((task) => task.status === "todo" && !task.dueAt && !task.projectId).map((task) => decorateTask(state2, task));
}
function getTask(state2, taskId) {
  const task = state2.tasks.find((task2) => task2.id === taskId);
  return task ? decorateTask(state2, task) : null;
}
function getSelectedTask(state2) {
  return state2.modalTaskId ? getTask(state2, state2.modalTaskId) : null;
}
function getTaskDueMeta(task) {
  if (!task.dueAt) {
    return {
      label: null,
      longLabel: "unscheduled",
      tone: "none",
      diff: null,
      date: null
    };
  }
  const date = parseLocalISODate(task.dueAt);
  const diff = diffInDays(date, TODAY);
  let label = formatters.monthDay.format(date);
  let longLabel = formatters.modalDate.format(date);
  let tone = "upcoming";
  if (diff === 0) {
    label = "Today";
    longLabel = "today";
    tone = "today";
  } else if (diff === 1) {
    label = "Tomorrow";
    longLabel = "tomorrow";
  } else if (diff === -1) {
    label = "Yesterday";
    longLabel = "yesterday";
    tone = "overdue";
  } else if (diff < -1) {
    tone = "overdue";
  } else if (diff > 1 && diff <= 6) {
    label = formatters.weekdayLong.format(date);
  }
  return { label, longLabel, tone, diff, date };
}
function getTodayTasks(state2) {
  return state2.tasks.filter((task) => task.status === "todo" && task.dueAt && getTaskDueMeta(task).diff <= 0).map((task) => decorateTask(state2, task));
}
function getCompletedTasks(state2) {
  return [...state2.tasks].filter((task) => task.status === "completed").map((task) => decorateTask(state2, task));
}
function getInboxCount(state2) {
  return getInboxTasks(state2).length;
}
function getFutureTodoTasks(state2) {
  return state2.tasks.filter((task) => task.status === "todo" && task.dueAt && getTaskDueMeta(task).diff > 0).map((task) => decorateTask(state2, task));
}
function getUpcomingSectionKey(date) {
  const diff = diffInDays(date, TODAY);
  if (diff === 1) return "tomorrow";
  if (date <= endOfWeekSunday(TODAY)) return "this-week";
  return "later";
}
function getUpcomingGroups(state2) {
  const groups = {
    tomorrow: [],
    "this-week": [],
    later: []
  };
  getFutureTodoTasks(state2).forEach((task) => {
    groups[getUpcomingSectionKey(parseLocalISODate(task.dueAt))].push(task);
  });
  return groups;
}
function getWeekDays(state2, weekStartIso) {
  const weekStart = parseLocalISODate(weekStartIso);
  const futureTasks = getFutureTodoTasks(state2);
  return Array.from({ length: 7 }, (_2, index) => {
    const date = addDays(weekStart, index);
    const iso = toLocalISODate(date);
    return {
      date,
      iso,
      hasTasks: futureTasks.some((task) => task.dueAt === iso),
      isToday: iso === TODAY_ISO,
      isSelected: iso === state2.selectedUpcomingDate
    };
  });
}
function getDateFromInboxDestination(destination) {
  if (destination === "today") return TODAY_ISO;
  if (destination === "tomorrow") return toLocalISODate(addDays(TODAY, 1));
  if (destination === "next-week") return toLocalISODate(addDays(startOfWeekMonday(TODAY), 7));
  return toLocalISODate(addDays(TODAY, 30));
}
function getInboxSeedTasks(initialTasks2) {
  return initialTasks2.filter((task) => task.status === "todo" && !task.dueAt && !task.projectId).map(cloneTask);
}
function getProjects(state2) {
  return [...state2.projects];
}
function getProject(state2, projectId) {
  return state2.projects.find((project) => project.id === projectId) || null;
}
function getSelectedProject(state2) {
  return state2.selectedProjectId ? getProject(state2, state2.selectedProjectId) : null;
}
function getProjectTasks(state2, projectId) {
  return state2.tasks.filter((task) => task.projectId === projectId && task.status === "todo").map((task) => decorateTask(state2, task));
}
function getProjectCompletedTasks(state2, projectId) {
  return state2.tasks.filter((task) => task.projectId === projectId && task.status === "completed").map((task) => decorateTask(state2, task));
}
function getCurrentAssistantMessages(state2) {
  if (state2.currentView === "project") {
    return getSelectedProject(state2)?.bayMessages || [];
  }
  return state2.messagesByView[state2.currentView] || [];
}

// src/state/project-bay.ts
var QUESTION_COPY = {
  outcome: "what needs to be true for this project to feel successful?",
  motivation: "why does this project matter right now?",
  success: "how will you judge whether this project worked?",
  constraints: "what constraints do we need to respect?",
  risks: "what could derail this if we do the obvious thing too fast?",
  milestone: "what feels like the first meaningful milestone?",
  unknowns: "what still feels fuzzy or undecided?"
};
var FOLLOW_UP_ORDER = ["outcome", "motivation", "success", "constraints", "risks", "milestone", "unknowns"];
function createMessage(sender, text) {
  return { sender, text, rich: false, tasks: [] };
}
function cloneMessage(message) {
  return {
    ...message,
    tasks: message.tasks.map((task) => ({ ...task }))
  };
}
function countFilledAnswers(answers) {
  return FOLLOW_UP_ORDER.filter((key) => answers[key]).length;
}
function isPastDate(value) {
  return parseLocalISODate(value).getTime() < TODAY.getTime();
}
function createProjectSetupState(open = false) {
  return {
    open,
    phase: "chat",
    promptKey: "name",
    messages: open ? [createMessage("assistant", "let's turn this into a real plan. what's the project name?")] : [],
    answers: {
      name: "",
      deadline: "",
      outcome: "",
      motivation: "",
      success: "",
      constraints: "",
      risks: "",
      milestone: "",
      unknowns: ""
    },
    draft: null
  };
}
function cloneProjectSetupState(projectSetup) {
  return {
    ...projectSetup,
    messages: projectSetup.messages.map(cloneMessage),
    answers: { ...projectSetup.answers },
    draft: projectSetup.draft ? cloneProjectDraft(projectSetup.draft) : null
  };
}
function cloneProjectDraft(draft) {
  return {
    ...draft,
    tasks: draft.tasks.map((task) => ({ ...task }))
  };
}
function slugifyProjectName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}
function buildProjectId(name, nextProjectId) {
  const slug = slugifyProjectName(name) || `project-${nextProjectId}`;
  return `project-${slug}-${nextProjectId}`;
}
function parseProjectDeadlineInput(value) {
  const text = value.trim().toLowerCase();
  if (!text) return null;
  if (text === "today") return TODAY_ISO;
  if (text === "tomorrow") return toLocalISODate(addDays(TODAY, 1));
  if (text === "next week") return toLocalISODate(addDays(TODAY, 7));
  const relativeMatch = text.match(/^in\s+(\d+)\s+days?$/);
  if (relativeMatch) {
    return toLocalISODate(addDays(TODAY, Number(relativeMatch[1])));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toLocalISODate(parsed);
}
function getNextFollowUpKey(answers) {
  return FOLLOW_UP_ORDER.find((key) => !answers[key]) || null;
}
function hasDraftInputs(answers) {
  return Boolean(
    answers.name && answers.deadline && answers.outcome && (answers.success || answers.constraints || answers.risks)
  );
}
function ensureSentence(value, fallback) {
  const text = value?.trim();
  if (!text) return fallback;
  return text.endsWith(".") ? text : `${text}.`;
}
function normalizeOutcome(value) {
  const text = value.trim().replace(/\.$/, "");
  const stripped = text.replace(/^we need\s+/i, "").replace(/^need to\s+/i, "").replace(/^to\s+/i, "");
  return stripped.charAt(0).toLowerCase() + stripped.slice(1);
}
function buildNextStep(answers) {
  if (answers.milestone) {
    return `Turn "${answers.milestone}" into a concrete execution checklist`;
  }
  if (answers.success) {
    return `Write the project brief and success criteria for ${answers.name}`;
  }
  return `Draft the first-pass plan for ${answers.name}`;
}
function generateProjectDraft(answers) {
  const deadlineDate = parseLocalISODate(answers.deadline);
  const deadlineLabel = formatters.modalDate.format(deadlineDate).toLowerCase();
  const nextStep = buildNextStep(answers);
  const summary = [
    `The project aims to ${normalizeOutcome(answers.outcome)}.`,
    ensureSentence(
      answers.motivation,
      "It needs a sharper plan before execution starts."
    ),
    ensureSentence(
      answers.success ? `Success looks like ${answers.success}` : "Success needs to be defined early so execution does not drift",
      "Success needs to be defined early so execution does not drift."
    ),
    ensureSentence(
      answers.constraints ? `Constraints to respect: ${answers.constraints}` : answers.risks ? `Main risk to watch: ${answers.risks}` : "The first pass should surface the main blockers early",
      "The first pass should surface the main blockers early."
    ),
    `Target deadline: ${deadlineLabel}.`
  ].join(" ");
  const supportingTasks = [
    {
      id: "draft-task-1",
      title: nextStep,
      description: "Make the first concrete move so the project stops living as an idea.",
      dueAt: TODAY_ISO
    },
    {
      id: "draft-task-2",
      title: `Define the success criteria for ${answers.name}`,
      description: answers.success ? answers.success : "Translate the desired outcome into a small set of checkable outcomes.",
      dueAt: null
    },
    {
      id: "draft-task-3",
      title: `Document the scope, constraints, and risks`,
      description: answers.constraints || answers.risks || "Capture the limits and blockers before execution expands.",
      dueAt: null
    },
    {
      id: "draft-task-4",
      title: `Break the first milestone into smaller tasks`,
      description: answers.milestone || "Pick the first milestone and split it into concrete chunks.",
      dueAt: null
    },
    {
      id: "draft-task-5",
      title: `Schedule a project review before the deadline`,
      description: `Create a review point before ${deadlineLabel} so the project can still change course in time.`,
      dueAt: null
    }
  ];
  if (answers.unknowns) {
    supportingTasks.push({
      id: "draft-task-6",
      title: "Resolve the key open questions",
      description: answers.unknowns,
      dueAt: null
    });
  }
  return {
    name: answers.name,
    deadline: answers.deadline,
    summary,
    nextStep,
    tasks: supportingTasks.slice(0, 6)
  };
}
function submitProjectSetupMessage(projectSetup, rawText) {
  const text = rawText.trim();
  if (!text) return projectSetup;
  const nextState = cloneProjectSetupState(projectSetup);
  nextState.messages.push(createMessage("user", text));
  if (nextState.promptKey === "name") {
    if (text.length < 3) {
      nextState.messages.push(
        createMessage("assistant", "give me a slightly clearer project name so i can anchor the plan.")
      );
      return nextState;
    }
    nextState.answers.name = text;
    nextState.promptKey = "deadline";
    nextState.messages.push(
      createMessage(
        "assistant",
        `good. when is ${text.toLowerCase()} due? you can say something like "2026-04-30", "tomorrow", or "in 10 days".`
      )
    );
    return nextState;
  }
  if (nextState.promptKey === "deadline") {
    const deadline = parseProjectDeadlineInput(text);
    if (!deadline || isPastDate(deadline)) {
      nextState.messages.push(
        createMessage(
          "assistant",
          "i need a real future deadline to shape the plan. try a date like 2026-04-30 or a phrase like tomorrow."
        )
      );
      return nextState;
    }
    nextState.answers.deadline = deadline;
    nextState.promptKey = "outcome";
    nextState.messages.push(
      createMessage("assistant", QUESTION_COPY.outcome)
    );
    return nextState;
  }
  nextState.answers[nextState.promptKey] = text;
  if (hasDraftInputs(nextState.answers) && countFilledAnswers(nextState.answers) >= 3) {
    nextState.phase = "review";
    nextState.promptKey = null;
    nextState.draft = generateProjectDraft(nextState.answers);
    nextState.messages.push(
      createMessage(
        "assistant",
        "i have enough to draft the plan. review it, edit anything that feels off, then create the project."
      )
    );
    return nextState;
  }
  const nextKey = getNextFollowUpKey(nextState.answers);
  nextState.promptKey = nextKey;
  nextState.messages.push(createMessage("assistant", QUESTION_COPY[nextKey]));
  return nextState;
}

// src/state/actions.ts
function addTask(state2, title) {
  const isInbox = state2.currentView === "inbox";
  const isProject = state2.currentView === "project" && state2.selectedProjectId;
  state2.tasks.unshift({
    id: `task-${state2.nextTaskId++}`,
    title,
    status: "todo",
    dueAt: isInbox || isProject ? null : TODAY_ISO,
    projectId: isProject ? state2.selectedProjectId : null,
    tags: [{ label: "new", color: "emerald" }],
    description: isInbox ? "New inbox item waiting to be triaged." : isProject ? "New project task added from the project view." : "New task added from the quick entry field. Open it to add more detail.",
    sourceLabel: null,
    isStale: false,
    project: isProject ? "project" : "inbox",
    priority: "none",
    createdLabel: "created just now",
    subtasks: []
  });
}
function scheduleInboxTask(state2, taskId, destination) {
  const dueAt = getDateFromInboxDestination(destination);
  state2.tasks = state2.tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      dueAt,
      sourceLabel: null,
      isStale: false
    };
  });
}
function unscheduleTask(state2, taskId, previousDueAt) {
  state2.tasks = state2.tasks.map((task) => {
    if (task.id !== taskId) return task;
    return { ...task, dueAt: previousDueAt };
  });
}
function toggleTask(state2, taskId) {
  cancelTaskCardEdit(state2);
  const index = state2.tasks.findIndex((task2) => task2.id === taskId);
  if (index === -1) return;
  const task = { ...state2.tasks[index] };
  state2.tasks.splice(index, 1);
  if (task.status === "todo") {
    task.status = "completed";
    state2.tasks.push(task);
  } else {
    task.status = "todo";
    state2.tasks.unshift(task);
  }
}
function openTaskModal(state2, taskId) {
  cancelTaskCardEdit(state2);
  state2.modalTaskId = taskId;
  state2.modalSubtaskComposerOpen = false;
  state2.modalSubtaskDraft = "";
}
function closeTaskModal(state2) {
  state2.modalTaskId = null;
  state2.modalSubtaskComposerOpen = false;
  state2.modalSubtaskDraft = "";
}
function updateTaskField(state2, taskId, field, value) {
  state2.tasks = state2.tasks.map(
    (task) => task.id === taskId ? { ...task, [field]: value } : task
  );
}
function updateTaskProject(state2, taskId, projectId) {
  const nextProjectId = projectId || null;
  const project = nextProjectId ? state2.projects.find((item) => item.id === nextProjectId) || null : null;
  state2.tasks = state2.tasks.map(
    (task) => task.id === taskId ? {
      ...task,
      projectId: nextProjectId,
      project: project?.name || "inbox"
    } : task
  );
}
function updateTaskDueDate(state2, taskId, dueAt) {
  state2.tasks = state2.tasks.map(
    (task) => task.id === taskId ? {
      ...task,
      dueAt: dueAt || null
    } : task
  );
}
function updateTaskPriority(state2, taskId, priority) {
  state2.tasks = state2.tasks.map(
    (task) => task.id === taskId ? {
      ...task,
      priority: priority || "none"
    } : task
  );
}
function startTaskCardEdit(state2, taskId) {
  const task = state2.tasks.find((item) => item.id === taskId);
  if (!task) return;
  state2.editingTaskId = taskId;
  state2.editingTaskDraft = {
    title: task.title,
    description: task.description || ""
  };
}
function updateTaskCardDraftField(state2, field, value) {
  if (!state2.editingTaskDraft) return;
  state2.editingTaskDraft = {
    ...state2.editingTaskDraft,
    [field]: value
  };
}
function saveTaskCardEdit(state2) {
  if (!state2.editingTaskId || !state2.editingTaskDraft) return;
  const { title, description } = state2.editingTaskDraft;
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return;
  state2.tasks = state2.tasks.map(
    (task) => task.id === state2.editingTaskId ? {
      ...task,
      title: trimmedTitle,
      description: description.trim()
    } : task
  );
  cancelTaskCardEdit(state2);
}
function cancelTaskCardEdit(state2) {
  state2.editingTaskId = null;
  state2.editingTaskDraft = null;
}
function toggleSubtask(state2, taskId, subtaskId) {
  state2.tasks = state2.tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      subtasks: task.subtasks.map(
        (subtask) => subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
      )
    };
  });
}
function addTaskSubtask(state2, taskId, title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return;
  state2.tasks = state2.tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      subtasks: [
        ...task.subtasks,
        {
          id: `subtask-${state2.nextSubtaskId++}`,
          title: trimmedTitle,
          done: false
        }
      ]
    };
  });
  state2.modalSubtaskComposerOpen = false;
  state2.modalSubtaskDraft = "";
}
function updateSubtaskTitle(state2, taskId, subtaskId, value) {
  state2.tasks = state2.tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      subtasks: task.subtasks.map(
        (subtask) => subtask.id === subtaskId ? { ...subtask, title: value } : subtask
      )
    };
  });
}
function removeSubtask(state2, taskId, subtaskId) {
  state2.tasks = state2.tasks.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId)
    };
  });
}
function reorderTask(state2, taskId, targetTaskId, placement = "before") {
  if (!taskId || !targetTaskId || taskId === targetTaskId) return;
  const fromIndex = state2.tasks.findIndex((task) => task.id === taskId);
  const targetIndex = state2.tasks.findIndex((task) => task.id === targetTaskId);
  if (fromIndex === -1 || targetIndex === -1) return;
  const [movedTask] = state2.tasks.splice(fromIndex, 1);
  const nextTargetIndex = state2.tasks.findIndex((task) => task.id === targetTaskId);
  const insertIndex = placement === "after" ? nextTargetIndex + 1 : nextTargetIndex;
  state2.tasks.splice(insertIndex, 0, movedTask);
}
function openModalSubtaskComposer(state2) {
  state2.modalSubtaskComposerOpen = true;
  state2.modalSubtaskDraft = "";
}
function closeModalSubtaskComposer(state2) {
  state2.modalSubtaskComposerOpen = false;
  state2.modalSubtaskDraft = "";
}
function updateModalSubtaskDraft(state2, value) {
  state2.modalSubtaskDraft = value;
}
function setView(state2, view) {
  if (view === state2.currentView) return false;
  cancelTaskCardEdit(state2);
  state2.currentView = view;
  if (view !== "project") {
    state2.selectedProjectId = null;
  }
  return true;
}
function resetInbox(state2, initialTasks2) {
  cancelTaskCardEdit(state2);
  const preservedTasks = state2.tasks.filter(
    (task) => task.status !== "todo" || task.dueAt || task.projectId
  );
  state2.tasks = [...getInboxSeedTasks(initialTasks2), ...preservedTasks];
}
function shiftUpcomingWeek(state2, direction) {
  cancelTaskCardEdit(state2);
  const currentSelected = parseLocalISODate(state2.selectedUpcomingDate);
  const nextSelected = addDays(currentSelected, direction * 7);
  state2.selectedUpcomingDate = toLocalISODate(nextSelected);
  state2.upcomingWeekStart = toLocalISODate(startOfWeekMonday(nextSelected));
  state2.pendingUpcomingScrollTarget = state2.selectedUpcomingDate;
}
function selectUpcomingDate(state2, dateIso) {
  cancelTaskCardEdit(state2);
  const selectedDate = parseLocalISODate(dateIso);
  state2.selectedUpcomingDate = dateIso;
  state2.upcomingWeekStart = toLocalISODate(startOfWeekMonday(selectedDate));
  state2.pendingUpcomingScrollTarget = dateIso;
}
function openProject(state2, projectId) {
  cancelTaskCardEdit(state2);
  state2.currentView = "project";
  state2.selectedProjectId = projectId;
}
function openProjectSetup(state2) {
  state2.projectSetup = createProjectSetupState(true);
}
function closeProjectSetup(state2) {
  state2.projectSetup = createProjectSetupState(false);
}
function restartProjectSetup(state2) {
  state2.projectSetup = createProjectSetupState(true);
}
function submitProjectSetupInput(state2, text) {
  state2.projectSetup = submitProjectSetupMessage(state2.projectSetup, text);
}
function updateProjectDraftField(state2, field, value) {
  if (!state2.projectSetup.draft) return;
  const draft = cloneProjectDraft(state2.projectSetup.draft);
  draft[field] = value;
  if (field === "nextStep" && draft.tasks.length) {
    draft.tasks[0] = { ...draft.tasks[0], title: value };
  }
  if (field === "name") {
    draft.tasks = draft.tasks.map((task, index) => {
      if (index === 1) {
        return {
          ...task,
          title: `Define the success criteria for ${value}`
        };
      }
      return task;
    });
  }
  state2.projectSetup.draft = draft;
}
function updateProjectDraftTask(state2, taskId, value) {
  if (!state2.projectSetup.draft) return;
  const draft = cloneProjectDraft(state2.projectSetup.draft);
  draft.tasks = draft.tasks.map((task) => task.id === taskId ? { ...task, title: value } : task);
  if (draft.tasks[0]?.id === taskId) {
    draft.nextStep = value;
  }
  state2.projectSetup.draft = draft;
}
function confirmProjectDraft(state2) {
  const draft = state2.projectSetup.draft;
  if (!draft) return;
  const resolvedDeadline = parseProjectDeadlineInput(draft.deadline) || draft.deadline;
  const projectId = buildProjectId(draft.name, state2.nextProjectId++);
  const bayMessages = state2.projectSetup.messages.map((message) => ({
    ...message,
    tasks: message.tasks.map((task) => ({ ...task }))
  }));
  bayMessages.push({
    sender: "assistant",
    text: `project created. start with: ${draft.nextStep.toLowerCase()}.`,
    rich: false,
    tasks: []
  });
  state2.projects.unshift({
    id: projectId,
    name: draft.name,
    deadline: resolvedDeadline,
    summary: draft.summary,
    nextStep: draft.nextStep,
    bayMessages,
    createdLabel: "created just now"
  });
  const createdTasks = draft.tasks.map((task, index) => ({
    id: `task-${state2.nextTaskId++}`,
    title: task.title,
    status: "todo",
    dueAt: index === 0 ? TODAY_ISO : null,
    projectId,
    tags: [],
    description: task.description || "",
    sourceLabel: null,
    isStale: false,
    project: draft.name,
    priority: index === 0 ? "high" : "medium",
    createdLabel: "created just now",
    subtasks: []
  }));
  state2.tasks = [...createdTasks, ...state2.tasks];
  state2.projectSetup = createProjectSetupState(false);
  state2.currentView = "project";
  state2.selectedProjectId = projectId;
  state2.assistantOpen = true;
}

// src/utils/text.ts
function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function ordinalLabel(index) {
  const labels = ["1st", "2nd", "3rd", "4th", "5th"];
  return labels[index] || `${index + 1}th`;
}

// src/state/assistant-replies.ts
function buildTodayReply(text, state2, assistantConfigs2) {
  const key = text.toLowerCase();
  const todayTasks = getTodayTasks(state2);
  if (key.includes("prioritize")) {
    return {
      text: "based on your tasks, here's how i'd order your day:",
      tasks: todayTasks.slice(0, 3).map((task, index) => ({
        order: ordinalLabel(index),
        text: `${task.title} ${getTaskDueMeta(task).tone === "overdue" ? "\u2014 already overdue" : "\u2014 due today"}`
      }))
    };
  }
  if (key.includes("suggest")) {
    return {
      text: "looking at your projects, here are a few tasks you might want to add:",
      tasks: [
        { text: "Schedule follow-up after the agency pitch review" },
        { text: "Share the Q3 content draft for feedback" },
        { text: "Set a hard deadline for the brand voice update" }
      ]
    };
  }
  if (key.includes("break down")) {
    const task = todayTasks[0];
    return {
      text: task ? `here's how to break down <strong>${escapeHtml(task.title)}</strong>:` : "there isn't an overdue task right now, so i'd break down the next due item instead:",
      tasks: task ? [
        { text: "Capture the core objective and deadline" },
        { text: "List the 2 or 3 decisions blocking progress" },
        { text: "Draft the first pass before editing for polish" },
        { text: "Schedule a quick review checkpoint" }
      ] : [
        { text: "Pick the next due task" },
        { text: "Write the first obvious substep" },
        { text: "Set a 30-minute start block on the calendar" }
      ]
    };
  }
  return {
    text: assistantConfigs2.today.defaultReply,
    tasks: []
  };
}
function buildInboxReply(text, state2, assistantConfigs2) {
  const key = text.toLowerCase();
  const inboxTasks = getInboxTasks(state2);
  if (key.includes("batch")) {
    return {
      text: "i can auto-schedule these based on your habits. here's a proposal:",
      tasks: inboxTasks.slice(0, 3).map((task, index) => ({
        order: ["Today", "Tomorrow", "Next Week"][index] || "Later",
        text: task.title
      }))
    };
  }
  if (key.includes("folder") || key.includes("suggest")) {
    return {
      text: "here are some suggested projects for these unsorted items:",
      tasks: inboxTasks.slice(0, 3).map((task) => ({
        order: task.tags[0] ? task.tags[0].label.replace(/\b\w/g, (char) => char.toUpperCase()) : "General",
        text: task.title
      }))
    };
  }
  if (key.includes("summarize") || key.includes("missed")) {
    return {
      text: `you've got ${inboxTasks.length} items needing triage. two look like quick reviews, one feels like deeper planning work, and at least one has been sitting long enough to schedule today.`,
      tasks: []
    };
  }
  return {
    text: assistantConfigs2.inbox.defaultReply,
    tasks: []
  };
}
function buildUpcomingReply(text, state2, assistantConfigs2) {
  const key = text.toLowerCase();
  const futureTasks = getFutureTodoTasks(state2);
  const overdueTasks = getTodayTasks(state2).filter(
    (task) => getTaskDueMeta(task).tone === "overdue"
  );
  if (key.includes("balance") || key.includes("workload")) {
    return {
      text: "here's a lighter way to spread the rest of your week:",
      tasks: futureTasks.slice(0, 3).map((task, index) => ({
        order: ordinalLabel(index),
        text: `${task.title} \u2014 ${getTaskDueMeta(task).label}`
      }))
    };
  }
  if (key.includes("reschedule") || key.includes("overdue")) {
    return overdueTasks.length ? {
      text: "these overdue tasks should move first before the later work piles up:",
      tasks: overdueTasks.map((task) => ({
        text: `${task.title} \u2014 reschedule for the next open block`
      }))
    } : {
      text: "good news: nothing is overdue right now. i'd keep the earliest upcoming work where it is.",
      tasks: futureTasks.slice(0, 2).map((task) => ({ text: `${task.title} \u2014 ${getTaskDueMeta(task).label}` }))
    };
  }
  return {
    text: assistantConfigs2.upcoming.defaultReply,
    tasks: []
  };
}
function buildProjectReply(text, state2, assistantConfigs2) {
  const key = text.toLowerCase();
  const project = getProject(state2, state2.selectedProjectId);
  const projectTasks = project ? getProjectTasks(state2, project.id) : [];
  if (!project) {
    return {
      text: assistantConfigs2.project.defaultReply,
      tasks: []
    };
  }
  if (key.includes("next")) {
    return {
      text: `the best next move is still <strong>${escapeHtml(project.nextStep)}</strong>. after that, i'd keep momentum with these tasks:`,
      tasks: projectTasks.slice(0, 3).map((task, index) => ({
        order: ordinalLabel(index),
        text: task.title
      }))
    };
  }
  if (key.includes("risk")) {
    return {
      text: "the plan looks fine structurally, but these are the spots i'd watch before execution speeds up:",
      tasks: [
        { text: "Scope creep if the outcome is not rechecked against the deadline" },
        { text: "Decision debt if constraints stay implicit instead of written down" },
        {
          text: projectTasks[0] ? `Losing momentum if "${projectTasks[0].title}" does not start soon` : "No immediate task has been started yet"
        }
      ]
    };
  }
  if (key.includes("break down")) {
    return {
      text: `here's how i'd break down <strong>${escapeHtml(project.nextStep)}</strong>:`,
      tasks: [
        { text: "Write the smallest possible first draft" },
        { text: "List the open decisions and unknowns" },
        { text: "Choose an owner or review checkpoint" },
        { text: "Set the next concrete action right after the draft exists" }
      ]
    };
  }
  return {
    text: `i'm keeping ${project.name} pointed at the deadline. ask for the next step, risks, or a breakdown of the immediate work.`,
    tasks: []
  };
}
function buildAssistantReply({ view, text, state: state2, assistantConfigs: assistantConfigs2 }) {
  if (view === "project") return buildProjectReply(text, state2, assistantConfigs2);
  if (view === "inbox") return buildInboxReply(text, state2, assistantConfigs2);
  if (view === "upcoming") return buildUpcomingReply(text, state2, assistantConfigs2);
  return buildTodayReply(text, state2, assistantConfigs2);
}

// src/data/projects.ts
function createProject(id, name, offsetDays, summary, nextStep, createdLabel) {
  return {
    id,
    name,
    deadline: toLocalISODate(addDays(TODAY, offsetDays)),
    summary,
    nextStep,
    createdLabel,
    bayMessages: [
      {
        sender: "assistant",
        text: `i'm tracking ${name}. the clearest next move is still: ${nextStep.toLowerCase()}.`,
        rich: false,
        tasks: []
      }
    ]
  };
}
function buildInitialProjects() {
  return [
    createProject(
      "project-design-system",
      "design system",
      4,
      "Lock the core UI components so product work can move into implementation without reopening design decisions.",
      "Approve button and input spacing",
      "created last week"
    ),
    createProject(
      "project-marketing",
      "marketing",
      1,
      "Prepare the next client-facing story with cleaner metrics, sharper positioning, and a clear narrative arc.",
      "Collect the latest performance metrics",
      "created 3 days ago"
    ),
    createProject(
      "project-house-reno",
      "house reno",
      1,
      "Keep the renovation moving by resolving schedule risks before material deliveries and installs start drifting.",
      "List open questions for the contractor",
      "created 5 days ago"
    ),
    createProject(
      "project-finance",
      "finance",
      5,
      "Close the quarter cleanly and avoid last-minute finance surprises.",
      "Confirm tax estimate with accountant",
      "created 2 weeks ago"
    ),
    createProject(
      "project-personal",
      "personal",
      16,
      "Make the holiday travel decision while good routes are still available.",
      "Compare two preferred itineraries",
      "created last week"
    ),
    createProject(
      "project-career",
      "career",
      38,
      "Turn broad growth goals into a plan that can actually be reviewed and executed.",
      "Rewrite the growth goals in measurable terms",
      "created last month"
    ),
    createProject(
      "project-ops",
      "ops",
      2,
      "Keep routine team operations moving with less last-minute catch-up.",
      "Collect highlights from each stream",
      "created recently"
    )
  ];
}

// src/data/tasks.ts
function buildInitialTasks() {
  return [
    {
      id: "task-1",
      title: "Review new figma components from the design team",
      status: "todo",
      dueAt: null,
      projectId: null,
      tags: [{ label: "design system", color: "blue" }],
      description: "Forwarded for triage before the next product review.",
      sourceLabel: "forwarded via email",
      isStale: false,
      project: "inbox",
      priority: "none",
      createdLabel: "created 2 hours ago",
      subtasks: [
        {
          id: "task-1-sub-1",
          title: "Compare the new button states with production",
          done: false
        }
      ]
    },
    {
      id: "task-2",
      title: "Brainstorm ideas for Q4 marketing campaign",
      status: "todo",
      dueAt: null,
      projectId: null,
      tags: [{ label: "marketing", color: "orange" }],
      description: "Rough capture before it turns into a proper campaign brief.",
      sourceLabel: null,
      isStale: false,
      project: "inbox",
      priority: "medium",
      createdLabel: "created yesterday",
      subtasks: [{ id: "task-2-sub-1", title: "Collect three campaign directions", done: false }]
    },
    {
      id: "task-3",
      title: "Book flights for the design conference in May",
      status: "todo",
      dueAt: null,
      projectId: null,
      tags: [],
      description: "This one has been sitting for a few days and probably needs a decision.",
      sourceLabel: null,
      isStale: true,
      project: "inbox",
      priority: "medium",
      createdLabel: "created 3 days ago",
      subtasks: [{ id: "task-3-sub-1", title: "Check the conference hotel block first", done: false }]
    },
    {
      id: "task-4",
      title: "Review the new contractor agreements",
      status: "todo",
      dueAt: null,
      projectId: null,
      tags: [],
      description: "Fresh inbound admin work that still needs to be placed.",
      sourceLabel: null,
      isStale: false,
      project: "inbox",
      priority: "high",
      createdLabel: "created just now",
      subtasks: [{ id: "task-4-sub-1", title: "Flag any non-standard clauses", done: false }]
    },
    {
      id: "task-5",
      title: "Draft initial content strategy for Q3",
      status: "todo",
      dueAt: toLocalISODate(addDays(TODAY, -1)),
      projectId: null,
      tags: [{ label: "strategy", color: "purple" }],
      description: "Draft the quarter plan, pressure-test the core themes, and line up the first review with the team.",
      project: "inbox",
      priority: "none",
      createdLabel: "created 4 hours ago",
      subtasks: [
        { id: "task-5-sub-1", title: "Review last quarter performance notes", done: true },
        { id: "task-5-sub-2", title: "Outline three campaign themes", done: false },
        { id: "task-5-sub-3", title: "Prepare review draft for monday", done: false }
      ]
    },
    {
      id: "task-6",
      title: "Review agency pitches for rebrand",
      status: "todo",
      dueAt: TODAY_ISO,
      projectId: null,
      tags: [
        { label: "marketing", color: "orange" },
        { label: "meeting", color: null }
      ],
      description: "Compare the strongest proposals, note budget tradeoffs, and leave with a shortlist for the next meeting.",
      project: "inbox",
      priority: "high",
      createdLabel: "created 5 hours ago",
      subtasks: [
        { id: "task-6-sub-1", title: "Score each proposal against criteria", done: true },
        { id: "task-6-sub-2", title: "Summarize pricing tradeoffs", done: false },
        { id: "task-6-sub-3", title: "Draft shortlist recommendation", done: false }
      ]
    },
    {
      id: "task-7",
      title: "Update brand voice guidelines based on feedback",
      status: "todo",
      dueAt: TODAY_ISO,
      projectId: null,
      tags: [{ label: "documentation", color: "blue" }],
      description: "Fold the latest stakeholder feedback into the guidance so the team can use one consistent voice.",
      project: "inbox",
      priority: "medium",
      createdLabel: "created 1 day ago",
      subtasks: [
        { id: "task-7-sub-1", title: "Highlight tone changes from stakeholders", done: false },
        { id: "task-7-sub-2", title: "Refresh examples section", done: false }
      ]
    },
    {
      id: "task-8",
      title: "Prepare slides for client presentation",
      status: "todo",
      dueAt: toLocalISODate(addDays(TODAY, 1)),
      projectId: "project-marketing",
      tags: [{ label: "marketing", color: "orange" }],
      description: "Need to incorporate the latest metrics from the Q3 report.",
      project: "marketing",
      priority: "high",
      createdLabel: "created 3 hours ago",
      subtasks: [
        { id: "task-8-sub-1", title: "Collect the latest performance metrics", done: false },
        { id: "task-8-sub-2", title: "Rewrite the executive summary", done: false }
      ]
    },
    {
      id: "task-9",
      title: "Call contractor about kitchen timeline",
      status: "todo",
      dueAt: toLocalISODate(addDays(TODAY, 1)),
      projectId: "project-house-reno",
      tags: [{ label: "house reno", color: null }],
      description: "Confirm appliance delivery timing and lock the install sequence.",
      project: "house reno",
      priority: "medium",
      createdLabel: "created yesterday",
      subtasks: [{ id: "task-9-sub-1", title: "List open questions for the contractor", done: false }]
    },
    {
      id: "task-10",
      title: "Finalize design system components",
      status: "todo",
      dueAt: toLocalISODate(addDays(TODAY, 4)),
      projectId: "project-design-system",
      tags: [{ label: "design system", color: "blue" }],
      description: "Buttons, inputs, and modals need to be locked in before dev handoff.",
      project: "design system",
      priority: "high",
      createdLabel: "created yesterday",
      subtasks: [
        { id: "task-10-sub-1", title: "Approve button and input spacing", done: false },
        { id: "task-10-sub-2", title: "Close the modal edge-case review", done: false }
      ]
    },
    {
      id: "task-11",
      title: "Pay quarterly taxes",
      status: "todo",
      dueAt: toLocalISODate(addDays(TODAY, 5)),
      projectId: "project-finance",
      tags: [{ label: "finance", color: null }],
      description: "Review estimated payment numbers before submitting.",
      project: "finance",
      priority: "high",
      createdLabel: "created 2 days ago",
      subtasks: [{ id: "task-11-sub-1", title: "Confirm tax estimate with accountant", done: false }]
    },
    {
      id: "task-12",
      title: "Book flights for holiday trip",
      status: "todo",
      dueAt: toLocalISODate(addDays(TODAY, 16)),
      projectId: "project-personal",
      tags: [{ label: "personal", color: null }],
      description: "Prices are starting to move, so lock the best route soon.",
      project: "personal",
      priority: "medium",
      createdLabel: "created 4 days ago",
      subtasks: [{ id: "task-12-sub-1", title: "Compare two preferred itineraries", done: false }]
    },
    {
      id: "task-13",
      title: "Review annual performance goals",
      status: "todo",
      dueAt: toLocalISODate(addDays(TODAY, 38)),
      projectId: "project-career",
      tags: [{ label: "career", color: "purple" }],
      description: "Tighten the goals before year-end planning begins.",
      project: "career",
      priority: "medium",
      createdLabel: "created last week",
      subtasks: [
        { id: "task-13-sub-1", title: "Rewrite the growth goals in measurable terms", done: false }
      ]
    },
    {
      id: "task-14",
      title: "Order new office supplies",
      status: "completed",
      dueAt: toLocalISODate(addDays(TODAY, -2)),
      projectId: "project-ops",
      tags: [],
      description: "Restock the standard desk setup so the onboarding area is ready for the next new hire.",
      project: "ops",
      priority: "none",
      createdLabel: "created yesterday",
      subtasks: [{ id: "task-10-sub-1", title: "Restock notebooks and pens", done: true }]
    },
    {
      id: "task-15",
      title: "Email weekly update to team",
      status: "completed",
      dueAt: TODAY_ISO,
      projectId: "project-ops",
      tags: [],
      description: "Send the Friday wrap-up with wins, blockers, and next steps for next week.",
      project: "ops",
      priority: "none",
      createdLabel: "created yesterday",
      subtasks: [{ id: "task-11-sub-1", title: "Collect highlights from each stream", done: true }]
    }
  ];
}

// src/state/store.ts
function createStore() {
  const initialTasks2 = buildInitialTasks();
  const initialProjects = buildInitialProjects();
  const initialInboxCount = initialTasks2.filter((task) => task.status === "todo" && !task.dueAt).length;
  const initialSubtaskCount = initialTasks2.reduce((count, task) => count + task.subtasks.length, 0);
  const assistantConfigs2 = createAssistantConfigs(initialInboxCount);
  return {
    initialTasks: initialTasks2,
    initialProjects,
    assistantConfigs: assistantConfigs2,
    state: {
      tasks: initialTasks2.map(cloneTask),
      projects: initialProjects.map(cloneProject),
      currentView: "inbox",
      selectedProjectId: null,
      upcomingWeekStart: toLocalISODate(startOfWeekMonday(addDays(TODAY, 1))),
      selectedUpcomingDate: toLocalISODate(addDays(TODAY, 1)),
      messagesByView: createInitialMessages(assistantConfigs2),
      assistantOpen: true,
      mobileNavOpen: false,
      modalTaskId: null,
      modalSubtaskComposerOpen: false,
      modalSubtaskDraft: "",
      editingTaskId: null,
      editingTaskDraft: null,
      projectSetup: createProjectSetupState(),
      nextTaskId: initialTasks2.length + 1,
      nextSubtaskId: initialSubtaskCount + 1,
      nextProjectId: initialProjects.length + 1,
      pendingUpcomingScrollTarget: null,
      auth: {
        status: "loading",
        user: null,
        errorMessage: null
      }
    }
  };
}

// src/views/assistant-view.ts
function renderMessages({ messages, senderLabel, aiMessages }) {
  aiMessages.innerHTML = messages.map((message) => {
    if (message.sender === "user") {
      return `
                    <div class="flex flex-col items-end max-w-[90%] self-end">
                        <div class="text-[11px] font-semibold text-stone-500 mb-1.5 lowercase pr-1">you</div>
                        <div class="bg-stone-900 text-white px-5 py-3.5 rounded-[20px] rounded-tr-[4px] text-[14px] leading-relaxed">
                            ${escapeHtml(message.text)}
                        </div>
                    </div>
                `;
    }
    const body = message.rich ? `
                    <div class="lowercase mb-3">${escapeHtml(message.text)}</div>
                    <div class="flex flex-col gap-2 mt-3">
                        ${message.tasks.map(
      (task) => `
                            <div class="bg-white border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
                                <span class="text-[13px] text-stone-700 font-medium">
                                    ${task.order ? `<span class="text-stone-900 font-semibold">${escapeHtml(task.order)}</span> \u2014 ` : ""}${escapeHtml(task.text)}
                                </span>
                                <div class="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center flex-shrink-0 text-stone-400 border border-stone-200/50">
                                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </div>
                            </div>
                        `
    ).join("")}
                    </div>
                ` : `<div class="lowercase">${message.text}</div>`;
    return `
                <div class="flex flex-col items-start max-w-[95%]">
                    <div class="text-[11px] font-semibold text-stone-500 mb-1.5 lowercase pl-1">${escapeHtml(senderLabel)}</div>
                    <div class="bg-stone-100 text-stone-800 px-5 py-4 rounded-3xl rounded-tl-[4px] text-[14px] leading-relaxed border border-stone-200/50 w-full">
                        ${body}
                    </div>
                </div>
            `;
  }).join("");
  aiMessages.scrollTop = aiMessages.scrollHeight;
}
function renderAssistantPanel({
  config,
  messages,
  assistantIcons: assistantIcons2,
  dom: dom2
}) {
  dom2.assistantTitle.textContent = config.title;
  dom2.assistantQuickActionsLabel.textContent = config.quickActionsLabel;
  dom2.assistantInputHint.textContent = config.inputHint;
  dom2.assistantQuickActions.innerHTML = config.quickActions.map(
    (action) => `
            <button data-action="assistant-suggestion" data-suggestion="${escapeHtml(action.suggestion)}" class="w-full bg-white text-left px-4 py-3 rounded-2xl border border-stone-200 text-[13px] font-medium text-stone-700 hover:border-stone-400 hover:shadow-sm hover:text-stone-900 flex items-center gap-3 transition-all lowercase group" type="button">
                ${assistantIcons2[action.icon]}
                ${escapeHtml(action.suggestion)}
            </button>
        `
  ).join("");
  dom2.aiInput.placeholder = config.placeholder;
  renderMessages({
    messages,
    senderLabel: config.senderLabel,
    aiMessages: dom2.aiMessages
  });
}

// src/views/auth-view.ts
function renderShell(innerHtml) {
  return `
        <div class="min-h-screen w-full px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
            <div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[36px] border border-stone-200 bg-white shadow-soft">
                <div class="hidden lg:flex lg:w-[46%] flex-col justify-between bg-stone-900 px-10 py-10 text-white">
                    <div class="space-y-4">
                        <div class="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                            Precortex
                        </div>
                        <h1 class="font-display text-5xl tracking-tight">Think before the day starts moving.</h1>
                        <p class="max-w-md text-sm leading-7 text-white/72">
                            Log in to open your workspace, review priorities, and pick up where you left off.
                        </p>
                    </div>
                    <div class="space-y-3 text-sm text-white/60">
                        <div>Universal Login via Auth0</div>
                        <div>Backend identity verified by Convex</div>
                    </div>
                </div>
                <div class="flex flex-1 items-center justify-center bg-stone-50/70 px-6 py-10 sm:px-10">
                    <div class="w-full max-w-md rounded-[32px] border border-stone-200 bg-white p-8 shadow-soft sm:p-10">
                        ${innerHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}
function renderAuthLoading() {
  return renderShell(`
        <div class="space-y-5">
            <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Loading</div>
            <h2 class="font-display text-4xl tracking-tight text-stone-900">Checking your session.</h2>
            <p class="text-sm leading-7 text-stone-600">
                Validating your identity and connecting to your workspace.
            </p>
            <div class="flex items-center gap-3 pt-2 text-sm text-stone-500">
                <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-stone-900"></span>
                <span>Auth0 and Convex are starting up.</span>
            </div>
        </div>
    `);
}
function renderAuthScreen() {
  return renderShell(`
        <div class="space-y-6">
            <div class="space-y-3">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Login</div>
                <h2 class="font-display text-4xl tracking-tight text-stone-900">Open your workspace.</h2>
                <p class="text-sm leading-7 text-stone-600">
                    Continue with email or Google through the hosted login flow.
                </p>
            </div>
            <button
                data-action="login"
                class="flex w-full items-center justify-center rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                type="button"
            >
                Log in with Auth0
            </button>
            <p class="text-xs leading-6 text-stone-500">
                Make sure your Auth0 application allows <span class="font-medium text-stone-700">${escapeHtml(window.location.origin)}</span> as a callback and logout URL.
            </p>
        </div>
    `);
}
function renderAuthError(message) {
  return renderShell(`
        <div class="space-y-6">
            <div class="space-y-3">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500">Auth error</div>
                <h2 class="font-display text-4xl tracking-tight text-stone-900">Login could not start.</h2>
                <p class="text-sm leading-7 text-stone-600">
                    ${escapeHtml(message)}
                </p>
            </div>
            <button
                data-action="login"
                class="flex w-full items-center justify-center rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                type="button"
            >
                Retry login
            </button>
        </div>
    `);
}

// src/data/tag-colors.ts
var tagColorMap = {
  purple: "#a855f7",
  orange: "#f97316",
  blue: "#3b82f6",
  emerald: "#10b981"
};

// src/views/inbox-view.ts
function renderInboxMetadata(task) {
  const items = [];
  if (task.sourceLabel) {
    items.push(`
            <span class="text-stone-500 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                ${escapeHtml(task.sourceLabel)}
            </span>
        `);
  } else if (task.createdLabel) {
    items.push(
      `<span class="text-stone-500">${escapeHtml(task.createdLabel.replace(/^created\s+/i, "added "))}</span>`
    );
  }
  if (task.tags.length) {
    if (items.length) items.push('<span class="w-1 h-1 rounded-full bg-stone-300"></span>');
    items.push(
      ...task.tags.map(
        (tag) => `
                <span class="inline-flex items-center gap-1 bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200/50 lowercase">
                    ${tag.color && tagColorMap[tag.color] ? `<span class="w-1.5 h-1.5 rounded-full" style="background-color: ${tagColorMap[tag.color]}"></span>` : ""}
                    ${escapeHtml(tag.label)}
                </span>
            `
      )
    );
  }
  if (task.isStale) {
    if (items.length) items.push('<span class="w-1 h-1 rounded-full bg-stone-300"></span>');
    items.push(`
            <span class="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-medium lowercase">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                stale
            </span>
        `);
  }
  return items.join("");
}
function renderInboxTaskRow(task, index = 0, editingDraft = null) {
  const staggerDelay = Math.min(index * 40, 300);
  if (editingDraft) {
    return `
            <div class="task-row task-row-editing bg-white border border-stone-900/15 rounded-2xl p-5 flex flex-col gap-4 shadow-sm" data-task-id="${task.id}" data-task-list="inbox" style="animation-delay: ${staggerDelay}ms">
                <div class="flex items-start gap-4">
                    <button data-action="toggle" data-task-id="${task.id}" class="checkbox-wrapper pt-1 flex-shrink-0" aria-label="mark task complete" type="button">
                        <div class="w-[22px] h-[22px] rounded-full border-2 border-stone-300 flex items-center justify-center transition-all bg-white">
                            <svg class="w-3 h-3 text-white check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </button>
                    <div class="flex-1 flex flex-col gap-3 min-w-0">
                        <input data-action="edit-task-title" data-task-id="${task.id}" aria-label="edit task title" class="task-card-title-input w-full bg-transparent text-[16px] font-medium text-stone-900 outline-none" value="${escapeHtml(editingDraft.title)}">
                        <textarea data-action="edit-task-description" data-task-id="${task.id}" aria-label="edit task description" class="task-card-description-input w-full bg-transparent text-[13px] leading-relaxed text-stone-600 outline-none resize-none" rows="${editingDraft.description ? 2 : 1}" placeholder="Add a description...">${escapeHtml(editingDraft.description)}</textarea>
                        <div class="flex flex-wrap items-center gap-2 text-xs">
                            ${renderInboxMetadata(task)}
                        </div>
                    </div>
                </div>
                <div class="pl-[38px] flex items-center justify-between gap-3 flex-wrap">
                    <div class="text-[11px] font-medium text-stone-400 lowercase">editing task card</div>
                    <div class="flex items-center gap-2">
                        <button data-action="cancel-task-edit" class="px-3 py-1.5 rounded-xl border border-stone-200 text-[13px] font-medium text-stone-600 hover:border-stone-300 hover:text-stone-900 transition-colors lowercase" type="button">cancel</button>
                        <button data-action="save-task-edit" class="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-700 transition-colors lowercase" type="button">save</button>
                    </div>
                </div>
            </div>
        `;
  }
  return `
        <div class="task-row group bg-white border border-stone-200 rounded-2xl p-5 flex flex-col xl:flex-row gap-4 hover:border-stone-400 hover:bg-stone-50/50 cursor-pointer transition-colors" data-action="open-task" data-task-id="${task.id}" data-task-list="inbox" draggable="true" style="animation-delay: ${staggerDelay}ms">
            <div class="flex flex-1 items-start gap-4">
                <button data-action="toggle" data-task-id="${task.id}" class="checkbox-wrapper pt-1 flex-shrink-0" aria-label="mark task complete" type="button">
                    <div class="w-[22px] h-[22px] rounded-full border-2 border-stone-300 flex items-center justify-center transition-all bg-white group-hover:border-stone-400">
                        <svg class="w-3 h-3 text-white check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </button>
                <div class="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                    <div class="text-[16px] text-stone-900 font-medium transition-colors duration-200 task-title">${escapeHtml(task.title)}</div>
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                        ${renderInboxMetadata(task)}
                    </div>
                </div>
            </div>
            <div class="xl:ml-auto flex items-center gap-1.5 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity xl:w-auto w-full pl-[38px] xl:pl-0 pt-2 xl:pt-0 border-t border-stone-100 xl:border-none mt-2 xl:mt-0">
                <button data-action="schedule-task" data-task-id="${task.id}" data-destination="today" class="flex-1 xl:flex-none px-3 py-2 xl:py-1.5 text-[12px] font-medium rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:shadow-sm flex items-center justify-center gap-1.5 transition-all lowercase active:scale-95" type="button">
                    <svg class="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    today
                </button>
                <button data-action="schedule-task" data-task-id="${task.id}" data-destination="tomorrow" class="flex-1 xl:flex-none px-3 py-2 xl:py-1.5 text-[12px] font-medium rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:shadow-sm flex items-center justify-center gap-1.5 transition-all lowercase active:scale-95" type="button">
                    <svg class="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    tmrw
                </button>
                <button data-action="schedule-task" data-task-id="${task.id}" data-destination="next-week" class="flex-1 xl:flex-none px-3 py-2 xl:py-1.5 text-[12px] font-medium rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:shadow-sm flex items-center justify-center gap-1.5 transition-all lowercase active:scale-95" type="button">
                    <svg class="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line><path d="m9 16 2 2 4-4"></path></svg>
                    next wk
                </button>
                <button data-action="schedule-task" data-task-id="${task.id}" data-destination="later" class="flex-1 xl:flex-none px-3 py-2 xl:py-1.5 text-[12px] font-medium rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-900 hover:border-stone-400 hover:shadow-sm flex items-center justify-center gap-1.5 transition-all lowercase active:scale-95" type="button">
                    <svg class="w-3.5 h-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="3" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="13" rx="2" ry="2"></rect><line x1="8" x2="8" y1="3" y2="11"></line><line x1="8" x2="8" y1="13" y2="21"></line></svg>
                    later
                </button>
            </div>
        </div>
    `;
}
function renderInboxView({ inboxTasks, editingTaskId, editingTaskDraft }) {
  const count = inboxTasks.length;
  const countLabel = `${count} item${count === 1 ? "" : "s"}`;
  return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 flex-shrink-0 z-10 bg-white">
                <h1 class="font-display text-4xl sm:text-5xl tracking-tight lowercase flex items-baseline gap-4">
                    inbox
                    <span class="text-sm text-stone-400 font-sans font-medium tracking-wider">${countLabel}</span>
                </h1>
            </header>
            ${count ? `
                <div class="px-4 pb-4 sm:px-6 sm:pb-5 lg:px-10 lg:pb-6 flex-shrink-0 z-10 bg-white">
                    <div class="group flex items-center gap-3 bg-stone-50 rounded-2xl px-5 py-4 border border-stone-200/60 focus-within:border-stone-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                        <svg class="w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <input id="taskInput" type="text" aria-label="add task to inbox" class="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-stone-400 text-stone-900" placeholder="add to inbox to sort later...">
                    </div>
                </div>
            ` : ""}
            <div class="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-10 lg:px-10 flex flex-col relative">
                ${count ? `
                    <div class="flex flex-col gap-2">
                        ${inboxTasks.map(
    (task, i2) => renderInboxTaskRow(
      task,
      i2,
      editingTaskId === task.id ? editingTaskDraft : null
    )
  ).join("")}
                    </div>
                ` : `
                    <div class="flex flex-1 flex-col items-center justify-center text-center p-10">
                        <div class="w-24 h-24 mb-6 text-stone-200 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100 empty-icon shadow-soft">
                            <svg class="w-10 h-10 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h2 class="font-display text-3xl text-stone-900 mb-2 lowercase tracking-tight">inbox zero. nice work.</h2>
                        <p class="text-stone-500 text-sm max-w-[280px] lowercase leading-relaxed">you've triaged all your unscheduled tasks. enjoy the peace of mind.</p>
                        <button data-action="reset-inbox" class="mt-8 px-6 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:scale-105 transition-transform shadow-sm lowercase" type="button">
                            bring them back
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}

// src/views/modal-view.ts
function renderProjectOptions(task, projects) {
  const options = [
    `<option value="" ${!task.projectId ? "selected" : ""}>inbox</option>`,
    ...projects.map(
      (project) => `<option value="${project.id}" ${task.projectId === project.id ? "selected" : ""}>${escapeHtml(
        project.name
      )}</option>`
    )
  ];
  return options.join("");
}
function renderPriorityOptions(task) {
  const priorities = ["none", "low", "medium", "high"];
  return priorities.map(
    (priority) => `<option value="${priority}" ${task.priority === priority ? "selected" : ""}>${priority}</option>`
  ).join("");
}
function renderTaskModal({
  taskModal,
  task,
  projects,
  subtaskComposerOpen = false,
  subtaskDraft = "",
  animate = false
}) {
  if (!task) {
    taskModal.className = "hidden fixed inset-0 z-50 items-center justify-center p-6";
    taskModal.innerHTML = "";
    return;
  }
  const doneCount = task.subtasks.filter((subtask) => subtask.done).length;
  const dueMeta = getTaskDueMeta(task);
  const dueLabel = task.dueAt ? dueMeta.longLabel : "unscheduled";
  const backdropAnimationClass = animate ? "animate-backdrop" : "";
  const modalAnimationClass = animate ? "animate-modal" : "";
  taskModal.className = "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6";
  taskModal.innerHTML = `
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] ${backdropAnimationClass}" data-action="close-modal"></div>
        <div role="dialog" aria-modal="true" aria-label="task details" class="bg-white w-full max-w-[800px] max-h-[90vh] rounded-[28px] sm:rounded-[32px] shadow-modal relative z-10 flex flex-col overflow-hidden ${modalAnimationClass}">
            <div class="px-4 py-4 sm:px-6 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-white flex-shrink-0">
                <div class="flex items-center gap-3 min-w-0">
                    <button data-action="modal-toggle-task" data-task-id="${task.id}" class="px-3 py-1.5 rounded-xl text-[13px] font-medium ${task.status === "completed" ? "text-stone-500 border border-stone-200" : "bg-stone-900 text-white border border-stone-900"} transition-all lowercase flex items-center gap-2" type="button">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${task.status === "completed" ? "mark incomplete" : "mark complete"}
                    </button>
                    <div class="w-px h-4 bg-stone-200"></div>
                    <span class="text-[13px] text-stone-400 lowercase">${escapeHtml(task.projectName || "inbox")}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button data-action="close-modal" aria-label="close task details" class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <div class="flex-1 overflow-hidden flex flex-col lg:flex-row bg-white">
                <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 lg:pr-6 flex flex-col gap-6 sm:gap-8 min-w-0">
                    <div class="flex gap-4 items-start">
                        <button data-action="modal-toggle-task" data-task-id="${task.id}" aria-label="${task.status === "completed" ? "mark task incomplete" : "mark task complete"}" class="${task.status === "completed" ? "w-[22px] h-[22px] rounded-full border-2 border-stone-900 bg-stone-900 mt-2 flex items-center justify-center flex-shrink-0" : "w-[22px] h-[22px] rounded-full border-2 border-stone-300 mt-2 flex-shrink-0 cursor-pointer hover:border-stone-400 transition-colors"}" type="button">
                            ${task.status === "completed" ? '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ""}
                        </button>
                        <textarea id="modalTitleInput" data-task-id="${task.id}" aria-label="task title" class="font-display text-3xl text-stone-900 w-full outline-none resize-none bg-transparent placeholder-stone-300 tracking-tight" rows="2" placeholder="task name">${escapeHtml(task.title)}</textarea>
                    </div>
                    <div class="pl-[38px] flex flex-col gap-2">
                        <textarea id="modalDescriptionInput" data-task-id="${task.id}" aria-label="task description" class="w-full bg-transparent text-[15px] leading-relaxed text-stone-600 outline-none resize-none min-h-[100px] placeholder-stone-400" placeholder="add a description...">${escapeHtml(task.description || "")}</textarea>
                    </div>
                    <div class="pl-[38px] flex flex-col gap-3">
                        <div class="flex items-center justify-between mb-1 gap-3 flex-wrap">
                            <h3 class="text-[13px] font-semibold text-stone-900 lowercase tracking-wide">subtasks</h3>
                            <button data-action="open-subtask-composer" data-task-id="${task.id}" class="w-7 h-7 rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-colors flex items-center justify-center" aria-label="add subtask" type="button">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                        <div class="flex flex-col gap-2.5">
                            ${subtaskComposerOpen ? `
                                <div class="flex items-start gap-3">
                                    <div class="w-4 h-4 rounded border-2 border-stone-300 mt-2 flex-shrink-0"></div>
                                    <input id="modalNewSubtaskInput" data-task-id="${task.id}" aria-label="new subtask" class="flex-1 min-w-0 bg-transparent border-none outline-none p-0 pt-1.5 text-[14px] text-stone-800 placeholder-stone-400" value="${escapeHtml(
    subtaskDraft
  )}" placeholder="new subtask...">
                                    <button data-action="cancel-subtask-composer" class="opacity-100 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all flex-shrink-0" aria-label="cancel new subtask" type="button">
                                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path></svg>
                                    </button>
                                </div>
                            ` : ""}
                            ${task.subtasks.length ? task.subtasks.map(
    (subtask) => `
                                    <div class="group/subtask flex items-start gap-3 ${subtask.done ? "opacity-60" : ""}">
                                        <button data-action="toggle-subtask" data-task-id="${task.id}" data-subtask-id="${subtask.id}" class="flex items-center justify-center w-8 h-8 -m-2 mt-0 flex-shrink-0" aria-label="${subtask.done ? "mark subtask incomplete" : "mark subtask complete"}" type="button">
                                            <span class="${subtask.done ? "w-4 h-4 rounded border border-stone-900 bg-stone-900 flex items-center justify-center" : "w-4 h-4 rounded border-2 border-stone-300 hover:border-stone-400 transition-colors"}">
                                                ${subtask.done ? '<svg class="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ""}
                                            </span>
                                        </button>
                                        <input data-action="edit-subtask-title" data-task-id="${task.id}" data-subtask-id="${subtask.id}" aria-label="subtask title" class="flex-1 min-w-0 bg-transparent border-none outline-none p-0 pt-1.5 text-[14px] ${subtask.done ? "text-stone-500 line-through" : "text-stone-800"}" value="${escapeHtml(subtask.title)}">
                                        <button data-action="remove-subtask" data-task-id="${task.id}" data-subtask-id="${subtask.id}" class="opacity-0 pointer-events-none group-hover/subtask:opacity-100 group-hover/subtask:pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all flex-shrink-0" aria-label="remove subtask" type="button">
                                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path></svg>
                                        </button>
                                    </div>
                                `
  ).join("") : '<div class="text-[14px] text-stone-400 lowercase">No subtasks yet.</div>'}
                        </div>
                    </div>
                    <div class="h-8"></div>
                </div>
                <div class="w-full lg:w-[260px] border-t lg:border-t-0 lg:border-l border-stone-100 bg-stone-50/30 p-4 sm:p-6 flex flex-col gap-6 flex-shrink-0">
                    <div class="flex flex-col gap-5">
                        <div class="flex flex-col gap-2">
                            <label for="modalProjectSelect" class="text-[11px] font-semibold text-stone-500 lowercase tracking-wider">project</label>
                            <select id="modalProjectSelect" data-action="change-task-project" data-task-id="${task.id}" class="px-3 py-2 rounded-xl bg-white border border-stone-200 text-[13px] font-medium text-stone-700 outline-none focus:border-stone-400 lowercase">
                                ${renderProjectOptions(task, projects)}
                            </select>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="modalDueDateInput" class="text-[11px] font-semibold text-stone-500 lowercase tracking-wider">due date</label>
                            <input id="modalDueDateInput" data-action="change-task-due-date" data-task-id="${task.id}" type="date" value="${task.dueAt || ""}" class="px-3 py-2 rounded-xl bg-white border border-dashed border-stone-300 text-[13px] font-medium text-stone-700 outline-none focus:border-stone-400">
                            <span class="text-[12px] text-stone-500 lowercase">${escapeHtml(dueLabel)}</span>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="modalPrioritySelect" class="text-[11px] font-semibold text-stone-500 lowercase tracking-wider">priority</label>
                            <select id="modalPrioritySelect" data-action="change-task-priority" data-task-id="${task.id}" class="px-3 py-2 rounded-xl bg-white border border-dashed border-stone-300 text-[13px] font-medium text-stone-700 outline-none focus:border-stone-400 lowercase">
                                ${renderPriorityOptions(task)}
                            </select>
                        </div>
                    </div>
                    <div class="mt-auto pt-6 flex flex-col gap-3 border-t border-stone-200/60">
                        <span class="text-[11px] font-medium text-stone-500 lowercase">${escapeHtml(task.createdLabel || "created recently")}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// src/views/navigation-view.ts
function renderNavigation({
  currentView,
  inboxCount,
  navInboxCount,
  projectNav,
  projects,
  selectedProjectId,
  workspaceCard,
  authUser
}) {
  const displayName = authUser?.name || authUser?.email || "logged in";
  const safeDisplayName = escapeHtml(displayName);
  const safeEmail = escapeHtml(authUser?.email || "authenticated");
  const avatarMarkup = authUser?.picture ? `<img src="${escapeHtml(authUser.picture)}" alt="" class="w-10 h-10 rounded-full object-cover shadow-sm">` : `<div class="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-medium shadow-sm">${displayName.slice(0, 1).toUpperCase()}</div>`;
  workspaceCard.innerHTML = `
        <div class="bg-white rounded-3xl p-4 shadow-soft flex items-center gap-3 w-full">
            ${avatarMarkup}
            <div class="min-w-0 flex-1">
                <div class="text-sm font-medium truncate lowercase">${safeDisplayName}</div>
                <div class="text-xs text-stone-500 truncate">${safeEmail}</div>
            </div>
            <button
                data-action="logout"
                class="rounded-full border border-stone-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-900"
                type="button"
            >
                Log out
            </button>
        </div>
    `;
  document.querySelectorAll('[data-action="switch-view"]').forEach((link) => {
    const navigationLink = link;
    const isActive = navigationLink.dataset.view === currentView;
    if (navigationLink.dataset.view === "inbox") {
      navigationLink.className = isActive ? "flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all bg-stone-900 text-white font-medium shadow-md lowercase w-full" : "flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-50 lowercase w-full";
    } else {
      navigationLink.className = isActive ? "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all bg-stone-900 text-white font-medium shadow-md lowercase w-full" : "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-50 lowercase w-full";
    }
    const icon = navigationLink.querySelector("svg");
    if (icon) {
      icon.classList.toggle("opacity-70", !isActive);
    }
  });
  navInboxCount.textContent = String(inboxCount);
  navInboxCount.className = currentView === "inbox" ? "bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold transition-all" : "bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all";
  projectNav.innerHTML = projects.map((project) => {
    const isActive = currentView === "project" && selectedProjectId === project.id;
    const deadlineLabel = project.deadline ? project.deadline.slice(5) : "";
    return `
                <button
                    data-action="open-project"
                    data-project-id="${project.id}"
                    class="${isActive ? "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm transition-all bg-stone-900 text-white font-medium shadow-md lowercase" : "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-50 lowercase group"}"
                    type="button"
                >
                    <span class="flex items-center gap-3 min-w-0">
                        <span class="w-2 h-2 rounded-full border-2 ${isActive ? "border-white/70" : "border-stone-300 group-hover:border-stone-500"} transition-colors"></span>
                        <span class="truncate">${project.name}</span>
                    </span>
                    ${deadlineLabel ? `<span class="${isActive ? "text-white/70" : "text-stone-400"} text-[10px] font-semibold uppercase tracking-wider">${deadlineLabel}</span>` : ""}
                </button>
            `;
  }).join("");
}

// src/views/project-setup-modal.ts
function renderSetupMessages(messages) {
  return messages.map((message) => {
    if (message.sender === "user") {
      return `
                    <div class="flex justify-end">
                        <div class="max-w-[80%] rounded-[20px] rounded-tr-[6px] bg-stone-900 text-white px-4 py-3 text-[14px] leading-relaxed">
                            ${escapeHtml(message.text)}
                        </div>
                    </div>
                `;
    }
    return `
                <div class="flex justify-start">
                    <div class="max-w-[88%] rounded-3xl rounded-tl-[6px] bg-stone-100 border border-stone-200/60 text-stone-800 px-4 py-3 text-[14px] leading-relaxed">
                        ${escapeHtml(message.text)}
                    </div>
                </div>
            `;
  }).join("");
}
function formatDraftDeadline(deadline) {
  if (!deadline) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return "use a date like 2026-04-30";
  return formatters.modalDate.format(parseLocalISODate(deadline)).toLowerCase();
}
function renderReview(draft) {
  return `
        <div class="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
            <div class="rounded-3xl border border-stone-200 bg-stone-50/60 p-5">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2">bay draft</div>
                <p class="text-[14px] leading-relaxed text-stone-500 lowercase">
                    edit anything that feels wrong. Bay will create exactly what you confirm here.
                </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="flex flex-col gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">project name</span>
                    <input id="projectDraftName" class="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[14px] text-stone-900 outline-none focus:border-stone-400" value="${escapeHtml(draft.name)}">
                </label>
                <label class="flex flex-col gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">deadline</span>
                    <input id="projectDraftDeadline" class="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[14px] text-stone-900 outline-none focus:border-stone-400" value="${escapeHtml(draft.deadline)}">
                    <span class="text-[12px] text-stone-500 lowercase">${escapeHtml(formatDraftDeadline(draft.deadline))}</span>
                </label>
            </div>
            <label class="flex flex-col gap-2">
                <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">summary</span>
                <textarea id="projectDraftSummary" class="min-h-[120px] rounded-3xl border border-stone-200 bg-white px-4 py-3 text-[14px] leading-relaxed text-stone-900 outline-none resize-none focus:border-stone-400">${escapeHtml(draft.summary)}</textarea>
            </label>
            <label class="flex flex-col gap-2">
                <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">next step</span>
                <input id="projectDraftNextStep" class="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-[14px] text-stone-900 outline-none focus:border-stone-400" value="${escapeHtml(draft.nextStep)}">
            </label>
            <div class="flex flex-col gap-3">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">starter tasks</div>
                ${draft.tasks.map(
    (task, index) => `
                            <div class="rounded-[22px] border border-stone-200 bg-white px-4 py-3">
                                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2">${index === 0 ? "next step task" : `task ${index + 1}`}</div>
                                <input
                                    data-action="edit-project-draft-task"
                                    data-task-id="${task.id}"
                                    class="w-full bg-transparent border-none outline-none text-[14px] text-stone-900"
                                    value="${escapeHtml(task.title)}"
                                >
                            </div>
                        `
  ).join("")}
            </div>
        </div>
    `;
}
function renderProjectSetupModal({ projectSetupModal, projectSetup }) {
  if (!projectSetup.open) {
    projectSetupModal.className = "hidden fixed inset-0 z-50 items-center justify-center p-6";
    projectSetupModal.innerHTML = "";
    return;
  }
  projectSetupModal.className = "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6";
  projectSetupModal.innerHTML = `
        <div class="absolute inset-0 bg-stone-900/45 backdrop-blur-[2px] animate-backdrop" data-action="close-project-setup"></div>
        <div role="dialog" aria-modal="true" aria-label="project setup" class="relative z-10 w-full max-w-[920px] max-h-[90vh] overflow-hidden rounded-[28px] sm:rounded-[32px] bg-white shadow-modal animate-modal flex flex-col">
            <div class="px-4 py-4 sm:px-6 sm:py-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-sm">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"></path><path d="M12 8v4l3 3"></path><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"></circle></svg>
                    </div>
                    <div>
                        <div class="text-[15px] font-medium lowercase">bay project setup</div>
                        <div class="text-[12px] text-stone-500 lowercase">shape the project before it turns into tasks</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button data-action="restart-project-setup" class="px-3 py-2 rounded-xl text-[12px] font-medium border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors lowercase" type="button">restart</button>
                    <button data-action="close-project-setup" aria-label="close project setup" class="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            ${projectSetup.phase === "review" && projectSetup.draft ? renderReview(projectSetup.draft) : `
                        <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-stone-50/20">
                            <div class="flex flex-col gap-4">
                                ${renderSetupMessages(projectSetup.messages)}
                            </div>
                        </div>
                        <div class="border-t border-stone-100 p-4 bg-white">
                            <div class="group border border-stone-200 bg-white rounded-3xl flex items-end p-1.5 focus-within:border-stone-500 focus-within:shadow-sm transition-all">
                                <textarea id="projectSetupInput" aria-label="reply to bay" class="flex-1 bg-transparent border-none outline-none text-[14px] placeholder-stone-400 text-stone-900 py-2.5 pl-4 pr-2 resize-none max-h-[120px] overflow-y-auto" rows="1" placeholder="answer bay..."></textarea>
                                <button data-action="send-project-setup" aria-label="send message" class="w-9 h-9 flex-shrink-0 rounded-full bg-stone-900 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm mb-0.5 mr-0.5" type="button">
                                    <svg class="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </div>
                        </div>
                    `}
            ${projectSetup.phase === "review" && projectSetup.draft ? `
                        <div class="border-t border-stone-100 p-4 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <button data-action="close-project-setup" class="px-4 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors lowercase" type="button">
                                cancel
                            </button>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                                <button data-action="restart-project-setup" class="px-4 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-400 transition-colors lowercase" type="button">
                                    restart
                                </button>
                                <button data-action="confirm-project-draft" class="px-5 py-3 rounded-2xl bg-stone-900 text-white font-medium shadow-sm hover:bg-stone-800 transition-colors lowercase" type="button">
                                    create project
                                </button>
                            </div>
                        </div>
                    ` : ""}
        </div>
    `;
}

// src/views/task-card.ts
function renderTaskBadges(task) {
  const dueMeta = getTaskDueMeta(task);
  const badges = [];
  const dueBadgeClass = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 lowercase text-xs font-medium shadow-sm";
  if (dueMeta.label) {
    badges.push(`
            <span class="${dueBadgeClass}">
                <svg class="w-3.5 h-3.5 ${dueMeta.tone === "overdue" ? "text-red-500" : "text-stone-400"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                ${escapeHtml(dueMeta.label)}
            </span>
        `);
  }
  if (task.projectId && task.projectName) {
    badges.push(`
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 lowercase text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                ${escapeHtml(task.projectName)}
            </span>
        `);
  }
  task.tags.forEach((tag) => {
    badges.push(`
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-stone-300 bg-white text-stone-500 lowercase text-xs font-medium">
                ${tag.color && tagColorMap[tag.color] ? `<span class="w-1.5 h-1.5 rounded-full" style="background-color: ${tagColorMap[tag.color]}"></span>` : ""}
                ${escapeHtml(tag.label)}
            </span>
        `);
  });
  return badges.join("");
}
function renderTaskCard(task, options = {}) {
  const { anchorDate = null, index = 0, listId = "" } = options;
  const staggerDelay = Math.min(index * 40, 300);
  const isCompleted = task.status === "completed";
  const isEditing = Boolean(options.editingDraft);
  const editDraft = options.editingDraft;
  const badges = renderTaskBadges(task);
  const anchorAttribute = anchorDate ? `data-anchor-date="${anchorDate}"` : "";
  const rowClasses = isCompleted ? "task-row completed group bg-stone-50 rounded-2xl p-5 flex flex-col gap-3 transition-colors cursor-pointer scroll-mt-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-900 focus-visible:outline-offset-2" : "task-row group bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-stone-400 hover:bg-stone-50/50 transition-colors cursor-pointer scroll-mt-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-900 focus-visible:outline-offset-2";
  const titleClasses = isCompleted ? "text-[15px] text-stone-400 font-medium line-through task-title" : "text-[15px] text-stone-900 font-semibold transition-colors duration-200 task-title";
  const checkboxClasses = isCompleted ? "w-[22px] h-[22px] rounded-full border-2 border-stone-900 bg-stone-900 flex items-center justify-center transition-all" : "w-[22px] h-[22px] rounded-full border-2 border-stone-300 flex items-center justify-center transition-all bg-white group-hover:border-stone-400";
  if (isEditing && editDraft) {
    return `
            <div class="task-row task-row-editing bg-white border border-stone-900/15 rounded-2xl p-5 flex flex-col gap-4 scroll-mt-6 shadow-sm" data-task-id="${task.id}" data-task-list="${listId}" ${anchorAttribute} style="animation-delay: ${staggerDelay}ms">
                <div class="flex items-start gap-4">
                    <button data-action="toggle" data-task-id="${task.id}" class="checkbox-wrapper pt-1 flex-shrink-0" aria-label="${isCompleted ? "mark task incomplete" : "mark task complete"}" type="button">
                        <div class="${checkboxClasses}">
                            <svg class="w-3 h-3 text-white check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </button>
                    <div class="flex-1 flex flex-col gap-3 min-w-0">
                        <input data-action="edit-task-title" data-task-id="${task.id}" aria-label="edit task title" class="task-card-title-input w-full bg-transparent text-[15px] font-semibold text-stone-900 outline-none" value="${escapeHtml(editDraft.title)}">
                        <textarea data-action="edit-task-description" data-task-id="${task.id}" aria-label="edit task description" class="task-card-description-input w-full bg-transparent text-[13px] leading-relaxed text-stone-600 outline-none resize-none" rows="${editDraft.description ? 2 : 1}" placeholder="Add a description...">${escapeHtml(editDraft.description)}</textarea>
                    </div>
                </div>
                ${badges ? `
                    <div class="pl-[38px] flex flex-wrap items-center gap-2">
                        ${badges}
                    </div>
                ` : ""}
                <div class="pl-[38px] flex items-center justify-between gap-3 flex-wrap">
                    <div class="text-[11px] font-medium text-stone-500 lowercase">editing task card</div>
                    <div class="flex items-center gap-2">
                        <button data-action="cancel-task-edit" class="px-3 py-1.5 rounded-xl border border-stone-200 text-[13px] font-medium text-stone-600 hover:border-stone-300 hover:text-stone-900 transition-colors lowercase" type="button">cancel</button>
                        <button data-action="save-task-edit" class="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-700 transition-colors lowercase" type="button">save</button>
                    </div>
                </div>
            </div>
        `;
  }
  return `
        <div class="${rowClasses}" data-action="open-task" data-task-id="${task.id}" data-task-list="${listId}" draggable="true" tabindex="0" role="button" aria-label="${escapeHtml(task.title)}" ${anchorAttribute} style="animation-delay: ${staggerDelay}ms">
            <div class="flex items-start gap-4">
                <button data-action="toggle" data-task-id="${task.id}" class="checkbox-wrapper pt-0.5 flex-shrink-0" aria-label="${isCompleted ? "mark task incomplete" : "mark task complete"}" type="button">
                    <div class="${checkboxClasses}">
                        <svg class="w-3 h-3 text-white check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </button>
                <div class="flex-1 flex flex-col justify-center gap-1.5 pt-0.5">
                    <div class="${titleClasses}">${escapeHtml(task.title)}</div>
                    ${task.description ? `<p class="text-[13px] ${isCompleted ? "text-stone-400" : "text-stone-500"} leading-relaxed line-clamp-1">${escapeHtml(
    task.description
  )}</p>` : ""}
                </div>
            </div>
            ${!isCompleted && badges ? `
                <div class="pl-[38px] flex flex-wrap items-center gap-2">
                    ${badges}
                </div>
            ` : ""}
        </div>
    `;
}

// src/views/project-view.ts
function renderDeadline(deadline) {
  if (!deadline) return "no deadline";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return deadline.toLowerCase();
  return formatters.modalDate.format(parseLocalISODate(deadline)).toLowerCase();
}
function renderProjectView({ project, todoTasks, completedTasks, editingTaskId, editingTaskDraft }) {
  return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start lg:gap-6 flex-shrink-0 z-10 bg-white">
                <div class="flex flex-col gap-3 max-w-3xl">
                    <div class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        <span class="w-2 h-2 rounded-full bg-stone-900"></span>
                        bay project
                    </div>
                    <h1 class="font-display text-4xl sm:text-5xl tracking-tight">${escapeHtml(project.name)}</h1>
                    <p class="text-[14px] leading-relaxed text-stone-500 max-w-3xl">${escapeHtml(project.summary)}</p>
                </div>
                <div class="flex flex-col items-start lg:items-end gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">deadline</span>
                    <span class="px-4 py-2 rounded-full bg-stone-900 text-white text-[13px] font-medium lowercase shadow-sm">
                        ${escapeHtml(renderDeadline(project.deadline))}
                    </span>
                </div>
            </header>
            <div class="px-4 pb-4 sm:px-6 sm:pb-5 lg:px-10 lg:pb-6 flex-shrink-0 z-10 bg-white">
                <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] gap-4">
                    <div class="rounded-2xl border border-stone-200 bg-stone-50/70 p-6 flex flex-col gap-2">
                        <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">next step</div>
                        <div class="font-display text-2xl tracking-tight text-stone-900">${escapeHtml(project.nextStep)}</div>
                    </div>
                    <div class="group flex items-center gap-3 bg-stone-50 rounded-2xl px-5 py-4 border border-stone-200/60 focus-within:border-stone-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                        <svg class="w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <input id="taskInput" type="text" aria-label="add task to project" class="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-stone-400 text-stone-900" placeholder="add another task to this project...">
                    </div>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-10 lg:px-10 flex flex-col">
                <div class="flex flex-col gap-2">
                    ${todoTasks.length ? todoTasks.map(
    (task, i2) => renderTaskCard(task, {
      index: i2,
      listId: "project-todo",
      editingDraft: editingTaskId === task.id ? editingTaskDraft : null
    })
  ).join("") : '<div class="rounded-3xl border border-dashed border-stone-300 bg-stone-50/70 p-6 text-[14px] text-stone-500 lowercase">No active project tasks yet.</div>'}
                </div>
                <div class="flex items-center gap-4 mt-10 mb-3">
                    <h2 class="text-[11px] font-medium text-stone-500 lowercase tracking-widest flex-shrink-0">completed (${completedTasks.length})</h2>
                    <div class="h-px bg-stone-100 flex-1"></div>
                </div>
                <div class="flex flex-col gap-2">
                    ${completedTasks.length ? completedTasks.map(
    (task, i2) => renderTaskCard(task, {
      index: i2,
      listId: "project-completed",
      editingDraft: editingTaskId === task.id ? editingTaskDraft : null
    })
  ).join("") : '<div class="text-[13px] text-stone-500 lowercase">No completed project tasks yet.</div>'}
                </div>
            </div>
        </div>
    `;
}

// src/views/today-view.ts
function renderTodayView({ todoTasks, completedTasks, editingTaskId, editingTaskDraft }) {
  return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 flex-shrink-0 z-10 bg-white">
                <h1 class="font-display text-4xl sm:text-5xl tracking-tight lowercase">today</h1>
            </header>
            <div class="px-4 pb-4 sm:px-6 sm:pb-5 lg:px-10 lg:pb-6 flex-shrink-0 z-10 bg-white">
                <div class="group flex items-center gap-3 bg-stone-50 rounded-2xl px-5 py-4 border border-stone-200/60 focus-within:border-stone-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                    <svg class="w-5 h-5 text-stone-400 group-focus-within:text-stone-900 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <input id="taskInput" type="text" aria-label="add task for today" class="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-stone-400 text-stone-900" placeholder="what needs to be done?">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-10 lg:px-10 flex flex-col">
                <div class="flex flex-col gap-2">
                    ${todoTasks.length ? todoTasks.map(
    (task, i2) => renderTaskCard(task, {
      index: i2,
      listId: "today-todo",
      editingDraft: editingTaskId === task.id ? editingTaskDraft : null
    })
  ).join("") : '<div class="rounded-3xl border border-dashed border-stone-300 bg-stone-50/70 p-6 text-[14px] text-stone-500 lowercase">No overdue or due-today tasks right now.</div>'}
                </div>
                <div class="flex items-center gap-4 mt-10 mb-3">
                    <h2 class="text-[11px] font-medium text-stone-500 lowercase tracking-widest flex-shrink-0">completed (${completedTasks.length})</h2>
                    <div class="h-px bg-stone-100 flex-1"></div>
                </div>
                <div class="flex flex-col gap-2">
                    ${completedTasks.length ? completedTasks.map(
    (task, i2) => renderTaskCard(task, {
      index: i2,
      listId: "today-completed",
      editingDraft: editingTaskId === task.id ? editingTaskDraft : null
    })
  ).join("") : '<div class="text-[13px] text-stone-500 lowercase">No completed tasks yet.</div>'}
                </div>
            </div>
        </div>
    `;
}

// src/views/upcoming-view.ts
function renderUpcomingSection(sectionKey, title, tasks, editingTaskId, editingTaskDraft) {
  if (!tasks.length) return "";
  let lastDate = null;
  const cards = tasks.map((task, i2) => {
    const anchorDate = task.dueAt !== lastDate ? task.dueAt : null;
    lastDate = task.dueAt;
    return renderTaskCard(task, {
      anchorDate,
      index: i2,
      listId: `upcoming-${sectionKey}`,
      editingDraft: editingTaskId === task.id ? editingTaskDraft : null
    });
  }).join("");
  return `
        <div class="flex items-center gap-4 mt-10 mb-3 sticky top-0 bg-white/90 backdrop-blur-sm z-20 py-2 scroll-mt-6" data-anchor-section="${sectionKey}">
            <h2 class="${sectionKey === "tomorrow" ? "font-display text-lg text-stone-900" : "text-[11px] font-medium text-stone-500 tracking-widest"} lowercase flex-shrink-0">${title}</h2>
            <div class="h-px bg-stone-100 flex-1"></div>
        </div>
        <div class="flex flex-col gap-2">
            ${cards}
        </div>
    `;
}
function renderUpcomingView({ weekDays, groups, editingTaskId, editingTaskDraft }) {
  const hasUpcomingTasks = Object.values(groups).some((tasks) => Array.isArray(tasks) && tasks.length > 0);
  return `
        <div class="h-full flex flex-col min-h-0">
            <header class="px-4 py-4 pb-3 sm:px-6 sm:py-6 lg:px-10 lg:py-8 lg:pb-4 flex flex-col gap-4 sm:gap-6 flex-shrink-0 z-10 bg-white">
                <h1 class="font-display text-4xl sm:text-5xl tracking-tight lowercase">upcoming</h1>
                <div class="flex items-center justify-between gap-1 sm:gap-2 px-0 sm:px-2 py-1">
                    <button data-action="shift-week" data-direction="-1" aria-label="previous week" class="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <div class="flex-1 flex justify-between gap-2">
                        ${weekDays.map((day) => {
    const dayLabel = formatters.weekdayShort.format(day.date).toLowerCase();
    const numberLabel = day.date.getDate();
    const baseClasses = day.isSelected ? "flex-1 flex flex-col items-center justify-center p-2 rounded-2xl bg-stone-900 text-white shadow-md cursor-pointer transition-colors" : day.isToday ? "flex-1 flex flex-col items-center justify-center p-2 rounded-2xl bg-stone-50 border border-stone-200/60 text-stone-700 cursor-pointer transition-colors relative" : "flex-1 flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-stone-50 text-stone-600 cursor-pointer transition-colors relative";
    const metaLabelClasses = day.isSelected ? "text-stone-300" : day.isToday ? "text-stone-500" : "text-stone-500";
    return `
                                    <button data-action="select-upcoming-date" data-date="${day.iso}" class="${baseClasses}" type="button">
                                        <span class="text-[10px] font-semibold uppercase tracking-wider mb-1 ${metaLabelClasses}">${escapeHtml(dayLabel)}</span>
                                        <span class="text-lg font-medium">${numberLabel}</span>
                                        ${day.hasTasks && !day.isSelected ? `<span class="absolute bottom-1 w-1 h-1 rounded-full ${day.isToday ? "bg-stone-900" : "bg-stone-400"}"></span>` : ""}
                                    </button>
                                `;
  }).join("")}
                    </div>
                    <button data-action="shift-week" data-direction="1" aria-label="next week" class="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors" type="button">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </header>
            <div id="upcomingScrollArea" class="flex-1 overflow-y-auto px-4 pb-24 sm:px-6 sm:pb-10 lg:px-10 flex flex-col">
                ${hasUpcomingTasks ? `
                    ${renderUpcomingSection("tomorrow", "tomorrow", groups.tomorrow, editingTaskId, editingTaskDraft)}
                    ${renderUpcomingSection("this-week", "this week", groups["this-week"], editingTaskId, editingTaskDraft)}
                    ${renderUpcomingSection("later", "later", groups.later, editingTaskId, editingTaskDraft)}
                ` : `
                    <div class="mt-4 rounded-3xl border border-dashed border-stone-300 bg-stone-50/70 p-8 text-[14px] text-stone-500 lowercase">
                        No upcoming tasks scheduled yet. Add due dates to see them here.
                    </div>
                `}
            </div>
        </div>
    `;
}

// src/main.ts
var AUTH_HINT_STORAGE_KEY = "precortex.authHint";
var store = createStore();
var state = store.state;
var initialTasks = store.initialTasks;
var assistantConfigs = store.assistantConfigs;
var authClient = null;
var convexClient = null;
var hasStoredAuthHint = false;
var byId = (id) => document.getElementById(id);
var mobileViewport = window.matchMedia("(max-width: 1023px)");
var suppressNextTaskListAnimation = false;
var dragState = {
  taskId: null,
  listId: null,
  justDragged: false
};
var dom = {
  authRoot: byId("authRoot"),
  appShell: byId("appShell"),
  mainView: byId("mainView"),
  aiMessages: byId("aiMessages"),
  assistantQuickActions: byId("assistantQuickActions"),
  assistantTitle: byId("assistantTitle"),
  assistantQuickActionsLabel: byId("assistantQuickActionsLabel"),
  assistantInputHint: byId("assistantInputHint"),
  assistantPanel: byId("assistantPanel"),
  navInboxCount: byId("navInboxCount"),
  projectNav: byId("projectNav"),
  workspaceCard: byId("workspaceCard"),
  mobileNav: byId("mobileNav"),
  mobileDrawerBackdrop: byId("mobileDrawerBackdrop"),
  openNavButton: byId("openNavButton"),
  reopenAssistantButton: byId("reopenAssistantButton"),
  taskModal: byId("taskModal"),
  projectSetupModal: byId("projectSetupModal"),
  aiInput: byId("aiInput"),
  toastContainer: byId("toastContainer")
};
var destinationLabels = {
  today: "today",
  tomorrow: "tomorrow",
  "next-week": "next week",
  later: "later"
};
var activeToastTimer = null;
function readStoredAuthHint() {
  try {
    const raw = window.localStorage.getItem(AUTH_HINT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      name: typeof parsed.name === "string" ? parsed.name : void 0,
      email: typeof parsed.email === "string" ? parsed.email : void 0,
      picture: typeof parsed.picture === "string" ? parsed.picture : void 0
    };
  } catch {
    return null;
  }
}
function persistAuthHint(user) {
  try {
    window.localStorage.setItem(AUTH_HINT_STORAGE_KEY, JSON.stringify(user || {}));
  } catch {
  }
  hasStoredAuthHint = true;
}
function clearAuthHint() {
  try {
    window.localStorage.removeItem(AUTH_HINT_STORAGE_KEY);
  } catch {
  }
  hasStoredAuthHint = false;
}
var storedAuthHint = readStoredAuthHint();
if (storedAuthHint) {
  state.auth.user = storedAuthHint;
  hasStoredAuthHint = true;
}
function showToast(message, undoCallback) {
  if (activeToastTimer) clearTimeout(activeToastTimer);
  dom.toastContainer.innerHTML = "";
  const toast = document.createElement("div");
  toast.className = "toast flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-stone-900 text-white text-[13px] font-medium shadow-float";
  toast.innerHTML = `<span>${message}</span>${undoCallback ? '<button data-action="toast-undo" class="text-stone-300 hover:text-white transition-colors lowercase" type="button">undo</button>' : ""}`;
  if (undoCallback) {
    toast.querySelector('[data-action="toast-undo"]')?.addEventListener("click", () => {
      undoCallback();
      dismissToast();
    });
  }
  dom.toastContainer.appendChild(toast);
  activeToastTimer = setTimeout(dismissToast, 3e3);
}
function dismissToast() {
  if (activeToastTimer) {
    clearTimeout(activeToastTimer);
    activeToastTimer = null;
  }
  const toast = dom.toastContainer.querySelector(".toast");
  if (!toast) return;
  toast.classList.add("toast-leaving");
  setTimeout(() => {
    dom.toastContainer.innerHTML = "";
  }, 200);
}
function isMobileViewport() {
  return mobileViewport.matches;
}
if (isMobileViewport()) {
  state.assistantOpen = false;
}
function renderMainView(suppressAnimation = false) {
  const editingTaskId = state.editingTaskId;
  const editingTaskDraft = state.editingTaskDraft;
  dom.mainView.classList.toggle("task-list-static", suppressAnimation);
  if (state.currentView === "project") {
    const project = getSelectedProject(state);
    if (!project) {
      state.currentView = "today";
      state.selectedProjectId = null;
      renderMainView();
      return;
    }
    dom.mainView.innerHTML = renderProjectView({
      project,
      todoTasks: getProjectTasks(state, project.id),
      completedTasks: getProjectCompletedTasks(state, project.id),
      editingTaskId,
      editingTaskDraft
    });
    return;
  }
  if (state.currentView === "inbox") {
    dom.mainView.innerHTML = renderInboxView({
      inboxTasks: getInboxTasks(state),
      editingTaskId,
      editingTaskDraft
    });
    return;
  }
  if (state.currentView === "upcoming") {
    dom.mainView.innerHTML = renderUpcomingView({
      weekDays: getWeekDays(state, state.upcomingWeekStart),
      groups: getUpcomingGroups(state),
      editingTaskId,
      editingTaskDraft
    });
    return;
  }
  dom.mainView.innerHTML = renderTodayView({
    todoTasks: getTodayTasks(state),
    completedTasks: getCompletedTasks(state),
    editingTaskId,
    editingTaskDraft
  });
}
function updateTaskModal(animate = false) {
  renderTaskModal({
    taskModal: dom.taskModal,
    task: getSelectedTask(state),
    projects: getProjects(state),
    subtaskComposerOpen: state.modalSubtaskComposerOpen,
    subtaskDraft: state.modalSubtaskDraft,
    animate
  });
}
function updateAssistant() {
  const config = state.currentView === "project" ? assistantConfigs.project : assistantConfigs[state.currentView];
  renderAssistantPanel({
    config,
    messages: getCurrentAssistantMessages(state),
    assistantIcons,
    dom
  });
}
function scrollUpcomingTargetIntoView(dateIso) {
  const scrollArea = document.getElementById("upcomingScrollArea");
  if (!scrollArea) return;
  const dateAnchor = scrollArea.querySelector(`[data-anchor-date="${dateIso}"]`);
  if (dateAnchor) {
    dateAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const sectionKey = getUpcomingSectionKey(parseLocalISODate(dateIso));
  const sectionAnchor = scrollArea.querySelector(`[data-anchor-section="${sectionKey}"]`);
  if (sectionAnchor) {
    sectionAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  scrollArea.scrollTo({ top: 0, behavior: "smooth" });
}
function closeMobileChrome() {
  if (!isMobileViewport()) return;
  state.mobileNavOpen = false;
  state.assistantOpen = false;
}
function renderChrome() {
  const mobile = isMobileViewport();
  const drawersOpen = mobile && (state.mobileNavOpen || state.assistantOpen);
  const blockingSurfaceOpen = Boolean(getSelectedTask(state) || state.projectSetup.open);
  dom.mobileNav.classList.toggle("translate-x-0", mobile && state.mobileNavOpen);
  dom.mobileNav.classList.toggle("-translate-x-full", mobile && !state.mobileNavOpen);
  dom.mobileNav.classList.toggle("pointer-events-none", mobile && !state.mobileNavOpen);
  dom.mobileNav.classList.toggle("pointer-events-auto", !mobile || state.mobileNavOpen);
  dom.mobileDrawerBackdrop.classList.toggle("opacity-100", drawersOpen);
  dom.mobileDrawerBackdrop.classList.toggle("pointer-events-auto", drawersOpen);
  dom.mobileDrawerBackdrop.classList.toggle("opacity-0", !drawersOpen);
  dom.mobileDrawerBackdrop.classList.toggle("pointer-events-none", !drawersOpen);
  dom.assistantPanel.classList.toggle("translate-x-0", mobile && state.assistantOpen);
  dom.assistantPanel.classList.toggle("translate-x-full", mobile && !state.assistantOpen);
  dom.assistantPanel.classList.toggle("pointer-events-none", mobile && !state.assistantOpen);
  dom.assistantPanel.classList.toggle("pointer-events-auto", !mobile || state.assistantOpen);
  dom.assistantPanel.classList.toggle("lg:w-[340px]", state.assistantOpen);
  dom.assistantPanel.classList.toggle("lg:opacity-100", state.assistantOpen);
  dom.assistantPanel.classList.toggle("lg:scale-100", state.assistantOpen);
  dom.assistantPanel.classList.toggle("lg:w-0", !state.assistantOpen);
  dom.assistantPanel.classList.toggle("lg:opacity-0", !state.assistantOpen);
  dom.assistantPanel.classList.toggle("lg:translate-x-6", !state.assistantOpen);
  dom.assistantPanel.classList.toggle("lg:scale-[0.98]", !state.assistantOpen);
  dom.assistantPanel.classList.toggle("lg:pointer-events-none", !state.assistantOpen);
  const showNavButton = mobile && !state.mobileNavOpen && !blockingSurfaceOpen;
  dom.openNavButton.classList.toggle("opacity-100", showNavButton);
  dom.openNavButton.classList.toggle("translate-y-0", showNavButton);
  dom.openNavButton.classList.toggle("scale-100", showNavButton);
  dom.openNavButton.classList.toggle("pointer-events-auto", showNavButton);
  dom.openNavButton.classList.toggle("opacity-0", !showNavButton);
  dom.openNavButton.classList.toggle("translate-y-4", !showNavButton);
  dom.openNavButton.classList.toggle("scale-90", !showNavButton);
  dom.openNavButton.classList.toggle("pointer-events-none", !showNavButton);
  const showAssistantButton = !state.assistantOpen && !blockingSurfaceOpen;
  dom.reopenAssistantButton.classList.toggle("opacity-100", showAssistantButton);
  dom.reopenAssistantButton.classList.toggle("translate-y-0", showAssistantButton);
  dom.reopenAssistantButton.classList.toggle("scale-100", showAssistantButton);
  dom.reopenAssistantButton.classList.toggle("pointer-events-auto", showAssistantButton);
  dom.reopenAssistantButton.classList.toggle("opacity-0", !showAssistantButton);
  dom.reopenAssistantButton.classList.toggle("translate-y-4", !showAssistantButton);
  dom.reopenAssistantButton.classList.toggle("scale-90", !showAssistantButton);
  dom.reopenAssistantButton.classList.toggle("pointer-events-none", !showAssistantButton);
}
function render() {
  const shouldKeepShellVisible = state.auth.status === "authenticated" || state.auth.status === "loading" && hasStoredAuthHint;
  if (!shouldKeepShellVisible) {
    dom.appShell.classList.add("hidden");
    dom.appShell.classList.remove("flex");
    dom.authRoot.classList.remove("hidden");
    if (state.auth.status === "loading") {
      dom.authRoot.innerHTML = renderAuthLoading();
      return;
    }
    if (state.auth.status === "error") {
      dom.authRoot.innerHTML = renderAuthError(state.auth.errorMessage || "Authentication failed.");
      return;
    }
    dom.authRoot.innerHTML = renderAuthScreen();
    return;
  }
  dom.authRoot.classList.add("hidden");
  dom.appShell.classList.remove("hidden");
  dom.appShell.classList.add("flex");
  const suppressAnimation = suppressNextTaskListAnimation;
  suppressNextTaskListAnimation = false;
  renderNavigation({
    currentView: state.currentView,
    inboxCount: getInboxCount(state),
    navInboxCount: dom.navInboxCount,
    projectNav: dom.projectNav,
    projects: getProjects(state),
    selectedProjectId: state.selectedProjectId,
    workspaceCard: dom.workspaceCard,
    authUser: state.auth.user
  });
  renderMainView(suppressAnimation);
  updateAssistant();
  updateTaskModal();
  renderProjectSetupModal({
    projectSetupModal: dom.projectSetupModal,
    projectSetup: state.projectSetup
  });
  renderChrome();
  if (state.currentView === "upcoming" && state.pendingUpcomingScrollTarget) {
    const target = state.pendingUpcomingScrollTarget;
    state.pendingUpcomingScrollTarget = null;
    requestAnimationFrame(() => scrollUpcomingTargetIntoView(target));
  }
}
function closeConvexClient() {
  if (!convexClient) return;
  convexClient.clearAuth();
  convexClient = null;
}
function resetAppState() {
  const freshStore = createStore();
  Object.assign(state, freshStore.state);
  initialTasks = freshStore.initialTasks;
  assistantConfigs = freshStore.assistantConfigs;
  if (isMobileViewport()) {
    state.assistantOpen = false;
  }
}
async function bootstrapAuth() {
  state.auth.status = "loading";
  state.auth.errorMessage = null;
  render();
  try {
    const config = getAppConfig();
    authClient = await createAuthClient(config);
    const session = await authClient.initialize();
    if (!session.isAuthenticated) {
      closeConvexClient();
      clearAuthHint();
      state.auth.status = "unauthenticated";
      state.auth.user = null;
      render();
      return;
    }
    closeConvexClient();
    convexClient = new ConvexHttpClient(config.convexUrl);
    const token = await authClient.getToken({ forceRefreshToken: false });
    if (!token) {
      clearAuthHint();
      state.auth.status = "unauthenticated";
      state.auth.user = null;
      render();
      return;
    }
    convexClient.setAuth(token);
    const viewer = await convexClient.query(api.auth.viewer, {});
    state.auth.status = "authenticated";
    state.auth.user = viewer ? {
      name: viewer.name,
      email: viewer.email,
      picture: viewer.picture
    } : session.user;
    persistAuthHint(state.auth.user);
    state.auth.errorMessage = null;
    render();
  } catch (error) {
    closeConvexClient();
    state.auth.status = "error";
    state.auth.errorMessage = formatAuthError(error);
    render();
  }
}
async function startLogin() {
  try {
    if (!authClient) {
      await bootstrapAuth();
      if (state.auth.status !== "unauthenticated") return;
    }
    await authClient.login();
  } catch (error) {
    state.auth.status = "error";
    state.auth.errorMessage = formatAuthError(error);
    render();
  }
}
async function startLogout() {
  try {
    clearAuthHint();
    resetAppState();
    state.auth.status = "loading";
    render();
    closeConvexClient();
    if (!authClient) {
      state.auth.status = "unauthenticated";
      render();
      return;
    }
    await authClient.logout();
  } catch (error) {
    state.auth.status = "error";
    state.auth.errorMessage = formatAuthError(error);
    render();
  }
}
function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
}
function focusTaskCardTitle(taskId) {
  requestAnimationFrame(() => {
    const input = document.querySelector(
      `[data-action="edit-task-title"][data-task-id="${taskId}"]`
    );
    if (!input) return;
    input.focus();
    if ("setSelectionRange" in input) {
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });
}
function sendMessage(textOverride) {
  const view = state.currentView;
  const text = (textOverride ?? dom.aiInput.value).trim();
  if (!text) return;
  if (view === "project") {
    const project = getSelectedProject(state);
    if (!project) return;
    project.bayMessages.push({ sender: "user", text, rich: false, tasks: [] });
  } else {
    state.messagesByView[view].push({ sender: "user", text, rich: false, tasks: [] });
  }
  updateAssistant();
  dom.aiInput.value = "";
  dom.aiInput.style.height = "auto";
  const reply = buildAssistantReply({ view, text, state, assistantConfigs });
  setTimeout(() => {
    const targetMessages = view === "project" ? getSelectedProject(state)?.bayMessages : state.messagesByView[view];
    if (!targetMessages) return;
    targetMessages.push({
      sender: "assistant",
      text: reply.text,
      tasks: reply.tasks,
      rich: reply.tasks.length > 0
    });
    if (state.currentView === view) {
      updateAssistant();
    }
  }, 500);
}
function sendProjectSetupMessage() {
  const input = document.getElementById("projectSetupInput");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  submitProjectSetupInput(state, text);
  input.value = "";
  input.style.height = "auto";
  render();
}
function addModalSubtask(taskId) {
  const value = state.modalSubtaskDraft.trim();
  if (!value) return;
  addTaskSubtask(state, taskId, value);
  render();
}
function focusModalSubtaskInput() {
  requestAnimationFrame(() => {
    const input = document.getElementById("modalNewSubtaskInput");
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
}
function closeTaskModalAndRender() {
  closeTaskModal(state);
  suppressNextTaskListAnimation = true;
  render();
}
function clearTaskDropIndicators() {
  document.querySelectorAll(".task-drop-before, .task-drop-after, .task-dragging").forEach((node) => {
    node.classList.remove("task-drop-before", "task-drop-after", "task-dragging");
  });
}
function trapFocus(container, event) {
  const focusable = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
document.addEventListener("keydown", (event) => {
  if (state.auth.status !== "authenticated") return;
  const target = event.target;
  if (event.key === "Tab") {
    const dialog = dom.taskModal.querySelector('[role="dialog"]');
    if (dialog) {
      trapFocus(dialog, event);
      return;
    }
    const setupDialog = dom.projectSetupModal.querySelector('[role="dialog"]');
    if (setupDialog) {
      trapFocus(setupDialog, event);
      return;
    }
  }
  if ((event.key === "Enter" || event.key === " ") && target?.dataset?.action === "open-task") {
    event.preventDefault();
    const taskId = target.dataset.taskId;
    if (taskId) {
      openTaskModal(state, taskId);
      closeMobileChrome();
      updateTaskModal(true);
      renderChrome();
    }
    return;
  }
  if (event.key === "Escape" && getSelectedTask(state)) {
    if (state.modalSubtaskComposerOpen) {
      closeModalSubtaskComposer(state);
      updateTaskModal();
      return;
    }
    closeTaskModalAndRender();
    return;
  }
  if (event.key === "Escape" && state.editingTaskId) {
    cancelTaskCardEdit(state);
    renderMainView();
    return;
  }
  if (event.key === "Escape" && state.projectSetup.open) {
    closeProjectSetup(state);
    render();
    return;
  }
  if (target?.id === "taskInput" && event.key === "Enter") {
    event.preventDefault();
    const value = target.value.trim();
    if (!value) return;
    addTask(state, value);
    target.value = "";
    render();
    return;
  }
  if (target?.dataset.action === "edit-task-title" && event.key === "Enter") {
    event.preventDefault();
    saveTaskCardEdit(state);
    renderMainView();
    return;
  }
  if (target?.dataset.action === "edit-task-description" && event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    saveTaskCardEdit(state);
    renderMainView();
    return;
  }
  if (target?.id === "aiInput" && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
  if (target?.id === "projectSetupInput" && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendProjectSetupMessage();
  }
  if (target?.id === "modalNewSubtaskInput" && event.key === "Enter") {
    event.preventDefault();
    addModalSubtask(target.dataset.taskId);
  }
});
document.addEventListener("input", (event) => {
  if (state.auth.status !== "authenticated") return;
  const target = event.target;
  if (!target) return;
  if (target.id === "modalTitleInput") {
    updateTaskField(state, target.dataset.taskId, "title", target.value);
    return;
  }
  if (target.id === "modalDescriptionInput") {
    updateTaskField(state, target.dataset.taskId, "description", target.value);
    return;
  }
  if (target.dataset.action === "edit-task-title") {
    updateTaskCardDraftField(state, "title", target.value);
    return;
  }
  if (target.dataset.action === "edit-task-description") {
    updateTaskCardDraftField(state, "description", target.value);
    autoResize(target);
    return;
  }
  if (target.dataset.action === "edit-subtask-title") {
    updateSubtaskTitle(state, target.dataset.taskId, target.dataset.subtaskId, target.value);
    return;
  }
  if (target.id === "modalNewSubtaskInput") {
    updateModalSubtaskDraft(state, target.value);
    return;
  }
  if (target.id === "aiInput" || target.id === "projectSetupInput") {
    autoResize(target);
    return;
  }
  if (target.id === "projectDraftName") {
    updateProjectDraftField(state, "name", target.value);
    return;
  }
  if (target.id === "projectDraftDeadline") {
    updateProjectDraftField(state, "deadline", target.value);
    return;
  }
  if (target.id === "projectDraftSummary") {
    updateProjectDraftField(state, "summary", target.value);
    autoResize(target);
    return;
  }
  if (target.id === "projectDraftNextStep") {
    updateProjectDraftField(state, "nextStep", target.value);
    return;
  }
  if (target.dataset.action === "edit-project-draft-task") {
    updateProjectDraftTask(state, target.dataset.taskId, target.value);
  }
});
document.addEventListener("change", (event) => {
  if (state.auth.status !== "authenticated") return;
  const target = event.target;
  if (!target) return;
  if (target.dataset.action === "change-task-project") {
    updateTaskProject(state, target.dataset.taskId, target.value);
    updateTaskModal();
    return;
  }
  if (target.dataset.action === "change-task-due-date") {
    updateTaskDueDate(state, target.dataset.taskId, target.value);
    updateTaskModal();
    return;
  }
  if (target.dataset.action === "change-task-priority") {
    updateTaskPriority(state, target.dataset.taskId, target.value);
    updateTaskModal();
  }
});
document.addEventListener("click", (event) => {
  const target = event.target;
  const actionElement = target?.closest("[data-action]");
  if (!actionElement) return;
  const { action, taskId, suggestion, view, direction, date, destination } = actionElement.dataset;
  if (action === "login") {
    void startLogin();
    return;
  }
  if (action === "logout") {
    void startLogout();
    return;
  }
  if (state.auth.status !== "authenticated") return;
  if (action === "switch-view") {
    if (setView(state, view)) {
      state.mobileNavOpen = false;
      render();
    }
    return;
  }
  if (action === "shift-week") {
    shiftUpcomingWeek(state, Number(direction));
    render();
    return;
  }
  if (action === "select-upcoming-date") {
    selectUpcomingDate(state, date);
    render();
    return;
  }
  if (action === "open-project") {
    openProject(state, actionElement.dataset.projectId);
    state.mobileNavOpen = false;
    render();
    return;
  }
  if (action === "schedule-task") {
    const label = destinationLabels[destination] || destination;
    const row = actionElement.closest(".task-row");
    const doSchedule = () => {
      const prevDueAt = state.tasks.find((t2) => t2.id === taskId)?.dueAt || null;
      scheduleInboxTask(state, taskId, destination);
      render();
      showToast(`scheduled for ${label}`, () => {
        unscheduleTask(state, taskId, prevDueAt);
        render();
      });
    };
    if (row) {
      row.classList.add("task-removing");
      setTimeout(doSchedule, 250);
    } else {
      doSchedule();
    }
    return;
  }
  if (action === "toggle" || action === "modal-toggle-task") {
    const row = action === "toggle" ? actionElement.closest(".task-row") : null;
    if (row) {
      row.classList.add("task-completing");
    }
    toggleTask(state, taskId);
    render();
    return;
  }
  if (action === "toggle-subtask") {
    toggleSubtask(state, taskId, actionElement.dataset.subtaskId);
    render();
    return;
  }
  if (action === "add-subtask") {
    addModalSubtask(taskId);
    return;
  }
  if (action === "open-subtask-composer") {
    openModalSubtaskComposer(state);
    updateTaskModal();
    focusModalSubtaskInput();
    return;
  }
  if (action === "cancel-subtask-composer") {
    closeModalSubtaskComposer(state);
    updateTaskModal();
    return;
  }
  if (action === "remove-subtask") {
    removeSubtask(state, taskId, actionElement.dataset.subtaskId);
    render();
    return;
  }
  if (action === "edit-task-card") {
    startTaskCardEdit(state, taskId);
    renderMainView();
    focusTaskCardTitle(taskId);
    return;
  }
  if (action === "save-task-edit") {
    saveTaskCardEdit(state);
    renderMainView();
    return;
  }
  if (action === "cancel-task-edit") {
    cancelTaskCardEdit(state);
    renderMainView();
    return;
  }
  if (action === "open-task") {
    if (dragState.justDragged) return;
    openTaskModal(state, taskId);
    closeMobileChrome();
    updateTaskModal(true);
    renderChrome();
    return;
  }
  if (action === "close-modal") {
    closeTaskModalAndRender();
    return;
  }
  if (action === "assistant-suggestion") {
    sendMessage(suggestion);
    return;
  }
  if (action === "open-project-setup") {
    openProjectSetup(state);
    closeMobileChrome();
    render();
    requestAnimationFrame(() => {
      document.getElementById("projectSetupInput")?.focus();
    });
    return;
  }
  if (action === "close-project-setup") {
    closeProjectSetup(state);
    render();
    return;
  }
  if (action === "restart-project-setup") {
    restartProjectSetup(state);
    render();
    requestAnimationFrame(() => {
      document.getElementById("projectSetupInput")?.focus();
    });
    return;
  }
  if (action === "send-project-setup") {
    sendProjectSetupMessage();
    return;
  }
  if (action === "confirm-project-draft") {
    confirmProjectDraft(state);
    render();
    return;
  }
  if (action === "send-message") {
    sendMessage();
    return;
  }
  if (action === "reset-inbox") {
    resetInbox(state, initialTasks);
    render();
    return;
  }
  if (action === "close-assistant") {
    state.assistantOpen = false;
    renderChrome();
    return;
  }
  if (action === "open-nav") {
    state.mobileNavOpen = true;
    if (isMobileViewport()) {
      state.assistantOpen = false;
    }
    renderChrome();
    return;
  }
  if (action === "close-drawers") {
    closeMobileChrome();
    renderChrome();
    return;
  }
  if (action === "reopen-assistant") {
    state.assistantOpen = true;
    if (isMobileViewport()) {
      state.mobileNavOpen = false;
    }
    renderChrome();
    return;
  }
});
document.addEventListener("dragstart", (event) => {
  if (state.auth.status !== "authenticated") return;
  const target = event.target;
  const row = target?.closest(".task-row[draggable='true']");
  if (!row) return;
  dragState.taskId = row.dataset.taskId;
  dragState.listId = row.dataset.taskList;
  dragState.justDragged = false;
  row.classList.add("task-dragging");
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.dataset.taskId || "");
  }
});
document.addEventListener("dragover", (event) => {
  if (state.auth.status !== "authenticated") return;
  const target = event.target;
  const row = target?.closest(".task-row[draggable='true']");
  if (!row) return;
  if (!dragState.taskId || row.dataset.taskId === dragState.taskId) return;
  if (row.dataset.taskList !== dragState.listId) return;
  event.preventDefault();
  clearTaskDropIndicators();
  const rect = row.getBoundingClientRect();
  const isAfter = event.clientY > rect.top + rect.height / 2;
  row.classList.add(isAfter ? "task-drop-after" : "task-drop-before");
});
document.addEventListener("drop", (event) => {
  if (state.auth.status !== "authenticated") return;
  const target = event.target;
  const row = target?.closest(".task-row[draggable='true']");
  if (!row || !dragState.taskId) return;
  if (row.dataset.taskId === dragState.taskId) return;
  if (row.dataset.taskList !== dragState.listId) return;
  event.preventDefault();
  const rect = row.getBoundingClientRect();
  const placement = event.clientY > rect.top + rect.height / 2 ? "after" : "before";
  reorderTask(state, dragState.taskId, row.dataset.taskId, placement);
  suppressNextTaskListAnimation = true;
  dragState.justDragged = true;
  clearTaskDropIndicators();
  render();
});
document.addEventListener("dragend", () => {
  if (state.auth.status !== "authenticated") return;
  clearTaskDropIndicators();
  dragState.taskId = null;
  dragState.listId = null;
  setTimeout(() => {
    dragState.justDragged = false;
  }, 0);
});
mobileViewport.addEventListener("change", (event) => {
  state.mobileNavOpen = false;
  if (event.matches) {
    state.assistantOpen = false;
  }
  render();
});
render();
void bootstrapAuth();
//# sourceMappingURL=main.js.map
