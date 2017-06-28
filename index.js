"use strict";
/*

var Ajv = require("ajv");
var ajv = new Ajv();
require("../index.js")(ajv)
v = ['v0.10.0', '0.9.0', true]
    var v0 = v[0];
    var v1 = v[1];
    var loose = v[2];

ajv.validate({"semver":{"gt":v1, "loose":loose}},v0)
ajv.validate({"semver":{"lt":v0, "loose":loose}},v1)
!ajv.validate({"semver":{"gt":v0, "loose":loose}},v1)
!ajv.validate({"semver":{"lt":v1, "loose":loose}},v0)
ajv.validate({"semver":{"eq":v0, "loose":loose}},v0)
ajv.validate({"semver":{"eq":v1, "loose":loose}},v1)
ajv.validate({"semver":{"neq":v1, "loose":loose}},v0)

    var base = {
            type:"object",
            properties:{
                "v":{
                    type:"string",
                    "semver":{}
                }
            }
        },
        o = {v:v0};

    base.properties.v.semver.loose = loose || false
    base.properties.v.semver.major = true
    t.ok(ajv.validate(base,o) , "ok: major('" + v0 + "')");
    t.equal(o.v,v[1] , "equal: major('" + v0 + "', " + v[1] + ")");
    delete base.properties.v.semver.major

*/
var semverRegex = require('semver-regex'); // used for the string formats
var semver = require("semver"); // used for everything else
var mod_methods = ["major", "minor", "patch", "clean"];
module.exports = function (ajv, options) {
    ajv.addFormat("semver", semverRegex());
    ajv.addKeyword("semver", {
        type: "string",
        modifies: false,
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
                // modifying keywords
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
                // relational keywords
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
            //-- 			console.log("_method: ", _method,"schema: ", schema)
            var _data = ((schema[_method].$data) // formerly:  typeof schema[_method] !== 'string'
                ? it.util.getData(schema[_method].$data, it.dataLevel, it.dataPathArr)
                : "\"" + schema[_method] + "\"");
            var out;
            //-- 			console.log("_data: ", _data)
            if (mod_methods.indexOf(_method) >= 0) {
                //-- 				console.log("mod_methods: ", true)
                // modifying keywords
                out = Function("inst", "path", "parent", "prop_name", "root", 
                //`console.log("args:",arguments);return true;`);
                "console.log(\"args:\",arguments);try{ parent[prop_name] = this.semver." + _method + "(inst," + _data + ",this.loose); }catch(err){ return false; }; return true;");
            }
            else {
                //-- 				console.log("mod_methods: ", false)
                // relational keywords
                out = Function("inst", "path", "parent", "prop_name", "root", 
                //console.log("arguments:",arguments,"this.loose: ", this.loose);
                "return this.semver." + _method + "(inst," + _data + ",this.loose  );");
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
                        major: { type: "boolean" },
                        minor: { type: "boolean" },
                        patch: { type: "boolean" },
                        clean: { type: "boolean" },
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
