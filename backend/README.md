# Backend — Olimpíadas IFPI

API em **Python + FastAPI** com banco **PostgreSQL**, feita para alimentar o
site das Olimpíadas do IFPI (frontend em HTML/CSS/JS puro).

## Estrutura

```
backend/
├── app/
│   ├── main.py          # aplicação FastAPI (rotas, CORS, arquivos estáticos)
│   ├── config.py         # leitura das variáveis de ambiente
│   ├── database.py       # conexão com o PostgreSQL
│   ├── models.py          # tabelas do banco (SQLAlchemy)
│   ├── schemas.py         # validação/serialização (Pydantic)
│   ├── auth.py             # login, JWT, senha
│   ├── seed.py             # popula o banco com dados de exemplo
│   └── routers/            # rotas da API, organizadas por assunto
├── static/uploads/         # fotos dos alunos (criado automaticamente)
├── requirements.txt
└── .env.example
```

## 1. Configuração local

### 1.1. Criar o banco PostgreSQL

Instale o PostgreSQL e crie um banco vazio, por exemplo `olimpiadas_ifpi`:

```bash
createdb olimpiadas_ifpi
```

### 1.2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores:

```bash
cd backend
cp .env.example .env
```

Edite o `.env`:

- `DATABASE_URL`: string de conexão do seu PostgreSQL local, ex:
  `postgresql://usuario:senha@localhost:5432/olimpiadas_ifpi`
- `SECRET_KEY`: gere uma chave aleatória com
  `python -c "import secrets; print(secrets.token_hex(32))"`
- `CORS_ORIGINS`: endereço onde o frontend vai rodar. Se você abrir o
  `index.html` com a extensão "Live Server" do VS Code, normalmente é
  `http://127.0.0.1:5500` — coloque esse valor aqui.

### 1.3. Instalar dependências

Recomenda-se usar um ambiente virtual:

```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate          # Windows

pip install -r requirements.txt
```

> **Nota sobre versão do Python**: o projeto usa o driver `psycopg`
> (versão 3) em vez do `psycopg2`, justamente porque o `psycopg2`
> exige compilar código C e falha em versões muito novas do Python
> (como 3.13/3.14). Se seu sistema tiver Python 3.14 (`python3
> --version` para checar), as dependências já estão ajustadas para
> funcionar sem problemas.

### 1.4. Popular o banco com dados de exemplo (opcional, recomendado)

```bash
python -m app.seed
```

Isso cria:
- Um usuário admin: **email `admin@ifpi.edu.br`, senha `ifpi2025`**
  (troque essa senha depois de testar!)
- Cursos, turmas, modalidades, edições, alunos, resultados e destaques de exemplo.

### 1.5. Rodar o servidor

```bash
uvicorn app.main:app --reload
```

A API ficará disponível em `http://127.0.0.1:8000`.
Documentação interativa (Swagger): `http://127.0.0.1:8000/docs`.

## 2. Conectando o frontend à API

No frontend, cada arquivo `js/*.js` tem um bloco "DADOS MOCK" comentado
indicando o endpoint correspondente. Por exemplo, em `js/medalhistas.js`:

```js
// Troque os dados mock por:
const res = await fetch("http://127.0.0.1:8000/api/resultados?edicao_id=1");
const dados = await res.json();
```

Para o **login admin** (`admin/login.html`), troque a simulação por:

```js
const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, senha }),
});

if (res.ok) {
  const dados = await res.json();
  localStorage.setItem("token_admin", dados.access_token);
  window.location.href = "dashboard.html";
} else {
  // mostrar erro
}
```

E em todas as chamadas do painel admin que exigem login (criar, editar,
excluir), envie o token:

```js
const token = localStorage.getItem("token_admin");

await fetch("http://127.0.0.1:8000/api/alunos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify({ nome: "Novo Aluno", turma_id: 1 }),
});
```

### Upload de foto do aluno

O cadastro de aluno é em duas etapas:

1. `POST /api/alunos` (ou `PUT /api/alunos/{id}`) com `nome` e `turma_id`.
2. `POST /api/alunos/{id}/foto` enviando o arquivo como `multipart/form-data`:

