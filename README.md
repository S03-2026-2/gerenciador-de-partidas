# Gerenciador de Partidas

Serviço backend responsável pelo gerenciamento de fila de matchmaking, criação e persistência de partidas, integração com o serviço externo de Batalhas e consulta de histórico e pontuação de jogadores.

Documentações de arquitetura e diagramas das entregas anteriores:
- [Entrega 1](docs/Entrega1/)
- [Entrega 2](docs/Entrega2/README.md)
- [Princípios SOLID e UML](docs/UML_SOLID/README.md)

---

## Arquitetura do Projeto

O projeto utiliza **Node.js**, **TypeScript**, **Express** e **PostgreSQL** com **Prisma ORM**, organizado em camadas com **Inversão de Dependência (Ports & Adapters)**:

```
src/
├── core/
│   ├── domain/
│   │   └── FilaMatchmaking.ts       # Gerenciamento da fila em memória, pareamento e despacho para Batalhas
│   ├── entities/
│   │   └── Partida.ts               # Entidade de domínio com ciclo de vida e registro de resultado incorporado
│   ├── enums/
│   │   └── StatusPartida.ts         # AGUARDANDO_BATALHA | EM_BATALHA | FINALIZADA
│   ├── ports/
│   │   ├── IBatalhaIntegracao.ts    # Contrato de saída para comunicação com o módulo de Batalhas
│   │   └── IPartidaRepository.ts    # Contrato de saída para persistência de partidas
│   └── services/
│       └── GestaoPartidaService.ts  # Criação de partida, registro de resultado e consulta de histórico/pontuação
├── infra/
│   ├── database/
│   │   └── PrismaConnection.ts                # Instância do PrismaClient
│   ├── integrations/
│   │   ├── BatalhaHttpClient.ts     # Adaptador HTTP real para o serviço de Batalhas
│   │   └── BatalhaMockIntegracao.ts # Adaptador Mock que simula a batalha e envia o desfecho automaticamente
│   └── repositories/
│       └── PrismaPartidaRepository.ts
├── http/
│   ├── controllers/
│   │   └── PartidaController.ts
│   └── routes/
│       └── partidaRoutes.ts
├── container.ts                     # Composição e injeção de dependências
├── swagger.ts                       # Especificação OpenAPI 3.0
└── server.ts                        # Inicialização do servidor Express
```

### Fluxo de Funcionamento
1. **Entrada na Fila (`FilaMatchmaking`):** Jogadores entram na fila buscando partida. Quando dois jogadores disponíveis formam um par, o `FilaMatchmaking` solicita a criação da `Partida` ao `GestaoPartidaService` e envia os jogadores para o serviço de Batalhas através da porta `IBatalhaIntegracao`.
2. **Persistência Condicional:** A partida só é gravada como `EM_BATALHA` no banco de dados após o aceite do serviço de Batalhas. Caso o serviço externo esteja indisponível, os jogadores retornam ao início da fila.
3. **Registro de Resultado (`Partida.registrarResultado`):** Quando a batalha termina, o serviço de Batalhas envia o desfecho para o endpoint de resultado. O `GestaoPartidaService` carrega a `Partida`, aciona o método de domínio `partida.registrarResultado(...)` — que preenche vencedor, perdedor, pontuações e detalhes e altera o status para `FINALIZADA` — e atualiza o registro no PostgreSQL.

---

## Pré-requisitos

- **Node.js** v18+ e **npm**
- **Docker** e **Docker Compose** (para o banco de dados PostgreSQL local)

---

## Passo a Passo de Instalação e Execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Conteúdo padrão do `.env`:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gerenciador_partidas?schema=public"
BATALHA_API_URL="http://localhost:3001"
BATALHA_ENDPOINT_INICIAR="/batalhas"
CALLBACK_RESULTADO_URL="http://localhost:3000/partidas/resultado"
USE_MOCK_BATALHA=true
MOCK_BATALHA_DELAY_MS=3000
```

#### Alternando entre Modo Mock e Integração Real com Batalhas

- **Modo Mock (`USE_MOCK_BATALHA=true`):**
  Ideal para testar e demonstrar o Gerenciador de Partidas de forma independente sem precisar que o servidor do grupo de Batalhas esteja rodando. Ao formar um par na fila, o `BatalhaMockIntegracao` aceita a batalha imediatamente e, após `MOCK_BATALHA_DELAY_MS` (padrão: 3 segundos), sorteia o resultado e envia automaticamente um `POST` para `CALLBACK_RESULTADO_URL` (`/partidas/resultado`), finalizando a partida no banco.
- **Modo Integração Real (`USE_MOCK_BATALHA=false`):**
  Utiliza o `BatalhaHttpClient`, que envia uma requisição `POST` real para `${BATALHA_API_URL}${BATALHA_ENDPOINT_INICIAR}` com o payload `{ idPartida, idJogador1, idJogador2, callbackUrl }` e aguarda que o serviço externo de Batalhas chame `POST /partidas/resultado` ao término do confronto.

### 3. Subir o banco de dados PostgreSQL via Docker

```bash
docker-compose up -d
```

### 4. Executar as migrations e gerar o Prisma Client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Iniciar o servidor

Em modo de desenvolvimento (com hot-reload):

```bash
npm run dev
```

Ou para build e execução em produção:

```bash
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3000`.

### Documentação Interativa (Swagger UI)

Com o servidor rodando, acesse no navegador:

- **Swagger UI:** `http://localhost:3000/docs`
- **Health Check:** `http://localhost:3000/health`

