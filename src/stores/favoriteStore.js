import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useFavoriteStore = defineStore('favorite', () => {
  // 즐겨찾기한 도시 ID 목록을 전역 상태로 관리
  const favoriteCityIds = ref([])

  // 즐겨찾기 수를 화면에서 바로 보여주기 위한 값
  const favoriteCount = computed(() => favoriteCityIds.value.length)

  function isFavorite(cityId) {
    return favoriteCityIds.value.includes(cityId)
  }

  function toggleFavorite(cityId) {
    const index = favoriteCityIds.value.indexOf(cityId)

    if (index >= 0) {
      favoriteCityIds.value.splice(index, 1)
      return
    }

    favoriteCityIds.value.push(cityId)
  }

  return { favoriteCityIds, favoriteCount, isFavorite, toggleFavorite }
})
