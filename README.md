[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

# Kenku FM Stream Deck Plugin

[Stream Deck](https://www.elgato.com/en/stream-deck) plugin for the
[dahjin/kenku-fm fork](https://github.com/dahjin/kenku-fm), with controls for
its version 2 Remote API.

<p align="center">
  <img src="./docs/example.png" alt="Kenku FM Stream Deck Plugin" width="738">
</p>

## Docs

This fork supports the version 2 Remote API added to
[dahjin/kenku-fm](https://github.com/dahjin/kenku-fm). Start Remote under
**Kenku FM > Settings > Remote** before using the plugin. The default address is
`127.0.0.1` and the default port is `3333`.

Version 1.1 adds:

- Playlist and track selectors populated from the Kenku library.
- Sound and soundboard selectors.
- Scene-tab activation and stop controls.
- Playlist-tag toggle buttons.
- Random sound-group start and stop controls.
- A playlist stop action.
- Live button updates from the `/v2/events` stream.
- Automatic fallback to the original `/v1` polling API for the three legacy
  actions.

Scenes, tags, sound groups, playlist stop, and library selectors require Kenku
FM 1.9 or newer. The original play, sound, and playback actions continue to
work with older Kenku FM releases, although their saved IDs cannot be replaced
through the selector until a v2 server is available.

The Remote server has no authentication. Keep it bound to `127.0.0.1` unless
every device on the network is trusted.

The plugin requires Stream Deck 6.4 or newer.

The upstream plugin documentation is available
[here](https://www.kenku.fm/docs/using-kenku-remote).

## Development

Install dependencies and run the same checks and packaging step used by CI:

```bash
npm ci
npm run build
```

The installer is written to `dist/fm.kenku.remote.streamDeckPlugin`. You can
also run the individual steps with `npm test`, `npm run check`,
`npm run validate:plugin`, and `npm run package:plugin`.

## Automated builds

The [plugin build workflow](https://github.com/dahjin/kenku-fm-stream-deck/actions/workflows/build.yml)
tests, validates, and packages the plugin for pull requests and
pushes to `main` or `feature/**` branches. The packaged plugin is available from
the workflow run's **Artifacts** section for 14 days.

Pushing a version tag also creates an entry on the
[Releases page](https://github.com/dahjin/kenku-fm-stream-deck/releases) and
attaches the installable `.streamDeckPlugin` file. The tag must match both
`package.json` and `manifest.json`:

```bash
git tag v1.1.0
git push origin v1.1.0
```

Validation and packaging use Elgato's official Stream Deck CLI with update
checks disabled for reproducible CI runs.

## Licence

Kenku FM is licensed under the GNU General Public Licence v3.0.

## Contributing

For our own wellbeing Kenku FM follows a similar contribution policy projects like [Litestream](https://github.com/benbjohnson/litestream#open-source-not-open-contribution).

This means we are open to pull requests for bug fixes only. Pull requests for new features will not be accepted due to the burden of maintaining these features into the future.
