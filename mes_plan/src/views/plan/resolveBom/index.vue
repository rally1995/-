<template lang="pug">
    ebrain-main
        ebrain-frame(:title="$route.name")
            template(#tools)
                .search(
                    :class="{hide:searchVisible}")
                    el-form.form(
                        :rules="rules"
                        inline
                        ref="form"
                        @submit.prevent.native="submitForm"
                        :model="form"
                        label-width="100px")
                        el-form-item(label="物料编号" prop="materialCode")
                            el-input(v-model="form.materialCode")
                        el-form-item(label="需计算数量" prop="quantity")
                            el-input(v-model.number="form.quantity")
                        //- el-form-item(label="分解类型")
                        //-     el-select(v-model="form.type" placeholder="请选择" style="width:80px")
                        //-         el-option(label="单阶" value="0")
                        //-         el-option(label="全阶" value="1")
                        el-form-item
                            el-button(type="primary" @click="getData") 开始计算
            template(#table)
                ebrain-box-table(
                    :columnIndex="false"
                    :columnCheck="false"
                    :loading='tableLoading'
                    :highlight-current-row="false"
                    :data="tableData"
                    :column="tableColumn"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change='ChangeSize')
        ebrain-frame(:title="$route.name")
            template(#table)
                ebrain-box-table(
                    :columnIndex="false"
                    :columnCheck="false"
                    :isPagination="false"
                    :loading='tableLoading2'
                    :highlight-current-row="false"
                    :data="tableData2"
                    :column="tableColumn2"
                    :pageSize="pageSize2"
                    :pageCurrent="currentPage2"
                    :pageTotal="pageTotal2"
                    @page-change="ChangeCurrent2"
                    @size-change='ChangeSize2')
</template>

<script>
import _ from 'lodash';
import dict from '@/utils/dict';
export default {
    name: 'resolveBom',
    data() {
        return {
            rules: {
                materialCode: [{
                    message: '请输入物料编号',
                    trigger: 'blur',
                    required: true,
                }],
                quantity: [{
                    message: '请输入需计算数量',
                    trigger: 'blur',
                    required: true,
                }, {
                    message: '请输入数字',
                    trigger: 'blur',
                    type: 'number',
                }],
            },
            tableData: [],
            form: {
                materialCode: '',
                quantity: '',
                type: '0',
            },
            searchVisible: false,
            tableLoading: false,
            tableColumn: [{
                label: '主件料号',
                prop: 'masterCode',
                showOverflowTooltip: true,
            }, {
                label: '名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: 'BOM单号',
                prop: 'bomCode',
                showOverflowTooltip: true,
            }, {
                label: '规格',
                prop: 'spec',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '主要来源',
                prop: 'mainSource',
                showOverflowTooltip: true,
                formatter(row, column, cell) {
                    return dict.mainSource[cell];
                },
            }, {
                label: '标准批量',
                prop: 'standardlotSize',
                showOverflowTooltip: true,
            }, {
                label: '产品工艺编号',
                prop: 'productProcessCode',
                showOverflowTooltip: true,
            }, {
                label: '工艺路线编号',
                prop: 'routeCode',
                showOverflowTooltip: true,
            }],
            spanObject: {},
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            row: {},
            tableLoading2: false,
            tableData2: [],
            tableColumn2: [{
                label: '主件物料编码',
                prop: 'mainMaterialCode',
                showOverflowTooltip: true,
            }, {
                label: '主件物料名称',
                prop: 'mainMaterialName',
                showOverflowTooltip: true,
            }, {
                label: '主件数量',
                prop: 'mainQuantity',
                showOverflowTooltip: true,
            }, {
                label: '子件物料编码',
                prop: 'masterCode',
                showOverflowTooltip: true,
            }, {
                label: '子件物料名称',
                prop: 'materialName',
                showOverflowTooltip: true,
            }, {
                label: '库存单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '数量',
                prop: 'quantity',
                showOverflowTooltip: true,
            }],
            pageSize2: 20,
            currentPage2: 1,
            pageTotal2: 0,
        };
    },
    methods: {
        getData() {
            let obj = {};
            this.tableData2 = [];
            obj.materialCode = this.form.materialCode;
            // obj.quantity = Number(this.form.quantity);
            // obj.type = this.form.type;
            const params = {
                materialCode: obj.materialCode,
                current: this.currentPage,
                size: this.pageSize,
            };
            this.$refs.form.validate(v => {
                if (v) {
                    this.tableLoading = true;
                    this.$http.post('/productionplan/bom/decomPage', null, {
                        params: params
                    }).then(res => {
                        this.tableLoading = false;
                        // this.tableData = this.breakData(res.data);
                        this.tableData = res.data.records;
                        this.pageTotal = res.data.total;
                    }).catch(() => {
                        this.tableLoading = false;
                    });
                }
            });
        },
        breakData(origin) {
            let result = [];
            let index = 0;
            if (origin && origin.length) {
                origin.forEach((i, iIndex) => {
                    if (i.mrpBomVOs && i.mrpBomVOs.length) {
                        i.mrpBomVOs.forEach((j, jIndex) => {
                            if (jIndex === 0) this.spanObject[index] = i.mrpBomVOs.length;
                            result.push({
                                ...j,
                                parentMasterCode: i.masterCode,
                                parentMasterName: i.masterCodeName,
                                parentQuantity: i.quantity,
                            });
                            index++;
                        });
                    }
                });
            }
            return result;
        },
        CurrentChange(row) {
            if (row) {
                this.row = row;
                this.getData2();
            }
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
        ChangeCurrent2(val) {
            this.currentPage2 = val;
            this.getData2();
        },
        ChangeSize2(val) {
            this.pageSize2 = val;
            this.currentPage2 = 1;
            this.getData2();
        },
        getData2() {
            this.tableLoading2 = true;
            let params = {
                amount: Number(this.form.quantity),
                bomCode: this.row.bomCode
            };
            let api = '';
            if (!_.isEmpty(this.row.routeCode)) {
                params.routeCode = this.row.routeCode;
                api = '/productionplan/bom/getProRouteSubBomList';

            } else {
                params.prodProCode = this.row.productProcessCode;
                api = '/productionplan/bom/getProdProSubBomList';
            }
            this.$http.post(api, null, {
                params: params
            }).then((res) => {
                this.tableData2 = res.data;
                this.tableLoading2 = false;
            }).catch(() => {
                this.tableLoading2 = false;
            });
        }
        // spanMethodHandler({ row, column, rowIndex, columnIndex }) {
        //     if (columnIndex === 0 || columnIndex === 1 || columnIndex === 2) {
        //         return {
        //             colspan: 1,
        //             rowspan: this.spanObject[rowIndex]
        //         };
        //     }
        // },
    },
};
</script>

<style scoped lang="stylus">
.search
  padding 14px 10px
  background #f5f5f5
  overflow hidden
  box-sizing border-box
  transition-duration 0.2s
  height 57px

  &.hide
    padding-top 0
    padding-bottom 0
    height 0
</style>
