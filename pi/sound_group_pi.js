function applySettings(settings) {
  applyLibrary(currentLibrary || { soundboards: [] }, settings);
}

function applyLibrary(library, settings) {
  const groups = (library.soundboards || []).flatMap((soundboard) =>
    (soundboard.groups || []).map((group) => ({
      id: group.id,
      title: `${soundboard.title} — ${group.title}`,
    })),
  );
  replaceOptions(
    document.getElementById("id"),
    [{ label: "Random sound groups", items: groups }],
    settings.id,
  );
}

function getSettings() {
  return { id: document.getElementById("id").value };
}
