//variables
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d", { willReadFrequently: true });
const brushSize = document.querySelector("#brush-size");
const reset = document.querySelector("#reset-canvas");
const saveButton = document.querySelector("#save-image");
const fillButton = document.querySelector("#fill");
const pencilButton = document.querySelector("#pencil");
const eraserButton = document.querySelector("#eraser");
const undoButton = document.querySelector("#undo");
//stores all changes made by the user on the canvas so he can comebacks
let canvasMem = [];
let painting = false;
let brushValue = document.querySelector("#brush-value");
let brushColor = document.querySelector("#color-picker");


const startPainting = (e) => {
    if (e.button == 0) {
        painting = true;
        draw(e)
    }
}


const stopPainting = () => {
    painting = false;
    context.beginPath();
}


const storeCanvas = () => {
    let temp = context.getImageData(0, 0, canvas.width, canvas.height);
    canvasMem.push(temp);
}


//get mouse position on the screen
const getXY = (canvas, event) => {
    var rect = canvas.getBoundingClientRect(), /// get absolute rect. of canvas
        x = event.clientX - rect.left,         /// adjust for x
        y = event.clientY - rect.top;          /// adjust for y

    return { x: x, y: y };
}


const draw = (e) => {
    if (!painting) return;
    context.lineWidth = getBrushSize();
    context.lineCap = "round";
    context.strokeStyle = getBrushColor();
    // Mouse position
    const pos = getXY(canvas, e)
    const x = pos.x
    const y = pos.y
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
}


//Same function as draw but to erase. The only thing that changes is the color of the stroke
//that is forced to the background color of the canvas
const drawErase = (e) => {
    if (!painting) return;
    context.lineWidth = getBrushSize();
    context.lineCap = "round";
    context.strokeStyle = '#D8DEE9';
    // Mouse position
    const pos = getXY(canvas, e)
    const x = pos.x
    const y = pos.y
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
}


//Used by the custom input range to choose the size of the brush
//The dark background follows the pointer and the size innerHTML is updated dynamically
const followSliderPointer = () => {
    let size = brushSize.value;
    let color = 'linear-gradient(90deg, #4C566A ' + size + '%, #D8DEE9 ' + size + '%)';
    brushSize.style.background = color;
    brushValue.innerHTML = size;
}


const resizeCanvas = () => {
    canvas.height = window.innerHeight + 300;
    canvas.width = window.innerWidth + 300;
    //To avoid canvas from clearing after resize
    if (canvasMem.length != 0) {
        context.putImageData(canvasMem[canvasMem.length - 1], 0, 0);
    }
}


const getBrushSize = () => {
    return brushSize.value;
}


const getBrushColor = () => {
    return brushColor.value;
}


//used to have a background on the saved image when save function is used
const fillCanvasBackgroundWithColor = (color) => {
    context.save();

    // Normally when you draw on a canvas, the new drawing
    // covers up any previous drawing it overlaps. This is
    // because the default `globalCompositeOperation` is
    // 'source-over'. By changing this to 'destination-over',
    // our new drawing goes behind the existing drawing. This
    // is desirable so we can fill the background, while leaving
    // the chart and any other existing drawing intact.
    // Learn more about `globalCompositeOperation` here:
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
    context.globalCompositeOperation = 'destination-over';

    // Fill in the background. We do this by drawing a rectangle
    // filling the entire canvas, using the provided color.
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Restore the original context state from `context.save()`
    context.restore();
}


const saveCanvas = () => {
    fillCanvasBackgroundWithColor('#D8DEE9');
    const link = document.createElement('a');
    link.download = 'kaku';
    link.href = canvas.toDataURL('image/png');
    link.click();
    link.delete;
}


const fillCanvas = () => {
    context.fillStyle = getBrushColor();
    context.fillRect(0, 0, canvas.width, canvas.height);
    storeCanvas();
}


const activateFillTool = () => {
    canvas.removeEventListener('mousedown', startPainting);
    canvas.removeEventListener('mousedown', drawErase);
    canvas.removeEventListener('mousemove', drawErase);
    canvas.addEventListener('click', fillCanvas);
}


const activatePencilTool = () => {
    canvas.removeEventListener('click', fillCanvas);
    canvas.addEventListener('mousedown', startPainting);
    canvas.removeEventListener('mousedown', drawErase);
    canvas.removeEventListener('mousemove', drawErase);
    canvas.addEventListener('mousedown', draw);
    canvas.addEventListener('mousemove', draw);
}


const activateEraser = () => {
    canvas.removeEventListener('mousedown', draw);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('click', fillCanvas);
    canvas.addEventListener('mousedown', drawErase);
    canvas.addEventListener('mousemove', drawErase);
    canvas.addEventListener('mousedown', startPainting);
}


const Undo = () => {
    canvasMem.pop();
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (canvasMem.length != 0) {
        context.putImageData(canvasMem[canvasMem.length - 1], 0, 0);
    }
}


const clearCanvas = () => {
    storeCanvas();
    context.clearRect(0, 0, canvas.width, canvas.height);
}


//adding event listeners
canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mousedown', draw);
canvas.addEventListener('mouseup', stopPainting);
canvas.addEventListener('mouseup', storeCanvas);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseout', stopPainting);
brushSize.addEventListener('mousemove', followSliderPointer)
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
reset.addEventListener('click', clearCanvas);
saveButton.addEventListener('click', saveCanvas);
fillButton.addEventListener('click', activateFillTool)
pencilButton.addEventListener('click', activatePencilTool)
eraserButton.addEventListener('click', activateEraser)
undoButton.addEventListener("click", Undo);