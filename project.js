"use strict";

var canvas;
var gl;

var NumVertices = 36;

//var points = [];
//var colors = [];
var program;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 1;
var theta = [0, 0, 0];
var thetaLoc;

var  tAxis = [0, 0, 1];
var angle = 0.0;
var 	trackingMouse = false;
var   trackballMove = false;
var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;
var rotationMatrix;
var rotationMatrixLoc;

var onear = -1.5;
var ofar = 50;
var oradius = 1;
var otheta  = 45*(3.14/180);
var ophi    =45*(3.14/180);
var odr = 5.0 * Math.PI/180.0;
var oleft = -1.5;
var oright = 1.5;
var oytop = 1.5;
var obottom = -1.5;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var pFlag = 0;

var pnear = 1.0;
var pfar = 50.0;
var pradius = 4.0;
var ptheta  = 45*(3.14/180);
var pphi    = 45*(3.14/180);
var pdr = 5.0 * Math.PI/180.0;
var pfovy = 45;  // Field-of-view in Y direction angle (in degrees)
var paspect = 1.0;

//projectionMatrix = perspective(pfovy, paspect, pnear, pfar);


var theta2 = [0,0,0];
var ifRotateAll = 1;
var rotateFlag = 0;

var scaleFlag = 1;
var scaleX = 1;
var scaleY = 1;
var scaleZ = 1;

var tFlag = 0;
var tX = 0;
var tY = 0;
var tZ = 0;

var solidColor = 1;
var transparency = 1.0;
var transLoc;



var pointsArray = [];
var normalsArray = [];
var colorsArray = [];

//var framebuffer;

var flag = true;

var color = new Uint8Array(4);

var vertices = [
  vec4( -0.05625, -0.1,  0.05625, 1.0 ),
  vec4( -0.05625,  0.1,  0.05625, 1.0 ),
  vec4(  0.05625,  0.1, 0.05625, 1.0 ),
  vec4(  0.05625, -0.1,  0.05625, 1.0 ),
  vec4( -0.05625, -0.1, -0.05625, 1.0 ),
  vec4( -0.05625,  0.1, -0.05625, 1.0 ),
  vec4(  0.05625,  0.1, -0.05625, 1.0 ),
  vec4(  0.05625, -0.1, -0.05625, 1.0 )
    ];

var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
        vec4( 1.0, 1.0, 1.0, 1.0 ),   // white
    ];


var lightPosition = vec4(0.5, 0.5, 0.5, 0.0 );
var lightAmbient = vec4(0.6, 0.6, 0.6, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 5.0, 5.0, 5.0, 1.0 );

//var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
//var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialDiffuse = vec4( 0.5, 0.5, 0.5, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 10.0;

var ambientColor, diffuseColor, specularColor;
var modelView, projection;


var Index = 0;


function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);
     normal = normalize(normal);

     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
     colorsArray.push(vertexColors[a]);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}



function trackballView( x,  y ) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}

function mouseMotion( x,  y)
{
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if(trackingMouse) {
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];

      if (dx || dy || dz) {
	       angle = -0.1 * Math.sqrt(dx*dx + dy*dy + dz*dz);


	       tAxis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
	       tAxis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
	       tAxis[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];

         lastPos[0] = curPos[0];
	       lastPos[1] = curPos[1];
	       lastPos[2] = curPos[2];
      }
    }


    render();
}

function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
	  trackballMove=true;
}

