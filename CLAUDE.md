# CLAUDE.md

Day.js is a ~2 KB immutable date library with a Moment.js-compatible API. The core is a single file; plugins and locales are opt-in and bundled separately. Every change is judged on two things: bundle size and parity with Moment.

## Layout

- `src/index.js` is the `Dayjs` class and `dayjs()` factory. `src/constant.js` holds unit names and parse/format regexes. `src/utils.js` exports helpers under one-letter keys (`s` padStart, `z` zone string, `m` monthDiff, `a` absFloor, `p` prettyUnit, `u` isUndefined; `index.js` adds `l` parseLocale, `i` isDayjs, `w` wrapper). Instance fields are `$d`, `$L`, `$u`, `$x`, `$offset`. The short names are deliberate for size; do not rename or "clean up" them.
- `src/plugin/<name>/index.js`: 37 plugins, each `export default (option, Dayjs, dayjs) => { ... }` patching `Dayjs.prototype`. To extend a core method, keep the old one and chain it: `const oldFormat = proto.format; proto.format = function (s) { ...; return oldFormat.bind(this)(s) }` (see `advancedFormat`). Reach helpers through `this.$utils()`, not by importing `utils`.
- `src/locale/<key>.js`: 143 locales. Line 1 must be `// English Name [key]` (the build and `test/locale/keys.test.js` parse it), `name` must equal the lowercase filename, and every file except `en.js` ends with `dayjs.locale(locale, null, true)`.
- `types/`: hand-written TypeScript declarations. A new plugin needs `types/plugin/<name>.d.ts` that augments `declare module 'dayjs'`.
- `test/`: Jest 22. `test/plugin/<name>.test.js`, `test/locale/<key>.test.js`, and `test/issues/issue<N>.<slug>.test.js` for regressions. `test/__mocks__/dayjs.js` redirects `import dayjs from 'dayjs'` to `src/`, which is why locale files can import `'dayjs'` unbuilt.
- `build/`: rollup config and the script that emits the UMD/ESM artifacts to the repo root.

## Commands

```bash
npm install                                           # Node 25 is fine. It rewrites package-lock.json: run `git checkout package-lock.json` after, never commit it
npm run lint                                          # eslint src/* test/* build/*; also runs as the pre-commit hook
npx jest test/plugin/isToday.test --coverage=false    # one file. Without --coverage=false you get a 90-line coverage table every run
TZ=UTC npm test                                       # full suite: 8 timezone-pinned passes, then everything with a 100% line-coverage gate (~15 s)
NODE_OPTIONS=--openssl-legacy-provider npm run build  # only to check the size budget after touching src/index.js, utils.js or constant.js; CI builds on release. Plugin/locale/test changes never need it
```

- `npm test` without `TZ=UTC` fails on a US-timezone machine (`dayOfYear`, `localizedFormat`, `timezone` suites) even on a clean checkout. CI runs in UTC. If exactly those suites fail and you did not touch them, that is the cause, not your change.
- `npm run build` without the OpenSSL flag dies with `ERR_OSSL_EVP_UNSUPPORTED` on Node 17+ but still exits 0. Check the output for the error text, not the exit code.

## Conventions

- ESLint airbnb-base: no semicolons, no trailing commas, single quotes, 2-space indent, imports without `.js` extension (`import dayjs from '../../src'`).
- Tests are flat `it(...)` blocks with `MockDate.set(new Date())` in `beforeEach` and `MockDate.reset()` in `afterEach`. Assert against Moment as the oracle: `expect(dayjs(x).format(f)).toBe(moment(x).format(f))`. Use `moment-timezone` only in timezone tests.
- Line coverage on `src/**` must stay at 100%. A new branch in `src/` needs a test in the same change or `npm test` fails.
- Commit messages are semantic (`fix: ...`, `feat(plugin): ...`); semantic-release reads them. Never edit `CHANGELOG.md` or `"version"` in `package.json` by hand.
- PRs target `dev`. `master` is the release branch and a push to it publishes to npm.
- Core bundle budget: `dayjs.min.js` ≤ 2.99 KB gzipped (currently ~2.78). Anything that can be a plugin goes in a plugin, not in `src/index.js`.

## Do not touch

- Root-level `locale/`, `plugin/`, `esm/`, `index.d.ts`, `dayjs.min.js`, `locale.json` (build output) and `coverage/` (left by `npm test`): all gitignored, nothing reads them. Edit `src/` and `types/` instead. If they exist locally, `rm -rf` them.
- `docs/`: 3-line stubs pointing to day.js.org. The real docs live in a separate repo; do not add docs here.
- `test/browser.spec.js`: karma/SauceLabs only (`npm run sauce`), not picked up by Jest. Its header says do not modify.
- `patches/`, `.releaserc`, `karma.sauce.conf.js`, `.github/workflows/release.yml`: release plumbing.
