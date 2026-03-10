<template>
  <div class="login">
    <div class="login-card card card--soft">
      <header class="login-header">
        <p class="login-badge">Acesso seguro · Recepção</p>
        <h2 class="login-title">Bem-vindo(a).</h2>
        <p class="login-subtitle">
          Entre para agendar com facilidade e acompanhar as consultas marcadas.
        </p>
      </header>

      <form @submit.prevent="handleSubmit" class="stack" aria-label="Formulário de login">
        <div class="field">
          <input
            v-model="email"
            class="field-input"
            type="email"
            id="email"
            placeholder=" "
            autocomplete="email"
            required
          />
          <label class="field-label" for="email">E-mail</label>
        </div>

        <div class="field">
          <input
            v-model="password"
            class="field-input"
            type="password"
            id="password"
            placeholder=" "
            autocomplete="current-password"
            required
          />
          <label class="field-label" for="password">Senha</label>
        </div>

        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>

        <button class="btn btn-ghost" type="button" @click="showRegister = !showRegister">
          {{ showRegister ? 'Já tenho cadastro' : 'Cadastrar novo usuário' }}
        </button>

        <p v-if="error" class="feedback feedback--error" role="alert">{{ error }}</p>
      </form>

      <transition name="fade">
        <form
          v-if="showRegister"
          @submit.prevent="handleRegister"
          class="register stack"
          aria-label="Formulário de cadastro"
        >
          <h3 class="register-title">Novo usuário</h3>

          <div class="field">
            <input v-model="newName" class="field-input" id="newName" placeholder=" " required />
            <label class="field-label" for="newName">Nome completo</label>
          </div>

          <div class="field">
            <input
              v-model="newEmail"
              class="field-input"
              type="email"
              id="newEmail"
              placeholder=" "
              autocomplete="email"
              required
            />
            <label class="field-label" for="newEmail">E-mail</label>
          </div>

          <div class="field">
            <input
              v-model="newPassword"
              class="field-input"
              type="password"
              id="newPassword"
              placeholder=" "
              autocomplete="new-password"
              required
            />
            <label class="field-label" for="newPassword">Senha</label>
          </div>

          <button class="btn btn-accent" type="submit" :disabled="registerLoading">
            {{ registerLoading ? 'Cadastrando…' : 'Cadastrar' }}
          </button>

          <p v-if="registerMessage" class="feedback" role="status">{{ registerMessage }}</p>
          <p v-if="registerError" class="feedback feedback--error" role="alert">{{ registerError }}</p>
        </form>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const showRegister = ref(false);
const newName = ref('');
const newEmail = ref('');
const newPassword = ref('');
const registerLoading = ref(false);
const registerMessage = ref('');
const registerError = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao fazer login';
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  registerLoading.value = true;
  registerMessage.value = '';
  registerError.value = '';
  try {
    await api.post('/auth/register', {
      name: newName.value,
      email: newEmail.value,
      password: newPassword.value
    });
    registerMessage.value = 'Usuário cadastrado com sucesso. Você já pode fazer login.';
    email.value = newEmail.value;
    password.value = '';
  } catch (err) {
    registerError.value =
      err.response?.data?.message || 'Erro ao cadastrar usuário. Verifique os dados.';
  } finally {
    registerLoading.value = false;
  }
};
</script>

<style scoped>
.login {
  width: 100%;
  min-height: calc(100vh - 140px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0 22px;
}

.login-card {
  width: 100%;
  max-width: 430px;
  padding: 18px 16px 16px;
}

.login-header {
  margin-bottom: 12px;
}

.login-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(226, 246, 236, 0.9);
  color: #166534;
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0 0 8px;
}

.login-title {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-size: 1.35rem;
  letter-spacing: -0.02em;
}

.login-subtitle {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.register {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
}

.register-title {
  margin: 0;
  margin-bottom: 4px;
  font-size: 1rem;
  font-family: var(--font-display);
  font-weight: 700;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

