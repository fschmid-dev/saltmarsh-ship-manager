<script setup>
import {RouterView, useRoute} from 'vue-router';
import {useShipStore} from "@/stores/ship.js";
import router from "@/router/index.js";
import {computed, onMounted, provide, ref, watch} from "vue";
import {storeToRefs} from "pinia";

const route = useRoute();

const shipStore = useShipStore();
const { getShips } = storeToRefs(shipStore);
const shipList = computed(() => {
  const shipList = Object.values(getShips.value());
  return shipList.sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
});
const shipId = ref(null);
provide('shipId', shipId);

function createNewShip() {
  let shipName = prompt('Name des Schiffs', 'Neues Schiff');
  if (!shipName) {
    return;
  }

  const ship = {
    id: Date.now(),
    name: shipName,
    modules: [
      {
        name: 'Hull',
        armorClass: 15,
        hitPoints: 100,
        currentHitPoints: 100,
        otherStats: [],
        damageThreshold: 10,
      },
      {
        name: 'Control: Helm',
        armorClass: 12,
        hitPoints: 50,
        currentHitPoints: 50,
        otherStats: [],
        description: 'Move up to ...',
      }
    ]
  }

  shipStore.addShip(ship);
  router.push('/ship/' + ship.id);
}

onMounted(() => {
  if (route.params.shipId) {
    shipId.value = route.params.shipId;
  }
});
watch(
    () => route.params.shipId,
    newShipId => {
      shipId.value = newShipId;
    }
)
</script>

<template>
  <header>
    <div class="d-flex align-items-center justify-content-between">
      <h1 style="cursor: pointer" @click="router.push('/')">
        Saltmarsh Ship Editor
      </h1>
      <RouterLink to="/battle" class="btn btn-primary">
        <i class="fas fa-crosshairs fa-fw"></i>
        Battle!
      </RouterLink>
    </div>
  </header>

  <main id="main">
    <div id="sidebar">
      <div class="d-flex flex-column text-start">
        <div>
          <b><i class="fas fa-ship fa-fw me-2"></i>Schiffe:</b>
        </div>
        <a @click="createNewShip" class="btn btn-link">
          Neues Schiff erstellen
        </a>
        <a @click="router.push('/import')" class="btn btn-link">
          Schiff importieren
        </a>
        <hr>
        <div class="d-flex flex-column gap-2">
          <RouterLink :to="'/ship/' + ship.id" v-for="ship in shipList" :key="'ship_' + ship.id"
                      active-class="bg-primary text-white" class="btn btn-link text-start"
          >
            {{ ship.name }}
          </RouterLink>
        </div>
      </div>
    </div>
    <div id="content">
      <RouterView/>
    </div>
  </main>
</template>

<style scoped>
.router-link-active {
  font-weight: bold;
}
</style>
