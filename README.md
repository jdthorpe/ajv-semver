# Semver String validation with AJV.

### Getting started

Create an Ajv Instance and extend it with the `ajv-semver` plugin

```JavaScript
var Ajv = require("ajv");
var ajv = new Ajv();
require("ajv-semver")(ajv);
```

and then use it to validate version strings:

```JavaScript
ajv.validate({type:"string",format:"semver"},
             "1.2.3")
ajv.validate({type:"string",semver:true},
             "1.2.3")
ajv.validate({type:"string",semver:{valid:true}},
             "1.2.3")
ajv.validate({type:"string",semver:{valid:true,loose:true}},
             "=1.2.3")
```

validate version ranges:

```JavaScript
ajv.validate({type:"string",semver:{validRange:true}},
             ">=1.2.0 <1.3.0||>=2.0.0 <3.0.0")
ajv.validate({type:"string",semver:{validRange:true,loose:true}},
             "~1.2.3beta")
```

or use one of the comparison operators (`gt`,`gte`,`lt`,`lte`):

```JavaScript
ajv.validate({type:"string",semver:{gt:"1.2.3-r100"}},
             "1.2.3-R2")
ajv.validate({type:"string",semver:{gte:"1.2.3"}},
             "2.0.0")
ajv.validate({type:"string",semver:{lt:"=4.1.1",loose:true}},
             "2.0.0")
ajv.validate({type:"string",semver:{lte:"3.2.3",loose:true}},
             "=2.0.0")
```

or use one of the range comparison operators (`gtr`,`ltr`):

```JavaScript
ajv.validate({type:"string",semver:{gtr:"1.0.0 - 2.0.0"}},
             "2.0.1-R2")
ajv.validate({type:"string",semver:{ltr:"1.0.0 - 2.0.0"}},
             "0.6.3-beta")
```

And of course, you can validate object attributes, not just strings...

```JavaScript
var validator = ajv.compile({
	type:"object",
	properties:{
		version:{
			type:"string",
			semver:true
		},
		previousVersion:{
			type:"string",
			semver:{"lt":{$data:"1/version"}}
		}
	}
}) 
validator({version:"2.2.3",previousVersion:"1.7.12"}) // true
validator({version:"1.2.3",previousVersion:"1.7.12"}) // false


{
			"version":{
				# version should be a Semver string
				"semver":true,
			},
			# schema should be a valid JSON Schema
			"schema":{
				"$ref": "http://json-schema.org/draft-06/schema#",
			}
		}

```

