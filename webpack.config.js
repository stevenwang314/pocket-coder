const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    //Which file should be use to create a dependency graph
    entry: './client/index.js',
    //Take a group of files and bundling them
    output: {
        path: path.join(__dirname, '/dist'), //Identify the location to /dist directory
        filename: 'bundle.js' //Name of the file saved in dist directory
    },

    plugins: [
        //Tells webpack to inject bundles it generate  added to a source folder in html.
        new HTMLWebpackPlugin({
            template: './client/index.html'
        })
    ],

    module: {
        rules: [ //Our rules (array of object) to use bible to transpile all files ending in .js
            {
                test: /.js$/,
                //do not transpile .js files in node modules directory (library files!)
                exclude: /node_modules/,
                //Utilize our babel library to transpile!
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env','@babel/preset-react']
                    }
                }
            },
            {
                test: /.css$/,
                use: ['style-loader', 'css-loader']
              }
        ]
    },
    //Webpack development server configuration
    devServer: {
        //Starting port number
        port: 4242
    }
    
}