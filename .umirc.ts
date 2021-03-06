import { defineConfig } from 'dumi';
import { resolve } from 'path'

export default defineConfig({
  title: 'ms-draw',
  favicon: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  mode: 'site',
  alias: {
    'roughjs': resolve('./node_modules/roughjs/bundled/rough.cjs')
  }
  // more config: https://d.umijs.org/config
});
