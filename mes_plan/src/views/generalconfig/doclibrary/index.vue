<template lang="pug">
    ebrain-main.doclibrary
        ebrain-frame.halfHeight(:title="$route.name")
            template(#tools)
                ebrain-tools(:buttons="btnsTop")
                .search(
                    :class="{hide:searchVisible}")
                    ebrain-search(
                        :form="searchForm"
                        @search="searchTop"
                        @reset="reset")
            template(#table)
                ebrain-box-table(
                    :border="false"
                    ref="table1"
                    :loading="tableLoading"
                    :pageSize="pageSize"
                    :pageCurrent="currentPage"
                    :pageTotal="pageTotal"
                    :data="tableData"
                    :highlight-current-row="false"
                    :column="tableColumn"
                    row-key="id"
                    @cell-mouse-enter="CellMouseEnter"
                    @cell-mouse-leave="CellMouseLeave"
                    @current-change="CurrentChange"
                    @page-change="ChangeCurrent"
                    @size-change="ChangeSize"
                    @selection-change="SelectChange")
                    template(#fieldName)
                        el-table-column(
                            :showOverflowTooltip="true"
                            label="文件名")
                            template(v-slot="{row}")
                                i(
                                    :class="fileIcon(row.suffix)")
                                span  {{row.name}}
                    template(#fieldTag)
                        el-table-column(
                            label="文件标签"
                            align="center")
                            template(v-slot="{row}")
                                el-popover.dialog_pop(
                                    @show="hideClose(row)"
                                    v-model="row.isvisible"
                                    placement="right-start"
                                    width="250")
                                    ul(v-if="visible").cell_pop
                                        li
                                            el-form(style="width:100%")
                                                el-row(:gutter="10")
                                                    el-form-item
                                                        el-col(:span="22")
                                                            el-input(placeholder="搜索标签" v-model="searchStr" autofocus  @keyup.enter.native="changeHandler(row)")
                                                        el-col(:span="2")
                                                            i(class="iconfont iconnew-add add_color" @click="newTag")
                                        li(v-for="(item, index) in parentRow.tags")
                                            div.circle
                                                span.c1 {{item}}
                                                span
                                                    i(@click="editTag(item, row)").iconfont.iconstatus-edit
                                    ul(v-else).cell_pop2
                                        li
                                            i(@click="visible= true").el-icon-arrow-left
                                            span 新建标签
                                            i(@click="row.isvisible = false").el-icon-close
                                        li.input_height
                                             el-form(style="width:100%"
                                                    ref="form"
                                                    :model="form"
                                                    :rules="rules")
                                                el-row(:gutter="10")
                                                    el-form-item(prop="tagCode" style="margin-bottom: 5px")
                                                        el-col(:span="24")
                                                            el-input(placeholder="搜索标签" v-model="form.tagCode")
                                        li
                                            el-button(v-if="dialogType === 'new'"
                                                    icon="el-icon-edit"
                                                    type="primary"
                                                    style="width:100%;margin-top:15px"
                                                    @click="createTag(row)") 创建
                                            div.dialog_btns(v-else)
                                                el-button(type="danger" @click="hadlerRow(row)") 删除
                                                el-button(type="primary" @click="complete(row)") 完成
                                    div(slot="reference")
                                        h2.mpi(v-if="row.tag &&row.tag.length")
                                            el-tag(closable
                                                    v-for="(item, index) in row.tags"
                                                    :key="index"
                                                    :type="item"
                                                   :disable-transitions="false"
                                                   @close="handleClose(index, row)") {{item}}
                                            i(slot="reference" style="margin-left:5px").iconfont.iconnew-add
                                        span._color(v-else slot="reference") 点击编辑
                    template(#operation)
                        el-table-column(
                            width="120"
                            align="center")
                            template(v-slot="{row}")
                                div.operat(v-if="isOperat === row.id")
                                    i(@click="DownFile(row)").iconfont.iconCircle-Download
                                    i(@click="delRowSon(row)").iconfont.iconCircle-Close
</template>
<script>
import { strip }  from '@/utils';
import _ from 'lodash';
export default {
    name: 'doclibrary',
    data() {
        const validatePass = (rule, value, callback) => {
            let obj = this.parentRow;
            if (_.isEmpty(value)) {
                return callback(new Error('请输入内容'));
            } else {
                if (this.dialogType === 'new') {
                    if (obj.tags.indexOf(this.form.tagCode) !== -1) {
                        callback(new Error('请勿添加相同的标签'));
                    } else {
                        callback();
                    }
                } else {
                    if (obj.tags.indexOf(this.form.tagCode) !== -1 && obj.tags[this.$index] !== this.form.tagCode) {
                        callback(new Error('请勿添加相同的标签'));
                    } else {
                        callback();
                    }
                }
            }
        };
        return {
            rules: {
                tagCode: [
                    { validator: validatePass, trigger: 'blur' }
                ]
            },
            searchVisible: true,
            $index: '',
            tags: [],
            form: {
                tagCode: '',
            },
            conditionList: [],
            searchForm: [{
                label: '文件名',
                prop: 'name',
                value: '',
            }, {
                label: '文件标签',
                prop: 'tag',
                value: '',
            }, {
                label: '文件编码',
                prop: 'fileCode',
                value: '',
            }],
            btnsTop: [{
                label: '上传文件',
                className: 'iconfont iconstatus-download',
                permi: false,
                action: `/basicdata/basicfilemanager/upload`,
                onSuccess: (response, file, fileList) => this.successFile(response, file, fileList),
                showFileList: false,
                comp: 'ebrain-upload',
            }, {
                label: '删除',
                click: () => this.delRowSon(),
                disabled: () => this.delDisabled,
                className: 'iconfont iconstatus-delete',
                permi: false,
            }, {
                label: '搜索',
                click: () => { this.searchVisible = !this.searchVisible },
                className: 'iconfont iconsearch fr',
                permi: false,
            }],
            tableLoading: false,
            pageSize: 20,
            currentPage: 1,
            pageTotal: 0,
            tableData: [],
            iconName: '',
            isOperat: '',
            searchStr: '',
            visible: true,
            dialogType: '',
            tableColumn: [{
                slot: 'fieldName',
                label: '文件名',
                prop: 'name',
            }, {
                slot: 'fieldTag',
                label: '文件标签',
                prop: 'tag',
                editable: true,
                showOverflowTooltip: true
            }, {
                label: '文本编码',
                editable: true,
                prop: 'fileCode',
                change: (value, prop, row) => this.editTable(value, prop, row),
                showOverflowTooltip: true
            }, {
                label: '大小',
                prop: 'fileSize',
                showOverflowTooltip: true
            }, {
                label: '创建者',
                prop: 'createBy',
                showOverflowTooltip: true
            }, {
                label: '更新时间',
                prop: 'updateTime',
                showOverflowTooltip: true
            }, {
                slot: 'operation'
            }],
            parentRow: {},
            selectRows: [],
        };
    },
    computed: {
        delDisabled() {
            return this.selectRows.length === 0;
        }
    },
    created() {
        this.getData();
    },
    methods: {
        getData() {
            this.tableLoading = true;
            const params = {
                current: this.currentPage,
                size: this.pageSize,
                conditionList: this.conditionList
            };
            return this.$http.get(`/basicdata/basicfilemanager/page`, {
                params
            }).then(({ code, data }) => {
                this.tableData = data.records.map(v => {
                    if (v.tag) {
                        return {
                            ...v,
                            fileSize: strip(Number(v.fileSize) / 1024).toFixed(2) + 'KB',
                            tags: v.tag.split(','),
                            isvisible: false,
                        };
                    } else {
                        return {
                            ...v,
                            fileSize: strip(Number(v.fileSize) / 1024).toFixed(2) + 'KB',
                            tags: [],
                            isvisible: false,
                        };
                    }
                });
                this.pageTotal = data.total;
                this.tableLoading = false;
            }).catch(() => {
                this.tableLoading = false;
            });
        },
        fileIcon(name) {
            if (!name) return;
            // const suf = name.match(/(?<=\.).+/).toString();
            switch (name) {
                case 'gif':
                case 'jpg':
                case 'png':
                    return 'iconfont iconfilepicture filename_icon';
                case 'doc':
                case 'docx':
                    return 'iconfont iconword work_color filename_icon';
                case 'xls':
                case 'xlsx':
                    return 'iconfont iconexcel exe_color filename_icon';
                case 'pdf':
                    return 'iconfont iconPDF pdf_color filename_icon';
                case 'zip':
                case 'rar':
                case '7zip':
                    return 'iconfont icondecompression-package zip_color filename_icon';
                default:
                    return 'iconfont icondoc-line filename_icon';
            }
        },
        searchTop() {
            this.currentPage = 1;
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
            this.getData();
        },
        reset() {
            this.searchForm.forEach(item => {
                item.value = '';
            });
        },
        changeHandler(row) {
            if (this.searchStr) {
                this.parentRow = { ...row };
                this.parentRow.tags = this.parentRow.tags.filter(v => v.includes(this.searchStr));
            } else {
                this.parentRow = { ...row };
            }
        },
        delRowSon(row) {
            let ids = [];
            if (!_.isEmpty(row)) {
                ids = [row.id];

            } else {
                ids = this.selectRows.map(v => v.id);
            }
            this.$confirm('是否确认删除?', '提示', {
                type: 'warning'
            }).then(() => {
                this.$http.delete('/basicdata/basicfilemanager/removeByIds', {
                    data: ids,
                }).then(() => {
                    this.currentPage = 1;
                    this.getData().then(() => {
                        this.selectRows = [];
                    });
                    this.parentRow = {};
                    this.$message({
                        message: `删除成功`,
                        type: 'success'
                    });
                    this.$refs.table1.clearSelection();
                });
            });
        },
        editTable(value, header, row) {
            let obj = { ...row };
            if (obj.fileSize) obj.fileSize = Number(obj.fileSize.substr(0, obj.fileSize.length - 2)) * 1024;
            obj.fileCode = value;
            this.$http.put(`/basicdata/basicfilemanager/updateById`, obj).then(() => {
                this.$message.success('修改成功');
                this.getData();
            });
        },
        newTag() {
            this.visible = false;
            this.dialogType = 'new';
        },
        editTag(item, row) {
            this.visible = false;
            this.dialogType = 'edit';
            this.$index = row.tags.indexOf(item);
            this.form.tagCode = item;
        },
        handleClose(index, row) {
            let obj = { ...row };
            if (obj.tag) {
                let tags = obj.tag.split(',');
                tags.splice(index, 1);
                obj.tag = tags.join(',');
            }
            if (obj.fileSize) obj.fileSize = Number(obj.fileSize.substr(0, obj.fileSize.length - 2)) * 1024;
            this.$http.put(`/basicdata/basicfilemanager/updateById`, obj).then(() => {
                this.$message.success('标签已删除');
                row.isvisible = false;
                this.getData();
            });

        },
        complete(row) {
            let obj = { ...row };
            if (obj.tags.length) {
                obj.tags[this.$index] = this.form.tagCode;
            }
            obj.tag = obj.tags.join(',');
            if (obj.fileSize) obj.fileSize = Number(obj.fileSize.substr(0, obj.fileSize.length - 2)) * 1024;
            this.$http.put(`/basicdata/basicfilemanager/updateById`, obj).then(() => {
                this.$message.success('标签已修改');
                row.isvisible = false;
                this.getData();
            });
        },
        hadlerRow(row) {
            let obj = { ...row };
            if (obj.tags.length) {
                obj.tags.splice(this.$index, 1);
            }
            if (obj.tags) obj.tag = obj.tags.join(',');
            if (obj.fileSize) obj.fileSize = Number(obj.fileSize.substr(0, obj.fileSize.length - 2)) * 1024;
            this.$http.put(`/basicdata/basicfilemanager/updateById`, obj).then(() => {
                this.$message.success('标签已修改');
                row.isvisible = false;
                this.getData();
            });
        },
        delTag(row) {
            this.dialogType = 'del';
            this.createTag(row);
            this.parentRow = { ...row };
        },
        createTag(row) {
            let tags = [];
            let obj = { ...row };
            this.parentRow = { ...row };
            this.$refs.form.validate(vali => {
                if (vali) {
                    if (obj.tag) tags = obj.tag.split(',');
                    tags.push(this.form.tagCode);
                    obj.tag = tags.join(',');
                    if (obj.fileSize) obj.fileSize = Number(obj.fileSize.substr(0, obj.fileSize.length - 2)) * 1024;
                    this.$http.put(`/basicdata/basicfilemanager/updateById`, obj).then(() => {
                        this.$message.success('创建标签成功');
                        this.getData();
                        row.isvisible = false;
                    });
                }
            });
        },
        CurrentChange(row) {
            if (row) {
                this.parentRow = { ...row };
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
        SelectChange(selection) {
            this.selectRows = selection;
        },
        successFile() {
            this.getData();
        },
        CellMouseEnter(row) {
            this.isOperat = row.id;
        },
        CellMouseLeave() {
            this.isOperat = '';
        },
        DownFile(row) {
            const href = row.visitUrl;
            const $a = document.createElement('a');
            $a.href = href;
            $a.download = row.name;
            $a.click();
            this.$message.success('文件正在准备下载中');
        },
        hideClose(row) {
            this.searchStr = '';
            this.form.tagCode = '';
            this.visible = true;
            this.parentRow = { ...row };
            this.dialogType = '';
        }
    }
};
</script>
<style lang="stylus" scoped>
.doclibrary
  & >>> .fr
    float right;

.search
  padding 14px 10px;
  background #f5f5f5;
  overflow hidden;
  box-sizing border-box;
  transition-duration 0.2s;
  height 57px;

  &.hide
    padding-top: 0;
    padding-bottom: 0;
    height 0;
.operat
    display flex
    justify-content space-around
    i
        margin 0 18px
        font-size 18px
        font-weight 600
        &:hover
            color $color-blue
.el-popover
    padding 12px 0 !important
ul
    margin 0
    padding 0
    list-style none
.cell_pop
    li
        .el-form
            .el-form-item
                margin-bottom 0
        &:first-child >>>
            height 30px
            border-bottom 1px solid #ccc
            .el-input__inner
                border none
        &:not(:first-child)
            line-height 40px
            &:hover
                background #f5f5f5
.cell_pop2
    li
        &:first-child >>>
           height 30px
           border-bottom 1px solid #ccc
           display flex
           justify-content space-between
           align-items center
    .input_height
        margin-top 10px
        >>> .el-input__inner
            height 35px
    .btns
        padding-top 15px
        display flex
        justify-content space-between
        >>> .el-button
            width 32px
            height 32px

    .dialog_btns
        margin-top 10px
        display: flex
        justify-content space-between
        >>> .el-button
            width 50%
.mpi
    >>> span
        margin-right 5px


.circle
    display flex
    justify-content space-between
    i
        margin-left 4px
    .c1
        position relative
        margin-left 20px
        &:before
            content: ''
            width 10px
            height 10px
            border-radius 5px
            background-color $color-blue
            position absolute
            left -20px
            top 14px

.table >>>
    .el-table-column--selection
        .cell
            width 45px!important
    ._color
        color #cdcdcd
        cursor default
        user-select none

.add_color
    color $color-blue
.work_color
    color #2a5699

.pdf_color
    color #a33639

.exe_color
    color #207245

.zip_color
    color #59a5dc

.default_color
    color #695a53

.filename_icon
    margin-right 5px
    font-size 20px
    vertical-align middle

</style>
