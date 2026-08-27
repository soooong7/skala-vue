<script setup>
import { inject } from 'vue'

// App.vue에서 provide한 값을 중간 컴포넌트 전달 없이 직접 받음
const appTitle = inject('appTitle', 'Weather Dashboard')
</script>

<template>
  <section class="about-page">
    <div class="about-hero">
      <p class="about-hero__eyebrow">About This App</p>
      <h2>서비스 소개</h2>
      <p class="about-hero__description">
        <strong>{{ appTitle }}</strong
        >는 Vue 3 학습을 위한 실습 프로젝트입니다.
      </p>
    </div>

    <div class="about-card">
      <p>Vue Router, Pinia, Axios, Element Plus를 하나의 SPA에서 연결합니다.</p>
      <p>현재 날씨 조회, 상세 예보, 도시 즐겨찾기 기능으로 구성했습니다.</p>
      <p>날씨 조회 및 예보는 OpenWeather API를 사용, AI 날씨 비서는 OpenAI API를 사용했습니다.</p>
    </div>
  </section>
</template>

<style scoped>
.about-page {
  display: grid;
  gap: 18px;
}

.about-hero,
.about-card {
  padding: 24px 26px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(238, 246, 255, 0.88));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.about-hero__eyebrow {
  margin: 0 0 6px;
  color: #3b82f6;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.about-hero h2 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  color: #0f172a;
}

.about-hero__description {
  margin: 10px 0 0;
  color: #475569;
  line-height: 1.7;
}

.about-card p {
  margin: 0 0 10px;
  color: #334155;
  line-height: 1.7;
}

.about-card p:last-child {
  margin-bottom: 0;
}
</style>
