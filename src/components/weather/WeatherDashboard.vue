<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import { useTemperature } from '@/composables/useTemperature'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { fetchWeatherList, getWeatherIconUrl } from '@/services/weatherApi'

const weatherList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const searchQuery = ref('')
const showFavoritesOnly = ref(false)
const selectedCityInfo = ref('카드를 클릭하거나 검색해보세요.')
const favoriteStore = useFavoriteStore()

const router = useRouter()
const route = useRoute()
let searchSyncTimer = null

if (typeof route.query.search === 'string') {
  searchQuery.value = route.query.search
}

const filteredWeatherList = computed(() => {
  const list = showFavoritesOnly.value
    ? weatherList.value.filter((item) => favoriteStore.isFavorite(item.id))
    : weatherList.value

  const query = searchQuery.value.trim()

  // 검색어가 없으면 현재 목록을 그대로 반환
  if (!query) return list

  return list.filter((item) => item.name.includes(query))
})

const featuredWeather = computed(() => filteredWeatherList.value[0] ?? weatherList.value[0] ?? null)

// 현재 선택된 단위를 반영한 히어로 온도 표시값
const { displayTemp: featuredTemp, unitSymbol: featuredUnitSymbol } = useTemperature(
  () => featuredWeather.value?.temp ?? 0,
)

const featuredDateTime = computed(() => {
  const now = new Date()

  return now.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
})

watch(searchQuery, (value) => {
  // 한글 입력 중에는 라우트 갱신이 끼어들 수 있어서 짧게 지연시킨 뒤 동기화
  window.clearTimeout(searchSyncTimer)
  searchSyncTimer = window.setTimeout(() => {
    router.replace({
      query: { ...route.query, search: value || undefined },
    })
  }, 120)
})

// 내부에서 참조한 searchQuery를 자동으로 추적
watchEffect(() => {
  console.log('[watchEffect] 검색어:', searchQuery.value)
})

// 선택 상태가 바뀔 때마다 콘솔에 기록
watch(selectedCityInfo, (newInfo) => {
  console.log('[watch] 선택 상태:', newInfo)
})

function goDetail(cityId) {
  router.push({ name: 'WeatherDetail', params: { cityId } })
}

async function loadWeather() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    weatherList.value = await fetchWeatherList()
  } catch (error) {
    console.error(error)
    errorMessage.value = '날씨 정보를 불러오지 못했습니다. API Key와 네트워크 상태를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadWeather)
</script>

<template>
  <div class="dashboard-wrapper weather-home-page">
    <section class="weather-hero">
      <div class="weather-hero__content">
        <p v-if="featuredWeather" class="weather-hero__meta">
          {{ featuredWeather.name }} · {{ featuredDateTime }}
        </p>

        <div v-if="featuredWeather" class="weather-hero__main">
          <img
            class="weather-hero__icon"
            :src="getWeatherIconUrl(featuredWeather.icon)"
            :alt="featuredWeather.status"
          />

          <div class="weather-hero__summary">
            <p class="weather-hero__temp">{{ featuredTemp }}{{ featuredUnitSymbol }}</p>
            <p class="weather-hero__status">{{ featuredWeather.status }}</p>
            <p class="weather-hero__subtext">
              습도 {{ featuredWeather.humidity }}% · 풍속 {{ featuredWeather.wind }}m/s
            </p>
          </div>
        </div>

        <div class="weather-hero__search">
          <SearchBar
            :current-query="searchQuery"
            @update-query="(value) => (searchQuery = value)"
          />
        </div>
      </div>
    </section>

    <BaseDashboardCard class="weather-section-card">
      <template #title>
        <div class="weather-section__head">
          <h2>지역별 날씨 현황</h2>

          <div class="weather-section__actions">
            <button
              type="button"
              class="favorite-filter-button"
              :class="{ active: showFavoritesOnly }"
              @click="showFavoritesOnly = !showFavoritesOnly"
            >
              즐겨찾기만 보기
            </button>

            <p class="favorite-summary">즐겨찾기 {{ favoriteStore.favoriteCount }}개</p>
          </div>
        </div>
      </template>

      <p v-if="isLoading" class="section-state">날씨 정보를 불러오는 중입니다...</p>
      <p v-else-if="errorMessage" class="section-state section-state--error">{{ errorMessage }}</p>

      <template v-else>
        <div class="weather-card-grid">
          <WeatherCard
            v-for="city in filteredWeatherList"
            :key="city.id"
            :city-item="city"
            @select-card="(message) => (selectedCityInfo = message)"
            @click-detail="goDetail"
          />
        </div>

        <p
          v-if="filteredWeatherList.length === 0"
          class="empty-state"
        >
          검색 결과가 없습니다.
        </p>
      </template>
    </BaseDashboardCard>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

<style scoped>
.weather-home-page {
  display: grid;
  gap: 18px;
}

.weather-hero {
  position: relative;
  min-height: 250px;
  padding: 30px 32px 28px;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(238, 246, 255, 0.9));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.weather-hero__content {
  position: relative;
  max-width: 100%;
}

.weather-hero h2 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #0f172a;
}

.weather-hero__meta {
  margin: 14px 0 0;
  color: #64748b;
  font-size: 0.96rem;
  font-weight: 600;
}

.weather-hero__main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 22px;
}

.weather-hero__icon {
  width: 92px;
  height: 92px;
  flex: 0 0 auto;
}

.weather-hero__temp {
  margin: 0;
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 0.95;
  color: #0f172a;
}

.weather-hero__status {
  margin: 10px 0 0;
  color: #334155;
  font-size: 1.15rem;
  font-weight: 700;
}

.weather-hero__subtext {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.weather-hero__search {
  display: flex;
  justify-content: center;
  width: min(720px, 100%);
  margin-top: 22px;
  margin-inline: auto;
}

.weather-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.weather-section__head h2 {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.7rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.weather-section__actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.favorite-filter-button {
  padding: 10px 16px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.favorite-filter-button.active {
  border-color: #f43f5e;
  background: #fff1f2;
  color: #be123c;
}

.favorite-summary {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.weather-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.weather-section-card {
  margin-bottom: 0;
}

.section-state,
.empty-state {
  margin: 0;
  padding: 16px 0 0;
  color: #64748b;
}

.section-state--error {
  color: #b42318;
}

.status-bar {
  margin: 0;
  padding: 16px 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  color: #64748b;
  font-size: 0.96rem;
  font-weight: 600;
  line-height: 1.4;
}

@media (max-width: 820px) {
  .weather-hero {
    min-height: 230px;
    padding: 26px 22px 22px;
  }
}

@media (max-width: 640px) {
  .weather-hero {
    border-radius: 24px;
    min-height: 210px;
  }

  .weather-hero__main {
    align-items: flex-start;
  }

  .weather-hero__icon {
    width: 74px;
    height: 74px;
  }

  .weather-section__head {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
