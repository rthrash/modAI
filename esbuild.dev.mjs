import * as esbuild from 'esbuild';
import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';

const ctx = await esbuild.context({
  entryPoints: ['_build/js/src/index.ts'],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  globalName: 'ModAI',
  sourcemap: 'inline',
  outfile: 'assets/components/modai/js/modai.js',
  plugins: [
    typecheckPlugin({
      watch: true,
    }),
  ],
});

await ctx.watch();

process.on('beforeExit', () => ctx.dispose());
