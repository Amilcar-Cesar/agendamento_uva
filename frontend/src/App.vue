<template>
  <div class="app-shell">
    <header class="topbar" aria-label="Header principal">
      <button class="brand" type="button" @click="goHome" aria-label="Ir para início">
        <span class="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <defs>
              <linearGradient id="pulse" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#4CAF7D" />
                <stop offset="50%" stop-color="#38B2AC" />
                <stop offset="100%" stop-color="#FF7F6B" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="18" fill="url(#pulse)" opacity="0.18" />
            <path
              d="M10 26h6l3-8 4 14 3-8h7"
              fill="none"
              stroke="url(#pulse)"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="brand-text">
          <span class="brand-title">UVA Care</span>
          <span class="brand-subtitle">Agendamento acolhedor</span>
        </span>
      </button>

      <div class="topbar-actions">
        <button class="btn btn-primary" type="button" @click="goLogin" v-if="!isAuthenticated">
          Acessar
        </button>
      </div>
    </header>

    <main aria-label="Conteúdo">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isAuthenticated = computed(() => !!localStorage.getItem('token'));

function goHome() {
  router.push(isAuthenticated.value ? '/dashboard' : '/login');
}

function goLogin() {
  router.push('/login');
}

function goDashboard() {
  router.push('/dashboard');
}
</script>

