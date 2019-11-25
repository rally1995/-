<template lang="pug">
    ebrain-main.sample_application
        ebrain-frame.halfHeight(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchTop"
                        @reset="reset")
            template(#table)
                ebrain-box-table(
                    ref="table1"
                    :loading="tableLoading"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :column="tableColumn"
                    row-key="id"
                    @page-change="ChangeCurrent"
                    @size-change="ChangeSize"
                    @selection-change="SelectChange")
        ebrain-dialog-export(
                :visible.sync="dialogVisabledExport"
                v-model="exportFilename"
                accept="xls,xlsx"
                :export-url="'/qc/fqcsamplyapply/exportCheckResultItems'"
                :params="exportIds"
                :before-export="handlerExport")
</template>
<script>
import { mapState, mapActions } from 'vuex';
import moment from 'moment';
export default {
    data() {
        return {
            searchVisible: true,
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            tableColumn: [{
                label: '检验类型',
                prop: 'checkType',
            }, {
                label: '检验来源',
                prop: 'checkSource',
                showOverflowTooltip: true,
            }, {
                label: '样品编号',
                prop: 'samplingNo',
                showOverflowTooltip: true,
            }, {
                label: '膜号/收料凭证号',
                prop: 'modelNo',
                showOverflowTooltip: true,
            }, {
                label: '批号',
                prop: 'batchNo',
                showOverflowTooltip: true,
            }, {
                label: '物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
            }, {
                label: '检验项目',
                prop: 'itemName',
                showOverflowTooltip: true,
            }, {
                label: '实测值',
                prop: 'actValue',
                showOverflowTooltip: true,
            }, {
                label: '检验结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
            }, {
                label: '检验状态',
                prop: 'checkStatus',
                showOverflowTooltip: true,
            }, {
                label: '申请单号',
                prop: 'checkCode',
                showOverflowTooltip: true,
            }, {
                label: '检验时间',
                prop: 'checkTime',
                showOverflowTooltip: true,
            }],
            btnsTop: [{
                label: '导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'qc_fqcsamplyapply_export_Items',
                disabled: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '检验类型',
                prop: 'checkType',
                value: '',
                type: 'select',
                option: {},
            }, {
                label: '样品编号',
                prop: 'samplingNo',
                value: '',
            }, {
                label: '膜号/收料凭证号',
                prop: 'modelNo',
                value: '',
            }, {
                label: '批号',
                prop: 'batchNo',
                value: '',
            }, {
                label: '物料编码',
                prop: 'materialCode',
                value: '',
            }, {
                label: '申请单号',
                prop: 'checkCode',
                value: '',
            }, {
                label: '检验时间',
                prop: 'checkTime',
                value: '',
                type: 'picker',
            }],
            selectRows: [],
            dialogVisabledExport: false,
            exportFilename: '',
            exportIds: [],
            conditionList: [],
            searchObj: {
                checkTimeStart: '',
                checkTimeEnd: '',
            }
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            sysUser: state => state.sysUser,
        })
    },
    watch: {
        dialogVisabledExport(val) {
            if (val) {
                this.exportFilename = '检验结果明细';
            }
        },
    },
    mounted() {
        Promise.all([this.queryDict('CHECK_SOURCE'), // SQC检验来源
            this.queryDict('DICT_CHECK_SOURCE'), // FQC检验来源
            this.queryDict('DIC_IQC_INSPECT_TYPE'),  // 检验类型
            this.queryDict('DICT_CHECK_RESULT'),  // FQC检验结果
            this.queryDict('BILL_QC_IQC_INSPECT_CHECK_DET_PASS'),  // IQC检验结果
            this.queryDict('DICT_CHECK_STATUS'),  // FQC检验单状态
            this.queryDict('CHECK_STATUS'), // SQC检验状态
            this.queryDict('BILL_QC_IQC_INSPECT_CHECK_STATUS'), // IQC检验状态
        ]).then(() => {
            this.searchForm[0].option = this.storeDict['DIC_IQC_INSPECT_TYPE'];
            this.searchObj.checkTimeEnd = moment(Date.now()).format('YYYY-MM-DD');
            let dd = new Date(this.searchObj.checkTimeEnd);
            this.searchObj.checkTimeStart = moment(dd.setDate(dd.getDate() - 7)).format('YYYY-MM-DD');
            this.searchForm[6].value = [this.searchObj.checkTimeStart, this.searchObj.checkTimeEnd];
            this.getData();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        searchTop() {
            this.currentPage = 1;
            this.conditionList = [];
            this.searchObj.checkTimeEnd = '';
            this.searchObj.checkTimeStart = '';
            this.searchForm.forEach(v => {
                if (v.value) {
                    if (v.prop === 'checkTime') {
                        this.searchObj.checkTimeEnd = v.value ? moment(v.value[1]).format('YYYY-MM-DD') : null;
                        this.searchObj.checkTimeStart = v.value ? moment(v.value[0]).format('YYYY-MM-DD') : null;
                    } else {
                        if (v.prop === 'checkSource' || v.prop === 'checkType') {
                            this.conditionList.push({
                                fieldName: v.prop,
                                operation: 'EQ',
                                value: v.value,
                                joinType: 'AND',
                            });
                        } else {
                            this.conditionList.push({
                                fieldName: v.prop,
                                operation: 'LIKE',
                                value: v.value,
                                joinType: 'AND',
                            });
                        }

                    }
                }
            });
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                ...this.searchObj,
                conditionList: [...this.conditionList]
            };
            this.$http.get(`/qc/fqcsamplyapply/checkResultItemPage`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        ChangeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        ChangeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        SelectChange(selection) {
            this.selectRows = selection;
        },
        exportAll() {
            this.dialogVisabledExport = true;
        },
        handlerExport(dataSetting) {
            if (dataSetting === 0) {
                this.exportIds = [];
            } else if (dataSetting === 1) {
                if (this.selectRows.length) {
                    this.exportIds = this.selectRows.map(v => v.id);
                } else {
                    this.$message.error('当前没有选中数据');
                    return false;
                }
            } else if (dataSetting === 2) {
                this.exportIds = this.tableData.map(v => v.id);
            }
        },
    }
};
</script>
<style lang="stylus" scoped>
.sample_application
    & >>> .fr
        float right;

.search
  padding 14px 10px;
  background #f5f5f5;
  overflow hidden;
  box-sizing border-box;
  transition-duration 0.2s;
  height auto;

  &.hide
    padding-top: 0;
    padding-bottom: 0;
    height 0;
.expand_toggle
    border-top 1px dashed  #EBEEF5
    border-bottom 1px dashed #EBEEF5
    height 40px
    line-height: 40px
    text-align center
    overflow hidden
    box-sizing border-box
    transition-duration .5s
    margin-bottom 20px
    .iconfont
        transition transform .25s
        display inline-block

.collapse
    .iconfont
        transform rotate(180deg)

.dialog_table
    height 30vh
</style>