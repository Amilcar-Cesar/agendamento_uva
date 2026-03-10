<template>
  <div class="panel">
    <div class="panel__header panel__header--right">
      <button class="btn btn-ghost" type="button" @click="loadAppointments">
        Atualizar lista
      </button>
    </div>

    <div class="table-wrap" role="region" aria-label="Tabela de consultas" tabindex="0">
      <table class="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Endereço</th>
            <th>Clima previsto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in appointments" :key="appt.id">
            <td>{{ formatDate(appt.date) }}</td>
            <td>{{ appt.time }}</td>
            <td class="patient">{{ appt.patient_name }}</td>
            <td>
              <div class="address">
                <span v-if="appt.cep">CEP: {{ appt.cep }}</span>
                <span v-if="appt.city">{{ appt.city }} - {{ appt.state }}</span>
              </div>
            </td>
            <td>
              <div v-if="appt.weather_json" class="weather">
                <span class="temp">
                  {{ appt.weather_json.main.temp.toFixed(0) }}°C
                </span>
                <span class="desc">
                  {{ appt.weather_json.weather[0].description }}
                </span>
              </div>
              <span v-else class="muted">
                Clima não disponível
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="cards" aria-label="Consultas (modo mobile)">
      <article v-for="appt in appointments" :key="`m-${appt.id}`" class="appt-card">
        <header class="appt-card__top">
          <div>
            <p class="appt-card__patient">{{ appt.patient_name }}</p>
            <p class="appt-card__meta">{{ formatDate(appt.date) }} · {{ appt.time }}</p>
          </div>
          <span class="pill">{{ appt.city ? `${appt.city}-${appt.state}` : 'Endereço' }}</span>
        </header>

        <div class="appt-card__mid">
          <p v-if="appt.cep" class="muted">CEP: {{ appt.cep }}</p>
        </div>

        <div class="appt-card__bottom">
          <div v-if="appt.weather_json" class="weather">
            <span class="temp">
              {{ appt.weather_json.main.temp.toFixed(0) }}°C
            </span>
            <span class="desc">
              {{ appt.weather_json.weather[0].description }}
            </span>
          </div>
          <span v-else class="muted">
            Clima não disponível
          </span>
        </div>
      </article>
    </div>

    <p v-if="error" class="feedback feedback--error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';

const appointments = ref([]);
const error = ref('');

const loadAppointments = async () => {
  error.value = '';
  try {
    const { data } = await api.get('/appointments');
    appointments.value = data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao carregar consultas';
  }
};

onMounted(() => {
  loadAppointments();
});

const formatDate = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};
</script>

<style scoped>
.panel {
  padding: 14px;
}

.panel__header {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.panel__city {
  flex: 1 1 260px;
}

.panel__header--right {
  justify-content: flex-end;
}

.table-wrap {
  width: 100%;
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.6);
}

.btn-small {
  padding: 8px 12px;
  font-size: 0.86rem;
  min-height: 44px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  padding: 0.7rem 0.65rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  text-align: left;
}

th {
  font-weight: 600;
  color: var(--color-muted);
  background: rgba(240, 253, 250, 0.55);
}

.address {
  display: flex;
  flex-direction: column;
}

.weather {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.temp {
  font-weight: 600;
}

.desc {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.cards {
  display: none;
  margin-top: 10px;
  gap: 10px;
}

.appt-card {
  border-radius: var(--radius-xl);
  border: 1px solid rgba(209, 250, 229, 0.85);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-soft);
  padding: 12px;
}

.appt-card__top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 6px;
}

.appt-card__patient {
  margin: 0;
  font-weight: 700;
  font-family: var(--font-display);
}

.appt-card__meta {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: var(--color-muted);
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(226, 246, 236, 0.9);
  color: #166534;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.muted {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-muted);
}

.appt-card__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .table {
    font-size: 0.8rem;
  }
}

@media (max-width: 760px) {
  .table-wrap {
    display: none;
  }

  .cards {
    display: flex;
    flex-direction: column;
  }
}
</style>

