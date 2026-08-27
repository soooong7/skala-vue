<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favoriteStore'

const route = useRoute()
const router = useRouter()
const favoriteStore = useFavoriteStore()
const cityData = ref(null)

const mockDetails = {
  city_01: { name: '서울', temp: 28, status: '맑음', humidity: 55, wind: 2.5 },
  city_02: { name: '수원', temp: 24, status: '비', humidity: 85, wind: 4.1 },
  city_03: { name: '부산', temp: 26, status: '구름', humidity: 65, wind: 5.0 },
}

// 컴포넌트가 화면에 연결된 뒤 URL의 cityId를 읽음
onMounted(() => {
  cityData.value = mockDetails[String(route.params.cityId)] ?? null
})
</script>

<template>
  <section>
    <h2>상세 날씨</h2>
    <div v-if="cityData">
      <h3>{{ cityData.name }}</h3>
      <p>기온: {{ cityData.temp }}℃</p>
      <p>날씨: {{ cityData.status }}</p>
      <p>습도: {{ cityData.humidity }}%</p>
      <p>풍속: {{ cityData.wind }}m/s</p>
      <button @click="favoriteStore.toggleFavorite(String(route.params.cityId))">
        {{ favoriteStore.isFavorite(String(route.params.cityId)) ? '즐겨찾기 해제' : '즐겨찾기 추가' }}
      </button>
    </div>
    <button @click="router.push('/')">홈으로 돌아가기</button>
  </section>
</template>
