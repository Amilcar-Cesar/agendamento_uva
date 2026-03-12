## Sistema de Agendamento de Consultas

Aplicação fullstack para recepcionistas de clínica, com:

- **Backend (Node.js + Express + SQLite)**: autenticação JWT, cadastro de usuários (recepcionistas), pacientes e consultas.
- **Integrações externas**:
  - **API de CEP**: ViaCEP para preenchimento automático de endereço.
  - **API de clima**: WeatherAPI.com para previsão no dia da consulta.
- **Frontend (Vue 3 + Vite)**: painéis separados para agendar consultas e visualizar consultas marcadas.

### Link de deploy do projeto
- https://agendamento-uva.vercel.app/login
  
### Arquitetura geral

- **Backend**: `backend/`
  - `src/server.js`: inicialização do servidor Express.
  - `src/db.js`: conexão e criação do banco SQLite (`database.sqlite`) com tabelas:
    - `users`: usuários recepcionistas que fazem login.
    - `patients`: pacientes cadastrados pelos recepcionistas.
    - `appointments`: consultas marcadas, relacionadas a pacientes e usuários.
  - `src/routes/auth.js`: login e cadastro de usuários.
  - `src/routes/patients.js`: CRUD básico de pacientes (cadastro e listagem).
  - `src/routes/appointments.js`: criação e listagem de consultas.
  - `src/routes/external.js`: integração com ViaCEP e WeatherAPI.com.
  - `src/middleware/auth.js`: middleware de autenticação JWT para proteger rotas.

- **Frontend**: `frontend/`
  - `src/views/LoginView.vue`: tela de login de recepcionistas.
  - `src/views/DashboardView.vue`: painel principal com dois subpaineis:
    - **Painel de agendamento** (`SchedulePanel.vue`): cadastro de paciente + agendamento.
    - **Painel de consultas marcadas** (`AppointmentsPanel.vue`): lista de consultas com CEP e clima.
  - `src/services/api.js`: cliente Axios configurado com baseURL do backend e JWT no header.

### Banco de dados (SQLite)

O banco `database.sqlite` é criado automaticamente na pasta `backend/` ao subir o servidor.

Tabelas principais:

- **users**
  - `id` (PK, autoincrement)
  - `name` (TEXT)
  - `email` (TEXT, único)
  - `password_hash` (TEXT)
  - `role` (TEXT, padrão `recepcionista`)

- **patients**
  - `id` (PK)
  - `name`
  - `cpf`
  - `birth_date`
  - `phone`
  - `cep`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`

- **appointments**
  - `id` (PK)
  - `patient_id` (FK → patients.id)
  - `date` (YYYY-MM-DD)
  - `time` (HH:mm)
  - `reason`, `notes`
  - `created_by` (FK → users.id)
  - `weather_json`, `address_snapshot` (reservados para evoluções futuras)

### Fluxo de uso (UX)

1. **Login do recepcionista**
   - Acessa `/login` no frontend.
   - Informa e-mail e senha.
   - Ao logar, recebe token JWT e é redirecionado para `/dashboard`.

2. **Painel de agendamento**
   - Lado esquerdo do dashboard.
   - **Formulário de paciente**:
     - Campos de dados pessoais e endereço.
     - Botão **“Buscar CEP”** consulta a API ViaCEP via backend (`/api/external/cep/:cep`) e preenche logradouro, bairro, cidade e UF.
   - **Formulário de consulta**:
     - Seleciona paciente (lista de pacientes cadastrados).
     - Informa data e horário da consulta, motivo e observações.
     - Botão **“Agendar consulta”** grava no backend (`/api/appointments`).

3. **Painel de consultas marcadas**
   - Lado direito do dashboard.
   - Lista todas as consultas com:
     - Data, horário, nome do paciente, CEP, cidade/UF e clima previsto (quando disponível).

### Configuração do ambiente

#### 1. Clonar projeto

```bash
git clone https://github.com/Amilcar-Cesar/agendamento_uva.git
```


#### 2. Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` dentro de `backend/` com:

```bash
PORT=3000
JWT_SECRET=sua_chave_secreta_segura
WEATHER_API_KEY=sua_chave_weatherapi
NODE_ENV=development
```

Suba o servidor:

```bash
npm run dev
```

O backend ficará exposto em `http://localhost:3000`.

#### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

O Vite iniciará em algo como `http://localhost:5173`.

Certifique-se de que o `baseURL` do Axios (`src/services/api.js`) aponta para `http://localhost:3000/api`.

### Endpoints principais do backend

- **Autenticação**
  - `POST /api/auth/register` – cadastra recepcionista (name, email, password).
  - `POST /api/auth/login` – retorna `{ token, user }`.

- **Pacientes** (JWT obrigatório)
  - `GET /api/patients` – lista pacientes.
  - `POST /api/patients` – cadastra paciente.

- **Consultas** (JWT obrigatório)
  - `GET /api/appointments` – lista consultas com dados do paciente.
  - `POST /api/appointments` – cria nova consulta.

- **Integrações externas** (JWT obrigatório)
  - `GET /api/external/cep/:cep` – consulta ViaCEP.
  - `GET /api/external/weather?city=...&date=YYYY-MM-DD` – consulta OpenWeatherMap.




