<script setup>
import {ref} from "vue";
import ShipDisplay from "@/components/ShipDisplay.vue";
import {useShipStore} from "@/stores/ship.js";

const shipStore = useShipStore();
const shipLeft = ref(null);
const shipRight = ref(null);
</script>

<template>
  <div class="battle-grid">
    <div class="battle-grid__left">
      <select v-model="shipLeft">
        <option
            v-for="ship in shipStore.getShips()" :key="'ship-left_' + ship.id"
            :value="ship"
        >
          {{ ship.name }}
        </option>
      </select>
      <ShipDisplay v-if="shipLeft" :ship="shipLeft"/>
    </div>
    <div class="battle-grid__right">
      <select v-model="shipRight">
        <option
            v-for="ship in shipStore.getShips()" :key="'ship-left_' + ship.id"
            :value="ship"
        >
          {{ ship.name }}
        </option>
      </select>
      <ShipDisplay v-if="shipRight" :ship="shipRight"/>
    </div>
  </div>
</template>

<style scoped>
.battle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>