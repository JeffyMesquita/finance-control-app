# Configuração do Sistema de Logging

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

## Arquivos de Log Gerados

Em produção, são criados automaticamente:

- `app-YYYY-MM-DD.log`: Todos os logs
- `error-YYYY-MM-DD.log`: Apenas erros

Configuração de rotação:

- Logs gerais: 14 dias de retenção
- Logs de erro: 30 dias de retenção
- Tamanho máximo por arquivo: 20MB
