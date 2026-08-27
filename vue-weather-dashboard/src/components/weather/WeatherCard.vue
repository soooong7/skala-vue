<script setup>
import { useTemperature } from '@/composables/useTemperature'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { getWeatherIconUrl } from '@/services/weatherApi'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
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
    <div class="weather-card__top">
      <div class="weather-card__city-block">
        <h3 class="weather-card-title">{{ props.cityItem.name }}</h3>
      </div>

      <button
        class="favorite-button"
        :class="{ active: favoriteStore.isFavorite(props.cityItem.id) }"
        :aria-pressed="favoriteStore.isFavorite(props.cityItem.id)"
        @click.stop="favoriteStore.toggleFavorite(props.cityItem.id)"
        aria-label="즐겨찾기 토글"
      >
        <svg
          v-if="favoriteStore.isFavorite(props.cityItem.id)"
          class="favorite-button__icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.01 6.01 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z"
          />
        </svg>
        <svg
          v-else
          class="favorite-button__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.01 6.01 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z"
          />
        </svg>
      </button>
    </div>

    <div class="weather-card__body">
      <img
        class="weather-card__icon"
        :src="getWeatherIconUrl(props.cityItem.icon)"
        :alt="props.cityItem.status"
      />

      <div class="weather-card__info">
        <p class="weather-card__temp">{{ displayTemp }}{{ unitSymbol }}</p>
        <p class="weather-card__status">{{ props.cityItem.status }}</p>

        <div class="weather-card__chips">
          <span v-if="props.cityItem.temp >= 25" class="weather-hot">더움</span>
          <span v-else class="weather-cool">선선함</span>
        </div>
      </div>
    </div>

    <div class="weather-card__actions">
      <el-button
        type="primary"
        class="detail-button"
        @click.stop="emit('click-detail', props.cityItem.id)"
      >
        상세보기
      </el-button>
    </div>
  </article>
</template>

<style scoped>
.weather-card {
  position: relative;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 249, 252, 0.98));
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.07);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.weather-card:hover {
  transform: translateY(-2px);
  border-color: rgba(59, 130, 246, 0.22);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
}

.weather-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.weather-card__city-block {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.weather-card-title {
  margin: 0;
  font-size: clamp(1.45rem, 2vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.favorite-button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid #fecdd3;
  border-radius: 999px;
  background: #fff1f2;
  color: #be123c;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.favorite-button:hover {
  transform: translateY(-1px);
}

.favorite-button.active {
  border-color: #f43f5e;
  background: #f43f5e;
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(244, 63, 94, 0.22);
}

.favorite-button__icon {
  width: 18px;
  height: 18px;
}

.weather-card__body {
  display: flex;
  align-items: center;
  gap: 18px;
}

.weather-card__icon {
  width: 78px;
  height: 78px;
  flex: 0 0 auto;
}

.weather-card__info {
  min-width: 0;
}

.weather-card__temp {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 2.8rem);
  font-weight: 800;
  line-height: 1;
  color: #0f172a;
}

.weather-card__status {
  margin: 10px 0 0;
  color: #475569;
  font-size: 1rem;
  font-weight: 600;
}

.weather-card__chips {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.weather-hot,
.weather-cool {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.weather-hot {
  background: #fdeeda;
  color: #8a5a12;
}

.weather-cool {
  background: #e8f1ff;
  color: #1d4ed8;
}

.weather-card__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 640px) {
  .weather-card {
    padding: 18px;
    border-radius: 22px;
  }

  .weather-card__body {
    align-items: flex-start;
  }

  .weather-card__icon {
    width: 68px;
    height: 68px;
  }
}
</style>
