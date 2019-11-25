<template lang="pug">
    ebrain-main.processInformation
        ebrain-frame(
            :title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchParent"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingTop'
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-dblclick="editRowParent"
                    row-key="id"
                    highlight-current-row
                    @row-click="getDataSon"
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-frame(
            title="工作中心")
            template(#tools)
                ebrain-tools(:buttons="btnsBottom")
                    //- button(
                    //-     @click="ascending"
                    //-     :disabled="!currentRowKeySon"
                    //-     :class="{disabled: !currentRowKeySon}")
                    //-     i.iconfont.iconstatus-Submission
                    //-     |升序
                    //- button(
                    //-     @click="descending"
                    //-     :disabled="!currentRowKeySon"
                    //-     :class="{disabled: !currentRowKeySon}")
                    //-     i.iconfont.iconstatus-download
                    //-     |降序
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingDown'
                    :pageSize='pageSize_down'
                    :currentPage='currentPage_down'
                    :pageTotal='pageTotal_down'
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @changeCurrent="changeCurrent_down"
                    @changeSize='changeSize_down'
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
        //- ebrain-dialog(
        //-     :submitLoading='submitLoading'
        //-     :visible.sync="dialogVisibleSon"
        //-     :form.sync="dialogFormSon"
        //-     @submit="submitFormSon")
        //-     template(#workCenterName="{value}")
        //-         el-col(:span="12")
        //-             el-form-item(label-width="110px" label="工作中心名称" )
        //-                 el-input(style="cursor:pointer" :value="value")
        //-                     el-button(slot="append" @click="dialogSearchForm={};getWorkcenter()" icon="iconfont iconsearch")
        ebrain-dialog-table.dialog-table(
            height="60vh"
            dialogTableSearch
            :data="tableDataWork"
            row-key="id"
            :column="tableColumnWork"
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleWork"
            highlight-current-row
            @row-click="selectionGetWorkCenter"
            @submit="submitFormWork"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            :pageSize="pageSizeC"
            :currentPage="currentPageC"
            :pageTotal="pageTotalC"
            :disabled="!currentRowKeyWorkCenter"
            @changeCurrent="changeCurrentC"
            @changeSize='changeSizeC'
            :current-row-key.sync="currentRowKeyWorkCenter"
            isShow)
</template>

<script>
import dict from '@/utils/dict';
import { mapActions, mapState } from 'vuex';
import axios from 'axios';
const CancelToken = axios.CancelToken;

export default {
    name: 'index',
    data() {
        return {
            conditionList: [],
            pageTotalC: 0,
            pageSizeC: 20,
            currentPageC: 1,
            pageTotalP: 0,
            dialogVisibleWork: false,
            submitLoading: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            currentRowKeyWorkCenter: '',
            tableDataParent: [],
            tableDataSon: [],
            List: [],
            list: [],
            tableDataWork: [],
            tableColumnParent: [{
                label: '工艺序号',
                prop: 'serialNumber',
                showOverflowTooltip: true,
            }, {
                label: '工艺编码',
                prop: 'processCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺名称',
                prop: 'processName',
                showOverflowTooltip: true,
            }, {
                label: '工艺属性',
                prop: 'processType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.processType[cell];
                }
            }, {
                label: '工艺类型',
                prop: 'productType',
                formatter: (row, column, cell) => {
                    return this.storeDict['product_type'][cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                label: '编号',
                type: 'index',
                align: 'center',
                width: 50,
                index: index => {
                    return (this.currentPage_down - 1) * this.pageSize_down + index + 1;
                },
            }, {
                label: '工作中心编码',
                prop: 'workCenterCode',
                showOverflowTooltip: true,
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
                // formatter(row, coulmn, cell) {
                //     return dict.workingHoursType[cell];
                // }
            }],
            dialogFormParent: [{
                label: '工艺名称',
                prop: 'processName',
                value: '',
                required: true,
            }, {
                label: '工艺属性',
                prop: 'processType',
                value: '',
                type: 'select',
                required: true,
                option: dict.processType
            }, {
                label: '工艺编码',
                prop: 'processCode',
                value: '',
                disabled: true,
                placeholder: '系统自动生成'
            }, {
                label: '工艺类型',
                prop: 'productType',
                value: '',
                type: 'select',
                required: true,
                option: () => this.storeDict['product_type'],
            }, {
                label: '工艺序号',
                prop: 'serialNumber',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        let reg =  /^[1-9]\d*$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正整数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }],
            dialogFormSon: [{
                label: '工作中心编码',
                prop: 'workCenterCode',
                value: '',
                readonly: true,
                placeholder: '请选择工作中心名称',
                required: true,
            }, {
                prop: 'workCenterName',
                value: '',
                slot: 'workCenterName',
            }, {
                label: '工时类型',
                prop: 'workingHoursType',
                value: '',
                type: 'select',
                option: dict.workingHoursType
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }],
            tableColumnWork: [{
                label: '工作中心编码',
                prop: 'workCenterCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            // {
            //     label: '部门编码',
            //     prop: 'departmentCode',
            //     showOverflowTooltip: true,
            // }, {
            //     label: '部门名称',
            //     prop: 'deptName',
            //     showOverflowTooltip: true,
            // }, {
            //     label: '当前状态',
            //     prop: 'isEffective',
            //     showOverflowTooltip: true,
            //     formatter(row, column, cell) {
            //         return dict.productionStats[cell];
            //     },
            // }, {
            //     label: '工时类型',
            //     prop: 'workingHoursType',
            //     showOverflowTooltip: true,
            //     formatter(row, column, cell) {
            //         return dict.workingHoursType[cell];
            //     },
            // },
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            pageSize_down: 20,
            currentPage_down: 1,
            pageTotal_down: 0,
            currentRowKeyParent: '',
            dialogParent: '',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            processCode: '',
            row: [],
            workCenter: '',
            routeCode: '',
            searchVisible: true,
            searchForm: [{
                label: '工艺编码',
                prop: 'processCode',
                value: '',
            }, {
                label: '工艺名称',
                prop: 'processName',
                value: '',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'prodplan_ppprocess_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-edit',
                permi: 'prodplan_ppprocess_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-delete',
                permi: 'prodplan_ppprocess_dels',
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
                permi: 'devicemanager_workcenter_edit',
                disabled: () => !this.currentRowKeyParent,
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-delete',
                permi: 'devicemanager_workcenter_edit',
            }],
            dialogSearchForm: {},
            topCancel: null,
            bottomCancel: null,
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
    },
    activated() {
        this.getDataParent();
        this.currentRowKeyParent = '';
        this.tableDataSon = [];
    },
    mounted() {
        this.queryDict('product_type').then(() => {
            this.getDataParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        searchParent() {
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
            this.getDataParent();
        },
        getDataParent() {
            this.tableLoadingTop = true;
            this.topCancel && this.topCancel();
            this.$http.get('/productionplan/ppprocess/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
                cancelToken: new CancelToken(c => {
                    this.topCancel = c;
                }),
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
                this.topCancel = null;
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        getDataSon() {
            this.tableLoadingDown = true;
            this.currentRowKeySon = '';
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (item) {
                this.processCode = item.processCode;
            }
            this.bottomCancel && this.bottomCancel();
            this.$http.get('/basicdata/workcenter/page', {
                params: {
                    current: this.currentPage_down,
                    size: this.pageSize_down,
                    conditionList: [{
                        fieldName: 'processCode',
                        operation: 'EQ',
                        value: this.processCode
                    }]
                },
                cancelToken: new CancelToken(c => {
                    this.bottomCancel = c;
                }),
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data.records;
                this.pageTotal_down = res.data.total;
                this.bottomCancel = null;
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
        changeCurrent_down(val) {
            this.currentPage_down = val;
            this.getDataSon();
        },
        changeSize_down(val) {
            this.pageSize_down = val;
            this.currentPage_down = 1;
            this.getDataSon();
        },
        newRowParent() {
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
        },
        editRowParent() {
            this.dialogParent = 'edit';
            this.$http.get(`/productionplan/ppprocess/getById/${this.currentRowKeyParent}`).then(res => {
                this.List = res.data;
                this.dialogFormParent.forEach(v => {
                    v.value = this.List[v.prop];
                    this.dialogVisibleParent = true;
                });
            });
        },
        delRowParent() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/productionplan/ppprocess/removeByIds', {
                    data: [this.currentRowKeyParent]
                }).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeyParent = '';
                }).catch(() => {
                    this.submitLoading = false;
                });
            });
        },
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                if (v.prop === 'serialNumber') {
                    obj[v.prop] = Number(v.value);
                } else {
                    obj[v.prop] = v.value;
                }
            });
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$http.post('/productionplan/ppprocess/save', obj).then(() => {
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
                this.$http.put('/productionplan/ppprocess/updateById', obj).then(() => {
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
            this.dialogSon = 'new';
            // this.dialogVisibleSon = true;
            this.dialogVisibleWork = true;
            this.dialogSearchForm = {};
            this.getWorkcenter();
        },
        // 获取工作中心列表
        // getWorkcenter() {
        //     return this.$http.get(`/productionplan/workcenter/getWorkCenter/${this.processCode}`).then(res => {
        //         let item = this.dialogFormSon.find(v => v.prop === 'workCenterName');
        //         this.list = res.data;
        //         const filterData = _.differenceBy(res.data, this.tableDataSon, 'workCenterCode');
        //         let obj = {};
        //         filterData.forEach(v => {
        //             obj[v.workCenterCode] = v.workCenterName;
        //         });
        //         // item.option = () => obj;
        //     });
        // },
        delRowSon() {
            // this.$confirm('是否确认删除?', '提示', {
            //     type: 'warning'
            // }).then(() => {
            //     this.submitLoading = true;
            //     this.$http.delete('/productionplan/ppworkcenterpriority/removeByIds', {
            //         data: [this.currentRowKeySon]
            //     }).then(() => {
            //         this.getDataSon();
            //         this.submitLoading = false;
            //         this.$message({
            //             message: '删除成功!',
            //             type: 'success'
            //         });
            //         this.currentRowKeySon = '';
            //     }).catch(() => {
            //         this.submitLoading = false;
            //     });
            // });
            this.dialogSon = 'delete';
            this.submitFormWork();
        },
        submitFormSon() {
            let obj = {};
            const finish = () => {
                this.getDataSon();
                this.dialogVisibleSon = false;
                this.submitLoading = false;
            };
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogSon === 'new') {
                obj.processCode = this.processCode;
                this.$http.post('/productionplan/ppworkcenterpriority/save', obj).then(() => {
                    finish();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKeySon;
                this.$http.put('/productionplan/ppworkcenterpriority/updateById', obj).then(() => {
                    finish();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 升序
        ascending() {
            this.tableLoadingDown = true;
            this.$http.post('/productionplan/ppworkcenterpriority/updatePriorityAsc', null, {
                params: {
                    flag: 'ASC',
                    id: this.currentRowKeySon
                }
            }).then(() => {
                this.getDataSon();
            });
            this.tableLoadingDown = false;
        },
        // 降序
        descending() {
            this.tableLoadingDown = true;
            this.$http.post('/productionplan/ppworkcenterpriority/updatePriorityAsc', null, {
                params: {
                    flag: 'DESC',
                    id: this.currentRowKeySon
                }
            }).then(() => {
                this.getDataSon();
            });
            this.tableLoadingDown = false;
        },
        // 工作中心列表展示
        getWorkcenter(val = 1) {
            this.dialogVisibleWork = true;
            const params = {
                current: val,
                size: this.pageSizeC,
            };
            params.conditionList = [{
                fieldName: 'processCode',
                // value: '',
                operation: 'ISNULL'
            }];
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
            this.$http.get(`/basicdata/workcenter/page`, {
                params,
            }).then(res => {
                this.tableDataWork = res.data.records;
                this.pageTotalC = res.data.total;
                this.currentPageC = val;
            });
        },
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getWorkcenter();
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
        // 列表确定
        submitFormWork() {
            // this.dialogFormSon.forEach(v => {
            //     v.value = this.row[v.prop];
            // });
            if (this.dialogSon === 'new') {
                const obj = this.tableDataWork.find(v => v.id === this.currentRowKeyWorkCenter);
                delete obj.tenantId;
                obj.processCode = this.processCode;
                this.$http.put('/basicdata/workcenter/updateById', obj).then(() => {
                    this.getDataSon();
                    this.dialogVisibleWork = false;
                    this.submitLoading = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
                item.processCode = null;
                this.$http.put('/basicdata/workcenter/updateById', item).then(() => {
                    this.getDataSon();
                    this.dialogVisibleWork = false;
                    this.submitLoading = false;
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 列表选择
        selectionGetWorkCenter(row) {
            this.row = row;
        },
        // 弹表分页
        changeCurrentC(val) {
            this.getWorkcenter(val);
        },
        changeSizeC(val) {
            this.pageSizeC = val;
            this.currentPageC = 1;
            this.getWorkcenter();
        },
    }
};
</script>

<style scoped lang="stylus">
.processInformation
    & >>> .dialog-table
        .el-dialog
            margin-top 6vh!important

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
