<script setup>
import { watch } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useAiWeather } from '@/composables/useAiWeather'

const props = defineProps({
  weatherData: {
    type: Object,
    required: true,
  },
})

const configStore = useConfigStore()
const {
  question,
  answer,
  isLoading,
  errorMessage,
  lastAnsweredQuestion,
  askQuestion,
  resetResponse,
} = useAiWeather()

const suggestedQuestions = [
  '오늘 뭐 입을까?',
  '우산 필요해?',
  '오늘 산책하기 좋아?',
  '오늘 외출하기 좋은 날씨야?',
]

function buildWeatherContext() {
  // 현재 도시의 날씨 요약을 AI에게 전달할 구조로 정리
  const tempCelsius = Number(props.weatherData?.temp ?? 0)
  const displayTemp =
    configStore.unit === 'fahrenheit'
      ? Math.round((tempCelsius * 9) / 5 + 32)
      : Math.round(tempCelsius)

  return {
    cityName: props.weatherData?.name ?? '',
    currentTemperature: displayTemp,
    temperatureUnit: configStore.unitSymbol,
    weatherStatus: props.weatherData?.status ?? '',
    humidity: props.weatherData?.humidity ?? '',
    windSpeed: props.weatherData?.wind ?? '',
    rawTemperatureCelsius: Math.round(tempCelsius),
  }
}

async function submitQuestion(text) {
  const nextQuestion = String(text ?? question.value).trim()
  question.value = nextQuestion
  await askQuestion({
    weather: buildWeatherContext(),
    question: nextQuestion,
  })
}

watch(
  () => props.weatherData?.id,
  () => {
    // 도시가 바뀌면 이전 질문과 답변을 지우는 초기화 처리
    question.value = ''
    resetResponse()
  },
  { immediate: true },
)
</script>

<template>
  <section class="ai-weather-card">
    <header class="ai-weather-card__header">
      <div>
        <p class="ai-weather-card__eyebrow">AI 날씨 비서</p>
        <h4>날씨를 바탕으로 지금 상황을 바로 해석해드려요</h4>
      </div>
      <p class="ai-weather-card__hint">
        현재 도시 기준으로 옷차림, 우산, 외출 여부를 물어보세요
      </p>
    </header>

    <div class="ai-weather-card__quick-questions">
      <button
        v-for="suggestion in suggestedQuestions"
        :key="suggestion"
        type="button"
        class="quick-question-button"
        :disabled="isLoading"
        @click="submitQuestion(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>

    <form class="ai-weather-card__form" @submit.prevent="submitQuestion(question)">
      <label class="ai-weather-card__label" for="ai-weather-question">직접 질문</label>
      <div class="ai-weather-card__input-row">
        <input
          id="ai-weather-question"
          v-model="question"
          type="text"
          placeholder="예: 오늘 한강 가도 돼?"
          :disabled="isLoading"
        />
        <button type="submit" class="send-button" :disabled="isLoading">
          질문하기
        </button>
      </div>
    </form>

    <p v-if="isLoading" class="ai-weather-card__state">
      AI가 날씨를 분석하고 있어요...
    </p>
    <p v-else-if="errorMessage" class="ai-weather-card__state ai-weather-card__state--error">
      {{ errorMessage }}
    </p>

    <article v-if="answer" class="ai-weather-card__answer">
      <p class="ai-weather-card__answer-label">
        {{ lastAnsweredQuestion ? `질문: ${lastAnsweredQuestion}` : 'AI 답변' }}
      </p>
      <p class="ai-weather-card__answer-text">{{ answer }}</p>
    </article>
  </section>
</template>

<style scoped>
.ai-weather-card {
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.ai-weather-card__header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.ai-weather-card__eyebrow {
  margin: 0 0 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #8b5cf6;
}

.ai-weather-card__header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.ai-weather-card__hint {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.ai-weather-card__quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.quick-question-button {
  padding: 10px 12px;
  border: 1px solid #d8cfff;
  border-radius: 999px;
  background: #f5f3ff;
  color: #6d28d9;
  cursor: pointer;
}

.quick-question-button:disabled,
.send-button:disabled,
.ai-weather-card__input-row input:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.ai-weather-card__form {
  display: grid;
  gap: 8px;
}

.ai-weather-card__label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
}

.ai-weather-card__input-row {
  display: flex;
  gap: 10px;
}

.ai-weather-card__input-row input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid #dbe4f0;
  border-radius: 14px;
  background: #ffffff;
  color: #0f172a;
}

.send-button {
  flex: 0 0 auto;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.ai-weather-card__state {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: #eff6ff;
  color: #1d4ed8;
}

.ai-weather-card__state--error {
  background: #fef2f2;
  color: #b42318;
}

.ai-weather-card__answer {
  margin-top: 14px;
  padding: 16px;
  border-radius: 18px;
  background: #0f172a;
  color: #e2e8f0;
}

.ai-weather-card__answer-label {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: #a5b4fc;
}

.ai-weather-card__answer-text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
}

@media (max-width: 640px) {
  .ai-weather-card__input-row {
    flex-direction: column;
  }

  .send-button {
    height: 44px;
  }
}
</style>
