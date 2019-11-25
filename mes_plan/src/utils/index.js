/**
 * 随机字符串
 * @param len:number 字符串位数
 * @param data:boolean 是否使用时间戳
 * @returns {string}
 */
export const randomLenNum = (len = 4, data) => {
    let random = '';
    random = Math.ceil(Math.random() * 100000000000000).toString().substr(0, len);
    if (data) random = random + Date.now();
    return random;
};

export const strip = (number, precision = 12) => {
    return Number(parseFloat(number.toPrecision(precision)));
};
