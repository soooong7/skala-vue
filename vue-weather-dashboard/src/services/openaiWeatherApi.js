const API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

function assertApiKey() {
  if (!API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.')
  }
}

function buildPrompt(weather, question) {
  // 날씨 데이터와 사용자 질문을 분리해서 전달하는 요청 본문 구성
  return [
    '[현재 날씨 데이터]',
    JSON.stringify(weather, null, 2),
    '',
    '[사용자 질문]',
    question,
  ].join('\n')
}

function extractOutputText(responseData) {
  if (typeof responseData?.output_text === 'string' && responseData.output_text.trim()) {
    return responseData.output_text.trim()
  }

  for (const item of responseData?.output ?? []) {
    if (item?.type !== 'message') continue

    for (const content of item.content ?? []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        return content.text.trim()
      }
    }
  }

  return ''
}

export async function askWeatherAssistant({ weather, question }) {
  assertApiKey()

  const prompt = buildPrompt(weather, question)

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      store: false,
      instructions:
        '너는 날씨에만 집중하는 한국어 비서다. 제공된 날씨 데이터만 근거로 답하고, 모르는 내용은 모른다고 말한다. 답변은 실생활에 바로 쓸 수 있게 3~5문장 정도로 간결하게 작성한다.',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt,
            },
          ],
        },
      ],
      temperature: 0.4,
    }),
  })

  const responseData = await response.json()

  if (!response.ok) {
    throw new Error(responseData?.error?.message ?? 'AI 응답을 가져오지 못했습니다.')
  }

  const outputText = extractOutputText(responseData)

  if (!outputText) {
    throw new Error('AI 답변을 해석하지 못했습니다.')
  }

  return outputText
}
