<template lang="pug">
    ebrain-main
        ebrain-frame.bindPa(title="托盘绑定")
            template(#table)
                ebrain-table(
                    :tableLoading='tableDataParentLoading'
                    :isShow='false'
                    :data="tableDataParent"
                    :column="tableColumnParent"
                    :pageSize='pageSize'
                    :currentPage='currentPage'
                    :pageTotal='pageTotal'
                    row-key="id")
        ebrain-frame.pallentool
            template(#tools)
                .first
                    ebrain-tools
                        el-radio-group(v-model="radio")
                            el-radio(:label="0" :disabled="trayDisable") 质量检验
                            el-radio(:label="1" :disabled="trayDisable") 非限制使用
                            el-radio(:label="2" :disabled="trayDisable") 冻结的库存
                    ebrain-tools
                        .formSource
                           el-form(inline)
                                el-row(:gutter="20")
                                    el-col(:span="8")
                                        //- el-form-item(label="料口区域")
                                        //-     el-select(v-model="port" :disabled="trayDisable" @change="handlerCode")
                                        //-         el-option( v-for="item in options"
                                        //-             :key="item.mpAreaNo"
                                        //-             :label="item.mpAreaNo"
                                        //-             :value="item.mpAreaNo")
                                    el-col(:span="8")
                                        el-form-item(label="料口区域")
                                            el-input(v-model="port" :disabled="true")
                                    el-col(:span="8")
                                        el-form-item(label="料口编码")
                                            el-select(v-model="portCode" :disabled="trayDisable")
                                                el-option( v-for="item in portData"
                                                    :key="item.mpNo"
                                                    :label="item.mpNo"
                                                    :value="item.mpNo")
                                    el-col(:span="8")
                                        el-form-item(label="RFID")
                                            el-input(v-model="trayPallent" disabled)
                        template(#footer)
                        el-button(type="primary" @click="collarTray" :disabled = "trayDisable" :class="{disabled: trayDisable}" :loading="submitLoas || statrLoading") 开始领托盘
        .twoSide
            ebrain-frame(title="录入托盘列表")
                template(#table)
                        ebrain-table(
                            :isShow="false"
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
                                        //- span(:class="{ 'blue' :row.status=== 0,'orange':row.status === 1}")
                                        span(:class="{'blue': row.status === 0, 'orange': row.status === 1}")
                                        //- span(:class="{ 'blue' :row.status=== 0,'orange' :row.status === 1}")
                            template(#operate)
                                el-table-column(label="操作")
                                    template(v-slot="{row, $index}")
                                        span(v-if="$index===0")
                                        i.el-icon-delete(
                                            v-else
                                            @click="delRowSonL(row)")
                        el-button.submitButton(type="primary"
                                                @click="submit"
                                                :loading="submitLoading"
                                                :disabled ="submitValite") 提交
            ebrain-frame(
                title="托盘绑定列表")
                template(#table)
                        ebrain-table(
                            :isShow="false"
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
// - import _ from 'lodash';
export default {
    name: 'pallentstorage',
    props: {
        tableForm: Object,
        tav: Boolean,
    },
    data() {
        return {
            isSon: false,
            isClick: false,
            radio: 0,
            tableDataParentLoading: false,
            tableLoadingDwonR: false,
            tableLoadingDownL: false,
            tableLoadingDownR: false,
            tableDataSonL: [],
            portData: [],
            portCode: '',
            lossFocus: true,
            tagID: '',
            options: [],
            port: '7',
            trayPallent: '',
            submitLoading: false,
            submitLoas: false,
            statrLoading: false,
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
                width: 40,
                minWidth: 40,
            }, {
                label: '序号',
                type: 'index',
                align: 'center',
                width: 50,
            }, {
                label: '收货计划号',
                prop: 'prPlanCode',
                showOverflowTooltip: true,
                width: 180,
                minWidth: 180,
            }, {
                label: '收料凭证号',
                prop: 'prCertificateCode',
                showOverflowTooltip: true,
                width: 120,
                minWidth: 120,
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
            }, {
                label: '库存单位',
                prop: 'materialUnit',
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
            status: '',
            isGet: true,
            Appstatus: '',
            isLin: false,
            form: {
                tagCode: '',
                tagQuantity: '',
                status: '',
            },
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
            return this.tableForm.documentStatus === 3;
        },
        submitValite() {
            return this.tableDataSonL.length < 2 || this.tableForm.documentStatus === 3 || this.status === '1';
        },
        isSucess() {
            const { submitLoas, statrLoading, tableDataParent } = this;
            return {
                submitLoas,
                statrLoading,
                tableDataParent
            };
        }
    },
    watch: {
        tav(val) {
            if (!val) {
                this.tableDataParent = [];
                this.tableDataSonL = [];
                this.tableDataSonR = [];
                this.port = '7';
                this.portCode = '';
                this.trayPallent = '';
                this.radio = 0;
                this.currentRowKeyParent = '';
                this.isGet = false;
                this.isSon = false;
                this.isLin = false;
            } else {
                this.isGet = true;
                this.getDataParent();
                this.handlerCode();
            }
        },
        isSucess(val) {
            if (this.tav) {
                if (val.tableDataParent.length) {
                    if (!this.isSon) {
                        this.portCode = this.tableDataParent[0].materialPort;
                        this.trayPallent = this.tableDataParent[0].trayCode;
                        this.radio = this.tableDataParent[0].stockStatus;
                        this.currentRowKeyParent = this.tableDataParent[0].id;
                        this.isSon = true;
                        this.getDataSonR();
                    }
                }
                if (!val.submitLoas && !val.statrLoading) {
                    if (val.tableDataParent.length && val.tableDataParent[0].trayCode) {
                        if (!this.isLin) {
                            this.$message.success('领取成功');
                            this.isLin = true;
                            this.getDataSonL();
                            this.submitLoas = false;
                            this.portCode = this.tableDataParent[0].materialPort;
                            this.trayPallent = this.tableDataParent[0].trayCode;
                            this.radio = this.tableDataParent[0].stockStatus;
                            this.currentRowKeyParent = this.tableDataParent[0].id;
                        }
                        this.isGet = false;
                    }
                }
            }
        },
    },
    mounted() {
        this.getDataParent();
        this.handlerCode();
    },
    methods: {
        // 获取上表中的左表信息
        getDataParent() {
            const params = {
                size: 999,
                conditionList: [{
                    fieldName: 'prPlanCode',
                    joinType: 'AND',
                    operation: 'EQ',
                    value: this.tableForm.prPlanCode,
                }, {
                    fieldName: 'prCertificateCode',
                    joinType: 'AND',
                    operation: 'EQ',
                    value: this.tableForm.prCertificateCode,
                }],
            };
            if (this.isGet) {
                return this.$http.get('/purchase/traybinding/page', {
                    params
                }).then(res => {
                    this.tableDataParent = res.data.records;
                    this.Appstatus = res.data.records[0].applyStatus;
                    if (this.tableDataParent.length !== 0) {
                        this.status = this.tableDataParent[0].applyStatus;
                        if (this.tableForm.documentStatus === 3) {
                            this.submitLoas = false;
                            this.isGet = false;
                        } else {
                            if (this.tableDataParent[0].applyStatus === '1') {
                                this.submitLoas = true;
                            } else {
                                this.submitLoas = false;
                            }
                        }

                    }
                    if (this.isGet) {
                        setTimeout(() => {
                            this.getDataParent();
                        }, 3000);
                    }
                });
            }

        },
        // 开始领托盘
        collarTray() {
            if (!this.portCode) {
                this.$alert('请输入料口编码', {
                    type: 'warning'
                });
                return false;
            }
            let obj = {};
            this.statrLoading = true;
            const item = this.tableDataParent[0];
            obj = { ...item };
            obj.stockStatus = this.radio;
            obj.materialPort = this.portCode;
            obj.trayCode = this.trayPallent;
            obj.mpAreaNo = this.port;
            delete obj.tenantId;
            this.$http.post('/purchase/traybinding/receivePallet', obj).then(({ code, data }) => {
                this.statrLoading = false;
                this.submitLoas = true;
            }).catch(() => {
                this.statrLoading = false;
            });
        },
        getpost() {
            this.portCode = this.tableDataParent[0].materialPort;
            this.trayPallent = this.tableDataParent[0].trayCode;
            this.getDataSonL();
            this.getDataSonR();

        },
        // 获取录入托盘列表
        getDataSonL() {
            this.tableLoadingDwonL = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            const params = {
                current: this.currentPage_left,
                size: this.pageSize_left,
                conditionList: [{
                    fieldName: 'bizPrTrayBindingCode',
                    operation: 'EQ',
                    value: item.id,
                    joinType: 'AND',
                }]
            };
            this.$http.get(`/purchase/trayinputingdet/page`, { params }).then(res => {
                this.tableLoadingDwonL = false;
                this.tableDataSonL = res.data.records;
                if (!this.trayDisable && this.status === '0') {
                    this.tableDataSonL.unshift({
                        tagCode: '',
                        tagQuantity: '',
                        status: '',
                    });
                }
                this.pageTotal_left = res.data.total;
            });
        },
        // 获取托盘绑定列表
        getDataSonR() {
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.tableLoadingDwonR = true;
            const params = {
                current: this.currentPage_right,
                size: this.pageSize_right,
                conditionList: [{
                    fieldName: 'bizPrTrayBindingCode',
                    operation: 'EQ',
                    value: item.id,
                    joinType: 'AND',
                }]
            };
            this.$http.get(`/purchase/traybindingdet/page`, { params }).then(res => {
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
        delRowSonL(row) {
            this.$http.delete(`/purchase/trayinputingdet/removeByIds`, {
                data: [row.id]
            }).then(() => {
                this.$message.success('删除成功');
                this.getDataSonL();
            });
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
                this.getDataSonL();
                this.form = {
                    tagCode: '',
                    tagQuantity: '',
                    status: '',
                };
            });
            this.isIndex++;
        },
        // 获取托盘
        handlerCode() {
            // this.portCode = '';
            const params = {
                conditionList: []
            };
            params.conditionList.push({
                fieldName: 'mpAreaNo',
                operation: 'EQ',
                value: this.port,
            });
            params.conditionList.push({
                fieldName: 'mpType',
                operation: 'NEQ',
                value: '1',
            });
            this.$http.get(`transportmanager/materialport/page?size=999`, {
                params
            }).then((res) => {
                this.portData = res.data.records;
            });
        },
        submit() {
            this.submitLoading = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.$http.post(`/purchase/trayinputingdet/submit`, null, {
                params: {
                    bizPrTrayBindingCode: item.id,
                }
            }).then((res) => {
                this.$message.success('添加成功');
                this.isGet = true;
                this.trayPallent = '';
                this.getDataParent();
                // this.getDataSonL();
                this.tableDataSonL = [];
                this.getDataSonR();
                this.$emit('ee');
                this.submitLoading = false;
            }).catch(() => { this.submitLoading = false });
        },
    }
};
</script>
<style src="./styles.styl" scoped lang="stylus"></style>