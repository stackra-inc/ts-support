import { defineConfig } from 'tsup';
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve';

export default defineConfig((options) => ({
  entry: ['src/index.tsx'],
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: true,
  minify: false,
  format: ['cjs', 'esm'],
  outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.mjs' }),
  platform: 'browser',
  esbuildPlugins: [
    NodeResolvePlugin({
      extensions: ['.js', 'ts', 'tsx', 'jsx'],
      onResolved: (resolved) => {
        if (resolved.includes('node_modules')) {
          return {
            external: true,
          };
        }
        return resolved;
      },
    }),
  ],
  esbuildOptions(options) {
    options.keepNames = true;
    options.external = [
      ...(options.external || []),
      '@abdokouta/ts-container',
      '@abdokouta/react-support',
      '@heroui/react',
      'lucide-react',
      'react',
      'react-dom',
      'react/jsx-runtime',
    ];
    options.banner = {
      js: '"use client"',
    };
  },
  onSuccess: options.watch ? 'pnpm types' : undefined,
}));
