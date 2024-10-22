// pegar carteira, accessToken e refreshToken
var AxieInventoryStringJson = localStorage.getItem("AxieInventory");
var AxieAccessToken = localStorage.getItem("accessToken");
var AxieRefreshToken = localStorage.getItem("refreshToken");
var StringParser = JSON.parse(AxieInventoryStringJson);

var JSON_output = `
{
    "accountName": "",
    "accountWallet": "${StringParser.state.queryOptions.owner}",
    "accessToken": "${AxieAccessToken}",
    "refreshToken": "${AxieRefreshToken}"
},`

copy(JSON_output);

// SLPDragonBreeder1@gmx.com - email conta 82