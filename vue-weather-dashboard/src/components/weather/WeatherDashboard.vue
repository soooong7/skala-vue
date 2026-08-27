<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { fetchWeatherList } from '@/services/weatherApi'

const weatherList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const searchQuery = ref('')
const showFavoritesOnly = ref(false)
const selectedCityInfo = ref('카드를 클릭하거나 검색해보세요.')
const favoriteStore = useFavoriteStore()

const router = useRouter()
const route = useRoute()

const filteredWeatherList = computed(() => {
  const list = showFavoritesOnly.value
    ? weatherList.value.filter((item) => favoriteStore.isFavorite(item.id))
    : weatherList.value

  const query = searchQuery.value.trim()

  // 검색어가 없으면 현재 목록을 그대로 반환
  if (!query) return list

  return list.filter((item) => item.name.includes(query))
})

// 선택 상태가 바뀔 떄마다 콘솔에 기록
watch(selectedCityInfo, (newInfo) => {
  console.log('[watch] 선택 상태:', newInfo)
})

// 검색 상태를 URL query string에 보존
watch(searchQuery, (value) => {
  router.replace({
    query: { ...route.query, search: value || undefined },
  })
})


// 내부에서 참조한 searchQuery를 자동으로 추적
watchEffect(() => {
  console.log('[watchEffect] 검색어:', searchQuery.value)
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
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <template #title><h2>🔍 도시 검색</h2></template>
      <SearchBar
        :current-query="searchQuery"
        @update-query="(value) => (searchQuery = value)"
      />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template #title>
        <h2>🏙️ 지역별 날씨 현황</h2>
      </template>

      <button
        type="button"
        class="favorite-filter-button"
        :class="{ active: showFavoritesOnly }"
        @click="showFavoritesOnly = !showFavoritesOnly"
      >
        {{ showFavoritesOnly ? '전체 보기' : '즐겨찾기만 보기' }}
      </button>

      <p v-if="isLoading">날씨 정보를 불러오는 중입니다...</p>
      <p v-else-if="errorMessage">{{ errorMessage }}</p>

      <template v-else>
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city-item="city"
          @select-card="(message) => (selectedCityInfo = message)"
          @click-detail="goDetail"
        />

        <p v-if="filteredWeatherList.length === 0">검색 결과가 없습니다.</p>
      </template>
    </BaseDashboardCard>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>

<style scoped>
.favorite-filter-button {
  margin-bottom: 12px;
  padding: 8px 12px;
  border: 1px solid #cfd6e4;
  border-radius: 999px;
  background: #f7f9fc;
  color: #334155;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.favorite-filter-button.active {
  border-color: #f59e0b;
  background: #fff7ed;
  color: #b45309;
}
</style>
