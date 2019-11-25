<template lang="pug">
    ebrain-main
        ebrain-frame(title="托盘绑定")
            template(#tools)
                .first
                    ebrain-tools
                        el-radio-group(v-model="radio")
                            el-radio(:label="0") 质检
                            el-radio(:label="1") 非限制
                            el-radio(:label="2") 冻结
                    ebrain-tools
                        .formSource
                            el-form(inline)
                                el-form-item
                                    el-radio(v-model="port" label="A") 料口A
                                    span.pallent 托盘ID
                                    el-input(:disabled = "port !== 'A'" v-model="trayCodes.trayCodeA")
                                el-form-item
                                    el-radio(v-model="port" label="B" ) 料口B
                                    span.pallent 托盘ID
                                    el-input(:disabled = "port !== 'B'" v-model="trayCodes.trayCodeB")
                                el-form-item
                                    el-radio(v-model="port" label="C") 料口C
                                    span.pallent 托盘ID
                                    el-input(:disabled = "port !== 'C'" v-model="trayCodes.trayCodeC")
                        template(#footer)
                        el-button(type="primary" @click="collarTray" :disabled = "trayDisable" :class="{disabled: trayDisable}") 开始领托盘
            template(#table)
                ebrain-table(
                    :tableLoading='tableDataParentLoading'
                    :isShow='false'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    row-key="id"
                    highlight-current-row
                    @selection-change="selection_change"
                    @changeCurrent="changeCurrent"
                    @changeSize='changeSize'
                    @row-click="getpost"
                    :current-row-key.sync="currentRowKeyParent")
        .twoSide
            ebrain-frame(title="录入托盘列表")
                template(#tools)
                    ebrain-tools(
                        :add="InputTray"
                        :addDisabled="currentRowKeyParent === ''")
                template(#table)
                        ebrain-table(
                            :tableLoading='tableLoadingDownL'
                            :pageSize='pageSize_left'
                            :currentPage='currentPage_left'
                            :pageTotal='pageTotal_left'
                            :data="tableDataSonL"
                            :column="tableColumnL"
                            @changeCurrent="changeCurrent_left"
                            @changeSize='changeSize_left'
                            row-key="id"
                            highlight-current-row
                            :current-row-key.sync="currentRowKeySon")
                            template(#index)
                                el-table-column(
                                    label="序号"
                                    width="65"
                                    align="center")
                                    template(v-slot="{row, $index}")
                                        |{{$index === 0 ? '' : $index}}
                            template(#tagCode)
                                el-table-column(label="标签ID")
                                    template(v-slot="{row, $index}")
                                        el-input(
                                            v-if="$index === 0"
                                            @keyup.enter.native="lossInput"
                                            v-model="form.tagCode")
                                        span(v-else) {{row.tagCode}}
                            template(#tagQuantity)
                                el-table-column(label="数量")
                                     template(v-slot="{row}")
                                        span {{row.tagQuantity}}
                            template(#status)
                                el-table-column(label="状态" center)
                                    template(v-slot="{row}")
                                        span(:class="{ 'blue': row.status==='0','orange':row.status === '1'}")
                            template(#operate)
                                el-table-column(label="操作")
                                    template(v-slot="{row, $index}")
                                        el-button(
                                            v-if="$index===0"
                                            type="primary"
                                            @click="lossInput") 确定
                                        i.el-icon-delete(
                                            v-else
                                            @click="delRowSonL($index)")
                        el-button.submitButton(type="primary" @click="submit" :disabled ="tableDataSonL.length < 2") 提交
            ebrain-frame(
                title="托盘绑定列表")
                template(#table)
                        ebrain-table(
                            :tableLoading='tableLoadingDwonR'
                            :pageSize='pageSize_right'
                            :currentPage='currentPage_right'
                            :pageTotal='pageTotal_right'
                            :data="tableDataSonR"
                            :column="tableColumnSonR"
                            @changeCurrent="changeCurrent_right"
                            @changeSize='changeSize_right'
                            row-key="id"
                            highlight-current-row
                            :current-row-key.sync="currentRowKeySonR")
                            template(#delpallent)
                                el-table-column(
                                    label="操作"
                                    align="center")
                                    template
                                        el-button(
                                            width="50"
                                            type="primary"
                                            @click="delRowSon(row)") 删除
</template>
<script>
// import dict from '@/utils/dict';
export default {
    name: 'pallentstorage',
    data() {
        return {
            isClick: false,
            radio: 0,
            tableDataParentLoading: false,
            tableLoadingDwonR: false,
            tableLoadingDownL: false,
            tableLoadingDownR: false,
            tableDataSonL: [],
            lossFocus: true,
            port: 'A',
            tagID: '',
            submitLoading: false,
            tableDataParent: [],            // 存储上表信息
            tableDataSon: [],               // 存储下表信息
            tableColumnL: [{                // 下表头左
                slot: 'index',
            }, {
                slot: 'tagCode',
            }, {
                slot: 'tagQuantity',
            }, {
                slot: 'status'
            }, {
                slot: 'operate',
            }],
            tableColumnSonR: [{           // 下表头右
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
                index: index => {
                    return (this.currentPage_right - 1) * this.pageSize_right + index + 1;
                },
            }, {
                label: '标签ID',
                prop: 'tagCode',
                showOverflowTooltip: true,
            }, {
                label: '托盘号',
                prop: 'trayCode',
                showOverflowTooltip: true,
            }],
            tableColumnParent: [{           // 上表头
                type: 'selection',
                width: 35,
            }, {
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
            }, {
                label: '收货计划号',
                prop: 'prPlanCode',
                showOverflowTooltip: true,
            }, {
                label: '收料凭证号',
                prop: 'prCertificateCode',
                showOverflowTooltip: true,
            }, {
                label: '料号',
                prop: 'matnr',
                showOverflowTooltip: true,
            }, {
                label: '物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '标签(个)',
                prop: 'tagNumber',
                showOverflowTooltip: true,
            }, {
                label: '待入库',
                prop: 'pendingStorageNumber',
                showOverflowTooltip: true,
            }],
            dialogFormAllotOrder: [{
                label: '分配数量',
                prop: 'allottQuantity',
                value: '',
            }],
            pageTotal_left: 0,
            pageTotal: 0,
            pageSize_left: 20,
            currentPage_left: 1,
            currentPage: 1,
            pageSize: 20,
            pageTotal_right: 0,
            pageSize_right: 20,
            currentPage_right: 1,
            currentRowKeyParent: '',
            currentRowKeySonR: '',
            dialogParent: '',
            dialogSon: '',
            dialogVisibleAllotOrder: false,
            currentRowKeySon: '',
            isIndex: 0,
            selection: [],
            tableDataSonR: [],
            form: {
                tagCode: '',
                tagQuantity: '',
                status: '',
            },
            trayCodes: {
                trayCodeA: '',
                trayCodeB: '',
                trayCodeC: '',
            }
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledWorkCenter() {
            return this.currentRowKeyWorkCenter === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
        trayDisable() {
            return this.currentRowKeyParent === '' || this.radio === '' || this.port === '' || !JSON.stringify(this.trayCodes) === '';
        },
    },
    created() {
        this.getDataParent();
    },
    methods: {
        // 获取上表中的左表信息
        getDataParent(val = 1) {
            this.tableDataParentLoading = true;
            this.$http.get('/purchase/traybinding/page', {
                params: {
                    current: val,
                    size: this.pageSize,
                },
            }).then(res => {
                this.currentPage = val;
                this.tableDataParentLoading = false;
                this.tableDataParent = res.data.records;
                this.pageTotal = res.data.total;
            });
        },
        // 开始领托盘
        collarTray() {
            let obj = {};
            for (let k in this.trayCodes) {
                if (this.trayCodes[k]) obj.trayCode = this.trayCodes[k];
            }
            obj.stockStatus = this.radio;
            obj.materialPort = this.port;
            this.$http.put('/purchase/traybinding/updateById', obj).then(({ code, data }) => {
                this.$message({
                    message: '领取成功!',
                    type: 'success',
                });
                this.getDataParent();
            });
        },
        getpost() {
            this.getDataSonL();
            this.getDataSonR();
        },
        // 获取录入托盘列表
        getDataSonL() {
            this.tableLoadingDwonL = true;
            this.$http.get(`/purchase/trayinputingdet/page`, {
                params: {
                    current: this.currentPage_left,
                    size: this.pageSize_left
                }
            }).then(res => {
                this.tableLoadingDwonL = false;
                this.tableDataSonL = res.data.records;
                this.pageTotal_left = res.data.total;
            });
        },
        // 获取托盘绑定列表
        getDataSonR() {
            this.tableLoadingDwonR = true;
            // const item = this.tableDataParent.find(v => v.id === this.currentRowKeySonR);
            this.$http.get(`/purchase/traybindingdet/page`, {
                params: {
                    current: this.currentPage_right,
                    size: this.pageSize_right
                }
            }).then(res => {
                this.tableLoadingDwonR = false;
                this.tableDataSonR = res.data.records;
                this.pageTotal_right = res.data.total;
            });
        },
        // 上表分页
        changeCurrent(val) {
            this.getDataParent(val);
        },
        changeSize(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.getDataParent();
        },
        // 改变上表页码时获取的数据
        changeCurrent_right(val) {
            this.currentPage_right = val;
            this.getDataSonR();
        },
        // 改变上表页面数据数时获取的数据
        changeSize_left(val) {
            this.pageSize_left = val;
            this.currentPage_left = 1;
            this.getDataSonL();
        },
        changeCurrent_left(val) {
            this.currentPage_right = val;
            this.getDataSonL();
        },
        // 改变上表页面数据数时获取的数据
        changeSize_right(val) {
            this.pageSize_right = val;
            this.currentPage_right = 1;
            this.getDataSonR();
        },
        // 录入托盘列表删除
        delRowSonL(index) {
            this.tableDataSonL.splice(index - 1, 1);
        },
        selection_change(val) {
            this.selection = val;
        },
        // Input回车的时候触发
        lossInput() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.post(`/purchase/trayinputingdet/scanInputId`, null, {
                params: {
                    tagCode: this.form.tagCode,
                    bizPrTrayBindingCode: item.id,
                }
            }).then(res => {
                this.tableDataSonL.push({
                    tagCode: this.form.tagCode,
                    tagQuantity: res.data.tagQuantity,
                    status: res.data.status,
                });
                this.form = {
                    tagCode: '',
                    tagQuantity: '',
                    status: '',
                };
            });
            // this.tableDataSonL.push({
            //         tagCode: this.form.tagCode,
            //         tagQuantity: this.form.tagQuantity,
            //         status: this.form.status,
            //     });
            //     this.form = {
            //         tagCode: '',
            //         tagQuantity: '',
            //         status: '',
            //     };
            // let newArr = [...this.tableDataSon];
            // newArr.push({
            //     tagCode: '',
            //     tagQuantity: '',
            //     status: '',
            // });
            // this.tableDataSonL = [...newArr];
            this.isIndex++;
        },
        InputTray() {
            this.tableDataSonL = [];
            this.isIndex = 0;
            this.tableDataSonL.unshift({
                tagCode: '',
                tagQuantity: '',
                status: '',
            });
        },
        //  提交
        submit() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.post(`/purchase/trayinputingdet/submit`, null, {
                params: {
                    bizPrTrayBindingCode: item.id,
                }
            }).then((res) => {
                this.$message.success('添加成功');
                this.getDataSonR();
                this.tableDataSon = [];
            });
        },
    }
};
</script>

<style scoped lang='stylus'>
* >>> td:nth-child(4)
    span
        display block
        width 20px
        height 20px
        border-radius 50%
        &.blue
            background-color #1890ff
        &.orange
             background-color #ff6633
.first >>> .tools
        padding 7px 15px
        display flex
        justify-content space-between
        align-items center
        button
            background-color #409EFF
            color #fff
            border none
        .disabled
            cursor not-allowed
            color #b7becd
            background-color #f5f5f5
            border 1px solid #ccc

.formSource >>> .el-form
    display flex
    .el-form-item
        margin-bottom 0
        .el-form-item__content
            display flex
            align-items center
            .el-radio
                margin-right 15px
                line-height 2
            .pallent
                display inline-block
                width 80px
                font-size 14px
                color #606266
                line-height 1
.twoSide
    height 50%
    width 100%
    display flex
    justify-content space-between
    flex-direction: row
    flex-wrap nowrap
    margin-top 5px
    .frame:first-child
        .tableWrap
            height 90%
        .submitButton
            float right
            margin-top 10px
    & > *
        width 100% // calc
        margin-left 5px
        margin-top 0

        &:first-child
            width 70%
            margin-left 0px
            heigth 90%
    .frame + .frame
        margin-top 0
</style>
