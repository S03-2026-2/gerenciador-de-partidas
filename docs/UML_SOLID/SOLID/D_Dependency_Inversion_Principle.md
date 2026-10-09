# Princípio da Inversão de Dependência (DIP)

O **Dependency Inversion Principle (DIP)** afirma que:

1. módulos de alto nível não devem depender diretamente de módulos de baixo
   nível; ambos devem depender de abstrações;
2. abstrações não devem depender de detalhes; detalhes devem depender de
   abstrações.

No modelo atualizado, `PartidaService` contém a orquestração dos casos de uso,
enquanto persistência e comunicação externa são acessadas por interfaces.

## Dependências do `PartidaService`

```mermaid
classDiagram
    class PartidaService {
        -partidaRepo: IPartidaRepository
        -jogadorRepo: IJogadorRepository
        -batalhaGateway: IBatalhaGateway
        +criarPartida(jogadores: List~Jogador~): Partida
        +iniciarPartida(partidaId: String)
        +processarResultadoBatalha(dto: ResultadoBatalhaDTO)
        +cancelarPartida(partidaId: String, motivo: String)
    }
    class IPartidaRepository {
        <<interface>>
        +salvar(partida: Partida)
        +buscarPorId(id: String): Partida
        +buscarPorJogador(jogadorId: String): List~Partida~
    }
    class IJogadorRepository {
        <<interface>>
        +buscarPorId(id: String): Jogador
        +atualizar(jogador: Jogador)
    }
    class IBatalhaGateway {
        <<interface>>
        +enviarParaBatalha(dados: RequisicaoBatalhaDTO)
    }
    class Partida
    class Jogador
    class ResultadoBatalhaDTO
    class RequisicaoBatalhaDTO
    PartidaService ..> IPartidaRepository : depende da abstração
    PartidaService ..> IJogadorRepository : depende da abstração
    PartidaService ..> IBatalhaGateway : depende da abstração
    PartidaService ..> Partida
    PartidaService ..> Jogador
    PartidaService ..> ResultadoBatalhaDTO
    PartidaService ..> RequisicaoBatalhaDTO
```

O serviço não precisa saber se as interfaces são implementadas por banco
relacional, armazenamento em memória ou um mock. Também não precisa conhecer
como o gateway conversa com o sistema externo de batalhas.

## Consulta de partidas

O mesmo princípio aparece em `ConsultaPartidaService`:

```mermaid
classDiagram
    class ConsultaPartidaService {
        -partidaRepo: IPartidaRepository
        +buscarPorId(partidaId: String): Partida
        +listarPorJogador(jogadorId: String): List~Partida~
        +listarPorStatus(status: String): List~Partida~
    }
    class IPartidaRepository {
        <<interface>>
        +buscarPorId(id: String): Partida
        +buscarPorJogador(jogadorId: String): List~Partida~
    }
    class PartidaRepositoryConcreto {
        +buscarPorId(id: String): Partida
        +buscarPorJogador(jogadorId: String): List~Partida~
    }
    ConsultaPartidaService --> IPartidaRepository : recebe por injeção
    PartidaRepositoryConcreto ..|> IPartidaRepository
```

`PartidaRepositoryConcreto` representa um adaptador de infraestrutura, não uma
dependência que o serviço deve criar diretamente. Em produção pode acessar um
banco; nos testes, pode ser substituído por uma implementação em memória.

## Relação com o diagrama inicial

No diagrama inicial, `GestaoPartidas` se comunicava diretamente com
`SistemaBatalhas` e administrava as coleções de partidas e jogadores. No
modelo atualizado, os casos de uso dependem de contratos (`IPartidaRepository`,
`IJogadorRepository` e `IBatalhaGateway`), mantendo os detalhes externos fora
da regra de negócio.

## Benefícios

O DIP facilita testes unitários, permite trocar tecnologias de persistência e
integração e protege as regras de negócio contra detalhes externos. Ele também
torna explícito, no diagrama, quais contratos cada serviço realmente precisa.
