const path = require("path");
const PACKAGE = require('./package.json');


var FILE_NAME = "game";
var LIBRARY_NAME = PACKAGE.name;

var PATHS = {
    entryPoint: path.resolve(__dirname, 'src/index.ts'),
    dist: path.resolve(__dirname, 'dist/lib')
}

module.exports = {
    mode: "production",
    entry: PATHS.entryPoint,
    output: {
        path: PATHS.dist,
        filename: `${FILE_NAME}.js`
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    watch: true,
    watchOptions: {
        poll: 1000 // Check for changes every second
    }
}