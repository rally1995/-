<template lang="pug">
    ebrain-main.workshop
        ebrain-frame(
            title="工作中心")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="getDataParent"
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
            title="设备产能")
            template(#tools)
                ebrain-tools(:buttons="btnsBottom")
            template(#table)
                ebrain-table(
                    :tableLoading='tableLoadingDown'
                    :isShow='false'
                    :data="tableDataSon"
                    :column="tableColumnSon"
                    row-key="id"
                    highlight-current-row
                    @row-dblclick="editRowSon"
                    :current-row-key.sync="currentRowKeySon")
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
export default {
    name: 'workshop',
    data() {
        return {
            submitLoading: false,
            tableLoadingDown: false,
            tableLoadingTop: false,
            deptNameTree: {},               // 部门信息树
            tableDataParent: [],            // 存储上表信息
            tableDataSon: [],               // 存储下表信息
            List: [],                       // 修改页信息
            tableColumnParent: [{
                label: '工作中心编码',
                prop: 'workCenterCode',
                showOverflowTooltip: true,
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                showOverflowTooltip: true,
            }, {
                label: '部门编码',
                prop: 'departmentCode',
                showOverflowTooltip: true,
            }, {
                label: '部门名称',
                prop: 'deptName',
                showOverflowTooltip: true,
            }, {
                label: '当前状态',
                prop: 'isEffective',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.productionStats[cell];
                },
            }, {
                label: '工时类型',
                prop: 'workingHoursType',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.workingHoursType[cell];
                },
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
            }, {
                label: '设备编号',
                prop: 'equipmentCode',
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '标准产能（PCS/小时）',
                prop: 'standardCapacity',
                showOverflowTooltip: true,
            }, {
                label: '综合效率（%）',
                prop: 'overallEffectiveness',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'remark',
                showOverflowTooltip: true,
            }],
            dialogFormParent: [{            // 上表修改页信息
                label: '工作中心编码',
                prop: 'workCenterCode',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                value: '',
                required: true,
            }, {
                label: '部门名称',
                prop: 'deptName',
                option: [],
                value: '',
                type: 'selecttree',
                nodeKey: 'deptName',
                nodeLabel: 'deptName',
                change: val => {
                    this.dialogFormParent[3].value = val.deptCode;
                },
            }, {
                label: '部门编码',
                prop: 'departmentCode',
                value: '',
                disabled: true,
            }, {
                label: '当前状态',
                prop: 'isEffective',
                required: true,
                value: '',
                type: 'select',
                option: dict.productionStats,
            }, {
                label: '工作类型',
                prop: 'workingHoursType',
                required: true,
                value: '',
                type: 'select',
                option: dict.workingHoursType,
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            dialogFormSon: [{
                label: '设备编号',
                prop: 'equipmentCode',
                value: '',
                required: true,
                disabled: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
                type: 'select',
                option: {},
                nodeKey: 'equipName',
                nodeLabel: 'equipName',
                change: val => {
                    this.dialogFormSon[0].value = val;
                },
            }, {
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^\d+(\.?\d{0,4})$/;
                        if (value !== '') {
                            if (!reg.test(value)) {
                                callback(new Error('请输入四位小数的正数或0'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                label: '标准产能',
                prop: 'standardCapacity',
                value: '',
                required: true,
                // change: (val) => {
                //     let num = Number(val) || 0;
                //     num = Math.abs(num.toFixed(4));
                //     num = Number(num);
                //     this.dialogFormSon[2].value = num;
                // }
            }, {
                label: '综合效率(%)',
                prop: 'overallEffectiveness',
                value: '',
                required: true,
                rule: {
                    validator: (rule, value, callback) => {
                        let reg =  /^\d+(\.?\d{0,4})$/;
                        if (value !== '') {
                            if (!reg.test(value) || value > 100) {
                                callback(new Error('请输入0-100且最多为四位小数'));
                            } else {
                                callback();
                            }
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur',
                },
                // change: (val) => {
                //     let num = Number(val) || 0;
                //     num = Math.abs(num.toFixed(4));
                //     num = Number(num);
                //     this.dialogFormSon[3].value = num;
                // }
            }, {
                label: '备注',
                prop: 'remark',
                type: 'textarea',
                value: '',
            }],
            pageTotal: 0,
            pageSize: 20,
            currentPage: 1,
            currentRowKeyParent: '',
            dialogParent: '',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            routeCode: '',
            searchVisible: true,
            searchForm: [{
                label: '工作中心编码',
                prop: 'workCenterCode',
                value: ''
            }, {
                label: '工作中心名称',
                prop: 'workCenterName',
                value: ''
            }],
            btnsTop: [{
                label: '新增',
                click: () => this.newRowParent(),
                className: 'iconfont iconstatus-Preserve-and-add',
                permi: 'productionplan_workcenter_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-edit',
                permi: 'productionplan_workcenter_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-delete',
                permi: 'productionplan_workcenter_del',
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
                permi: 'productionplan_equipmentpe_add',
                disabled: () => !this.currentRowKeyParent,
            }, {
                label: '修改',
                click: () => this.editRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-edit',
                permi: 'productionplan_equipmentpe_edit',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.editDisabledSon,
                className: 'iconfont iconstatus-delete',
                permi: 'productionplan_equipmentpe_del',
            }]
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
    },
    created() {
        this.getDataParent();
    },
    methods: {
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        // 获取设备台账明细
        getEquipmentInfo() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.get(`/devicemanager/deviceaccount/getDeviceEquipmentAccount/${item.workCenterCode}`).then(res => {
                let obj = {};
                const item = this.dialogFormSon.find(v => v.prop === 'equipName');
                res.data.forEach((item, index) => {
                    if (item.assetStatus === '1') {
                        obj[item.equipNum] = item.equipName;
                    }
                });
                item.option = obj;
            });
        },
        // 获取部门名称信息
        getdeptNameTree() {
            this.$http.get('/admin/dept/tree').then(res => {
                const item = this.dialogFormParent.find(v => v.prop === 'deptName');
                item.option = res.data;
            });
        },
        // 获取上表信息
        getDataParent(val = 1) {
            const conditionList = [];
            this.tableLoadingTop = true;
            this.searchForm.forEach(v => {
                if (v.value) {
                    conditionList.push({
                        fieldName: v.prop,
                        operation: 'LIKE',
                        value: v.value,
                        joinType: 'OR',
                    });
                }
            });
            this.$http.get('/productionplan/workcenter/page', {
                params: {
                    current: val,
                    size: this.pageSize,
                    conditionList,
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.currentPage = val;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        // 获取下表信息
        getDataSon() {
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.get(`/productionplan/equipmentpe/info/${item.workCenterCode}`).then(res => {
                this.tableLoadingDown = false;
                this.tableDataSon = res.data;
            });
        },
        // 改变上表页码时获取的数据
        changeCurrent(val) {
            this.getDataParent(val);
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
            this.dialogFormParent[0].disabled = false;
            this.dialogVisibleParent = true;
            this.dialogFormParent[5].value = '1';
            this.dialogFormParent[4].value = '1';
            this.getdeptNameTree();
        },
        // 上表修改页面
        editRowParent() {
            this.dialogParent = 'edit';
            this.dialogFormParent[0].disabled = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.dialogFormParent.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogVisibleParent = true;
        },
        // 删除上表数据
        delRowParent() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            if (item.isEffective === '1') {
                this.$confirm('有效状态不能删除。', '提示');
            } else {
                const title = this.tableDataSon.length !== 0 ? '存在子表，是否确认删除' : '是否确认删除';
                this.$confirm(title, '提示', {
                    type: 'warning'
                }).then(() => {
                    this.submitLoading = true;
                    this.$http.delete('/productionplan/workcenter/removeByIds', {
                        data: [this.currentRowKeyParent],
                    }).then(() => {
                        this.submitLoading = false;
                        this.tableDataSon = [];
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
            }
        },
        // 提交上表新增或者修改数据
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogParent === 'new') {
                this.$http.post('/productionplan/workcenter', obj).then(() => {
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
                this.$http.put('/productionplan/workcenter', obj).then(() => {
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
        // 下表新增页面
        newRowSon() {
            this.dialogSon = 'new';
            this.dialogVisibleSon = true;
            this.getEquipmentInfo();
            this.dialogFormSon[2].value = 0;
            this.dialogFormSon[3].value = 0;
        },
        // 下表修改页面
        editRowSon() {
            this.getEquipmentInfo();
            this.dialogSon = 'edit';
            const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
            this.dialogFormSon.forEach(v => {
                v.value = item[v.prop];
            });
            this.dialogVisibleSon = true;
        },
        // 删除下表信息
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/productionplan/equipmentpe/removeByIds', {
                    data: [this.currentRowKeySon],
                }).then(() => {
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
        // 提交下表新增或者修改数据
        submitFormSon() {
            let obj = {};
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            this.submitLoading = true;
            if (this.dialogSon === 'new') {
                const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                obj.workCenterCode = item.workCenterCode;
                this.$http.post('/productionplan/equipmentpe', obj).then(() => {
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
                this.$http.put('/productionplan/equipmentpe', obj).then(() => {
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
    }
};
</script>

<style scoped lang="stylus">
.workshop
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
