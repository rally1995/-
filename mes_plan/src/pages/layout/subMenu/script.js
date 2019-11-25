import menuItem from './menuItem';

export default {
    name: 'subMenu',
    components: { menuItem },
    props: {
        menu: {
            type: Array,
            default: () => [],
        },
        activePath: String,
    },
};
