<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <section class="not-found-page">
    <div class="not-found-card">
      <h1>404</h1>
      <h2>페이지를 찾을 수 없습니다.</h2>
      <p class="not-found-text">잘못된 주소로 들어온 것 같아요. 홈 화면에서 다시 확인해 주세요.</p>
      <button class="back-button" @click="router.push({ name: 'WeatherHome' })">
        홈으로 돌아가기
      </button>
    </div>
  </section>
</template>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 180px);
  display: grid;
  place-items: center;
  padding: 24px;
}

.not-found-card {
  width: min(560px, 100%);
  padding: 28px 26px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(191, 219, 254, 0.45), transparent 35%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 249, 252, 0.96));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  text-align: center;
}

.not-found-card h1 {
  margin: 0;
  font-size: clamp(3rem, 8vw, 5rem);
  line-height: 1;
  color: #0f172a;
}

.not-found-card h2 {
  margin: 12px 0 0;
  font-size: clamp(1.3rem, 3vw, 1.8rem);
  color: #0f172a;
}

.not-found-text {
  margin: 12px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.back-button {
  margin-top: 22px;
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
}

@media (max-width: 640px) {
  .not-found-page {
    padding: 16px;
  }

  .not-found-card {
    padding: 24px 20px;
  }
}
</style>
