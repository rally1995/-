<template lang="pug">
    ebrain-main.info
        ebrain-frame(
            title="设备信息")
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
                    @selection-change="selectionChange_top"
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
                    @current-change="getDataSon"
                    :current-row-key.sync="currentRowKeyParent")
        ebrain-frame(
            title="零部件信息")
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
                    :current-row-key.sync="currentRowKeySon"
                    @selection-change="selectionChangeHandler")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleParent"
            :form.sync="dialogFormParent"
            @submit="submitFormParent")
            template(#upload)
                el-col(:span="24")
                    el-form-item(label-width="110px" label="上传附件")
                        ebrain-upload.upload(
                            accept="image,text"
                            list-type="picture-card"
                            :file-list="uploadList"
                            :limit="10"
                            action="/basicdata/devicetype/upload"
                            :on-success="uploadChangeHandler"
                            :on-preview="uploadPreview"
                            :on-remove="removeChangeHandler")
                            i.el-icon-plus
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleSon"
            :form.sync="dialogFormSon"
            @submit="submitFormSon")
        ebrain-dialog(
            :submitLoading='submitLoading'
            :visible.sync="dialogVisibleCopy"
            :form.sync="dialogFormCopy"
            @submit="submitFormCopy")
            template(#button)
                span.copyTitle 复制
        el-dialog(:visible.sync="dialogVisiblePreview")
            template
                div.container
                    img(ref="img")
                el-button(type="primary" ref="downfile" @click="downloadFile").footer 下载附件
</template>
<script>
import { mapState, mapActions } from 'vuex';
import moment from 'moment';
export default {
    name: 'index',
    data() {
        return {
            dialogVisibleCopy: false,
            selection_top: [],
            ids_top: [],
            selection: [],
            ids: [],
            submitLoading: false,
            tableLoadingTop: false,
            tableLoadingDown: false,
            dialogVisiblePreview: false,
            tableDataParent: [],
            tableDataSon: [],
            List: [],
            tableColumnParent: [{
                type: 'selection'
            }, {
                label: '设备编码',
                prop: 'equipNum',
                showOverflowTooltip: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                showOverflowTooltip: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                showOverflowTooltip: true,
                formatter: (row, column, cell) => {
                    return this.storeDict['device_classification'][cell];
                }
            }, {
                label: '设备用途',
                prop: 'equipClass',
                showOverflowTooltip: true,
            }, {
                label: '规格型号',
                prop: 'specModel',
                showOverflowTooltip: true,
            }, {
                label: '单位',
                prop: 'unitName',
                showOverflowTooltip: true,
            }, {
                label: '维护人员',
                prop: 'createBy',
                showOverflowTooltip: true,
            }, {
                label: '维护日期',
                prop: 'matnDt',
                showOverflowTooltip: true,
            }, {
                label: '备注',
                prop: 'rm',
                showOverflowTooltip: true,
            }],
            tableColumnSon: [{
                type: 'selection'
            }, {
                label: '编号',
                type: 'index',
                align: 'center',
                width: 50
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
                label: '设备编码',
                prop: 'equipNum',
                value: '',
                required: true,
            }, {
                label: '设备名称',
                prop: 'equipName',
                value: '',
                required: true,
            }, {
                label: '设备用途',
                prop: 'equipClass',
                value: '',
                required: true,
            }, {
                label: '设备类型',
                prop: 'equipType',
                value: '',
                type: 'select',
                option: () => this.storeDict['device_classification']
            }, {
                label: '规格型号',
                prop: 'specModel',
                value: '',
            }, {
                label: '单位',
                prop: 'corp',
                value: '',
                type: 'select',
                option: {}
            }, {
                label: '维护人员',
                prop: 'matnPerson',
                value: '',
                readonly: true
            }, {
                label: '维护时间',
                prop: 'matnDt',
                type: 'datetime',
                value: '',
                disabled: true,
            }, {
                label: '备注',
                prop: 'rm',
                value: '',
                type: 'textarea',
            }, {
                slot: 'upload'
            }],
            dialogFormSon: [{
                label: '零部件编号',
                prop: 'zeroDeptNum',
                value: '',
                required: true,
            }, {
                label: '零部件名称',
                prop: 'zeroDeptName',
                value: '',
                required: true,
                // type: 'select',
                // option: () => this.storeDict['part_name']
            }, {
                label: '零部件分类',
                prop: 'zeroDeptClass',
                value: '',
                type: 'select',
                option: () => this.storeDict['part_classification']
            }, {
                label: '规格型号',
                prop: 'specModel',
                value: '',
            }, {
                label: '零部件SN',
                prop: 'zeroDeptSn',
                value: '',
            }, {
                label: '单位',
                prop: 'corp',
                value: '',
                type: 'select',
                option: {}
            }, {
                label: '数量',
                prop: 'qnty',
                value: '',
                maxLength: 18,
                rule: {
                    validator(rule, value, callback) {
                        const reg = /^[1-9]\d*$/;
                        if (!reg.test(value)) {
                            return callback(new Error('请输入正整数!'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                },
                required: true
            }, {
                label: '备注',
                prop: 'rm',
                value: '',
                type: 'textarea',
            }],
            dialogFormCopy: [{
                label: '设备编码',
                prop: 'equipNum',
                value: '',
                required: true,
            }],
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            currentRowKeyParent: '',
            dialogParent: '',
            dialogSon: '',
            dialogVisibleParent: false,
            currentRowKeySon: '',
            dialogVisibleSon: false,
            imgUrl: '',
            uploadList: [],
            equipNum: '',
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
                permi: 'device_type_add',
            }, {
                label: '修改',
                click: () => this.editRowParent(),
                disabled: () => this.editDisabledParent,
                className: 'iconfont iconstatus-edit',
                permi: 'device_type_edit',
            }, {
                label: '删除',
                click: () => this.delRowParent(),
                disabled: () => this.isvilated,
                className: 'iconfont iconstatus-delete',
                permi: 'device_type_del',
            }, {
                label: '复制',
                click: () => this.copy(),
                disabled: () => this.copyDisabled,
                className: 'iconfont iconstatus-copy',
                permi: 'device_type_copyDeviceEquipmentType',
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
                permi: 'device_type_de_add',
                disabled: () => !this.currentRowKeyParent,
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.selection.length === 0,
                className: 'iconfont iconstatus-delete',
                permi: 'device_type_de_del',
            }, {
                label: '选中导出',
                click: () => this.selectExport(),
                disabled: () => this.selection.length === 0,
                className: 'iconfont iconstatus-export',
                permi: 'device_type_de_exportListByIds',
            }, {
                label: '下载模块',
                click: () => this.downloadModule(),
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-download',
                permi: 'device_type_de_downloadTemplate',
            }, {
                label: '导入',
                disabled: () => !this.currentRowKeyParent,
                className: 'iconfont iconstatus-download',
                permi: false,
                action: '',
                onSuccess: (response, file, fileList) => this.successFile(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }, {
                label: '全部导出',
                click: () => this.exportAll(),
                className: 'iconfont iconstatus-Export_all',
                permi: 'device_type_de_exportAllList',
                disabled: () => !this.currentRowKeyParent,
            }],
        };
    },
    computed: {
        editDisabledParent() {
            return this.currentRowKeyParent === '';
        },
        editDisabledSon() {
            return this.currentRowKeySon === '';
        },
        isvilated() {
            return this.selection_top.length === 0;
        },
        copyDisabled() {
            return this.selection_top.length !== 1;
        },
        ...mapState({
            storeDict: state => state.dict,
            userInfo: state => state.sysUser
        })
    },
    watch: {
        dialogVisibleParent(val) {
            if (!val) this.uploadList = [];
        },
        currentRowKeyParent(val) {
            if (val) {
                this.btnsBottom[4].action = `/basicdata/devicetypede/importData/${this.currentRowKeyParent}`;
            }
        }
    },
    created() {
        this.queryDict('device_classification');
        this.queryDict('part_classification');
        this.queryDict('part_name');
    },
    mounted() {
        this.getDataParent();
        // this.searchForm.
    },
    methods: {
        ...mapActions(['queryDict']),
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
            this.$http.get('/basicdata/devicetype/page', {
                params: {
                    current: this.currentPage,
                    size: this.pageSize,
                    conditionList: this.conditionList,
                },
            }).then(res => {
                this.tableDataParent = res.data.records;
                this.tableLoadingTop = false;
                this.pageTotal = res.data.total;
                this.tableDataSon = [];
            }).catch(() => {
                this.tableLoadingTop = false;
            });
        },
        getDataSon() {
            this.currentRowKeySon = '';
            this.tableLoadingDown = true;
            const item = this.tableDataParent.find(v => v.id === this.currentRowKeyParent);
            this.equipNum = item.equipNum;
            this.$http.get(`/basicdata/devicetypede/getListTypeNum/${this.equipNum}`).then(res => {
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
        uploadPreview(file) {
            this.dialogVisiblePreview = true;
            this.$nextTick(() => {
                this.$refs.img.src = file.url;
                this.imgUrl = file.url;
            });
        },
        downloadFile() {
            window.open(this.imgUrl);
        },
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
        newRowParent() {
            this.uploadList = [];
            this.dialogFormParent[0].disabled = false;
            this.dialogParent = 'new';
            this.getDicbasicunit().then(() => {
                this.dialogVisibleParent = true;
            });
            const item = this.dialogFormParent.find(v => v.prop === 'matnPerson');
            item.value = this.userInfo.nickname;
            const matnDt = this.dialogFormParent.find(v => v.prop === 'matnDt');
            matnDt.value = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
        },
        editRowParent() {
            this.dialogParent = 'edit';
            this.dialogFormParent[0].disabled = true;
            this.$http.get(`/basicdata/devicetype/${this.currentRowKeyParent}`).then(res => {
                this.List = res.data;
                this.dialogFormParent.forEach(v => {
                    if (v.prop === 'matnPerson') {
                        v.value = this.List.createBy;
                    } else {
                        v.value = this.List[v.prop];
                    }
                });
                // const { origin } = window.location;
                let arr = [];
                for (let i = 0; i < 10; i++) {
                    const path = this.List[`image${i + 1}`];
                    if (path) {
                        arr.push({
                            url: path,
                        });
                    }
                }
                this.uploadList = arr;
                this.getDicbasicunit().then(() => {
                    this.dialogVisibleParent = true;
                });
            });
        },
        selectionChange_top(select) {
            this.selection_top = select;
            this.ids_top = this.selection_top.map(v => v.id);
        },
        delRowParent() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/devicetype/removeByIds', {
                    data: this.ids_top,
                }).then(() => {
                    this.submitLoading = false;
                    this.getDataParent();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                });
            });
        },
        submitFormParent() {
            let obj = {};
            this.dialogFormParent.forEach(v => {
                if (v.prop === 'matnPerson') obj[v.prop] = this.userInfo.userId;
                else obj[v.prop] = v.value;
            });
            const finish = () => {
                this.getDataParent();
                this.dialogVisible = false;
            };
            this.submitLoading = true;
            this.uploadList.forEach((v, i) => {
                if (v.response && v.response.data) {
                    const { bucketName, fileName } = v.response.data;
                    obj[`image${i + 1}`] = `/basicdata/devicetype/getfile/${bucketName}-${fileName}`;
                } else {
                    obj[`image${i + 1}`] = v.url;
                }
            });
            for (let i = 0; i < 10; i++) {
                obj[`image${i + 1}`] = obj[`image${i + 1}`] || '';
            }
            if (this.dialogParent === 'new') {
                this.$http.post('/basicdata/devicetype/save', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    finish();
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKeyParent;
                this.$http.put('/basicdata/devicetype/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    finish();
                    this.dialogVisibleParent = false;
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        newRowSon() {
            this.dialogSon = 'new';
            this.getDicbasicunit().then(() => {
                this.dialogVisibleSon = true;
            });
        },
        // editRowSon() {
        //     this.dialogSon = 'edit';
        //     this.getDicbasicunit().then(() => {
        //         this.dialogVisibleSon = true;
        //     });
        //     const item = this.tableDataSon.find(v => v.id === this.currentRowKeySon);
        //     this.dialogFormSon.forEach(v => {
        //         v.value = item[v.prop];
        //     });
        // },
        delRowSon() {
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.submitLoading = true;
                this.$http.delete('/basicdata/devicetypede/removeByIds', {
                    data: this.ids,
                }).then(() => {
                    this.submitLoading = false;
                    this.getDataSon();
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                    this.currentRowKeySon = '';
                });
            });
        },
        submitFormSon() {
            let obj = {};
            this.dialogFormSon.forEach(v => {
                obj[v.prop] = v.value;
            });
            const finish = () => {
                this.dialogVisibleSon = false;
                this.getDataSon();
            };
            this.submitLoading = true;
            if (this.dialogSon === 'new') {
                obj.equipNum = this.equipNum;
                this.$http.post('/basicdata/devicetypede/save', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '新增成功!',
                        type: 'success'
                    });
                    finish();
                }).catch(() => {
                    this.submitLoading = false;
                });
            } else {
                obj.id = this.currentRowKeySon;
                this.$http.put('/basicdata/devicetypede/updateById', obj).then(() => {
                    this.submitLoading = false;
                    this.$message({
                        message: '修改成功!',
                        type: 'success'
                    });
                    finish();
                }).catch(() => {
                    this.submitLoading = false;
                });
            }
        },
        // 图片上传
        uploadChangeHandler(res, file, fileList) {
            this.uploadList = fileList;
        },
        // 图片删除
        removeChangeHandler(file, fileList) {
            this.uploadList = fileList;
            // 删除图片不
            // const { raw, response } = file;
            // const reg = /(?<=(?:\/))(.(?!\/))+\.\w+$/g;
            // if (raw) {
            //     if (response) {
            //         const { bucketName, fileName } = file.response.data;
            //         // const fileName = url.match(reg);
            //         this.$http.get(`/basicdata/devicetype/deleteFile/${bucketName + fileName}`);
            //     }
            // } else {
            //     const { url } = file;
            //     const fileName = url.match(reg);
            //     this.$http.get(`/basicdata/devicetype/deleteFile/${String(fileName)}`);
            // }
        },
        // 复制
        copy() {
            this.dialogVisibleCopy = true;
        },
        // 复制确认按钮
        submitFormCopy() {
            const item = this.selection_top[0];
            item.equipNum = this.dialogFormCopy[0].value;
            delete item.tenantId;
            this.$http.post('/basicdata/devicetype/copyDeviceEquipmentType', item).then(res => {
                if (res.code === 0) {
                    this.$message({
                        message: '复制成功',
                        type: 'success'
                    });
                    this.dialogVisibleCopy = false;
                    this.getDataParent();
                }
            });
        },
        // 全部导出
        exportAll() {
            this.$http.post(`/basicdata/devicetypede/exportAllList`, null, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '设备类型-零部件清单信息.xls';
                    $a.click();
                }
            });
        },
        // 导入
        successFile() {
            this.getDataSon();
        },
        // 选中导出
        selectExport() {
            const selection = this.selection.map(v => v.id);
            this.$http.post(`/basicdata/devicetypede/exportListByIds`, selection, { responseType: 'blob' }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '设备类型-零部件清单信息.xls';
                    $a.click();
                }
            });
        },
        // 下载模块
        downloadModule() {
            // window.open('/basicdata/devicetypede/downloadTemplate', '_blank');
            this.$http.get('/basicdata/devicetypede/downloadTemplate', {
                responseType: 'blob',
            }).then(res => {
                if (res) {
                    const blob = new Blob([res]);
                    const href = window.URL.createObjectURL(blob);
                    const $a = document.createElement('a');
                    $a.href = href;
                    $a.download = '设备信息模板.xls';
                    $a.click();
                }
            });
        },
        selectionChangeHandler(selection) {
            this.selection = selection;
            this.ids = this.selection.map(v => v.id);
        }
    }
};
</script>

<style scoped lang="stylus">
.upload
    & >>> .el-upload-list__item
        width 100px
        height 100px

.import
    display inline-block

.upload .el-list-leave-active
    display none!important
.container
    width 600px
    height 400px
    border-radius 10px
    margin 0 auto
    overflow hidden
    padding 0px
    img
        display block
        height 100%
        max-width 100%
        margin 0 auto
    .footer
        display block
        margin 20px auto

.info
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

.copyTitle
    font-weight bold
    position absolute
    top 20px
    left 20px
</style>
