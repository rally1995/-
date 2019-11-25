import $http from '@/utils/http';

// 领料-选择物料
export const queryMaterialByOrder = orderId => {
    return $http.get(`/productionexe/prodexeorderdetail/listOrderBom/${orderId}`);
};
// 领料-获取工位信息
export const queryJerkByOrder = orderNo => {
    return $http.get(`/productionexe/prodexeorder/orderNo/${orderNo}`);
};

// 领料-获取物料信息
export const getMaterialInfo = orderId => {
    return $http.get(`/productionexe/orderbom/listOrderBom/${orderId}`);
};
// 退料-获取工位信息
export const getOrderInfo_Retreat = params => {
    return $http.post('/productionexe/prodexestation/list', params);
};
// 退料-获取线边仓详情列表 ------->可判断是退料还是退托盘
export const getLinePositions = stationCode => {
    return $http.get('/productionexe/sideweDetail/getSwByStationCode', {
        params: {
            stationCode,
        },
    });
};

// 投料列表
export const getDeliveryInfo = orderId => {
    return $http.get(`/productionexe/prodprocessstep/listFeedBom/order/${orderId}`);
};

// 报废-获取报废信息
export const getScrapInfo = (workcenterCode, subMaterielCode) => {
    return $http.get('/productionexe/sideweDetail/getSwBySubCodeAndWorkCode', {
        params: {
            workcenterCode,
            subMaterielCode,
        },
    });
};
export const queryStationByOrder = params => {
    return $http.post(`/productionexe/prodexestation/list`, params);
};

export const queryRundletByOrder = orderId => {
    return $http.get(`/productionexe/prodexemixlotinfo/getByOrderId/${orderId}`);
};

export const submitBoardin = params => {
    return $http.post(`/productionexe/boardin/apply`, params);
};

// 领胶水
export const submitDrawGlue = params => {
    return $http.post(`/productionexe/prodexewarehouse/drawGlue`, params);
};

export const queryRetreatMaterial = (orderNo, stationCode) => {
    return $http.post(`/productionexe/prodexeboardoutdetail/getRetreatMateriel`, null, {
        params: {
            orderNo,
            stationCode,
        }
    });
};

export const submitRetreat = (orderNo, stationCode, type, sideDetailList) => {
    /**
     * type: 1:混胶
     */
    return $http.post(`/productionexe/publish/apply`, {
        orderNo,
        stationCode,
        type,
        sideDetailList
    });
};

export const submitRetreatPlate = (orderNo, stationCode) => {
    return $http.post(`/productionexe/publish/getWithDraw`, null, {
        params: {
            orderNo,
            stationCode,
        }
    });
};

export const querySideWareHouse = subMaterielCode => {
    return $http.get(`/productionexe/sideweDetail/getSideWarehouseByCode`, {
        params: {
            subMaterielCode,
        }
    });
};

export const checkLotAndSn = (lot, sn, number) => {
    let param = {};
    if (lot) param.lot = lot;
    if (sn) param.sn = sn;
    if (number) param.number = number;
    return $http.post(`/productionexe/prodexeboardoutdetail/checkLotAndSn`, param);
};

export const submitSaveExit = (orderId, stationCode, materielCode, batchList) => {
    return $http.post(`/productionexe/boardout/saveExitSheet`, {
        orderId,
        stationCode,
        materielCode,
        batchList,
    });
};

export const submitMixFeedBegin = feedingList => {
    return $http.post(`/productionexe/prodexemixfeed/mixFeedBegin`, feedingList);
};

export const submitMixFeedEnd = feedingList => {
    return $http.post(`/productionexe/prodexemixfeed/mixFeedEnd`, feedingList);
};

export const submitScrapOrLoss = (orderId, type, materialCode, unit, list, remark) => {
    return $http.post(`/productionexe/prodexeusedmete/batchSave`, {
        orderId,
        usage: type,
        subMaterielCode: materialCode,
        details: list,
        usageRemark: remark,
    });
};

export const listInboard = () => {
    return $http.get(`/productionexe/boardin/page`, {
        params: {
            size: 999,
        }
    });
};

export const listOutboard = (boardType, workcenterNo) => {
    return $http.get(`/productionexe/boardio/list`, {
        params: {
            boardType,
            workcenterNo,
            size: 999,
        }
    });
};

export const listInmaterial = () => {
    return $http.get(`/productionexe/prodexemixfeed/page`, {
        params: {
            size: 999,
        }
    });
};

export const listUsematerial = () => {
    return $http.get(`/productionexe/prodexeusedmete/page`, {
        params: {
            size: 999,
        }
    });
};

export const listOutput = () => {
    return $http.get(`/productionexe/prodexeprodmete/page`, {
        params: {
            size: 999,
        }
    });
};

