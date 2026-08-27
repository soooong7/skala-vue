import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '@/views/WeatherHomeView.vue'

const validCityIds = new Set(['city_01', 'city_02', 'city_03'])

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'WeatherHome',
      component: WeatherHomeView,
    },
    {
      path: '/about',
      name: 'WeatherAbout',
      component: () => import('@/views/WeatherAboutView.vue'),
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      component: () => import('@/views/WeatherDetailView.vue'),
    },
    {
      path: '/not-found',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'NotFound' },
    },
  ],
})

router.beforeEach((to) => {
  if (to.name === 'WeatherDetail') {
    const cityId = String(to.params.cityId)
    if (!validCityIds.has(cityId)) {
      return { name: 'NotFound'}
    }
  }
})

export default router
