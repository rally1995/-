import axios from 'axios';
import mv from '@/main';
import qs from 'qs';

/**
 * 请求token配置
 */
const http = axios.create();

http.interceptors.request.use(config => {
    const accessToken = window.sessionStorage.getItem('access_token');
    // 递归删除前后空格
    const enumTrim = target => {
        let result;
        if (target === null) return target;
        if (typeof target === 'string') {
            result = target.trim();
            result = result.replace(/[\\^%;]/g, '');
        } else if (typeof target === 'object') {
            result = target instanceof Array ? [] : {};
            for (let i in target) {
                if (Object.prototype.hasOwnProperty.call(target, i)) {
                    result[i] = enumTrim(target[i]);
                }
            }
        } else {
            result = target;
        }
        return result;
    };
    // 定义header权限
    config.headers['Authorization'] = `Bearer ${accessToken}`;
    // query请求参数格式化
    config.paramsSerializer = params => {
        let p = enumTrim(params);
        p = qs.stringify(p, {
            encode: false,
            arrayFormat: 'indices',
        });
        p = p.replace(/\[/g, '%5B');
        p = p.replace(/\]/g, '%5D');
        return p.replace(/%5B(\D*?)%5D/g, '.$1');
    };
    // body请求参数格式化
    config.transformRequest = (data, head) => {
        if (data instanceof FormData) {
            return data;
        } else {
            head['Content-Type'] = 'application/json;charset=utf-8';
            const newData = enumTrim(data);
            return JSON.stringify(newData);
        }
    };
    return config;
}, err => {
    return Promise.reject(err);
});
http.interceptors.response.use(res => {
    const data = res.data;
    const { msg, code } = data;
    if (code === 1) {
        mv.$alert(msg, {
            type: 'error',
        });
        return Promise.reject(msg);
    }
    return data;
}, err => {
    const res = err.response;
    const status = res.status;
    const msg = res.data.msg;
    const reg = /\{.*(?=\})\}/;
    switch (status) {
        case 401:
        case 402:
            mv.$alert('请登录', {
                type: 'error',
            }).then(() => {
                window.location.href = '';
            });
            break;
        case 400:
            mv.$alert(msg, {
                type: 'error',
            });
            break;
        case 500:
            if (reg.test(msg)) {
                const msg_json = JSON.parse(reg.exec(msg)[0]).msg;
                mv.$alert(msg_json, {
                    type: 'error',
                });
            } else {
                mv.$alert(msg, {
                    type: 'error',
                });
            }
            break;
    }
    return Promise.reject(err);
});
export default http;
