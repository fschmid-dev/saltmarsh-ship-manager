<script setup>
import {useShipStore} from "@/stores/ship.js";
import {computed, inject, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {onBeforeRouteUpdate} from "vue-router";
import router from "@/router/index.js";
import EasyMDE from "easymde";
import 'easymde/dist/easymde.min.css';
import ShipDisplay from "@/components/ShipDisplay.vue";

const shipStore = useShipStore();
const {getShipById} = storeToRefs(shipStore);

const shipId = inject('shipId');
const ship = computed(() => {
  return getShipById.value(shipId.value);
});

const edit = ref(false);
const editShip = ref(null);
watch(shipId, () => {
  edit.value = false;
});

function downloadShip() {
  console.log(ship.value);
  // Code to download ship.value

  const blob = new Blob([JSON.stringify(ship.value, null, 2)], {type: 'application/json '});
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${ship.value.name}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function startEdit() {
  editShip.value = JSON.parse(JSON.stringify(ship.value));
  edit.value = true;

  requestAnimationFrame(() => {
    initMde();
  });
}

function initMde() {
  const mdeTextAreas = document.querySelectorAll('.textarea-mde');
  for (let i = 0; i < mdeTextAreas.length; i++) {
    const textArea = mdeTextAreas[i];
    const easyMDE = new EasyMDE({
      element: textArea,
      minHeight: 'fit-content',
    });
    textArea.mde = easyMDE;
    easyMDE.codemirror.on('change', (e) => {
      editShip.value.modules[i].description = easyMDE.value();
    })
  }
}

function removeMde() {
  const mdeTextAreas = document.querySelectorAll('.textarea-mde');
  for (let i = 0; i < mdeTextAreas.length; i++) {
    const textArea = mdeTextAreas[i];
    if (textArea.mde) {
      textArea.mde.toTextArea();
    }
  }
}

function reInitMde(callbackBetween = null) {
  removeMde();

  if (callbackBetween !== null && typeof callbackBetween === 'function') {
    requestAnimationFrame(() => {
      callbackBetween();
    })
  }

  requestAnimationFrame(() => {
    initMde();
  });
}

function cancelEdit() {
  edit.value = false;
  editShip.value = null;
}

function deleteShip() {
  const deleteShip = confirm('Schiff löschen?');
  if (!deleteShip) {
    return;
  }

  shipStore.deleteShip(shipId.value);
  router.push('/');
}

async function saveShip() {
  const shipToSave = JSON.parse(JSON.stringify(editShip.value));

  await shipStore.addShip(shipToSave);

  edit.value = false;
  editShip.value = null;
}

function moveModuleUp(index) {
  if (index === 0) {
    return;
  }

  moveModule(index, -1);
}

function moveModuleDown(index) {
  if (index === (editShip.value.modules.length - 1)) {
    return;
  }

  moveModule(index, 1);
}

function moveModule(index, dir) {
  reInitMde(() => {
    const modules = JSON.parse(JSON.stringify(editShip.value.modules));
    const otherIndex = index + dir;
    modules.splice(
        otherIndex,
        0,
        modules.splice(index, 1)[0]
    );
    editShip.value.modules = modules;
  });
}

function addNewModule() {
  editShip.value.modules.push({
    name: 'Neues Modul',
    armorClass: 10,
    hitPoints: 100,
    currentHitPoints: 100,
    otherStats: [],
    description: 'Neues Modul'
  });

  reInitMde();
}

function removeModule(index) {
  const deleteModule = confirm('Module löschen?');
  if (!deleteModule) {
    return;
  }


  editShip.value.modules.splice(index, 1);
}

function addNewStat(module) {
  console.log(module);

  module.otherStats.push({
    name: 'Speed (water)',
    text: '20 ft.'
  });
}

function moveStatUp(module, index) {
  moveStat(module, index, -1)
}

function moveStatDown(module, index) {
  moveStat(module, index, 1)
}

function moveStat(module, index, dir) {
  const otherIndex = index + dir;
  module.otherStats.splice(
      otherIndex,
      0,
      module.otherStats.splice(index, 1)[0]
  );
}

function removeStat(module, index) {
  const deleteStat = confirm('Stat löschen?');
  if (!deleteStat) {
    return;
  }

  module.otherStats.splice(index, 1);
}

onBeforeRouteUpdate(async (to, from) => {
  cancelEdit();
});
</script>

<template>
  <div v-if="ship">
    <ShipDisplay :ship="ship" v-if="!edit">
      <template v-slot:pre-name>
        <button class="btn" title="herunterladen" @click="downloadShip">
          <i class="fas fa-download fa-fw"></i>
        </button>
      </template>

      <template v-slot:right-buttons>
        <button class="btn" @click.prevent="startEdit">
          <i class="fas fa-edit fa-fw fa-lg"></i>
        </button>
      </template>
    </ShipDisplay>

    <template v-if="edit">
      <div class="headline mb-3">
        <div class="d-flex gap-3 align-items-center">
          <span>Bearbeiten:</span>
          <h2>{{ ship.name }}</h2>
        </div>

        <div>
          <button class="btn btn--red" title="löschen" @click.prevent="deleteShip">
            <i class="fas fa-trash fa-fw fa-lg"></i>
          </button>
          <button class="btn btn--green" title="speichern" @click.prevent="saveShip">
            <i class="fas fa-save fa-fw fa-lg"></i>
          </button>
          <button class="btn" title="abbrechen" @click.prevent="cancelEdit">
            <i class="fas fa-cancel fa-fw fa-lg"></i>
          </button>
        </div>
      </div>
      <div class="d-flex flex-column gap-3">
        <div>
          <b>Name:</b> <input type="text" v-model="editShip.name">
        </div>

        <div v-for="(module, index) in editShip.modules" :key="'module_' + index" :data-index="index">
          <div class="headline">
            <h4>Modul: {{ module.name }}</h4>

            <div>
              <button class="btn" title="Nach oben" v-if="index > 0"
                      @click.prevent="moveModuleUp(index)"
              >
                <i class="fas fa-angles-up fa-fw"></i>
              </button>
              <button class="btn" title="Nach unten" v-if="index < (editShip.modules.length - 1)"
                      @click.prevent="moveModuleDown(index)"
              >
                <i class="fas fa-angles-down fa-fw"></i>
              </button>
              <button class="btn btn--red" title="entfernen" @click.prevent="removeModule(index)">
                <i class="fas fa-trash fa-fw"></i>
              </button>
            </div>
          </div>
          <div>
            <b>Name:</b>
            <input type="text" v-model="module.name">
          </div>
          <div>
            <b>Armor Class:</b>
            <input type="number" inputmode="numeric" pattern="[0-9]*" v-model="module.armorClass">
          </div>
          <div>
            <b>Hit Points</b>
            <input type="number" inputmode="numeric" pattern="[0-9]*" v-model="module.hitPoints">
          </div>
          <div>
            <b>Current Hit Points</b>
            <input type="number" inputmode="numeric" pattern="[0-9]*" v-model="module.currentHitPoints">
          </div>
          <div>
            <b>Weitere Stats:</b>
            <div v-for="(stat, statIndex) in module.otherStats" class="d-flex align-items-center mb-3">
              <div class="d-flex flex-column">
                <input type="text" v-model="stat.name">
                <textarea type="text" v-model="stat.text"/>
              </div>
              <div>
                <button class="btn btn--red" @click="removeStat(module, statIndex)"
                >
                  <i class="fas fa-fw fa-trash"></i>
                </button>
                <button class="btn" @click="moveStatUp(module, statIndex)">
                  <i class="fas fa-fw fa-angles-up"></i>
                </button>
                <button class="btn" @click="moveStatDown(module, statIndex)">
                  <i class="fas fa-fw fa-angles-down"></i>
                </button>
              </div>
            </div>
            <button class="btn" @click.prevent="addNewStat(module)">
              Neuen Stat hinzufügen
            </button>
          </div>
          <div>
            <textarea class="textarea-mde" v-model="module.description"></textarea>
          </div>
        </div>

        <div>
          <button class="btn" @click.prevent="addNewModule">
            Neues Modul hinzufügen
          </button>
        </div>
      </div>
    </template>
  </div>
  <div v-else>
    <b style="color: red;">
      Schiff mit der ID {{ shipId }} nicht gefunden
    </b>
  </div>
</template>
