<template>
  <div class="task-item" :class="{ done: task.done }">
    
    <!-- ÍCONE DE IMAGEM -->
    <div v-if="task.img_url" class="image-icon" @click="togglePreview">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8
             a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        />
        <circle cx="12" cy="13" r="4" />
      </svg>
    </div>

    <!-- TEXTO -->
    <label class="task-label">
      <input
        type="checkbox"
        :checked="task.done"
        @change="$emit('toggle', task.id)"
      />
      <span class="task-title">{{ task.title }}</span>
    </label>

    <!-- AÇÕES -->
    <div class="task-actions">
      <button class="task-edit" @click="$emit('edit', task)">Editar</button>
      <button class="task-remove" @click="$emit('remove', task.id)">Remover</button>
    </div>

    <!-- PREVIEW GRANDE -->
    <div v-if="showPreview" class="preview-overlay" @click="togglePreview">
      <img :src="task.img_url" class="preview-image" />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  task: {
    type: Object,
    required: true,
  },
})

defineEmits(['toggle', 'remove', 'edit'])

const showPreview = ref(false)

function togglePreview() {
  showPreview.value = !showPreview.value
}
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  gap: 10px;
  position: relative;
}

.task-item.done {
  opacity: 0.6;
}

.image-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a90d9;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s;
}

.image-icon:hover {
  background: #eef5ff;
}

.task-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.task-label input[type='checkbox'] {
  width: 20px;
  height: 20px;
  accent-color: #4a90d9;
}

.task-title {
  font-size: 1rem;
}

.task-item.done .task-title {
  text-decoration: line-through;
  color: #999;
}

.task-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.task-edit {
  background: none;
  border: none;
  color: #4a90d9;
  cursor: pointer;
  font-size: 0.85rem;
}

.task-remove {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.85rem;
}

.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.preview-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
}
</style>