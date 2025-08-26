# API de Tarefas com Autenticação

Esta API foi construída para gerenciamento de tarefas, utilizando autenticação para proteger as rotas. O projeto foi desenvolvido com **NestJS** e integra diversas tecnologias como **Prisma**, **bcrypt**, **JWT**, **SQLite**, **Winston**, **Health Check** e **Jest**. Além disso, utiliza **class-validator** para validação de dados.

---

## Índice

  - [Recursos do Projeto](#recursos-do-projeto)
  - [Tecnologias Utilizadas](#tecnologias-utilizadas)
  - [Como Rodar o Projeto](#como-rodar-o-projeto)
  - [Como Executar os Testes](#como-executar-os-testes)
  - [Rotas da API](#rotas-da-api)
    - [**Autenticação**](#autenticação)
    - [**Tarefas**](#tarefas)
    - [**Health Check**](#health-check)

---

## Recursos do Projeto

- **Cadastro e Login de Usuários**: Endpoints `/auth/register` e `/auth/login` para criação e autenticação de usuários.
- **CRUD de Tarefas**: Permite criar, listar, atualizar e deletar tarefas, sempre protegendo as operações com autenticação.
- **Filtros**: Possibilidade de filtrar tarefas por status e pesquisar por título ou descrição.
- **Health Check**: Endpoint para verificação do status de saúde da API.
- **Logs Estruturados**: Uso do Winston para registro de logs, facilitando o monitoramento.
- **Testes Unitários**: Implementados com Jest para garantir a qualidade do código.

---

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js para construção de aplicações escaláveis e eficientes.
- **Prisma**: ORM que simplifica a interação com o banco de dados SQLite.
- **bcrypt**: Biblioteca para hash de senhas, garantindo segurança no armazenamento.
- **JWT**: Gerenciamento e validação de tokens para autenticação.
- **SQLite**: Banco de dados utilizado para persistência dos dados.
- **Winston**: Biblioteca para logs estruturados, auxiliando na monitoração da aplicação.
- **Health Check**: Implementação de endpoint para verificação da saúde do sistema.
- **Jest**: Framework de testes unitários.
- **class-validator**: Biblioteca utilizada para validação dos dados de entrada.

---

## Como Rodar o Projeto

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/Matheus-TC-Mourao/Task.Auth.git
   cd Task.Auth
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (exemplo):

    ```env
    # Porta da aplicação
    PORT=3000
    
    # Configuração do banco de dados
    DATABASE_URL="file:./dev.db"
    
    # JWT
    JWT_SECRET=supersecretkey
    
    ```

4. **Execute as migrações do Prisma:**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Inicie a aplicação:**

   ```bash
   npm run start:dev
   ```

A API estará disponível em `http://localhost:3000` (ou na porta definida na variável `PORT`).

---

## Como Executar os Testes

Para rodar os testes unitários, utilize:

```bash
npm run test
```

Para executar os testes em modo watch, utilize:

```bash
npm run test:watch
```

---

## Rotas da API

> **Importante:** Todas as rotas `/tasks` estão protegidas por um guard de autenticação, sendo necessário enviar o token JWT no header (Bearer Token) para acessar os endpoints.

### **Autenticação**

- **POST /auth/register**
  Registra um novo usuário.

  **Exemplo de Request Body:**

  ```json
  {
    "name": "Nome do usuário",
    "email": "email@usuario.com",
    "password": "senhaDoUsuario"
  }
  ```

- **POST /auth/login**
  Realiza o login do usuário.

  **Exemplo de Request Body:**

  ```json
  {
    "email": "email@usuario.com",
    "password": "senhaDoUsuario"
  }
  ```

### **Tarefas**

- **GET /tasks**
  Lista todas as tarefas do usuário autenticado.
  Possui filtros opcionais:

  - `status`: Filtra tarefas pelo status (ex.: `/tasks?status=IN_PROGRESS`).
  - `search`: Pesquisa por título ou descrição (ex.: `/tasks?search=keyword`).

- **GET /tasks/:id**
  Retorna uma tarefa específica pelo seu ID (usuário autenticado).

- **POST /tasks**
  Cria uma nova tarefa para o usuário autenticado.

  **Exemplo de Request Body:**

  ```json
  {
    "title": "Título da tarefa",
    "description": "Descrição da tarefa", // (opcional)
    "status": "PENDING", // valores possíveis: PENDING, IN_PROGRESS, DONE (opcional)
    "due_date": "2025-12-31T23:59:59Z" // formato datetime (opcional)
  }
  ```

- **PATCH /tasks/:id**
  Atualiza uma ou mais propriedades de uma tarefa.

  **Exemplo de Request Body:**

  ```json
  {
    "title": "Título atualizado",
    "description": "Descrição atualizada",
    "status": "IN_PROGRESS",
    "due_date": "2025-12-31T23:59:59Z"
  }
  ```

- **DELETE /tasks/:id**
  Deleta uma tarefa específica do usuário autenticado.

### **Health Check**

- **GET /health**
  Retorna o status de saúde da aplicação.

---