---

## Endpoints e Exemplos de Uso (`curl`)

### 1. Entrar na fila de matchmaking

**Requisição — Primeiro jogador (`POST /partidas/fila`):**

```bash
curl -X POST http://localhost:3000/partidas/fila \
  -H "Content-Type: application/json" \
  -d '{"idJogador": "jogador-1"}'
```

**Resposta (`202 Accepted`):**
```json
{
  "mensagem": "Aguardando adversario."
}
```

**Requisição — Segundo jogador (`POST /partidas/fila`):**

```bash
curl -X POST http://localhost:3000/partidas/fila \
  -H "Content-Type: application/json" \
  -d '{"idJogador": "jogador-2"}'
```

**Resposta (`201 Created` — Par formado e partida despachada):**
```json
{
  "id": "e4c8a9c0-1234-4a5b-9c8d-112233445566",
  "idJogador1": "jogador-1",
  "idJogador2": "jogador-2",
  "dataCriacao": "2026-11-18T19:30:00.000Z",
  "status": "EM_BATALHA",
  "idVencedor": null,
  "idPerdedor": null,
  "pontuacaoJogador1": null,
  "pontuacaoJogador2": null,
  "detalhes": null
}
```

### 2. Consultar fila atual (`GET /partidas/fila`)

```bash
curl http://localhost:3000/partidas/fila
```

**Resposta (`200 OK`):**
```json
{
  "fila": []
}
```

### 3. Registrar resultado da batalha (`POST /partidas/resultado`)

Endpoint chamado pelo serviço de Batalhas (ou automaticamente pelo modo Mock após 3 segundos) para informar o desfecho da partida. Também aceita `POST /partidas/:id/resultado`.

```bash
curl -X POST http://localhost:3000/partidas/resultado \
  -H "Content-Type: application/json" \
  -d '{
    "idPartida": "e4c8a9c0-1234-4a5b-9c8d-112233445566",
    "idVencedor": "jogador-1",
    "idPerdedor": "jogador-2",
    "pontuacaoJogador1": 85,
    "pontuacaoJogador2": 40,
    "detalhes": "Vitoria por nocaute no 3o turno"
  }'
```

**Resposta (`200 OK`):**
```json
{
  "id": "e4c8a9c0-1234-4a5b-9c8d-112233445566",
  "idJogador1": "jogador-1",
  "idJogador2": "jogador-2",
  "dataCriacao": "2026-11-18T19:30:00.000Z",
  "status": "FINALIZADA",
  "idVencedor": "jogador-1",
  "idPerdedor": "jogador-2",
  "pontuacaoJogador1": 85,
  "pontuacaoJogador2": 40,
  "detalhes": "Vitoria por nocaute no 3o turno"
}
```

### 4. Consultar histórico de partidas de um jogador (`GET /partidas/historico/:jogadorId`)

Também disponível em `GET /jogadores/:idJogador/partidas`.

```bash
curl http://localhost:3000/partidas/historico/jogador-1
```

**Resposta (`200 OK`):**
```json
[
  {
    "id": "e4c8a9c0-1234-4a5b-9c8d-112233445566",
    "idJogador1": "jogador-1",
    "idJogador2": "jogador-2",
    "dataCriacao": "2026-11-18T19:30:00.000Z",
    "status": "FINALIZADA",
    "idVencedor": "jogador-1",
    "idPerdedor": "jogador-2",
    "pontuacaoJogador1": 85,
    "pontuacaoJogador2": 40,
    "detalhes": "Vitoria por nocaute no 3o turno"
  }
]
```

### 5. Consultar estatísticas e pontuação do jogador (`GET /jogadores/:idJogador/pontuacao`)

```bash
curl http://localhost:3000/jogadores/jogador-1/pontuacao
```

**Resposta (`200 OK`):**
```json
{
  "idJogador": "jogador-1",
  "partidasJogadas": 1,
  "vitorias": 1,
  "derrotas": 0,
  "pontos": 3
}
```
## Design Patterns