function stopMotion( x,  y)
{
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
	     angle = 0.0;
	     trackballMove = false;
    }
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );


    gl.clearColor(0.5,0.5, 0.5, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


    colorCube();
    //
    //  Load shaders and initialize attribute buffers
    //

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );


    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);



    thetaLoc = gl.getUniformLocation(program, "theta");

    document.getElementById("xAxisSlider").onchange = function(event) {
      if(rotateFlag){
        theta2[xAxis] = event.target.value;
      //  theta[xAxis] = event.target.value;
  }
        if(scaleFlag)
        scaleX = 1+(event.target.value/360);
        if(tFlag)
        tX = event.target.value/360
    }
    document.getElementById("yAxisSlider").onchange = function(event) {
    if(rotateFlag){
      theta2[yAxis] = event.target.value;
      //theta[yAxis] = event.target.value;
}
      if(scaleFlag)
      scaleY = 1+(event.target.value/360);
      if(tFlag)
      tY = event.target.value/360
    }
    document.getElementById("zAxisSlider").onchange = function(event) {
      if(rotateFlag){
        theta2[zAxis] = event.target.value;
      //  theta[zAxis] = event.target.value;
  }
      if(scaleFlag)
      scaleZ = 1+(event.target.value/360);
      if(tFlag)
      tZ = event.target.value/360
    }

    rotationMatrix = mat4();
    rotationMatrixLoc = gl.getUniformLocation(program, "r");
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));

    canvas.addEventListener("mousedown", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function(event){
      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function(event){

      var x = 2*event.clientX/canvas.width-1;
      var y = 2*(canvas.height-event.clientY)/canvas.height-1;
      mouseMotion(x, y);
    } );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    var m = document.getElementById("chooseProjection");

    m.addEventListener("click", function() {
        if(m.selectedIndex)
          pFlag = 1;
        else {
          pFlag = 0;
        }
      });

      var t = document.getElementById("chooseTrans");

      t.addEventListener("click", function() {
          if(t.selectedIndex == 0){
            rotateFlag = 1;
            scaleFlag = 0;
            tFlag = 0;
          }
          else if(t.selectedIndex == 1){
            rotateFlag = 0;
            scaleFlag = 1;
            tFlag = 0;
                }
                else if(t.selectedIndex == 2){
                  rotateFlag = 0;
                  scaleFlag = 0;
                  tFlag = 1;
                }

        });

        var c = document.getElementById("ChooseColor");

        c.addEventListener("click", function() {
            if(c.selectedIndex == 0){
              solidColor = 1;
            }
            else if(c.selectedIndex == 1){
              solidColor = 0;
                  }
          });

          transLoc = gl.getUniformLocation(program, "transparency");

          document.getElementById("Transparency").onchange = function(event) {
            transparency = event.target.value/100;
          }



              var ambientProduct = mult(lightAmbient, materialAmbient);
              var diffuseProduct = mult(lightDiffuse, materialDiffuse);
              var specularProduct = mult(lightSpecular, materialSpecular);

                  gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
                     flatten(ambientProduct));
                  gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
                     flatten(diffuseProduct) );
                  gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
                     flatten(specularProduct) );
                  gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
                     flatten(lightPosition) );

                  gl.uniform1f(gl.getUniformLocation(program,
                     "shininess"),materialShininess);


                      gl.clear( gl.COLOR_BUFFER_BIT );



  document.addEventListener('keydown', function(event) {
  if (event.code == 'KeyW') {
    tZ -=0.1;
  }
  if (event.code == 'KeyS') {
    tZ +=0.1;
  }
  if (event.code == 'KeyA') {
    tX -=0.1;
  }
  if (event.code == 'KeyD') {
    tX +=0.1;
  }
});
    render();
}


var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform3fv(thetaLoc, theta);
    gl.uniform1f(transLoc, transparency);


  //gl.drawArrays(tcolorr() , 0, NumVertices);
  projections(pFlag);

    modelViewMatrix = mult(modelViewMatrix, translate(0.0,-0.45,0.5625));


    modelViewMatrix = mult(modelViewMatrix, translate(0.0,+0.45,-0.5625));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta2[xAxis], 1, 0, 0 ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta2[yAxis], 0, 1, 0 ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta2[zAxis], 0, 0, 1 ));
    modelViewMatrix = mult(modelViewMatrix, scalem(scaleX,scaleY,scaleZ));
    modelViewMatrix = mult(modelViewMatrix, translate(tX,tY,tZ));
    modelViewMatrix = mult(modelViewMatrix, translate(0.0,-0.45,0.5625));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));



    cube();

    //gl.drawArrays(gl.TRIANGLES, 0, NumVertices);




    requestAnimFrame( render );


}
function tcolorr(){

  if(solidColor)
  return gl.TRIANGLES;
else {
  return gl.LINE_STRIP;
}
}
function cube(){
var i;

gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
gl.drawArrays(tcolorr() , 0, NumVertices);
for(i = 1;i <5;i++){
  var instanceMatrix =translate((0.1125+0.005)*i,0.0,0.0);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix2 =translate((0.1125+0.005)*i*-1,0.0,0.0);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);
}

var t = mult(modelViewMatrix, translate(0.0, 0.0, -1.0125));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
gl.drawArrays(tcolorr() , 0, NumVertices);

for(i = 1;i <5;i++){
  var instanceMatrix =translate((0.1125+0.005)*i,0.0,-1.0125);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix2 =translate((0.1125+0.005)*i*-1,0.0,-1.0125);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);
}
////////
modelViewMatrix = mult(modelViewMatrix, translate(0.0,0.9,0));

gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
gl.drawArrays(tcolorr() , 0, NumVertices);
for(i = 1;i <5;i++){
  var instanceMatrix =translate((0.1125+0.005)*i,0.0,0.0);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix2 =translate((0.1125+0.005)*i*-1,0.0,0.0);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);
}

