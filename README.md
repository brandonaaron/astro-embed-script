# Astro Script Embed

Embed (or inline) a script into your HTML from an Astro component.

⚠️ This is pretty narowly implemented and tested for my use case and might not work for yours.

## Use Case

I needed a small blocking script on every html page generated in my Astro build. I didn't want to use the network for this blocking js. So I made this astro integration that adds a small vite plugin to embed/inline a script.

## Usage

Run:

```
npx astro add @brandonaaron/astro-script-embed
```

Then add `is:inline is:embeded` to any script tag. The source can be to a package or local file. For example I used it to inline the small blocking script from my [dark-pref](https://github.com/brandonaaron/dark-pref) project like so:

```
<script is:inline is:embeded src="@brandonaaron/dark-pref/dist/DarkPref.blocking.js"></script>
```

### Manully installing

First install it:

```
npm install @brandonaaron/astro-script-embed
```

Update your Astro config to import and include the 'astroEmbedScript' integration:

```
import scriptEmbed from '@brandonaaron/astro-script-embed'

export default defineConfig({
  //...
  integrations: [scriptEmbed()],
  //...
})
```