export const listInventory = () => {
    return $http.get(`/productionexe/sidewe/page`, {
        params: {
            size: 999,
        }
    });
};
// 混胶-获取工位库存
export const getStationInventory = workcenterCode => {
    return $http.get(`/productionexe/sideweDetail/getSwByWorkCodeAccur`, {
        params: {
            workcenterCode,
            size: 999,
        }
    });
};

export const submitJerkSaveBatch = ({ orderId, materielCode, amount, unit, glueProportion, glueViscosity, gluePh, glueTemperature, diConductivity }) => {
    return $http.post(`/productionexe/prodexemixlotinfo/save`, {
        orderId,
        materielCode,
        amount,
        unit,
        glueProportion,
        glueViscosity,
        gluePh,
        glueTemperature,
        diConductivity,
    });
};

export const submitRundlet = (orderId, materielCode, mlot, amount, unit) => {
    return $http.post(`/productionexe/prodexeprodmete/save`, {
        orderId,
        materielCode,
        mlot,
        amount,
        unit,
    });
};

// 混胶-转小桶
export const turnBarrel = (orderId, materielCode, mlot, number, unit) => {
    return $http.post(`/productionexe/prodexewarehouse/saveKegInfo`, {
        orderId,
        materielCode,
        mlot,
        number,
        unit,
    });
};

export const submitStirStart = (orderId, stirTimeBegin, subMaterielCode, amount) => {
    return $http.put(`/productionexe/prodexemixfeed/updateById`, {
        orderId,
        stirTimeBegin,
        subMaterielCode,
        amount,
    });
};

export const submitStirEnd = (mixFeedIds, feedTimeEnd, type) => {
    return $http.put(`/productionexe/prodexemixfeed/updateByOrderId`, {
        mixFeedIds,
        feedTimeEnd,
        type,
    });
};

export const processcenterList = () => {
    return $http.get(`/productionplan/ppprocess/page`, {
        params: {
            size: 999,
        }
    });
};

export const getworkcenterList = (value) => {
    // /productionplan/ppworkcenterpriority/getWorkCenterPriorityPageByProcessCode
    return $http.get('/basicdata/workcenter/page', {
        params: {
            size: 999,
            conditionList: [{
                fieldName: 'processCode',
                operation: 'EQ',
                value,
            }]
        },
    });
};

export const getjobpoolList = (workcenterNo, state) => {
    return $http.get(`/productionexe/order/list/workcenter/${workcenterNo}/state/${state}`);
};

export const getliminaList = (workcenterCode) => {
    return $http.get(`/productionexe/prodexestoragelibrary/page`, {
        params: {
            size: 999,
            workcenterCode
        }
    });
};

// // 获取上料位信息
// export const getStorageLibrary = () => {
//     return $http.get('/productionexe/prodexestoragelibrary/listByArea');
// };

// 获取库区信息
export const getLibraryArea = (workcenterCode) => {
    return $http.get(`/productionexe/prodexestoragelibrary/listArea/${workcenterCode}`);
};

// 根据库区获取库位
export const getLibraryUnit = (form) => {
    return $http.post('/productionexe/prodexestoragelibrary/listByArea', {
        ...form
    });
};

// 获取大托盘
export const getBigpallet = (reservoirArea, libraryNumber) => {
    return $http.get('/productionexe/prodexestoragelibrary/page', {
        params: {
            reservoirArea,
            libraryNumber
        },
    });
};

// 装料提交
export const addMater = orderId => {
    return $http.post(`/productionexe/prodexestoragelibrary/putMateriel/${orderId}`);
};
// 移库
export const removeArea = (form, orderId) => {
    return $http.post(`/productionexe/prodexestoragelibrary/move/${orderId}`, {
        ...form
    });
};
// 卸料
export const getxieliao = (orderId) => {
    return $http.post(`/productionexe/prodexestoragelibrary/unloadMateriel/${orderId}`);
};
//  生产入库提交
export const getYield = (params) => {
    return $http.post(`/productionexe/boardout/trimmingGoodsYield`, params);
};

// 上胶-获取工单详情
export const queryCoating = orderId => {
    return $http.get(`/productionexe/order/get/id/${orderId}`);
};

// 胶水稀释
export const getGlueAttenuation = params => {
    if (params.finalAmount) params.finalAmount = Number(params.finalAmount);
    if (params.gluePh) params.gluePh = Number(params.gluePh);
    if (params.glueProportion) params.glueProportion = Number(params.glueProportion);
    if (params.glueTemperature) params.glueTemperature = Number(params.glueTemperature);
    if (params.glueViscosity) params.glueViscosity = Number(params.glueViscosity);
    return $http.post(`/productionexe/prodexegluedilution/addGlueDilution`, params);
};

// 上卷,卸卷查询
export const getSideWeDetailByStationCode = (workcenterCode) => {
    return $http.get(`/productionexe/sideweDetail/getSideWeDetailByStationCode`, {
        params: {
            workcenterCode
        }
    });
};

