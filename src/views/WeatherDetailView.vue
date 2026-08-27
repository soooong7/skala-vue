<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favoriteStore'
import {
  fetchWeatherDetail,
  fetchWeatherForecast,
  getWeatherIconUrl,
} from '@/services/weatherApi'
import AiWeatherAssistant from '@/components/weather/AiWeatherAssistant.vue'
import { useTemperature } from '@/composables/useTemperature'
import { useConfigStore } from '@/stores/configStore'

const route = useRoute()
const router = useRouter()
const favoriteStore = useFavoriteStore()
const configStore = useConfigStore()
const cityData = ref(null)
const dailyForecastData = ref([])
const hourlyForecastData = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const { displayTemp, unitSymbol } = useTemperature(() => cityData.value?.temp ?? 0)

function convertTemperature(value) {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((value * 9) / 5 + 32)
  }

  return Math.round(value)
}

function pickRepresentativeItem(items) {
  return items.reduce((best, current) => {
    const bestHour = Number(best.timeLabel.slice(0, 2))
    const currentHour = Number(current.timeLabel.slice(0, 2))
    const bestScore = Math.abs(bestHour - 12)
    const currentScore = Math.abs(currentHour - 12)

    return currentScore < bestScore ? current : best
  })
}

const formattedForecastList = computed(() => {
  // 3시간 예보를 날짜별로 묶어서 하루 단위 카드로 보여줌
  // 한 화면에서 흐름이 보이도록, 하루마다 대표 시점과 최고/최저를 함께 표시함
  if (hourlyForecastData.value.length > 0) {
    const groups = new Map()

    for (const item of hourlyForecastData.value) {
      const current = groups.get(item.dateKey) ?? []
      current.push(item)
      groups.set(item.dateKey, current)
    }

    return [...groups.values()].map((items) => {
      const representative = pickRepresentativeItem(items)
      const temps = items.map((item) => item.temp)
      const feelsLikes = items.map((item) => item.feelsLike)

      return {
        ...representative,
        displayTemp: convertTemperature(representative.temp),
        displayFeelsLike: convertTemperature(representative.feelsLike),
        displayMinTemp: convertTemperature(Math.min(...temps)),
        displayMaxTemp: convertTemperature(Math.max(...temps)),
        displayMinFeelsLike: convertTemperature(Math.min(...feelsLikes)),
        displayMaxFeelsLike: convertTemperature(Math.max(...feelsLikes)),
        iconUrl: getWeatherIconUrl(representative.icon),
      }
    })
  }

  // 예보 데이터가 아직 없거나 원본이 비었을 때의 안전장치
  return dailyForecastData.value.map((item) => ({
    ...item,
    displayTemp: convertTemperature(item.temp),
    displayFeelsLike: convertTemperature(item.feelsLike),
    displayMinTemp: convertTemperature(item.temp),
    displayMaxTemp: convertTemperature(item.temp),
    displayMinFeelsLike: convertTemperature(item.feelsLike),
    displayMaxFeelsLike: convertTemperature(item.feelsLike),
    iconUrl: getWeatherIconUrl(item.icon),
  }))
})

const formattedHourlyForecastList = computed(() => {
  return hourlyForecastData.value.map((item) => ({
    ...item,
    displayTemp: convertTemperature(item.temp),
    displayFeelsLike: convertTemperature(item.feelsLike),
    iconUrl: getWeatherIconUrl(item.icon),
  }))
})

const groupedHourlyForecastList = computed(() => {
  // 3시간 예보를 요일별로 묶어서 보여줌
  const groups = new Map()

  for (const item of formattedHourlyForecastList.value) {
    const current = groups.get(item.dateKey) ?? []
    current.push(item)
    groups.set(item.dateKey, current)
  }

  return [...groups.entries()].map(([dateKey, items]) => {
    const firstItem = items[0]
    const weekdayLabel = new Date(`${dateKey}T00:00:00`).toLocaleDateString('ko-KR', {
      weekday: 'long',
    })

    return {
      dateKey,
      weekdayLabel,
      dateLabel: firstItem.dateLabel,
      items,
    }
  })
})

