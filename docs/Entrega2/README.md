# Entrega 2 — Arquitetura do Módulo de Gestão de Partidas

Este documento apresenta a versão consolidada da arquitetura do módulo de **Gestão de Partidas**, refletindo os ajustes de escopo e os feedbacks obtidos na primeira etapa.

---

## 1. Escopo do Módulo
O módulo é responsável exclusivamente pelo ciclo de pareamento e persistência das partidas:
1. Receber o identificador de jogadores que buscam uma partida.
2. Formar pares de jogadores elegíveis (matchmaking).
3. Notificar o **Sistema de Batalhas** com os identificadores dos competidores para que o confronto ocorra.
4. Receber o resultado final enviado pelo **Sistema de Batalhas**.
5. Persistir o histórico de partidas e resultados no banco de dados para consulta posterior.

---

## 2. Diagrama de Casos de Uso

![Diagrama de Casos de Uso](casos-de-uso-v2.png)

---

## 3. Diagrama de Classes

![Diagrama de Classes](diagrama-classes-v2.png)

---

## 4. Justificativa das Decisões Arquiteturais e Princípios SOLID

### Princípios Adotados
* **Responsabilidade Única (SRP):** A lógica de pareamento e manipulação de fila foi isolada na classe `FilaMatchmaking`, permitindo que o `GestaoPartidaService` atue estritamente como orquestrador do fluxo de negócio sem acumular controle de listas.
* **Inversão de Dependência (DIP):** Toda integração externa com serviços fora do nosso escopo é mediada por contratos abstratos:
  * `IBatalhaIntegracao`: desacopla a orquestração do serviço concreto do grupo de Batalhas.
  * `IPartidaRepository`: desacopla a regra de negócio da tecnologia de persistência no banco de dados.

### Decisões de Simplificação (YAGNI e Anti-Overengineering)
* **Substituição do Padrão State por Enum:** A gestão de ciclo de vida da partida foi simplificada com o enum `StatusPartida`, eliminando uma hierarquia desnecessária de classes de estado que aumentava a complexidade sem ganho prático.
* **Composição sobre Herança:** Optou-se por associar entidades diretamente (`Partida` compõe `ResultadoPartida` e referencia IDs de jogadores), dispensando estruturas de herança artificiais (LSP) e evitando o particionamento excessivo de interfaces (ISP).
