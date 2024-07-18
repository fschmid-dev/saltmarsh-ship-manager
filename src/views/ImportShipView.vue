<script setup>
import {ref} from "vue";
import ShipDisplay from "@/components/ShipDisplay.vue";
import router from "@/router/index.js";
import {useShipStore} from "@/stores/ship.js";

const shipStore = useShipStore();

const ship = ref(null);
const error = ref(null);

function importShip(event) {
  error.value = null;
  const file = event.target.files[0];

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      ship.value = JSON.parse(e.target.result);
      ship.value.id = new Date();
      console.log('parsed?');
    } catch (e) {
      error.value = e;
      ship.value = null;
    }
  }

  reader.readAsText(file);
}

async function saveShip() {
  const shipToSave = JSON.parse(JSON.stringify(ship.value));

  await shipStore.addShip(shipToSave);

  ship.value = null;
  await router.push('/ship/' + shipToSave.id);
}
</script>

<template>
  <div class="headline mb-3">
    <h2>Schiff importieren</h2>
  </div>

  <div class="mb-3">
    <input type="file" @change="importShip"/><br>
  </div>

  <div v-if="error" style="color: red">
    {{ error }}
  </div>

  <div v-if="ship">
    <ShipDisplay :ship="ship">
      <template v-slot:right-buttons>
        <button class="btn btn--green" @click="saveShip">
          <i class="fas fa-fw fa-save fa-xl"></i>
        </button>
      </template>
    </ShipDisplay>
  </div>
</template>