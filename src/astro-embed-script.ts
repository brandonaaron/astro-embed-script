import type { AstroIntegration } from 'astro'
import { viteEmbedScript } from './vite-embed-script'

declare module 'astro' {
  interface AstroScriptAttributes {
    'is:embeded'?: boolean
  }
}

/**
 * Returns an AstroIntegration object for embedding scripts in Astro.
 * @returns {AstroIntegration} The AstroIntegration object.
 */
export function astroEmbedScript(): AstroIntegration {
  return {
    name: 'embed-script',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [viteEmbedScript()],
          },
        })
      },
    },
  }
}
