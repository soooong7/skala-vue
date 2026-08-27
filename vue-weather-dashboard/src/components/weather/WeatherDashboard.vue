<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음'},
  { id: 'city_02', name: '부산', temp: 30, status: '흐림'},
  { id: 'city_03', name: '수원', temp: 24, status: '비'},
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해보세요.')

const router = useRouter()
const route = useRoute()

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  // 검색어가 없으면 전체 목록 그대로 반환
  if (!query) return weatherList.value

  return weatherList.value.filter((item) => item.name.includes(query))
})

// 선택 상태가 바뀔 떄마다 콘솔에 기록
watch(selectedCityInfo, (newInfo) => {
  console.log('[watch] 선택 상태:', newInfo)
})

// 내부에서 참조한 searchQuery를 자동으로 추적
watchEffect(() => {
  console.log('[watchEffect] 검색어:', searchQuery.value)
})

function goDetail(cityId) {
  router.push({ name: 'WeatherDetail', params: { cityId } })
}
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
      <template #title><h2>🏙️ 지역별 날씨 현황</h2></template>
      <WeatherCard
        v-for="city in filteredWeatherList"
        :key="city.id"
        :city-item="city"
        @select-card="(message) => (selectedCityInfo = message)"
        @click-detail="goDetail"
      />
      <p v-if="filteredWeatherList.length === 0">검색 결과가 없습니다.</p>
    </BaseDashboardCard>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>
