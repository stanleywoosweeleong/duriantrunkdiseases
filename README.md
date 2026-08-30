# 榴莲树干病辨症 · Durian Trunk Disease Triage

Field triage for durian trunk and root disease, in 中文 / English / Bahasa Melayu.
Single-page, offline-capable PWA. No build step, no dependencies, no network calls at runtime.

**Live:** https://stanleywoosweeleong.github.io/duriantrunkdiseases/

## What it covers

| Pathway | |
|---|---|
| 疫霉茎溃疡 | Phytophthora patch canker |
| 葡萄座腔菌类回枯 | Botryosphaeriaceae dieback (Fusicoccum, Lasiodiplodia) |
| 镰刀菌茎腐 | Fusarium stem rot |
| 根部病害 | Root disease, incl. white root (Rigidoporus) |

Plus borers as the entry route, fruit rot, tool hygiene, and a resistance-management section.

## Files

```
index.html               the whole app
manifest.webmanifest     PWA manifest
sw.js                    service worker
icons/                   192, 512, maskable, apple-touch-icon, favicons
.nojekyll                stops Pages from processing the folder
```

Everything uses **relative paths**, so the project-page subdirectory
`/duriantrunkdiseases/` works without configuration.

## Enabling Pages

Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)`.
First publish takes a minute or two.

## Deploying an update

1. Edit `index.html`.
2. **Bump `CACHE_VERSION` in `sw.js`.** This is the entire update mechanism — if
   you forget, returning visitors keep the old cached copy.
3. Commit and push.

What a user sees: the HTML is fetched network-first, so anyone online gets the new
version immediately. The service worker installs in the background and then a green
**有新版本，点一下更新** button appears at the bottom of the screen. Tapping it
activates the new worker and reloads. Nothing switches under a farmer mid-diagnosis.

The app also checks for updates on launch, whenever it returns to the foreground,
and hourly while open.

## Testing offline

1. Open the live URL, let it load fully.
2. DevTools → Application → Service Workers: confirm it is activated.
3. Turn on Airplane mode and reload. The app should open normally.
4. iOS: Share → Add to Home Screen. The icon comes from `apple-touch-icon.png`.

## Content status

- Diagnostic reasoning, chemistry verdicts and biocontrol figures are sourced on the
  **依据 / Evidence** tab, each labelled 榴莲 (durian), 其他作物 (other crop) or 官方数据 (official).
- That tab also lists, deliberately, **what has no citation**: the triage scoring
  weights, the half-girdled stop rule, the crop and pruning months, disinfection
  rates, and the illustrations.
- Malaysian registration status per active ingredient comes from the DOA residue
  database. Only three fungicides carry a durian MRL, and the app says so.
- The Bahasa Melayu is a first pass and has not yet been reviewed by a native
  agronomist. Terminology most worth checking: *mati rosot*, *kanker batang*,
  *oomiset / kulat*, *sungkupan*.

## Licence / use

Free to use and share with farmers. It gives diagnostic direction, not prescriptions —
any product decision belongs to the product label, the LRMP register and your agronomist.
