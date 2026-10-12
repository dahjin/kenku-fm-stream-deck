function actionError(context, error) {
  console.error(error);
  showAlert(context);
}

function configuredTitle(collection, id, fallback = "") {
  return collection.find((item) => item.id === id)?.title || fallback;
}

const playlistActions = {};
const playlistPlayAction = {
  onKeyDown: async function (context, settings) {
    try {
      const request = playlistPlayRequest(remoteLibrary, settings.id);
      if (remoteApiVersion === 2 && request)
        await api(request.path, request.method);
      else await api("playlist/play", "PUT", { id: settings.id }, "v1");
    } catch (error) {
      actionError(context, error);
    }
  },
  onDidReceiveSettings: function (context, settings) {
    playlistActions[context] = settings;
    this.update(context, settings);
  },
  onWillAppear: function (context, settings) {
    playlistActions[context] = settings;
    this.update(context, settings);
  },
  onWillDisappear: function (context) {
    delete playlistActions[context];
  },
  update: function (context, settings) {
    const title =
      configuredTitle(remoteLibrary.playlists, settings.id) ||
      configuredTitle(remoteLibrary.tracks, settings.id);
    if (title) setTitle(context, title);
  },
};

const soundboardActions = {};
const soundboardPlayAction = {
  onKeyDown: async function (context, settings) {
    try {
      const action = soundboardActions[context] || {
        id: settings.id,
        playing: false,
      };
      const request = soundPlayRequest(
        remoteLibrary,
        settings.id,
        action.playing,
      );
      if (remoteApiVersion === 2 && request) {
        await api(request.path, request.method);
        action.playing = request.toggle ? !action.playing : false;
        this.updateImage(context, action.playing);
      } else {
        // v1 also accepts a soundboard ID and chooses one of its sounds.
        await api("soundboard/play", "PUT", { id: settings.id }, "v1");
      }
      soundboardActions[context] = action;
    } catch (error) {
      actionError(context, error);
    }
  },
  onDidReceiveSettings: function (context, settings) {
    this.configure(context, settings);
  },
  onWillAppear: function (context, settings) {
    this.configure(context, settings);
  },
  onWillDisappear: function (context) {
    delete soundboardActions[context];
  },
  configure: function (context, settings) {
    const playing = Boolean(
      playbackState.soundboard?.sounds.find(
        (sound) => sound.id === settings.id,
      ),
    );
    soundboardActions[context] = { id: settings.id, playing, settings };
    const title =
      configuredTitle(remoteLibrary.sounds, settings.id) ||
      configuredTitle(remoteLibrary.soundboards, settings.id);
    if (title) setTitle(context, title);
    this.updateImage(context, playing);
  },
  updateImage: function (context, playing) {
    setImageFromURL(
      context,
      playing
        ? "../assets/actionSoundboardStopImage@2x.jpg"
        : "../assets/actionSoundboardPlayImage@2x.png",
    );
  },
};

