const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readlineSync = require('readline-sync');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const chalk = require('chalk');

const accountsPath = path.join('configs', 'accounts.json');
const configPath = path.join('configs', 'config.json');

let Accounts, config;

try {
    Accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error(`[ERROR] Não foi possível carregar o arquivo JSON: ${error.message}`);
    process.exit(1);
}

function sendWebhook(WebhookContent, AccountName, AccountWallet) {
    try {
        const hook = new Webhook(config.discordWebhook);
    
        const embed = new MessageBuilder()
            .setTitle('Inventario')
            .setAuthor(`${AccountName} - ${AccountWallet}`)
            .setURL('https://app.axieinfinity.com/profile/inventory/axies/')
            .setColor('#d63e33')
            .setDescription(WebhookContent)
            .setTimestamp();
    
        hook.send(embed);
    } catch (error){
        console.log(chalk.red.bold(`[ERROR]`) + ` Ocorreu um erro ao tentar enviar a webhook (${AccountName} - ${AccountWallet})`, error);
    }
}

async function claimWin1ClassicBattle(AccessToken, AccountName) {
    try {
        let data = JSON.stringify({
            query: `mutation VerifyQuest($questType: QuestType!, $variant: String!) {
                verifyQuest(questType: $questType, variant: $variant) {
                questId: title
                type
                title
                status
                tier
                category
                slot
                rerollTimes
                points
                mAxsReward
                board
                iconUrl
                variant {
                    id
                    labels
                    __typename
                }
                __typename
                }
            }`,
            variables: {"questType":"Win1ClassicBattle","variant":"0"}
        });
          
          
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://graphql-gateway.axieinfinity.com/graphql',
            headers: { 
                'accept': '*/*', 
                'accept-language': 'en-US,en;q=0.9', 
                'authorization': `Bearer ${AccessToken}`, 
                'content-type': 'application/json', 
                'origin': 'https://app.axieinfinity.com', 
                'priority': 'u=1, i', 
                'referer': 'https://app.axieinfinity.com/', 
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"', 
                'sec-ch-ua-mobile': '?0', 
                'sec-ch-ua-platform': '"Windows"', 
                'sec-fetch-dest': 'empty', 
                'sec-fetch-mode': 'cors', 
                'sec-fetch-site': 'same-site', 
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
            },
            data : data
        };

        const response = await axios.post('https://graphql-gateway.axieinfinity.com/graphql', data, config);

        if (!response.data.data) {
            console.log(chalk.yellow(`[INFO]`) + ` ${AccountName} > Erro ao claimar a quest. A quest já pode ter sido claimada.`);
            return;
        }

        console.log(chalk.green(`[SUCCESS]`) + ` ${AccountName} > Quest: ${response.data.data.verifyQuest.title} - Status: ${response.data.data.verifyQuest.status}`);
    } catch (error) {
        handleRequestError(error, AccountName, "Win 1 Classic Battle");
    }
}

async function claimWin1OriginsBattle(AccessToken, AccountName) {
    try {
        let data = JSON.stringify({
            query: `mutation VerifyQuest($questType: QuestType!, $variant: String!) {
                verifyQuest(questType: $questType, variant: $variant) {
                    questId: title
                    type
                    title
                    status
                    tier
                    category
                    slot
                    rerollTimes
                    points
                    mAxsReward
                    board
                    iconUrl
                    variant {
                        id
                        labels
                        __typename
                    }
                    __typename
                }
            }`,
            variables: {"questType":"Win1OriginsBattle","variant":"0"}
        });
          
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://graphql-gateway.axieinfinity.com/graphql',
            headers: { 
                'accept': '*/*', 
                'accept-language': 'en-US,en;q=0.9', 
                'authorization': `Bearer ${AccessToken}`, 
                'content-type': 'application/json', 
                'origin': 'https://app.axieinfinity.com', 
                'priority': 'u=1, i', 
                'referer': 'https://app.axieinfinity.com/', 
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"', 
                'sec-ch-ua-mobile': '?0', 
                'sec-ch-ua-platform': '"Windows"', 
                'sec-fetch-dest': 'empty', 
                'sec-fetch-mode': 'cors', 
                'sec-fetch-site': 'same-site', 
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
            },
            data : data
        };

        const response = await axios.post('https://graphql-gateway.axieinfinity.com/graphql', data, config);

        if (!response.data.data) {
            console.log(chalk.yellow(`[INFO]`) + ` ${AccountName} > Erro ao claimar a quest. A quest já pode ter sido claimada.`);
            return;
        }

        console.log(chalk.green(`[SUCCESS]`) + ` ${AccountName} > Quest: ${response.data.data.verifyQuest.title} - Status: ${response.data.data.verifyQuest.status}`);
    } catch (error) {
        handleRequestError(error, AccountName, "Win 1 Origins Battle");
    }
}