async function loadWeatherDetail() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const cityId = String(route.params.cityId)
    const [detail, forecast] = await Promise.all([
      fetchWeatherDetail(cityId),
      fetchWeatherForecast(cityId),
    ])

    cityData.value = detail
    dailyForecastData.value = forecast?.dailyForecastList ?? []
    hourlyForecastData.value = forecast?.hourlyForecastList ?? []

    if (!cityData.value) errorMessage.value = '등록되지 않은 도시입니다.'
  } catch (error) {
    console.error(error)
    errorMessage.value = '상세 날씨 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadWeatherDetail)

watch(
  () => route.params.cityId,
  () => {
    loadWeatherDetail()
  },
)
</script>

<template>
  <section class="weather-detail-page">
    <header class="page-header">
      <h2>상세 날씨</h2>
      <p>현재 날씨와 5일 / 3시간 예보를 한 화면에서 확인하세요.</p>
    </header>

    <p v-if="isLoading" class="state-message">데이터를 불러오는 중입니다...</p>
    <p v-else-if="errorMessage" class="state-message state-message--error">{{ errorMessage }}</p>

    <div v-if="cityData" class="weather-detail-layout">
      <article class="weather-summary">
        <div class="weather-summary__top">
          <div>
            <p class="weather-summary__label">현재 날씨</p>
            <h3 class="weather-summary__city">{{ cityData.name }}</h3>
            <p class="weather-summary__status">{{ cityData.status }}</p>
          </div>

          <button
            class="favorite-button"
            @click="favoriteStore.toggleFavorite(String(route.params.cityId))"
          >
            {{ favoriteStore.isFavorite(String(route.params.cityId)) ? '즐겨찾기 해제' : '즐겨찾기 추가' }}
          </button>
        </div>

        <div class="weather-summary__main">
          <div class="weather-summary__temp-block">
            <p class="weather-summary__temp">{{ displayTemp }}{{ unitSymbol }}</p>
            <p class="weather-summary__hint">체감이 아니라 실제 기온 기준이에요.</p>
          </div>

          <img
            class="weather-summary__icon"
            :src="getWeatherIconUrl(cityData.icon)"
            :alt="cityData.status"
          />
        </div>

        <div class="weather-summary__meta">
          <span class="meta-chip">습도 {{ cityData.humidity }}%</span>
          <span class="meta-chip">풍속 {{ cityData.wind }}m/s</span>
          <span class="meta-chip">단위 {{ unitSymbol }}</span>
        </div>
      </article>

      <AiWeatherAssistant :weather-data="cityData" />

      <section class="forecast-section">
        <div class="forecast-section__head">
          <div>
            <h4>5일 예보</h4>
            <p>하루 단위로 빠르게 훑어볼 수 있어요.</p>
          </div>
        </div>

        <div v-if="formattedForecastList.length > 0" class="forecast-scroll">
          <article
            v-for="forecast in formattedForecastList"
            :key="`${forecast.cityId}-${forecast.dateKey}`"
            class="forecast-card forecast-card--daily"
          >
            <p class="forecast-date">{{ forecast.dateLabel }}</p>
            <img class="forecast-icon" :src="forecast.iconUrl" :alt="forecast.status" />
            <p class="forecast-status">{{ forecast.status }}</p>
            <p class="forecast-temp">
              {{ forecast.displayMinTemp }}{{ unitSymbol }} / {{ forecast.displayMaxTemp }}{{ unitSymbol }}
            </p>
            <p class="forecast-meta">체감 {{ forecast.displayFeelsLike }}{{ unitSymbol }}</p>
            <p class="forecast-meta">강수 {{ forecast.pop }}%</p>
          </article>
        </div>

        <p v-else class="empty-message">예보 데이터를 불러올 수 없습니다.</p>
      </section>

      <section class="forecast-section">
        <div class="forecast-section__head">
          <div>
            <h4>3시간 단위 예보</h4>
            <p>요일별로 나눠서 시간대별 날씨 흐름을 확인할 수 있어요.</p>
          </div>
        </div>

        <div v-if="groupedHourlyForecastList.length > 0" class="hourly-day-list">
          <article
            v-for="dayForecast in groupedHourlyForecastList"
            :key="dayForecast.dateKey"
            class="hourly-day-section"
          >
            <div class="hourly-day-section__head">
              <h5>{{ dayForecast.weekdayLabel }}</h5>
              <p>{{ dayForecast.dateLabel }}</p>
            </div>

            <div class="forecast-scroll forecast-scroll--hourly">
              <article
                v-for="forecast in dayForecast.items"
                :key="`${forecast.cityId}-${forecast.dateLabel}-${forecast.timeLabel}`"
                class="forecast-card forecast-card--hourly"
              >
                <p class="forecast-time">{{ forecast.timeLabel }}</p>
                <img
                  class="forecast-icon forecast-icon--small"
                  :src="forecast.iconUrl"
                  :alt="forecast.status"
                />
                <p class="forecast-temp">{{ forecast.displayTemp }}{{ unitSymbol }}</p>
                <p class="forecast-status">{{ forecast.status }}</p>
                <p class="forecast-meta">강수 {{ forecast.pop }}%</p>
              </article>
            </div>
          </article>
        </div>

        <p v-else class="empty-message">3시간 단위 예보 데이터를 불러올 수 없습니다.</p>
      </section>
    </div>

    <button class="back-button" @click="router.push('/')">홈으로 돌아가기</button>
  </section>
</template>

<style scoped>
.weather-detail-page {
  padding: 24px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(191, 219, 254, 0.55), transparent 30%),
    linear-gradient(180deg, #eef6ff 0%, #f8fbff 42%, #ffffff 100%);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin-bottom: 6px;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.page-header p {
  margin: 0;
  color: #53657d;
}

.state-message {
  margin: 16px 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #334155;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.state-message--error {
  border: 1px solid #fecaca;
  color: #b42318;
}

.weather-detail-layout {
  display: grid;
  gap: 18px;
}

.weather-summary {
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 249, 252, 0.98));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.weather-summary__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.weather-summary__label {
  margin: 0 0 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #3b82f6;
}

