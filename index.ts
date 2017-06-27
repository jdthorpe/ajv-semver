const semverRegex:{():RegExp}  = require('semver-regex') // used for the string formats
import semver = require('semver'); // used for everything else

import { AjvInstance } from 'ajv' // used for everything else

export = function(ajv:AjvInstance,options:any){

	ajv.addFormat("semver",semverRegex());

	ajv.addKeyword("semver",{
		type:"string",
		$data: true,
		compile:function(schema: boolean|semver_schema,par:any,it:any){
			var _method:semver_method;
			if(typeof schema === 'boolean'){
				return (function(data:string){ return semver.valid(data) !== null; })
			}else if(schema.valid ){
				return (function(data:string){ return semver.valid(data,schema.loose || false) !== null; })
			}else if(schema.validRange ){
				return (function(data:string){ return semver.validRange(data,schema.loose || false) !== null; })
			}else if(schema.prerelease ){
				return (function(data:string){ return semver.prerelease(data,schema.loose || false) !== null; })
			}else if(schema.satisfies ){
				_method = "satisfies";
			}else if(schema.gt  ){
				_method = "gt";
			}else if(schema.gte ){
				_method = "gte";
			}else if(schema.lt  ){
				_method = "lt";
			}else if(schema.lte ){
				_method = "lte";
			}else if(schema.eq  ){
				_method = "eq";
			}else if(schema.neq ){
				_method = "neq";
			}else if(schema.ltr ){
				_method = "ltr";
			}else if(schema.gtr ){
				_method = "gtr";
			}else {
				throw new Error("Schema Error: this should be prevented by the metaSchema. Got schema:"+ JSON.stringify(schema))
			}

			var _data:string = ( ((<data_ref>schema[_method]).$data)
								 ? it.util.getData((<data_ref>schema[_method]).$data, it.dataLevel, it.dataPathArr)
								 : "data" );
			const out = Function("inst",
						   "path",
						   "parent",
						   "prop_name",
						   "data",
						   `return this.semver.${_method}(inst,${_data},this.loose  )`);
			return out.bind({
				"semver":semver,
				loose:(schema.loose || false)
			});
		},

		metaSchema: {
			oneOf:[
				{ type: "boolean" },
				{
					type: "object",
					properties: {
						satisfies: {$ref:"#/string_or_ref"},
						gt : {$ref:"#/string_or_ref"},
						gte: {$ref:"#/string_or_ref"},
						lt : {$ref:"#/string_or_ref"},
						lte: {$ref:"#/string_or_ref"},
						eq : {$ref:"#/string_or_ref"},
						neq: {$ref:"#/string_or_ref"},
						ltr: {$ref:"#/string_or_ref"},
						gtr: {$ref:"#/string_or_ref"},
						valid: {type:"boolean"},
						validRange: {type:"boolean"},
						prerelease: {type:"boolean"},
						loose: {type:"boolean"},
					},
					oneOf:[
						{required:["satisfies"] },
						{required:["validRange"] },
						{required:["gt"] },
						{required:["gte"] },
						{required:["lt"] },
						{required:["lte"] },
						{required:["eq"] },
						{required:["neq"] },
						{required:["ltr"] },
						{required:["gtr"] },
						{required:["valid"] },
						{required:["prerelease"] },
					],
				},
			],
			string_or_ref:{
				oneOf:[
					{type:"string"},
					{
						type:"object",
						properties:{
							"$data":{type:"string"}
						},
						required:["$data"],
						maxProperties:1,
					},
				]
			}
		}

	});
};

type semver_method = "satisfies"| "gt"| "gte"| "lt"| "lte"| "eq"| "neq"| "ltr"| "gtr";
interface data_ref { $data : string; }
interface semver_schema {
	satisfies?: string|data_ref;
	gt ?: string|data_ref;
	gte?: string|data_ref;
	lt ?: string|data_ref;
	lte?: string|data_ref;
	eq ?: string|data_ref;
	neq?: string|data_ref;
	ltr?: string|data_ref;
	gtr?: string|data_ref;
	valid?: boolean;
	validRange?: boolean;
	prerelease?: boolean;
	loose?: boolean;
}

