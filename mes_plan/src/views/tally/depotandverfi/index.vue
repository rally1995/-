<template lang="pug">
    ebrain-main.verfi
        ebrain-frame(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchTop"
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
                    @changeSize='changeSize'
                    @selection-change="changeHandler")
        el-dialog.dialogtTable(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisible"
            @submit="submitForm")
            ebrain-frame(title="装车校验")
                template(#table)
                    ebrain-table(
                        :isShow="false"
                        :tableLoading="tableLoadingParent"
                        highlight-current-row
                        :expandVisible="false"
                        row-key="id"
                        @row-click="getPos"
                        :data="tableDataParent"
                        :column="tableColumnParent"
                        :current-row-key.sync="currentRowKeyParent")
                    el-button(v-if="noteStatus === 501" @click="startValite" :disabled="startDisabled") 开始校验
                    el-button(v-else-if="noteStatus === 502" @click="stopValite") 暂存退出
            .twoSide
                ebrain-frame
                    template(#table)
                        ebrain-table(
                            :isShow="false"
                            :tableLoading="tableLoadingSonL"
                            highlight-current-row
                            :expandVisible="false"
                            :current-row-key.sync="currentRowKeySonL"
                            row-key="id"
                            :data="tableDataSonL"
                            :column="tableColumnSonL")
                ebrain-frame
                    template(#table)
                        ebrain-table.statusTable(
                            ref="tableTag"
                            :isShow="false"
                            :tableLoading="tableLoadingSonR"
                            highlight-current-row
                            :expandVisible="false"
                            :current-row-key.sync="currentRowKeySonR"
                            row-key="id"
                            :data="tableDataSonR"
                            :column="tableColumnSonR")
                            template(#index)
                                el-table-column(
                                    label="序号"
                                    width="65"
                                    align="center")
                                    template(v-slot="{row, $index}")
                                        |{{$index === 0 ? '' : $index}}
                            template(#tagId)
                                el-table-column(label="标签ID")
                                    template(v-slot="{row, $index}")
                                        el-input(
                                            ref="tag"
                                            v-if="$index === 0"
                                            :disabled="noteStatus !== 502 || isbol"
                                            @keyup.enter.native="startValite"
                                            v-model="notesCheckLebalId")
                                        span(v-else) {{row.notesCheckLebalId}}
                            template(#status)
                                el-table-column(label="状态" center)
                                    template(v-slot="{row}")
                                        span(:class="{ 'blue' :row.checkStatus=== '0','orange':row.checkStatus === '1'}")
                            template(#operate)
                                el-table-column(label="操作")
                                    template(v-slot="{row, $index}")
                                        span(v-if="$index===0")
                                        i.el-icon-delete(
                                            v-else
                                                @click="delDetail(row)")
                        .buttons
                            el-button(@click="continueValite" :disabled="continueDisabled") 继续扫描
                            el-button(@click="resetValite" :disabled="continueDisabled") 重新开始扫描
                            el-button(@click="submitValite" :disabled="continueDisabled") 提交结果

</template>
<script>
import dict from '@/utils/dict';
import { mapState, mapActions } from 'vuex';
export default {
    name: 'index',
    data() {
        return {
            submitLoading: false,
            tableLoading: false,
            noteStatus: 501,
            tableData: [],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            multiption: '',
            searchVisible: true,
            isContinue: '',
            searchForm: [{
                label: '装车单号',
                prop: 'notesLoadNo',
                value: '',
            }, {
                label: '单据状态',
                type: 'select',
                option: {},
                prop: 'noteStatus',
                value: '',
            }],
            tableColumn: [{
                label: '装车单号',
                prop: 'notesLoadNo',
                showOverflowTooltip: true,
            }, {
                label: '出货日期',
                prop: 'deliveryDate',
                showOverflowTooltip: true,
            }, {
                label: '车牌号',
                prop: 'carNumber',
                showOverflowTooltip: true,
            }, {
                label: '车型',
                prop: 'carType',
                showOverflowTooltip: true,
            }, {
                label: '已扫描件数',
                prop: 'checkedNum',
                showOverflowTooltip: true,
            }, {
                label: '校验结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.isSuccess[cell];
                }
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_TALLY_STATUS'][cell];
                },
            }],
            dialogForm: [{
                label: '供应商名称',
                prop: 'supplierName',
                value: '',
                required: true,
            }, {
                label: '供应商编号',
                prop: 'supplierCode',
                value: '',
                required: true,
            }, {
                label: '供应商状态',
                prop: 'status',
                value: '',
                type: 'select',
                option: dict.supplier_status,
                required: true,
            }, {
                label: '联系人',
                prop: 'contact',
                value: '',
            }, {
                label: '联系方式',
                prop: 'contactInformation',
                value: '',
            }, {
                label: '邮箱',
                prop: 'email',
                value: '',
            }, {
                label: '来源',
                prop: 'source',
                value: '',
                type: 'select',
                option: dict.source,
                disabled: true,
            }, {
                label: '备注',
                prop: 'description',
                type: 'textarea',
                value: '',
            }],
            btnsTop: [
                // {
                //     label: '打印装车单',
                //     click: () => this.newRow(),
                //     disabled: true,
                //     className: 'iconfont iconstatus-Preserve-and-add',
                //     permi: 'purchase_prsupplierinfo_add',
                // },
                {
                    label: '开始校验',
                    click: () => this.editRow(),
                    className: 'iconfont iconstatus-edit',
                    disabled: () => this.editDisabled,
                    permi: 'purchase_prsupplierinfo_edit',
                },
                // {
                //     label: '打印COC',
                //     click: () => this.delRow(),
                //     className: 'iconfont iconstatus-delete',
                //     disabled: true,
                //     permi: false,
                // }, {
                //     label: '打印放行条',
                //     click: () => this.delRow(),
                //     className: 'iconfont iconstatus-delete',
                //     disabled: true,
                //     permi: false,
                // },
                {
                    label: '发运完成并过账',
                    click: () => this.perform(),
                    className: 'iconfont iconstatus-delete',
                    disabled: () => this.performDisabled,
                    permi: 'tallymanager_tallycheckde_delivery',
                },
                {
                    label: '搜索',
                    click: () => { this.searchVisible = !this.searchVisible },
                    className: 'iconfont iconsearch fr',
                    permi: false,
                }
            ],
            currentRowKey: '',
            dialogType: '',
            dialogVisible: false,
            tableLoadingParent: false,
            currentRowKeyParent: '',
            tableDataParent: [],
            tableColumnParent: [{
                label: '装车单号',
                prop: 'notesLoadNo',
                showOverflowTooltip: true,
            }, {
                label: '出货日期',
                prop: 'deliveryDate',
                showOverflowTooltip: true,
            }, {
                label: '车牌号',
                prop: 'carNumber',
                showOverflowTooltip: true,
            }, {
                label: '车型',
                prop: 'carType',
                showOverflowTooltip: true,
            }, {
                label: '已扫描件数',
                prop: 'checkedNum',
                showOverflowTooltip: true,
            }, {
                label: '校验结果',
                prop: 'checkResult',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return dict.isSuccess[cell];
                }
            }, {
                label: '单据状态',
                prop: 'noteStatus',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['BILL_TALLY_STATUS'][cell];
                },
            }],
            tableLoadingSonL: false,
            currentRowKeySonL: '',
            tableDataSonL: [],
            notesCheckLebalId: '',
            objParent: {},
            isbol: true,
            tableColumnSonL: [{
                label: 'LOT',
                prop: 'lotNum',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'amount',
                showOverflowTooltip: true,
            }, {
                label: '标签ID',
                prop: 'labelId',
                showOverflowTooltip: true,
            }],
            tableLoadingSonR: false,
            currentRowKeySonR: '',
            tableDataSonR: [],
            conditionList: [],
            tableColumnSonR: [{
                slot: 'index'
            }, {
                slot: 'tagId',
            }, {
                slot: 'status'
            }, {
                slot: 'operate'
            }]
        };
    },
    computed: {
        ...mapState({
            storeDict: state => state.dict,
        }),
        editDisabled() {
            return !this.currentRowKey;
        },
        delDisabled() {
            return this.multiption.length === 0;
        },
        startDisabled() {
            return !this.currentRowKeyParent;
        },
        submitDisabled() {
            return this.noteStatus === 503 || this.noteStatus === 504;
        },
        continueDisabled() {
            return this.noteStatus !== 502 || this.currentRowKeyParent === '';
        },
        performDisabled() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            return !item || (item && item.noteStatus !== 503);
        }
    },
    watch: {
        dialogVisible(val) {
            if (!val) {
                this.currentRowKeyParent = '';
                this.tableDataParent = [];
                this.tableDataSonL = [];
                this.tableDataSonR = [];
                this.isbol = true;
                this.getData();
            }
        }
    },
    mounted() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            const params = { 501: obj['501'], 502: obj['502'], 503: obj['503'], 504: obj['504'] };
            this.searchForm[1].option = params;
        });
    },
    activated() {
        Promise.all([this.queryDict('BILL_TALLY_STATUS')]).then(() => {
            this.getData();
            const obj = this.storeDict['BILL_TALLY_STATUS'];
            const params = { 501: obj['501'], 502: obj['502'], 503: obj['503'], 504: obj['504'] };
            this.searchForm[1].option = params;
        });
    },
    methods: {
        ...mapActions(['queryDict']),
        searchTop() {
            this.conditionList = [];
            this.currentPage = 1;
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
            this.getData();
        },
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList,
            };
            // this.searchForm.forEach(v => {
            //     if (v.value) {
            //         params.conditionList.push({
            //             fieldName: v.prop,
            //             operation: 'LIKE',
            //             value: v.value,
            //             joinType: 'AND',
            //         });
            //     }
            // });
            this.$http.get(`/tallymanager/tallycheck/page`, {
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
            this.dialogForm[2].value = '1';
            this.dialogForm[6].value = '0';
        },
        editRow() {
            this.getDataParent().then(() => {
                this.dialogVisible = true;
            });
        },
        getDataParent() {
            return this.$http.get(`/tallymanager/tallycheck/getById/${this.currentRowKey}`).then(res => {
                this.tableDataParent = [res.data];
                this.noteStatus = res.data['noteStatus'];
                // this.objParent = res.data;
            });
        },
        delRow() {
            const delData = this.multiption.map(v => v.id);
            const isBoolean = this.multiption.some(v => {
                if (v.source === '1' || v.status === '1') {
                    this.$alert('供应商来源于SAP系统或者启用状态，不能删除', {
                        type: 'warning'
                    });
                    return true;
                }
                return false;
            });
            if (isBoolean) return;
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/purchase/prsupplierinfo/removeByIds', {
                    data: delData,
                }).then(() => {
                    this.submitLoading = false;
                    this.getData();
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
                this.$http.post('/purchase/prsupplierinfo/save', obj).then(() => {
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
                this.$http.put('/purchase/prsupplierinfo/updateById', obj).then(() => {
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
        },
        getPos() {
            this.getDataSonL();
            this.getDataSonR();
        },
        getDataSonL() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.get(`/tallymanager/tallybatchlabel/getFilterCheckNoPage/${item.notesCheckNo}`).then(res => {
                this.tableDataSonL = res.data.records;
            });
        },
        getDataSonR() {
            const params = {
                size: 999,
                conditionList: [],
            };
            if (this.currentRowKeyParent !== '') {
                const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
                params.conditionList.push({
                    fieldName: 'notesCheckNo',
                    operation: 'EQ',
                    value: item.notesCheckNo,
                });
            }
            this.$http.get(`/tallymanager/tallycheckde/page`, {
                params
            }).then(res => {
                this.tableDataSonR = res.data.records;
                this.tableDataSonR.unshift({
                    notesCheckLebalId: '',
                    checkStatus: '',
                });
                this.notesCheckLebalId = '';
            });
        },
        // 开始校验
        startValite() {
            this.isbol = false;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            const params = {
                id: item.id,
                notesCheckLebalId: '',
            };
            if (this.notesCheckLebalId !== '') {
                params.notesCheckLebalId = this.notesCheckLebalId;
            }
            this.$http.post(`/tallymanager/tallycheck/startChecking`, null, { params }).then(res => {
                this.getData();
                this.getDataParent().then(() => {
                    this.getDataSonL();
                    this.getDataSonR();
                });
            }).catch(() => {
                this.notesCheckLebalId = '';
            });
        },
        // 暂存退出
        stopValite() {
            this.dialogVisible = false;
        },
        delDetail(row) {
            if (this.noteStatus === 503 || this.noteStatus === 504) {
                this.$alert(`校验完成和发运过账状态不可删除!`, {
                    type: 'error',
                });
                return;
            }
            this.$http.delete(`/tallymanager/tallycheckde/removeByIds`, {
                data: [row.id]
            }).then(() => {
                this.getDataSonR();
                this.getDataSonL();
                this.getData();
                this.getDataParent().then(() => {
                    this.getDataSonL();
                    this.getDataSonR();
                });
                this.$message.success('删除成功');
            });
        },
        // 继续扫描
        continueValite() {
            this.isbol = false;
            this.$nextTick(() => {
                this.$refs.tag.focus();
            });
            // const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            // const params = {
            //     notesCheckLebalId: this.notesCheckLebalId,
            //     notesCheckNo: item.notesCheckNo,
            // };
            // this.$http.post('/tallymanager/tallycheckde/scanLabel', null, {
            //     params
            // }).then(() => {
            //     this.getData();
            //     this.getDataParent().then(() => {
            //         this.getDataSonL();
            //         this.getDataSonR();
            //     });
            // });
        },
        // 重新扫描
        resetValite() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            const params = {
                notesCheckLebalId: this.notesCheckLebalId,
                notesCheckNo: item.notesCheckNo,
            };
            this.$http.post('/tallymanager/tallycheckde/restartScanLabel', null, {
                params
            }).then(() => {
                this.getData();
                this.getDataParent().then(() => {
                    this.getDataSonL();
                    this.getDataSonR();
                    this.isbol = false;
                    this.$nextTick(() => {
                        this.$refs.tag.focus();
                    });
                });
            });
        },
        // 提交结果
        submitValite() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            const params = {
                notesCheckNo: item.notesCheckNo,
            };
            this.$http.post('/tallymanager/tallycheckde/submitTallyCheckDe', null, {
                params
            }).then(() => {
                this.getData();
                this.getDataParent().then(() => {
                    this.getDataSonL();
                    this.getDataSonR();
                });
            });
        },
        // 发运完成并过账
        perform() {
            const item = this.tableData.find(v => v.id === this.currentRowKey);
            this.$http.post(`/tallymanager/tallycheck/deliveryCompletedAndPost`, null, {
                params: {
                    notesCheckNo: item.notesCheckNo,
                }
            }).then(() => {
                this.$message.success('发运过账成功!');
                this.getData();
            });
        }
    }
};
</script>
<style lang="stylus" scoped>
.verfi
    & >>> .fr
        float right

    .dialogtTable >>>
        .el-dialog
            width 120vh
            height 75vh

        .frame:first-child
            .frame-table
                height 13vh
                display flex
                justify-content space-between

                .tableWrap
                    flex 1

                .el-button
                    margin-left 10px
                    width 150px

        .twoSide
            height 50%
            width 100%
            display flex
            justify-content space-between
            flex-direction: row
            flex-wrap nowrap
            margin-top 15px
            padding-bottom 10px

            .el-icon-delete
                font-size 15px

        .frame
            flex 1

            .frame-table
                height 35vh

        .frame + .frame
            margin-top 0
            margin-left 20px
            padding-bottom 40px

            .buttons
                padding 10px 0
                display flex
                justify-content space-between

    .statusTable >>> td:nth-child(3)
        span
            display block
            width 20px
            height 20px
            border-radius 50%
            &.blue
                background-color #1890ff
            &.orange
                 background-color #ff6633

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

