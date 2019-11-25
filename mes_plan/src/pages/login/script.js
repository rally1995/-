import { randomLenNum } from '@/utils';
import Latin1 from 'crypto-js/enc-latin1';
import Aes from 'crypto-js/aes';
import ZeroPadding from 'crypto-js/pad-zeropadding';
import axios from 'axios';
import { mapMutations } from 'vuex';

export default {
    name: 'login',
    data() {
        return {
            loading: false,
            loginForm: {
                username: '',
                password: '',
                randomStr: '',
                code: ''
            },
            list: [
                { bar: '登录', path: 'login' },
                { bar: '官网', path: '#1' },
                { bar: '产品', path: '#2' },
                { bar: '联系', path: '#3' }
            ],
            lists: [
                { src: require('../../assets/login_icon4.png'), title: '平板电脑监视', content: '平板电脑监视生产流程更便捷' },
                { src: require('../../assets/login_icon5.png'), title: 'PC电脑监视', content: 'PC平板双端电脑监视生产' },
                { src: require('../../assets/login_icon6.png'), title: '生产安全更快速', content: '全方位监视生产更安全快速' }
            ],
            active: '',
            code: {
                src: require('../../assets/login-logo-2.png'),
                value: '',
                len: 4,
                type: 'image'
            },
            imgUrl: '',
            loginRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                ],
                code: [
                    { required: true, message: '请输入验证码', trigger: 'blur' },
                    { min: 4, max: 4, message: '验证码长度为4位', trigger: 'blur' }
                ]
            },
            errorMsg: '',
        };
    },
    methods: {
        ...mapMutations(['INI_STATE']),
        isDev() {
            const { VUE_APP_USERNAME, VUE_APP_PASSWORD } = process.env;
            if (VUE_APP_USERNAME && VUE_APP_PASSWORD) {
                this.loginForm.username = VUE_APP_USERNAME;
                this.loginForm.password = VUE_APP_PASSWORD;
            }
        },
        getImageUrl() {
            const rdm = randomLenNum(4, true);
            this.loginForm.randomStr = rdm;
            this.imgUrl = `/code?randomStr=${rdm}`;
        },
        submitForm() {
            this.$refs.form.validate(vali => {
                if (vali) {
                    this.login(this.loginForm);
                } else {
                    this.getImageUrl();
                    return false;
                }
            });
        },
        login(param) {
            const { username, password, code, randomStr } = param;
            const basicAuth = 'Basic bWVzLXVwbXM6bWVzLXVwbXM=';
            const key = 'mes1mes2mes3mes4';
            const iv = Latin1.parse(key);
            let encrypted = Aes.encrypt(
                password,
                iv, {
                    iv,
                    padding: ZeroPadding
                });
            encrypted = encrypted.toString();
            const params = {
                username,
                password: encrypted,
                randomStr,
                code,
                grant_type: 'password',
                scope: 'server'
            };
            this.loading = true;
            this.errorMsg = '';
            return axios({
                url: '/auth/oauth/token',
                method: 'post',
                params,
                headers: {
                    Authorization: basicAuth,
                    // 'content-type': 'application/x-www-form-urlencoded'
                },
            }).then(({ data }) => {
                this.loading = false;
                const { access_token, refresh_token } = data;
                if (access_token) window.sessionStorage.setItem('access_token', access_token);
                if (refresh_token) window.sessionStorage.setItem('refresh_token', refresh_token);
                this.$router.push('/basicdata/workshop');
            }).catch(err => {
                const { response } = err;
                this.errorMsg = response.data.msg;
                this.loading = false;
                this.getImageUrl();
            });
        }
    },
    created() {
        this.isDev();
        this.INI_STATE();
        this.getImageUrl();
    }
};
