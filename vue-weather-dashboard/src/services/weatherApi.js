import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// 현재 날씨 API
const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5/weather',
  timeout: 7000,
})

// 5일 / 3시간 예보 API
const forecastClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5/forecast',
  timeout: 7000,
})

const CITY_LIST = [
  { id: 'city_01', name: '서울', lat: 37.5665, lon: 126.9780 },
  { id: 'city_02', name: '수원', lat: 37.2636, lon: 127.0286 },
  { id: 'city_03', name: '부산', lat: 35.1796, lon: 129.0756 },
]

function assertApiKey() {
  if (!API_KEY) {
    throw new Error('VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요.')
  }
}

// 단건 요청
async function requestWeather(city) {
  assertApiKey()

  const { data } = await weatherClient.get('', {
    params: {
      lat: city.lat,
      lon: city.lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })

  return data
}

// 응답 정규화
function normalizeWeather(city, data) {
  return {
    id: city.id,
    name: city.name,
    temp: data.main.temp,
    status: data.weather?.[0]?.description ?? '정보 없음',
    icon: data.weather?.[0]?.icon ?? '',
    humidity: data.main.humidity,
    wind: data.wind.speed,
  }
}

function formatForecastDateLabel(timestamp) {
  const date = new Date(timestamp * 1000)

  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

function formatForecastTime(timestamp) {
  const date = new Date(timestamp * 1000)

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function normalizeForecastDay(city, item) {
  return {
    cityId: city.id,
    cityName: city.name,
    dateKey: item.dt_txt.slice(0, 10),
    dateLabel: formatForecastDateLabel(item.dt),
    timeLabel: formatForecastTime(item.dt),
    temp: item.main.temp,
    feelsLike: item.main.feels_like,
    status: item.weather?.[0]?.description ?? '정보 없음',
    icon: item.weather?.[0]?.icon ?? '',
    humidity: item.main.humidity,
    wind: item.wind.speed,
    pop: Math.round((item.pop ?? 0) * 100),
  }
}

function normalizeForecastHour(city, item) {
  return {
    cityId: city.id,
    cityName: city.name,
    dateKey: item.dt_txt.slice(0, 10),
    dateLabel: formatForecastDateLabel(item.dt),
    timeLabel: formatForecastTime(item.dt),
    temp: item.main.temp,
    feelsLike: item.main.feels_like,
    status: item.weather?.[0]?.description ?? '정보 없음',
    icon: item.weather?.[0]?.icon ?? '',
    humidity: item.main.humidity,
    wind: item.wind.speed,
    pop: Math.round((item.pop ?? 0) * 100),
  }
}

// 5일 예보 응답은 3시간 단위로 내려오므로,
// 화면에서는 날짜별로 가장 보기 좋은 한 시점(가능하면 정오에 가까운 값)만 남김
function pickDailyForecastItems(list) {
  const byDate = new Map()

  for (const item of list) {
    const dateKey = item.dt_txt.slice(0, 10)
    const current = byDate.get(dateKey)

    if (!current) {
      byDate.set(dateKey, item)
      continue
    }

    const currentHour = Number(current.dt_txt.slice(11, 13))
    const nextHour = Number(item.dt_txt.slice(11, 13))
    const currentScore = Math.abs(currentHour - 12)
    const nextScore = Math.abs(nextHour - 12)

    if (nextScore < currentScore) {
      byDate.set(dateKey, item)
    }
  }

  return [...byDate.values()]
}

export async function fetchWeatherList() {
  // 서울, 수원, 부산 요청을 병렬로 실행
  return Promise.all(
    CITY_LIST.map(async (city) => {
      const data = await requestWeather(city)
      return normalizeWeather(city, data)
    }),
  )
}

export async function fetchWeatherDetail(cityId) {
  const city = CITY_LIST.find((item) => item.id === cityId)
  if (!city) return null

  const data = await requestWeather(city)
  return normalizeWeather(city, data)
}

export async function fetchWeatherForecast(cityId) {
  const city = CITY_LIST.find((item) => item.id === cityId)
  if (!city) return null

  assertApiKey()

  const { data } = await forecastClient.get('', {
    params: {
      lat: city.lat,
      lon: city.lon,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })

  return {
    id: city.id,
    name: city.name,
    dailyForecastList: pickDailyForecastItems(data.list).map((item) =>
      normalizeForecastDay(city, item),
    ),
    hourlyForecastList: data.list.map((item) => normalizeForecastHour(city, item)),
  }
}

export function getWeatherIconUrl(iconCode) {
  if (!iconCode) return ''

  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}
