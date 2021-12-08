const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

// 1-) Tüm buildi sil
// 2-) Compile et
// 3-) Compile ettiğini builde yaz

// 1
const buildPath = path.resolve(__dirname,'build');
fs.removeSync(buildPath);

// 2
const campaignPath = path.resolve(__dirname,'contracts','Campaign.sol');
const source = fs.readFileSync(campaignPath,'utf8');
const output = solc.compile(source,1).contracts;

// 3
fs.ensureDirSync(buildPath)
for(let contract in output){
    fs.outputJsonSync(
        path.resolve(buildPath,contract.replace(':','')+'.json'),output[contract]
    )
}
