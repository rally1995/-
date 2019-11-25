import { randomLenNum } from '@/utils';
import Latin1 from 'crypto-js/enc-latin1';
import Aes from 'crypto-js/aes';
import ZeroPadding from 'crypto-js/pad-zeropadding';
import axios from 'axios';
import { mapMutations } from 'vuex';

export default {
    name: 'Login',
    data() {
        return {
            loginForm: {
                username: '',
                password: '',
                randomStr: '',
                code: ''
            },
            imgUrl: '',
            loginRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, message: '密码长度最少为6位', trigger: 'blur' }
                ],
                code: [
                    { required: true, message: '请输入验证码', trigger: 'blur' },
                    { min: 4, max: 4, message: '验证码长度为4位', trigger: 'blur' }
                ],
            },
            errorMsg: '',
        };
    },
    created() {
        this.isDev();
        this.getImageUrl();
        this.INI_SYS();
    },
    methods: {
        ...mapMutations('sys', ['INI_SYS']),
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
            return axios({
                url: '/auth/oauth/token',
                method: 'post',
                params,
                headers: {
                    Authorization: basicAuth
                },
            }).then(({ data }) => {
                const { access_token, refresh_token } = data;
                if (access_token) window.sessionStorage.setItem('access_token', access_token);
                if (refresh_token) window.sessionStorage.setItem('refresh_token', refresh_token);
                this.$router.push('/processcenter');
            }).catch(err => {
                const { response } = err;
                this.errorMsg = response.data.msg;
                this.getImageUrl();
            });
        }
    },
};
