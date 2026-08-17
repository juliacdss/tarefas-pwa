<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="task-row">
      <input
        v-model="newTask"
        type="text"
        placeholder="Nova tarefa..."
        class="task-input"
      />

      <button type="submit" class="task-button" :disabled="uploading">
        {{ editingTask ? 'Alterar' : 'Adicionar' }}
      </button>

      <button
        v-if="editingTask"
        type="button"
        class="task-button-cancel"
        @click="handleCancel"
      >
        Cancelar
      </button>
    </div>

    <!-- IMAGEM -->
    <div class="image-section">
      <img
        v-if="previewUrl || editingTask?.img_url"
        :src="previewUrl || editingTask?.img_url"
        class="image-preview"
        alt="Imagem da tarefa"
      />

      <label class="image-label" :class="{ disabled: uploading }">
        <span v-if="uploading" class="upload-status">
          Enviando...
        </span>

        <span v-else>
          {{
            previewUrl || editingTask?.img_url
              ? 'Trocar imagem'
              : isMobileDevice
                ? 'Fotografar'
                : 'Adicionar imagem'
          }}
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png"
          :capture="cameraMode"
          class="image-input"
          :disabled="uploading"
          @change="handleImageChange"
        />
      </label>

      <button
        v-if="!previewUrl && !uploading"
        type="button"
        class="task-button-secondary"
        @click="toggleCamera"
      >
        {{ cameraMode === 'environment' ? 'Usar selfie' : 'Usar traseira' }}
      </button>

      <button
        type="button"
        class="task-button-secondary"
        @click="showCameraCapture = !showCameraCapture"
      >
        {{ showCameraCapture ? 'Fechar câmera' : 'Abrir preview ao vivo' }}
      </button>

      <CameraCapture
        v-if="showCameraCapture"
        @captured="handleCameraCapture"
      />

      <p class="image-help">
        Em celular, o botão pode abrir a câmera. Em notebook, abre o seletor de arquivos.
      </p>
    </div>

    <!-- LOCALIZAÇÃO -->
    <div class="location-section">
      <div class="location-actions">
        <button
          type="button"
          class="task-button-secondary"
          :disabled="loadingLocation"
          @click="handleGetLocation"
        >
          {{
            loadingLocation
              ? 'Obtendo localização...'
              : location
                ? 'Atualizar localização'
                : 'Usar localização atual'
          }}
        </button>

        <button
          v-if="location"
          type="button"
          class="task-button-cancel"
          @click="handleClearLocation"
        >
          Remover localização
        </button>
      </div>

      <p v-if="locationError" class="location-error">
        {{ locationError }}
      </p>

      <div v-if="location" class="location-info">
        <strong>Localização:</strong>

        <span>
          {{ location.label || 'Endereço não identificado' }}
        </span>

        <small>
          Coordenadas:
          {{ location.latitude.toFixed(6) }},
          {{ location.longitude.toFixed(6) }}
        </small>

        <small v-if="location.accuracy">
          Precisão aproximada: {{ Math.round(location.accuracy) }} metros
        </small>
      </div>

      <TaskLocationMap
        v-if="location"
        :location="location"
      />
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import tasksApi from '../api/tasksApi.js'
import geocodingApi from '../api/geocodingApi.js'
import { useGeolocation } from '../composables/useGeolocation.js'
import { buildLocationPayload } from '../utils/location.js'
import CameraCapture from './CameraCapture.vue'
import TaskLocationMap from './TaskLocationMap.vue'

const props = defineProps({
  editingTask: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['add', 'update', 'cancel'])

/* -------------------------
   TAREFA
------------------------- */

const newTask = ref('')

/* -------------------------
   IMAGEM / CÂMERA
------------------------- */

const cameraMode = ref('environment')
const showCameraCapture = ref(false)
const previewUrl = ref(null)
const imgAttachmentKey = ref(null)
const uploading = ref(false)

const isMobileDevice = ref(
  !window.matchMedia('(pointer: fine)').matches
)

/* -------------------------
   LOCALIZAÇÃO
------------------------- */

const {
  location,
  loadingLocation,
  locationError,
  requestCurrentLocation,
  readPermissionState,
  setLocationFromTask,
  clearLocation,
  setLocationLabel,
} = useGeolocation()

/*
 * Quando o formulário entra em modo de edição,
 * carregamos os dados da tarefa, inclusive a localização.
 */
watch(
  () => props.editingTask,
  (task) => {
    newTask.value = task ? task.title : ''

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }

    previewUrl.value = null
    imgAttachmentKey.value = null

    if (task) {
      setLocationFromTask(task)
    } else {
      clearLocation()
    }

    readPermissionState()
  },
  { immediate: true },
)

