let websocket = null;
let uuid = null;
let actionUUID = null;
let currentSettings = {};
let currentLibrary = null;

function connectElgatoStreamDeckSocket(
  inPort,
  inPropertyInspectorUUID,
  inRegisterEvent,
  _inInfo,
  inActionInfo,
) {
  uuid = inPropertyInspectorUUID;
  try {
    actionUUID = JSON.parse(inActionInfo).action;
  } catch {
    actionUUID = null;
  }
  websocket = new WebSocket(`ws://127.0.0.1:${inPort}`);
  websocket.onopen = function () {
    websocket.send(
      JSON.stringify({ event: inRegisterEvent, uuid: inPropertyInspectorUUID }),
    );
    websocket.send(JSON.stringify({ event: "getSettings", context: uuid }));
    websocket.send(
      JSON.stringify({ event: "getGlobalSettings", context: uuid }),
    );
    requestLibrary();
  };
  websocket.onmessage = function (event) {
    const message = JSON.parse(event.data);
    if (message.event === "didReceiveSettings") {
      currentSettings = message.payload.settings || {};
      applySettings(currentSettings);
      if (Object.keys(currentSettings).length === 0) sendSettings();
    } else if (message.event === "didReceiveGlobalSettings") {
      const settings = message.payload.settings || {};
      if (settings.address)
        document.getElementById("address").value = settings.address;
      if (settings.port) document.getElementById("port").value = settings.port;
      requestLibrary();
    } else if (message.event === "sendToPropertyInspector") {
      const status = document.getElementById("library-status");
      if (message.payload.library) {
        currentLibrary = message.payload.library;
        if (status) status.textContent = "Connected to Kenku FM API v2";
        applyLibrary(currentLibrary, currentSettings);
      } else if (status) {
        status.textContent =
          message.payload.error || "Kenku FM API v2 is unavailable";
      }
    }
  };
}

function requestLibrary() {
  if (websocket?.readyState === 1)
    websocket.send(
      JSON.stringify({
        action: actionUUID,
        event: "sendToPlugin",
        context: uuid,
        payload: { request: "library" },
      }),
    );
}

function sendSettings() {
  if (websocket?.readyState === 1)
    websocket.send(
      JSON.stringify({
        event: "setSettings",
        context: uuid,
        payload: getSettings(),
      }),
    );
}

function sendGlobalSettings() {
  if (websocket?.readyState === 1) {
    websocket.send(
      JSON.stringify({
        event: "setGlobalSettings",
        context: uuid,
        payload: {
          address: document.getElementById("address").value,
          port: document.getElementById("port").value,
        },
      }),
    );
    setTimeout(requestLibrary, 250);
  }
}

function replaceOptions(select, groups, selected) {
  while (select.firstChild) select.removeChild(select.firstChild);
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select…";
  select.appendChild(placeholder);
  for (const group of groups) {
    if (!group.items.length) continue;
    const container = document.createElement("optgroup");
    container.label = group.label;
    for (const item of group.items) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.title;
      container.appendChild(option);
    }
    select.appendChild(container);
  }
  const hasSelected = Array.from(select.options).some(
    (option) => option.value === selected,
  );
  if (selected && !hasSelected) {
    const unavailable = document.createElement("option");
    unavailable.value = selected;
    unavailable.textContent = `${selected} (unavailable)`;
    select.appendChild(unavailable);
  }
  select.value = selected || "";
}
