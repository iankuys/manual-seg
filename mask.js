console.log("sup from inde.js")

const canvas = new fabric.Canvas('canvas', {

  width: 1000,
  height: 1000,
  backgroundColor: 'white',
  selection: 0
});
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

function makeCircle(left, top, line1, line2, strokeColor, id) {
  var c = new fabric.Circle({
    left: left,
    top: top,
    strokeWidth: 5,
    radius: 6,
    fill: '#fff',
    stroke: strokeColor,
    id: id
  });
  c.hasControls = c.hasBorders = false;

  c.line1 = line1;
  c.line2 = line2;

  return c;
}

function makeLine(coords, id) {
  return new fabric.Line(coords, {
    fill: 'red',
    stroke: 'red',
    strokeWidth: 5,
    selectable: false,
    id: id
  });
}

//Create lines based on the give coordinates
function formLineFromCoords(coordsArray){

  var lineArray = [];

  for (var i = 0; i < coordsArray.length; i++){

    if (i == coordsArray.length - 1){

      lineArray[i] = makeLine([coordsArray[i][0], coordsArray[i][1], coordsArray[0][0], coordsArray[0][1]], i+1);
      canvas.add(lineArray[i]);
    }else{

      lineArray[i] = makeLine([coordsArray[i][0], coordsArray[i][1], coordsArray[i+1][0], coordsArray[i+1][1]], i+1);
      canvas.add(lineArray[i]);
    }
  }
  return lineArray;
}

//Create circles based on the lines
function formCircleFromCoords(lineArray){

  var circleArray = [];

  for (var i = 0; i < lineArray.length; i++){
    if (i == lineArray.length - 1){

      circleArray[i] = makeCircle(lineArray[i].get('x2'), lineArray[i].get('y2'), lineArray[i], lineArray[0], "cyan", i+1);
      canvas.add(circleArray[i]);
    }else{
      
      circleArray[i] = makeCircle(lineArray[i].get('x2'), lineArray[i].get('y2'), lineArray[i], lineArray[i+1], "cyan", i+1);
      canvas.add(circleArray[i]);
    }
  }
  return circleArray;
}


const coords = [[342, 432], [336, 438], [336, 473], [348, 485], [371,485], [371, 444], [359, 432]]

const lineArray = formLineFromCoords(coords);
console.log(lineArray);

const circleArray = formCircleFromCoords(lineArray);

let objects = canvas.getObjects('line');
console.log(Object.keys(objects))

canvas.on('object:moving', function (e) {
  var p = e.target;
  // console.log(p.id);
  p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
  p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top });
  p.line1.setCoords();
  p.line2.setCoords();
  canvas.renderAll();

});

//double click to add a point
canvas.on('mouse:dblclick', function (e) {
  var obj = e.target;

  var pointer = canvas.getPointer(e);

  if (e.target) {
    if (obj.type == 'line') {
      const lineObjects = canvas.getObjects('line');
      const circleObjects = canvas.getObjects('circle');

      const lineKeys = Object.keys(lineObjects);
      const circleKeys = Object.keys(circleObjects);

      new_coords = [obj.x1, obj.y1, pointer.x, pointer.y]

      //store id in temp before it gets changes in the next increment loop
      temp = obj.id;

      //increment lines after the new lines ids
      lineKeys.forEach((key, index) =>{

        if (lineObjects[key].id >= temp){

          lineObjects[key].id = lineObjects[key].id + 1;
        }
      })

      newLine = makeLine(new_coords, temp);
      canvas.add(newLine);

      obj.set({ 'x1': pointer.x, 'y1': pointer.y })
      
      //as line id increments faster than circle ids we have to decrement it by 1
      //increment circles after the new circle ids
      circleKeys.forEach((key, index) =>{

        if (circleObjects[key].id >= temp){

          circleObjects[key].id = circleObjects[key].id + 1;
        }
      })

      //make new circle with the id of the supposingly next circle
      newCircle = makeCircle(newLine.get('x2'), newLine.get('y2'), newLine, obj, 'black', temp);
      canvas.add(newCircle);

      //change coordinates of old circle the circle before the new circle which is 2 index behind
      idToChange = temp-1;

      if (idToChange === 0){

        oldcircle = circleObjects.find(circle => circle.id === (circleObjects.length+1));
      }else{

        oldcircle = circleObjects.find(circle => circle.id === (idToChange));
      }
      oldcircle.line2 = newLine

    }
  }

})

//prints out what line you are clicking on 
canvas.on('mouse:down', function(e){
  var p = e.target;
  if (e.target) {
    if (p.type == 'line') {
      console.log(`LineID: ${p.id}`)
      console.log(`Line Coords: (${p.x1},${p.x1})`)

    }else if(p.type == 'circle'){
      console.log(`circleID: ${p.id}`)
      console.log(`Circle Coords: (${p.left},${p.top})`)
    }
  }
})

//update area based on segmentation
canvas.on('object:modified', function(){

  const objects = canvas.getObjects('line');
  const lines = []
  const newCoords = []
  var max = 0
  // console.log(objects)
  for(var index in objects){

    for (const [key, value] of Object.entries(objects[index])) {

      lines[objects[index].get("id")-1] = objects[index]      

    }
    //console.log(`LineObject: ${Object.entries(objects[key])}`)
  }
  for (var index in lines){

      newCoords[index] = [lines[index].get('x1'), lines[index].get('y1')] 
  }
  const area = simpsonArea(newCoords);
  originalArea.set('text',`Area: ${area}`);
  console.log(area);
})

function simpsonArea(coordsArray) {

  var area = 0;

  //need to wrap it around to use shoelace
  coordsArray[coordsArray.length] = coordsArray[0];

  for (var i = 0; i < coordsArray.length - 1; i++){
    area += coordsArray[i][0] * coordsArray[i+1][1] - coordsArray[i+1][0] * coordsArray[i][1];

  }
  return (Math.abs(area/2)).toFixed(4)
}

const area = simpsonArea(coords);
const originalArea = new fabric.Text(`Area: ${area}`, {fontSize: 20 ,left: 100, top: 20});
canvas.add(originalArea);



