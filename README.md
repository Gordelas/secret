# Secret Manager

Este projeto é um bot de gerenciamento de contas do [REDACTED]. Ele facilita o processo de verificação de `rents` ([REDACTED] alugados) e `claim` de tarefas automaticamente para contas múltiplas. É especialmente útil para pessoas que gerenciam várias contas.

## Funcionalidades
- **Auto-Claim de Tarefas**: Automatiza a coleta de recompensas das contas do [REDACTED].
- **Verificação de Rents**: Verifica se uma conta tem a quantidade correta de [REDACTED].
- **Envio de Webhooks para Discord**: Envia notificações sobre o status da verificação diretamente para um canal do Discord.
- **Opções de Verificação Específica**: Permite verificar uma conta específica pelo endereço da carteira.
- **Loop de Verificação de Rents**: Verifica os rents em intervalos configuráveis.



---



## Instruções de Uso

### Requisitos

Antes de começar, certifique-se de ter o seguinte instalado:
- [Node.js](https://nodejs.org/en/download/) (versão 16 ou superior)
- NPM (Node Package Manager) / NPX

### Como Configurar

1. **Clone este repositório**:
   ```bash
   git clone https://github.com/seu-usuario/nome-do-repositorio.git
   cd nome-do-repositorio
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure os arquivos JSON:

- **accounts.json:** Insira as informações das contas do [REDACTED], incluindo accountName, accountWallet, accessToken, e refreshToken.
- **config.json:** Insira as configurações como ``rentsDelayBetweenAccountsMilliseconds``, ``claimDelayBetweenAccountsMilliseconds``, e o link do webhook do Discord.

O arquivo ``accounts.json`` armazena as informações de múltiplas contas que serão gerenciadas pelo bot.
   ```json
    {
        "Axie": [
            {
                "accountName": "Account 1",
                "accountWallet": "0x0000000000000000000000000000000000000000",
                "accessToken": "seuAccessToken",
                "refreshToken": "seuRefreshToken"
            },
            {
                "accountName": "Account 2",
                "accountWallet": "0x0000000000000000000000000000000000000000",
                "accessToken": "seuAccessToken",
                "refreshToken": "seuRefreshToken"
            }
        ]
    }
   ```

O arquivo ``config.json`` armazena as configurações gerais, incluindo tempos de espera entre requisições e o webhook do Discord para envio de notificações.

```json
{
    "rentsDelayBetweenAccountsMilliseconds": "3000",
    "claimDelayBetweenAccountsMilliseconds": "15000",
    "discordWebhook": "https://discord.com/api/webhooks/seu_webhook_aqui"
}
```

---

### Como Obter o accessToken e refreshToken para suas contas
1. Abra o site do [REDACTED] no navegador.
2. Pressione F12 para abrir as Ferramentas de Desenvolvedor.
3. Vá para a aba "Console".
4. Cole o código abaixo e pressione Enter:

  ```javascript
  // pegar carteira, accessToken e refreshToken
  var AxieInventoryStringJson = localStorage.getItem("AxieInventory");
  var AxieAccessToken = localStorage.getItem("accessToken");
  var AxieRefreshToken = localStorage.getItem("refreshToken");
  var StringParser = JSON.parse(AxieInventoryStringJson);
  
  var JSON_output = 
  {
      "accountName": "",
      "accountWallet": `${StringParser.state.queryOptions.owner}`,
      "accessToken": `${AxieAccessToken}`,
      "refreshToken": `${AxieRefreshToken}`
  };
  
  copy(JSON_output);
  ```

5. O accessToken e refreshToken serão copiados para a sua área de transferência.

--

### Como Usar
Após a configuração dos arquivos ``accounts.json`` e ``config.json``, você pode rodar o bot:

1. Rodar o Bot:
    ```bash
    node index.js
    ```
2. Escolha a operação desejada no menu:
	- **1**: Verificar Rents.
	- **2**: Claimar Quests.
	- **3**: Verificar Rent Específico.
	- **4**: Loop de Verificação de Rents.
	- **5**: Sair.


---
