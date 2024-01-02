import type { Plugin } from 'vite'
import * as esbuild from 'esbuild'

export type AstroEmbedScriptMatch = false | {
  openingTag: string // <script is:embeded src="path" data-other="ok" data-also>
  srcAttribute: string // src="path/to/script.js"
  path: string // path/to/script.js
  attributes: string // 'data-other="ok" data-also'
}

/**
 * Regular expression to match script tags in Astro components.
 * Matches script tags with the following conditions:
 * - Contains the attribute `is:embeded`
 * - Contains the attribute `src` with a path enclosed in single or double quotes
 * @example
 * // Matches:
 * // <script is:embeded src="path/to/script.js" data-other="ok" data-also>
 * // <script is:embeded src='@brandonaaron/dark-pref/dist/DarkPref.blocking.js' data-other="ok" data-also>
 *
 * // Does not match:
 * // <script src="path/to/script.js" data-other="ok" data-also>
 */
export const embedScriptRegEx = /<script(?=[^>]*is:embeded)(?=[^>]*(src=['"](.*?)['"]))([^>]*)>/g

/**
 * Get the matching embedded script tag from the provided source code.
 * @param src The source code to search for embedded script tags.
 * @returns {AstroEmbedScriptMatch | false} The matched script tag information, or `false` if no match is found.
 */
export const getMatchingScript = function* (src: string): Generator<AstroEmbedScriptMatch | false> {
  const matches = src.matchAll(embedScriptRegEx)
  for (const match of matches) {
    const [openingTag, srcAttribute, path, attributes] = match
    const prunedAttributes = attributes
      .replace(srcAttribute, '')
      .replace('is:embeded', '')
      .replace(/\s+/g, ' ')
      .trim()
    yield {
      openingTag,
      srcAttribute,
      path,
      attributes: prunedAttributes,
    }
  }
  return false
}

/**
 * Build the code using esbuild.
 * @param path The path to the script file. Can be an npm module path.
 * @returns {Promise<string>} The built code as a string.
 */
export const buildCode = async (path: string): Promise<string> => {
  const builtCode = await esbuild.build({
    entryPoints: [path],
    bundle: true,
    minify: true,
    write: false,
  })
  return builtCode.outputFiles[0].text.replace(/\n/g, `\\n`)
}

export async function transform(code: string): Promise<undefined | string> {
  let updatedCode = code
  const astroEmbedScriptMatches = getMatchingScript(code)
  for (const match of astroEmbedScriptMatches) {
    if (!match) { continue }
    const builtCode = await buildCode(match.path)
    const newTag = `<script${match.attributes ? ` ${match.attributes}` : ''}>${builtCode}`
    updatedCode = updatedCode.replace(match.openingTag, newTag)
  }
  return updatedCode
}

/**
 * Vite transform plugin to embed script tags in Astro components.
 * @returns {Plugin} The Vite plugin object.
 */
export function viteEmbedScript(): Plugin {
  return {
    name: 'vite:embed-script',
    async transform(code, id/* , options */) {
      // only operate on astro components
      if (!/\.astro$/.test(id)) { return }

      const transformedCode = await transform(code)
      return { code: transformedCode }
    },
  }
}
