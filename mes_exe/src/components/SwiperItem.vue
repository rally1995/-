<template lang="pug">
    .swiper(
        @touchstart.prevent.stop="touchStartHandler"
        @mousedown.prevent.stop="mouseDownHandler")
        .swiper-wrap
            .swiper-content
                slot
            .swiper-buttons(ref="btns")
                button.swiper-buttons-item(
                    type="button"
                    v-for="(btn, i) in btnName"
                    :style="{backgroundColor: btnColor[i] || btnBackgroundColors[i%4]}") {{btnName[i]}}
</template>

<script>
export default {
    name: 'SwiperItem',
    props: {
        btnName: {
            type: Array,
            default: () => [],
        },
        btnColor: {
            type: Array,
            default: () => [],
        },
        btnClick: {
            type: Array,
            default: () => [],
        }
    },
    data() {
        return {
            btnBackgroundColors: ['#2b8cf1', '#cc3c3c', '#0f8b71', '#536275'],
            startX: 0,
            clientX: 0,
            target: null,
            buttonsWidth: 0,
            timeout: null,
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            const btnsStyle = getComputedStyle(this.$refs.btns).width;
            this.buttonsWidth = Number(btnsStyle.replace(/px/, ''));
        },
        touchStartHandler(e) {
            this.target = e.target.closest('.swiper-wrap');
            window.addEventListener('touchmove', this.touchMoveHandler, false);
            window.addEventListener('touchend', this.tap, false);
            this.timeout = setTimeout(() => {
                window.removeEventListener('touchend', this.tap);
            }, 300);
            const [touch] = e.touches;
            this.clientX = touch.clientX;
            let left = getComputedStyle(this.target).left;
            left = Number(left.replace(/px/, ''));
            this.startX = left;
        },
        touchMoveHandler(e) {
            window.removeEventListener('touchend', this.tap);
            window.addEventListener('touchend', this.touchEndHandler, false);
            const [touch] = e.touches;
            const x = touch.clientX - this.clientX + this.startX;
            this.target.style.left = x + 'px';
        },
        touchEndHandler(e) {
            window.removeEventListener('touchmove', this.touchMoveHandler);
            window.removeEventListener('touchend', this.touchEndHandler);
            const target = this.target;
            this.target = null;
            let left = getComputedStyle(target).left;
            left = Number(left.replace(/px/, ''));
            target.style.transitionDuration = '250ms';
            if (left < -1 * this.buttonsWidth / 2) {
                target.style.left = -1 * this.buttonsWidth + 'px';
            } else {
                target.style.left = 0;
            }
            setTimeout(() => {
                target.style.transitionDuration = 'initial';
            }, 250);
        },
        tap(e) {
            window.removeEventListener('touchmove', this.touchMoveHandler);
            window.removeEventListener('touchend', this.touchEndHandler);
            const isBtn = e.target.classList.contains('swiper-buttons-item');
            if (isBtn) {
                const btns = e.target.closest('.swiper-buttons').querySelectorAll('.swiper-buttons-item');
                let index = 0;
                btns.forEach((v, i, l) => {
                    if (v === e.target) index = i;
                });
                this.btnClick[index]();
            } else {
                this.$emit('onclick');
            }
        },
        mouseDownHandler(e) {
            this.target = e.target.closest('.swiper-wrap');
            window.addEventListener('mousemove', this.mouseMoveHandler, false);
            window.addEventListener('mouseup', this.click, false);
            this.timeout = setTimeout(() => {
                window.removeEventListener('mouseup', this.click);
            }, 300);
            this.clientX = e.clientX;
            let left = getComputedStyle(this.target).left;
            left = Number(left.replace(/px/, ''));
            this.startX = left;
        },
        mouseMoveHandler(e) {
            window.removeEventListener('mouseup', this.tap);
            window.addEventListener('mouseup', this.mouseUpHandler, false);
            const x = e.clientX - this.clientX + this.startX;
            if (Math.abs(x) > 2) {
                window.removeEventListener('mouseup', this.click);
                this.target.style.left = x + 'px';
            }
        },
        mouseUpHandler(e) {
            window.removeEventListener('mousemove', this.mouseMoveHandler);
            window.removeEventListener('mouseup', this.mouseUpHandler);
            const target = this.target;
            this.target = null;
            let left = getComputedStyle(target).left;
            left = Number(left.replace(/px/, ''));
            target.style.transitionDuration = '250ms';
            if (left < -1 * this.buttonsWidth / 2) {
                target.style.left = -1 * this.buttonsWidth + 'px';
            } else {
                target.style.left = 0;
            }
            setTimeout(() => {
                target.style.transitionDuration = 'initial';
            }, 250);
        },
        click(e) {
            window.removeEventListener('mousemove', this.mouseMoveHandler);
            window.removeEventListener('mouseup', this.mouseUpHandler);
            const isBtn = e.target.classList && e.target.classList.contains('swiper-buttons-item');
            if (isBtn) {
                const btns = e.target.closest('.swiper-buttons').querySelectorAll('.swiper-buttons-item');
                let index = 0;
                btns.forEach((v, i, l) => {
                    if (v === e.target) index = i;
                });
                this.btnClick[index]();
            } else {
                this.$emit('onclick');
            }
        },
    },
};
</script>

<style scoped lang="stylus">
    .swiper
        overflow hidden
        position relative

        &-wrap
            position relative

        &-content
            pointer-events none

        &-buttons
            position absolute
            left 100%
            top 0
            height 100%
            white-space nowrap

            &-item
                height 100%
                border none
                color #fff
                font-weight 500
                font-size 18px
                width 120px
                outline none
</style>
