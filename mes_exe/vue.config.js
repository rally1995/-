const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const url = 'http://192.168.1.103:9999';
// const url = 'http://192.168.1.179:9999';
// const url = 'http://192.168.1.154:9999';
// const url = 'http://192.168.1.180:9999'; // 何国康
// const url = 'http://192.168.1.172:9999'; // 金锐
// const url = 'http://192.168.1.193:9999'; // 林光锋

module.exports = {
    productionSourceMap: false,
    devServer: {
        /**
         * 反向代理
         */
        proxy: {
            '/auth': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/auth': '/auth'
                }
            },
            '/code': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/code': '/code'
                }
            },
            '/productionexe': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/productionexe': '/productionexe'
                }
            },
            '/productionplan': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/productionplan': '/productionplan'
                }
            },
            '/admin': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/admin': '/admin'
                }
            },
            '/basicdata': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/basicdata': '/basicdata'
                }
            },
        }
    },
    pluginOptions: {
        /**
         * stylus全局变量
         */
        'style-resources-loader': {
            preProcessor: 'stylus',
            patterns: [
                path.resolve(__dirname, './src/style/var.styl')
            ]
        }
    },
    configureWebpack: {
        plugins: [
            /**
             * gzip打包插件
             */
            new CompressionWebpackPlugin({
                filename: '[path].gz[query]',
                algorithm: 'gzip',
                test: /\.(js|css|html|svg)$/,
                threshold: 8192,
                minRatio: 0.8
            })
        ],
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.js'
            }
        }
    }
};
