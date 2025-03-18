import * as esbuild from 'esbuild';
import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';

await esbuild.build({
  entryPoints: ['_build/js/src/index.ts'],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  globalName: 'ModAI',
  minify: true,
  outfile: 'assets/components/modai/js/modai.js',
  plugins: [typecheckPlugin()],
});
