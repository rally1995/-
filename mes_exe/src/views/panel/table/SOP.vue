<template lang="pug">
    .sop
        h3.title SOP
        div.buttons
            el-button(type="primary" @click="cut")
                i.iconfont.iconswitch
                |切换
        ebrain-table(
            :column="column"
            :data="data"
            :highlight-current-row="false")
            template(#operate)
                el-table-column(
                    label="操作"
                    width="120"
                    align="center")
                    template(v-slot="{row}")
                        el-button(
                            type="primary"
                            @click="check(row)") 查看
        ebrain-dialog-table.mation(
            :subLoading="subLoading"
            :isShow="isShow"
            row-key="id"
            :current-row-key.sync="currentRowKeyTable"
            :data="tableDialogData"
            :column="tableColumn"
            :visible.sync="dialogVisibleTable"
            highlight-current-row
            @row-click="getMeg"
            :disabled="Object.keys(row).length===0"
            @submit="submitFormTable")
        //- el-dialog(
        //-     :visible.sync="dialogVisible"
        //-     :close-on-click-modal="false")
        .wrap(v-show="false")
            .img(v-viewer)
                img(:src="imageUrl")
</template>
<script>
import { mapState } from 'vuex';
export default {
    name: 'linePosition',
    data() {
        return {
            imageUrl: '',
            dialogVisible: false,
            dialogVisibleTable: false,
            tableDialogData: [],
            tableColumn: [{
                label: '序号',
                type: 'index',
                width: 50,
                align: 'center',
            }, {
                label: '文件编号',
                prop: 'fileNo',
                showOverflowTooltip: true,
            }, {
                label: '文件名称',
                prop: 'fileName',
                showOverflowTooltip: true,
            }, {
                slot: 'SOP',
            }],
            isShow: false,
            subLoading: false,
            currentRowKeyTable: '',
            column: [{
                label: '文件编号',
                prop: 'fileNo',
            }, {
                label: '文件名称',
                prop: 'fileName',
            }, {
                slot: 'operate'
            }],
            data: [],
            row: {},
            db: null,
        };
    },
    computed: {
        ...mapState('workcenter', {
            workcenter: state => state.workcenter,
        }),
        wc() {
            return this.$route.query.wc;
        },
    },
    watch: {
        dialogVisibleTable(v) {
            if (!v) {
                this.row = {};
            }
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
        // initPage() {
        //     return new Promise((resolve, reject) => {
        //         let request = window.indexedDB.open('seadog');
        //         request.onupgradeneeded = event => {
        //             this.db = event.target.result;
        //             if (!this.db.objectStoreNames.contains('SOP')) {
        //                 let objectStore = this.db.createObjectStore('SOP', { keyPath: 'id' });
        //                 objectStore.createIndex('fileNo', 'fileNo', { unique: false });
        //                 objectStore.createIndex('fileName', 'fileName', { unique: false });
        //             }
        //             resolve();
        //         };
        //         request.onerror = event => reject(event);
        //     });
        // },
        // getData() {
        //     return new Promise((resolve, reject) => {
        //         const obj = this.db.transaction(['SOP']).objectStore('SOP');
        //         const openCursor = obj.openCursor();
        //         let arr = [];
        //         openCursor.onsuccess = event => {
        //             let cursor = event.target.result;
        //             if (cursor) {
        //                 arr.push({
        //                     id: cursor.value.id,
        //                     fileNo: cursor.value.fileNo,
        //                     fileName: cursor.value.fileName,
        //                 });
        //                 cursor.continue();
        //             } else {
        //                 this.data = arr;
        //                 resolve(arr);
        //             }
        //         };
        //     });
        // },
        // cut() {
        //     this.dialogVisibleTable = true;
        //     this.getDialogTable();
        // },
        // submitFormTable() {
        //     let action = this.data.length ? 'put' : 'add';
        //     console.log(action);
        //     const obj = this.db.transaction(['SOP'], 'readwrite').objectStore('SOP')[action]({
        //         id: 1,
        //         fileNo: this.row.fileNo,
        //         fileName: this.row.fileName,
        //     });
        //     obj.onsuccess = () => {
        //         this.getData();
        //     };
        //     this.dialogVisibleTable = false;
        // },
        getData() {
            let data;
            try {
                data = JSON.parse(localStorage.getItem('mydata_' + this.wc));
            } catch (err) {
                console.log(err);
            } finally {
                this.data = data ? [data] : [];
                this.imageUrl = this.data[0].fileAddress;
            }
        },
        check() {
            // this.dialogVisible = true;
            // this.$http.get(val.fileAddress, {
            //     responseType: 'blob',
            // }).then(res => {
            //     if (res) {
            //         const blob = new Blob([res]);
            //         this.imageUrl = window.URL.createObjectURL(blob);
            //     }
            // });
            const viewer = this.$el.querySelector('.img').$viewer;
            viewer.show();
        },
        getMeg(row) {
            this.row = row;
        },
        cut() {
            this.dialogVisibleTable = true;
            this.getDialogTable();
        },
        submitFormTable() {
            localStorage.setItem('mydata_' + this.wc, JSON.stringify(this.row));
            this.dialogVisibleTable = false;
            this.getData();
        },
        getDialogTable() {
            this.subLoading = true;
            const conditionList = [{
                fieldName: 'workcenterNo',
                joinType: 'AND',
                operation: 'EQ',
                value: this.wc,
            }];
            this.$http.get(`/basicdata/basicsop/page?size=9999`, {
                params: {
                    conditionList
                }
            }).then(res => {
                this.subLoading = false;
                this.tableDialogData = res.data.records;
            }).catch(() => {
                this.subLoading = false;
            });
        },
    },
};
</script>
<style scoped lang="stylus">
.sop
    height 100%
    flex-flow column nowrap

.title
    margin 5px 10px
    padding 5px 10px

.buttons
    padding 0 0 15px 15px

.img
    position absolute
    top 0
    right 0
    bottom 0
    left 0

    img
        width 100%
        height 100%
        object-fit contain

.wrap
    height 100%
    width 100%
    position relative

</style>
