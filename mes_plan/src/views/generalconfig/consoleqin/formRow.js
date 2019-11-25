export default {
    'FlowEquipHandover': {
        dialogForm: [{
            label: '移交验收单号',
            prop: 'transferAcceptanceCode',
            value: '',
            disabled: true,
        }, {
            label: '移交内容',
            prop: 'transferContent',
            value: '',
            disabled: true,
        }, {
            label: '移交时间',
            prop: 'transferDate',
            value: '',
            type: 'datetime',
            disabled: true,
        }, {
            label: '移交人员',
            prop: 'transferPersonnel',
            value: '',
            disabled: true,
        }, {
            label: '验收人员',
            prop: 'inspectionPersonnel',
            value: '',
            disabled: true,
        }, {
            label: '验收时间',
            prop: 'inspectionDate',
            value: '',
            type: 'datetime',
            disabled: true,
        }],
        api: '/act/flowequiphandover/getById'
    }
};