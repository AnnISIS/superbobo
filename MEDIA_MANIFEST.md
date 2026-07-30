# Media Manifest

This site now uses `media/` for runtime assets. The original `assets/` folder is preserved as the working source library and is no longer referenced by HTML/CSS/JS.

## Upload/runtime directory

Upload these with the site:

- `media/`
- `index.html`
- `product.html`
- `ai-system.html`
- `news.html`
- `partner.html`
- `contact.html`
- `news/`
- `newsinfo/`
- `styles.css`
- `site.js`

Do not upload development screenshots such as `home-refined-desktop.png`, `product-*-preview.png`, `tone-*.png`, or `asset-contact-sheet-*.jpg`.

## Optimized large images

The runtime pages now use compressed `*-opt.jpg` versions for the largest full-screen backgrounds and scene cards. Original source files are preserved in `media/` for future editing.

| Source path | Runtime optimized path | Notes |
| --- | --- | --- |
| `media/product-four-balls-garden.png` | `media/product-four-balls-garden-opt.jpg` | Product/persona background |
| `media/healing-four-balls-outdoor.png` | `media/healing-four-balls-outdoor-opt.jpg` | Product capability background |
| `media/system-data-room.png` | `media/system-data-room-opt.jpg` | AI system data section background |
| `media/system-tech-ufo-balls.png` | `media/system-tech-ufo-balls-opt.jpg` | AI system tech section background |
| `media/scene-window-blue.jpg` | `media/scene-window-blue-opt.jpg` | Product/story background |
| `media/scene-childrens-day-gift.jpg` | `media/scene-childrens-day-gift-opt.jpg` | Product use-case card |
| `media/product-hero-room.jpg` | `media/product-hero-room-opt.jpg` | Product hero and form card |
| `media/partner-hero-balls.png` | `media/partner-hero-balls-opt.jpg` | Partner hero background |
| `media/home-four-balls.png` | `media/home-four-balls-opt.jpg` | Home page hero/product visuals |
| `media/scene-study-desk.jpg` | `media/scene-study-desk-opt.jpg` | Product scene and background |
| `media/scene-parent-child-talk.jpg` | `media/scene-parent-child-talk-opt.jpg` | AI/partner/product scenes |
| `media/scene-kids-space.jpg` | `media/scene-kids-space-opt.jpg` | Home/partner section image |
| `media/scene-bedtime-story.jpg` | `media/scene-bedtime-story-opt.jpg` | Product healing card |
| `media/scene-bedtime-pink.jpg` | `media/scene-bedtime-pink-opt.jpg` | Product/story background |
| `media/product-mini-pink-bag.jpg` | `media/product-mini-pink-bag-opt.jpg` | Product form card |

## Keep as PNG/JPG unless intentionally changed

- `media/logo-superqiuqiu.png`
- `media/qr-app-download.png`
- `media/qr-customer-service.jpg`
- `media/persona-white.png`
- `media/persona-pink.png`
- `media/persona-green.png`
- `media/persona-blue.png`

## Validation commands

Check for old references:

```bash
rg "assets/" --glob "*.html" --glob "*.css" --glob "*.js"
```

Check for missing referenced media files:

```bash
node -e 'const fs=require("fs"),path=require("path");const root=process.cwd();function walk(d){let o=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){if(["assets","media","pdf-preview"].includes(e.name))continue;const p=path.join(d,e.name);if(e.isDirectory())o=o.concat(walk(p));else if(/\.(html|css|js)$/.test(e.name))o.push(p)}return o}let missing=[];for(const f of walk(root)){const t=fs.readFileSync(f,"utf8");for(const re of [/src="([^"]*media\/[^"]+)"/g,/url\("([^"]*media\/[^"]+)"\)/g,/url\(([^)"]*media\/[^)]+)\)/g])for(const m of t.matchAll(re)){const ref=m[1].trim();const abs=path.resolve(path.dirname(f),ref.replace(/^\.\//,""));if(!fs.existsSync(abs))missing.push(`${path.relative(root,f)} -> ${ref}`)}}if(missing.length){console.log(missing.join("\n"));process.exit(1)}console.log("all referenced media files exist")'
```