var t = mult(modelViewMatrix, translate(0.0, 0.0, -1.0125));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
gl.drawArrays(tcolorr() , 0, NumVertices);

for(i = 1;i <5;i++){
  var instanceMatrix =translate((0.1125+0.005)*i,0.0,-1.0125);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix2 =translate((0.1125+0.005)*i*-1,0.0,-1.0125);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);
}
////
modelViewMatrix = mult(modelViewMatrix, translate(0.0,-0.45,0));

var i;
var temp = mult(modelViewMatrix, translate(0.46125,0,0));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(temp));
gl.drawArrays(tcolorr() , 0, NumVertices);

var temp2 = mult(modelViewMatrix, translate(-0.46125, 0.0, 0.0));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(temp2));
gl.drawArrays(tcolorr() , 0, NumVertices);

for(i = 1;i <5;i++){
  var instanceMatrix =translate(0.46125,(0.1125+0.005)*i,0.0);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix2 =translate(0.46125,(0.1125+0.005)*i*-1,0.0);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix =translate(-0.46125,(0.1125+0.005)*i,0.0);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix2 =translate(-0.46125,(0.1125+0.005)*i*-1,0.0);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);
}


var temp3 = mult(modelViewMatrix, translate(0.46125,0,-1.0125));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(temp3));
gl.drawArrays(tcolorr() , 0, NumVertices);

var temp4 = mult(modelViewMatrix, translate(-0.46125,0,-1.0125));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(temp4));
gl.drawArrays(tcolorr() , 0, NumVertices);

for(i = 1;i <5;i++){
  var instanceMatrix =translate(0.46125,(0.1125+0.005)*i,-1.0125);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix2 =translate(0.46125,(0.1125+0.005)*i*-1,-1.0125);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix =translate(-0.46125,(0.1125+0.005)*i,-1.0125);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix2 =translate(-0.46125,(0.1125+0.005)*i*-1,-1.0125);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);
}
var temp5 = mult(modelViewMatrix, translate(0.46125,0.45,-0.50625));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(temp5));
gl.drawArrays(tcolorr() , 0, NumVertices);

var temp6 = mult(modelViewMatrix, translate(-0.46125, 0.45, -0.50625));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(temp6));
gl.drawArrays(tcolorr() , 0, NumVertices);

for(i = 1;i <5;i++){
  var instanceMatrix =translate(0.46125,0.45,(0.1125+0.005)*i-0.50625);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);
//here
  var instanceMatrix2 =translate(0.46125,0.45,(0.1125+0.005)*i*-1-0.50625);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix =translate(-0.46125,0.45,(0.1125+0.005)*i-0.50625);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);
//here
  var instanceMatrix2 =translate(-0.46125,0.45,(0.1125+0.005)*i-0.5625-0.50625);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);
}


var temp7 = mult(modelViewMatrix, translate(0.46125, -0.45,-0.50625));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(temp7));
gl.drawArrays(tcolorr() , 0, NumVertices);

var temp8 = mult(modelViewMatrix, translate(-0.46125, -0.45, -0.50625));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(temp8));
gl.drawArrays(tcolorr() , 0, NumVertices);

for(i = 1;i <5;i++){
  var instanceMatrix =translate(0.46125,-0.45,(0.1125+0.005)*i-0.50625);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);
//here
  var instanceMatrix2 =translate(0.46125,-0.45,(0.1125+0.005)*i*-1-0.50625);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);

  var instanceMatrix =translate(-0.46125,-0.45,(0.1125+0.005)*i-0.50625);
  var t = mult(modelViewMatrix, instanceMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  gl.drawArrays(tcolorr() , 0, NumVertices);
//here
  var instanceMatrix2 =translate(-0.46125,-0.45,(0.1125+0.005)*i-0.5625-0.50625);
  var t2 = mult(modelViewMatrix, instanceMatrix2);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t2));
  gl.drawArrays(tcolorr() , 0, NumVertices);
}



}

function projections(pflag){

  if(trackballMove) {
    tAxis = normalize(tAxis);
    rotationMatrix = mult(rotationMatrix, rotate(angle, tAxis));
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
  }
  if(!pFlag){
    eye = vec3(oradius*Math.sin(ophi), oradius*Math.sin(otheta),
         oradius*Math.cos(ophi));
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(oleft, oright, obottom, oytop, onear, ofar);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

  }else{
    eye = vec3(pradius*Math.sin(ptheta)*Math.cos(pphi),
        pradius*Math.sin(ptheta)*Math.sin(pphi), pradius*Math.cos(ptheta));
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(pfovy, paspect, pnear, pfar);
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

  }

}
