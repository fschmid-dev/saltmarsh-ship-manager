<script setup>
import {useShipStore} from "@/stores/ship.js";
import {computed, inject, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {onBeforeRouteUpdate} from "vue-router";
import router from "@/router/index.js";
import EasyMDE from "easymde";
import 'easymde/dist/easymde.min.css';
import snarkdown from "snarkdown";

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
  })
}

onBeforeRouteUpdate(async (to, from) => {
  cancelEdit();
});
</script>

<template>
  <div v-if="ship">
    <div class="headline mb-3">
      <h2>{{ ship.name }}</h2>
      <div>
        <div v-if="edit">
          <button class="btn btn--red" title="löschen" @click.prevent="deleteShip">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="icon icon-tabler icons-tabler-outline icon-tabler-trash">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M4 7l16 0"/>
              <path d="M10 11l0 6"/>
              <path d="M14 11l0 6"/>
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
            </svg>
          </button>
          <button class="btn btn--green" title="speichern" @click.prevent="saveShip">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="icon icon-tabler icons-tabler-outline icon-tabler-device-floppy">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2"/>
              <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
              <path d="M14 4l0 4l-6 0l0 -4"/>
            </svg>
          </button>
          <button class="btn" title="abbrechen" @click.prevent="cancelEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="icon icon-tabler icons-tabler-outline icon-tabler-cancel">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
              <path d="M18.364 5.636l-12.728 12.728"/>
            </svg>
          </button>
        </div>
        <div v-else>
          <button class="btn" @click.prevent="startEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="icon icon-tabler icons-tabler-outline icon-tabler-edit">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"/>
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z"/>
              <path d="M16 5l3 3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <template v-if="!edit">
      <div v-for="(module, index) in ship.modules" :key="module" class="mb-3">
        <h3 class="headline">
          {{ module.name }}
        </h3>
        <div class="d-flex flex-column">
          <div>
            <b>Armor Class:</b> {{ module.armorClass }}
          </div>
          <div>
            <b>Hit Points:</b> {{ module.hitPoints }}
            <span v-if="module.damageThreshold">
              <small>(damage threshold {{ module.damageThreshold }})</small>
            </span>
            /
            <input type="number" inputmode="numeric" v-model="module.currentHitPoints">
            <div>
              <button
                  v-for="delta in [-10, -5, -1, 1, 5, 10]" :key="'module_' + index + '_chp_' + delta"
                  @click="module.currentHitPoints += delta">
                <template v-if="delta > 0">+</template>
                {{ delta }}
              </button>
            </div>
          </div>
          <div v-for="stat in module.otherStats">
            <b>{{ stat.name }}</b>
            <span>{{ stat.text }}</span>
          </div>
          <div v-if="module.description" v-html="snarkdown(module.description)" class="mt-2"></div>
        </div>
      </div>
    </template>

    <template v-if="edit">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-move-up"
                     style="height: 1rem;"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 13v-10"/>
                  <path d="M9 6l3 -3l3 3"/>
                  <path d="M12 17a2 2 0 1 1 0 4a2 2 0 0 1 0 -4z"/>
                </svg>
              </button>
              <button class="btn" title="Nach unten" v-if="index < (editShip.modules.length - 1)"
                      @click.prevent="moveModuleDown(index)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-move-down"
                     style="height: 1rem;"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M12 11v10"/>
                  <path d="M9 18l3 3l3 -3"/>
                  <path d="M12 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
                </svg>
              </button>
              <button class="btn btn--red" title="entfernen" @click.prevent="removeModule(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                     style="height: 1rem;"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M4 7l16 0"/>
                  <path d="M10 11l0 6"/>
                  <path d="M14 11l0 6"/>
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
                </svg>
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
            <div v-for="(stat, statIndex) in module.otherStats">
              <input type="text" v-model="stat.name">
              <input type="text" v-model="stat.text">
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