const playbackActions = {};
const playlistPlaybackAction = {
  state: {
    playing: false,
    repeat: "off",
    shuffle: false,
    muted: false,
    volume: 1,
  },
  onKeyDown: async function (context, settings) {
    try {
      switch (settings.action) {
        case "play-pause":
          this.state.playing = !this.state.playing;
          await api(
            remoteApiVersion === 2
              ? this.state.playing
                ? "playback/resume"
                : "playback/pause"
              : this.state.playing
                ? "playlist/playback/play"
                : "playlist/playback/pause",
            "PUT",
            undefined,
            `v${remoteApiVersion}`,
          );
          break;
        case "stop":
          if (remoteApiVersion !== 2)
            throw Error("Playlist stop requires Kenku FM 1.9 or newer");
          await api("playback", "DELETE");
          this.state.playing = false;
          break;
        case "increase-volume":
          this.state.volume = clampVolume(this.state.volume + 0.05);
          await this.sendPlayback("volume", "PUT", {
            volume: this.state.volume,
          });
          break;
        case "decrease-volume":
          this.state.volume = clampVolume(this.state.volume - 0.05);
          await this.sendPlayback("volume", "PUT", {
            volume: this.state.volume,
          });
          break;
        case "mute":
          this.state.muted = !this.state.muted;
          await this.sendPlayback("mute", "PUT", {
            mute: this.state.muted,
          });
          break;
        case "next":
          await this.sendPlayback("next", "POST");
          break;
        case "previous":
          await this.sendPlayback("previous", "POST");
          break;
        case "shuffle":
          this.state.shuffle = !this.state.shuffle;
          await this.sendPlayback("shuffle", "PUT", {
            shuffle: this.state.shuffle,
          });
          break;
        case "repeat":
          this.state.repeat =
            this.state.repeat === "off"
              ? "playlist"
              : this.state.repeat === "playlist"
                ? "track"
                : "off";
          await this.sendPlayback("repeat", "PUT", {
            repeat: this.state.repeat,
          });
          break;
        default:
          throw Error("Action not implemented");
      }
      this.updateImage(context, settings.action);
    } catch (error) {
      actionError(context, error);
    }
  },
  sendPlayback: function (path, method, body) {
    return api(
      remoteApiVersion === 2 ? `playback/${path}` : `playlist/playback/${path}`,
      method,
      body,
      `v${remoteApiVersion}`,
    );
  },
  onDidReceiveSettings: function (context, settings) {
    playbackActions[context] = settings.action;
    this.updateImage(context, settings.action);
  },
  onWillAppear: function (context, settings) {
    playbackActions[context] = settings.action;
    this.updateImage(context, settings.action);
  },
  onWillDisappear: function (context) {
    delete playbackActions[context];
    setImageFromURL(context, "../assets/blankImage.png");
  },
  updateImage: function (context, action) {
    switch (action) {
      case "play-pause":
        setImageFromURL(
          context,
          this.state.playing
            ? "../assets/actionPauseImage@2x.jpg"
            : "../assets/actionPlayImage@2x.jpg",
        );
        break;
      case "stop":
        setImageFromURL(context, "../assets/actionSoundboardStopImage@2x.jpg");
        break;
      case "mute":
        setImageFromURL(
          context,
          this.state.muted
            ? "../assets/actionMuteOnImage@2x.jpg"
            : "../assets/actionMuteOffImage@2x.jpg",
        );
        break;
      case "decrease-volume":
        setImageFromURL(context, "../assets/actionDecreaseVolumeImage@2x.jpg");
        break;
      case "increase-volume":
        setImageFromURL(context, "../assets/actionIncreaseVolumeImage@2x.jpg");
        break;
      case "next":
        setImageFromURL(context, "../assets/actionNextImage@2x.jpg");
        break;
      case "previous":
        setImageFromURL(context, "../assets/actionPreviousImage@2x.jpg");
        break;
      case "repeat":
        setImageFromURL(
          context,
          this.state.repeat === "off"
            ? "../assets/actionRepeatOffImage@2x.jpg"
            : this.state.repeat === "playlist"
              ? "../assets/actionRepeatPlaylistImage@2x.jpg"
              : "../assets/actionRepeatTrackImage@2x.jpg",
        );
        break;
      case "shuffle":
        setImageFromURL(
          context,
          this.state.shuffle
            ? "../assets/actionShuffleOnImage@2x.jpg"
            : "../assets/actionShuffleOffImage@2x.jpg",
        );
        break;
    }
  },
};

const sceneActions = {};
const sceneAction = {
  onKeyDown: async function (context, settings) {
    try {
      if (remoteApiVersion !== 2)
        throw Error("Scenes require Kenku FM 1.9 or newer");
      const active =
        playbackState.scene?.sceneId === settings.sceneId &&
        playbackState.scene?.tabId === settings.tabId;
      if (active) await api("scenes/active", "DELETE");
      else
        await api(
          `scenes/${encodeURIComponent(settings.sceneId)}/tabs/${encodeURIComponent(settings.tabId)}/activate`,
          "PUT",
        );
    } catch (error) {
      actionError(context, error);
    }
  },
  onDidReceiveSettings: function (context, settings) {
    sceneActions[context] = settings;
    this.update(context, settings);
  },
  onWillAppear: function (context, settings) {
    sceneActions[context] = settings;
    this.update(context, settings);
  },
  onWillDisappear: function (context) {
    delete sceneActions[context];
  },
  update: function (context, settings) {
    const scene = remoteLibrary.scenes.find(
      (item) => item.id === settings.sceneId,
    );
    const tab = scene?.tabs.find((item) => item.id === settings.tabId);
    if (scene || tab)
      setTitle(context, [scene?.title, tab?.title].filter(Boolean).join("\n"));
    const active =
      playbackState.scene?.sceneId === settings.sceneId &&
      playbackState.scene?.tabId === settings.tabId;
    setImageFromURL(
      context,
      active
        ? "../assets/actionSoundboardStopImage@2x.jpg"
        : "../assets/actionPlayImage@2x.jpg",
    );
  },
};