/* -------------------------
   IMAGEM
------------------------- */

async function handleImageChange(event) {
  const file = event.target.files[0]

  if (!file) return

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  try {
    const response = await tasksApi.uploadImage(file)

    imgAttachmentKey.value =
      response.data.attachment_key
  } catch (err) {
    console.error('Erro ao fazer upload da imagem', err)

    previewUrl.value = null
    imgAttachmentKey.value = null
  } finally {
    uploading.value = false
  }
}

function handleCameraCapture(file) {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
  uploading.value = true

  tasksApi
    .uploadImage(file)
    .then((response) => {
      imgAttachmentKey.value =
        response.data.attachment_key
    })
    .catch((err) => {
      console.error('Erro ao fazer upload da imagem', err)

      previewUrl.value = null
      imgAttachmentKey.value = null
    })
    .finally(() => {
      uploading.value = false
    })
}

function toggleCamera() {
  cameraMode.value =
    cameraMode.value === 'environment'
      ? 'user'
      : 'environment'
}

/* -------------------------
   LOCALIZAÇÃO
------------------------- */

async function handleGetLocation() {
  const captured = await requestCurrentLocation()

  if (!captured) return

  /*
   * Primeiro capturamos a localização.
   * Só depois consultamos o endereço.
   */
  try {
    const address = await geocodingApi.reverse(
      captured.latitude,
      captured.longitude,
    )

    setLocationLabel(address?.label)
  } catch (err) {
    console.error('Erro ao buscar endereço', err)

    /*
     * A localização continua válida mesmo
     * se o geocoder falhar.
     */
    locationError.value =
      'Localização obtida, mas não foi possível identificar a rua.'
  }
}

function handleClearLocation() {
  clearLocation()
}

/* -------------------------
   SALVAR / EDITAR
------------------------- */

function handleSubmit() {
  if (!newTask.value.trim()) return

  /*
   * buildLocationPayload transforma o estado
   * da localização no formato esperado pela API.
   *
   * Se location for null, todos os campos ficam null.
   */
  const locationPayload = buildLocationPayload(
    location.value,
  )

  const payload = {
    title: newTask.value.trim(),

    imgAttachmentKey:
      imgAttachmentKey.value,

    ...locationPayload,
  }

  if (props.editingTask) {
    emit(
      'update',
      props.editingTask.id,
      payload,
    )
  } else {
    emit('add', payload)
  }

  resetForm()
}

function handleCancel() {
  resetForm()
  emit('cancel')
}

function resetForm() {
  newTask.value = ''

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = null
  imgAttachmentKey.value = null

  clearLocation()
  showCameraCapture.value = false
}
</script>

<style scoped>
.task-form {
  margin-bottom: 24px;
}

.task-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.task-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.task-input:focus {
  border-color: var(--color-primary);
}

.task-button {
  padding: 12px 20px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.task-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.task-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-button-cancel {
  padding: 12px 16px;
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.task-button-cancel:hover {
  border-color: #aaa;
}

.task-button-secondary {
  padding: 8px 14px;
  background-color: white;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.task-button-secondary:hover:not(:disabled) {
  background-color: var(--color-primary-light);
}

.task-button-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.image-preview {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.image-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.image-label:hover:not(.disabled) {
  background: var(--color-primary-light);
}

.image-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-input {
  display: none;
}

.upload-status {
  color: #888;
}

.image-help {
  width: 100%;
  font-size: 0.75rem;
  color: #999;
  margin: 0;
}

/* LOCALIZAÇÃO */

.location-section {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.location-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
  font-size: 0.875rem;
}

.location-info small {
  color: #777;
  font-size: 0.75rem;
}

.location-error {
  margin: 8px 0 0;
  color: #c0392b;
  font-size: 0.875rem;
}
</style>