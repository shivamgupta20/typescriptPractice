const path = require("path")

module.exports= {
    mode:"development",
    entry: "./src/app.ts",
    output:{
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/dist"
    },
    devServer: {
        contentBase: path.join(__dirname),
        compress: true,
        port: 9000,
        // writeToDisk: true
      },
    devtool: "source-map",
    module: {
        rules:[{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve:{
        extensions:[".ts", ".js"]
    }
}