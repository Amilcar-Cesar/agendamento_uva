<template>
  <div class="layout">
    <section class="card panel fade-slide-up" aria-label="Dados do paciente">
      <header class="panel__header">
        <h3 class="section-title">Dados do paciente</h3>
        <p class="section-subtitle">Preencha e salve para agilizar o agendamento.</p>
      </header>

      <form class="stack" @submit.prevent="handleSavePatient">
        <div class="field">
          <input v-model="patient.name" class="field-input" id="pname" placeholder=" " required />
          <label class="field-label" for="pname">Nome completo</label>
        </div>

        <div class="row">
          <div class="field row__grow">
            <input v-model="patient.cpf" class="field-input" id="pcpf" placeholder=" " />
            <label class="field-label" for="pcpf">CPF</label>
          </div>
          <div class="field row__grow">
            <input v-model="patient.phone" class="field-input" id="pphone" placeholder=" " />
            <label class="field-label" for="pphone">Telefone</label>
          </div>
        </div>

        <div class="row row--alignEnd">
          <div class="field row__grow">
            <input v-model="patient.cep" class="field-input" id="pcep" placeholder=" " inputmode="numeric" />
            <label class="field-label" for="pcep">CEP</label>
          </div>
          <button type="button" class="btn btn-ghost btn-cep" @click="fetchCep" :disabled="loadingCep">
            {{ loadingCep ? 'Buscando…' : 'Buscar CEP' }}
          </button>
        </div>

        <div class="field">
          <input v-model="patient.street" class="field-input" id="pstreet" placeholder=" " />
          <label class="field-label" for="pstreet">Logradouro</label>
        </div>

        <div class="row">
          <div class="field row__grow">
            <input v-model="patient.number" class="field-input" id="pnum" placeholder=" " />
            <label class="field-label" for="pnum">Número</label>
          </div>
          <div class="field row__grow">
            <input v-model="patient.complement" class="field-input" id="pcomp" placeholder=" " />
            <label class="field-label" for="pcomp">Complemento</label>
          </div>
        </div>

        <div class="field">
          <input v-model="patient.neighborhood" class="field-input" id="pneigh" placeholder=" " />
          <label class="field-label" for="pneigh">Bairro</label>
        </div>

        <div class="row">
          <div class="field row__grow">
            <input v-model="patient.city" class="field-input" id="pcity" placeholder=" " />
            <label class="field-label" for="pcity">Cidade</label>
          </div>
          <div class="field row__grow">
            <input v-model="patient.state" class="field-input" id="pstate" placeholder=" " maxlength="2" />
            <label class="field-label" for="pstate">UF</label>
          </div>
        </div>

        <button class="btn btn-primary" type="submit" :disabled="savingPatient">
          {{ savingPatient ? 'Salvando…' : 'Salvar/atualizar paciente' }}
        </button>

        <p v-if="patientMessage" class="feedback" role="status">{{ patientMessage }}</p>
      </form>
    </section>

    <section class="card panel fade-slide-up" aria-label="Agendar consulta">
      <header class="panel__header">
        <h3 class="section-title">Agendar consulta</h3>
        <p class="section-subtitle">Selecione paciente, data e horário.</p>
      </header>

      <form class="stack" @submit.prevent="handleSchedule">
        <div class="field">
          <select
            v-model="appointment.patient_id"
            class="field-select"
            :class="{ 'field-select--hasValue': !!appointment.patient_id }"
            id="apptPatient"
            required
            aria-label="Paciente"
          >
            <option value="" disabled>Selecione um paciente</option>
            <option v-for="p in patients" :key="p.id" :value="p.id">
              {{ p.name }}
            </option>
          </select>
          <label class="field-label" for="apptPatient">Paciente</label>
        </div>

        <div class="row">
          <div class="field row__grow">
            <input
              v-model="appointment.date"
              class="field-input"
              type="date"
              id="apptDate"
              placeholder=" "
              required
            />
            <label class="field-label" for="apptDate">Data</label>
          </div>
          <div class="field row__grow">
            <input
              v-model="appointment.time"
              class="field-input"
              type="time"
              id="apptTime"
              placeholder=" "
              required
            />
            <label class="field-label" for="apptTime">Horário</label>
          </div>
        </div>

        <div class="field">
          <input v-model="appointment.reason" class="field-input" id="apptReason" placeholder=" " />
          <label class="field-label" for="apptReason">Motivo</label>
        </div>

        <div class="field">
          <textarea v-model="appointment.notes" class="field-textarea" id="apptNotes" placeholder=" " rows="3" />
          <label class="field-label" for="apptNotes">Observações</label>
        </div>

        <button class="btn btn-accent" type="submit" :disabled="savingAppointment">
          {{ savingAppointment ? 'Agendando…' : 'Agendar consulta' }}
        </button>

        <p v-if="appointmentMessage" class="feedback" role="status">{{ appointmentMessage }}</p>
      </form>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import api from '../services/api';

const patients = ref([]);
const patient = reactive({
  id: null,
  name: '',
  cpf: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: ''
});

const appointment = reactive({
  patient_id: '',
  date: '',
  time: '',
  reason: '',
  notes: ''
});

const loadingCep = ref(false);
const savingPatient = ref(false);
const savingAppointment = ref(false);
const patientMessage = ref('');
const appointmentMessage = ref('');

const loadPatients = async () => {
  const { data } = await api.get('/patients');
  patients.value = data;
};

onMounted(() => {
  loadPatients();
});

const fetchCep = async () => {
  if (!patient.cep) return;
  loadingCep.value = true;
  patientMessage.value = '';
  try {
    const cleanCep = patient.cep.replace(/\D/g, '');
    const { data } = await api.get(`/external/cep/${cleanCep}`);
    patient.street = data.logradouro || '';
    patient.neighborhood = data.bairro || '';
    patient.city = data.localidade || '';
    patient.state = data.uf || '';
  } catch (err) {
    patientMessage.value = err.response?.data?.message || 'Erro ao buscar CEP';
  } finally {
    loadingCep.value = false;
  }
};

const handleSavePatient = async () => {
  savingPatient.value = true;
  patientMessage.value = '';
  try {
    const payload = { ...patient };
    delete payload.id;
    const { data } = await api.post('/patients', payload);
    patient.id = data.id;
    patientMessage.value = 'Paciente salvo com sucesso.';
    await loadPatients();
  } catch (err) {
    patientMessage.value = err.response?.data?.message || 'Erro ao salvar paciente';
  } finally {
    savingPatient.value = false;
  }
};

const handleSchedule = async () => {
  savingAppointment.value = true;
  appointmentMessage.value = '';
  try {
    await api.post('/appointments', appointment);
    appointmentMessage.value = 'Consulta agendada com sucesso.';
    appointment.patient_id = '';
    appointment.date = '';
    appointment.time = '';
    appointment.reason = '';
    appointment.notes = '';
  } catch (err) {
    appointmentMessage.value =
      err.response?.data?.message || 'Erro ao agendar consulta';
  } finally {
    savingAppointment.value = false;
  }
};
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 12px;
}

.panel {
  padding: 14px;
}

.panel__header {
  margin-bottom: 12px;
}

.row__grow {
  flex: 1 1 200px;
}

.row--alignEnd {
  align-items: flex-end;
}

.btn-cep {
  min-height: 44px;
  padding-inline: 14px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>

