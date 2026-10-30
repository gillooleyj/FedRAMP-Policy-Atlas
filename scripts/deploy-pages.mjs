import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
const git=(args,options={})=>execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe'],...options}).trim();
const staging=await mkdtemp(join(tmpdir(),'atlas-pages-'));
try{
 const html=await readFile('dist/index.html','utf8');if(!html.includes('/FedRAMP-Policy-Atlas/assets/'))throw new Error('Run npm run build:pages before deployment');
 const active=JSON.parse(await readFile('dist/data/active.json','utf8'));
 if(!/^[a-f0-9]{16}$/.test(active.version))throw new Error('Missing active graph version');
 const graph=JSON.parse(await readFile(`dist/data/graphs/${active.version}.json`,'utf8'));if(!graph.nodes.length||!graph.edges.length)throw new Error('Production graph is empty');
 await writeFile('dist/.nojekyll','');
 await writeFile('dist/deployment.json',JSON.stringify({sourceCommit:git(['rev-parse','HEAD']),graphVersion:active.version,deployedAt:new Date().toISOString()},null,2)+'\n');
 const remote=git(['ls-remote','origin','refs/heads/gh-pages']);const parent=remote.split(/\s+/)[0];
 if(parent)git(['fetch','--no-tags','origin','gh-pages']);
 const env={...process.env,GIT_INDEX_FILE:join(staging,'index')};
 git(['--work-tree='+resolve('dist'),'add','--all','--force'],{env});
 const tree=git(['write-tree'],{env});
 const commit=git(['-c','user.name=Policy Atlas deployment','-c','user.email=deployment@users.noreply.github.com','commit-tree',tree,...(parent?['-p',parent]:[]),'-m',`Publish Policy Atlas graph ${active.version}`]);
 // Normal fast-forward push refuses a concurrent deployment; no force-push or checkout mutation.
 git(['push','origin',`${commit}:refs/heads/gh-pages`]);
 console.log(JSON.stringify({branch:'gh-pages',commit,graphVersion:active.version,expectedUrl:'https://gillooleyj.github.io/FedRAMP-Policy-Atlas/',note:'Git publication succeeded; confirm Pages is enabled and verify the public URL.'},null,2));
}finally{await rm(staging,{recursive:true,force:true});}
