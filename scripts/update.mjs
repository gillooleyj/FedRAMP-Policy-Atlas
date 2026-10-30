import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {initialize,checkUpdates,promote,withLock} from './update-core.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const command=process.argv[2]??'check';
try{
 let result;
 if(command==='init')result=await withLock(root,async()=>{const {version}=await initialize(root);return {activeVersion:version};});
 else if(command==='check')result=await checkUpdates(root,{
  resolve:repo=>{const output=execFileSync('git',['ls-remote',`https://github.com/${repo}.git`,'HEAD'],{encoding:'utf8',timeout:60000,stdio:['ignore','pipe','pipe']});return output.trim().split(/\s+/)[0];},
  download:url=>execFileSync('curl',['--fail','--location','--silent','--show-error','--max-time','90',url],{maxBuffer:50*1024*1024,stdio:['ignore','pipe','pipe']})
 });
 else if(command==='promote'){const index=process.argv.indexOf('--expect-active');result=await promote(root,process.argv[3],index<0?undefined:process.argv[index+1]);}
 else throw new Error('Use init, check, or promote <candidate> --expect-active <version>');
 console.log(JSON.stringify(result,null,2));
}catch(error){console.error(error.message);process.exitCode=1;}