```js
const formData = new FormData();
formData.append("arquivo", arquivoSelecionado); // arquivo do <input type="file">

await fetch(`http://127.0.0.1:8000/api/alunos/${alunoId}/foto`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` },
  body: formData,
});
```

A foto fica acessível em `http://127.0.0.1:8000/static/uploads/NOME_DO_ARQUIVO`.

## 3. Resumo dos endpoints

| Recurso | Rotas | Autenticação |
|---|---|---|
| Login | `POST /api/auth/login`, `GET /api/auth/me` | login público / `me` exige token |
| Edições | `GET /api/edicoes`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` | leitura pública, escrita exige token |
| Cursos | `GET /api/cursos`, `POST`, `DELETE /{id}` | leitura pública, escrita exige token |
| Turmas | `GET /api/turmas`, `POST`, `PUT /{id}`, `DELETE /{id}` | leitura pública, escrita exige token |
| Modalidades | `GET /api/modalidades`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` | leitura pública, escrita exige token |
| Alunos | `GET /api/alunos`, `GET /{id}`, `POST`, `PUT /{id}`, `POST /{id}/foto`, `DELETE /{id}` | leitura pública, escrita exige token |
| Resultados (medalhas) | `GET /api/resultados`, `POST`, `PUT /{id}`, `DELETE /{id}` | leitura pública, escrita exige token |
| Destaques | `GET /api/destaques`, `POST`, `PUT /{id}`, `DELETE /{id}` | leitura pública, escrita exige token |
| Ranking | `GET /api/ranking` (filtro opcional `edicao_id`) | pública |
| Dashboard | `GET /api/dashboard/resumo` | exige token |

### Filtros disponíveis (query params)

- `GET /api/resultados?edicao_id=1&modalidade_id=2&turma_id=3&curso_id=4&posicao=1&aluno_id=5`
- `GET /api/destaques?edicao_id=1&categoria=geral`
- `GET /api/turmas?curso_id=1&ano_serie=3`
- `GET /api/alunos?curso_id=1&turma_id=2&nome=joão`
- `GET /api/ranking?edicao_id=1`

A posição em Resultados aceita os valores `"1"`, `"2"`, `"3"` (ouro, prata,
bronze) ou `"mh"` (menção honrosa).

## 4. Deploy no Render

### 4.1. Banco de dados

1. No Render, crie um **PostgreSQL** (Render → New → PostgreSQL).
2. Copie a **Internal Database URL** gerada.

### 4.2. Web Service

1. Suba este código para um repositório no GitHub.
2. No Render, crie um **Web Service** apontando para o repositório,
   com pasta raiz `backend`.
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Em **Environment**, configure as variáveis:
   - `DATABASE_URL`: a Internal Database URL copiada do passo 4.1
   - `SECRET_KEY`: uma chave aleatória forte
   - `CORS_ORIGINS`: o endereço onde o frontend ficará publicado
     (ex: `https://seusite.onrender.com`)

### 4.3. Popular o banco em produção

Depois do primeiro deploy, rode o seed uma vez usando o "Shell" do
Render (aba Shell do seu Web Service):

```bash
python -m app.seed
```

### ⚠️ Aviso sobre as fotos dos alunos

As fotos são salvas em `static/uploads/`, no disco do servidor. **No
plano gratuito do Render, esse disco é efêmero**: a cada novo deploy ou
reinício do serviço, os arquivos enviados são perdidos (os dados no
banco continuam, mas a foto física some).

Para resolver isso de forma definitiva, no futuro é possível:
- Adicionar um **Render Disk** (armazenamento persistente, pago); ou
- Migrar o upload para um serviço externo como **Cloudinary** ou
  **Amazon S3**, salvando apenas a URL no banco (a estrutura do
  `foto_url` já está pronta para isso).

Por enquanto, para um projeto escolar, o armazenamento local funciona
bem — apenas tenha em mente que, após um deploy, será necessário
reenviar as fotos dos alunos pelo painel admin.
