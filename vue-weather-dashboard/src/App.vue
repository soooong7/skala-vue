<script setup>
import { provide } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from '@/components/weather/UnitToggler.vue'

provide('appTitle', 'Vue Weather Dashboard')
</script>

<template>
  <div class="app-contatiner">
      <header>
        <h1>Vue Weather Dashboard</h1>
        <UnitToggler />
        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>
      </header>

      <RouterView />
    </div>
</template>

