<template lang="pug">
    ebrain-main.bizbasicShift
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
                    :tableLoading='tableLoading'
                    highlight-current-row
                    :current-row-key.sync="currentRowKey"
                    row-key="id"
                    :data="tableData"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @row-dblclick="editRow"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize')
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
</template>

<script>
import dict from '@/utils/dict';
import { mapState } from 'vuex';
// import _ from 'lodash';
import moment from 'moment';

export default {
    name: 'index',
    data() {
        return {
            conditionList: [],
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            tableColumn: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
                index: index => {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
                },
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
                },
            }, {
                label: '开始时间',
                prop: 'startingTime',
            }, {
                label: '结束时间',
                prop: 'endTime',
                showOverflowTooltip: true,
            }, {
                label: '是否跨天',
                prop: 'whetherCrossDay',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.whetherCrossDay[cell];
                },
            }, {
                label: '工作时长',
                prop: 'workTime',
                showOverflowTooltip: true,
            }, {
                label: '时段说明',
                prop: 'timeDescription',
                showOverflowTooltip: true,
            }, {
                label: '维护人员',
                prop: 'createBy',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'createTime',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'shiftStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.shiftStatus[cell];
                },
            }, {
                label: '描述',
                prop: 'description',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: '班次名称',
                prop: 'shiftName',
                required: true,
                type: 'select',
                value: '',
                option: dict.shiftName,
            }, {
                label: '开始时间',
                prop: 'startingTime',
                required: true,
                type: 'time',
                value: '',
            }, {
                label: '结束时间',
                prop: 'endTime',
                required: true,
                type: 'time',
                value: '',
                change: (value) => {
                    let startTime = this.dialogForm[1].value;
                    let endTime = value;
                    startTime = startTime.replace(/\:/g, '');
                    startTime = Number(startTime);
                    endTime = endTime.replace(/\:/g, '');
                    endTime = Number(endTime);
                    if (endTime < startTime) {
                        this.dialogForm[3].value = '1';
                        this.dialogForm[3].disabled = true;
                    } else {
                        this.dialogForm[3].value = '0';
                        this.dialogForm[3].disabled = false;
                    }
                }
            }, {
                label: '是否跨天',
                prop: 'whetherCrossDay',
                type: 'select',
                value: '',
                disabled: false,
                option: dict.whetherCrossDay,
            }, {
                label: '时段说明',
                prop: 'timeDescription',
                value: '',
                readonly: true
            }, {
                label: '状态',
                prop: 'shiftStatus',
                required: true,
                type: 'select',
                value: '',
                option: dict.shiftStatus,
            }, {
                label: '维护人员',
                prop: 'createBy',
                value: '',
                readonly: true
            }, {
                label: '维护日期',
                prop: 'createTime',
                type: 'datetime',
                value: '',
                disabled: true,
            }, {
                label: '描述',
                prop: 'description',
                type: 'textarea',
                value: ''
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            searchForm: [{
                label: '班次编号',
                prop: 'shiftNumber',
                value: '',
            }, {
                label: '班次名称',
                prop: 'shiftName',
                value: '',
                type: 'select',
                option: dict.shiftName,
            }],
            shiftStatus: '',
            routeCode: '',
            searchVisible: true,
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'basicdata_shiftinformation_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                permi: 'basicdata_shiftinformation_edit',
                disabled: () => this.editDisabled,
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                permi: 'basicdata_shiftinformation_del',
                disabled: () => this.editDisabled,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }]
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
    created() {
        this.getData();
    },
    methods: {
        // 清空
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        search() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'AND',
                    });
                }
            });
            this.currentPage = 1;
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            this.$http.get('/basicdata/bizbasicshiftinformation/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoading = false;
                this.tableData = res.data.records;
                this.pageTotal = res.data.total;
            });
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
        newRow() {
            const obj = {
                createBy: this.userInfo.nickname,
                whetherCrossDay: '0',
                createTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            };
            this.dialogForm.forEach(v => {
                const isKey = obj.hasOwnProperty(v.prop);// hasOwnProperty ES6原生方法,是否有此属性
                if (isKey) v.value = obj[v.prop];
            });
            this.dialogType = 'new';
            this.dialogVisible = true;
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            // item.createTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/bizbasicshiftinformation/' + this.currentRowKey).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                if (v.prop === 'createBy') obj[v.prop] = '';
                else obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/basicdata/bizbasicshiftinformation', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                    this.submitLoading = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                obj.createBy = this.userInfo.userId;
                this.$http.put('/basicdata/bizbasicshiftinformation', obj).then(() => {
                    this.submitLoading = false;
                    this.getData();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisible = false;
                    this.submitLoading = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        }
    }
};
</script>

<style scoped lang="stylus">
.bizbasicShift
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
