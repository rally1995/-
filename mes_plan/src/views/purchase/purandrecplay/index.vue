<template lang="pug">
    ebrain-main.recplay
        ebrain-frame(:title="$route.name")
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
                    :default-sort = "{prop: 'prPlanCode', order: 'descending'}"
                    @changeCurrent="changeCurrent"
                    @changeSize="changeSize"
                    @selection-change= "changeHanleder"
                    @row-dblclick="editRow"
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeyParent")
                    template(#enclosure)
                        el-table-column(
                            prop="enclosure"
                            label="附件")
                                template(v-slot="{row}")
                                    a(:href="row.attachment" target="_blank") {{row.fileName}}
        ebrain-dialog.formAndTable(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormSon"
            :expandVisible="isExpand"
            :isCancel="false"
            @submit="closePaly")
            template(#search="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="SAP采购订单号")
                        el-input(style="cursor:pointer" :value="value" :readonly="true")
                            el-button(slot="append" @click="dialogSearchForm={};showProject()"  icon="iconfont iconsearch")
            div.expand_toggle(@click="toggleClick")
                i.iconfont.icondouble_pull_down
            ebrain-frame(title="明细项目")
                    template(#tools)
                        ebrain-tools(:buttons="btnsDowm")
                    template(#table)
                        ebrain-table(
                            :isShow="false"
                            :tableLoading="tableLoadingDown"
                            :data="tableDataSon"
                            :column="tableColumnSon"
                            row-key="id"
                            @selection-change= "changeHanlederSon"
                            :pageSize="pageSize_down"
                            :currentPage="currentPage_down"
                            :pageTotal="pageTotal_down"
                            highlight-current-row
                            :current-row-key.sync="currentRowKeySon")
                            template(#enclosure)
                                el-table-column(
                                    prop="enclosure"
                                    label="附件")
                                        template(v-slot="{row}")
                                            a(:href="row.attachment" ) {{row.fileName}}
        ebrain-dialog-table(
            height="500px"
            :data="tableDataProject"
            :column="tableColumnProject"
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleProject"
            :pageSize="pageSize_project"
            :currentPage="currentPage_project"
            :pageTotal="pageTotal_project"
            row-key="id"
            @changeCurrent="changeCurrent_project"
            @changeSize="changeSize_project"
            @submit="submitFormProject"
            @search="searchFormWork"
            @resetDialog="resetDialog"
            dialogTableSearch
            :current-row-key.sync="currentRowKeyProject")
        ebrain-dialog(
            :submitLoading="submitLoading"
            :visible.sync="dialogVisibleFormSon"
            :form.sync="detailDialogForm"
            @submit="submitFormParent")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件")
                        ebrain-upload.upload(
                            :file-list="uploadList"
                            :limit="1"
                            action="/purchase/prplandet/upload"
                            :on-change="uploadChangeHandler"
                            list-type="text"
                            :on-remove="removeChangeHandler"
                            :on-preview="previewChangeHandler")
                            el-button(type="primary") 上传附件
</template>

<script>
import _ from 'lodash';
import dict from '@/utils/dict';
import { mapActions, mapState } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';
export default {
    name: 'index',
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            form: {
                ebelp: '',
                sapMaterialCode: '',
                sapMaterialName: '',
                prPlanCode: '',
                startTime: '',
                endTime: '',
            },
            searchForm: [{
                label: '采购订单号',
                prop: 'ebeln',
                value: '',
            }, {
                label: '项目号',
                prop: 'ebelp',
                value: '',
            }, {
                label: '收货计划号',
                prop: 'prPlanCode',
                value: '',
            }, {
                label: 'SAP物料编码',
                prop: 'sapMaterialCode',
                value: '',
            }, {
                label: 'SAP物料名称',
                prop: 'sapMaterialName',
                value: '',
            }, {
                label: '预计交货时间',
                prop: 'dueTime',
                value: '',
                type: 'picker'
            }],
            searchTableForm: [{
                label: 'SAP订单号',
                prop: 'ebeln',
                value: '',
            }, {
                label: 'SAP项目号',
                prop: 'ebelp',
                value: '',
            }],
            isExpand: false,
            isClick: false,
            searchVisible: true,
            submitLoading: false,
            dialogVisibleEdit: false,
            dialogVisibleFormSon: false,
            selection: [],
            projectDisabled: true,
            selectionSon: [],
            tableLoading: false,
            tableLoadingDown: false,
            dialogVisibleSon: false,
            pageSize_down: 20,
            currentPage_down: 1,
            pageSize_project: 20,
            currentPage_project: 1,
            pageTotal_project: 0,
            currentRowKeyForm: '',
            dialogVisibleProject: false,
            formType: '',
            currentRowKeyProject: '',
            List: [],
            tableDataSon: [],
            tableDataDialog: [],
            tableDataProject: [],
            dialogSearchForm: {},
            uploadList: [],
            unitsInfo: [],                  // 获取单位信息
            tableDataParent: [],            // 存储上表信息
            tableColumnParent: [{           // 上表头
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '采购订单号',
                prop: 'ebeln',
                showOverflowTooltip: true,
                width: 120,
            }, {
                label: '项目号',
                prop: 'ebelp',
                showOverflowTooltip: true,
            }, {
                label: '收货计划号',
                prop: 'prPlanCode',
                // sortable: true,
                showOverflowTooltip: true,
                width: 220,
            }, {
                label: '工厂',
                prop: 'werks',
                showOverflowTooltip: true,
            }, {
                label: '库存地点',
                prop: 'lgort',
                showOverflowTooltip: true,
            }, {
                label: 'SAP物料编码',
                prop: 'matnr',
                showOverflowTooltip: true,
                width: 120,
            }, {
                label: 'SAP物料名称',
                prop: 'txz01',
                showOverflowTooltip: true,
                width: 120,
            }, {
                label: '采购数量(库存单位)',
                prop: 'menge1',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'meins1',
                showOverflowTooltip: true,
            }, {
                label: '计划到货数量',
                prop: 'plannedArrivalQuantity',
                showOverflowTooltip: true,
            }, {
                label: '预计交货时间',
                prop: 'dueTime',
                showOverflowTooltip: true,
                width: 150,
            }, {
                label: '供应商名称',
                prop: 'sortl',
                showOverflowTooltip: true,
            }, {
                label: '采购数量上限',
                prop: 'wfMaxAmount',
                showOverflowTooltip: true,
            }, {
                label: '采购数量下限',
                prop: 'wfMinAmount',
                showOverflowTooltip: true,
            }, {
                // label: '附件',
                // prop: 'attachment',
                // showOverflowTooltip: true,
                slot: 'enclosure'
            }, {
                label: '收货凭证号',
                prop: 'prCertificateCode',
                showOverflowTooltip: true,
            }, {
                label: '一般贸易',
                prop: 'generalTradeCode',
                showOverflowTooltip: true,
            }, {
                label: '实际到厂时间',
                prop: 'actuallyTime',
                showOverflowTooltip: true,
                width: 150,
            }, {
                label: '车牌号',
                prop: 'carNumber',
                showOverflowTooltip: true,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.purchase_roofStatus[cell];
                },
            }],
            btnsTop: [{
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledParent,
                permi: 'purchase_prplandet_edit',
            }, {
                label: '导出列表',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'purchase_prplandet_exportall',
            }, {
                label: '上传附件',
                className: 'iconfont iconstatus-download',
                permi: false,
                action: `/purchase/prplandet/upload`,
                disabled: () => this.editDisabledParent,
                onSuccess: (response, file, fileList) => this.successFile(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            btnsDowm: [{
                label: '新增',
                click: () => this.newRowSonForm(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'purchase_prplandet_add',
                disabled: () => this.addDisabledDialog,
            }, {
                label: '修改',
                click: () => this.editRowSonFrom(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledSon,
                permi: 'purchase_prplandet_edit',
            }, {
                label: '删除',
                click: () => this.delRowSonFrom(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabledSon,
                permi: 'purchase_prplandet_dels',
            }],
            // 下表头
            tableColumnSon: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '采购收货计划号',
                prop: 'prPlanCode',
                showOverflowTooltip: true,
                width: 220,
            }, {
                label: '预计交货时间',
                prop: 'dueTime',
                showOverflowTooltip: true,
                width: 150
            }, {
                label: '库存单位',
                prop: 'meins1',
                showOverflowTooltip: true,
            }, {
                label: '计划到货数量',
                prop: 'plannedArrivalQuantity',
                showOverflowTooltip: true,
            }, {
                // label: '附件',
                // prop: 'attachment',
                slot: 'enclosure',
                showOverflowTooltip: true,
                width: 300,
            }, {
                label: '状态',
                prop: 'status',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.purchase_roofStatus[cell];
                },
            }, {
                label: '采购收货凭证',
                prop: 'prCertificateCode',
                showOverflowTooltip: true,
                width: 120,
            }],
            // 上表头弹出表单
            dialogFormSon: [{
                // label: 'SAP采购订单号',
                slot: 'search',
                prop: 'ebeln',
                value: '',
            }, {
                // slot: 'project',
                label: '项目号',
                prop: 'ebelp',
                value: '',
                disabled: true,
            }, {
                label: '计划制作人',
                prop: 'Planner',
                value: '',
                disabled: true,
            }, {
                label: '创建时间',
                prop: 'createTime',
                type: 'datetime',
                value: '',
                disabled: true,
            }, {
                label: '工厂',
                prop: 'werks',
                value: '',
                disabled: true,
            }, {
                label: '库存地点',
                prop: 'lgort',
                value: '',
                disabled: true,
            }, {
                label: '供应商编码',
                prop: 'lifnr',
                value: '',
                disabled: true,
            }, {
                label: '供应商名称',
                prop: 'sortl',
                value: '',
                disabled: true,
            }, {
                label: 'SAP物料编码',
                prop: 'matnr',
                value: '',
                disabled: true,
            }, {
                label: 'SAP物料名称',
                prop: 'txz01',
                value: '',
                disabled: true,
            }, {
                label: '预期交货日期',
                prop: 'eindt',
                value: '',
                type: 'datetime',
                disabled: true,
            }, {
                label: '库存单位',
                prop: 'meins1',
                value: '',
                disabled: true,
            }, {
                label: '采购数量',
                prop: 'menge1',
                value: '',
                disabled: true,
            }, {
                label: '已排计划数量',
                prop: 'plannedQuantity',
                value: '',
                disabled: true,
            }, {
                label: '待排计划数量',
                prop: 'waitingPlanQuantity',
                value: '',
                disabled: true,
            }],
            // 上表头项目弹出列表
            tableColumnProject: [{
                label: 'SAP订单号',
                prop: 'ebeln',
                showOverflowTooltip: true,
                searchBy: true,
                // sortable: true,
            }, {
                label: 'SAP项目号',
                prop: 'ebelp',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: 'SAP物料料号',
                prop: 'matnr',
                showOverflowTooltip: true,
            }, {
                label: 'SAP物料名称',
                prop: 'txz01',
                showOverflowTooltip: true,
            }, {
                label: 'SAP采购单位',
                prop: 'meins2',
                showOverflowTooltip: true,
            }, {
                label: 'SAP采购数量（采购单位）',
                prop: 'menge',
                showOverflowTooltip: true,
            }, {
                label: 'SAP库存单位',
                prop: 'meins1',
                showOverflowTooltip: true,
            }, {
                label: 'SAP采购数量（库存单位）',
                prop: 'menge1',
                showOverflowTooltip: true,
            }, {
                label: 'SAP仓库',
                prop: 'lgort',
                showOverflowTooltip: true,
            }, {
                label: 'SAP库存类型',
                prop: 'insmk',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.InventoryType[cell];
                },
            }, {
                label: 'SAP预期交货日期',
                prop: 'eindt',
                showOverflowTooltip: true,
            }],
            detailDialogForm: [{
                label: '采购收货计划号',
                prop: 'prPlanCode',
                value: '',
                disabled: true,
            }, {
                label: '预计交货时间',
                prop: 'dueTime',
                type: 'datetime',
                value: '',
                required: true,
            }, {
                label: '库存单位',
                prop: 'meins1',
                value: '',
                disabled: true,
            }, {
                label: '计划到货数量',
                prop: 'plannedArrivalQuantity',
                value: '',
                required: true,
                rule: {
                    validator(rule, value, callback) {
                        if (!value) callback();
                        const pattern = /^[0-9]+([.]\d{1,4})?$/;
                        if (Number(value) < 0 || !pattern.test(value) || parseFloat(value).toString() === 'NaN') {
                            return callback(new Error('请输入有效数字!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                }
            }, {
                label: '状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: dict.purchase_roofStatus,
                disabled: true,
            }, {
                label: '采购收货凭证',
                prop: 'prCertificateCode',
                value: '',
                disabled: true,
            }, {
                slot: 'upload',
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            pageTotal_down: 0,
            currentRowKeyParent: '',
            currentRowKeySon: '',
            dialogParent: '',
            dialogVisibleParent: false,
            pageSize_form: 20,
            currentPage_form: 1,
            pageTotal_form: 0,
            sum: 0,
            ebeln: '',
            ebelp: '',
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
            userInfo: state => state.sysUser
        }),
        editDisabledParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            return !this.currentRowKeyParent || !item || (item && (item.status === 1 || item.status === 2));
        },
        delDisabledParent() {
            return this.selection.length === 0;
        },
        editDisabledSon() {
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            return !this.currentRowKeySon || !item || (item && (item.status === 2 || item.status === 3));
        },
        delDisabledSon() {
            return this.selectionSon.length === 0;
        },
        addDisabledDialog() {
            const eq = this.dialogFormSon[12].value;
            return _.isEmpty(this.dialogFormSon[0].value) || _.isEmpty(this.dialogFormSon[1].value) || (eq !== null && Number(eq) === this.sum);
        },
        together() {
            const ebeln = this.dialogFormSon[0].value;
            const ebelp = this.dialogFormSon[1].value;
            return {
                ebeln,
                ebelp,
            };
        }
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) {
                if (Number(this.dialogFormSon[14].value) > 0) {
                    this.$alert('本采购单项目下存在待排数量', {
                        type: 'warning'
                    });
                    this.dialogVisibleParent = true;
                    return false;
                }
                this.currentRowKeySon = '';
            }
        },
        dialogVisibleFormSon(val) {
            if (!val) {
                this.uploadList = [];
            }
        },
        together(newval, oldval) {
            if (newval.ebeln !== '' && newval.ebelp !== '') {
                this.getDataSon();
            } else {
                this.tableDataSon = [];
            }
        }
    },
    mounted() {
        this.queryDict('product_type');
        this.getDataParent();
    },
    methods: {
        ...mapActions(['queryDict']),
        // 获取上表信息
        getDataParent() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                ...this.form,
                // ebeln: this.ebeln,
                // ebelp: this.ebelp,
            };
            // if (!_.isEmpty(this.ebeln)) params.ebeln = this.ebeln;
            // else if (!_.isEmpty(this.ebelp)) params.ebelp = this.ebelp;
            // this.searchForm.forEach(v => {
            //     if (v.value) {
            //         const keys = v.prop;
            //         params[keys] = encodeURI(v.value);
            //     }
            // });
            return this.$http.get('/purchase/prplandet/pagePrPlanDet', {
                params
            }).then(res => {
                this.tableLoading = false;
                this.tableDataParent = res.data.records;
                this.isClick = false;
                this.tableDataParent.forEach(v => {
                    if (v.attachment !== null) {
                        let oldArr = v.attachment.split('/');
                        let newArr = oldArr[oldArr.length - 1].split('-');
                        let lastArr = newArr.slice(4).join('');
                        v.fileName = lastArr.substring(16);
                    }
                });
                this.pageTotal = res.data.total;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        searchData() {
            this.currentPage = 1;
            this.searchForm.forEach(v => {
                if (v.prop === 'ebeln') { this.form.ebeln = v.value }
                else if (v.prop === 'prPlanCode') { this.form.prPlanCode = v.value }
                else if (v.prop === 'sapMaterialCode') { this.form.sapMaterialCode = v.value }
                else if (v.prop === 'sapMaterialName') { this.form.sapMaterialName = v.value }
                else if (v.prop === 'ebelp') { this.form.ebelp = v.value }
                else if (v.prop === 'dueTime') {
                    if (v.value) {
                        const arr = v.value;
                        this.form.startTime = moment(arr[0]).format('YYYY-MM-DD');
                        this.form.endTime = moment(arr[1]).format('YYYY-MM-DD');
                    }
                }
            });
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
        // 获取下表信息
        getDataSon() {
            this.tableLoadingDown = true;
            const ebeln = this.dialogFormSon[0].value;
            const ebelp = this.dialogFormSon[1].value;
            this.$http.get(`/purchase/prplandet/pagePrPlanDet`, {
                params: {
                    current: 1,
                    size: 9999,
                    ebeln,
                    ebelp,

                }
            }).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data.records;
                this.pageTotal_down = res.data.total;
                this.sum = 0;
                this.tableDataSon.forEach(v => {
                    if (v.attachment !== null) {
                        let oldArr = v.attachment.split('/');
                        let newArr = oldArr[oldArr.length - 1].split('-');
                        let lastArr = newArr.slice(4).join('');
                        v.fileName = lastArr.substring(16);
                    }
                });
                this.tableDataSon.forEach(v => {
                    if (v.status !== 3) this.sum += v.plannedArrivalQuantity;
                });
                this.dialogFormSon[13].value = this.sum;
                this.dialogFormSon[14].value = Number(this.dialogFormSon[12].value) - this.sum;
            }).catch(() => {
                this.tableLoadingDown = false;
            });
        },
        // 项目号弹出窗分页
        changeCurrent_project(val) {
            this.currentPage_project = val;
            this.getProjectData();
        },
        changeSize_project(val) {
            this.pageSize_project = val;
            this.currentPage_project = 1;
            this.getProjectData();
        },
        uploadChangeHandler(file, fileList) {
            this.uploadList = fileList;
        },
        // 主表新增
        newRow() {
            const item = this.dialogFormSon.find(v => v.prop === 'Planner');
            const item2 = this.dialogFormSon.find(v => v.prop === 'createTime');
            item.value = this.userInfo.nickname;
            item2.value = this.userInfo.createTime;
            this.dialogVisibleParent = true;
            this.projectDisabled = true;
        },
        // 主表修改
        editRow() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogFormSon.forEach(v => {
                v.value = item[v.prop];
            });
            const item1 = this.dialogFormSon.find(v => v.prop === 'Planner');
            const item2 = this.dialogFormSon.find(v => v.prop === 'createTime');
            item1.value = this.userInfo.nickname;
            item2.value = this.userInfo.createTime;
            this.dialogVisibleParent = true;
        },
        // 主表删除
        // delRow() {
        //     const statusArr = this.selection.map(v => {
        //         if (v.status === 0) return true;
        //         else return false;
        //     });
        //     if (statusArr.includes(false)) {
        //         this.$confirm('非草稿状态不能删除', '提示', {
        //             type: 'warning'
        //         });
        //         return;
        //     }
        //     this.$confirm('是否确认删除?', '提示', {
        //         type: 'warning'
        //     }).then(() => {
        //         this.submitLoading = true;
        //         const delData = this.selection.map(v => v.id);
        //         this.$http.delete('/purchase/prplandet/removeByIds', {
        //             data: delData,
        //         }).then(() => {
        //             this.submitLoading = false;
        //             this.getDataParent();
        //             this.$message({
        //                 message: '删除成功!',
        //                 type: 'success'
        //             });
        //         }).catch(() => {
        //             this.submitLoading = false;
        //         });
        //     });
        // },
        newRowSonForm() {
            this.uploadList = [];
            this.dialogVisibleFormSon = true;
            const item = this.dialogFormSon.find(v => v.prop === 'meins1');
            this.detailDialogForm[2].value = item.value;
            this.detailDialogForm[4].value = '0';
            this.detailDialogForm[1].value = this.dialogFormSon[10].value;
            this.formType = 'new';
            this.detailDialogForm[3].value = Number(this.dialogFormSon[12].value) - this.sum;
        },
        editRowSonFrom() {
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            if (item.status !== 0) this.detailDialogForm[3].disabled = true;
            else this.detailDialogForm[3].disabled = false;
            this.$http.get(`purchase/prplandet/getById/${this.currentRowKeySon}`).then(res => {
                this.List = res.data;
                this.detailDialogForm.forEach(v => {
                    if (v.prop === 'status') v.value = this.List.status.toString();
                    else v.value = this.List[v.prop];
                });
                // const { origin } = window.location;
                const url = this.List[`attachment`];
                const reg = /(?<=(?:\/))(.(?!\/))+\.\w+$/g;
                let name = url ? url.match(reg) : '';
                name = String(name);
                this.uploadList = this.List[`attachment`] ? [{ url, name }] : [];
                this.dialogVisibleFormSon = true;
            });
            this.formType = 'edit';
        },
        delRowSonFrom() {
            const statusArr = this.selectionSon.map(v => {
                if (v.status === 0) return true;
                else return false;
            });
            if (statusArr.includes(false)) {
                this.$confirm('非草稿状态不能删除', '提示', {
                    type: 'warning'
                });
                return false;
            }
            if (this.selectionSon.length === this.tableDataSon.length) {
                this.$confirm('该项目号的采购收货计划是否确定全部删除？若是，该项目号仅保留原始采购收货计划!', {
                    type: 'warning'
                }).then(() => {
                    this.submitLoading = true;
                    let delData = this.selectionSon.map(v => v.id);
                    this.$http.delete('/purchase/prplandet/removeByIds', {
                        data: delData,
                    }).then(() => {
                        this.submitLoading = false;
                        this.getDataSon();
                        this.getDataParent();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                });
            } else {
                this.$confirm('是否确认删除?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.submitLoading = true;
                    let delData = this.selectionSon.map(v => v.id);
                    this.$http.delete('/purchase/prplandet/removeByIds', {
                        data: delData,
                    }).then(() => {
                        this.submitLoading = false;
                        this.getDataSon();
                        this.getDataParent();
                        this.$message({
                            message: '删除成功!',
                            type: 'success'
                        });
                    }).catch(() => {
                        this.submitLoading = false;
                    });
                });
            }
        },
        // 提交上表新增或者修改数据
        submitFormParent() {
            let obj = {};
            this.detailDialogForm.forEach(v => {
                if (v.prop === 'status') obj[v.prop] = Number(v.value);
                else obj[v.prop] = v.value;
            });
            obj.ebeln = this.dialogFormSon[0].value;
            obj.ebelp = this.dialogFormSon[1].value;
            if (obj.dueTime !== '') {
                obj.dueTime = moment(obj.dueTime).format('YYYY-MM-DD HH:mm:ss');
            }
            this.uploadList.forEach(v => {
                if (v.response && v.response.data) {
                    const { bucketName, fileName } = v.response.data;
                    obj.attachment = `/purchase/prplandet/getfile/${bucketName}-${fileName}`;
                } else {
                    obj.attachment = v.url;
                }
            });
            obj[`attachment`] = obj[`attachment`] || '';
            if (this.formType === 'new') {
                this.submitLoading = true;
                this.$http.post('/purchase/prplandet/save', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.getDataParent();
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.dialogVisibleFormSon = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                this.submitLoading = true;
                obj.id = this.currentRowKeySon;
                this.$http.put('/purchase/prplandet/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.getDataParent();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleFormSon = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 主表多选
        changeHanleder(select) {
            this.selection = select;
        },
        changeHanlederSon(select) {
            this.selectionSon = select;
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        showProject() {
            this.tableLoadingTop = true;
            this.getProjectData();
            this.currentPage_project = 1;
        },
        // 切换类
        toggleClick() {
            this.isExpand = !this.isExpand;
        },
        // 获取项目号
        getProjectData() {
            const params = {
                current: this.currentPage_project,
                size: this.pageSize_project,
                conditionList: [],
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
            this.$http.get('/purchase/purchaseorderdet/page', {
                params
            }).then(res => {
                this.tableLoadingTop = false;
                this.tableDataProject = res.data.records;
                this.pageTotal_project = res.data.total;
                this.dialogVisibleProject = true;
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        // // 订单号表格提交
        submitFormSon(row) {
            this.dialogVisibleSon = false;
            const item = this.tableDataDialog.find(v => v.id === this.currentRowKeyForm);
            this.dialogFormSon[0].value = item.ebeln;
            this.dialogFormSon[4].value = item.werks;
            this.dialogFormSon[5].value = item.lifnr;
            this.dialogFormSon[6].value = item.sortl;
            this.projectDisabled = false;
        },
        // 项目号表格提交
        submitFormProject() {
            this.dialogVisibleProject = false;
            const item = this.tableDataProject.find(v => v.id === this.currentRowKeyProject);
            this.dialogFormSon.forEach(v => {
                if (v.prop === 'Planner' || v.prop === 'createTime') return;
                else v.value = item[v.prop];
            });
        },
        exportAll() {
            let params = {};
            if (this.isClick) {
                this.searchForm.forEach(v => {
                    if (v.prop === 'ebeln') params.ebeln = v.value;
                    else params.ebelp = v.value;
                });
                // params = {
                //     ...this.form,
                // };
            }
            this.$http.post(`/purchase/prplandet/exportAllList`, null, { responseType: 'blob', params }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '采购收货计划.xls';
                    $a.click();
                }
            });
        },
        removeChangeHandler(file, fileList) {
            this.uploadList = fileList;
            this.$message.success('删除成功!');
        },
        // 列表内搜索
        searchFormWork(form) {
            this.currentPage_project = 1;
            this.dialogSearchForm = form;
            this.getProjectData();
        },
        previewChangeHandler(file) {
            window.open(file.url, '_blank');
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
        closePaly() {
            if (Number(this.dialogFormSon[14].value) > 0) {
                this.$alert('本采购单项目下存在待排数量', {
                    type: 'warning'
                });
                return false;
            } else {
                this.dialogVisibleParent = false;
            }
        },
        // 附件上传
        successFile(response, file, fileList) {
            this.uploadList = fileList;
            const { code, msg } = response;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            let obj = {};
            obj = Object.assign({}, item);
            this.uploadList.forEach(v => {
                if (v.response && v.response.data) {
                    const { bucketName, fileName } = v.response.data;
                    obj.attachment = `/purchase/prplandet/getfile/${bucketName}-${fileName}`;
                } else {
                    obj.attachment = v.url;
                }
            });
            if (code === 0) {
                this.$http.put('/purchase/prplandet/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '上传成功!',
                        type: 'success'
                    });
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                this.$alert(`${msg}`, {
                    type: 'error'
                });
            }
        },
    }
};
</script>

<style lang="stylus" scoped>
    .recplay
        & >>> .fr
            float right
     .upload
            & >>> .el-upload-list__item
                width 100%
                height 100%
    .search
        padding 14px 10px
        background #f5f5f5
        overflow hidden
        box-sizing border-box
        transition-duration .2s
        // height 57px
        height auto
        &.hide
            padding-top 0
            padding-bottom 0
            height 0
    .import
       display:inline-block;

.expand_toggle
    border-top 1px dashed  #EBEEF5
    border-bottom 1px dashed #EBEEF5
    height 40px
    line-height: 40px
    text-align center
    overflow hidden
    box-sizing border-box
    transition-duration .5s
    .iconfont
        transition transform .25s
        display inline-block
.formAndTable >>>
    .table
        height 30vh

    // .formAndTable >>>
    //     .expand_toggle
    //             border-top 1px dashed  #EBEEF5
    //             border-bottom 1px dashed #EBEEF5
    //             height 40px
    //             line-height: 40px
    //             text-align center
    //     .frame
    //        margin 20px 0
    //        .table
    //            height 300px
    //            .el-table__body-wrapper
    //             height 100% !important
    //     .el-input-group__append
    //         overflow hidden
    //         .el-button.is-disabled:hover
    //             background #f5f7fa
    //             color #90959f
</style>
