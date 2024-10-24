const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readlineSync = require('readline-sync');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const chalk = require('chalk');
const { exec } = require('child_process');

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

function abrirPerfil(profileName, sites) {
    const chromePath = config.chromePath;
    const command = `"${chromePath}" --profile-directory="${profileName}" ${sites.join(' ')}`;
    
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(chalk.red("[CHROME]") + chalk.bold(` Erro ao abrir ${profileName}: ${err}`));
            return;
        }
        console.log(chalk.green("[CHROME]") + chalk.white.bold(` ${profileName} iniciado com sucesso!`));
    });
}

function ordenarPorNumero(a, b) {
    const numA = parseInt(a.match(new RegExp(`${config.profilePrefix} (\\d+)`))[1]);
    const numB = parseInt(b.match(new RegExp(`${config.profilePrefix} (\\d+)`))[1]);
    return numA - numB;
}

function abrirPerfisComDelay(perfis, sites, delay) {
    let currentIndex = 0;

    const interval = setInterval(() => {
        if (currentIndex >= perfis.length) {
            clearInterval(interval);
            console.log(chalk.blue.bold('Todos os perfis foram abertos com sucesso!'));
            return;
        }

        const currentProfile = perfis[currentIndex];
        const profileNumber = currentProfile.split(' - ').pop(); 
        abrirPerfil(profileNumber, sites);
        currentIndex++;
    }, delay);
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
        writeLogs('./logs/errors', 'error', error);
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
        var OutputMessage;

        if (!response.data.data) {
            OutputMessage = ` ${AccountName} > Erro ao claimar a quest. A quest já pode ter sido claimada.`;

            console.log(chalk.yellow(`[INFO]`) + OutputMessage);
            return OutputMessage;
        }

        OutputMessage = ` ${AccountName} > Quest: ${response.data.data.verifyQuest.title} - Status: ${response.data.data.verifyQuest.status}`;

        console.log(chalk.green(`[SUCCESS]`) + OutputMessage);
        return OutputMessage;

    } catch (error) {
        handleRequestError(error, AccountName, "Win 1 Classic Battle");
        writeLogs('./logs/errors', 'error', error);
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
        var OutputMessage;

        if (!response.data.data) {
            OutputMessage = ` ${AccountName} > Erro ao claimar a quest. A quest já pode ter sido claimada.`;

            console.log(chalk.yellow(`[INFO]`) + OutputMessage);
            return OutputMessage;
        }

        OutputMessage = ` ${AccountName} > Quest: ${response.data.data.verifyQuest.title} - Status: ${response.data.data.verifyQuest.status}`;

        console.log(chalk.green(`[SUCCESS]`) + OutputMessage);

        return OutputMessage;
    } catch (error) {
        handleRequestError(error, AccountName, "Win 1 Origins Battle");
        writeLogs('./logs/errors', 'error', error);
    }
}

