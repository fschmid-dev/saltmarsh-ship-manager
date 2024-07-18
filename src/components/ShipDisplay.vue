<script setup>
import snarkdown from "snarkdown";

defineProps({
  ship: Object
});

function changeHitPoints(module, delta = null) {
  if (delta) {
    module.currentHitPoints += delta;
  }

  module.currentHitPoints = Math.min(module.currentHitPoints, module.hitPoints);
}
</script>

<template>
  <div class="headline mb-3">
    <div class="d-flex align-items-center">
      <slot name="pre-name"></slot>
      <h2>{{ ship.name }}</h2>
    </div>

    <slot name="right-buttons">

    </slot>
  </div>


  <div v-for="(module, index) in ship.modules" :key="module" class="mb-3"
       :class="{ 'bg-danger-subtle': module.currentHitPoints <= 0 }"
  >
    <div class="headline">
      <div class="d-flex flex-row align-items-center">
        <i class="fas fa-skull-crossbones fa-fw me-2"></i>
        <h3>{{ module.name }}</h3>
      </div>
      <span v-if="module.currentHitPoints <= 0">
        (beschädigt/zerstört)
      </span>
    </div>
    <div class="d-flex flex-column gap-1">
      <div>
        <b>Armor Class:</b> {{ module.armorClass }}
      </div>
      <div class="row g-3 align-items-center mt-0">
        <div class="col-auto mt-0">
          <b class="me-2">Hit Points:</b>{{ module.hitPoints }}
          <span v-if="module.damageThreshold">
              <small>(damage threshold {{ module.damageThreshold }})</small>
            </span>
        </div>
        <div class="col-auto d-flex flex-row gap-3 mt-0">
          <span>/</span>
          <input type="number" inputmode="numeric" v-model="module.currentHitPoints" @change="changeHitPoints(module)"
                 class="form-control form-control-sm form-control-plaintext"
          >
        </div>
        <div class="btn-group btn-group-sm mt-0">
          <button
              v-for="delta in [-10, -5, -1, 1, 5, 10]" :key="'module_' + index + '_chp_' + delta"
              @click="changeHitPoints(module, delta)"
              class="btn"
              :class="{'btn-danger': delta < 0, 'btn-success': delta > 0}"
              :disabled="(delta > 0 && module.currentHitPoints >= module.hitPoints) || (delta < 0 && module.currentHitPoints <= 0)"
          >
            <template v-if="delta > 0">+</template>
            {{ delta }}
          </button>
        </div>
      </div>
      <div v-for="stat in module.otherStats">
        <b class="me-2">{{ stat.name }}:</b>
        <span>{{ stat.text }}</span>
      </div>
      <div v-if="module.description" v-html="snarkdown(module.description)" class="mt-2"></div>
    </div>
  </div>
</template>
