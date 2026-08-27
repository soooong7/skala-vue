<script setup>
import { provide } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from '@/components/weather/UnitToggler.vue'

provide('appTitle', 'Vue Weather Dashboard')
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-brand">
        <p class="app-brand__eyebrow">Vue Practice</p>
        <h1>Weather Dashboard</h1>
      </div>

      <div class="app-header__controls">
        <UnitToggler />
        <nav class="app-nav" aria-label="메인 내비게이션">
          <RouterLink class="app-nav__link" to="/">Home</RouterLink>
          <RouterLink class="app-nav__link" to="/about">About</RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 40px;
}

.app-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  padding: 24px 28px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(238, 246, 255, 0.82));
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(8px);
}

.app-brand {
  min-width: 0;
}

.app-brand__eyebrow {
  margin: 0 0 6px;
  color: #3b82f6;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.app-brand h1 {
  margin: 0;
  font-size: clamp(1.55rem, 3vw, 2.25rem);
  color: #0f172a;
}

.app-brand__description {
  margin: 8px 0 0;
  color: #64748b;
  line-height: 1.5;
}

.app-header__controls {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.app-nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
}

.app-nav__link {
  padding: 10px 16px;
  border-radius: 999px;
  color: #475569;
  text-decoration: none;
  font-weight: 700;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.app-nav__link:hover {
  background: #eef6ff;
  color: #1d4ed8;
}

.app-nav__link.router-link-active {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.22);
}

.app-main {
  min-height: calc(100vh - 180px);
}

@media (max-width: 860px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }

  .app-header__controls {
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 640px) {
  .app-shell {
    width: min(100%, calc(100% - 20px));
    padding-top: 18px;
  }

  .app-header {
    padding: 20px;
    border-radius: 24px;
  }

  .app-nav {
    width: 100%;
    justify-content: center;
  }
}
</style>
