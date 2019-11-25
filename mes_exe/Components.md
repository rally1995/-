# EbrainTable 表格组件
## Base 基本使用
```html
<template lang="pug">
  ebrain-table(
    :column="column"
    :data="data"
    :highlight-current-row="false"
    table-row-edit
    @cell-save="cellSave")
</template>
<script>
  export default {
    data() {
      return {
        column: [{
            label: '序号',
            type: 'index',
            width: 50,
            align: 'center',
        }, {
            label: '生产批次号',
            prop: 'materielName',
        }, {
            label: '总重（kg)',
            prop: 'stationCode',
        }, {
            label: '皮重（kg)',
            prop: 'subMtNeed',
        }, {
            label: '净重（kg)',
            prop: 'needAmount',
            option: dict,
        }],
        data: [{
            materielName: 'xx123',
            stationCode: 'XA123',
            subMtNeed: 4,
            needAmount: '3'
        }, {
            materielName: 'xx123',
            stationCode: 'XA123',
            subMtNeed: 4,
            needAmount: '3'
        }, {
            materielName: 'xx123',
            stationCode: 'XA123',
            subMtNeed: 4,
            needAmount: '3'
        }]
      };
    },
    methods: {
      cellSave(row, finish) {
          setTimeout(finish, 1000);
      },
    }
  }
</script>
```
## Attributes 参数
|参数|说明|类型|默认值|可选值|
|----|----|----|----|----|
|table-row-edit|是否开启行内编辑|boolean|false|   |

## Events 事件
|事件|说明|参数|
|----|----|----|
|cell-save|表格行编辑的时候点击保存的事件，editRow是行编辑的数据块，finish是保存完结束方法|editRow, finish|

## Methods 方法
|方法|说明|参数|
|----|----|----|
|new|新增数据，如新增时有默认值，则传默认值，否则不传|row|
