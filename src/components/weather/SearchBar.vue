<script setup>
const props = defineProps({
  currentQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update-query'])
</script>

<template>
  <div class="search-bar">
    <el-input
      :model-value="props.currentQuery"
      class="search-input"
      size="large"
      placeholder="도시를 검색해보세요."
      clearable
      @update:model-value="emit('update-query', $event)"
    >
    </el-input>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
}

.search-bar :deep(.el-input) {
  width: 100%;
}

.search-input__icon {
  color: #64748b;
  font-size: 1rem;
}

:deep(.el-input__wrapper) {
  padding-left: 14px;
  border-radius: 16px;
  border: 1px solid #dbe4f0;
  box-shadow: none;
  background: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #bfd4f7;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);
}

:deep(.el-input__inner) {
  font-size: 0.98rem;
  color: #0f172a;
}
</style>
