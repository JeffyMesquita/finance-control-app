# Configuração do Sistema de Logging

## Sistema de Logging Compatível

O sistema de logging foi projetado para ser **100% compatível** entre servidor e cliente, usando console nativo aprimorado em todos os ambientes.

## Variáveis de Ambiente

### LOG_LEVEL

Define o nível de log a ser exibido:

- `debug`: Todos os logs (desenvolvimento)
- `info`: Informações, warnings e erros
- `warn`: Apenas warnings e erros
- `error`: Apenas erros

**Padrão**: `debug` em desenvolvimento, `info` em produção

### LOG_TO_FILE

Habilita/desabilita salvamento de logs em arquivos:

- `true`: Salva logs em arquivos
- `false`: Apenas console

**Padrão**: `true` em produção, `false` em desenvolvimento

### LOG_DIR

Diretório onde os arquivos de log serão salvos.

**Padrão**: `./logs`

## Exemplo de configuração (.env)

```bash
# Desenvolvimento
LOG_LEVEL=debug
LOG_TO_FILE=false
LOG_DIR=./logs

# Produção
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_DIR=/var/log/finance-app
```

## Formatos de Log

### Desenvolvimento

Logs coloridos com emoji e contexto expandido:

```
🔍 [2024-01-15T10:30:00.000Z] DEBUG: Carregando dados do usuário
{
  "component": "UserProfile",
  "userId": "user123"
}
```

### Produção (Servidor)

JSON estruturado para análise:

```json
{
  "level": "info",
  "message": "Transação criada",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userId": "user123",
  "action": "create_transaction"
}
```

### Cliente

Console aprimorado com contexto:

```
ℹ️ [2024-01-15T10:30:00.000Z] INFO: API Response recebida
```

## Funcionalidades

- ✅ **Performance tracking** com `logger.performance()`
- ✅ **User actions** com `logger.userAction()`
- ✅ **API monitoring** com `logger.apiCall()`
- ✅ **Logs estruturados** com `logger.structured()`
- ✅ **Hook React** com `useLogger(componentName)`
- ✅ **Decorator de funções** com `withLogging()`
- ✅ **Utilitários dev** com `dev.log()`, `dev.render()`, `dev.api()`

## Monitoramento

Em produção no cliente:

- Integração com **Vercel Analytics**
- Suporte ao **Sentry** para captura de erros
- Logs de performance automatizados

## Arquivos de Log Gerados

Em produção, são criados automaticamente:

- `app-YYYY-MM-DD.log`: Todos os logs
- `error-YYYY-MM-DD.log`: Apenas erros

Configuração de rotação:

- Logs gerais: 14 dias de retenção
- Logs de erro: 30 dias de retenção
- Tamanho máximo por arquivo: 20MB
