<template>
  <header class="app-header">
    <div class="brand">
      <span class="brand-icon">T</span>
      <div class="brand-copy">
        <h1>Gestor de Tarefas</h1>
        <p>Organize suas atividades de forma prática.</p>
      </div>
    </div>

    <nav class="app-nav">
      <router-link to="/" class="nav-link">Início</router-link>
      <router-link to="/about" class="nav-link">Sobre</router-link>
    </nav>

    <button v-if="authStore.isAuthenticated" class="logout-btn" @click="handleLogout">Sair</button>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: #fafbfe;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--color-primary);
  color: white;
  font-size: 1rem;
  font-weight: 700;
}

.brand-copy h1 {
  font-size: 1rem;
  margin: 0;
  color: #111827;
}

.brand-copy p {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}

.app-nav {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-link {
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.nav-link:hover {
  background: var(--color-primary-soft);
}

.logout-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background: var(--color-primary-dark);
}

@media (max-width: 640px) {
  .app-header {
    padding-top: 12px;
  }

  .brand-copy h1 {
    font-size: 0.98rem;
  }

  .brand-copy p {
    font-size: 0.82rem;
  }
}
</style>
