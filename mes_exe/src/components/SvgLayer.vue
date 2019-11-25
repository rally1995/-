<script>
import * as d3 from 'd3';

export default {
    name: 'SvgLayer',
    data() {
        return {
            data: [{
                label: '钢板',
                id: '10001',
                color: '#ff0'
            }, {
                label: '铜箔',
                id: '10002',
                color: '#f00'
            }, {
                label: 'PP组',
                id: '10003',
                color: '#bb0'
            }],
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.$nextTick(() => {
                const stageRect = this.$el.getBoundingClientRect();
                const { width, height } = stageRect;
                d3.select(this.$el)
                    .selectAll('rect')
                    .data(this.data)
                    .enter()
                    .append('rect')
                    .attr('class', 'svglayer')
                    .attr('x', width / 2 - width / 8)
                    .attr('y', (d, i, arr) => height / (arr.length + 1) * (i + 1))
                    .attr('width', width / 2)
                    .attr('height', width / 2)
                    .attr('style', `transform:rotateX(45deg) translate(0,${-1 * width / 4}px);`);
                d3.select(this.$el)
                    .selectAll('text')
                    .data(this.data)
                    .enter()
                    .append('text')
                    .text(d => d.label)
                    .attr('x', 30)
                    .attr('y', (d, i, arr) => height / (arr.length + 1) * (i + 1));
                d3.select(this.$el)
                    .selectAll('path')
                    .data(this.data)
                    .enter()
                    .append('path')
                    .link({
                        source: [100, 100],
                        target: [300, 300],
                    });
            });
        },
    },
    template: '<svg style="perspective:800px;-webkit-perspective:800px;"/>',
};
</script>
