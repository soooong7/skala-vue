<script setup>
import { computed, ref, watch, watchEffect } from 'vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음'},
  { id: 'city_02', name: '부산', temp: 30, status: '흐림'},
  { id: 'city_03', name: '수원', temp: 24, status: '비'},
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해보세요.')

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

function showDetail(cityName, status) {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box">
      <h2>🔍 도시 검색</h2>
      <input type="text"
        :value="searchQuery"
        placeholder="검색할 도시 이름 입력"
        @input="searchQuery = $event.target.value" />
      <p>검색 중인 도시: <strong>{{ searchQuery }}</strong></p>
      <p v-if="filteredWeatherList.length === 0">검색 결과가 없습니다.</p>
    </section>

    <section class="list-bax">
      <h2>🏙️ 지역별 날씨 현황</h2>

      <article
        v-for="item in filteredWeatherList"
        :key="item.id"
        class="weather-card"
        @click="selectedCityInfo = `${item.name}이 선택되었습니다.`">

        <div class="weather-card-top">
          <h3 class="weather-card-title">{{ item.name }} ({{ item.status }})</h3>

          <button @click.stop="showDetail(item.name, item.status)">상세보기</button>
        </div>

        <p>현재 기온: {{ item.temp }}°C</p>

        <span v-if="item.temp >= 25" class="weather-hot">🔥 더움 (25도 이상)</span>
        <span v-else class="weather-cool">❄️신선함 (25도 미만)</span>
      </article>
    </section>

    <p class="status-bar">{{ selectedCityInfo }}</p>
  </div>
</template>
