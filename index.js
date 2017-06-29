"use strict";
var semverRegex = require('semver-regex'); // used for the string formats
var semver = require("semver"); // used for everything else
var mod_methods = ["major", "minor", "patch", "clean"];
module.exports = function (ajv, options) {
    ajv.addFormat("semver", semverRegex());
    ajv.addKeyword("semver", {
        modifying: true,
        $data: true,
        compile: function (schema, par, it) {
            var _method;
            if (typeof schema === 'boolean') {
                return (function (data) { return semver.valid(data) !== null; });
            }
            else if (schema.valid !== undefined) {
                return (function (data) { return semver.valid(data, schema.loose || false) !== null; });
            }
            else if (schema.validRange !== undefined) {
                return (function (data) { return semver.validRange(data, schema.loose || false) !== null; });
            }
            else if (schema.prerelease !== undefined) {
                return (function (data) { return semver.prerelease(data, schema.loose || false) !== null; });
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
                throw new Error("Schema Error: this should be prevented by the metaSchema. Got schema:" + JSON.stringify(schema));
            }
            var out;
            switch (_method) {
                case "major":
                case "minor":
                case "patch":
                case "clean": {
                    // MODIFYING KEYWORDS
                    var _inst;
                    if ((schema[_method].$data)) {
                        _inst = it.util.getData(schema[_method].$data, it.dataLevel, it.dataPathArr);
                    }
                    else {
                        _inst = "inst";
                    }
                    out = Function("inst", "path", "parent", "prop_name", "data", "try{parent[prop_name] = this.semver." + _method + "(" + _inst + ",this.loose);}catch(err){ return false; }; return true;");
                    break;
                }
                case "satisfies":
                case "eq":
                case "lte":
                case "gte":
                case "ltr":
                case "gtr":
                    {
                        // RELATIONAL (RANGE) KEYWORDS
                        var _data = ((schema[_method].$data)
                            ? it.util.getData(schema[_method].$data, it.dataLevel, it.dataPathArr)
                            : "\"" + schema[_method] + "\"");
                        out = Function("inst", "path", "parent", "prop_name", "data", "if(this.semver.validRange(" + _data + ",this.loose)===null){return false;}if(this.semver.validRange(inst,this.loose)===null){return false;};return this.semver." + _method + "(inst," + _data + ",this.loose  );");
                    }
                    break;
                default: {
                    // RELATIONAL KEYWORDS
                    var _data = ((schema[_method].$data)
                        ? it.util.getData(schema[_method].$data, it.dataLevel, it.dataPathArr)
                        : "\"" + schema[_method] + "\"");
                    out = Function("inst", "path", "parent", "prop_name", "data", "if(this.semver.valid(" + _data + ")===null){return false;}if(this.semver.valid(inst)===null){return false;};return this.semver." + _method + "(inst," + _data + ",this.loose  );");
                }
            }
            return out.bind({
                "semver": semver,
                "loose": (schema.loose || false)
            });
        },
        metaSchema: {
            oneOf: [
                { type: "boolean" },
                {
                    type: "object",
                    properties: {
                        major: { $ref: "#/bool_or_ref" },
                        minor: { $ref: "#/bool_or_ref" },
                        patch: { $ref: "#/bool_or_ref" },
                        clean: { $ref: "#/bool_or_ref" },
                        satisfies: { $ref: "#/string_or_ref" },
                        gt: { $ref: "#/string_or_ref" },
                        gte: { $ref: "#/string_or_ref" },
                        lt: { $ref: "#/string_or_ref" },
                        lte: { $ref: "#/string_or_ref" },
                        eq: { $ref: "#/string_or_ref" },
                        neq: { $ref: "#/string_or_ref" },
                        ltr: { $ref: "#/string_or_ref" },
                        gtr: { $ref: "#/string_or_ref" },
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
            bool_or_ref: {
                oneOf: [
                    { type: "boolean" },
                    {
                        type: "object",
                        properties: {
                            "$data": { type: "string" }
                        },
                        required: ["$data"],
                        maxProperties: 1,
                    },
                ]
            },
            string_or_ref: {
                oneOf: [
                    { type: "string" },
                    {
                        type: "object",
                        properties: {
                            "$data": { type: "string" }
                        },
                        required: ["$data"],
                        maxProperties: 1,
                    },
                ]
            }
        }
    });
};
