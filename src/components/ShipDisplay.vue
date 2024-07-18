<script setup>
import snarkdown from "snarkdown";

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

    <slot name="right-buttons">

    </slot>
  </div>


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
              @click="module.currentHitPoints += delta"
              class="btn"
              :class="{'btn--red': delta < 0, 'btn--green': delta > 0}"
          >
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