Esta seção descreve os padrões de projeto usados no código, onde cada um está e por que foi escolhido.

### Singleton: conexão com o banco

**Onde:** `PrismaConnection`, usada pelo `PrismaPartidaRepository`.

**Por quê:** cada `PrismaClient` abre o seu próprio pool de conexões. Se alguém crias-se uma nova instância por engano em outro ponto do código, o sistema poderia esgotar as conexões do PostgreSQL.

**Como funciona:** o construtor é privado e o acesso é feito por `PrismaConnection.getClient()`. A instância é criada na primeira chamada (criação preguiçosa) e reaproveitada nas seguintes.

### Strategy: regra de pareamento

**Onde:** `IMatchmakingStrategy` e `Duelo1v1Strategy`, usadas pela `FilaMatchmaking`.

**Por quê:** antes, a regra "pega os dois primeiros da fila" estava escrita dentro da `FilaMatchmaking`. Qualquer regra nova (por ranking, por tempo de espera, 2v2) exigiria editar essa classe, o que viola o princípio Aberto/Fechado do SOLID.

**Como funciona:** a fila só gerencia a lista de jogadores. Quem decide quem se enfrenta é a estratégia, pelo método `formarPar(fila)`, que devolve o par escolhido ou `null` se ainda não dá para formar. A implementação atual, `Duelo1v1Strategy`, pareia os dois jogadores há mais tempo na fila (FIFO).

**Como estender:** crie uma classe que implemente `IMatchmakingStrategy` e passe-a ao `FilaMatchmaking` no `container.ts`. Nenhuma outra classe precisa mudar.

### Strategy: regra de pontuação

**Onde:** `IRegraPontuacao` e `PontuacaoPorVitoriaRegra`, usadas pelo `GestaoPartidaService`.

**Por quê:** o cálculo `vitórias × 3` estava fixo em `consultarPontuacao`, misturado com a consulta de histórico. Mudar a regra (bônus, penalidade por derrota, pontuação por desempenho) obrigaria a alterar o serviço.

**Como funciona:** o serviço recebe uma `IRegraPontuacao` no construtor e delega o cálculo a ela. A regra atual, `PontuacaoPorVitoriaRegra`, dá 3 pontos por vitória e nenhum por derrota. O valor é configurável no construtor.

### Decorator: resiliência da integração com Batalhas

**Onde:** `TimeoutBatalhaDecorator`, `RetryBatalhaDecorator` e `LogBatalhaDecorator`, todos implementando `IBatalhaIntegracao`.

**Por quê:** o `BatalhaHttpClient` fazia um `fetch` sem limite de tempo: se o serviço de Batalhas travasse, a requisição do jogador ficava pendurada. Também não havia nova tentativa em falhas passageiras nem registro das chamadas. Colocar tudo isso dentro do cliente HTTP misturaria responsabilidades.

**Como funciona:** cada decorator recebe outro `IBatalhaIntegracao`, adiciona um comportamento e delega a chamada. Eles são empilhados no `container.ts` nesta ordem, de dentro para fora:

```
BatalhaHttpClient → Timeout → Log → Retry
```

| Camada | Responsabilidade |
|---|---|
| `Timeout` | Cancela cada tentativa que passar de `BATALHA_TIMEOUT_MS` (via `AbortSignal`) |
| `Log` | Registra início, sucesso ou falha e a duração de cada tentativa |
| `Retry` | Repete falhas transitórias até `BATALHA_MAX_TENTATIVAS`, com espera que dobra a cada tentativa a partir de `BATALHA_RETRY_DELAY_MS` |

**Quais falhas são repetidas:** o `BatalhaHttpClient` lança `ErroIntegracaoBatalha` com a flag `retentavel`. Erros de rede, timeout e HTTP 408, 429 e 5xx são repetidos. Erros definitivos (outros 4xx, como 400) e erros inesperados são propagados imediatamente.

**Observações:**
- Os decorators só são usados no modo real. Com `USE_MOCK_BATALHA=true` o mock é usado direto, pois não há rede para falhar.
- Como o `POST` pode ser reenviado, o serviço de Batalhas deve tratar `idPartida` como chave de idempotência, para não criar duas batalhas para a mesma partida.

### Padrões que já existiam na arquitetura

| Pattern | Onde | Papel |
|---|---|---|
| Repository | `IPartidaRepository` e `PrismaPartidaRepository` | Isola a persistência do domínio |
| Adapter (Ports & Adapters) | `IBatalhaIntegracao`, `BatalhaHttpClient` e `BatalhaMockIntegracao` | Isola o serviço externo de Batalhas e permite trocar a implementação |
| Injeção de dependência | `container.ts` | Monta e conecta todas as peças em um único lugar |