async function verifySpecificRent(Wallet) {
    try {
        const AccountName = Accounts.Axie.find(acc => acc.accountWallet === Wallet);

        let data = JSON.stringify({
            query: `query GetMyAxiesInventory($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String, $rep15Roles: [Rep15TokenUserRole!]) {
                    axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner, rep15Roles: $rep15Roles) {
                        total
                        results {
                            id
                            name
                            class
                            axpInfo {
                                level
                            }
                            parts {
                                name
                                class
                                type
                            }
                        }
                    }
                }`,
            variables: {
                auctionType: "All",
                from: 0,
                sort: "LevelDesc",
                size: 24,
                owner: `${Wallet}`,
                rep15Roles: ["Owner", "Delegatee"]
            }
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://graphql-gateway.axieinfinity.com/graphql',
            headers: { 
                'content-type': 'application/json', 
                'origin': 'https://app.axieinfinity.com',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
            },
            data: data
        };

        const response = await axios(config);
        let OutputMessage;

        // verifica se há dados disponíveis
        if (!response.data.data || !response.data.data.axies.results.length) {
            OutputMessage = `${AccountName?.accountName} > Nenhum Axie encontrado ou erro na resposta da API.`;
            console.log(chalk.yellow(`[INFO] `) + chalk.white(OutputMessage));
            return OutputMessage;
        }

        const axies = response.data.data.axies.results;
        console.log(chalk.green(`[SUCCESS]`) + ` Axies encontrados para ${AccountName?.accountName}: ${axies.length}`);
        
        axies.forEach(axie => {
            console.log(chalk.blueBright("Axie ID: ") + axie.id);
            console.log(chalk.blueBright("Nome: ") +  axie.name);
            console.log(chalk.blueBright("Classe: ") + axie.class);
            console.log(chalk.yellow("Nível: ") + axie.axpInfo.level);
            console.log(chalk.white.bold("Partes do Axie:"));

            axie.parts.forEach(part => {
                console.log(chalk.magentaBright("  - Parte: ") + chalk.bold(`${part.name}, Classe: ${part.class}, Tipo: ${part.type}`));
            });

            console.log(chalk.white(`--------------------------------------`));
        });

        return `Axies carregados com sucesso para ${AccountName}.`;

    } catch (error) {
        console.error(chalk.red(`[ERROR] ${AccountName} > Erro ao buscar inventário de Axies: ${error.message}`));
        writeLogs('./logs/errors', 'error', error.message);
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
        const OutputMessage = `${AccountName} - Total: ${TotalAxies}`
        
        if (TotalAxies < 3) {
            sendWebhook(`Detectamos apenas ${TotalAxies} Axies na conta ${AccountName}`, AccountName, AccountWallet);
            console.log(chalk.red(`[RENTS] `) + OutputMessage);
        } else {
            console.log(chalk.green(`[RENTS] `) + OutputMessage);
        }

        return OutputMessage;
    } catch (error) {
        handleRequestError(error, AccountName, "verificação de Axies");
        writeLogs('./logs/errors', 'error', error);
    }
}

async function verifyRents() {
    var verifyRentsLogs = [];

    for (const account of Accounts.Axie) {
        console.log(`\nVerificando rents: ${account.accountName}`);
        const verifyRentsOutput = await GetTotalOwnedAxiesByUser(account.accountWallet, account.accountName);

        const OutputLogRents = `[${new Date().toLocaleString()}] ${verifyRentsOutput}\n`;

        verifyRentsLogs.push(OutputLogRents);

        await delay(config.rentsDelayBetweenAccountsMilliseconds);
    }

    let OutputLogsString = verifyRentsLogs.join('\n');
    writeLogs('./logs/rents', 'VerifyRents', OutputLogsString);
}

// nem log disso
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
    var claimQuestsLogs = [];
    
    for (const account of Accounts.Axie) {
        console.log(`\nClaimando quests: ${account.accountName}`);

        const classicBattleQuestOutput = await claimWin1ClassicBattle(account.accessToken, account.accountName);
        const originsBattleQuestOutput = await claimWin1OriginsBattle(account.accessToken, account.accountName);

        const OutputLogClassic = `[${new Date().toLocaleString()}] ${classicBattleQuestOutput}\n`;
        const originsLogClassic = `[${new Date().toLocaleString()}] ${originsBattleQuestOutput}\n`;

        claimQuestsLogs.push(OutputLogClassic);
        claimQuestsLogs.push(originsLogClassic);

        await delay(config.claimDelayBetweenAccountsMilliseconds);
    }

    let OutputLogsString = claimQuestsLogs.join('\n');
    writeLogs('./logs/claimQuests', 'claimQuest', OutputLogsString);
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

// nova feature - pode ser obsoleto em outros computadores - hardcoded asf....
async function abrirNavegadoresInitializer(){
    let profilesArraySortMe = [];
    const userDataDir = path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Local State');
    const localStateData = fs.readFileSync(userDataDir, 'utf-8');
    const LocalStateParse = JSON.parse(localStateData); // verifica se o Local State tem uma estrutura JSON válida


    for (const profile in LocalStateParse.profile.info_cache) {
        const insideArray = LocalStateParse.profile.info_cache[profile];

        if (insideArray === "Default") {
            console.log(chalk.yellow("Profile Default, pulando"));
            continue;
        }

        if (insideArray.name.includes(config.profilePrefix)) {
            profilesArraySortMe.push(`${insideArray.name} - ${profile}`);
        }
    }

    const perfisOrdenados = profilesArraySortMe.sort(ordenarPorNumero);
    const startProfile = parseInt(readlineSync.questionInt(chalk.blueBright.bold('Qual o numero do primeiro profile que deseja abrir? ')));
    const endProfile = parseInt(readlineSync.questionInt(chalk.blueBright.bold('Qual o numero do ultimo profile que deseja abrir? ')));
    const sitesInput = readlineSync.question(chalk.blueBright.bold('Digite os URLs dos sites (separados por espaco) que deseja abrir: '));
    const sites = sitesInput.split(' ').map(site => site.trim());
    abrirPerfisComDelay(perfisOrdenados.filter(profile => {
        const numeroPerfil = parseInt(profile.match(new RegExp(`${config.profilePrefix} (\\d+)`))[1]);
        return numeroPerfil >= startProfile && numeroPerfil <= endProfile;
    }), sites, config.browserOpenDelayMilliseconds);
}

(async function initializer() {
    let showMenu = true;
    console.clear();

    while (showMenu) {
        console.log(chalk.blue.bold(`\n\nDigite o número da operação que você deseja fazer:`) + chalk.white.bold(`\n\n    1. Verificar rents\n    2. Claimar quests\n    3. Verificar rent específico\n    4. Loop de verificação de rents\n    5. Abrir perfis Chrome\n\n    0. Sair\n`));
        const operation = readlineSync.questionInt(chalk.underline.white('ESCOLHA:') + ' ');
    
        switch (operation) {
            case 1:
                await verifyRents();
                break;
            case 2:
                await claimQuests();
                break;
            case 3:
                const wallet = readlineSync.question(chalk.cyan('\nDigite a carteira: '));
                await verifySpecificRent(wallet);
                break;
            case 4:
                const interval = readlineSync.questionInt(chalk.cyan('\nDigite o intervalo em minutos (minimo 30 minutos): '));
                await loopVerifyRents(interval);
                break;
            case 5:
                await abrirNavegadoresInitializer(); // clean code #1
                break;
            case 0:
                console.log(chalk.yellow.bold("\nSaindo..."));
                showMenu = false;  // "fecha o menu": sai do loop
                break;
            default:
                console.log(chalk.red.bold("Operação não encontrada."));
        }
    }
})();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// função temporaria...
function gerarTimestampLocal() {
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const horas = String(dataAtual.getHours()).padStart(2, '0');
    const minutos = String(dataAtual.getMinutes()).padStart(2, '0');
    const segundos = String(dataAtual.getSeconds()).padStart(2, '0');

    // gera o timestamp no formato YYYY-MM-DD_HH-MM-SS < lixo de explorer
    return `${ano}-${mes}-${dia}_${horas}-${minutos}-${segundos}`;
}

function createLogDirsIfNotExists() {
    const pastas = [
        './logs',
        './logs/errors',
        './logs/rents',
        './logs/claimQuests'
    ];

    pastas.forEach(pasta => {
        if (!fs.existsSync(pasta)) {
            fs.mkdirSync(pasta, { recursive: true });
            console.log(chalk.yellow("\n[INFO] ") + `Pasta criada: ${pasta}`);
        }
    });
}

function writeLogs(Dir, prefixoArquivo, Message) {
    createLogDirsIfNotExists();
    
    const timestampLocal = gerarTimestampLocal(); // melhorar um dia -> solução ja esta feita
    const caminhoArquivo = path.join(Dir, `${prefixoArquivo}_${timestampLocal}.txt`);

    const logMessage = `[${new Date().toLocaleString()}] ${Message}\n`;
    
    fs.writeFileSync(caminhoArquivo, logMessage, 'utf-8');
    console.log(chalk.bold.yellow("\n[INFO] ") + `Logs salvo em: ${caminhoArquivo}`);
}

// (sincronos)
process.on('uncaughtException', (erro) => {
    const mensagemErro = erro.stack || erro.toString();
    console.error(chalk.red.bold("[ERRO CRITICO] ") + erro);
    writeLogs('./logs/errors', 'error', mensagemErro);
});

// (assíncronas)
process.on('unhandledRejection', (erro) => {
    const mensagemErro = erro.stack || erro.toString();
    console.error(chalk.red.bold("[ERRO CRITICO] ") + erro);
    writeLogs('./logs/errors', 'error', mensagemErro);
});
