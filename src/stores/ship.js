import {defineStore} from "pinia";
import {toRaw, warn} from "vue";

export const useShipStore = defineStore({
    id: 'ship',
    state: () => ({
        shipList: {},
    }),
    getters: {
        getShips(state) {
            return () => state.shipList;
        },
        getShipById(state) {
            return (id) =>
                state.shipList.hasOwnProperty(id) ?
                    state.shipList[id] :
                    null;
        }
    },
    actions: {
        setShips(ships) {
            this.shipList = ships;
        },
        addShip(ship) {
            this.shipList[ship.id] = ship;
        },
        deleteShip(shipOrId) {
            const shipId = typeof shipOrId === 'object' ? shipOrId.id : shipOrId;

            delete this.shipList[shipId];
        },
        getSaveData() {
            return {
                shipList: toRaw(this.shipList),
            }
        }
    }
})