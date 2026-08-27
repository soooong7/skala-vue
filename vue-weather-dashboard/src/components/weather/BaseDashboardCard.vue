<template>
  <section class="dashboard-card">
    <header v-if="$slots.title" class="dashboard-card__title">
      <slot name="title" />
    </header>

    <slot />
  </section>
</template>

<style scoped>
.dashboard-card {
  margin-bottom: 18px;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.dashboard-card__title {
  margin-bottom: 14px;
  color: #0f172a;
}
</style>
