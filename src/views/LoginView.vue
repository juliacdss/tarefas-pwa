<template>
  <div class="login-container">
    <div v-if="route.query.registered === 'true'" class="success-message">
      Conta criada com sucesso! Faça login.
    </div>

    <form class="login-form" @submit.prevent="handleLogin">
      <h1>Entrar</h1>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          required
          autocomplete="email"
        />
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="current-password"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>

      <p>
        Não tem conta?
        <router-link to="/register">Criar conta</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    errorMessage.value = err.response?.data?.detail ?? 'Erro ao entrar. Verifique suas credenciais.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* container centralizado */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
}

/* card */
.login-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* título */
.login-form h1 {
  text-align: center;
  margin-bottom: 1.5rem;
}

/* campos */
.field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.field label {
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.field input {
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  transition: 0.2s;
}

.field input:focus {
  border-color: var(--color-primary);
  outline: none;
}

/* botão */
button {
  width: 100%;
  padding: 0.7rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: bold;
}

button:hover {
  background: var(--color-primary-dark);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* erro */
.error-message {
  background: #fee2e2;
  color: #b91c1c;
  padding: 0.6rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
}

/* sucesso */
.success-message {
  background: #dcfce7;
  color: #166534;
  padding: 0.6rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
}

/* link */
p {
  text-align: center;
  margin-top: 1rem;
}

a {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
