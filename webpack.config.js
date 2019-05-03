//@ts-check

'use strict';

const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
    target: 'web',
    entry: './src/index.web.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'markdown-it-plot.js',
        libraryTarget: 'umd',
        devtoolModuleFilenameTemplate: '../[resource-path]',
        umdNamedDefine: true
    },
    devtool: 'source-map',
    externals: {
        vscode: 'd3 jsdom canvas',
        d3:'d3',
        jsdom:'jsdom'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    }
};

module.exports = config;