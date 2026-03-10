<template>
  <div class="dashboard">
    <aside class="sidebar card card--soft" aria-label="Menu lateral">
      <div class="sidebar__top">
        <div class="user">
          <div class="user__avatar" aria-hidden="true">
            {{ initials }}
          </div>
          <div class="user__text">
            <p class="user__hello">Olá,</p>
            <p class="user__name">{{ user?.name || 'Usuário' }}</p>
          </div>
        </div>

        <nav class="tabs" aria-label="Navegação do painel">
          <button
            type="button"
            :class="['tab', activePanel === 'schedule' && 'tab--active']"
            @click="activePanel = 'schedule'"
          >
            Agendar
          </button>
          <button
            type="button"
            :class="['tab', activePanel === 'list' && 'tab--active']"
            @click="activePanel = 'list'"
          >
            Consultas
          </button>
        </nav>
      </div>

      <button class="btn btn-ghost sidebar__logout" type="button" @click="logout">
        Sair
      </button>
    </aside>

    <section class="content card" aria-label="Conteúdo do painel">
      <header class="content__header fade-slide-up">
        <div>
          <h2 class="section-title">
            {{ activePanel === 'schedule' ? 'Agendar consulta' : 'Consultas marcadas' }}
          </h2>
          <p class="section-subtitle">
            <span v-if="activePanel === 'schedule'">
              Cadastre/atualize o paciente, busque o endereço pelo CEP e marque a consulta.
            </span>
            <span v-else>
              Visualize as consultas, endereço e previsão do clima para o dia.
            </span>
          </p>
        </div>
        <div class="content__hint" aria-hidden="true">
          <span class="hint-dot"></span>
          <span>Você está em boas mãos</span>
        </div>
      </header>

      <div class="panel fade-slide-up">
        <SchedulePanel v-if="activePanel === 'schedule'" />
        <AppointmentsPanel v-else />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import SchedulePanel from '../components/SchedulePanel.vue';
import AppointmentsPanel from '../components/AppointmentsPanel.vue';

const router = useRouter();
const activePanel = ref('schedule');
const user = ref(null);

onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) {
    user.value = JSON.parse(stored);
  }
});

const initials = computed(() => {
  const name = user.value?.name?.trim() || 'VC';
  const parts = name.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || 'V';
  const b = parts[1]?.[0] || parts[0]?.[1] || 'C';
  return `${a}${b}`.toUpperCase();
});

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 14px;
  width: 100%;
  max-width: 1200px;
}

.sidebar {
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sidebar__top {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user__avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-family: var(--font-display);
  color: #f9fafb;
  background: linear-gradient(135deg, var(--color-primary), var(--color-teal));
  box-shadow: 0 14px 32px rgba(56, 178, 172, 0.22);
}

.user__hello {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-muted);
}

.user__name {
  margin: 2px 0 0;
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-display);
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab {
  flex: 1;
  min-height: 44px;
  padding: 10px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.75);
  color: var(--color-text);
  font-family: var(--font-display);
  font-weight: 700;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast),
    background-color var(--transition-fast), border-color var(--transition-fast);
}

.tab:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  border-color: rgba(56, 178, 172, 0.45);
}

.tab--active {
  background: linear-gradient(135deg, rgba(76, 175, 125, 0.92), rgba(56, 178, 172, 0.92));
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 14px 34px rgba(56, 178, 172, 0.22);
}

.sidebar__logout {
  width: 100%;
  justify-content: center;
}

.content {
  padding: 14px;
}

.content__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.content__hint {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-pill);
  background: rgba(226, 246, 236, 0.9);
  color: #166534;
  font-size: 0.82rem;
  font-weight: 600;
}

.hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
  animation: pulse 1.8s infinite;
}

@media (max-width: 900px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .sidebar {
    gap: 10px;
  }

  .content__hint {
    display: none;
  }
}

@media (min-width: 900px) {
  .content__hint {
    display: inline-flex;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}
</style>

