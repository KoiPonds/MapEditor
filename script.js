const fileInput = document.getElementById('fileInput');
const tilesContainer = document.getElementById('tilesContainer');
const mapContainer = document.getElementById('mapContainer');
const saveButton = document.getElementById('saveButton');
const mapSizeInput = document.getElementById('mapSize');
const resizeMapButton = document.getElementById('resizeMapButton');
const clearMapButton = document.getElementById('clearMapButton');
const playerMapContainer = document.getElementById('playerMapContainer');

let selectedTile = null;
let lastPlacedTile = null;
const map = [];
const undoButton = document.getElementById('undoButton');
undoButton.addEventListener('click', undoLastPlacement);

fileInput.addEventListener('change', handleFileInput);
tilesContainer.addEventListener('click', handleTileClick);
mapContainer.addEventListener('click', handleMapClick);
saveButton.addEventListener('click', saveMap);
resizeMapButton.addEventListener('click', resizeMap);
clearMapButton.addEventListener('click', clearMap);

function handleFileInput(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function() {
        const image = new Image();
        image.src = reader.result;
        image.onload = function() {
            createTiles(image);
        };
    };
    reader.readAsDataURL(file);
}

function createTiles(image) {
    tilesContainer.innerHTML = '';
    const cols = Math.floor(image.width / 32);
    const rows = Math.floor(image.height / 32);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const context = canvas.getContext('2d');
            context.drawImage(image, x * 32, y * 32, 32, 32, 0, 0, 32, 32);

            if (!isCanvasEmpty(canvas)) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.style.backgroundImage = `url(${canvas.toDataURL()})`;
                tile.setAttribute('data-tile', tilesContainer.children.length);
                tilesContainer.appendChild(tile);
            }
        }
    }
}

function isCanvasEmpty(canvas, tolerance = 5) {
    const context = canvas.getContext('2d');
    const pixelData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < pixelData.length; i += 4) {
        const red = pixelData[i];
        const green = pixelData[i + 1];
        const blue = pixelData[i + 2];

        if (red > tolerance || green > tolerance || blue > tolerance) {
            return false; // If any non-white pixel is found, canvas is not empty
        }
    }
    return true; // All pixels are within tolerance, considered white
}

function handleTileClick(event) {
    const previouslySelectedTile = tilesContainer.querySelector('.tile.selected');
    if (previouslySelectedTile) {
        previouslySelectedTile.classList.remove('selected');
    }
    selectedTile = event.target.getAttribute('data-tile');
    event.target.classList.add('selected');
}

function undoLastPlacement() {
    if (lastPlacedTile !== null) {
        const lastPlacedIndex = map.lastIndexOf(lastPlacedTile);
        if (lastPlacedIndex !== -1) {
            map[lastPlacedIndex] = undefined;
            const mapTile = playerMapContainer.querySelector(`[data-map-tile="${lastPlacedIndex}"]`);
            mapTile.style.backgroundImage = '';
            mapTile.classList.remove('tile-placed');
            lastPlacedTile = null;
        }
    }
}

function handleMapClick(event) {
    if (selectedTile !== null) {
        const rowIndex = Math.floor(Array.from(mapContainer.children).indexOf(event.target) / 200);
        const colIndex = Array.from(event.target.parentElement.children).indexOf(event.target);
        const mapIndex = rowIndex * 200 + colIndex;
        map[mapIndex] = selectedTile;
        event.target.classList.add('tile-placed');
        lastPlacedTile = selectedTile; // Update the last placed tile
    }
}

function saveMap() {
    const mapText = map.join(' ');
    const blob = new Blob([mapText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function createPlayerMap(size) {
    playerMapContainer.innerHTML = '';
    for (let i = 0; i < size * size; i++) {
        const mapTile = document.createElement('div');
        mapTile.classList.add('map-tile');
        mapTile.setAttribute('data-map-tile', i);
        playerMapContainer.appendChild(mapTile);
    }
}

createPlayerMap(100);

function resizeMap() {
    const newSize = parseInt(mapSizeInput.value, 10);
    if (!isNaN(newSize) && newSize >= 1) {
        const currentSize = playerMapContainer.children.length;
        
        // Remove existing map tiles
        playerMapContainer.innerHTML = '';

        // Set the number of rows and columns to be the same
        playerMapContainer.style.gridTemplateColumns = `repeat(${newSize}, 32px)`;
        playerMapContainer.style.gridTemplateRows = `repeat(${newSize}, 32px)`;

        // Create new map tiles
        createPlayerMap(newSize);

        // If the new size is smaller than the previous size, trim the map array
        if (newSize < currentSize) {
            map.length = newSize * newSize;
        }
    } else {
        alert('Please enter a valid map size.');
    }
}

playerMapContainer.addEventListener('click', handlePlayerMapClick);

function handlePlayerMapClick(event) {
    const clickedMapTile = event.target;
    const mapTileIndex = Array.from(playerMapContainer.children).indexOf(clickedMapTile);
    map[mapTileIndex] = selectedTile;
    clickedMapTile.style.backgroundImage = tilesContainer.querySelector(`[data-tile="${selectedTile}"]`).style.backgroundImage;
    clickedMapTile.classList.add('tile-placed');
}



function clearMap() {
    map.fill(undefined); // Reset the map array
    const mapTiles = playerMapContainer.querySelectorAll('.map-tile');
    for (const mapTile of mapTiles) {
        mapTile.style.backgroundImage = '';
        mapTile.classList.remove('tile-placed');
    }
}