const tagActions = {};
const playlistTagAction = {
  onKeyDown: async function (context, settings) {
    try {
      if (remoteApiVersion !== 2)
        throw Error("Playlist tags require Kenku FM 1.9 or newer");
      const tags = togglePlaylistTag(
        remoteLibrary,
        settings.playlistId,
        settings.tag,
      );
      if (!tags) throw Error("Configured playlist tag is unavailable");
      await api(
        `playlists/${encodeURIComponent(settings.playlistId)}/tags`,
        "PUT",
        { tags },
      );
      const playlist = remoteLibrary.playlists.find(
        (item) => item.id === settings.playlistId,
      );
      if (playlist) playlist.tagFilter = tags;
      this.update(context, settings);
    } catch (error) {
      actionError(context, error);
    }
  },
  onDidReceiveSettings: function (context, settings) {
    tagActions[context] = settings;
    this.update(context, settings);
  },
  onWillAppear: function (context, settings) {
    tagActions[context] = settings;
    this.update(context, settings);
  },
  onWillDisappear: function (context) {
    delete tagActions[context];
  },
  update: function (context, settings) {
    const playlist = remoteLibrary.playlists.find(
      (item) => item.id === settings.playlistId,
    );
    const tag = String(settings.tag || "").toLowerCase();
    const active = (playlist?.tagFilter || []).includes(tag);
    setTitle(context, tag ? `#${tag}` : "Choose tag");
    setImageFromURL(
      context,
      active
        ? "../assets/actionShuffleOnImage@2x.jpg"
        : "../assets/actionShuffleOffImage@2x.jpg",
    );
  },
};

const groupActions = {};
const soundGroupAction = {
  onKeyDown: async function (context, settings) {
    try {
      if (remoteApiVersion !== 2)
        throw Error("Sound groups require Kenku FM 1.9 or newer");
      const action = groupActions[context] || {
        id: settings.id,
        playing: false,
      };
      await api(
        `groups/${encodeURIComponent(settings.id)}/${action.playing ? "playback" : "play"}`,
        action.playing ? "DELETE" : "PUT",
      );
      action.playing = !action.playing;
      groupActions[context] = action;
      this.updateImage(context, action.playing);
    } catch (error) {
      actionError(context, error);
    }
  },
  onDidReceiveSettings: function (context, settings) {
    this.configure(context, settings);
  },
  onWillAppear: function (context, settings) {
    this.configure(context, settings);
  },
  onWillDisappear: function (context) {
    delete groupActions[context];
  },
  configure: function (context, settings) {
    const playing = Boolean(
      playbackState.soundboard?.groups?.find(
        (group) => group.id === settings.id,
      ),
    );
    groupActions[context] = { id: settings.id, playing, settings };
    const groups = remoteLibrary.soundboards.flatMap(
      (soundboard) => soundboard.groups || [],
    );
    const title = configuredTitle(groups, settings.id);
    if (title) setTitle(context, title);
    this.updateImage(context, playing);
  },
  updateImage: function (context, playing) {
    setImageFromURL(
      context,
      playing
        ? "../assets/actionSoundboardStopImage@2x.jpg"
        : "../assets/actionSoundboardPlayImage@2x.png",
    );
  },
};

function refreshSceneActions() {
  for (const [context, settings] of Object.entries(sceneActions))
    sceneAction.update(context, settings);
}

function refreshTagActions() {
  for (const [context, settings] of Object.entries(tagActions))
    playlistTagAction.update(context, settings);
}

function refreshConfiguredActions() {
  for (const [context, settings] of Object.entries(playlistActions))
    playlistPlayAction.update(context, settings);
  for (const [context, action] of Object.entries(soundboardActions))
    soundboardPlayAction.configure(context, action.settings || action);
  for (const [context, action] of Object.entries(groupActions))
    soundGroupAction.configure(context, action.settings || action);
  refreshSceneActions();
  refreshTagActions();
}

const actions = {
  "fm.kenku.remote.playlist-play": playlistPlayAction,
  "fm.kenku.remote.soundboard-play": soundboardPlayAction,
  "fm.kenku.remote.playlist-playback": playlistPlaybackAction,
  "fm.kenku.remote.scene": sceneAction,
  "fm.kenku.remote.playlist-tag": playlistTagAction,
  "fm.kenku.remote.sound-group": soundGroupAction,
};
