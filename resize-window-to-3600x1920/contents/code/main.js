function resizeTo3600x1920 () {
    const geometry = workspace.activeClient.geometry;
    geometry.x = 0;
    geometry.y = 0;
    geometry.width = 3600;
    geometry.height = 1920;
}

registerShortcut("Resize to 3600x1920", "Resize to 3600x1920", "Meta+X", resizeTo3600x1920);
