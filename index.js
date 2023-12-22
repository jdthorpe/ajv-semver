"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
const semver = __importStar(require("semver"));
const validate_1 = require("ajv/dist/compile/validate");
const { valid, validRange, prerelease } = semver;
const semverRegex = /(?:(?<=^v?|\sv?)(?:(?:0|[1-9]\d{0,9}?)\.){2}(?:0|[1-9]\d{0,9}?)(?:-(?:0|[1-9]\d*?|[\da-z-]*?[a-z-][\da-z-]*?){0,100}?(?:\.(?:0|[1-9]\d*?|[\da-z-]*?[a-z-][\da-z-]*?))*?){0,100}?(?:\+[\da-z-]+?(?:\.[\da-z-]+?)*?){0,100}?\b){1,200}?/i;
ajv_semver.default = ajv_semver;
function ajv_semver(ajv) {
    ajv.addFormat("semver", semverRegex);
    ajv.addKeyword({
        keyword: "semver",
        modifying: true,
        compile: function (schema, parentSchema, it) {
            var _method;
            if (typeof schema === "boolean") {
                return function (data) {
                    return valid(data) !== null;
                };
            }
            else if (schema.valid !== undefined) {
                return function (data) {
                    return valid(data, schema.loose || false) !== null;
                };
            }
            else if (schema.validRange !== undefined) {
                return function (data) {
                    return validRange(data, schema.loose || false) !== null;
                };
            }
            else if (schema.prerelease !== undefined) {
                return function (data) {
                    return prerelease(data, schema.loose || false) !== null;
                };
                // MODIFYING KEYWORDS
            }
            else if (schema.major !== undefined) {
                _method = "major";
            }
            else if (schema.minor !== undefined) {
                _method = "minor";
            }
            else if (schema.patch !== undefined) {
                _method = "patch";
            }
            else if (schema.clean !== undefined) {
                _method = "clean";
                // RELATIONAL KEYWORDS
            }
            else if (schema.satisfies !== undefined) {
                _method = "satisfies";
            }
            else if (schema.gt !== undefined) {
                _method = "gt";
            }
            else if (schema.gte !== undefined) {
                _method = "gte";
            }
            else if (schema.lt !== undefined) {
                _method = "lt";
            }
            else if (schema.lte !== undefined) {
                _method = "lte";
            }
            else if (schema.eq !== undefined) {
                _method = "eq";
            }
            else if (schema.neq !== undefined) {
                _method = "neq";
            }
            else if (schema.ltr !== undefined) {
                _method = "ltr";
            }
            else if (schema.gtr !== undefined) {
                _method = "gtr";
            }
            else {
                throw new Error("Schema Error: this should be prevented by the metaSchema. Got schema:" +
                    JSON.stringify(schema));
            }
            var spec = schema[_method].$data
                ? (0, validate_1.getData)(schema[_method].$data, it).toString()
                : schema[_method];
            const loose = typeof schema === "boolean" ? schema : schema.loose || false;
            switch (_method) {
                case "major":
                case "minor":
                case "patch":
                case "clean": {
                    // MODIFYING KEYWORDS
                    return ((m) => (data, dataCxt) => {
                        if (!dataCxt)
                            return false;
                        const { parentData, parentDataProperty } = dataCxt;
                        try {
                            parentData[parentDataProperty] = semver[m](data, loose);
                        }
                        catch (err) {
                            return false;
                        }
                        return true;
                    })(_method);
                }
                case "satisfies":
                case "eq":
                case "lte":
                case "gte":
                case "ltr":
                case "gtr": {
                    // RELATIONAL (RANGE) KEYWORDS
                    return ((m) => (data, dataCxt) => {
                        if (!dataCxt)
                            return false;
                        if (semver.validRange(spec, loose) === null)
                            return false;
                        if (semver.validRange(data, loose) === null)
                            return false;
                        return semver[m](data, spec, loose);
                    })(_method);
                }
                default: {
                    // RELATIONAL KEYWORDS
                    return ((m) => (data, dataCxt) => {
                        if (semver.valid(spec) === null) {
                            return false;
                        }
                        if (semver.valid(data) === null) {
                            return false;
                        }
                        const out = semver[m](data, spec, loose);
                        return typeof out === "boolean" ? out : out !== null;
                    })(_method);
                }
            }
        },
        metaSchema: {
            $defs: {
                bool_or_ref: {
                    oneOf: [
                        { type: "boolean" },
                        {
                            type: "object",
                            properties: {
                                $data: { type: "string" },
                            },
                            required: ["$data"],
                            maxProperties: 1,
                        },
                    ],
                },
                string_or_ref: {
                    oneOf: [
                        { type: "string" },
                        {
                            type: "object",
                            properties: {
                                $data: { type: "string" },
                            },
                            required: ["$data"],
                            maxProperties: 1,
                        },
                    ],
                },
            },
            oneOf: [
                { type: "boolean" },
                {
                    type: "object",
                    properties: {
                        major: { $ref: "#/$defs/bool_or_ref" },
                        minor: { $ref: "#/$defs/bool_or_ref" },
                        patch: { $ref: "#/$defs/bool_or_ref" },
                        clean: { $ref: "#/$defs/bool_or_ref" },
                        satisfies: { $ref: "#/$defs/string_or_ref" },
                        gt: { $ref: "#/$defs/string_or_ref" },
                        gte: { $ref: "#/$defs/string_or_ref" },
                        lt: { $ref: "#/$defs/string_or_ref" },
                        lte: { $ref: "#/$defs/string_or_ref" },
                        eq: { $ref: "#/$defs/string_or_ref" },
                        neq: { $ref: "#/$defs/string_or_ref" },
                        ltr: { $ref: "#/$defs/string_or_ref" },
                        gtr: { $ref: "#/$defs/string_or_ref" },
                        valid: { type: "boolean" },
                        validRange: { type: "boolean" },
                        prerelease: { type: "boolean" },
                        loose: { type: "boolean" },
                    },
                    oneOf: [
                        { required: ["major"] },
                        { required: ["minor"] },
                        { required: ["patch"] },
                        { required: ["clean"] },
                        { required: ["satisfies"] },
                        { required: ["validRange"] },
                        { required: ["gt"] },
                        { required: ["gte"] },
                        { required: ["lt"] },
                        { required: ["lte"] },
                        { required: ["eq"] },
                        { required: ["neq"] },
                        { required: ["ltr"] },
                        { required: ["gtr"] },
                        { required: ["valid"] },
                        { required: ["prerelease"] },
                    ],
                },
            ],
        },
    });
}
module.exports = ajv_semver;
