<script setup>
defineProps({
  ship: Object
})
</script>

<template>
  <div class="headline mb-3">
    <div class="d-flex gap-3 align-items-center">
      <slot name="pre-name"></slot>
      <h2>{{ ship.name }}</h2>
    </div>

    <slot name="right-buttons"></slot>
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
          <button class="btn btn-danger" title="entfernen" @click.prevent="removeModule(index)">
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
            <button class="btn btn-danger" @click="removeStat(module, statIndex)"
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
