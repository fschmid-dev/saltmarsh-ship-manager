<script setup>
import {computed, onMounted, ref, watch} from "vue";
import ShipDisplay from "@/components/ShipDisplay.vue";
import {useShipStore} from "@/stores/ship.js";
import {useRouter} from "vue-router";
import {storeToRefs} from "pinia";

const router = useRouter();

const shipStore = useShipStore();
const {getShipById} = storeToRefs(shipStore);

const shipLeftId = ref(null);
const shipLeft = computed(() => {
  return getShipById.value(shipLeftId.value);
})
const shipRightId = ref(null);
const shipRight = computed(() => {
  return getShipById.value(shipRightId.value);
})

watch(shipLeftId, () => {
  router.replace({ query: { ...router.currentRoute.value.query, shipLeft: shipLeftId.value }})
})

watch(shipRightId, () => {
  router.replace({ query: { ...router.currentRoute.value.query, shipRight: shipRightId.value }})
})

onMounted(() => {
  const query = router.currentRoute.value.query;

  requestAnimationFrame(() => {
    if (query.shipLeft) {
      shipLeftId.value = query.shipLeft;
    }

    if (query.shipRight) {
      shipRightId.value = query.shipRight;
    }
  })
})
</script>

<template>
  <div class="battle-grid">
    <div class="battle-grid__left">
      <select v-model="shipLeftId" class="form-select">
        <option
            v-for="ship in shipStore.getShips()" :key="'ship-left_' + ship.id"
            :value="ship.id"
        >
          {{ ship.name }}
        </option>
      </select>
      <ShipDisplay v-if="shipLeft" :ship="shipLeft">
        <template v-slot:right-buttons>
          <RouterLink :to="'/ship/' + shipLeft.id" class="btn">
            <i class="fas fa-fw fa-edit"></i>
          </RouterLink>
        </template>
      </ShipDisplay>
    </div>
    <div class="battle-grid__right">
      <select v-model="shipRightId" class="form-select">
        <option
            v-for="ship in shipStore.getShips()" :key="'ship-left_' + ship.id"
            :value="ship.id"
        >
          {{ ship.name }}
        </option>
      </select>
      <ShipDisplay v-if="shipRight" :ship="shipRight">
        <template v-slot:right-buttons>
          <RouterLink :to="'/ship/' + shipRight.id" class="btn">
            <i class="fas fa-fw fa-edit"></i>
          </RouterLink>
        </template>
      </ShipDisplay>
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