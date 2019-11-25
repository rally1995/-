export default {
    // 工单状态：0：待生产 1 生产中 2 暂停 3 撤销 4 完工
    orderStatus: {
        0: '待生产',
        1: '生产中',
        2: '暂停',
        3: '撤销',
        4: '完工',
    },
    stationStatus: {
        0: '空闲',
        1: '等车',
        2: '等料',
        3: '生产',
    },
    boardinType: {
        0: '领料',
        1: '领空托盘',
    },
    boardInStats: {
        0: '申请',
        1: '等待',
        2: '完成',
    },
    usageType: {
        P: '生产',
        D: '报废',
        L: '损耗',
    },
    feedingStatus: {
        1: '待投料',
        2: '投料中',
        3: '已完成'
    },
    materielCodeStatus: {
        1: '可用',
        2: '出版中',
        3: '占用'
    },
    needPosting: {
        0: '否',
        1: '是',
    },
    procedureNo: {
        M: '混胶',
        C: '上胶',
        S: '裁切',
        B: '叠制-层压',
        F: '成品板修边',
    },
    state: {
        0: '待发送',
        1: '已过账',
        2: '已冲销',
    },
    postingState: {
        0: '待过账',
        1: '待发送',
        2: '已过账',
        3: '已冲销',
    },
    acquisitionState: {
        0: '申请',
        1: '等待',
        2: '完成',
    },
    status: {
        1: '申请中',
        2: '已审核',
        3: '审核不通过',
    },
    transferStatus: {
        0: '未转移',
        1: '转移中',
        2: '转移完成',
    },
    mainSource: {
        E: '自制',
        F: '采购',
        X: '采购/自制'
    },
    materialType: {
        0: '直接材料',
        1: '冶工夹膜',
        2: '包装材料',
    },
    materialState: {
        1: '启用',
        2: '未启用'
    },
    dataSource: {
        1: 'MES',
        2: 'SAP',
    },
    stationType: {
        1: '投入',
        2: '工作',
        3: '产出',
    },
    postingStatus: {
        0: '未开始',
        1: '进行中',
        2: '已完成',
    },
    goodsType: {
        1: '物料',
        2: '托盘',
    },
    fromType: {
        1: '工位料台',
        2: '仓库料口',
    },
    boardOutStats: {
        0: '待申请',
        1: '运输中',
        2: '已完成',
    },
    shiftName: {
        N: '正班',
        E: '早班',
        M: '中班',
        L: '晚班'
    },
    transportationStats: {
        0: '待申请',
        1: '运输中',
        2: '已完成',
    },
    boardType: {
        1: '进板',
        2: '出板',
    },
    autopostingState: {
        1: '进行中',
        2: '已完成',
    },
    stockSite: {
        SN01: 'SN01',
        SN02: 'SN02',
        SN03: 'SN03',
        SN04: 'SN04',
        SN05: 'SN05',
        SN09: 'SN09',
        SN010: 'SN010',
    },
    productEdition: {
        SA00: 'SA00',
        SACS: 'SACS',
    }
};
