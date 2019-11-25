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
                ebrain-box-table(
                    ref="parentDataTable"
                    :tableLoading='tableLoadingTop'
                    :page-size='pageSize'
                    :page-current='currentPage'
                    :page-total='pageTotal'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @page-change="changeCurrent"
                    @size-change='changeSize'
                    @selection-change="topSelectChange"
                    @current-change="currentChangeHandler"
                    row-key="id"
                    highlight-current-row)
        ebrain-frame(
            title="过账物料明细")
            template(#tools)
                ebrain-tools(:buttons="btnsBottom")
            template(#table)
                ebrain-box-table(
                    @save="save"
                    columnIndex
                    :tableLoading='tableLoadingDown'
                    :page-size='pageSize_down'
                    :page-current='currentPage_down'
                    :page-total='pageTotal_down'
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @page-change="changeCurrent_down"
                    @size-change='changeSize_down'
                    @selection-change="downSelectChange"
                    @current-change="currentChange"
                    row-key="id"
                    highlight-current-row)
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
import { mapActions, mapState } from 'vuex';
import moment from 'moment';

export default {
    name: 'index',
    data() {
        return {
            startTime: '',
            endTime: '',
            selectionDown: [],
            selectionIdsDown: [],
            orderNo: '',
            topRow: {},
            selectionIds: [],
            selectionTop: [],
            conditionList: [],
            dialogVisibleWork: false,
            submitLoading: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            tableDataParent: [],
            tableDataSon: [],
            List: [],
            tableDataWork: [],
            tableColumnParent: [{
                label: '工单号',
                prop: 'orderNo',
                showOverflowTooltip: true,
            }, {
                label: '物料编码',
                prop: 'materialNo',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '批次',
                prop: 'materialBatchNo',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'materialAmount',
                showOverflowTooltip: true,
            }, {
                label: '过账状态',
                prop: 'state',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.autoPostingStatus[cell];
                },
            }, {
                label: '凭证号',
                prop: 'sapVoucherNo',
                showOverflowTooltip: true,
            }, {
                label: '信息描述',
                prop: 'sapResult',
                showOverflowTooltip: true,
            }, {
                label: '过账时间',
                prop: 'sapTime',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                label: '成本中心',
                prop: 'costCenterNo',
                editable: true,
                showOverflowTooltip: true,
                change: (value, prop, row) => this.save(value, prop, row),
            }, {
                label: '生产版本',
                prop: 'productEdition',
                editable: true,
                showOverflowTooltip: true,
                change: (value, prop, row) => this.save(value, prop, row),
            }, {
                label: '来源单号',
                prop: 'orderNo',
                showOverflowTooltip: true,
            }, {
                label: '物料',
                prop: 'materialNo',
                showOverflowTooltip: true,
                editable: true,
                change: (value, prop, row) => this.save(value, prop, row),
            }, {
                label: '总数量',
                prop: 'materialAmount',
                showOverflowTooltip: true,
            }, {
                label: '投料数量',
                prop: 'feedAmount',
                showOverflowTooltip: true,
                editable: true,
                change: (value, prop, row) => this.save(value, prop, row),
            }, {
                label: '报废数量',
                prop: 'scrapAmount',
                showOverflowTooltip: true,
                editable: true,
                change: (value, prop, row) => this.save(value, prop, row),
            }, {
                label: '损耗数量',
                prop: 'lossAmount',
                showOverflowTooltip: true,
                editable: true,
                change: (value, prop, row) => this.save(value, prop, row),
            }, {
                label: '单位',
                prop: 'materialUnit',
                showOverflowTooltip: true,
                editable: true,
                change: (value, prop, row) => this.save(value, prop, row),
            }, {
                label: '批次',
                prop: 'materialBatchNo',
                showOverflowTooltip: true,
                editable: true,
                change: (value, prop, row) => this.save(value, prop, row),
            }, {
                label: '库存地点',
                prop: 'stockSite',
                editable: true,
                showOverflowTooltip: true,
                change: (value, prop, row) => this.save(value, prop, row),
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'][cell];
                },
                option: '',
            }, {
                label: '收/发',
                prop: 'actionType',
                editable: true,
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.actionType[cell];
                },
                change: (value, prop, row) => this.save(value, prop, row),
                option: dict.actionType
            }, {
                label: '目的仓库',
                prop: 'warehouse',
                editable: true,
                showOverflowTooltip: true,
                change: (value, prop, row) => this.save(value, prop, row),
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'][cell];
                },
                option: '',
            }, {
                label: '异动类型',
                prop: 'changeType',
                editable: true,
                change: (value, prop, row) => this.save(value, prop, row),
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.changeType[cell];
                },
                option: dict.changeType
            }],
            dialogFormParent: [{
                label: '工单编号',
                prop: 'orderNo',
                value: '',
                required: true,
            }, {
                label: '物料编号',
                prop: 'materialNo',
                value: '',
                required: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                value: '',
                required: true,
            }, {
                label: '批次',
                prop: 'materialBatchNo',
                value: '',
                required: true,
            }, {
                label: '数量',
                prop: 'materialAmount',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+(\.\d+)?$/;
                        if (value !== '') {
                            if (!reg.test(value) || !Number(value)) {
                                callback(new Error('请输入大于0的数!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            // }, {
            //     label: '状态',
            //     prop: 'state',
            //     type: 'select',
            //     value: '',
            //     disabled: true,
            //     option: dict.autoPostingStatus,
            }],
            dialogFormSon: [{
                label: '成本中心',
                prop: 'costCenterNo',
                value: '',
                required: true,
            }, {
                label: '生产版本',
                prop: 'productEdition',
                value: '',
                required: true,
            // }, {
            //     label: '来源单号',
            //     prop: 'orderNo',
            //     value: '',
            }, {
                label: '物料',
                prop: 'materialNo',
                value: '',
                required: true,
            // }, {
            //     label: '总数量',
            //     prop: 'materialAmount',
            //     value: '',
            }, {
                label: '投料数量',
                prop: 'feedAmount',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+(\.\d+)?$/;
                        if (value !== '') {
                            if (!reg.test(value) || !Number(value)) {
                                callback(new Error('请输入大于0的数!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '报废数量',
                prop: 'scrapAmount',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+(\.\d+)?$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入大于等于0的数!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '损耗数量',
                prop: 'lossAmount',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        let reg = /^[0-9]+(\.\d+)?$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入大于等于0的数!'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
            }, {
                label: '单位',
                prop: 'materialUnit',
                value: '',
                required: true,
            }, {
                label: '批次',
                prop: 'materialBatchNo',
                value: '',
                required: true,
            }, {
                label: '库存地点',
                prop: 'stockSite',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'],
            }, {
                label: '收/发',
                prop: 'actionType',
                value: '',
                required: true,
                type: 'select',
                option: () => dict.actionType
            }, {
                label: '目的仓库',
                prop: 'warehouse',
                value: '',
                type: 'select',
                option: () => this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'],
            }, {
                label: '异动类型',
                prop: 'changeType',
                value: '',
                required: true,
                type: 'select',
                option: () => dict.changeType,
            }],
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
            searchVisible: true,
            searchForm: [{
                label: '工单号',
                prop: 'orderNo',
                value: '',
            }, {
                label: '批次',
                prop: 'materialBatchNo',
                value: '',
            }, {
                label: '物料编码',
                prop: 'materialNo',
                value: '',
            }, {
                label: '过账时间',
                prop: 'sapTime',
                value: [],
                type: 'pickertime'
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'mes-production-exe_bizautoposting_add',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.selectionTop.length === 0 || !this.selectionTop.every(v => v.state === '0'),
                className: 'iconfont iconstatus-edit',
                permi: false,
            }, {
                label: '过账',
                click: () => this.posting(),
                loading: false,
                disabled: () => !(this.selectionTop.length === 1 && (this.selectionTop[0].state === '0' || this.selectionTop[0].state === '2')),
                className: 'iconfont iconPosting',
                permi: false,
            }, {
                label: '冲销',
                loading: false,
                click: () => this.destroy(),
                disabled: () => !(this.selectionTop.length === 1 && this.selectionTop[0].state === '1'),
                className: 'iconfont iconWrite-off',
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsBottom: [{
                label: '新增',
                click: () => this.newRowSon(),
                disabled: () => !this.topRow || !this.topRow.hasOwnProperty('id') || this.topRow.state !== '0',
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'mes-production-exe_bizautoposting_add',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.selectionDown.length === 0 || this.topRow.state !== '0',
                className: 'iconfont iconstatus-edit',
                permi: false,
            }],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
    },
    mounted() {
        this.queryDict('BILL_POSTING_WAREHOUSE_RESULT').then(() => {
            this.tableColumnSon[10].option = this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'];
            this.tableColumnSon[12].option = this.storeDict['BILL_POSTING_WAREHOUSE_RESULT'];
            this.getDataParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
            this.startTime = '';
            this.endTime = '';
        },
        searchParent() {
            this.conditionList = [];
            this.searchForm.forEach(v => {
                if (v.value) {
                    if (v.prop === 'sapTime' && v.value.length) {
                        this.startTime = moment(v.value[0]).format('YYYY-MM-DD HH:mm:ss');
                        this.endTime = moment(v.value[1]).format('YYYY-MM-DD HH:mm:ss');
                    } else if (v.prop === 'sapTime') {
                        this.startTime = '';
                        this.endTime = '';
                    } else {
                        this.conditionList.push({
                            fieldName: v.prop,
                            operation: 'LIKE',
                            value: v.value,
                            joinType: 'AND',
                        });
                    }
                }
            });
            this.currentPage = 1;
            this.getDataParent();
        },
        getDataParent() {
            this.tableLoadingTop = true;
            this.$http.get('/productionexe/autoposting/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                    startTime: this.startTime,
                    endTime: this.endTime,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        currentChangeHandler(row) {
            if (!row) return;
            this.topRow = row;
            this.postingId = row.id;
            this.getDataSon();
            this.tableColumnSon.forEach(item => {
                if (item.editable) {
                    item.cellDisabled = Boolean(Number(row.state));
                }
                // if (row.state !== '0') {
                //     item.editable = false;
                // } else {
                //     item.editable = true;
                // }
            });
        },
        getDataSon() {
            this.tableLoadingDown = true;
            this.currentRowKeySon = '';
            this.$http.get('/productionexe/autopostingdetail/page', {
                params: {
                    current: this.currentPage_down,
                    size: this.pageSize_down,
                    conditionList: [{
                        fieldName: 'postingId',
                        operation: 'EQ',
                        value: this.topRow['id']
                    }]
                }
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data.records;
                this.pageTotal_down = res.data.total;
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
            // this.dialogFormParent[5].value = '0';
        },
        posting() {
            this.$confirm('是否过账?', '提示', {
                type: 'warning'
            }).then(() => {
                this.btnsTop[2].loading = true;
                this.$http.get(`/productionexe/autoposting/updateState/${this.selectionTop[0].id}`).then(res => {
                    this.getDataParent();
                    this.$message({
                        message: '过账操作已执行!',
                        type: 'success'
                    });
                    this.btnsTop[2].loading = false;
                }).catch(() => {
                    this.getDataParent();
                    this.btnsTop[2].loading = false;
                });
            });
        },
        destroy() {
            this.$confirm('是否冲销?', '提示', {
                type: 'warning'
            }).then(() => {
                this.btnsTop[3].loading = true;
                this.$http.get(`/productionexe/autoposting/updateStateToReversed/${this.selectionTop[0].id}`).then(res => {
                    this.getDataParent();
                    this.$message({
                        message: '冲销成功!',
                        type: 'success'
                    });
                    this.btnsTop[3].loading = false;
                }).catch(() => {
                    this.btnsTop[3].loading = false;
                });
            });
        },
        delRowParent() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoadingTop = true;
                this.$http.delete('/productionexe/autoposting/removeByIds', {
                    data: this.selectionIds,
                }).then(() => {
                    this.tableLoadingTop = false;
                    this.getDataParent();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.tableLoadingTop = false;
                });
            });
        },
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            this.$http.post('/productionexe/autoposting/save', obj).then(() => {
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
        },
        topSelectChange(selection) {
            this.selectionTop = selection;
            this.selectionIds = selection.map(v => v.id);
        },
        newRowSon() {
            this.dialogSon = 'new';
            this.dialogVisibleSon = true;
        },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.tableLoadingDown = true;
                this.$http.delete('/productionexe/autopostingdetail/removeByIds', {
                    data: this.selectionIdsDown,
                }).then(() => {
                    this.tableLoadingDown = false;
                    this.getDataSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.tableLoadingDown = false;
                });
            });
        },
        downSelectChange(selection) {
            this.selectionDown = selection;
            this.selectionIdsDown = selection.map(v => v.id);
        },
        currentChange(row) {
            this.rowObj = row;
        },
        save(value, prop, row) {
            let obj = this.rowObj;
            if (value === '') {
                this.$message.error('输入的内容不能为空，请重新输入!');
            } else {
                if (prop === 'feedAmount' && !Number.isNaN(Number(value)) && Number(value) > 0) {
                    obj.feedAmount = value;
                    obj.materialAmount = Number(value) + Number(row.scrapAmount) + Number(row.lossAmount);
                    this.submitEdit(obj);
                } else if (prop === 'scrapAmount' && !Number.isNaN(Number(value)) && Number(value) >= 0) {
                    obj.scrapAmount = value;
                    obj.materialAmount = Number(value) + Number(row.feedAmount) + Number(row.lossAmount);
                    this.submitEdit(obj);
                } else if (prop === 'lossAmount' && !Number.isNaN(Number(value)) && Number(value) >= 0) {
                    obj.lossAmount = value;
                    obj.materialAmount = Number(value) + Number(row.feedAmount) + Number(row.scrapAmount);
                    this.submitEdit(obj);
                } else if (prop === 'costCenterNo' || prop === 'productEdition' || prop === 'materialNo' || prop === 'materialUnit' || prop === 'materialBatchNo' || prop === 'stockSite' || prop === 'actionType' || prop === 'warehouse' || prop === 'changeType') {
                    obj[prop] = value;
                    this.submitEdit(obj);
                } else {
                    this.$message.error('输入的数据格式不正确，请检查!');
                }
            }
        },
        submitEdit(obj) {
            this.submitLoading = true;
            this.$http.put('/productionexe/autopostingdetail/updateById', obj).then(() => {
                this.getDataSon();
                this.dialogVisibleSon = false;
                this.submitLoading = false;
                this.$message({
                    message: '修改成功!',
                    type: 'success'
                });
            }).catch(() => {
                this.submitLoading = false;
            });
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
            obj.materialAmount = Number(this.dialogFormSon[3].value) + Number(this.dialogFormSon[4].value) + Number(this.dialogFormSon[5].value);
            obj.postingId = this.postingId;
            obj.orderNo = this.topRow.orderNo;
            this.$http.post('/productionexe/autopostingdetail/save', obj).then(() => {
                finish();
                this.$message({
                    message: '新增成功!',
                    type: 'success'
                });
            }).catch(() => {
                this.submitLoading = false;
            });
        }
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

    & >>> .el-form-item__content
        width 150px

.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    // height 57px

    &.hide
        padding-top 0
        padding-bottom 0
        height 0

    & >>> .el-form-item
        margin-bottom 0
        width 220px
        &:nth-child(4)
            width 300px

    & >>> .el-date-editor--datetimerange
        width 200px!important
</style>
