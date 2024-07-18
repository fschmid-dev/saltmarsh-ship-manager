import {createRouter, createWebHashHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ShipView from "@/views/ShipView.vue";
import ImportShipView from "@/views/ImportShipView.vue";
import BattleView from "@/views/BattleView.vue";

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/ship/:shipId',
            name: 'ship',
            component: ShipView
        },
        {
            path: '/import',
            name: 'import_ship',
            component: ImportShipView
        },
        {
            path: '/battle',
            name: 'battle',
            component: BattleView
        }
    ]
})

export default router
