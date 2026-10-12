let remoteApiVersion = 1;
let remoteLibrary = emptyLibrary();
let eventSource;
let pollTimer;
let retryTimer;
let monitorGeneration = 0;

const playbackState = {
  playlist: undefined,
  soundboard: undefined,
  scene: null,
};

function stopPlaybackMonitoring() {
  monitorGeneration += 1;
  if (eventSource) eventSource.close();
  if (pollTimer) clearInterval(pollTimer);
  if (retryTimer) clearTimeout(retryTimer);
  eventSource = undefined;
  pollTimer = undefined;
  retryTimer = undefined;
}

function updateLibrary(library) {
  remoteLibrary = library || emptyLibrary();
  refreshConfiguredActions();
}

function applyV2State(state) {
  if (!state) return;
  updatePlayback(state.playlist, state.soundboard, state.scene);
}

function openEventStream(generation) {
  eventSource = new EventSource(apiURL("events", "v2"));
  eventSource.addEventListener("snapshot", (event) => {
    if (generation !== monitorGeneration) return;
    const snapshot = JSON.parse(event.data);
    updateLibrary(snapshot.library);
    applyV2State(snapshot.state);
  });
  eventSource.addEventListener("library", (event) => {
    if (generation !== monitorGeneration) return;
    updateLibrary(JSON.parse(event.data));
  });
  eventSource.addEventListener("state", (event) => {
    if (generation !== monitorGeneration) return;
    applyV2State(JSON.parse(event.data));
  });
  eventSource.onerror = () => {
    if (generation !== monitorGeneration) return;
    eventSource.close();
    eventSource = undefined;
    retryTimer = setTimeout(startPlaybackMonitoring, 2000);
  };
}

function startLegacyPolling(generation) {
  remoteApiVersion = 1;
  const request = async () => {
    const playlist = await api("playlist/playback", "GET", undefined, "v1");
    const soundboard = await api("soundboard/playback", "GET", undefined, "v1");
    return { playlist, soundboard };
  };
  const breaker = new CircuitBreaker(request);
  const poll = async () => {
    if (generation !== monitorGeneration) return;
    try {
      const result = await breaker.fire();
      if (result?.playlist && result?.soundboard)
        updatePlayback(result.playlist, result.soundboard, null);
    } catch {}
  };
  pollTimer = setInterval(poll, 1000);
  void poll();
  retryTimer = setTimeout(startPlaybackMonitoring, 10000);
}

/** Prefer v2 live events and automatically fall back to v1 polling. */
async function startPlaybackMonitoring() {
  stopPlaybackMonitoring();
  const generation = monitorGeneration;
  try {
    const [library, state] = await Promise.all([api("library"), api("state")]);
    if (generation !== monitorGeneration) return;
    remoteApiVersion = 2;
    updateLibrary(library);
    applyV2State(state);
    openEventStream(generation);
  } catch {
    if (generation === monitorGeneration) startLegacyPolling(generation);
  }
}

/** Update action images and titles from the latest playback state. */
function updatePlayback(playlist, soundboard, scene) {
  const soundIds = new Set(soundboard.sounds.map((sound) => sound.id));
  for (const [context, action] of Object.entries(soundboardActions)) {
    const playing = soundIds.has(action.id);
    if (playing !== action.playing) {
      action.playing = playing;
      soundboardPlayAction.updateImage(context, playing);
    }
  }

  const groupIds = new Set((soundboard.groups || []).map((group) => group.id));
  for (const [context, action] of Object.entries(groupActions)) {
    action.playing = groupIds.has(action.id);
    soundGroupAction.updateImage(context, action.playing);
  }

  let playbackStateDirty = false;
  for (const key of Object.keys(playlistPlaybackAction.state)) {
    if (playlist[key] !== playlistPlaybackAction.state[key]) {
      playbackStateDirty = true;
      playlistPlaybackAction.state[key] = playlist[key];
    }
  }
  if (playbackStateDirty) {
    for (const [context, action] of Object.entries(playbackActions))
      playlistPlaybackAction.updateImage(context, action);
  }

  playbackState.playlist = playlist;
  playbackState.soundboard = soundboard;
  playbackState.scene = scene;
  refreshSceneActions();
  refreshTagActions();
}
