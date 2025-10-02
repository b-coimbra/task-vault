# Task Vault

Gerenciador de tarefas com autenticação baseada em JWT.

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
3. Configure as variáveis de ambiente em `server/.env`:
```sh
DATABASE_URL="mysql://user:password@localhost:3306/taskdb"
JWT_SECRET="your_jwt_secret"
PORT=4000
```
4. Execute as migrações do Prisma na pasta `/server`:
```sh
npx prisma migrate dev
```
