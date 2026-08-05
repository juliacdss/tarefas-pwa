<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="handleRegister">
      <h1>Criar conta</h1>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="field">
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>

      <div class="field">
        <label>Senha</label>
        <input v-model="password" type="password" required />
      </div>

      <div class="field">
        <label>Confirmar senha</label>
        <input v-model="confirmPassword" type="password" required />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
      </button>

      <p>
        Já tem conta?
        <router-link to="/login">Entrar</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '@/api/authApi'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''

  // validação frontend
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As senhas não coincidem'
    return
  }

  loading.value = true

  try {
    await authApi.register(email.value, password.value)

    // redireciona com query param
    router.push('/login?registered=true')
  } catch (err) {
    errorMessage.value = err.response?.data?.detail || 'Erro ao cadastrar'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* container */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  padding: 1rem;
}

/* card */
.login-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
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
  padding: 0.7rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  transition: 0.2s;
}

.field input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

/* botão */
button {
  width: 100%;
  padding: 0.8rem;
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
