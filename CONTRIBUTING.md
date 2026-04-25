# Guia de Desenvolvimento

## Estrutura do Projeto

```
src/
├── commands/          # Comandos slash Discord
├── events/            # Listeners de eventos
├── services/          # Lógica de negócio
├── utils/             # Utilitários (embeds, etc)
├── types/             # Definições TypeScript
├── db/                # Conexão com banco
└── index.ts           # Arquivo principal
```

## Adicionando Novos Comandos

### 1. Criar arquivo em `src/commands/`

```typescript
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const meuComando = {
  data: new SlashCommandBuilder()
    .setName('meu-comando')
    .setDescription('Descrição do comando')
    .addStringOption(option =>
      option
        .setName('opcao')
        .setDescription('Descrição')
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction) {
    const valor = interaction.options.getString('opcao', true);
    
    await interaction.reply({
      content: `Você digitou: ${valor}`,
      ephemeral: true,
    });
  },
};
```

### 2. Registrar em `src/commands/index.ts`

```typescript
import { meuComando } from './meuComando.js';

export const commands = [
  // ... outros
  meuComando,
];
```

## Adicionando Novos Eventos

### 1. Criar arquivo em `src/events/`

```typescript
export const meuEvento = {
  name: 'nomeDoEvento',
  once: false, // true para executar uma única vez
  async execute(arg1, arg2) {
    console.log('Evento disparado!');
  },
};
```

### 2. Registrar em `src/events/index.ts`

```typescript
import { meuEvento } from './meuEvento.js';

export const events = [
  // ... outros
  meuEvento,
];
```

## Trabalhando com Banco de Dados

### 1. Modificar schema

Edite `prisma/schema.prisma`:

```prisma
model MinhaTabela {
  id    String @id @default(cuid())
  nome  String
  createdAt DateTime @default(now())
}
```

### 2. Migrar

```bash
npm run db:push
```

### 3. Usar em código

```typescript
import { prisma } from '../db/prisma.js';

// Criar
const user = await prisma.minhaTabela.create({
  data: { nome: 'João' }
});

// Ler
const users = await prisma.minhaTabela.findMany();

// Atualizar
await prisma.minhaTabela.update({
  where: { id: '1' },
  data: { nome: 'Pedro' }
});

// Deletar
await prisma.minhaTabela.delete({
  where: { id: '1' }
});
```

## Criando Novos Serviços

Serviços encapsulam lógica de negócio. Exemplo:

```typescript
// src/services/meuService.ts
import { prisma } from '../db/prisma.js';

export class MeuService {
  static async fazerAlgo(param: string) {
    // Lógica aqui
    return resultado;
  }
}
```

## Embeds Customizados

Adicione em `src/utils/embeds.ts`:

```typescript
export class EmbedUtils {
  static meuEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('Título')
      .setDescription('Descrição')
      .addFields(
        { name: 'Campo 1', value: 'Valor 1', inline: true },
        { name: 'Campo 2', value: 'Valor 2', inline: true }
      )
      .setTimestamp();
  }
}
```

## Tipos TypeScript

Adicione em `src/types/index.ts`:

```typescript
export interface MinhaInterface {
  id: string;
  nome: string;
  ativo: boolean;
}
```

## Boas Práticas

### ✅ Faça
- Use `try/catch` em operações assíncronas
- Valide entradas do usuário
- Sempre responda interações
- Use embeds para mensagens públicas
- Respostas ephemeral (hidden) para erros
- Commits com mensagens descritivas
- Código com tipos TypeScript completos

### ❌ Não Faça
- Não deixe promises sem await
- Não exponha tokens em logs
- Não faça queries muito grandes
- Não responda mensagens sem ephemeral quando privado
- Não commite `.env`
- Não use `any` em TypeScript

## Testing

### Testar Comando Localmente

```bash
npm run dev
```

Depois use o comando no Discord.

### Testar Serviço

```typescript
// arquivo-teste.ts
import { MeuService } from './services/meuService.js';

const resultado = await MeuService.fazerAlgo('param');
console.log(resultado);
```

## Debugging

### Logs
```typescript
console.log('Informação:', dado);
console.error('Erro:', erro);
```

### Debugger Node.js
```bash
node --inspect dist/index.js
```

Depois abra `chrome://inspect`

### Database Studio
```bash
npm run db:studio
```

## Performance

### Otimizações
- Cache de dados frequentes
- Use índices no banco
- Batch operações quando possível
- Lazy load de dependências

### Monitoramento
```typescript
console.time('operacao');
// código
console.timeEnd('operacao');
```

## Padrões de Código

### Nomeação
- Comandos: `kebab-case` (my-command)
- Funções: `camelCase` (myFunction)
- Classes: `PascalCase` (MyClass)
- Constantes: `UPPER_SNAKE_CASE` (MY_CONSTANT)

### Estrutura
```typescript
// Imports
import { Algo } from 'lib.js';

// Exports
export const meuItem = { ... };

// Interfaces/Types
interface Algo { }

// Implementação
class MeuClass { }
```

## Versionamento

Use [Semantic Versioning](https://semver.org/):
- MAJOR: mudanças incompatíveis (1.0.0)
- MINOR: novas funcionalidades (0.1.0)
- PATCH: correções (0.0.1)

Atualize em `package.json`

## Commits

Formato:
```
tipo: descrição curta

Descrição detalhada se necessário
```

Tipos:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `perf`: Performance
- `test`: Testes

Exemplos:
```
feat: add map pool management

fix: queue embed not updating

docs: add balance algorithm explanation
```

## Environment Variables

Adicione em `.env.example` e documente:

```env
# Descrição da variável
NOVA_VAR=valor_padrao
```

## Atualizando Dependências

```bash
npm update

# ou específico
npm install discord.js@latest
```

Sempre teste após atualizar!

## Submissão de Melhorias

1. Fork repositório
2. Crie branch: `git checkout -b feature/nome`
3. Commit mudanças: `git commit -am 'feat: descrição'`
4. Push: `git push origin feature/nome`
5. Abra Pull Request

---

**Dúvidas?** Consulte a documentação ou abra uma issue!
