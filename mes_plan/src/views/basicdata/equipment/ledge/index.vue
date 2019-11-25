<template lang="pug">
    ebrain-main.ledge
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
                    :pageSize="pageSize"
                    :currentPage="currentPage"
                    :pageTotal="pageTotal"
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
            title="零部件信息")
            //- template(#tools)
            //-     ebrain-tools(:buttons="btnsBottom")
            template(#table)
                ebrain-table(
                    :isShow='false'
                    :tableLoading='tableLoadingDown'
                    :pageSize="pageSize_down"
                    :currentPage="currentPage_down"
                    :pageTotal="pageTotal_down"
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    @changeCurrent="changeCurrent_down"
                    @changeSize='changeSize_down'
                    @selection-change="selectionChangeHandler"
                    row-key="id"
                    highlight-current-row
                    :current-row-key.sync="currentRowKeySon")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
            template(#equipName)
                el-col(:span="12")
                    el-form-item(label="设备名称" prop="equipName" required)
                        el-input(readonly=true v-model="dialogFormParent[1].value")
                            el-button(slot="append" icon="el-icon-search" @click="enterDetail()")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
            //- dialogTableSearch
            //- @search="searchFormWork"
            //- @resetDialog="resetDialog"
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
            :pageSize="pageSize_table"
            :currentPage="currentPage_table"
            :pageTotal="pageTotal_table"
            @current-change="currentChange_table"
            @changeCurrent="changeCurrent_table"
            @changeSize="changeSize_table"
            @submit="submitFormDialogTable(type)")
</template>

<script>
import { mapActions, mapState } from 'vuex';
import EbrainDialogTable from '@/components/EbrainDialogTable';
import moment from 'moment';

export default {
    name: 'index',
    components: {
        EbrainDialogTable,
    },
    data() {
        return {
            conditionList: [],
            dialogSearchForm: {},
            equipNum: '',
            type: '',
            pageSize_table: 20,
            pageTotal_table: 0,
            currentPage_table: 1,
            dialogVisibleTable: false,
            listDetailsData: [],
            dialogTableLoading: false,
            submitLoading: false,
            tableLoadingTop: false,
            tableLoadingDown: false,
            currentRowKeyDialogTable: '',
            tableDataParent: [],
            tableDataSon: [],
            List: [],
            listDetailsColumn: [{
                label: '设备编号',
                prop: 'equipNum',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
                searchBy: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                },
            }, {
                label: '设备用途',
                prop: 'equipClass',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }],
            tableColumnParent: [{
                label: '资产编号',
                prop: 'assetNum',
                showOverflowTooltip: true,
            }, {
                label: '设备编号',
                prop: 'equipNum',
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                },
                showOverflowTooltip: true,
            }, {
                label: '设备用途',
                prop: 'equipClass',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '维护人员',
                prop: 'matnPerson',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'matnTm',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                label: '编号',
                type: 'index',
                align: 'center',
                width: 50,
            }, {
                label: '零部件编号',
                prop: 'zeroDeptNum',
                showOverflowTooltip: true,
            }, {
                label: '零部件名称',
                prop: 'zeroDeptName',
                showOverflowTooltip: true,
            }, {
                label: '零部件分类',
                prop: 'zeroDeptClass',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['part_classification'][cell];
                }
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '零部件SN',
                prop: 'zeroDeptSn',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'corp',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'qnty',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'rm',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{
                label: '资产编号',
                prop: 'assetNum',
                value: '',
                required: true,
            }, {
                prop: 'equipName',
                value: '',
                required: true,
                slot: 'equipName',
            }, {
                label: '设备编号',
                prop: 'equipNum',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                type: 'select',
                option: () => this.storeDict['device_classification'],
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                value: '',
                disabled: true,
            }, {
                label: '单位',
                prop: 'corp',
                value: '',
                type: 'select',
                option: {},
                nodeKey: 'unitCode',
                nodeLabel: 'unitName',
                disabled: true,
            }, {
                label: '设备用途',
                prop: 'equipClass',
                value: '',
                type: 'select',
                option: () => this.storeDict['device_classification'],
                disabled: true
            }, {
                label: '资产状态',
                prop: 'assetStatus',
                value: '',
                type: 'select',
                option: () => this.storeDict['asset_status'],
            }, {
                label: '工作状态',
                prop: 'workStatus',
                value: '',
                type: 'select',
                option: () => this.storeDict['work_status'],
            }, {
                label: '制造厂商',
                prop: 'manufacturers',
                value: '',
            }, {
                label: '制造日期',
                prop: 'makeDt',
                value: '',
                type: 'datetime'
            }, {
                label: '出厂编号',
                prop: 'leaveFactoryNum',
                value: '',
            }, {
                label: '进厂日期',
                prop: 'incomingDt',
                value: '',
                type: 'datetime'
            }, {
                label: '安装日期',
                prop: 'installDt',
                value: '',
                type: 'datetime'
            }, {
                label: '验收日期',
                prop: 'checkAcptDt',
                value: '',
                type: 'datetime'
            }, {
                label: '安装位置',
                prop: 'installPosition',
                value: '',
                type: 'select',
                option: () => this.storeDict['device_position'],
            }, {
                label: '折旧年限',
                prop: 'depreYears',
                value: '',
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,4})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入有效数字'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
                change: val => {
                    let value = Number(val);
                    const isNum = !isNaN(value);
                    if (isNum) {
                        value = value.toFixed(4);
                        this.dialogFormParent[16].value = Number(value);
                    }
                },
            }, {
                label: '设备原值(RMB)',
                prop: 'equipCost',
                value: '',
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,4})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入有效数字'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
                change: val => {
                    let value = Number(val);
                    const isNum = !isNaN(value);
                    if (isNum) {
                        value = value.toFixed(4);
                        this.dialogFormParent[17].value = Number(value);
                    }
                },
            }, {
                label: '维护人员',
                prop: 'matnPerson',
                value: '',
                disabled: true
            }, {
                label: '维护时间',
                prop: 'matnTm',
                value: '',
                type: 'datetime',
                disabled: true
            }, {
                label: '备注',
                prop: 'rm',
                value: '',
                type: 'textarea',
            }],
            dialogFormSon: [{
                label: '零部件编号',
                prop: 'zeroDeptCode',
                value: '',
                required: true,
            }, {
                label: '零部件名称',
                prop: 'zeroDeptName',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['part_name']
            }, {
                label: '零部件分类',
                prop: 'zeroDeptClass',
                value: '',
                required: true,
                type: 'select',
                option: () => this.storeDict['part_classification']
            }, {
                label: '规格型号',
                prop: 'specModel',
                value: '',
            }, {
                label: '零部件SN',
                prop: 'zeroDept',
                value: '',
            }, {
                label: '单位',
                prop: 'corp',
                value: '',
                type: 'select',
                option: {},
                nodeKey: 'unitCode',
                nodeLabel: 'unitName',
            }, {
                label: '数量',
                prop: 'qnty',
                value: '',
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^\d+(\.\d{0,4})?$/;
                        if (!value) callback();
                        if (!reg.test(value)) {
                            return callback(new Error('请输入有效数字'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                }
            }, {
                label: '备注',
                prop: 'rm',
                value: '',
                type: 'textarea',
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
            selection: [],
            routeCode: '',
            searchVisible: true,
            searchForm: [{
                label: '设备编号',
                prop: 'equipNum',
                value: '',
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'device_account_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-edit',
                permi: 'device_account_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-delete',
                permi: 'device_account_dels',
            },
            // {
            //     label: '复制',
            //     click: () => this.copy(),
            //     disabled: () => !this.currentRowKeyParent,
            //     className: 'iconfont iconstatus-copy',
            //     permi: 'device_account_add',
            // },
            {
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
            userInfo: state => state.sysUser
        }),
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
        isvilated() {
            return this.selection.length !== 0;
        },
    },
    watch: {
        dialogVisibleTable(val) {
            if (!val) {
                this.dialogSearchForm = {};
            }
        }
    },
    created() {
        this.queryDict('device_type');
        this.queryDict('device_classification');
        this.queryDict('device_unit');
        this.queryDict('device_position');
        this.queryDict('part_name');
        this.queryDict('part_classification');
        this.queryDict('work_status');
        this.queryDict('asset_status');
        this.getDataParent();
    },
    methods: {
        ...mapActions(['queryDict']),
        // 选择单位表
        getDicbasicunit() {
            return this.$http.get('/basicdata/dicbasicunit/page?size=999').then(res => {
                let parent = this.dialogFormParent.find(v => v.prop === 'corp');
                let son = this.dialogFormSon.find(v => v.prop === 'corp');
                res.data.records.forEach(v => {
                    parent.option[v.unitCode] = v.unitName;
                    son.option[v.unitCode] = v.unitName;
                });
            });
        },
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
            this.$http.get('/basicdata/deviceaccount/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
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
        enterDetail(val = 1) {
            const params = {
                current: val,
                size: this.pageSize_table,
                conditionList: []
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
            this.dialogTableLoading = true;
            this.dialogVisibleTable = true;
            this.$http.get(`/basicdata/devicetype/page`, {
                params,
            }).then(res => {
                this.dialogTableLoading = false;
                this.currentPage_table = val;
                this.listDetailsData = res.data.records;
                this.pageTotal_table = res.data.total;
            });
        },
        currentChange_table(row) {
            this.rowObj = row;
        },
        changeCurrent_table(val) {
            this.enterDetail(val);
        },
        changeSize_table(val) {
            this.pageSize_table = val;
            this.currentPage_table = 1;
            this.enterDetail();
        },
        submitFormDialogTable() {
            this.dialogVisibleTable = false;
            this.equipNum = this.rowObj.equipNum;
            this.dialogFormParent[1].value = this.rowObj.equipName;
            this.dialogFormParent[2].value = this.rowObj.equipNum;
            this.dialogFormParent[3].value = this.rowObj.equipType;
            this.dialogFormParent[4].value = this.rowObj.specModel;
            this.dialogFormParent[5].value = this.rowObj.corp;
            this.dialogFormParent[6].value = this.rowObj.equipClass;
        },
        getDataSon() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            this.$http.get(`/basicdata/devicetypede/getListTypeNum/${item.equipNum}`).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data;
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
        getDevicetype() {
            return this.$http.get('/basicdata/devicetype/page?size=999').then(res => {
                let item = this.dialogFormParent.find(v => v.prop === 'equipType');
                res.data.records.forEach(v => {
                    item.option[v.typeNum] = v.typeName;
                });
                this.list = res.data.records;
            });
        },
        newRowParent() {
            const obj = {
                assetStatus: '1',
                workStatus: '0',
                matnPerson: this.userInfo.nickname,
                matnTm: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            };
            this.dialogFormParent.forEach(v => {
                const isKey = obj.hasOwnProperty(v.prop);// hasOwnProperty ES6原生方法,是否有此属性
                if (isKey) v.value = obj[v.prop];
            });
            this.dialogParent = 'new';
            this.dialogVisibleParent = true;
        },
        editRowParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogParent = 'edit';
            this.$http.get('/basicdata/deviceaccount/' + this.currentRowKeyParent).then(res => {
                this.List = res.data;
                Promise.all([this.getDicbasicunit(), this.getDevicetype()]).then(() => {
                    this.dialogVisibleParent = true;
                });
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'matnPerson') v.value = this.userInfo.nickname;
                    else if (v.prop === 'corp') v.value = this.List['corpId'];
                    else v.value = this.List[v.prop];
                });
            });
            this.equipNum = item.equipNum;
        },
        delRowParent() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/deviceaccount/removeByIds', {
                    data: [this.currentRowKeyParent]
                }).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeyParent = '';
                });
            });
        },
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            obj.equipNum = this.equipNum;
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$http.post('/basicdata/deviceaccount/save', obj).then(() => {
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
                this.$http.put('/basicdata/deviceaccount/updateById', obj).then(() => {
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
        // 列表内搜索
        searchFormWork(form) {
            this.dialogSearchForm = form;
            this.enterDetail();
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
        submitFormSon() {
            let obj = {};
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogSon === 'new') {
                obj.equipBookId = this.currentRowKeyParent;
                this.$http.post('/basicdata/deviceaccountde/save', obj).then(() => {
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
            } else {
                obj.id = this.currentRowKeySon;
                this.$http.put('/basicdata/deviceaccountde/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    this.dialogVisibleSon = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 复制
        copy() {
            this.dialogParent = 'new';
            this.$http.get('/basicdata/deviceaccount/' + this.currentRowKeyParent).then(res => {
                this.List = res.data;
                this.getDevicetype().then(() => {
                    this.dialogVisibleParent = true;
                });
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'assetNum') v.value = '';
                    else v.value = this.List[v.prop];
                });
            });
        },
        selectionChangeHandler(selection) {
            this.selection = selection;
        }
    }
};
</script>

<style scoped lang="stylus">
.import
    display inline-block

.ledge
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
