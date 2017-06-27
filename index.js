"use strict";
var semverRegex = require('semver-regex'); // used for the string formats
var semver = require("semver"); // used for everything else
module.exports = function (ajv, options) {
    ajv.addFormat("semver", semverRegex());
    ajv.addKeyword("semver", {
        type: "string",
        $data: true,
        compile: function (schema, par, it) {
            var _method;
            if (typeof schema === 'boolean') {
                return (function (data) { return semver.valid(data) !== null; });
            }
            else if (schema.valid) {
                return (function (data) { return semver.valid(data, schema.loose || false) !== null; });
            }
            else if (schema.validRange) {
                return (function (data) { return semver.validRange(data, schema.loose || false) !== null; });
            }
            else if (schema.prerelease) {
                return (function (data) { return semver.prerelease(data, schema.loose || false) !== null; });
            }
            else if (schema.satisfies) {
                _method = "satisfies";
            }
            else if (schema.gt) {
                _method = "gt";
            }
            else if (schema.gte) {
                _method = "gte";
            }
            else if (schema.lt) {
                _method = "lt";
            }
            else if (schema.lte) {
                _method = "lte";
            }
            else if (schema.eq) {
                _method = "eq";
            }
            else if (schema.neq) {
                _method = "neq";
            }
            else if (schema.ltr) {
                _method = "ltr";
            }
            else if (schema.gtr) {
                _method = "gtr";
            }
            else {
                throw new Error("Schema Error: this should be prevented by the metaSchema. Got schema:" + JSON.stringify(schema));
            }
            var _data = ((schema[_method].$data)
                ? it.util.getData(schema[_method].$data, it.dataLevel, it.dataPathArr)
                : "data");
            var out = Function("inst", "path", "parent", "prop_name", "data", "return this.semver." + _method + "(inst," + _data + ",this.loose  )");
            return out.bind({
                "semver": semver,
                loose: (schema.loose || false)
            });
        },
        metaSchema: {
            oneOf: [
                { type: "boolean" },
                {
                    type: "object",
                    properties: {
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
