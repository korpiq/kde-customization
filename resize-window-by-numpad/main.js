Direction = [
    "UpLeft", "Up", "UpRight", 
    "Left", "Center", "Right",
    "DownLeft", "Down", "DownRight"
].reduce((obj, p) => Object.assign(obj, { [p]: p }), {});


[
    ["Meta+KP_1", Direction.DownLeft]
    ["Meta+KP_2", Direction.Down]
    ["Meta+KP_3", Direction.DownRight]
    ["Meta+KP_4", Direction.Left]
    ["Meta+KP_5", Direction.Center]
    ["Meta+KP_6", Direction.Right]
    ["Meta+KP_7", Direction.UpLeft]
    ["Meta+KP_8", Direction.Up]
    ["Meta+KP_9", Direction.UpRight]
].forEach((shortcut) => {
    var name = "Resize Window: " + shortcut[1]
    registerShortcut(name, name, shortcut[0], () => { resizeToward(shortcut[1]); });
})

function resizeToward(direction) {
    var client = workspace.activeClient;
    var win = client.geometry;
    var area = workspace.clientArea(KWin.MaximizeArea, client);
    debug(direction, client.caption, client.geometry);
    if (!client.moveable || win == area) return;

    var shouldGrow = win.height < area.height / 2 || win.width < area.width / 2;
    var divider = shouldGrow ? 2 : 3;
    var newWidth = area.width / divider;
    var newHeight = area.height / divider;

    client.clientStartUserMovedResized(client);
    switch (direction) {
        case Direction.UpLeft:
            grow = win.x > 0 || win.y > 0;
            win.x = 0;
            win.y = 0;
            win.width = divide(area.width, grow && 2);
            win.height = divide(area.height, grow && 2);
            break;

            case Direction.Up:
            win.x = area.width / 3;
            win.y = 0;
            win.width = area.width / 3;
            win.height = area.height / 2;
            break;

            case Direction.UpRight:
            break;
        
        case Direction.Left:
            win.x = 0;
            win.y = area.height / 4;
            win.width = area.width / 3;
            win.height = area.height / 2;
            break;

            case Direction.Center:
            grow = win.x > 0 || win.y > 0;
            if (win.x > 0 || win.y > 0) {
                win.x = 0;
                win.y = 0;
                win.width = area.width;
                win.height = area.height;
            } else {
                win.x = area.width / 3;
                win.y = area.height / 4;
                win.width = area.width / 3;
                win.height = area.height / 2;
            }
            break;

            case Direction.Right:
            win.x = 2 * area.width / 3;
            win.y = area.height / 4;
            win.width = area.width / 3;
            win.height = area.height / 2;
            break;

        case Direction.DownLeft:
            break;

            case Direction.Down:
            win.x = area.width / 3;
            win.y = area.height / 2;
            win.width = area.width / 3;
            win.height = area.height / 2;
            break;

        case Direction.DownRight:
            break;
    }
    client.clientFinishUserMovedResized(client);
}
