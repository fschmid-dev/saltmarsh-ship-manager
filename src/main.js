import './assets/main.css'

import {createApp, toRaw} from 'vue'

import App from './App.vue'
import router from './router'
import localforage from "localforage";
import {createPinia} from 'pinia'

const app = createApp(App)

async function indexDbPlugin({store}) {
    const stored = await localforage.getItem(store.$id + '-saveData');
    if (stored) {
        store.$patch(stored);
    }
    store.$subscribe(() => {
        if (typeof store.getSaveData !== 'function') {
            return;
        }
        const saveData = store.getSaveData();
        localforage
            .setItem(
                store.$id + '-saveData',
                saveData
            )
    })
}

const pinia = createPinia();
pinia.use(indexDbPlugin);
app.use(pinia);
app.use(router)

app.mount('#app')
