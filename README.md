[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

# Kenku FM Stream Deck Plugin

[Stream Deck](https://www.elgato.com/en/stream-deck) plugin for [Kenku FM](https://kenku.fm).

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

The upstream plugin documentation is available
[here](https://www.kenku.fm/docs/using-kenku-remote).

## Development

Run the dependency-free checks with Node.js:

```bash
npm test
npm run check
```

## Licence

Kenku FM is licensed under the GNU General Public Licence v3.0.

## Contributing

For our own wellbeing Kenku FM follows a similar contribution policy projects like [Litestream](https://github.com/benbjohnson/litestream#open-source-not-open-contribution).

This means we are open to pull requests for bug fixes only. Pull requests for new features will not be accepted due to the burden of maintaining these features into the future.
