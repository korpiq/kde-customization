const Direction = [
    "UpLeft", "Up", "UpRight",
    "Left", "Center", "Right",
    "DownLeft", "Down", "DownRight"
].reduce((obj, p) => Object.assign(obj, { [p]: p }), {});

const version = 'v0.2';

function resizeToward(direction) {
    var client = workspace.activeClient;
    var currentArea = client.geometry;
    var area = workspace.clientArea(KWin.MaximizeArea, client);

    function isPlacedAt(x, y) {
        return currentArea.x === x && currentArea.y === y;
    }

    function isOfSize(width, height) {
        return currentArea.width === width && currentArea.height === height;
    }

    function isCurrently(geometry) {
        return isPlacedAt(geometry.x, geometry.y) && isOfSize(geometry.width, geometry.height);
    }

    let newArea = currentArea;

    switch (direction) {
        case Direction.UpLeft:
            newArea = { x: 0, y: 0, width: area.width, height: area.height / 2 }
            if (isCurrently(newArea)) {
                newArea.width *= 2;
            }
            break;

        case Direction.Up:
            newArea = { x: area.width, y: 0, width: area.width, height: area.height / 2 }
              if(isCurrently(newArea)) {
                  newArea.x = 0;
                  newArea.width *= 3;
              }
            break;

        case Direction.UpRight:
            newArea = { x: area.width * 2, y: 0, width: area.width, height: area.height / 2 }
            if (isCurrently(newArea)) {
                newArea.x = area.width;
                newArea.width *= 2;
            }
            break;

        case Direction.Left:
            newArea = { x: 0, y: 0, width: area.width, height: area.height }
            if (isCurrently(newArea)) {
                newArea.width *= 2;
            }
            break;

        case Direction.Center:
            newArea = { x: area.width, y: 0, width: area.width, height: area.height }
            if (isCurrently(newArea)) {
                newArea.x = 0;
                newArea.width *= 3;
            }
            break;

        case Direction.Right:
            newArea = { x: area.width * 2, y: 0, width: area.width, height: area.height }
            if (isCurrently(newArea)) {
                newArea.x = area.width;
                newArea.width *= 2;
            }
            break;

        case Direction.DownLeft:
            newArea = { x: 0, y: area.height / 2, width: area.width, height: area.height / 2 }
            if (isCurrently(newArea)) {
                newArea.width *= 2;
            }
            break;

        case Direction.Down:
            newArea = { x: area.width, y: area.height / 2, width: area.width, height: area.height / 2 }
            if(isCurrently(newArea)) {
                newArea.x = 0;
                newArea.width *= 3;
            }
            break;

        case Direction.DownRight:
            newArea = { x: area.width * 2, y: area.height / 2, width: area.width, height: area.height / 2 }
            if (isCurrently(newArea)) {
                newArea.x = area.width;
                newArea.width *= 2;
            }
            break;
    }

    print('Resize Window', direction, version, client.caption, currentArea, newArea);
    if (newArea !== currentArea) {
        client.clientStartUserMovedResized(client);
        client.geometry.x = newArea.x;
        client.geometry.y = newArea.y;
        client.geometry.width = newArea.width;
        client.geometry.height = newArea.height;
        client.clientFinishUserMovedResized(client);
    }
}

[
    ["Meta+Num+1", Direction.DownLeft],
    ["Meta+Num+2", Direction.Down],
    ["Meta+Num+3", Direction.DownRight],
    ["Meta+Num+4", Direction.Left],
    ["Meta+Num+5", Direction.Center],
    ["Meta+Num+6", Direction.Right],
    ["Meta+Num+7", Direction.UpLeft],
    ["Meta+Num+8", Direction.Up],
    ["Meta+Num+9", Direction.UpRight]
].forEach((shortcut) => {
    const name = "Resize Window " + shortcut[1];
    print('registerShortcut', name, version, shortcut[0], shortcut[1]);
    registerShortcut(name, name + ' ' + version, shortcut[0], () => { resizeToward(shortcut[1]); });
})
