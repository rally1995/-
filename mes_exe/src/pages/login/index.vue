<template lang="pug">
    .bg.clearfix
        .panel
            h1
                span 艾博智慧软件MES管理平台
            el-form.panel-form(
                ref="form"
                status-icon
                :rules="loginRules"
                :model="loginForm"
                @submit.native.prevent="submitForm")
                el-form-item(prop="username")
                    el-input(
                        placeholder="用户名"
                        v-model="loginForm.username"
                        auto-complete="off")
                        i.iconfont.iconuser(slot="prepend")
                el-form-item(prop="password")
                    el-input(
                        placeholder="密码"
                        prefix-icon=""
                        v-model="loginForm.password"
                        show-password
                        auto-complete="off")
                        i.iconfont.iconpassword(slot="prepend")
                el-form-item(prop="code")
                    el-input.valid-input(
                        :maxlength="4"
                        v-model="loginForm.code"
                        placeholder="验证码"
                        auto-complete="off")
                        i.iconfont.iconverificationai(slot="prepend")
                    img.valid-img(
                        :src="imgUrl"
                        @click="getImageUrl")
                el-form-item
                    el-button.panel-btn(
                        type="primary"
                        class="login-submit"
                        native-type="submit")
                        span 登
                        span 录
                .panel-note.red(v-if="errorMsg") {{errorMsg}}
                .panel-note(v-else) 请输入您的账号密码
        .footer 广州艾博智慧软件科技有限公司

</template>
<script src="./script.js"></script>
<style src="./style.styl" scoped lang="stylus"></style>
