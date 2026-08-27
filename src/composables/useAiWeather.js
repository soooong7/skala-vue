import { ref } from 'vue'
import { askWeatherAssistant } from '@/services/openaiWeatherApi'

export function useAiWeather() {
  const question = ref('')
  const answer = ref('')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const lastAnsweredQuestion = ref('')
  const requestToken = ref(0)

  function resetResponse() {
    // 도시가 바뀔 때 이전 AI 답변을 지우기 위한 초기화 처리
    requestToken.value += 1
    isLoading.value = false
    answer.value = ''
    errorMessage.value = ''
    lastAnsweredQuestion.value = ''
  }

  async function askQuestion({ weather, question: userQuestion }) {
    const normalizedQuestion = String(userQuestion ?? question.value).trim()

    if (!normalizedQuestion) {
      errorMessage.value = '질문을 입력해 주세요.'
      return
    }

    if (!weather) {
      errorMessage.value = '현재 날씨 데이터를 먼저 불러와야 합니다.'
      return
    }

    const currentToken = requestToken.value + 1
    requestToken.value = currentToken

    isLoading.value = true
    errorMessage.value = ''
    answer.value = ''

    try {
      const result = await askWeatherAssistant({
        weather,
        question: normalizedQuestion,
      })

      if (requestToken.value !== currentToken) return

      answer.value = result
      lastAnsweredQuestion.value = normalizedQuestion
    } catch (error) {
      if (requestToken.value !== currentToken) return

      console.error(error)
      errorMessage.value = error instanceof Error ? error.message : 'AI 응답을 불러오지 못했습니다.'
    } finally {
      if (requestToken.value === currentToken) {
        isLoading.value = false
      }
    }
  }

  return {
    question,
    answer,
    isLoading,
    errorMessage,
    lastAnsweredQuestion,
    askQuestion,
    resetResponse,
  }
}
