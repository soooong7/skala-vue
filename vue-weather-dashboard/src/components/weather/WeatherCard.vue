<script setup>
import { useTemperature } from '@/composables/useTemperature'
import { useFavoriteStore } from '@/stores/favoriteStore'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits(['select-card', 'click-detail'])
const favoriteStore = useFavoriteStore()

// 부모가 넘겨준 섭씨 값을 Composable에 전달
const { displayTemp, unitSymbol } = useTemperature(() => props.cityItem.temp)
</script>

<template>
  <article
    class="weather-card"
    @click="emit('select-card', `${props.cityItem.name}이 선택되었습니다.`)"
  >
    <button
      class="favorite-button"
      :aria-pressed="favoriteStore.isFavorite(props.cityItem.id)"
      @click.stop="favoriteStore.toggleFavorite(props.cityItem.id)"
    >
      {{ favoriteStore.isFavorite(props.cityItem.id) ? '★' : '☆' }}
    </button>

    <h3>{{ props.cityItem.name }}</h3>
    <p>현재 기온: {{ displayTemp }}{{ unitSymbol }}</p>
    <p>날씨 : {{ props.cityItem.status }}</p>

    <span v-if="props.cityItem.temp >= 25" class="weather-hot">🔥 더움 (25도 이상)</span>
    <span v-else class="weather-cool">❄️선선함 (25도 미만)</span>

    <button class="detail-button" @click.stop="emit('click-detail', props.cityItem.id)">
      상세보기
    </button>
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

.favorite-button {
  position: absolute;
  top: 16px;
  left: 16px;
  border: 0;
  background: transparent;
  font-size: 1.1rem;
  cursor: pointer;
}

.detail-button {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>