.weather-summary__city {
  margin: 0 0 6px;
  font-size: 1.6rem;
}

.weather-summary__status {
  margin: 0;
  color: #64748b;
}

.favorite-button {
  flex: 0 0 auto;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
}

.weather-summary__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
}

.weather-summary__temp-block {
  min-width: 0;
}

.weather-summary__temp {
  margin: 0;
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1;
  color: #0f172a;
}

.weather-summary__hint {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 0.88rem;
}

.weather-summary__icon {
  width: 90px;
  height: 90px;
  flex: 0 0 auto;
}

.weather-summary__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.meta-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef6ff;
  color: #1d4ed8;
  font-size: 0.88rem;
  font-weight: 600;
}

.forecast-section {
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.forecast-section__head {
  margin-bottom: 12px;
}

.forecast-section__head h4 {
  margin: 0 0 4px;
  font-size: 1.08rem;
}

.forecast-section__head p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.forecast-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 2px 12px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.forecast-scroll--hourly {
  padding-bottom: 8px;
}

.forecast-scroll::-webkit-scrollbar {
  height: 8px;
}

.forecast-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #cbd5e1;
}

.forecast-card {
  flex: 0 0 auto;
  scroll-snap-align: start;
  border: 1px solid #dbe4f0;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 249, 252, 0.98));
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.forecast-card--daily {
  width: 168px;
  padding: 16px 14px;
}

.forecast-card--hourly {
  width: 116px;
  padding: 12px 10px;
}

.forecast-date,
.forecast-time {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
}

.forecast-time {
  font-weight: 700;
  color: #0f172a;
}

.hourly-day-list {
  display: grid;
  gap: 14px;
}

.hourly-day-section {
  padding: 14px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.85);
}

.hourly-day-section__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.hourly-day-section__head h5 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.hourly-day-section__head p {
  margin: 0;
  color: #64748b;
  font-size: 0.84rem;
}

.forecast-icon {
  display: block;
  width: 72px;
  height: 72px;
  margin: 8px auto 4px;
}

.forecast-icon--small {
  width: 60px;
  height: 60px;
}

.forecast-status {
  margin: 6px 0 4px;
  min-height: 2.4em;
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
}

.forecast-temp {
  margin: 0;
  color: #0f172a;
  font-size: 1.12rem;
  font-weight: 800;
  text-align: center;
}

.forecast-meta {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.82rem;
  text-align: center;
}

.empty-message {
  margin: 0;
  padding: 10px 0 2px;
  color: #64748b;
}

.back-button {
  margin-top: 20px;
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
}

@media (max-width: 640px) {
  .weather-detail-page {
    padding: 16px;
  }

  .weather-summary__top,
  .weather-summary__main {
    flex-direction: column;
    align-items: flex-start;
  }

  .weather-summary__icon {
    width: 76px;
    height: 76px;
  }

  .forecast-card--daily {
    width: 156px;
  }

  .forecast-card--hourly {
    width: 128px;
  }
}
</style>
