import{build}from'esbuild';
await build({entryPoints:['dist/app.js'],outfile:'dist/app.bundle.js',bundle:true,format:'iife',target:['es2020'],minify:true,legalComments:'linked',define:{'import.meta.url':'undefined'}});
