# Semver string validation with AJV

### Getting started

Create an Ajv Instance and extend it with the `ajv-semver` plugin

```JavaScript
var Ajv = require("ajv");
var ajv = new Ajv();
require("ajv-semver")(ajv);
```

and then use it to validate semantic version ("semver") strings:

```JavaScript
ajv.validate({"type":"string","format":"semver"},
             "1.2.3")
ajv.validate({"type":"string","semver":true},
             "1.2.3")
ajv.validate({"type":"string","semver":{"valid":true}},
             "1.2.3")
ajv.validate({"type":"string","semver":{"valid":true,"loose":true}},
             "=1.2.3")
```

or validate version ranges:

```JavaScript
ajv.validate({"type":"string","semver":{"validRange":true}},
             ">=1.2.0 <1.3.0||>=2.0.0 <3.0.0")
ajv.validate({"type":"string","semver":{"validRange":true,"loose":true}},
             "~1.2.3beta")
```

or use one of the comparison operators (`gt`, `gte`, `lt`, `lte`):

```JavaScript
ajv.validate({"type":"string","semver":{"gt":"1.2.3-r100"}},
             "1.2.3-R2")
ajv.validate({"type":"string","semver":{"gte":"1.2.3"}},
             "2.0.0")
ajv.validate({"type":"string","semver":{"lt":"=4.1.1","loose":true}},
             "2.0.0")
ajv.validate({"type":"string","semver":{"lte":"3.2.3","loose":true}},
             "=2.0.0")
```

or use one of the range comparison operators (`gtr`, `ltr`):

```JavaScript
ajv.validate({"type":"string","semver":{"gtr":"1.0.0 - 2.0.0"}},
             "2.0.1-R2")
ajv.validate({"type":"string","semver":{"ltr":"1.0.0 - 2.0.0"}},
             "0.6.3-beta")
```

or you can validate object attributes and relations between them:

```JavaScript
var validator = ajv.compile({
	"type":"object",
	"properties":{
		"version":{
			"type":"string",
			"semver":{"clean":true}
		},
		// the `previousVersion` should be less than the current version
		"previousVersion":{
			"type":"string",
			"semver":{"lt":{"$data":"1/version"}}
		}
	},
	"required":["version"]
}) 

validator({"version":"1.2.3","previousVersion":"0.7.12"}) // true

// fails validation: `previousVersion` is not less than `version`
validator({"version":"1.2.3","previousVersion":"1.7.12"}) // false

// fails validation: invalid version string
validator({"version":"1.2.3","previousVersion":"a.b.c"}) // false
validator({"version":"a.b.c","previousVersion":"1.7.12"}) // false
```

or clean your version strings and calculate major, minor, and patch -- handy
for indexing or querying with MongoDB and friends:

```JavaScript
var Ajv = require("ajv");
var ajv = new Ajv({
		// required to create a new attribute
		"useDefaults":true
	});
require("./index.js")(ajv);

var validator = ajv.compile({
	"type":"object",
	"properties":{
		"version":{
			"type":"string",
			"semver":true
		},
		// calculate the major minor and patch
		"Major":{
			"default": null, // required to create a new attribute
			"semver":{"major":{"$data":"1/version"},"loose":true}
		},                                                
		"Minor":{                                           
			"default": null, // required to create a new attribute
			"semver":{"minor":{"$data":"1/version"},"loose":true}
		},                                                
		"Patch":{                                           
			"default": null, // required to create a new attribute
			"semver":{"patch":{"$data":"1/version"},"loose":true}
		}
	},
	"required":["version"]
}) 

var obj = {"version":"=2.2.3"}
validator(obj) // true
obj // { version: '2.2.3', Major: 2, Minor: 2, Patch: 3 }

var obj = {"version":"=a.b.c"}
validator(obj) // false
obj // { version: null, Major: null, Minor: null, Patch: null }
```