async function GetTotalOwnedAxiesByUser(AccountWallet, AccountName) {
    try {
        let data = JSON.stringify({
            "operationName": "GetTotalOwnedAxiesByUser",
            "variables": {
                "owner": `${AccountWallet}`
            },
            "query": "query GetTotalOwnedAxiesByUser($owner: String) {\n  axies(owner: $owner) {\n    total\n    __typename\n  }\n}\n"
        });
        
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://graphql-gateway.axieinfinity.com/graphql',
            headers: { 
                'Host': 'graphql-gateway.axieinfinity.com', 
                'sec-ch-ua-platform': '"Windows"', 
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', 
                'accept': '*/*', 
                'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"', 
                'content-type': 'application/json', 
                'sec-ch-ua-mobile': '?0', 
                'origin': 'https://app.axieinfinity.com', 
                'sec-fetch-site': 'same-site', 
                'sec-fetch-mode': 'cors', 
                'sec-fetch-dest': 'empty', 
                'referer': 'https://app.axieinfinity.com/', 
                'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7', 
                'priority': 'u=1, i', 
                'pragma': 'no-cache', 
                'cache-control': 'no-cache'
            },
            data : data
        };

        const response = await axios.post('https://graphql-gateway.axieinfinity.com/graphql', data, config);
        const TotalAxies = response.data.data.axies.total;

        if (TotalAxies < 3) {
            sendWebhook(`Detectamos apenas ${TotalAxies} Axies na conta ${AccountName}`, AccountName, AccountWallet);
            console.log(chalk.red(`[RENTS]`) + ` ${AccountName} - Total: ${TotalAxies}`);
        } else {
            console.log(chalk.green(`[RENTS]`) + ` ${AccountName} - Total: ${TotalAxies}`);
        }
    } catch (error) {
        handleRequestError(error, AccountName, "verificação de Axies");
    }
}

async function verifyRents() {
    for (const account of Accounts.Axie) {
        console.log(`\nVerificando rents: ${account.accountName}`);
        await GetTotalOwnedAxiesByUser(account.accountWallet, account.accountName);
        await delay(config.rentsDelayBetweenAccountsMilliseconds);
    }
}

async function verifySpecificRent(wallet) {
    const account = Accounts.Axie.find(acc => acc.accountWallet === wallet);
    if (!account) {
        console.log("Essa carteira não está nas suas configurações");

        console.log(`\nVerificando rent específico: ${wallet}`);
        await GetTotalOwnedAxiesByUser(wallet, `Wallet - ${wallet}`);

        return;
    }

    console.log(`\nVerificando rent específico: ${account.accountName}`);
    await GetTotalOwnedAxiesByUser(account.accountWallet, account.accountName);
}

async function loopVerifyRents(intervalMinutes) {
    if (intervalMinutes < 30) {
        console.log("O intervalo deve ser de no mínimo 30 minutos.");
        return;
    }
    while (true) {
        await verifyRents();
        console.log(`Aguardando ${intervalMinutes} minutos até a próxima verificação...`);
        await delay(intervalMinutes * 60000);
    }
}

async function claimQuests() {
    for (const account of Accounts.Axie) {
        console.log(`\nClaimando quests: ${account.accountName}`);
        await claimWin1ClassicBattle(account.accessToken, account.accountName);
        await claimWin1OriginsBattle(account.accessToken, account.accountName);
        await delay(config.claimDelayBetweenAccountsMilliseconds);
    }
}

function handleRequestError(error, accountName, action) {
    if (error.response) {
        console.log(chalk.red.bold(`[ERROR]`) + ` Falha ao realizar ${action} para ${accountName}: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
        console.log(chalk.red.bold(`[ERROR]`) + ` Nenhuma resposta recebida ao tentar realizar ${action} para ${accountName}`);
    } else {
        console.log(chalk.red.bold(`[ERROR]`) + ` Erro ao configurar o request para ${action} na conta ${accountName}:`, error.message);
    }
}

(function initializer() {
    console.clear();
    console.log(chalk.blue.bold(`Digite o número da operação que você deseja fazer:`) + chalk.white.bold(`\n\n    1. Verificar rents\n    2. Claimar quests\n    3. Verificar rent específico\n    4. Loop de verificação de rents\n    5. Sair\n`));
    const operation = readlineSync.questionInt(chalk.underline.white('ESCOLHA:') + ' ');

    switch (operation) {
        case 1:
            verifyRents();
            break;
        case 2:
            claimQuests();
            break;
        case 3:
            const wallet = readlineSync.question(chalk.cyan('Digite a carteira: '));
            verifySpecificRent(wallet);
            break;
        case 4:
            const interval = readlineSync.questionInt(chalk.cyan('Digite o intervalo em minutos (minimo 30 minutos): '));
            loopVerifyRents(interval);
            break;
        case 5:
            console.log(chalk.yellow.bold("Saindo..."));
            break;
        default:
            console.log(chalk.red.bold("Operação não encontrada."));
    }
})();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}