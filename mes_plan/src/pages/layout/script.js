import mainMenu from './mainMenu';
import subMenu from './subMenu';
import top from './top';
import { mapActions, mapState, mapMutations } from 'vuex';

export default {
    components: {
        mainMenu,
        subMenu,
        top,
    },
    data() {
        return {
            activePath: this.$route.matched && this.$route.matched[0].path,
            activeSub: this.$route.matched && this.$route.matched[1].path
        };
    },
    computed: {
        ...mapState(['menuCollapse', 'menus']),
        subMenu() {
            let { children = [], path } = this.menus.find(v => v.path === this.activePath);
            const formatPath = (arr, parentPath) => {
                return arr.map(v => {
                    let { path, children } = v;
                    path = path ? `${parentPath}/${path}` : parentPath;
                    if (children && children.length) children = formatPath(children, path);
                    return {
                        ...v,
                        path,
                        children,
                    };
                });
            };
            return formatPath(children, path);
        },
    },
    watch: {
        $route(route) {
            this.activePath = route.matched && route.matched[0].path;
            this.activeSub = route.matched && route.matched[route.matched.length - 1].path;
        }
    },
    created() {
        this.queryUserInfo();
    },
    methods: {
        ...mapMutations(['SET_STATE']),
        ...mapActions(['queryUserInfo']),
        collapse() {
            this.SET_STATE({
                menuCollapse: !this.menuCollapse,
            });
        },
        hoverHandler(item) {
            this.activePath = item.path;
        }
    },
};
