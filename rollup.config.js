import typescript from '@rollup/plugin-typescript'

const banner = '/*! (c) Brandon Aaron - ISC */'

export default {
  input: {
    index: 'src/index.ts',
  },
  output: {
    dir: 'dist',
    banner,
    format: 'esm',
  },
  plugins: [typescript()],
  watch: true,
  external: ['astro', 'esbuild'],
}
