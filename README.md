# Task Vault

Uma gerenciador de tarefas construído com React, Node.js, JWT, Prisma e MySQL.

# Dependências

- `node` v18.0+
- `mysql-server` v8.0+

# Instalação

1. Clone o repositório:
```sh
git clone https://github.com/b-coimbra/task-vault 
cd task-vault
```
2. Instale as dependências:
```sh
npm i --prefix ./client/
npm i --prefix ./server/
```
3. Crie um banco de dados no MySQL:
```sql
CREATE DATABASE task_vault;
```
4. Configure as variáveis de ambiente em `server/.env`:
```sh
DATABASE_URL="mysql://user:password@localhost:3306/task_vault"
JWT_SECRET="your_jwt_secret"
PORT=4000
```
5. Execute as migrações do Prisma na pasta `/server`:
```sh
cd server
npx prisma migrate dev --name init
npx prisma generate
```
6. Inicialize o servidor do client/server:
```
npm --prefix ./client run dev 
npm --prefix ./server run dev
```

## Uso

1. Abra `http://localhost:3000` no seu navegador
2. Na página de login, clique em "Cadastrar" para criar uma conta nova
3. Após o registro/login, você será redirecionado para a página inicial
4. Use o botão de logout para sair

## Testes Unitários

Execute o commando: `npm run test` na pasta do `/client` ou `/server`

## Estrutura do Projeto

Estrutura abaixo gerada com `tree -I 'node_modules|dist|coverage|.git' -L 3`

```ruby
task-vault/
├── client/                    # Front-end
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts      # API para comunicação com backend
│   │   ├── components/
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── CreateTaskModal.tsx
│   │   │   ├── EditTaskModal.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── TaskList.tsx
│   │   │   └── __tests__/
│   │   │       └── TaskList.test.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx    # Gerenciamento de estado da autenticação
│   │   │   ├── TaskContext.tsx    # Gerenciamento de estado das tarefas
│   │   │   └── __tests__/
│   │   │       └── TaskContext.test.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx       # Página principal de tarefas (listagem)
│   │   │   └── LoginPage.tsx      # Página de Login/Cadastro
│   │   ├── styles/
│   │   │   ├── LoginPage.css
│   │   │   └── TasksPage.css
│   │   ├── App.tsx                # Componente principal com roteamento das páginas
│   │   ├── main.tsx
│   │   ├── index.css              # Estilos globais
│   │   └── setupTests.ts          # Configuração de testes do Jest
│   ├── index.html                 # Template HTML
│   ├── package.json               # Dependências do frontend
│   ├── vite.config.ts             # Configuração do Vite
│   ├── tsconfig.json              # Configuração do TypeScript
│   └── jest.config.js             # Configuração de testes do Jest
│
├── server/                    # Back-end
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts            # Middleware de autenticação JWT
│   │   ├── routes/
│   │   │   ├── auth.ts            # Rotas de autenticação (login/cadastro)
│   │   │   ├── tasks.ts           # Rotas CRUD de tarefas
│   │   │   └── __tests__/
│   │   │       └── tasks.test.ts
│   │   └── server.ts              # Configuração do servidor Express
│   ├── prisma/
│   │   ├── schema.prisma          # Definição do schema do banco de dados
│   │   └── migrations/            # Migrações do banco de dados
│   ├── .env                       # Variáveis de ambiente
│   ├── package.json               # Dependências do backend
│   ├── tsconfig.json              # Configuração do TypeScript
│   └── jest.config.js             # Configuração de testes Jest
│
├── .gitignore
└── README.md
```
