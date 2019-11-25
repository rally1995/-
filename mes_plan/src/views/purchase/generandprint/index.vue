<template lang="pug">
    ebrain-main.print
        ebrain-frame(title="【收料凭证】标签和定盘列表")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchData"
                        @reset="reset")
            template(#table)
                ebrain-table(
                    :tableLoading="tableLoading"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    @changeCurrent="changeCurrent"
                    @changeSize="changeSize"
                    @selection-change= "hanleSelect"
                    row-key="summaryId"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-dialog.tagWidth(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
            ebrain-frame(title="明细项目")
                template(#tools)
                    ebrain-tools(:buttons="btnsDown")
                    .search(
                        :class="{hide:searchVisibleSon}")
                        ebrain-search(
                            :form="searchFormSon"
                            @search="getDataSon"
                            @reset="resetSon")
                template(#table)
                    ebrain-table(
                        :isShow="false"
                        :tableLoading="tableLoadingDown"
                        :data="tableDataSon"
                        :column="tableColumnSon"
                        row-key="summaryId"
                        @changeCurrent="changeCurrent_down"
                        @changeSize="changeSize_down"
                        @selection-change= "hanleSelectSon"
                        :pageSize="pageSize_down"
                        :currentPage="currentPage_down"
                        :pageTotal="pageTotal_down"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeySon")
                        template(#tagCode)
                            el-table-column(
                                prop="tagCode"
                                label="标签")
                                    template(v-slot="{row}")
                                        ul.tableMultiCell
                                            li(v-for="tagCode in row.tagDetDatas") {{tagCode.tagCode}}
                        template(#tagQuantity)
                            el-table-column(
                                prop="tagQuantity"
                                label="标签对应实收数量")
                                    template(v-slot="{row}")
                                        ul.tableMultiCell
                                            li(v-for="tagQuantity in row.tagDetDatas") {{tagQuantity.tagQuantity}}
                        //- template(#bindingTrayCode)
                        //-     el-table-column(
                        //-         prop="bindingTrayCode"
                        //-         label="绑定托盘号")
                        //-             template(v-slot="{row}")
                        //-                 ul.tableMultiCell
                        //-                     li(v-for="bindingTrayCode in row.tagDetDatas") {{bindingTrayCode.bindingTrayCode}}
        ebrain-dialog.tagWidth2(
            :submitLoading="submitBreakLoading"
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
            template(#tagQuantity="{value}")
                el-form(@submit.native.prevent="create")
                    el-col(:span="20")
                        el-form-item(label-width="140px" label="每个lot号拆分标签数" )
                            el-input(style="width:240px" :value="value" v-model="ntLotTag" require="true")
                            el-button(style="margin-left: 20px" @click="create") 生成
            ebrain-frame(title="明细项目")
                template(#table)
                    ebrain-table(
                        :isShow= "false"
                        :tableLoading="tableLoadingDown"
                        :data="tableDataDialog"
                        :column="dialogTableSon"
                        row-key="certDetId"
                        @changeCurrent="changeCurrent_down"
                        @changeSize="changeSize_down"
                        :pageSize="pageSize_down"
                        :currentPage="currentPage_down"
                        :pageTotal="pageTotal_down"
                        highlight-current-row
                        :current-row-key.sync="currentRowKeyDialog")
                        template(#tagCode)
                            el-table-column(
                                prop="tagCode"
                                label="标签")
                                    template(v-slot="{row}")
                                        ul.tableMultiCell
                                            li(v-for="tagCode in row.tagDetDatas") {{tagCode.tagCode}}
                        template(#tagQuantity)
                            el-table-column(
                                prop="tagQuantity"
                                label="标签对应实收数量")
                                    template(v-slot="{row, _idex}")
                                        ul.tableMultiCell
                                            li-item(
                                                v-for="(tagQuantity, $index) in row.tagDetDatas"
                                                :key="$index"
                                                :quantity="tagQuantity"
                                                :index="$index"
                                                @change="hanleChange"
                                                @lossblur="hanleChange")
        ebrain-tag-dialog(
            :visible.sync="dialogVisibleCard"
            :title="title"
            :submitLoading="subTagLoading"
            @submit="submitTag")
            span(v-if="tagType") 每个南通LOT号将对应一个标签，本次共生成{{createTotal}}个标签，请确认
            span(v-else) 本次将打印采购收料凭证号（{{prCertificateCode}}）的采购收货计划号（{{prPlanCode}}）标签，共 {{printTotal}}个，请确认
            div.error(v-if="dialogType === '' && !tagType")
                el-form
                    el-form-item(label="选择打印机" required)
                        el-select(v-model="devicePrint")
                            el-option(
                                v-for="(option, optionKey) in storeDict['DERIVCE_PRINT']"
                                :label="option"
                                :value="optionKey"
                                :key="option")
                    el-form-item(label="标签规格大小" required)
                        el-select(v-model="devicePrintSize")
                            el-option(
                                v-for="(option, optionKey) in storeDict['PRINT_TAG_SIZE']"
                                :label="option"
                                :value="optionKey"
                                :key="option")
        ebrain-dialog.pallent(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisiblePallent"
            :isCancel="false"
            :isShow="false"
            @submit="dialogVisiblePallent = false")
            pallent-storage(:tableForm="pallenetData" :tav="dialogVisiblePallent" @ee="getDataParent")
        ebrain-dialog-table(
            height="50vh"
            :visible.sync="dialogFormPrint"
            :isShow="false"
            :tableLoading="tableLoadingDown"
            :data="tableDataSon"
            :column="printColumnSon"
            row-key="certDetId"
            @changeCurrent="changeCurrent_down"
            @changeSize="changeSize_down"
            @select= "handlerPrint"
            :pageSize="pageSize_down"
            :currentPage="currentPage_down"
            :pageTotal="pageTotal_down"
            :disabled="tableDataSon.length === 0"
            :highlight-current-row="false"
            @submit="printTag")
            template(#tagCode)
                el-table-column(
                    prop="tagCode"
                    label="标签")
                        template(v-slot="{row}")
                            ul.tableMultiCell
                                li(v-for="tagCode in row.tagDetDatas") {{tagCode.tagCode}}
            template(#tagQuantity)
                el-table-column(
                    prop="tagQuantity"
                    label="标签对应实收数量")
                        template(v-slot="{row}")
                            ul.tableMultiCell
                                li(v-for="tagQuantity in row.tagDetDatas") {{tagQuantity.tagQuantity}}
            //- template(#bindingTrayCode)
            //-     el-table-column(
            //-         prop="bindingTrayCode"
            //-         label="绑定托盘号")
            //-             template(v-slot="{row}")
            //-                 ul.tableMultiCell
            //-                     li(v-for="bindingTrayCode in row.tagDetDatas") {{bindingTrayCode.bindingTrayCode}}
</template>

<script>
import dict from '@/utils/dict';
import { mapActions, mapState } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import EbrainTagDialog from '@/components/EbrainTagDialog';
import liItem from './liItem';
import pallentStorage  from './pallentStorage';
export default {
    name: 'index',
    components: {
        EbrainDialogTable,
        EbrainTagDialog,
        liItem,
        pallentStorage,
    },
    data() {
        return {
            devicePrintSize: '100*200',
            PrintData: [],
            selectPrint: [],
            submitLoading: false,
            submitBreakLoading: false,
            title: '',
            tagType: '',
            selection: '',
            isVak: false,
            quantity: 0,
            numberInput: 0,
            idx: '',
            subTagLoading: false,
            dialogVisibleCard: false,
            conditionList: [],
            ntLotTag: '',
            createTotal: '',
            dialogVisibleCardSon: false,
            tableLoading: false,
            dialogVisiblePallent: false,
            tableLoadingDown: false,
            dialogVisibleSon: false,
            currentRowKeyDialog: '',
            pageSize_down: 20,
            dialogVisibleMa: true,
            currentPage_down: 1,
            prCertificateCode: '',
            printTotal: 0,
            prPlanCode: '',
            DialogTable: '',
            tableDataSon: [],
            tableDataDialog: [],
            uploadList: [],
            mulitiptionSon: [],
            tableDataParent: [],
            pallenetData: {},
            List: [],
            spanArr: [],
            spanArrSon: [],
            devicePrint: '',
            pos: 0,
            posSon: 0,
            mulitiption: [],
            titleData: [{
                tag: '标签',
                number: '实收数量',
                pallentId: '绑定托盘号'
            }],
            tableColumnParent: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '采购收料凭证号',
                prop: 'prCertificateCode',
                showOverflowTooltip: true,
                width: 150,
                minWidth: 150,
            }, {
                label: '采购收货计划号',
                prop: 'prPlanCode',
                showOverflowTooltip: true,
                width: 180,
                minWidth: 180,
            }, {
                label: '采购订单号',
                prop: 'ebeln',
                showOverflowTooltip: true,
                width: 120,
                minWidth: 120,
            }, {
                label: '项目号',
                prop: 'ebelp',
                showOverflowTooltip: true,
            }, {
                label: '料号',
                prop: 'matnr',
                showOverflowTooltip: true,
                width: 120,
                minWidth: 120,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                width: 120,
                minWidth: 120,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'documentStatus',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.print_documentStatus[cell];
                },
            }, {
                label: '打印次数',
                prop: 'printNum',
                showOverflowTooltip: true,
            }, {
                label: '实收数量',
                prop: 'actualQuantity',
                showOverflowTooltip: true,
            }, {
                label: '批号汇总数',
                prop: 'summaryQuantity',
                showOverflowTooltip: true,
            }, {
                label: '标签数量',
                prop: 'tagNumber',
                showOverflowTooltip: true,
            }, {
                label: 'IQC检验申请单号',
                prop: 'iqcApplyCode',
                showOverflowTooltip: true,
                width: 180,
                minWidth: 180,
            }],
            tableColumnSon: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '物料编码',
                prop: 'matnr',
                showOverflowTooltip: true,
                width: 120,
                minWidth: 120,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                width: 120,
                minWidth: 120,
            }, {
                label: '南通LOT号',
                prop: 'ntLot',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }, {
                label: '实收数量',
                prop: 'actualQuantity',
                showOverflowTooltip: true,
            }, {
                // label: '标签',
                // prop: 'tagCode',
                // showOverflowTooltip: true,
                slot: 'tagCode'
            }, {
                // label: '标签对应实收数量',
                // prop: 'tagQuantity',
                // showOverflowTooltip: true,
                slot: 'tagQuantity',
            }, {
                // label: '绑定托盘号',
                // prop: 'bindingTrayCode',
                // showOverflowTooltip: true,
                slot: 'bindingTrayCode'
            }],
            printColumnSon: [{
                label: '收料凭证号',
                prop: 'prCertificateCode',
                showOverflowTooltip: true,
                width: 150,
                minWidth: 150,
            }, {
                label: '物料编码',
                prop: 'matnr',
                showOverflowTooltip: true,
                width: 120,
                minWidth: 120,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                width: 120,
                minWidth: 120,
            }, {
                label: '南通LOT号',
                prop: 'ntLot',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }, {
                label: '实收数量',
                prop: 'actualQuantity',
                showOverflowTooltip: true,
            }, {
                // label: '标签',
                // prop: 'tagCode',
                // showOverflowTooltip: true,
                slot: 'tagCode'
            }, {
                // label: '标签对应实收数量',
                // prop: 'tagQuantity',
                // showOverflowTooltip: true,
                slot: 'tagQuantity',
            }, {
                // label: '绑定托盘号',
                // prop: 'bindingTrayCode',
                // showOverflowTooltip: true,
                slot: 'bindingTrayCode'
            }],
            dialogFormPrint: false,
            dialogFormParent: [{
                label: '收货计划号',
                prop: 'prPlanCode',
                value: '',
                disabled: true,
            }, {
                label: '收料凭证号',
                prop: 'prCertificateCode',
                disabled: true,
                value: '',
            }, {
                label: '物料编号',
                prop: 'matnr',
                disabled: true,
                value: '',
            }, {
                label: '物料名称',
                prop: 'materialName',
                disabled: true,
                value: '',
            }, {
                label: 'SAP采购订单',
                prop: 'ebeln',
                disabled: true,
                value: '',
            }, {
                label: '单据状态',
                prop: 'documentStatus',
                value: '',
                disabled: true,
                type: 'select',
                option: dict.print_documentStatus,
                required: true,
            }, {
                label: '供应商名称',
                prop: 'sortl',
                value: '',
                disabled: true,
            }, {
                label: '供应商编号',
                prop: 'lifnr',
                disabled: true,
                value: '',
            }, {
                label: '送货单号',
                prop: 'deliveryCode',
                value: '',
                disabled: true,
            }, {
                label: '南通LOT个数',
                prop: 'ntLotNumber',
                value: '',
                disabled: true,
            }, {
                label: '标签数',
                prop: 'tagNumber',
                value: '',
                disabled: true,
            }],
            dialogFormSon: [{
                slot: 'tagQuantity',
                prop: 'ntLotTag',
                value: '',
            }],
            dialogTableSon: [{
                label: '物料编码',
                prop: 'matnr',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                width: 120,
                minWidth: 120,
            }, {
                label: '南通LOT号',
                prop: 'ntLot',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'stockUnit',
                showOverflowTooltip: true,
            }, {
                label: '实收数量',
                prop: 'actualQuantity',
                showOverflowTooltip: true,
            }, {
                label: '标签',
                prop: 'tagCode',
                showOverflowTooltip: true,
                slot: 'tagCode',
                editable: true,
            }, {
                label: '标签对应实收数量',
                prop: 'tagQuantity',
                showOverflowTooltip: true,
                slot: 'tagQuantity',
                editable: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            pageTotal_down: 0,
            currentRowKeyParent: '',
            currentRowKeySon: '',
            searchVisible: true,
            searchVisibleSon: true,
            dialogParent: '',
            dialogVisibleParent: false,
            isClick: false,
            qrData: [],
            dialogType: '',
            btnsTop: [{
                label: '生成标签',
                click: () => this.createTag(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-details',
                permi: 'purchase_prtag_create_tags',
            }, {
                label: '标签管理',
                click: () => this.TagManage(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont icondate',
                permi: false,
            }, {
                label: '打印标签',
                click: () => this.openTag(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-Printing',
                permi: 'purchase_prtag_print_tags',
            }, {
                label: '定盘入库',
                click: () => this.stareTreasury(),
                className: 'iconfont iconstatus-bar-code-scanning-gun',
                disabled: () => !this.currentRowKeyParent,
                permi: 'purchase_prtag_fix_in_warehoue',
            }, {
                label: '导出列表',
                click: () => this.exportAll(),
                // disabled: () => this.writeOffDisabled,
                className: 'iconfont iconstatus-export',
                permi: 'purchase_prtag_export_all',
            }, {
                label: '高仓退货',
                click: () => this.hightWare(),
                disabled: () => this.writeOffDisabled,
                className: 'iconfont icontally_packing',
                permi: 'purchase_prtag_high_return_warehoue',
            }, {
                label: '不合格注销',
                click: () => this.writeOff(),
                disabled: () => this.writeOffDisabled,
                className: 'iconfont iconstatus-Submission-',
                permi: 'purchase_prtag_cancel',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsDown: [{
                label: '生成/拆分标签',
                click: () => this.breakTagSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-copy',
                permi: 'purchase_prtag_confirm_split_tag',
            }, {
                label: '搜索',
                click: () => { this.searchVisibleSon = !this.searchVisibleSon },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            searchForm: [{
                label: '采购收料凭证号',
                prop: 'prCertificateCode',
                value: '',
            }, {
                label: '采购收货计划号',
                prop: 'prPlanCode',
                value: '',
            }, {
                label: '采购订单号',
                prop: 'ebeln',
                value: '',
            }, {
                label: '采购项目号',
                prop: 'ebelp',
                value: '',
            }, {
                label: '料号',
                prop: 'matnr',
                value: '',
            }],
            searchFormSon: [{
                label: '物料编码',
                prop: 'matnr',
                value: '',
            }, {
                label: '物料名称',
                prop: 'materialName',
                value: '',
            }],
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        creatDisabled() {
            const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            return !this.currentRowKeyParent || !item || (item && (item.documentStatus !== 1 && item.documentStatus !== 0));
        },
        editDisabledParent() {
            const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            return !this.currentRowKeyParent || !item || (item && (item.documentStatus !== 1 && item.documentStatus !== 0));
        },
        delDisabledSon() {
            return this.currentRowKeySon === '';
        },
        writeOffDisabled() {
            return this.mulitiption.length === 0;
        },
        editDisabledSon() {
            const newArr = this.mulitiptionSon.map(v => v.documentStatus);
            return this.mulitiptionSon.length === 0 || (newArr.includes(0) && newArr.includes(1));
        }
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) {
                this.dialogType = '';
                this.tableDataSon = [];
            }
        },
        dialogVisibleSon(val) {
            if (!val) {
                this.ntLotTag = 0;
                this.tableDataDialog = [];
            }
        },
        dialogFormPrint(val) {
            if (!val) {
                this.tableDataSon = [];
            }
        }
    },
    mounted() {
        Promise.all([this.queryDict('product_type'), this.queryDict('DERIVCE_PRINT'), this.queryDict('PRINT_TAG_SIZE')]).then((res) => {
            this.getDataParent();
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        // 获取上表信息
        getDataParent() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            return this.$http.get('/purchase/prtag/page', { params }).then(res => {
                this.isClick = false;
                this.tableLoading = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        // 搜索列表
        searchData() {
            this.currentPage = 1;
            this.conditionList = this.searchForm.map(v => ({
                fieldName: v.prop,
                operation: 'LIKE',
                value: v.value,
                joinType: 'AND',
            }));
            this.getDataParent().then(() => {
                this.searchForm.forEach(v => {
                    if (v.value !== '') {
                        this.isClick = true;
                    }
                });
            });
        },
        // 上表分页
        changeCurrent(val) {
            this.currentPage = val;
            this.getDataParent();
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        submitFormParent() {
            this.dialogVisibleParent = false;
            this.getDataParent();
        },
        getDataSon() {
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            let params = {
                current: this.currentPage_down,
                size: this.pageSize_down,
                conditionList: [],
            };
            params.conditionList = [{
                fieldName: 'prCertificateCode',
                operation: 'EQ',
                joinType: 'AND',
                value: item.prCertificateCode,
            }, {
                fieldName: 'prPlanCode',
                operation: 'EQ',
                joinType: 'AND',
                value: item.prPlanCode,
            }];
            this.searchFormSon.forEach(v => {
                if (v.value) {
                    params.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: encodeURI(v.value),
                        joinType: 'AND',
                    });
                }
            });
            this.$http.get('/purchase/prtag/getPrTagListPage', {
                params,
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data.records;
                this.pageTotal_down = res.data.total;
            }).catch(() => {
                this.tableLoadingDown = false;
            });
        },
        // 下表分页
        changeCurrent_down(val) {
            this.currentPage_down = val;
            this.getDataSon();
        },
        changeSize_down(val) {
            this.changeSize_down = 1;
            this.pageSize_down = val;
            this.getDataSon();
        },
        createTag() {
            const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            this.tagType = true;
            this.dialogVisibleCard = true;
            this.title = '标签批量生成';
            if (this.mulitiptionSon.length === 0) {
                this.createTotal = item.summaryQuantity;
            } else {
                this.createTotal = 0;
                this.mulitiptionSon.forEach(v => {
                    this.createTotal += v.tagDetDatas.length;
                });
            }
        },
        // 打印标签
        openTag() {
            const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            if (item.documentStatus === 1 || item.documentStatus === 0) {
                this.$message.warning('标签还没生成!');
                return false;
            }
            this.dialogFormPrint = true;
            this.getDataSon();
        },
        printTag() {
            const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            this.dialogVisibleCard = true;
            this.title = '标签批量打印';
            this.tagType = false;
            this.prCertificateCode = item.prCertificateCode;
            this.prPlanCode = item.prPlanCode;
            this.printTotal = 0;
            this.tableDataSon.forEach(v => {
                this.printTotal += Number(v.tagDetDatas.length);
            });
            // this.getDataSon();
        },
        handlerPrint(select) {
            this.selectPrint = select;
        },
        hanleSelect(select) {
            this.mulitiption = select;
            this.currentRowKeyParent = '';
        },
        hanleSelectSon(select) {
            this.mulitiptionSon = select;
        },
        // 盯盘入库
        stareTreasury() {
            const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            if (item.documentStatus === 1 || item.documentStatus === 0) {
                this.$message.warning('标签未生成,不能定盘!');
                return;
            } else if (item.documentStatus === 4 || item.documentStatus === 5) {
                this.$message.warning('已注销不能定盘!');
                return;
            }
            this.pallenetData = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            // const ids = this.mulitiption.map(v => v.summaryId);
            if (item.documentStatus === 3) {
                this.dialogVisiblePallent = true;
                return;
            }
            this.dialogVisiblePallent = true;
        },
        // 标签管理
        TagManage() {
            this.dialogType = 'edit';
            this.dialogVisibleParent = true;
            this.getManage();
        },
        // 标签管理请求
        getManage() {
            const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            return this.$http.get(`/purchase/prtag/getById`, {
                params: {
                    prCertificateCode: item.prCertificateCode,
                    prPlanCode: item.prPlanCode,
                }
            }).then(res => {
                if (res.data) {
                    this.dialogFormParent.forEach(v => {
                        if (v.prop === 'documentStatus') {
                            v.value = res.data[v.prop].toString();
                        } else {
                            v.value = res.data[v.prop];
                        }
                    });
                }
                this.getDataSon();
            });
        },
        // 不合格注销
        writeOff() {
            const ids = this.mulitiption.map(v => v.summaryId);
            this.$http.post('/purchase/prtag/cancel', ids).then(res => {
                this.$message({
                    message: '注销成功!',
                    type: 'success'
                });
                this.getDataParent();
            });
        },
        // 高仓退货
        hightWare() {
            const ids = this.mulitiption.map(v => v.summaryId);
            let isBoolean = '';
            this.mulitiption.forEach(v => {
                if (v.documentStatus === 4 || v.documentStatus === 3) isBoolean = false;
                else isBoolean = true;
            });
            if (isBoolean) {
                this.$message.error('请选择不合格注销或已入库进行高仓退货');
                return;
            }
            this.$http.post('/purchase/prtag/highReturnWareHoue', ids).then(res => {
                this.$message({
                    message: '高仓退货成功!',
                    type: 'success'
                });
                this.getDataParent();
            });
        },
        // 拆分
        breakTagSon() {
            const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
            if (item.documentStatus === 1) {
                this.$message.warning('标签还没生成');
                return;
            }
            this.dialogVisibleSon = true;
            this.tableDataDialog = this.mulitiptionSon.map(v => Object.assign({}, v));
        },
        // 生成和打印提交
        submitTag() {
            this.subTagLoading = true;
            if (this.tagType) {
                // 生成传的是汇总id
                const ids =  this.mulitiptionSon.lentg !== 0 ? [this.currentRowKeyParent] : this.mulitiptionSon.map(v => v.summaryId);
                this.$http.post(`/purchase/prtag/createTags`, ids).then(({ code, data }) => {
                    if (code === 0) {
                        this.$message.success('生成标签成功');
                        this.getDataParent();
                        this.getDataSon();
                        this.dialogVisibleCard = false;
                        this.subTagLoading = false;
                    }
                }).catch(() => {
                    this.subTagLoading = false;
                });
            } else {
                this.getQrCode();
                // let routeData = this.$router.resolve({
                //     name: 'qrCode',
                //     query: {
                //         qrData: JSON.stringify([this.qrData[0]]),
                //     },
                // });
                // window.open(routeData.href, '', 'menubar-no, toolbar=no, titlebar=no, width=1093, height=540');
                // const item = this.tableDataParent.find(v => v.summaryId === this.currentRowKeyParent);
                // const params = [];
                // this.mulitiptionSon.forEach(v => {
                //     params.push({
                //         prCertificateCode: v.prCertificateCode,
                //         summaryId: v.summaryId,
                //         prPlanCode: v.prPlanCode,
                //     });
                // });
                // const ids = this.mulitiptionSon.length === 0 ? [{ prCertificateCode: item.prCertificateCode, prPlanCode: item.prPlanCode }] : params;
                // this.$http.post(`/purchase/prtag/printTags`, ids).then(({ code, data }) => {
                //     if (code === 0) {
                //         this.$message.success('打印标签成功');
                //         this.subTagLoading = false;
                //         this.getDataParent().then(() => {
                //         });
                //         this.dialogVisibleCard = false;
                //     }
                // }).catch(() => {
                //     this.subTagLoading = false;
                // });
            }
        },
        // 拆分提交
        submitFormSon() {
            const tagVo = [];
            this.submitBreakLoading = true;
            this.tableDataDialog.forEach(v => {
                tagVo.push({
                    certDetId: v.certDetId,
                    ntLot: v.ntLot,
                    summaryId: v.summaryId,
                    tagDetVos: v.tagDetDatas,
                });
            }
            );
            const params = {
                tagNumber: Number(this.ntLotTag),
                tagVo,
            };
            this.$http.post(`/purchase/prtag/confirmSplitTag`, params).then(({ code, data }) => {
                if (code === 0) {
                    this.$message.success('拆分成功');
                    this.dialogVisibleSon = false;
                    this.submitBreakLoading = false;
                    this.getManage();
                }
            }).catch(() => {
                this.submitBreakLoading = false;
            });
        },
        // 生成拆分
        create() {
            if (Number(this.ntLotTag) < 0 || Number(this.ntLotTag).toString() === 'NaN') {
                this.$confirm('输入的值不正确', '提示', {
                    type: 'warning'
                });
                return;
            }
            this.tableDataDialog.forEach(v => {
                v.tagDetDatas = [];
            });
            for (let i = 0; i < this.ntLotTag; i++) {
                this.tableDataDialog.forEach(v => v.tagDetDatas.push({
                    tagCode: v.ntLot + `-` + (v.tagDetDatas.length + 1),
                    tagQuantity: 0
                }));
            }
        },
        hanleChange(v, index) {
            const item = this.tableDataDialog.find(v => v.certDetId === this.currentRowKeyDialog);
            if (Number(v) < 0 || Number(v).toString() === 'NaN') {
                this.$message.error('请输入正确的值!');
                item.tagDetDatas[index].tagQuantity = 0;
                this.numberInput = 0;
                return;
            }
            item.tagDetDatas[index].tagQuantity = v;
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        resetSon() {
            this.searchFormSon.forEach(item => {
                item.value = '';
            });
        },
        exportAll() {
            const ids = this.mulitiption.map(v => v.summaryId);
            let params = {};
            if (this.isClick) {
                this.searchForm.forEach(v => {
                    params[v.prop] = v.value;
                });
            }
            this.$http.post(`/purchase/prtag/exportAllList`, ids, { responseType: 'blob', params }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '采购收料标签.xls';
                    $a.click();
                }
            });
        },
        // 二维码数据
        getQrCode() {
            const tableData = [...this.tableDataSon];
            tableData.forEach(v => {
                delete v.certDetId;
                delete v.summaryId;
                delete v.tagDetDatas;
                delete v.actualQuantity;
                delete v.bindingTrayCode;
                delete v.documentStatus;
                delete v.materialName;
                delete v.matnr;
                delete v.stockUnit;
                delete v.tagCode;
                delete v.tagId;
                delete v.tagNumber;
            });
            return this.$http.post(`/purchase/prtag/qrCode`, {
                size: this.devicePrintSize,
                devicePrintIp: this.devicePrint,
                datas: tableData,
                flag: 0,
            }).then(res => {
                this.$message.success('标签正在打印中,请稍后');
                this.qrData = res.data;
                this.subTagLoading = false;
                this.dialogVisibleCard = false;
                this.dialogFormPrint = false;
                this.getDataParent();
            }).catch(() => {
                this.subTagLoading = false;
            });
        }
    }
};
</script>

<style lang="stylus" scoped>
.pallent >>>
    .el-dialog
        width 1200px

.print
    & >>> .fr
        float right

.erweiMa >>>
    .el-dialog
        width 1200px
        height 800px
        .el-dialog__body
            width 1093px
            height 540px

.search
    padding 14px 10px
    background #f5f5f5
    overflow hidden
    box-sizing border-box
    transition-duration .2s
    height auto
    &.hide
        padding-top 0
        padding-bottom 0
        height 0

.upload
   display:inline-block

.tagWidth >>>
    .frame
        margin-top 20px

.dialog >>>
    .frame-tools
        .el-form-item
            display inline-block !important
        .el-form-item__content
            width auto
    .table
        height 100%

        .is-scrolling-left
            height 120px!important
            overflow-y auto

        .is-scrolling-none
            height 320px!important
            overflow-y auto

.tagWidth2 >>>
    .frame
        margin-top 20px
    .table
        height 100%
        .el-table__body-wrapper
            height 120px
            overflow-y auto

    .el-form-item__content
        width auto
        margin-left 0 !important

.error
    margin-top 10px
    .dataer
        overflow  auto
        height 64px
    ul
        margin 0
        padding 0
        li
            list-style none
            line-height 20px
            text-align center
            border 1px solid #EBEEF5
            &:not(:last-child)
                border-right none
        &:not(:last-child)
            li
                border-bottom none
    .cell
        display flex
        li
            flex 1

.tableMultiCell
    padding 0
    margin 0
    li
        // list-style none
        margin-left -10px
        margin-right -10px
        padding-left 10px
        padding-right 10px
        overflow hidden
        text-overflow ellipsis
        white-space nowrap
    li + li
        border-top 1px solid #EBEEF5
    .el-input
        height 20px
        line-height 20px
        padding: 0 10px
        & >>> .el-input__inner
            height 20px
            line-height 20px

.pallent
    & >>> .el-form.expand
        display none
    & >>> .right
        margin-top -40px
</style>
