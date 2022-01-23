var tap = require('tap');
var test = tap.test;
var semver = require('semver');
var prerelease = semver.prerelease;

var Ajv = require("ajv");
var ajv = new Ajv();
require("../index.js")(ajv);

test('\nprerelease', function(t) {
  // [prereleaseParts, version, loose]
  [
    [['alpha', 1], '1.2.2-alpha.1'],
    [[1], '0.6.1-1'],
    [['beta', 2], '1.0.0-beta.2'],
    [['pre'], 'v0.5.4-pre'],
    [['alpha', 1], '1.2.2-alpha.1', false],
    [['beta'], '0.6.1beta', true],
    [null, '1.0.0', true],
    [null, '~2.0.0-alpha.1', false],
    [null, 'invalid version'],
  ].forEach(function(tuple) {
    var expected = tuple[0];
    var version = tuple[1];
    var loose = tuple[2] || false;
    var msg = 'prerelease(' + version + ')';
    t.same(ajv.validate({"semver":{"prerelease":true, "loose":loose}},version), expected !== null, msg);
  });
  t.end();
});
