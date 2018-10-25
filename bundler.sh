#!/bin/bash

# Let's make it all from scratch! Who needs webpack?

START="
(function () {
    var loaded = [];
    function normalize(moduleName) {
        return moduleName.replace(/^\\.\\//, '').replace(/\\.js\$/, '');
    };

    function loadModule(moduleName) {
        var mod = normalize(moduleName);
        if (loaded.indexOf(mod) > -1) return;
        var module = { exports: {} };
        var raw = _rawModules[mod];
        raw(module, module.exports, require);
        modules[mod] = module;
        loaded.push(mod);
    };

    _rawModules = {
        // MODULES GO HERE:
"
END="
    };

    modules = {};

    function require(moduleName) {
        var mod = normalize(moduleName);
        if (loaded.indexOf(mod) < 0) {
            loadModule(mod);
        }
        return modules[mod].exports;
    };

    require.modules = modules;
    window.require = window.require || require;
})();"

OUT="$START"

for file in assets/js/*.js; do
    NAME="$(basename "$file" .js)"
    OUT+="
        '$NAME': function(module, exports, require) {
            $(cat "$file")
        },
    "
done

OUT+="$END"

[ ! -d dist ] && mkdir dist
[ -f dist/bundle.js ] && rm -rf dist/bundle.js

echo "$OUT" | sed 's/^ *//g' | sed '/^$/d' | sed 's/\/\/ .*$//g' | tr -d '\n' > dist/bundle.js