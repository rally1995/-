<template lang="pug">
    div.box
        ebrain-box(v-if="workcenter.state!=='4'")
            .wrap
                h3.title FQC申请
                el-form.dialogForm(
                :model="form"
                inline)
                    el-row(:gutter="20")
                        el-col(:span="12")
                            el-form-item(label="工单号")
                                el-input(:value="workcenter.orderNo" disabled)
                        el-col(:span="12")
                            el-form-item(label="模号")
                                el-select(v-model="form.moduleNo")
                                    el-option(
                                        v-for="item in options"
                                        :key="item"
                                        :label="item"
                                        :value="item")
                        el-col(:span="12")
                            el-form-item(label="物料编码")
                                el-input(:value="workcenter.materialNo" disabled)
                        el-col(:span="12")
                            el-form-item(label="物料名称")
                                el-input(:value="workcenter.materialName" disabled)
                div.buttons
                    el-button(type="primary" @click="newRows")
                        i.iconfont.iconstatus-Preserve-and-add
                        |新增
                ebrain-table.table(
                    ref="table"
                    :loading="topLoading"
                    :column="columnParamter"
                    :data="parameterData"
                    highlight-current-row
                    table-row-edit
                    @cell-save="cellSaveTop")
                    template(#operation="{row}")
                        el-button(
                            type="danger"
                            @click="delTop(row)") 删除
                div.buttonBottom
                    el-button.submit(
                        :loading="submitLoading"
                        type="primary"
                        style="width:110px;"
                        @click="submitFQC") 提交FQC
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import * as _ from 'lodash';
import nanoid from 'nanoid';
export default {
    name: 'production',
    data() {
        return {
            submitLoading: false,
            topProperty: [
                'sampleNo',
                'batchNo',
                'bookNo',
                'postion',
                'unit',
            ],
            options: [],
            form: {
                moduleNo: '',
            },
            topLoading: false,
            columnParamter: [{
                label: '样品编号',
                prop: 'sampleNo',
            }, {
                label: '批号',
                prop: 'batchNo',
            }, {
                label: 'BOOK号',
                prop: 'bookNo',
            }, {
                label: '位置',
                prop: 'postion',
            }, {
                label: '单位',
                prop: 'unit',
            }, {
                slot: 'operation'
            }],
            parameterData: [],
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        ...mapState('sys', {
            permissions: state => state.permissions,
        }),
        pn() {
            return this.$route.query.pn;
        },
        wn() {
            return this.$route.query.wn;
        },
    },
    watch: {
        workcenter(val) {
            if (val.workcenterNo) {
                this.getModuleNo();
            }
        },
    },
    mounted() {
        if (this.workcenter.id) {
            this.getModuleNo();
        }
    },
    methods: {
        ...mapMutations(['SET_STATE']),
        ...mapActions('workcenter', ['queryOrderInfo']),
        // 获取模号列表
        getModuleNo() {
            this.$http.get(`/productionexe/module/listByAllBomFeed`).then(({ data }) => {
                this.options = (data.filter(v => v.moduleNo)).map(v => v.moduleNo);
                this.options = new Set(this.options);
            });
        },
        newRows() {
            this.$refs.table.new();
        },
        // 修改
        cellSaveTop(row, finish, killLoading) {
            let obj = _.pick(row, this.topProperty);
            const isEmpty = _.every(obj, _.isEmpty);
            if (isEmpty) {
                this.$alert('请填写内容', {
                    type: 'warning',
                });
                killLoading();
                return false;
            }
            if (!row.id_) {
                this.parameterData.unshift({
                    sampleNo: obj.sampleNo,
                    batchNo: obj.batchNo,
                    bookNo: obj.bookNo,
                    postion: obj.postion,
                    unit: obj.unit,
                    id_: nanoid(),
                });
                this.$message.success('新增成功!');
                killLoading();
            } else {
                let save = this.parameterData.findIndex(v => v.id_ === row.id_);
                this.$set(this.parameterData, save, row);
                this.$message.success('修改成功!');
                finish();
            }
        },
        // 删除
        delTop(row) {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                let save = this.parameterData.findIndex(v => v.id_ === row.id_);
                this.parameterData.splice(save, 1);
                this.$message.success('删除成功!');
            });
        },
        submitFQC() {
            let obj = {};
            obj.fqcDetails = this.parameterData.map(v => ({
                batchNo: v.batchNo,
                bookNo: v.bookNo,
                postion: v.postion,
                sampleNo: v.sampleNo,
                unit: v.unit,
            }));
            obj.materialName = this.workcenter.materialName;
            obj.materialNo = this.workcenter.materialNo;
            obj.moduleNo = this.form.moduleNo;
            obj.orderId = this.workcenter.id;
            obj.orderNo = this.workcenter.orderNo;
            obj.workcenterNo = this.workcenter.workcenterNo;
            this.submitLoading = true;
            this.$http.post(`/productionexe/fqc/applyFQC`, obj).then(({ code }) => {
                if (code === 0) {
                    this.$message.success('FQC提交成功!');
                    this.submitLoading = false;
                }
            }).catch(() => {
                this.submitLoading = false;
            });
        }
    }
};
</script>

<style scoped lang="stylus">
.box
    position relative

.wrap
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    overflow-y auto
    overflow-x hidden

        & > * + *
            margin-left 48px
            line-height 60px

    .table
        margin-bottom 10px
        height calc(100% - 300px)

        & >>> .el-table
            height 100%!important

    .title
        margin 5px 10px
        padding 5px 10px
        box-sizing border-box

.dialogForm
    border-bottom 1px solid #dedede
    overflow hidden

    & >>> .el-form-item__content
        width calc(100% - 110px)
        line-height 0

.buttons
    padding 15px 0 15px 15px
    box-sizing border-box

.buttonBottom
    bottom 10px
    right 10px
    float right

.submit
    margin 5px
</style>
