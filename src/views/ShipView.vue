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

async function copyShip() {
  const shipToCopy = JSON.parse(JSON.stringify(ship.value));
  shipToCopy.id = Date.now();
  shipToCopy.name += ' (Kopie)';

  await shipStore.addShip(shipToCopy);
  router.push('/ship/' + shipToCopy.id);
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
        <button class="btn btn-link" title="herunterladen" @click="downloadShip">
          <i class="fas fa-download fa-fw"></i>
        </button>
      </template>

      <template v-slot:right-buttons>
        <div class="button-group">
          <button class="btn btn-link" @click="copyShip" title="kopieren">
            <i class="fas fa-copy fa-fw fa-lg"></i>
          </button>
          <button class="btn btn-link" @click.prevent="startEdit">
            <i class="fas fa-edit fa-fw fa-lg"></i>
          </button>
        </div>
      </template>
    </ShipDisplay>

    <template v-if="edit">
      <div class="headline mb-3">
        <div class="d-flex gap-3 align-items-center">
          <span>Bearbeiten:</span>
          <h2>{{ ship.name }}</h2>
        </div>

        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-danger" title="löschen" @click.prevent="deleteShip">
            <i class="fas fa-trash fa-fw fa-lg"></i>
          </button>
          <button class="btn btn-outline-success" title="speichern" @click.prevent="saveShip">
            <i class="fas fa-save fa-fw fa-lg"></i>
          </button>
          <button class="btn btn-outline-primary" title="abbrechen" @click.prevent="cancelEdit">
            <i class="fas fa-cancel fa-fw fa-lg"></i>
          </button>
        </div>
      </div>
      <div class="d-flex flex-column gap-3">
        <div class="row g-3 align-items-center">
          <div class="col-auto">
            <label for="ship_name">Name:</label>
          </div>
          <div class="col-auto">
            <input type="text" v-model="editShip.name" class="form-control">
          </div>
        </div>

        <div v-for="(module, index) in editShip.modules" :key="'module_' + index" :data-index="index"
             class="d-flex flex-column gap-2">
          <div class="headline">
            <h4>Modul: {{ module.name }}</h4>

            <div>
              <button class="btn btn-link" title="Nach oben" v-if="index > 0"
                      @click.prevent="moveModuleUp(index)"
              >
                <i class="fas fa-angles-up fa-fw"></i>
              </button>
              <button class="btn btn-link" title="Nach unten" v-if="index < (editShip.modules.length - 1)"
                      @click.prevent="moveModuleDown(index)"
              >
                <i class="fas fa-angles-down fa-fw"></i>
              </button>
              <button class="btn btn-outline-danger" title="entfernen" @click.prevent="removeModule(index)">
                <i class="fas fa-trash fa-fw"></i>
              </button>
            </div>
          </div>
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <label :for="'module_' + index + '_name'" class="font-bold"><b>Name:</b></label>
            </div>
            <div class="col-auto">
              <input type="text" v-model="module.name" class="form-control" :id="'module_' + index + '_name'">
            </div>
          </div>
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <label :for="'module_' + index + '_ac'"><b>Armor Class:</b></label>
            </div>
            <div class="col-auto">
              <input type="number" inputmode="numeric" pattern="[0-9]*" v-model="module.armorClass" class="form-control"
                     :id="'module_' + index + '_ac'">
            </div>
          </div>
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <label :for="'module_' + index + '_hp'"><b>Hit Points:</b></label>
            </div>
            <div class="col-auto">
              <input type="number" inputmode="numeric" pattern="[0-9]*" v-model="module.hitPoints" class="form-control"
                     :id="'module_' + index + '_hp'">
            </div>
          </div>
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <label :for="'module_' + index + ' _chp'"><b>Current Hit Points:</b></label>
            </div>
            <div class="col-auto">
              <input type="number" inputmode="numeric" pattern="[0-9]*" v-model="module.currentHitPoints"
                     class="form-control" :id="'module_' + index + '_chp'">
            </div>
          </div>
          <div>
            <div class="mb-3">
              <b>Weitere Stats:</b>
            </div>
            <div class="list-group list-group-flush">
              <div v-for="(stat, statIndex) in module.otherStats"
                   class="d-flex flex-row align-items-center gap-3 list-group-item px-0">
                <div class="d-flex flex-column flex-grow-1">
                  <input type="text" v-model="stat.name" class="form-control" placeholder="Speed (water)">
                  <textarea type="text" v-model="stat.text" class="form-control" placeholder="20 ft."/>
                </div>
                <div>
                  <button class="btn btn-link" @click="moveStatUp(module, statIndex)" title="Nach oben verschieben"
                          :disabled="statIndex === 0"
                  >
                    <i class="fas fa-fw fa-angles-up"></i>
                  </button>
                  <button class="btn btn-link" @click="moveStatDown(module, statIndex)" title="Nach unten verschieben"
                          :disabled="statIndex === (module.otherStats.length - 1)"
                  >
                    <i class="fas fa-fw fa-angles-down"></i>
                  </button>
                  <button class="btn btn-outline-danger" @click="removeStat(module, statIndex)"
                  >
                    <i class="fas fa-fw fa-trash"></i>
                  </button>
                </div>
              </div>
              <button class="list-group-item list-group-item-action list-group-item-primary"
                      @click.prevent="addNewStat(module)">
                Neuen Stat hinzufügen
              </button>
            </div>
          </div>
          <div class="mt-3">
            <b>Beschreibung:</b>
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

<style>
.editor-toolbar {
  background-color: var(--bs-black);
}

.CodeMirror {
  background-color: var(--bs-light);
}
</style>