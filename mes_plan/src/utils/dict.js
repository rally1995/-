export default {
    lockFlag: {
        0: '有效',
        9: '锁定',
    },
    userType: {
        0: '试用',
        1: '正式'
    },
    autoapprove: {
        true: '是',
        false: '否'
    },
    type: {
        0: '菜单',
        1: '按钮'
    },
    classManagementStatus: {
        0: '禁用',
        1: '启用'
    },
    isPurchasingUnit: {
        true: '是',
        false: '否'
    },
    isProductionUnit: {
        true: '是',
        false: '否'
    },
    isInventoryUnit: {
        true: '是',
        false: '否'
    },
    isSaleUnit: {
        true: '是',
        false: '否'
    },
    isInspectionUnit: {
        true: '是',
        false: '否'
    },
    isPackingUnit: {
        true: '是',
        false: '否'
    },
    delFlag: {
        0: '有效',
        1: '无效'
    },
    productionStats: {
        0: '无效',
        1: '有效'
    },
    dicPersonnel: {
        0: '在岗',
        1: '离职'
    },
    personnelSex: {
        0: '男',
        1: '女'
    },
    shiftName: {
        N: '正班',
        E: '早班',
        M: '中班',
        L: '晚班'
    },
    whetherCrossDay: {
        0: '否',
        1: '是'
    },
    shiftStatus: {
        1: '启用',
        0: '禁用'
    },
    mainSource: {
        E: '自制',
        F: '采购',
        X: '采购/自制'
    },
    materialState: {
        1: '启用',
        2: '未启用'
    },
    materialType: {
        0: '直接材料',
        1: '冶工夹膜',
        2: '包装材料',
    },
    assetStatus: {
        0: '新建',
        1: '在用',
        2: '封存',
        3: '闲置',
        4: '报废'
    },
    workStatus: {
        0: '正常',
        1: '工作',
        2: '带病运行',
        3: '停机'
    },
    processType: {
        0: '自制',
        1: '委外'
    },
    status: {
        0: '草稿',
        1: '启用',
        2: '停用',
    },
    workingHoursType: {
        0: 'P-人机',
        1: 'T-机时'
    },
    dataSource: {
        1: 'MES',
        2: 'SAP',
    },
    isValid: {
        0: '未删除',
        1: '已删除'
    },
    commissioningType: {
        0: '试产',
        1: '正式'
    },
    documentStatus: {
        0: '待分配',
        1: '待生产',
        2: '生产中',
        3: '已完工',
        4: '指定结束'
    },
    sourceType: {
        1: 'MTO',
        2: 'MTS',
        3: 'MTF',
    },
    plan_documentStatus: {
        0: '未排产',
        1: '部分排产',
        2: '全部排产',
        3: '无需排产',
        4: '已完工'
    },
    productionStatus: {
        1: '待生产',
        2: '生产中',
        3: '已完工',
        4: '指定完工'
    },
    orderStatus: {
        1: '未计划',
        2: '已计划'
    },
    prodtasksheet_documentStatus: {
        0: '待生产',
        1: '生产中',
        2: '暂停',
        3: '已完工',
        4: '指定完工'
    },
    work_order_documentStatus: {
        0: '待分配',
        1: '待生产',
        2: '生产中',
        3: '已完工',
    },
    print_documentStatus: {
        0: '草稿',
        1: '待生成标签',
        2: '待定盘',
        3: '已入库',
        4: '不合格注销',
        5: '已退库',
    },
    bomType: {
        1: '基于库存',
        2: '完全自制',
        3: '部分自制',
    },
    work_order_status: {
        1: '未开始',
        2: '生产中',
        3: '已完工',
        4: '取消'
    },
    order_Status: {
        0: '待提交',
        1: '已提交',
    },
    plan_status: {
        1: '待提交',
        2: '已提交',
        3: '已完工',
    },
    supplier_status: {
        0: '停用',
        1: '启用',
    },
    source: {
        0: 'MES系统',
        1: 'SAP系统',
    },
    purandrecStatus: {
        0: '草稿',
        1: '已收料',
        2: '不合格注销',
    },
    InventoryType: {
        X: '质量检验',
        S: '冻结的库存',
        null: '非限制使用'
    },
    purchase_documentStatus: {
        0: '草稿',
        1: '已提交',
        2: '不合格注销'
    },
    purchase_roofStatus: {
        0: '草稿',
        1: '待收料',
        2: '已收料',
        3: '不合格注销',
    },
    printStauts: {
        0: '否',
        1: '是',
    },
    belongProcess: {
        M: '混胶',
        C: '上胶',
        S: '裁切',
        B: '叠制-层压',
        F: '成品板修边',
    },
    postingStatus: {
        Y: '已过账',
        N: '未过账',
        0: '已冲销',
    },
    stationStats: {
        0: '空闲',
        1: '等车',
        2: '等料',
        3: '生产',
    },
    stationType: {
        1: '投入工位',
        2: '工作工位',
        3: '产出工位',
    },
    platformMark: {
        0: '无料台工位',
        1: '有料台工位',
    },
    tranEntry: {
        Y: '是',
        N: '否',
    },
    bindingWarehouse: {
        A: '领料仓A',
        B: '领料仓B',
        C: '领料仓C',
    },
    siteType: {
        1: '工位',
        2: '仓库',
    },
    siteState: {
        0: '停用',
        1: '正常',
    },
    entranceType: {
        0: '未设定',
        1: '出库口',
        2: '入库口',
    },
    isSatisfied: {
        0: '不满足',
        1: '满足'
    },
    transferOutStauts: {
        0: '未审核',
        1: '已审核',
    },
    planExecType: {
        0: '员工',
        1: '班组',
    },
    palnCyleType: {
        0: '单次',
        1: '多次',
    },
    Palnstatus: {
        0: '草稿',
        1: '启用',
        2: '停用',
        3: '结束',
    },
    isSuccess: {
        0: '成功',
        1: '失败',
    },
    jobStatus: {
        0: '未完成',
        1: '已完成',
        2: '已中止',
    },
    isResponsiblePersonnel: {
        0: '是',
        1: '否',
    },
    isAbnormal: {
        1: '否',
        2: '是'
    },
    isRaire: {
        0: '否',
        1: '是',
    },
    REPAIR_STATUS: {
        0: '待提交',
        1: '待派工',
        2: '已派工待维修',
        3: '维修中',
        4: '完成维修待验收',
        5: '验收完成',
    },
    repair_status: {
        0: '待验收',
        1: '已验收',
        2: '退回',
        3: '待提交'
    },
    purchasStatus: {
        0: '待入库',
        1: '已入库',
    },
    projectStatus: {
        0: '未验收',
        1: '验收中',
        2: '已验收',
    },
    equiStatus: {
        0: '未验收',
        1: '已验收',
    },
    check_result: {
        0: '合格',
        1: '不合格',
    },
    acceptResult: {
        0: '不通过',
        1: '通过',
    },
    returnSlip: {
        0: '未提交',
        1: '已提交',
        2: '已退货',
    },
    returnSlipSearch: {
        0: '未提交',
        1: '已提交',
    },
    bindType: {
        1: '物料',
        2: '托盘类型',
    },
    acceptStatus: {
        0: '未验收',
        1: '验收中',
        2: '已验收',
    },
    examStatus: {
        0: '未审核',
        1: '审核中',
        2: '已审核',
    },
    autoPostingStatus: {
        '-1': '发送中',
        0: '待发送',
        1: '已过帐',
        2: '过账失败',
        3: '已冲销',
    },
    actionType: {
        S: '收货',
        H: '消耗',
    },
    changeType: {
        41: '生产收货单',
        42: '生产领料单',
    },
    taskStauts: {
        0: '草稿',
        1: '处理中',
        2: '完成',
    },
    measurStatus: {
        0: '禁用',
        1: '启用',
    },
    isCalib: {
        0: '否',
        1: '是',
    },
    cycleType: {
        1: '天',
        2: '周',
        3: '月',
        4: '单',
    },
    appResult: {
        0: '不通过',
        1: '通过',
    },
    isEmergency: {
        0: '是',
        1: '否'
    }
};
