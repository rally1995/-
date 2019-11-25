
    //div
        table(
            border="1"
            style="border-collapse:collapse")
            template(v-for="col in column")
                template(v-if="col.children && col.children.length")
                    tr(v-for="child in col.children")
                        th {{child.label}}
                tr(v-else)
                    th {{col.label}}
    //- table
    //-     tr
    //-         th(colspan="3") js
    //-         td 11
    //-     tr
    //-         th(rowspan="4") zlsd
    //-         th(rowspan="2") fj
    //-         th fj1
    //-         td 22
    //-     tr
    //-         th fj2
    //-         td 33
    //-     tr
    //-         th(colspan="2") hj
    //-         td 34
    //-     tr
    //-         th(colspan="2") hx
    //-         td 44
    //-     tr
    //-         th(colspan="3") sj
    //-         td 55
    //-     tr
    //-         th(rowspan="4") jlg
    //-         th(colspan="2") s1
    //-         td 66
    //-     tr
    //-         th(colspan="2") 2
    //-         td 77
    //-     tr
    //-         th(colspan="2") 3
    //-         td 88
    //-     tr
    //-         th(colspan="2") x4
    //-         td 99


<script>
import * as _ from 'lodash';
export default {
    name: 'tableRow',
    props: {
        column: {
            type: Array,
            default: () => [],
        },
        data: {
            type: Array,
            default: () => [],
        }
    },
    computed: {
        arrayLevel() {
            let newLevel = 0;
            const emun = (arrs, level = 0) => arrs.forEach(v => {
                let level1 = level + 1;
                if (v.children && v.children.length) {
                    emun(v.children, level1);
                } else {
                    if (level1 > newLevel) {
                        newLevel = level1;
                    }
                }
            });
            emun(this.column);
            return newLevel;
        }
    },
    render(h) {
        let depth = 0;
        let level = 0;
        const emun = (
            column
        ) => {
            let row = [];
            level++;
            depth = level > depth ? level : depth;
            let sonLevel = 1;
            column.forEach((col, i) => {
                let rowspan = 1;
                let ths = [{ tag: 'th', text: col.label, rowspan, level, sonLevel }];
                if (col.prop) ths[0].td = col.prop;
                if (col.children && col.children.length) {
                    let [e0, ...e] = emun(col.children);
                    const maxSonLevel = _.maxBy(
                        [].concat(e0, ...e),
                        v => v.sonLevel
                    );
                    ths[0].rowspan =
                        e.length +
                        ths[0].rowspan;
                    ths[0].sonLevel += maxSonLevel.sonLevel;
                    ths = [...ths, ...e0];
                    row.push(ths);
                    row = row.concat(e);
                } else {
                    if (col.type === 'index') {
                        ths.push(...this.data.map((v, i) => ({
                            tag: 'td',
                            text: i + 1,
                        })));
                    } else if (col.prop) {
                        ths.push(...this.data.map(v => ({
                            tag: 'td',
                            text: v[col.prop],
                        })));
                    }
                    row.push(ths);
                }
            });
            level--;
            return row;
        };
        let trs = emun(this.column)
            .map(v => h('tr', v.map(j => h(j.tag, {
                attrs: j.tag === 'th'
                    ? {
                        rowspan: j.rowspan,
                        colspan: j.sonLevel === 1 ? depth - j.level + 1 : 1,
                    }
                    : null,
            }, j.text))));
        return h('table', [
            h('tbody', [
                trs,
            ]),
        ]);
    },
};
</script>
<style lang="stylus" scoped>
table
    height 100%
    border-color 1px solid #dedede
    border-collapse collapse

    th
        background-color #f5f5f5

    td, th
        border 1px solid #dedede

    tr:hover > td
        background-color #F5F7FA
    td
        text-align center
        padding 0 5px
        min-width 40px
</style>
