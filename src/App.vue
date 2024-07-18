<script setup>
import {RouterView, useRoute} from 'vue-router';
import {useShipStore} from "@/stores/ship.js";
import router from "@/router/index.js";
import {onMounted, provide, ref, watch} from "vue";

const route = useRoute();

const shipStore = useShipStore();
const shipId = ref(null);
provide('shipId', shipId);

function createNewShip() {
  let shipName = prompt('Name des Schiffs', 'Neues Schiff');
  if (!shipName) {
    shipName = 'Neues Schiff!';
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
    <div class="d-flex align-items-center justify-space-between">
      <h1 style="cursor: pointer" @click="router.push('/')">
        Saltmarsh Ship Editor
      </h1>
      <RouterLink to="/battle" class="btn">
        <i class="fas fa-crosshairs fa-fw"></i>
        Battle!
      </RouterLink>
    </div>
  </header>

  <main id="main">
    <div id="sidebar">
      <div class="list">
        <div>
          <b>Schiffe:</b>
        </div>
        <a @click="createNewShip">
          Neues Schiff erstellen
        </a>
        <a @click="router.push('/import')">
          Schiff importieren
        </a>
        <hr>
        <RouterLink :to="'/ship/' + ship.id" v-for="ship in shipStore.getShips()" :key="'ship_' + ship.id"
                    active-class="active"
        >
          {{ ship.name }}
        </RouterLink>
      </div>
    </div>
    <div id="content">
      <RouterView/>
    </div>
  </main>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.router-link-active {
  font-weight: bold;
}
</style>
