<script setup>
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
  <article
    class="weather-card"
    @click="emit('select-card', `${props.cityItem.name}이 선택되었습니다.`)"
  >
    <h3>{{ props.cityItem.name }}</h3>
    <p>현재 기온: {{ props.cityItem.temp }}</p>
    <p>날씨 : {{ props.cityItem.status }}</p>

    <span v-if="props.cityItem.temp >= 25" class="weather-hot">🔥 더움 (25도 이상)</span>
    <span v-else class="weather-cool">❄️선선함 (25도 미만)</span>

    <button @click.stop="emit('click-detail', props.cityItem.id)">상세보기</button>
  </article>
</template>

<style scoped>
.weather-card {
  position: relative;
  padding: 16px 16px 48px;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
}

.weather-card button {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