// 裁切铜箔-生产批次查询
export const getBatch = (stationCode) => {
    return $http.get(`/productionexe/sideweDetail/getSideWeDetailByStationCode`, {
        params: {
            stationCode
        }
    });
};

// 上卷,卸卷提交
export const updateSideWeDetailStatus = (sideDetailIds, type) => {
    return $http.post(`/productionexe/sideweDetail/updateSideWeDetailStatus`, {
        sideDetailIds,
        type
    });
};

// 投料-获取物料信息
export const getBySn = sn => {
    return $http.get(`/productionexe/sideweDetail/getBySn/${sn}`);
};

// 投料-提交
export const batchSave = (orderId, details, subMaterielCode, unit, usage, usageRemark) => {
    return $http.post(`/productionexe/prodexeusedmete/batchSave`, {
        orderId,
        details,
        subMaterielCode,
        unit,
        usage,
        usageRemark,
    });
};

// 上胶-生产批次提交
export const postCating = (orderId, amount, materielCode, materielName, unit, stationCode) => {
    return $http.post(`/productionexe/prodexeprodmete/coating`, {
        orderId,
        amount,
        materielCode,
        materielName,
        unit,
        stationCode
    });
};

// 上胶-生产入库提交
export const applyWarehousing = (orderNo, stationCode, sideDetailIds) => {
    return $http.post(`/productionexe/publish/applyWarehousing`, {
        orderNo,
        stationCode,
        sideDetailIds,
    });
};

// 裁切铜箔-生产批次提交
export const trimmingProdLot = params => {
    return $http.post(`/productionexe/prodexeprodmete/trimmingProdLot`, params);
};

// 上胶-投料
export const getSwBySubCode = subMaterielCode => {
    return $http.get(`/productionexe/sideweDetail/getSwBySubCode`, {
        params: {
            subMaterielCode
        }
    });
};

// 上胶退料-工位
export const topRollStationCode = (stationCode, workcenterCode) => {
    return $http.get(`/productionexe/sideweDetail/getSwByWorkCodeAndStationCode`, {
        params: {
            stationCode,
            workcenterCode
        }
    });
};

// 上胶结束退料
export const getMixfeedByOrderIdCode = (orderId, subMaterielCode) => {
    return $http.get(`/productionexe/prodexemixfeed/getMixfeedByOrderIdCode`, {
        params: {
            orderId,
            subMaterielCode
        }
    });
};

export const getGlueDilutionBySn = sn => {
    return $http.post(`/productionexe/prodexegluedilution/getGlueDilutionBySn`, null, {
        params: {
            sn
        }
    });
};

export const getEquitment = workcenterCode => {
    return $http.get(`/basicdata/workcenterdevicelist/listByWorkCenterCode/${workcenterCode}`);
};

export const getSAP = processNo => {
    return $http.get(`/productionexe/ordermanualrecord/listSalePlan/${processNo}`);
};

export const manualInputOrder = params => {
    return $http.post(`/productionexe/ordermanualrecord/manualInputOrder`, params);
};

export const deleteManual = id => {
    return $http.delete(`/productionexe/prodexeorder/remove/manual/${id}`);
};

export const getNotPosting = orderId => {
    return $http.get(`/productionexe/orderbom/listPostingBom/${orderId}`);
};

export const getBOM = orderId => {
    return $http.get(`/productionexe/prodexeorderdetail/listPostingBom/${orderId}`);
};

export const getPosting = orderId => {
    return $http.get(`/productionexe/posting/getById/${orderId}`);
};

export const postingChangeSave = (amount, reason) => {
    return $http.post(`/productionexe/postingchange/save`, {
        params: {
            amount,
            reason,
        }
    });
};

export const notPostingApply = params => {
    return $http.post(`/productionexe/posting/apply`, params);
};

export const postWithDraw = postingId => {
    return $http.get(`/productionexe/posting/withdraw/${postingId}`);
};

export const finshList = params => {
    return $http.get(`/productionexe/order/listFinish`, {
        params
    });
};

export const prodBatch = params => {
    return $http.post(`/productionexe/orderbatchposting/list`, params);
};

export const applyById = id => {
    return $http.get(`/productionexe/posting/applyById/${id}`);
};

export const postingHistory = (orderId, prodBatchNo) => {
    return $http.get(`/productionexe/posting/list/orderId/${orderId}/prodBatchNo/${prodBatchNo}`);
};

export const activate = orderId => {
    return $http.post(`/productionexe/order/start/${orderId}`);
};

export const finishOrder = orderId => {
    return $http.post(`/productionexe/order/complete/${orderId}`);
};

export const orderInfo = orderId => {
    return $http.get(`/productionexe/order/get/id/${orderId}`);
};
