import * as semver from "semver";
import Ajv from "ajv";
import type { SchemaObjCxt, AnySchemaObject } from "ajv";
import type { DataValidateFunction, DataValidationCxt } from "ajv/dist/types";
import { getData } from "ajv/dist/compile/validate";

const { valid, validRange, prerelease } = semver;

const semverRegex =
  /(?:(?<=^v?|\sv?)(?:(?:0|[1-9]\d{0,9}?)\.){2}(?:0|[1-9]\d{0,9}?)(?:-(?:0|[1-9]\d*?|[\da-z-]*?[a-z-][\da-z-]*?){0,100}?(?:\.(?:0|[1-9]\d*?|[\da-z-]*?[a-z-][\da-z-]*?))*?){0,100}?(?:\+[\da-z-]+?(?:\.[\da-z-]+?)*?){0,100}?\b){1,200}?/gi;

ajv_semver.default = ajv_semver;
export = ajv_semver;

function ajv_semver(ajv: Ajv) {
  ajv.addFormat("semver", semverRegex);

  ajv.addKeyword({
    keyword: "semver",
    modifying: true,
    compile: function (
      schema: boolean | semver_schema,
      parentSchema: AnySchemaObject,
      it: SchemaObjCxt
    ): DataValidateFunction {
      var _method: semver_method;
      if (typeof schema === "boolean") {
        return function (data: string) {
          return valid(data) !== null;
        };
      } else if (schema.valid !== undefined) {
        return function (data: string) {
          return valid(data, schema.loose || false) !== null;
        };
      } else if (schema.validRange !== undefined) {
        return function (data: string) {
          return validRange(data, schema.loose || false) !== null;
        };
      } else if (schema.prerelease !== undefined) {
        return function (data: string) {
          return prerelease(data, schema.loose || false) !== null;
        };

        // MODIFYING KEYWORDS
      } else if (schema.major !== undefined) {
        _method = "major";
      } else if (schema.minor !== undefined) {
        _method = "minor";
      } else if (schema.patch !== undefined) {
        _method = "patch";
      } else if (schema.clean !== undefined) {
        _method = "clean";

        // RELATIONAL KEYWORDS
      } else if (schema.satisfies !== undefined) {
        _method = "satisfies";
      } else if (schema.gt !== undefined) {
        _method = "gt";
      } else if (schema.gte !== undefined) {
        _method = "gte";
      } else if (schema.lt !== undefined) {
        _method = "lt";
      } else if (schema.lte !== undefined) {
        _method = "lte";
      } else if (schema.eq !== undefined) {
        _method = "eq";
      } else if (schema.neq !== undefined) {
        _method = "neq";
      } else if (schema.ltr !== undefined) {
        _method = "ltr";
      } else if (schema.gtr !== undefined) {
        _method = "gtr";
      } else {
        throw new Error(
          "Schema Error: this should be prevented by the metaSchema. Got schema:" +
            JSON.stringify(schema)
        );
      }

      var spec: string = (<data_ref>schema[_method]).$data
        ? getData((<data_ref>schema[_method]).$data, it).toString()
        : (schema[_method] as string);

      const loose =
        typeof schema === "boolean" ? schema : schema.loose || false;

      switch (_method) {
        case "major":
        case "minor":
        case "patch":
        case "clean": {
          // MODIFYING KEYWORDS
          return ((m) => (data: any, dataCxt?: DataValidationCxt) => {
            if (!dataCxt) return false;

            const { parentData, parentDataProperty } = dataCxt;

            try {
              parentData[parentDataProperty] = semver[<modifying_keyword>m](
                data,
                loose
              );
            } catch (err) {
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
          return ((m) => (data: any, dataCxt?: DataValidationCxt) => {
            if (!dataCxt) return false;
            if (semver.validRange(spec, loose) === null) return false;
            if (semver.validRange(data, loose) === null) return false;
            return semver[<range_keyword>m](data, spec, loose);
          })(_method);
        }
        default: {
          // RELATIONAL KEYWORDS
          return ((m) => (data: any, dataCxt?: DataValidationCxt) => {
            if (semver.valid(spec) === null) {
              return false;
            }
            if (semver.valid(data) === null) {
              return false;
            }
            const out = semver[<relational_keyword>m](data, spec, loose);
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

type modifying_keyword = "major" | "minor" | "patch" | "clean";
type range_keyword = "satisfies" | "eq" | "lte" | "gte" | "ltr" | "gtr";
type relational_keyword = "gt" | "lt" | "neq" | "prerelease";

type semver_method =
  | "major"
  | "minor"
  | "patch"
  | "clean"
  | "satisfies"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "eq"
  | "neq"
  | "ltr"
  | "gtr";

interface data_ref {
  $data: string;
}

type semver_schema = RequireAtLeastOne<_semver_schema> & {
  loose?: boolean;
};

interface _semver_schema {
  // modify methods
  major?: boolean | data_ref;
  minor?: boolean | data_ref;
  patch?: boolean | data_ref;
  clean?: boolean | data_ref;
  // relational methods
  satisfies?: string | data_ref;
  gt?: string | data_ref;
  gte?: string | data_ref;
  lt?: string | data_ref;
  lte?: string | data_ref;
  eq?: string | data_ref;
  neq?: string | data_ref;
  ltr?: string | data_ref;
  gtr?: string | data_ref;
  // validation methods
  valid?: boolean;
  validRange?: boolean;
  prerelease?: boolean;
}

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
