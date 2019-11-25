import { mapState } from 'vuex';
export default {
    name: 'MainMenu',
    props: {
        menu: {
            type: Array,
            default: () => [],
        },
        activePath: String,
    },
    data() {
        return {
            position: '',
        };
    },
    computed: {
        ...mapState(['menuCollapse']),
    },
    methods: {
    },
};
