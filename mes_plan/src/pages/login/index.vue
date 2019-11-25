<template lang="pug">
    .login-container
        header.login-container-header
            img(src='@/assets/login-logo-2.png')
            ul.navigation-bar
                li(v-for="(item,index) in list" :class="active === index?'router-link-exact-active':''")
                    router-link(:to="item.path")
                        span {{ item.bar }}
        .login-container-weaper
            .login-weaper
                .login-border
                    .login-main
                        .login-title
                            img(src='@/assets/login-box-logo.png')
                            span 艾博智慧软件MES管理平台
                        el-form.login-form(
                        ref="form"
                        status-icon
                        :rules="loginRules"
                        :model="loginForm"
                        @submit.native.prevent="submitForm")
                            el-form-item(prop="username")
                                el-input(placeholder="请输入用户名"
                                        v-model="loginForm.username"
                                        size="small"
                                        auto-complete="off")
                                    i.iconfont.iconlogin-user1(slot="prepend")
                            el-form-item(prop="password")
                                el-input(placeholder="请输入密码"
                                        prefix-icon=""
                                        v-model="loginForm.password"
                                        show-password
                                        size="small"
                                        auto-complete="off")
                                    i.iconfont.iconlogin-password(slot="prepend")
                            el-form-item(prop="code")
                                el-row(:span="24")
                                    el-col(:span="16")
                                        el-input(size="small"
                                                :maxlength="code.len"
                                                v-model="loginForm.code"
                                                placeholder="请输入验证码"
                                                auto-complete="off")
                                            i.iconfont.iconlogin-verification(slot="prepend")
                                    el-col(:span="8")
                                        .login-code
                                            span(v-if="code.type == 'text'") {{code.value}}
                                            img.login-code-img(
                                            :src="imgUrl"
                                            @click="getImageUrl")
                            el-form-item
                                el-button(
                                :loading='loading'
                                type="primary"
                                class="login-submit"
                                native-type="submit") 登录
                            .login-placeholder.red(v-if="errorMsg") {{errorMsg}}
                            .login-placeholder(v-else) 请输入您的账号密码
        footer.footer
            ul
                li(v-for="item in lists")
                    img(:src="item.src")
                    .footer-container
                        .footer-title {{ item.title }}
                        .footer-content {{ item.content }}
</template>
<script src="./script.js"></script>
<style src="./style.styl" scoped lang="stylus"></style>
