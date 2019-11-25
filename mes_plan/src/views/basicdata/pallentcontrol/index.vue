<template lang="pug">
    ebrain-main.category
        ebrain-frame(title="托盘类别")
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
                    highlight-current-row
                    :current-row-key.sync="currentRowKey"
                    row-key="id"
                    :data="tableData"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
                    @row-click="getPos"
                    @row-dblclick="editRow"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @selection-change="changeHandler")
        ebrain-frame.tabs
            template(#tabs)
                el-tabs(v-model="activeName" type="card")
                    el-tab-pane(label="托盘信息" name="first")
                    el-tab-pane(label="托盘物料管理" name="second")
            template(#tools)
                ebrain-tools(
                    :buttons="bthDownL"
                    v-show="activeName === 'first'")
                ebrain-tools(
                    :buttons="btnsDownR"
                    v-show="activeName === 'second'")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingL'
                    highlight-current-row
                    :current-row-key.sync="currentRowKeyL"
                    row-key="id"
                    v-show="activeName === 'first'"
                    :data="tableDataL"
                    :column="tableColumnL"
                    :pageSize="pageSizeL"
                    :currentPage="currentPageL"
                    :pageTotal="pageTotalL"
                    @row-dblclick="editRowL"
                    @changeCurrent="changeCurrentL"
                    @changeSize='changeSizeL'
                    key="table1"
                    @selection-change="changeHandlerL")
                ebrain-table(
                    :tableLoading='tableLoadingR'
                    highlight-current-row
                    key="table2"
                    :current-row-key.sync="currentRowKeyR"
                    row-key="id"
                    v-show="activeName === 'second'"
                    :data="tableDataR"
                    :column="tableColumnR"
                    :pageSize="pageSizeR"
                    :currentPage="currentPageR"
                    :pageTotal="pageTotalR"
                    @changeCurrent="changeCurrentR"
                    @changeSize='changeSizeR'
                    @selection-change="changeHandlerR")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            :form.sync="dialogForm"
            @submit="submitForm")
        ebrain-dialog(
            :submitLoading='submitLoadingL'
            :visible.sync="dialogVisibleL"
            :form.sync="dialogFormL"
            @submit="submitFormL")
            template(#palletRfid="{value}")
                el-col(:span="12")
                    el-form-item(label-width="110px" label="RFID信息"  prop="palletRfids")
                        el-input(@keyup.enter.native="addRFID" :value="dialogFormL[3].value" v-model="dialogFormL[3].value" maxlength="50")
                            i(@click="addRFID" slot="suffix").el-icon-circle-plus-outline
                        br
                        ul.rf-list
                            li(v-for=" (col, index) in rfidData")
                                span {{col}}
                                i(@click="delRFID(index)").el-icon-remove-outline
        //- ebrain-dialog(
        //-     :submitLoading='submitLoadingR'
        //-     :visible.sync="dialogVisibleR"
        //-     :form.sync="dialogFormR"
        //-     @submit="submitFormR")
        //-     template(#materialNo="{value}")
        //-         el-col(:span="12")
        //-             el-form-item(label-width="110px" label="物料编码" :required="true" prop="materialNo")
        //-                 el-input(style="cursor:pointer" :value="value" :readonly="true")
        //-                     el-button(slot="append" @click="dialogSearchForm={},getMatrial()"  icon="iconfont iconsearch")
        ebrain-dialog-table(
            height="50vh"
            :data="tableDataMatrial"
            :tableLoading="getLoading"
            :column="tableColumnMatrial"
            :visible.sync="dialogVisibleMatrial"
            :disabled="!this.mulDialog.length"
            row-key="id"
            :pageSize="pageSizeMatrial"
            :currentPage="currentPageMatrial"
            :pageTotal="pageTotalMatrial"
            @search="searchType"
            @resetDialog="resetType"
            dialogTableSearch
            @changeCurrent="changeCurrentMatrial"
            @changeSize="changeSizeMatrial"
            @select="handlerSelect"
            :current-row-key.sync="currentRowKeyMatrial"
            @submit="submitFormR")
</template>

<script>
// import dict from '@/utils/dict';
import _ from 'lodash';
import EbrainDialogTable from '@/components/EbrainDialogTable';
export default {
    components: {
        EbrainDialogTable
    },
    data() {
        return {
            mulDialog: [],
            conditionList: [],
            dialogSearchForm: {},
            submitLoading: false,
            tableLoading: false,
            tableData: [],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            multiption: '',
            searchVisible: true,
            searchVisibleL: true,
            searchVisibleR: true,
            searchForm: [{
                label: '托盘类别名称',
                prop: 'palletTypeName',
                value: '',
            }, {
                label: '托盘类别编码',
                prop: 'palletTypeNo',
                value: '',
            }],
            tableColumn: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '托盘类别名称',
                prop: 'palletTypeName',
                showOverflowTooltip: true,
            }, {
                label: '托盘类别编码',
                prop: 'palletTypeNo',
                showOverflowTooltip: true,
            }],
            dialogForm: [{
                label: '托盘类别名称',
                prop: 'palletTypeName',
                value: '',
                required: true,
            }, {
                label: '托盘类别编码',
                prop: 'palletTypeNo',
                value: '',
                required: true,
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRow(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'generator_pallettype_add',
            }, {
                label: '修改',
                click: () => this.editRow(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabled,
                permi: 'generator_pallettype_edit',
            }, {
                label: '删除',
                click: () => this.delRow(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabled,
                permi: 'generator_pallettype_dels',
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            activeName: 'first',
            submitLoadingL: false,
            tableLoadingL: false,
            tableDataL: [],
            pageSizeL: 20,
            currentPageL: 1,
            pageTotalL: 0,
            multiptionL: '',
            searchFormL: [{
                label: '托盘编码',
                prop: 'palletNo',
                value: '',
            }, {
                label: '托盘名称',
                prop: 'palletName',
                value: '',
            }],
            tableColumnL: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '托盘编码',
                prop: 'palletNo',
                showOverflowTooltip: true,
            }, {
                label: '托盘名称',
                prop: 'palletName',
                showOverflowTooltip: true,
            }, {
                label: 'RFID信息',
                prop: 'palletRfids',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogFormL: [{
                label: '托盘编码',
                prop: 'palletNo',
                value: '',
                required: true,
            }, {
                label: '托盘名称',
                prop: 'palletName',
                value: '',
                required: true,
            }, {
                label: '备注',
                prop: 'remark',
                value: '',
                type: 'textarea',
            }, {
                label: 'RFID信息',
                prop: 'palletRfids',
                value: '',
                slot: 'palletRfid',
            }],
            bthDownL: [{
                label: '新增',
                click: () => this.newRowL(),
                className: 'iconfont iconstatus-Preserve-and-add',
                disabled: () => this.editDisabled,
                permi: 'generator_pallet_add',
            }, {
                label: '修改',
                click: () => this.editRowL(),
                className: 'iconfont iconstatus-edit',
                disabled: () => this.editDisabledL,
                permi: 'generator_pallet_add',
            }, {
                label: '删除',
                click: () => this.delRowL(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabledL,
                permi: 'generator_pallet_dels',
            }],
            currentRowKeyL: '',
            dialogTypeL: '',
            dialogVisibleL: false,
            btnsDownR: [{
                label: '新增',
                click: () => this.newRowR(),
                disabled: () => this.editDisabled,
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'generator_materialpallettype_add',
            }, {
                label: '删除',
                click: () => this.delRowR(),
                className: 'iconfont iconstatus-delete',
                disabled: () => this.delDisabledR,
                permi: 'generator_materialpallettype_dels',
            }],
            submitLoadingR: false,
            tableLoadingR: false,
            tableDataR: [],
            pageSizeR: 20,
            currentPageR: 1,
            pageTotalR: 0,
            multiptionR: '',
            searchFormR: [{
                label: '托盘类别名称',
                prop: 'supplierCode',
                value: '',
            }],
            tableColumnR: [{
                type: 'selection',
                width: 40,
                minWidth: 40,
            }, {
                label: '物料编码',
                prop: 'materialNo',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '物料类型',
                prop: 'materialType',
                showOverflowTooltip: true,
            }],
            dialogFormR: [{
                label: '物料编码',
                prop: 'materialNo',
                value: '',
                required: true,
                slot: 'materialNo',
            }, {
                label: '物料名称',
                prop: 'materialName',
                value: '',
                disabled: true,
            }, {
                label: '物料类型',
                prop: 'materialType',
                value: '',
                disabled: true,
            }],
            currentRowKeyR: '',
            dialogTypeR: '',
            dialogVisibleR: false,
            tableDataMatrial: [],
            tableColumnMatrial: [{
                type: 'selection',
                width: 40,
            }, {
                label: '物料编码',
                prop: 'materialCode',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '物料类型',
                prop: 'materialTypeCode',
                showOverflowTooltip: true,
            }],
            dialogVisibleMatrial: false,
            currentRowKeyMatrial: '',
            pageSizeMatrial: 20,
            currentPageMatrial: 1,
            pageTotalMatrial: 0,
            getLoading: false,
            RfIDList: '',
            rfidData: [],
        };
    },
    computed: {
        editDisabled() {
            return !this.currentRowKey;
        },
        delDisabled() {
            return this.multiption.length === 0;
        },
        editDisabledL() {
            return !this.currentRowKeyL;
        },
        delDisabledL() {
            return this.multiptionL.length === 0;
        },
        editDisabledR() {
            return !this.currentRowKeyR;
        },
        delDisabledR() {
            return this.multiptionR.length === 0;
        }
    },
    watch: {
        dialogType(val) {
            if (val === 'new') {
                this.dialogForm[1].disabled = false;
            } else {
                this.dialogForm[1].disabled = true;
            }
        },
        dialogTypeL(val) {
            if (val === 'new') {
                this.dialogFormL[0].disabled = false;
            } else {
                this.dialogFormL[0].disabled = true;
            }
        },
        activeName(val) {
            if (val === 'first') this.getDataL();
            else if (val === 'second') this.getDataR();
        },
        dialogVisibleL(val) {
            if (!val) {
                this.rfidData = [];
            }
        },
        dialogVisibleMatrial(val) {
            if (!val) {
                this.currentPageMatrial = 1;
                this.tableDataMatrial = [];
                this.dialogSearchForm = {};
            }
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
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
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            this.$http.get(`/basicdata/pallettype/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records;
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        newRow() {
            this.dialogType = 'new';
            this.dialogVisible = true;
        },
        editRow() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.dialogForm.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogType = 'edit';
            this.dialogVisible = true;
        },
        delRow() {
            const delData = this.multiption.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/pallettype/removeByIds', {
                    data: delData,
                }).then(() => {
                    this.submitLoading = false;
                    this.currentPage = 1;
                    this.getData();
                    this.tableDataL = [];
                    this.tableDataR = [];
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                });
            });
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getData();
        },
        changeCurrent(val) {
            this.currentPage = val;
            this.getData();
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        submitForm() {
            let obj = {};
            this.dialogForm.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogType === 'new') {
                this.$http.post('/basicdata/pallettype/save', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.getData();
                    this.dialogVisible = false;
                }).catch(v => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKey;
                this.$http.put('/basicdata/pallettype/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKey = '';
                    this.getData();
                    this.dialogVisible = false;
                }).catch(v => {
                    this.submitLoading = false;
                });
            }
        },
        changeHandler(selection) {
            this.multiption = selection;
            this.currentRowKey = '';
        },
        getDataL() {
            if (this.currentRowKey) {
                this.tableLoadingL = true;
                const item = this.tableData.find(v => v.id === this.currentRowKey);
                const params = {
                    current: this.currentPageL,
                    size: this.pageSizeL,
                    palletTypeNo: item.palletTypeNo
                };
                // if (this.currentRowKey !== '') {
                //     params.conditionList.push({
                //         fieldName: 'palletTypeNo',
                //         operation: 'EQ',
                //         value: encodeURI(item.palletTypeNo),
                //     });
                // }
                this.searchFormL.forEach(v => {
                    if (v.value) {
                        params.conditionList.push({
                            fieldName: v.prop,
                            operation: 'LIKE',
                            value: encodeURI(v.value),
                            joinType: 'AND',
                        });
                    }
                });
                this.$http.get(`/basicdata/pallet/getPalletPage`, {
                    params
                }).then(({ code, data }) => {
                    this.tableDataL = data.records;
                    this.pageTotalL = data.total;
                    this.tableLoadingL = false;
                }).catch(() => {
                    this.tableLoadingL = false;
                });
            }

        },
        newRowL() {
            this.dialogTypeL = 'new';
            this.dialogVisibleL = true;
        },
        editRowL() {
            const item = this.tableDataL.find(v => v.id === this.currentRowKeyL);
            this.dialogFormL.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogTypeL = 'edit';
            this.dialogVisibleL = true;
            this.rfidData = item.palletRfids.split(',');
            this.dialogFormL[3].value = '';
        },
        delRowL() {
            const delData = this.multiptionL.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoadingL = true;
                this.$http.delete('/basicdata/pallet/removeByIds', {
                    data: delData,
                }).then(() => {
                    this.submitLoadingL = false;
                    this.currentPageL = 1;
                    this.getDataL();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeyL = '';
                });
            });
        },
        changeSizeL(val) {
            this.pageSizeL = val;
            this.currentPageL = 1;
            this.getDataL();
        },
        changeCurrentL(val) {
            this.currentPageL = val;
            this.getDataL();
        },
        resetL() {
            this.searchFormL.forEach(item => {
                item.value = '';
            });
        },
        submitFormL() {
            let obj = {};
            this.dialogFormL.forEach(v => {
                obj[v.prop] = v.value;
            });
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.submitLoadingL = true;
            obj.palletTypeNo = item.palletTypeNo;
            if (this.rfidData.length) {
                obj.palletRfids = this.rfidData.join(',');
            }
            // if (this.rfidData.length) {
            //     if (!_.isEmpty(obj.palletRfids)) {
            //         this.rfidData.push(obj.palletRfids);
            //     }
            //     obj.palletRfids = this.rfidData.join(',');
            // }
            if (this.dialogTypeL === 'new') {
                this.$http.post('/basicdata/pallet/savePallet', obj).then(() => {
                    this.submitLoadingL = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.getDataL();
                    this.dialogVisibleL = false;
                }).catch(v => {
                    this.submitLoadingL = false;
                });
            } else {
                obj.id = this.currentRowKeyL;
                this.$http.post('/basicdata/pallet/savePallet', obj).then(() => {
                    this.submitLoadingL = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKeyL = '';
                    this.getDataL();
                    this.dialogVisibleL = false;
                }).catch(v => {
                    this.submitLoadingL = false;
                });
            }
        },
        changeHandlerL(selection) {
            this.multiptionL = selection;
            this.currentRowKeyL = '';
        },
        getDataR() {
            if (!this.currentRowKey) return false;
            this.tableLoadingR = true;
            const params = {
                current: this.currentPageR,
                size: this.pageSizeR,
                conditionList: [],
            };
            if (this.currentRowKey !== '') {
                const item = this.tableData.find(v => v.id === this.currentRowKey);
                params.conditionList.push({
                    fieldName: 'palletTypeNo',
                    operation: 'EQ',
                    value: item.palletTypeNo,
                    // value: encodeURI(item.palletTypeNo),
                });
            }
            this.searchFormR.forEach(v => {
                if (v.value) {
                    params.conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: encodeURI(v.value),
                        joinType: 'AND',
                    });
                }
            });
            this.$http.get(`/basicdata/materialpallettype/page`, {
                params
            }).then(({ code, data }) => {
                this.tableDataR = data.records;
                this.pageTotalR = data.total;
                this.tableLoadingR = false;
            }).catch(() => {
                this.tableLoadingR = false;
            });
        },
        newRowR() {
            this.dialogTypeR = 'new';
            // this.dialogVisibleR = true;
            this.dialogVisibleMatrial = true;
            this.getMatrial();
        },
        editRowR() {
            const item = this.tableDataR.find(v => v.id === this.currentRowKeyR);
            this.dialogFormR.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogTypeR = 'edit';
            this.dialogVisibleR = true;
        },
        delRowR() {
            const delData = this.multiptionR.map(v => v.id);
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoadingR = true;
                this.$http.delete('/basicdata/materialpallettype/removeByIds', {
                    data: delData,
                }).then(() => {
                    this.submitLoadingR = false;
                    this.currentPageR = 1;
                    this.getDataR();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeyR = '';
                });
            });
        },
        changeSizeR(val) {
            this.pageSizeR = val;
            this.currentPageR = 1;
            this.getDataR();
        },
        changeCurrentR(val) {
            this.currentPageR = val;
            this.getDataR();
        },
        resetR() {
            this.searchFormR.forEach(item => {
                item.value = '';
            });
        },
        handlerSelect(val) {
            this.mulDialog = val;
        },
        submitFormR() {
            let obj = {};
            this.dialogFormR.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoadingR = true;
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            let selectRow = this.mulDialog.map(v => ({
                palletTypeNo: item.palletTypeNo,
                materialNo: v.materialCode,
                materialName: v.materialName,
                materialType: v.materialType,
            }));
            if (this.dialogTypeR === 'new') {
                this.$http.post('/basicdata/materialpallettype/save', selectRow).then(() => {
                    this.submitLoadingR = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    this.getDataR();
                    this.dialogVisibleR = false;
                    this.dialogVisibleMatrial = false;
                }).catch(v => {
                    this.submitLoadingR = false;
                });
            } else {
                obj.id = this.currentRowKeyR;
                this.$http.put('/basicdata/materialpallettype/updateById', obj).then(() => {
                    this.submitLoadingR = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.currentRowKeyR = '';
                    this.getDataR();
                    this.dialogVisibleR = false;
                }).catch(v => {
                    this.submitLoadingR = false;
                });
            }
        },
        changeHandlerR(selection) {
            this.multiptionR = selection;
            this.currentRowKeyR = '';
        },
        getPos() {
            if (this.activeName === 'first') {
                this.getDataL();
            } else {
                this.getDataR();
            }
        },
        submitFormMatrial() {
            const item = this.tableDataMatrial.find(v => v.id === this.currentRowKeyMatrial);
            this.dialogFormR[0].value = item.materialCode;
            this.dialogFormR[1].value = item.materialName;
            this.dialogFormR[2].value = item.materialTypeCode;
            this.dialogVisibleMatrial = false;
        },
        getMatrial() {
            this.dialogVisibleMatrial = true;
            const params = {
                current: this.currentPageMatrial,
                size: this.pageSizeMatrial,
                conditionList: [],
            };
            // const item = this.tableData.find(v => v.id === this.currentRowKey);
            // params.conditionList.push({
            //     fieldName: 'palletTypeNo',
            //     operation: 'EQ',
            //     value: encodeURI(item.palletTypeNo),
            // });
            this.getLoading = true;
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
            this.$http.post(`/basicdata/materialpallettype/getMaterialListPage`, null, { params }).then((res) => {
                this.tableDataMatrial = res.data.records;
                this.pageTotalMatrial = res.data.total;
                this.getLoading = false;
            }).catch(() => {
                this.getLoading = false;
            });
        },
        searchType(form) {
            this.currentPageMatrial = 1;
            this.dialogSearchForm = form;
            this.getMatrial();
        },
        resetType(form) {
            if (form) {
                for (let i in form) {
                    if (Object.prototype.hasOwnProperty.call(form, i)) {
                        form[i] = '';
                    }
                }
            }
        },
        changeCurrentMatrial(val) {
            this.currentPageMatrial = val;
            this.getMatrial();
        },
        changeSizeMatrial(val) {
            this.pageSizeMatrial = val;
            this.currentPageMatrial = 1;
            this.getMatrial();
        },
        addRFID() {
            if (_.isEmpty(this.dialogFormL[3].value)) {
                this.$alert('请输入托盘信息', {
                    type: 'warning',
                });
                return false;
            }
            if (this.rfidData.includes(this.dialogFormL[3].value)) {
                this.$alert('RFID信息不能重复', {
                    type: 'warning',
                });
                return false;
            }
            this.rfidData.push(this.dialogFormL[3].value);
            this.dialogFormL[3].value = '';
        },
        delRFID(index) {
            this.rfidData.splice(index, 1);
        }
    }
};
</script>
<style lang="stylus" scoped>
.category
    & >>> .fr
        float right
.tabs
.el-tabs
    & >>> .el-tabs__header
        margin 0
        background #ffffff
        .el-tabs__item.is-active
            border-top 2px solid #409EFF

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

.el-icon-circle-plus-outline
    cursor pointer
    font-size 14px
    &:hover
        color $color-blue

.rf-list
    overflow auto
    margin 0
    padding-left 0
    li
        list-style none
        margin-top 10px
        display flex
        justify-content space-between

        .el-icon-remove-outline
            cursor pointer
            color #c0c4cc
            line-height 28px
            margin-right 5px
            margin-left 5px
            &:hover
                color $color-red
</style>

