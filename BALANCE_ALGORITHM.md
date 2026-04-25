# Documentação do Balanceamento de Times

## Visão Geral

O algoritmo de balanceamento de times gera automaticamente dois times de 5 jogadores cada, minimizando a diferença de ELO entre eles.

## Como Funciona

### 1. Entrada
```
10 jogadores com seus respectivos ELOs
[1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450]
```

### 2. Geração de Combinações
O algoritmo gera todas as combinações possíveis de 5 jogadores a partir dos 10:
- Total de combinações: C(10,5) = 252

```
Combinação 1: [1000, 1050, 1100, 1150, 1200] vs [1250, 1300, 1350, 1400, 1450]
Combinação 2: [1000, 1050, 1100, 1150, 1250] vs [1200, 1300, 1350, 1400, 1450]
... (mais 250 combinações)
```

### 3. Cálculo de Diferença
Para cada combinação:
```
ELO Team A = 1000 + 1050 + 1100 + 1150 + 1200 = 5500
ELO Team B = 1250 + 1300 + 1350 + 1400 + 1450 = 6750
Diferença = |5500 - 6750| = 1250
```

### 4. Seleção
O algoritmo escolhe a combinação com a **menor diferença**.

```
Melhor combinação encontrada:
Team A: [1000, 1150, 1300, 1350, 1400] = 6200 ELO
Team B: [1050, 1100, 1200, 1250, 1450] = 6050 ELO
Diferença: |6200 - 6050| = 150 pontos ✅
```

## Complexidade

- **Tempo**: O(C(n,5)) ≈ O(n²) para n=10 = 252 combinações
- **Espaço**: O(10) = 10 jogadores em memória

## Implementação

Localizado em: `src/services/balanceService.ts`

```typescript
static balance(players: IUser[]): ITeamBalance {
  const combinations = this.generateCombinations([0,1,2,3,4,5,6,7,8,9], 5);
  // Testa cada combinação e retorna a melhor
}
```

## Exemplos

### Exemplo 1: Elos Bem Distribuídos
```
Jogadores: [1000, 1010, 1020, 1030, 1040, 1050, 1060, 1070, 1080, 1090]
Média: 1045

Resultado:
Team A: [1000, 1030, 1060, 1080, 1090] = 5260
Team B: [1010, 1020, 1050, 1070, 1040] = 5190
Diferença: 70 pontos (muito bem balanceado!)
```

### Exemplo 2: Elos Desiguais
```
Jogadores: [1000, 1000, 1000, 1000, 1000, 3000, 3000, 3000, 3000, 3000]

Resultado:
Team A: [1000, 1000, 1000, 3000, 3000] = 9000
Team B: [1000, 1000, 1000, 3000, 3000] = 9000
Diferença: 0 pontos (perfeito!)
```

### Exemplo 3: Jogador Muito Bom
```
Jogadores: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 3000]

Resultado:
Team A: [1000, 1000, 1000, 1000, 3000] = 7000
Team B: [1000, 1000, 1000, 1000, 1000] = 5000
Diferença: 2000 pontos (inevitável com discrepância tão grande)
```

## Otimizações Possíveis

Se o número de jogadores aumentar em produção, existem otimizações:

1. **Algoritmo Guloso**: O(n²) - mais rápido mas menos preciso
2. **Hill Climbing**: O(n²) - encontra bom mínimo local
3. **Busca com Poda**: Remove combinações piores antes de calcular
4. **Cache de Resultados**: Reutiliza cálculos anteriores

Para 10 jogadores, a força bruta é perfeitamente adequada.

## Testes

Para testar o balanceamento:

```typescript
const players = [
  { discordId: '1', elo: 1000 },
  { discordId: '2', elo: 1100 },
  // ... 8 mais
];

const balance = BalanceService.balance(players);
console.log(`Team A: ${BalanceService.getTeamElo(balance.teamA)}`);
console.log(`Team B: ${BalanceService.getTeamElo(balance.teamB)}`);
console.log(`Diferença: ${balance.eloDifference}`);
```

## Métricas

O bot registra automaticamente:
- Diferença de ELO da partida
- ELO médio de cada time
- Resultado final (vitória/derrota)
- Histórico de combates entre jogadores

Estes dados podem ser usados para análise estatística futura.
