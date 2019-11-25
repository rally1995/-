<template lang='pug'>
    ebrain-main.user
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btns")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoading'
                    :data="data"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editRow"
                    row-key="userId"
                    highlight-current-row
                    :current-row-key.sync="currentRowKey")
                    el-table-column(slot="role" label="角色" showOverflowTooltip)
                        template(v-slot="{row}")
                            span(v-for="(v, i) in row.roleList") {{i === 0 ? '' : ', '}}{{v.roleName}}
                                //- span(v-for="(v, i) in row.roleList") {{i === 0 ? '' : ', '}}{{v.roleName}}
        ebrain-dialog(
            ref="dialogForm"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
            template(#staffNum)
                el-col(:span="12")
                    el-form-item(label="员工编码" required prop="staffNum" v-if="dialogForm[0].value === '1'")
                        el-input(
                            readonly
                            placeholder="请选择"
                            v-model="dialogForm[2].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterStaffInfo")
            template(#staffName)
                el-col(:span="12")
                    el-form-item(label="员工名称" required prop="staffName" v-if="dialogForm[0].value === '1'")
                        el-input(
                            readonly
                            v-model="dialogForm[3].value")
            template(#password)
                el-col(:span="12")
                    el-form-item(label="密码" label-width="110px" prop="password" :required="!disabled")
                        el-input(v-if="!disabled" v-model="dialogForm[6].value" :style="editpassword?'width:75%':'width:100%'")
                        el-button(@click="edit" v-if="editpassword") {{disabled?'修改密码':'取消'}}
            template(#staff)
                el-col(:span="12")
                    el-form-item(label="是否为员工" required)
                        el-radio-group(v-model="dialogForm[0].value" @change='staffChange')
                            el-radio(label="1") 是
                            el-radio(label="0") 否
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            row-key="id"
            :current-row-key.sync="currentRowKeyStaffInfo"
            :height="550"
            :data="staffInfoData"
            :column="staffInfoColumn"
            :submitLoading="submitLoadingTable"
            :visible.sync="dialogVisibleStaffInfo"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormStaffInfo")
</template>

<script>
import dict from '@/utils/dict';
import moment from 'moment';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import { mapActions, mapState } from 'vuex';

export default {
    name: 'User',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            searchVisible: true,
            passwordRules: [{
                validator(rule, value, callback) {
                    const reg =  /^.{6,}$/;
                    if (!value) callback();
                    if (!reg.test(value)) {
                        return callback(new Error('密码长度最少为6位!'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur',
            }],
            rowObj: {},
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            dialogVisibleStaffInfo: false,
            staffInfoData: [],
            currentRowKeyStaffInfo: '',
            submitLoadingTable: false,
            submitLoading: false,
            tableLoading: false,
            data: [],
            staffInfoColumn: [{
                label: '员工姓名',
                prop: 'personnelFullName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '员工编码',
                prop: 'personnelNumber',
                showOverflowTooltip: true,
                searchBy: true,
            }],
            tableColumn: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
            }, {
                label: '用户编码',
                prop: 'username',
                showOverflowTooltip: true,
            }, {
                label: '用户类型',
                prop: 'userType',
                formatter(row, column, cell) {
                    return dict.userType[cell];
                },
            }, {
                slot: 'role',
            }, {
                label: '状态',
                prop: 'lockFlag',
                formatter(row, column, cell) {
                    return dict.lockFlag[cell];
                },
            }, {
                label: '用户名',
                prop: 'nickname',
                value: '',
            }, {
                label: '有效期',
                prop: 'validityTime',
                minWidth: 110,
                showOverflowTooltip: true,
            }, {
                label: '手机号',
                prop: 'phone',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                slot: 'staff',
                prop: 'staff',
                value: '',
            }, {
                label: '角色',
                prop: 'role',
                required: true,
                type: 'multiple',
                collapse: 'collapse-tags',
                value: [],
                option: {},
            }, {
                slot: 'staffNum',
                prop: 'staffNum',
                value: '',
            }, {
                slot: 'staffName',
                prop: 'staffName',
                required: true,
                disabled: true,
                value: '',
            }, {
                label: '用户编码',
                prop: 'username',
                required: true,
                value: '',
            }, {
                label: '用户名',
                prop: 'nickname',
                value: '',
                required: true,
            }, {
                slot: 'password',
                prop: 'password',
                rule: {
                    validator(rule, value, callback) {
                        const reg =  /^.{6,}$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('密码长度最少为6位!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                value: '',
                required: true,
            }, {
                label: '用户类型',
                prop: 'userType',
                required: true,
                type: 'select',
                value: '',
                option: dict.userType,
            }, {
                label: '状态',
                prop: 'lockFlag',
                required: true,
                type: 'select',
                option: dict.lockFlag,
                value: '',
            }, {
                label: '有效期',
                prop: 'validityTime',
                value: '',
                type: 'datetime',
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^1[0-9]{10}$/;
                        if (!value) callback();
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('您的手机号不合法'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '手机号',
                prop: 'phone',
                value: '',
            }],
            dialogSearchForm: {},
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            searchForm: [{
                label: '用户编码',
                prop: 'username',
                value: '',
            }, {
                label: '用户名',
                prop: 'nickname',
                value: '',
            }],
            disabled: true,
            password: '',
            editpassword: false,
            btns: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'sys_user_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'sys_user_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'sys_user_del',
                disabled: () => this.editDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchObj: {},
        };
    },
    computed: {
        editDisabled() {
            return this.currentRowKey === '';
        },
        ...mapState({
            userInfo: state => state.sysUser
        })
    },
    watch: {
        dialogVisible(val) {
            if (!val) {
                this.password = '';
            }
        },
        password(val) {
            this.dialogForm[6].value = val;
        },
        dialogVisibleStaffInfo(val) {
            if (!val) {
                this.dialogSearchForm = {};
            }
        }
    },
    created() {
        this.getData();
    },
    methods: {
        ...mapActions(['signout']),
        // 清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        search() {
            this.searchObj = {};
            this.searchForm.forEach(v => {
                if (v.value) this.searchObj[v.prop] = v.value;
            });
            this.currentPage = 1;
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            this.$http.get('/admin/user/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    ...this.searchObj,
                },
            }).then(res => {
                this.tableLoading = false;
                this.data = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        getStaffInfo(val = 1) {
            const params = {
                current: val,
                size: this.pageSize_1,
                conditionList: [{
                    fieldName: 'whetherPersonnel',
                    operation: 'EQ',
                    value: '0',
                    joinType: 'AND',
                }],
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            params.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.submitLoadingTable = false;
            this.$http.get('/basicdata/dicpersonnel/page', {
                params,
            }).then(res => {
                this.submitLoadingTable = false;
                this.currentPage_1 = val;
                this.staffInfoData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getStaffInfo();
        },
        // 列表内清空
        resetDialog(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        enterStaffInfo() {
            this.pageSize_1 = 20;
            this.currentPage_1 = 1;
            this.pageTotal_1 = 0;
            this.dialogVisibleStaffInfo = true;
            this.getStaffInfo();
        },
        currentChange(selection) {
            this.rowObj = selection;
        },
        changeCurrent_1(val) {
            this.getStaffInfo(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getStaffInfo();
        },
        submitFormStaffInfo() {
            this.dialogForm[2].value = this.rowObj.personnelNumber;
            this.dialogForm[3].value = this.rowObj.personnelFullName;
            this.dialogForm[4].value = this.rowObj.personnelNumber;
            this.dialogForm[5].value = this.rowObj.personnelFullName;
            this.dialogVisibleStaffInfo = false;
        },
        staffChange() {
            this.dialogForm[2].value = '';
            this.dialogForm[3].value = '';
            this.dialogForm[4].value = '';
            this.dialogForm[5].value = '';
        },
        newRow() {
            this.editpassword = false;
            this.dialogForm[4].disabled = false;
            this.dialogForm[0].value = '1';
            this.disabled = false;
            this.dialogType = 'new';
            this.queryRole().then(() => {
                this.dialogVisible = true;
            });
        },
        editRow() {
            this.dialogForm[0].disabled = true;
            this.editpassword = true;
            this.disabled = true;
            const item = this.data.find(v => v.userId === this.currentRowKey);
            this.dialogForm.forEach(v => {
                if (v.prop === 'role') {
                    v.value = item.roleList.map(j => j.roleId);
                } else if (v.prop !== 'password') {
                    v.value = item[v.prop];
                }
            });
            this.dialogType = 'edit';
            this.queryRole().then(() => {
                this.dialogVisible = true;
            });
            if (this.dialogForm[2].value) {
                this.$http.get('/basicdata/dicpersonnel/page', {
                    params: {
                        conditionList: [{
                            fieldName: 'personnelNumber',
                            operation: 'EQ',
                            value: this.dialogForm[2].value
                        }]
                    }
                }).then(res => {
                    this.dialogForm[3].value = res.data.records[0].personnelFullName;
                });
            }
        },
        delRow() {
            const item = this.data.find(v => v.userId === this.currentRowKey);
            if (item.lockFlag === '0') {
                this.$alert('有效状态下,不允许删除用户', '提示', {
                    type: 'warning'
                });
                return;
            }
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/admin/user/' + this.currentRowKey).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        queryRole() {
            return this.$http.get('/admin/role/list?size=999').then(res => {
                let item = this.dialogForm.find(v => v.prop === 'role');
                let obj = {};
                res.data.forEach(v => {
                    obj[v.roleId] = v.roleName;
                });
                item.option = obj;
            });
        },
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                if (v.prop === 'password') {
                    if (!this.disabled) {
                        obj[v.prop] = v.value;
                    }
                } else {
                    obj[v.prop] = v.value;
                }
            });
            // if (!this.disabled) obj.password = this.password;
            obj.validityTime = obj.validityTime && moment(obj.validityTime).format('YYYY-MM-DD HH:mm:ss');
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/admin/user', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.userId = this.currentRowKey;
                this.$http.put('/admin/user', obj).then(() => {
                    this.submitLoading = false;
                    this.dialogVisible = false;
                    this.getData();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    if (this.currentRowKey === this.userInfo.userId) {
                        this.$alert('请重新登录!', {
                            type: 'warning'
                        }).then(() => {
                            this.signout();
                        });
                    }
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        edit() {
            this.$refs.dialogForm.$refs.form.clearValidate(['password']);
            this.disabled = !this.disabled;
            this.password = '';
        }
    }
};
</script>

<style scoped lang="stylus">
.user
    & >>> .fr
        float right

    & >>> .tools
        height 34px

.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    height 57px

    &.hide
        padding-top 0
        padding-bottom 0
        height 0

</style>
