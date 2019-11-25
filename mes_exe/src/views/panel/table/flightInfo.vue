<template lang="pug">
    div.box
        .class
            h3.title 当前班次信息
            .tableTop
                ebrain-table(
                    height="98px"
                    row-key="id"
                    :current-row-key.sync="currentRowKey"
                    :loading="tableLoadingTop"
                    :column="columnTop"
                    :data="dataTop"
                    @current-change="currentChange"
                    highlight-current-row)
            h3.title 人员信息
                .status
                    el-button(
                        type="primary"
                        @click="newRow"
                        style="width:80px"
                        :disabled="!currentRowKey || workcenter.state==='4'"
                        size="small") 新增
                    el-button.submit(
                        :disabled="workcenter.state==='4'"
                        type="primary"
                        style="width:80px"
                        @click="changeShifts"
                        size="small") 换班
            .downTable
                ebrain-table(
                    :isDisabled="workcenter.state==='4'"
                    height="100%"
                    ref="table"
                    :loading="tableLoadingBottom"
                    :column="columnBottom"
                    :data="dataBottom"
                    table-row-edit
                    @cell-save="cellSave"
                    :highlight-current-row="false")
                    template(#operation="{row}")
                        el-button(
                            :disabled="workcenter.state==='4'"
                            type="danger"
                            @click="del(row)") 删除
            el-dialog.dialog(
                v-if="dialogVisibleMatrialDom"
                :title="isShow?'选择班次':'选择班组'"
                :visible.sync="dialogVisibleMatrial")
                keep-alive
                    classes(v-if="isShow" :row-obj.sync="classesObj")
                    group(v-else :row-obj.sync="groupObj" :arr-list.sync="arrList")
                template(#footer)
                    el-button(v-if="isShow" @click="nextStep" :disabled="!classesObj.hasOwnProperty('id')") 下一步
                    el-button(v-if="!isShow" @click="prevStep") 上一步
                    el-button(v-if="!isShow" @click="submit" :disabled="!groupObj.hasOwnProperty('id')") 提交
</template>
<script>
import classes from './class/classes';
import group from './class/group';
import { mapState } from 'vuex';
import dict from '@/utils/dict';
export default {
    name: 'flightInfo',
    components: {
        classes,
        group,
    },
    data() {
        return {
            arrList: [],
            classId: '',
            currentRowKey: '',
            tableLoadingTop: false,
            tableLoadingBottom: false,
            isShow: true,
            dialogVisibleMatrial: false,
            columnTop: [{
                label: '班次编码',
                prop: 'classNo',
            }, {
                label: '班次名称',
                prop: 'className',
                formatter(row, column, cell) {
                    return dict.shiftName[cell];
                },
            }, {
                label: '开始时间',
                prop: 'startTime',
            }, {
                label: '结束时间',
                prop: 'endTime',
            }],
            columnBottom: [{
                label: '员工编码',
                prop: 'memberNo',
            }, {
                label: '员工名称',
                prop: 'memberName',
            }, {
                label: '部门编码',
                prop: 'deptNo',
            }, {
                label: '部门名称',
                prop: 'deptName',
            }],
            dataTop: [],
            dataBottom: [],
            dialogVisibleMatrialDom: true,
            classesObj: {},
            groupObj: {},
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
    },
    watch: {
        dialogVisibleMatrial(val) {
            if (!val) {
                setTimeout(() => {
                    this.dialogVisibleMatrialDom = false;
                }, 250);
                this.classesObj = {};
                this.groupObj = {};
                this.getCurrentInfo();
                this.dataBottom = [];
                this.currentRowKey = '';
            }
        },
        workcenter(center) {
            if (center.workcenterNo) {
                this.getCurrentInfo();
            }
        },
    },
    mounted() {
        if (this.workcenter.workcenterNo) {
            this.getCurrentInfo();
        }
    },
    methods: {
        getCurrentInfo() {
            this.tableLoadingTop = true;
            this.$http.get('/productionexe/classrecord/page', {
                params: {
                    size: 9999,
                    conditionList: [{
                        fieldName: 'workcenterNo',
                        operation: 'EQ',
                        value: this.workcenter.workcenterNo,
                        joinType: 'AND',
                    }],
                },
            }).then(res => {
                this.tableLoadingTop = false;
                this.dataTop = res.data.records.length ? [res.data.records[0]] : [];
            });
        },
        getCurrentPersonalInfo() {
            this.tableLoadingBottom = true;
            this.$http.get('/productionexe/classmember/page', {
                params: {
                    size: 9999,
                    conditionList: [{
                        fieldName: 'classId',
                        operation: 'EQ',
                        value: this.dataTop[0].id,
                        joinType: 'AND',
                    }],
                },
            }).then(res => {
                this.tableLoadingBottom = false;
                this.dataBottom = res.data.records;
            });
        },
        currentChange(row) {
            this.rowObj = row;
            this.getCurrentPersonalInfo();
        },
        changeShifts() {
            this.isShow = true;
            this.dialogVisibleMatrialDom = true;
            setTimeout(() => {
                this.dialogVisibleMatrial = true;
            }, 0);
        },
        submit() {
            const arr = [];
            let obj = {};
            this.arrList.forEach(item => {
                obj = {
                    classId: this.classId,
                    memberNo: item.personnelNumber,
                    memberName: item.personnelFullName,
                    deptNo: item.deptCode,
                    deptName: item.deptName,
                };
                arr.push(obj);
            });
            this.$http.post('/productionexe/classmember/saveBatch', {
                classMemberList: arr,
            }).then(res => {
                this.dialogVisibleMatrial = false;
            });
            this.isShow = false;
        },
        nextStep() {
            this.$http.post('/productionexe/classrecord/save', {
                classNo: this.classesObj.shiftNumber,
                workcenterNo: this.workcenter.workcenterNo,
                className: this.classesObj.shiftName,
                startTime: this.classesObj.startingTime,
                endTime: this.classesObj.endTime,
                whetherCrossDay: this.classesObj.whetherCrossDay,
            }).then(res => {
                this.classId = res.data.id;
                this.isShow = false;
            });
        },
        prevStep() {
            this.isShow = true;
        },
        cellSave(row, finish, killLoading) {
            let obj = {
                classId: this.rowObj.id,
                memberNo: row.memberNo,
                memberName: row.memberName,
                deptNo: row.deptNo,
                deptName: row.deptName,
            };
            if (row.memberNo && row.memberName) {
                if (!row.hasOwnProperty('id')) {
                    this.$http.post('/productionexe/classmember/save', obj).then(res => {
                        this.getCurrentPersonalInfo();
                        finish();
                    }).catch(() => {
                        killLoading();
                    });
                } else {
                    obj.id = row.id;
                    this.$http.put('/productionexe/classmember/updateById', obj).then(res => {
                        this.getCurrentPersonalInfo();
                        finish();
                    }).catch(() => {
                        killLoading();
                    });
                }
            } else {
                this.$message.error(`员工编码与名称为必填项，请检查...`);
                killLoading();
            }
        },
        del(row) {
            this.$http.delete('/productionexe/classmember/removeByIds', {
                data: [row.id]
            }).then(() => {
                this.getCurrentPersonalInfo();
            });
        },
        newRow() {
            this.$refs.table.new({});
        },
    },
};
</script>
<style scoped lang="stylus">
.title
    position relative
    margin 5px 10px
    padding 5px 10px
.status
    position absolute
    top 0
    right 0
.class
    width 100%
    position relative

    // & >>> .el-table
    //     height auto!important

    // & >>> .el-table__body-wrapper
    //     height auto!important

.half
    height 50%
.dialog
    & >>> .el-dialog__body
        height 100%
.downTable
    position absolute
    left 0
    right 0
    bottom 0
    top 180px
</style>
