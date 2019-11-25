const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const url = 'http://10.10.110.6:9999';
// const url = 'http://seadog.iok.la:33988';
// const url = 'http://192.168.1.156:9999';
// const url = 'http://192.168.1.151:9999'; // 继龙
// const url = 'http://106.52.33.225:9999';
// const url = 'http://192.168.1.190:9999';
// const url = 'http://192.168.1.53:9999';
// const url = 'http://192.168.1.183:9999'; // 汪
// const url = 'http://192.168.1.184:9999'
// const url = 'http://192.168.1.173:9999'
// const url = 'http://192.168.1.130:9999';  // 新辉
// const url = 'http://192.168.1.200:9999';
// const url = 'http://192.168.1.176:9999';
// const url = 'http://192.168.1.104:9999'
// const url = 'http://seadog.iok.la:42892' // 线上
// const url = 'http://192.168.1.13:9999';
// const url = 'http://192.168.1.179:9999';
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
            '/admin': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/admin': '/admin'
                }
            },
            '/code': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/code': '/code'
                }
            },
            '/gen': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/gen': '/gen'
                }
            },
            '/daemon': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/daemon': '/daemon'
                }
            },
            '/tx': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/tx': '/tx'
                }
            },
            '/act': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/act': '/act'
                }
            },
            '/basicdata': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/basicdata': '/basicdata'
                }
            },
            '/devicemanager': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/devicemanager': '/devicemanager'
                }
            },
            '/productionplan': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/productionplan': '/productionplan'
                }
            },
            '/qc': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/qc': '/qc'
                }
            },
            '/purchase': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/purchase': '/purchase'
                }
            },
            '/productionexe': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/productionexe': '/productionexe'
                }
            },
            '/tallymanager': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/tallymanager': '/tallymanager'
                }
            },
            '/transportmanager': {
                target: url,
                ws: true,
                pathRewrite: {
                    '^/transportmanager': '/transportmanager'
                }
            }
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
                test: /\.(js|css|svg)$/,
                threshold: 8192,
                minRatio: 0.8
            })
        ]
    }
};
