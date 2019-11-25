# EbrainDialogImport
## 导入组件
### 参数说明
|参数|说明|类型|默认值|可选值|
|----|----|----|----|----|
|visible|显示隐藏dialog，支持sync修饰符|boolean|false||
|accept|导入的文件类型，如".xls,.xlsx"|string|||
|download-url|模版下载接口，组件内使用get请求|string|||
|import-url|导入文件接口，组件内使用post请求|string|||
|download-filename|模版下载文件名，需要带后缀，如"内容模版.xls"|string|||
|download-permission|模版下载权限|string|||
|import-permission|导入文件权限|string|||
|import-success|导入文件成功回调，返回(response,file)|function|||


# EbrainDialogExport
## 导出组件
### 参数说明

|参数|说明|类型|默认值|可选值|
|----|----|----|----|----|
|visible|显示隐藏dialog，支持sync修饰符|boolean|false||
|v-model|导出的文件名|string|||
|export-url|导出的接口地址，组件内用post请求|string|||
|params|导出接口传参，body传参|string|||
|before-export|导出前的方法，传setting，用来判断数据设定(0:全部，1:选中数据，2:当前页)。在方法里面 `return false`可拦截导出操作|function|||
|accep|导出的文件格式，以逗号间隔，如"xls,xlsx"|string|||
