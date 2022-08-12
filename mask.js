console.log("sup from inde.js")

const canvas = new fabric.Canvas('canvas', {

  width: 2000,
  height: 2000,
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

// var line = makeLine([342, 432, 336, 438], 1),
//   line2 = makeLine([336, 438, 336, 473], 2),
//   line3 = makeLine([336, 473, 348, 485], 3),
//   line4 = makeLine([348, 485, 371, 485], 4),
//   line5 = makeLine([371, 485, 371, 444], 5),
//   line6 = makeLine([371, 444, 359, 432], 6),
//   line7 = makeLine([359, 432, 342, 432], 7);
// canvas.add(line, line2, line3, line4, line5, line6, line7);

const lineArray = formLineFromCoords(coords);
console.log(lineArray);

// var circle = makeCircle(line.get('x2'), line.get('y2'), line, line2, "yellow", 1),
//   circle2 = makeCircle(line2.get('x2'), line2.get('y2'), line2, line3, "red", 2),
//   circle3 = makeCircle(line3.get('x2'), line3.get('y2'), line3, line4, "pink", 3),
//   circle4 = makeCircle(line4.get('x2'), line4.get('y2'), line4, line5, "purple",4),
//   circle5 = makeCircle(line5.get('x2'), line5.get('y2'), line5, line6, "cyan",5),
//   circle6 = makeCircle(line6.get('x2'), line6.get('y2'), line6, line7, "orange",6),
//   circle7 = makeCircle(line7.get('x2'), line7.get('y2'), line7, line, "brown",7);
// canvas.add(circle, circle2, circle3, circle4, circle5, circle6, circle7);

const circleArray = formCircleFromCoords(lineArray);

let objects = canvas.getObjects('line');
console.log(Object.keys(objects))

canvas.on('object:moving', function (e) {
  var p = e.target;
  console.log(p.id);
  p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
  p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top });
  p.line1.setCoords();
  p.line2.setCoords();
  canvas.renderAll();

});

//double click to add a point
canvas.on('mouse:dblclick', function (e) {
  var obj = e.target;
  console.log(`OBJ ID:${obj.id}`);
  var pointer = canvas.getPointer(e);

  if (e.target) {
    if (obj.type == 'line') {
      const lineObjects = canvas.getObjects('line');
      const circleObjects = canvas.getObjects('circle');

      const lineKeys = Object.keys(lineObjects);
      const circleKeys = Object.keys(circleObjects);

      new_coords = [obj.x1, obj.y1, pointer.x, pointer.y]
      console.log(obj.id)

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
      console.log(obj.id)
      newCircle = makeCircle(newLine.get('x2'), newLine.get('y2'), newLine, obj, 'black', temp);
      canvas.add(newCircle);

      //change coordinates of old circle the circle before the new circle which is 2 index behind
      idToChange = temp-1;
      console.log(`idToChange${idToChange}`)
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
      console.log(p.id)
    }
  }
})


function simpsonArea(coordsArray) {

  var area = 0;

  for (var i = 0; i < coordsArray.length - 1; i++){
    area = coordsArray[i][0] * coordsArray[i+1][1] - coordsArray[i+1][0] * coords[i][1];

  }
  return (area/2)
}

// for now only works on line3 (skeleton for the logic i used)
// line3.on('mousedown', function(e){

//   var pointer = canvas.getPointer(e);

//   //create a new line
//   new_coords = [line3.x1, line3.y1, pointer.x, pointer.y]
//   newLine = makeLine(new_coords);
//   canvas.add(newLine)

//   //shorten old line
//   line3.set({'x1':pointer.x, 'y1':pointer.y})
//   canvas.renderAll();

//   //add new circle
//   newCircle = makeCircle(newLine.get('x2'), newLine.get('y2'), newLine, line3, 'black');
//   canvas.add(newCircle);

//   //change coordinates of old circle
//   circle2.line2 = newLine; 

// })


canvas.on('object:modified', () => {
  let objects = canvas.getObjects('line');
  console.log(objects)
})


