# 🌤️ Vue Weather Dashboard

Vue 학습을 위한 날씨 대시보드 프로젝트입니다. <br>
초반엔 Vue 문법을 익히는 데 집중했고, 이후 router, pinia, composable, API 연동을 하나씩 붙이면서 전체 앱 구조를 이해하는 방식으로 진행했습니다.

## 프로젝트 구현 내용

- 서울, 수원, 부산의 현재 날씨 조회
- 도시 검색
- 즐겨찾기 도시 필터링
- 온도 단위 섭씨 / 화씨 전환
- 도시 상세 페이지
- 5일 예보 / 3시간 단위 예보
- AI 날씨 비서
- 404 페이지 처리

## 사용한 기술

| 구분               | 기술                        |
| ------------------ | --------------------------- |
| 프레임워크         | Vue 3, Vite 8               |
| 라우팅 / 상태 관리 | Vue Router 5, Pinia 4       |
| 통신               | Axios                       |
| UI                 | Element Plus                |
| 외부 API           | OpenWeather API, OpenAI API |

## 화면 구성

| 경로               | 화면      | 설명                                          |
| ------------------ | --------- | --------------------------------------------- |
| `/`                | 메인      | 현재 날씨 카드 목록, 도시 검색, 즐겨찾기 필터 |
| `/weather/:cityId` | 도시 상세 | 현재 날씨 + 5일/3시간 예보 + AI 비서          |
| `/about`           | 소개      | 사용 기술 소개                                |
| 그 외 경로         | 404       | 잘못된 주소 처리                              |

### `/`

![메인 화면 - 날씨 카드 목록](https://github.com/user-attachments/assets/00ee6734-c1d3-444a-a939-2a31c02ce84d)

메인 화면입니다.
현재 날씨 카드 목록을 보여주고, 검색어로 도시를 찾을 수 있습니다. 즐겨찾기만 따로 보는 기능도 넣었습니다.

### `/weather/:cityId`

![도시 상세 - 현재 날씨 및 AI 비서](https://github.com/user-attachments/assets/cf1e9c2a-b94c-4d2a-8165-0f4a0c44763a)
![도시 상세 - 날씨 예보](https://github.com/user-attachments/assets/17fe9832-69f0-4b3e-ae27-a8fafc2e7afa)

도시 상세 화면입니다.
현재 날씨, 날씨 예보(5일, 3시간 단위)를 한 번에 확인할 수 있고, AI 날씨 비서에게 질문도 할 수 있습니다.

### `/about`

![소개 화면 - 사용 기술 정리](https://github.com/user-attachments/assets/4069dd6b-79a7-42be-bc67-ad4868f0d075)

서비스 소개 화면입니다.
이 프로젝트에서 어떤 기술을 사용했는지 간단히 정리해 두었습니다.

### 그 외 경로

![404 페이지](https://github.com/user-attachments/assets/0f3aa074-fc65-45ed-b1b9-8e0cf176130d)

없는 주소로 들어가면 404 화면으로 이동합니다.

## 폴더 구조

```bash
src/
├── assets/
│   ├── base.css
│   └── main.css
├── components/
│   ├── icons/
│   └── weather/
│       ├── AiWeatherAssistant.vue
│       ├── BaseDashboardCard.vue
│       ├── SearchBar.vue
│       ├── UnitToggler.vue
│       ├── WeatherCard.vue
│       └── WeatherDashboard.vue
├── composables/
│   ├── useAiWeather.js
│   └── useTemperature.js
├── router/
│   └── index.js
├── services/
│   ├── openaiWeatherApi.js
│   └── weatherApi.js
├── stores/
│   ├── configStore.js
│   └── favoriteStore.js
├── views/
│   ├── NotFoundView.vue
│   ├── WeatherAboutView.vue
│   ├── WeatherDetailView.vue
│   └── WeatherHomeView.vue
├── App.vue
└── main.js
```

## 구현하면서 신경 쓴 부분

### 1. 현재 날씨와 예보를 분리해서 관리

`src/services/weatherApi.js`에서 현재 날씨 API와 예보 API를 따로 호출하도록 만들었습니다.  
메인 화면은 현재 날씨 중심으로, 상세 화면은 예보까지 같이 보이도록 나눴습니다.

예보는 OpenWeather 특성상 3시간 단위로 내려와서, 화면에서는 보기 편하게 날짜별로 묶는 방식으로 정리했습니다.

### 2. 온도 단위는 전역 상태로 관리

섭씨 / 화씨 전환은 `Pinia`로 관리했습니다.  
한 화면에서 바꾸면 다른 화면에도 바로 반영되도록 해서, 작은 프로젝트지만 전역 상태의 필요성을 체감할 수 있었습니다.

### 3. 검색과 즐겨찾기

메인 화면에서는 도시명을 검색할 수 있고, 즐겨찾기만 따로 볼 수도 있습니다.  
처음엔 단순 목록만 있었는데, 이 부분을 붙이면서 화면이 조금 더 실사용처럼 느껴졌습니다.

### 4. 상세 페이지에서 AI 비서 연결

상세 페이지에는 OpenAI API를 연결한 AI 날씨 비서를 넣었습니다.  
현재 도시의 날씨 데이터만 전달하고, 그 범위 안에서만 답하게 구성했습니다.  
날씨를 보고 직접 판단하는 것과 AI의 설명을 같이 볼 수 있어서, 재미있게 써볼 수 있는 부분이라고 생각합니다.

### 5. 라우터 가드로 잘못된 경로 처리

`/weather/:cityId`는 정해진 도시만 열리도록 `beforeEach`에서 한 번 더 확인합니다.  
교재에서 배운 라우터 개념을 실제로 써보는 느낌이 있어서 기억에 남았습니다.

## 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 키를 추가합니다.

```bash
VITE_OPENWEATHER_API_KEY=openweather_key
VITE_OPENAI_API_KEY=openai_key
VITE_OPENAI_MODEL=gpt-4o-mini
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 빌드

```bash
npm run build
```

### 5. 미리보기

```bash
npm run preview
```

### 6. 린트 / 포맷

```bash
npm run lint
npm run format
```

## 참고

이 프로젝트는 짱짱 KBJ 교수님의 실습 교재를 바탕으로 진행했습니다.
교안과 교재에서 배운 내용을 따라가면서 아래 순서로 정리해 나갔습니다.

- Vue 3 프로젝트 생성
- SFC와 기본 문법 익히기
- Composition API 사용해 보기
- 컴포넌트 분리
- Router 연결
- Pinia로 상태 관리
- Axios로 API 호출
- UI 라이브러리 적용
- 환경 변수와 빌드 확인

교재를 따라가며 큰 흐름과 핵심 로직은 직접 작성했고, 그 외에 전체적인 디자인 수정, 추가 API 호출 로직 구현, 컴포넌트 구조 조정 등의 과정에서는 AI의 도움도 함께 받았습니다.
