<template lang="pug">
    ebrain-main.materialProductInfo
        ebrain-frame(
            title="物料生产信息")
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
                    :tableLoading='tableLoading'
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
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
            template(#materialCode)
                el-col(:span="12")
                    el-form-item(label="物料料号" prop="materialCode")
                        el-input(readonly=true v-model="dialogFormParent[0].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail('materielCode')")
        ebrain-dialog-table(
            dialogTableSearch
            @search="searchFormWork"
            @resetDialog="resetDialog"
            :tableLoading="dialogTableLoading"
            ref="table"
            row-key="id"
            :current-row-key.sync="currentRowKeyDialogTable"
            height="55vh"
            :data="listDetailsData"
            :column="listDetailsColumn"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleTable"
            :pageSize="pageSize_1"
            :currentPage="currentPage_1"
            :pageTotal="pageTotal_1"
            @current-change="currentChange"
            @changeCurrent="changeCurrent_1"
            @changeSize="changeSize_1"
            @submit="submitFormDialogTable")
</template>

<script>
import dict from '@/utils/dict';
import { mapActions, mapState } from 'vuex';
export default {
    name: 'workshop',
    data() {
        return {
            conditionList: [],
            dialogSearchForm: {},
            rowObj: {},
            listDetailsData: [],
            submitLoading: false,
            dialogVisibleTable: false,
            pageSize_1: 20,
            currentPage_1: 1,
            pageTotal_1: 0,
            currentRowKeyDialogTable: '',
            dialogTableLoading: false,
            tableLoading: false,
            unitsInfo: [],                  // 获取单位信息
            tableDataParent: [],            // 存储上表信息
            List: [],                       // 修改页信息
            tableColumnParent: [{           // 上表头
            //     type: 'selection',
            //     width: 35,
            // }, {
                label: '物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '长',
                prop: 'leng',
                showOverflowTooltip: true,
            }, {
                label: '宽',
                prop: 'width',
                showOverflowTooltip: true,
            }, {
                label: '高',
                prop: 'height',
                showOverflowTooltip: true,
            }, {
                label: '对角线',
                prop: 'diagonal',
                showOverflowTooltip: true,
            }, {
                label: '厚度',
                prop: 'thickNess',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '生产周期（时/PCS）',
                prop: 'productionCycle',
                showOverflowTooltip: true,
            }, {
                label: '单件管理',
                prop: 'singletonAdmin',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.whetherCrossDay[cell];
                },
            }, {
                label: '工单超开率（%）',
                prop: 'orderLimitRate',
                showOverflowTooltip: true,
            }, {
                label: '产品类型',
                prop: 'productType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['product_type'][cell];
                },
            }, {
                label: '张数（PCS）',
                prop: 'sheets',
                showOverflowTooltip: true,
            }, {
                label: '投产类型',
                prop: 'commissioningType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.commissioningType[cell];
                },
            }],
            dialogFormParent: [{            // 上表修改页信息
                label: '物料料号',
                prop: 'materialCode',
                slot: 'materialCode',
                // option: {},
                // value: '',
                // type: 'select',
                // nodeKey: 'materialCode',
                // nodeLabel: 'materialName',
                // required: true,
                // disabled: false,
                // change: val => {
                //     const row = this.unitsInfo.find(v => v.materialCode === val);
                //     this.dialogFormParent[1].value = val;
                //     this.dialogFormParent[2].value = row.leng;
                //     this.dialogFormParent[3].value = row.width;
                //     this.dialogFormParent[4].value = row.height;
                //     this.dialogFormParent[5].value = row.diagonal;
                //     this.dialogFormParent[6].value = row.thickNess;
                //     this.dialogFormParent[7].value = row.stockUnit; // 没有找到name值 先写成id
                // },
            }, {
                label: '物料名称',
                prop: 'materialName',
                disabled: true,
                value: '',
            }, {
                label: '长',
                prop: 'leng',
                disabled: true,
                value: '',
            }, {
                label: '宽',
                prop: 'width',
                disabled: true,
                value: '',
            }, {
                label: '高',
                prop: 'height',
                disabled: true,
                value: '',
            }, {
                label: '对角线',
                prop: 'diagonal',
                disabled: true,
                value: '',
            }, {
                label: '厚度',
                prop: 'thickNess',
                disabled: true,
                value: '',
            }, {
                label: '单位',
                prop: 'unitName',
                disabled: true,
                value: '',
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (value === '') {
                            callback();
                        } else if (Number(value)) {
                            if (value < 0) {
                                callback(new Error('生产周期为非负数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback(new Error('生产周期为非负数'));
                        }
                    },
                    trigger: 'blur',
                },
                label: '生产周期',
                prop: 'productionCycle',
                value: '',
                // required: true,
            }, {
                label: '是否单件管理',
                prop: 'singletonAdmin',
                value: '',
                type: 'select',
                option: dict.whetherCrossDay,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        if (value < 0 || value > 100) {
                            callback(new Error('工单超开率值为0-100'));
                        } else if (value === '') {
                            callback();
                        } else {
                            let reg =  /^\d+(\.?\d{0,4})$/;
                            if (!reg.test(value)) {
                                callback(new Error('工单超开率最多四位小数'));
                            } else {
                                callback();
                            }
                        }
                    },
                    trigger: 'blur',
                },
                label: '工单超开率(%)',
                prop: 'orderLimitRate',
                value: '',
            }, {
                label: '产品类型',
                prop: 'productType',
                value: '',
                type: 'select',
                option: () => this.storeDict['product_type'],
                required: true,
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^(0|[1-9][0-9]*)$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('张数值为正整数或0'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '张数（PCS）',
                prop: 'sheets',
                value: '',
            }, {
                label: '投产类型',
                prop: 'commissioningType',
                value: '',
                type: 'select',
                option: dict.commissioningType,
            }],
            listDetailsColumn: [{
                label: '物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '料号名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '长',
                prop: 'leng',
                showOverflowTooltip: true,
            }, {
                label: '宽',
                prop: 'width',
                showOverflowTooltip: true,
            }, {
                label: '高',
                prop: 'height',
                showOverflowTooltip: true,
            }, {
                label: '对角线',
                prop: 'diagonal',
                showOverflowTooltip: true,
            }, {
                label: '厚度',
                prop: 'thickNess',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKeyParent: '',
            dialogParent: '',
            dialogVisibleParent: false,
            routeCode: '',
            searchVisible: true,
            searchForm: [{
                label: '物料编码',
                prop: 'materialCode',
                value: ''
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionplan_ppmaterial_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledParent,
                permi: 'productionplan_ppmaterial_edit'
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.editDisabledParent,
                permi: 'productionplan_ppmaterial_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
    },
    mounted() {
        this.queryDict('product_type');
        this.getDataParent();
    },
    methods: {
        ...mapActions(['queryDict']),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        // // 获取物料信息
        // getMterialsInfo() {
        //     this.$http.get('/productionplan/ppmaterial/getDicBasicMaterialFilter').then(res => {
        //         let obj = {};
        //         const item = this.dialogFormParent.find(v => v.prop === 'materialName');
        //         res.data.forEach((item, index) => {
        //             obj[item.materialCode] = item.materialName;
        //         });
        //         item.option = obj;
        //         this.unitsInfo = res.data;
        //     });
        // },
        searchParent() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    this.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'OR',
                    });
                }
            });
            this.currentPage = 1;
            this.getDataParent();
        },
        // 获取上表信息
        getDataParent() {
            this.tableLoading = true;
            this.$http.get('/productionplan/ppmaterial/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableLoading = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        // 页码
        changeCurrent(val) {
            this.currentPage = val;
            this.getDataParent();
        },
        // 改变上表页面数据数时获取的数据
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        // 上表新增页面
        newRowParent() {
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
            // this.getMterialsInfo();
            this.dialogFormParent[0].disabled = false;
            this.dialogFormParent[8].value = 0;
            this.dialogFormParent[9].value = '0';
            this.dialogFormParent[10].value = 0;
            this.dialogFormParent[12].value = 0;
            this.dialogFormParent[13].value = '1';
        },
        // 上表修改页面
        editRowParent() {
            this.dialogParent = 'edit';
            this.submitLoading = false;
            this.dialogFormParent[0].disabled = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
            // this.dialogFormParent[5].value = this.dialogFormParent[5].value;
            this.dialogVisibleParent = true;
        },
        // 删除上表数据
        delRowParent() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/productionplan/ppmaterial/removeByIds', {
                    data: [this.currentRowKeyParent],
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
        // 提交上表新增或者修改数据
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            let copyObj = { ...obj };         // 拷贝obj 删除多余的请求字段
            delete copyObj.materialName;
            delete copyObj.spec;
            delete copyObj.stockUnitId;
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$http.post('/productionplan/ppmaterial/save', copyObj).then(() => {
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
                copyObj.id = this.currentRowKeyParent;
                this.$http.put('/productionplan/ppmaterial/updateById', copyObj).then(() => {
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
        currentChange(row) {
            this.rowObj = row;
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
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.getmaterielCodeInfo();
        },
        // 获取料号
        getmaterielCodeInfo(val = 1) {
            this.dialogTableLoading = true;
            const obj = {
                page: {
                    current: val,
                    size: this.pageSize_1,
                },
                conditions: {
                    conditionList: []
                }
            };
            if (this.dialogSearchForm) {
                for (let i in this.dialogSearchForm) {
                    if (Object.prototype.hasOwnProperty.call(this.dialogSearchForm, i)) {
                        if (this.dialogSearchForm[i]) {
                            obj.conditions.conditionList.push({
                                fieldName: i,
                                value: this.dialogSearchForm[i],
                                operation: 'LIKE',
                                joinType: 'AND',
                            });
                        }
                    }
                }
            }
            this.$http.post('/productionplan/ppmaterial/getDicBasicMaterialFilter', obj).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_1 = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_1 = res.data.total;
            });
        },
        changeCurrent_1(val) {
            this.getmaterielCodeInfo(val);
        },
        changeSize_1(val) {
            this.pageSize_1 = val;
            this.currentPage_1 = 1;
            this.getmaterielCodeInfo();
        },
        submitFormDialogTable() {
            this.dialogVisibleTable = false;
            this.dialogFormParent[0].value = this.rowObj.materialCode;
            this.dialogFormParent[1].value = this.rowObj.materialName;
            this.dialogFormParent[2].value = this.rowObj.leng;
            this.dialogFormParent[3].value = this.rowObj.width;
            this.dialogFormParent[4].value = this.rowObj.height;
            this.dialogFormParent[5].value = this.rowObj.diagonal;
            this.dialogFormParent[6].value = this.rowObj.thickNess;
            this.dialogFormParent[7].value = this.rowObj.stockUnit;
        },
        enterDetail() {
            this.pageSize_1 = 20;
            this.currentPage_1 = 1;
            this.pageTotal_1 = 0;
            this.dialogSearchForm = {};
            this.dialogVisibleTable = true;
            this.getmaterielCodeInfo();
        },
    }
};
</script>

<style scoped lang="stylus">
.materialProductInfo
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
