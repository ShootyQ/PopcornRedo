import {defineConfig} from 'vite';

// GitHub's workflow run number identifies the deployed artifact, not the visitor's cache.
export default defineConfig(({command})=>{
 const run=process.env.GITHUB_RUN_NUMBER;
 const attempt=process.env.GITHUB_RUN_ATTEMPT;
 const build=run ? `${run}${attempt&&attempt!=='1'?`.${attempt}`:''}` : command==='serve'?'DEV':'LOCAL';
 return {base:'./',define:{__BUILD_NUMBER__:JSON.stringify(build)}};
});
