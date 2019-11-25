<template lang="pug">
    ebrain-main.dicbasicclassmanagement
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="search"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    highlight-current-row
                    :current-row-key.sync="currentRowKeyParent"
                    row-key="id"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @row-dblclick="editRowParent"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-click="getDataSon")
        ebrain-frame(title="班次")
            template(#tools)
                ebrain-tools(:buttons="btnsBottom")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingDown'
                    :isShow='false'
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon"
                    row-key="id"
                    :data="tableDataSon"
                    :column="tableColumnSon")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
</template>

<script>
import dict from '@/utils/dict';
import { mapState } from 'vuex';
import moment from 'moment';
import _ from 'lodash';

export default {
    name: 'index',
    data() {
        return {
            searchVisible: true,
            submitLoading: false,
            tableLoadingTop: false,
            tableLoadingDown: false,
            tableDataParent: [],
            tableDataSon: [],
            list: [],
            tableColumnParent: [{
                label: '班制编号',
                prop: 'classManagementCode',
                showOverflowTooltip: true,
            }, {
                label: '班制名称',
                prop: 'classManagementName',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'classManagementStatus',
                formatter(row, column, cell) {
                    return dict.classManagementStatus[cell];
                },
            }, {
                label: '维护人员',
                prop: 'createBy',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'updateTime',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'classManagementRemark',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                }
            }, {
                label: '班次编号',
                prop: 'shiftNumber',
                showOverflowTooltip: true,
            }, {
                label: '班次名称',
                prop: 'shiftName',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.shiftName[cell];
                }
            }, {
                label: '时段说明',
                prop: 'timeDescription',
                showOverflowTooltip: true,
            }, {
                label: '工作时长',
                prop: 'workTime',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '班制编号',
                prop: 'classManagementCode',
                value: '',
                disabled: true,
                placeholder: '系统自动生成'
            }, {
                label: '班制名称',
                prop: 'classManagementName',
                required: true,
                value: '',
            }, {
                label: '状态',
                prop: 'classManagementStatus',
                required: true,
                type: 'select',
                value: '',
                option: dict.classManagementStatus,
            }, {
                label: '维护人员',
                prop: 'createBy',
                value: '',
                disabled: true
            }, {
                label: '维护日期',
                prop: 'updateTime',
                value: '',
                disabled: true
            }, {
                label: '备注',
                prop: 'classManagementRemark',
                type: 'textarea',
                value: '',
            }],
            dialogFormSon: [{
                label: '班次编号',
                prop: 'shiftNumber',
                required: true,
                value: '',
                type: 'select',
                option: {},
                change: val => {
                    const row = this.list.find(v => v.shiftNumber === val);
                    this.shiftNumberId = row.id;
                    this.dialogFormSon[1].value = row.shiftName;
                    this.dialogFormSon[2].value = row.timeDescription;
                    this.dialogFormSon[3].value = row.workTime;
                }
            }, {
                label: '班次名称',
                prop: 'shiftName',
                value: '',
                type: 'select',
                option: dict.shiftName
            }, {
                label: '时段说明',
                prop: 'timeDescription',
                value: '',
            }, {
                label: '工作时长',
                prop: 'workTime',
                value: ''
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKeyParent: '',
            dialogType: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            searchForm: [{
                label: '班制编号',
                prop: 'classManagementCode',
                value: '',
            }, {
                label: '班制名称',
                prop: 'classManagementName',
                value: '',
            }],
            shiftNumberId: '',
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_dicbasicclassmanagement_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_dicbasicclassmanagement_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_dicbasicclassmanagement_del',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsBottom: [{
                label: '新增',
                click: () => this.newRowSon(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_dicbasicclassmanagementde_add',
                disabled: () => !this.currentRowKeyParent,
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_dicbasicclassmanagementde_del',
            }],
            searchObj: {}
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
        ...mapState({
            userInfo: state => state.sysUser
        })
    },
    created() {
        this.getDataParent();
    },
    methods: {
        // 清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        search() {
            this.searchObj = {};
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.searchObj[v.prop] = v.value;
                }
            });
            this.currentPage = 1;
            this.getDataParent();
        },
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/basicdata/dicbasicclassmanagement/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    ...this.searchObj,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        getDataSon() {
            this.tableLoadingDown = true;
            this.$http.get(`/basicdata/dicbasicclassmanagementde/${this.currentRowKeyParent}`).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data || [];
            });
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getDataParent();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        newRowParent() {
            this.dialogFormParent[3].value = this.userInfo.nickname;
            this.dialogFormParent[4].value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.dialogType = 'new';
            this.dialogVisibleParent = true;
        },
        editRowParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisibleParent = true;
        },
        delRowParent() {
            if (this.tableDataSon.length) {
                this.$alert('存在子表, 不可删除', '提示', {
                    type: 'error',
                });
            } else {
                this.$confirm('是否确认删除?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.submitLoading = true;
                    this.$http.delete(`/basicdata/dicbasicclassmanagement/${this.currentRowKeyParent}`).then(() => {
                        this.submitLoading = false;
                        this.getDataParent();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                        this.currentRowKeyParent = '';
                    });
                });
            }
        },
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                if (v.prop === 'createBy') obj[v.prop] = this.userInfo.userId;
                else obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/basicdata/dicbasicclassmanagement', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKeyParent;
                this.$http.put('/basicdata/dicbasicclassmanagement', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        newRowSon() {
            this.getShift().then(() => {
                this.dialogVisibleSon = true;
            });
        },
        getShift() {
            return this.$http.get(`/basicdata/bizbasicshiftinformation/getClassManagement/${this.currentRowKeyParent}`).then(res => {
                let item = this.dialogFormSon.find(v => v.prop === 'shiftNumber');
                this.list = res.data;
                const filterData = _.differenceBy(res.data, this.tableDataSon, 'id');
                let obj = {};
                filterData.forEach(v => {
                    obj[v.shiftNumber] = v.shiftNumber;
                });
                item.option = () => obj;
            });
        },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/dicbasicclassmanagementde/' + this.currentRowKeySon).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeySon = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        submitFormSon() {
            let obj = {};
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            obj.classManagementDeId = this.currentRowKeyParent;
            obj.shiftNumberId = this.shiftNumberId;
            this.$http.post('/basicdata/dicbasicclassmanagementde', obj).then(() => {
                this.submitLoading = false;
                this.getDataSon();
                this.$message({
                    message: '新增成功!',
                    type: 'success'
                });
                this.dialogVisibleSon = false;
            }).catch(() => {
                this.submitLoading = false;
            });
        }
    }
};
</script>

<style scoped lang="stylus">
.dicbasicclassmanagement
    & >>> .fr
        float right

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
