document.getElementById("patternSelect").addEventListener("change", MakePattern, false);

function MakePattern(){
  switch (patternSelect.value) {
    case "Cross":
      MakeCross();
      break;
    case "Thick X":
      MakeFatX();
      break;
    case "Thin X":
      MakeThinX();
      break;
    case "Horizontal":
      MakeHorizontal();
      break;
    case "Vertical":
      MakeVertical();
      break;
    case "SquareDrop":
      MakeSquare();
      break;
    case "3 Connected Beads":
      MakeBeads();
      break;
    case "5 Bead Network":
      MakeNetworkBeads();
      break;
    case "Diagonal":
      MakeDiagonal();
      break;
    case "Circular Droplet":
      MakeCircle();
      break;
    case "Annulus (Donut)":
      MakeDonut();
      break;
    case "Grating":
      MakeGrating();
      break;
    case "Dots":
      MakeDots();
      break;
  }
}


function MakeSquare(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if( Math.abs((Size/2)-i)<Size*0.1 &&  Math.abs((Size/2)-j)<Size*0.1 ){
        s[i][j] = 1;
      } else{
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }
}


function MakeGrating(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
        s[i][j] = 1;
        colorSquare(i, j);
    }
  }

  for(var m = 0; m < Size; m++){
    var c = 0;
    for(var n = 0; n < Size; n+=3){
      var g = n+c;
      var fa = m+c;
      s[fa][g] = -1;
      colorSquare(fa, g);
    }
    c +=5;
  }
}


function MakeDots(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      s[i][j] = 1;
      colorSquare(i, j);
    }
  }

  var c = 0;
  for(var m = 0; m < Size; m++){
    for(var n = 0; n < Size; n+=2){
        var g = n+c
        var fa = m+c
        s[fa][g] = -1;
        colorSquare(fa, g);
    }
    c++;
  }
}


function MakeFatX(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if(i==j || i==Size-j-1 || i==j-1 || i==Size-j || i==j+1 || i==Size-j+1 || i==j+2 || i==Size-j+2 || i==j+3 || i==Size-j+3 || i==j+4 || i==Size-j+4  || i==j+5 || i==Size-j+5  || i==j+6 || i==Size-j+6  || i==j+7|| i==Size-j+7 || i==j+8|| i==Size-j+8 || i==j+9|| i==Size-j+9 || i==j+10|| i==Size-j+10){
        s[i][j] = 1;
      } else{
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  } 
}

function MakeThinX(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if(i==j || i==Size-j-1){
        s[i][j] = 1;
      } else{
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }
}

function MakeCross(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if(i==(Size/2) -1 || j==(Size/2) -1 || i==(Size/2) || j==(Size/2) || i==(Size/2) -2 || j==(Size/2) -2 || i==(Size/2) +1 || j==(Size/2) +1|| i==(Size/2) +2 || j==(Size/2) +2 ){
        s[i][j] = 1;
      } else{
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }
}


function MakeHorizontal(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if(Math.abs((Size/2)-i)<Size*0.1){
        s[i][j] = 1;
      } else{
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }
}

function MakeVertical(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if(Math.abs((Size/2)-j)<Size*0.1){
        s[i][j] = 1;
      } else{
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }
}

function MakeBeads(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if( Math.sqrt( ( Size/2 - (j*3 - Size*.15) )**2 + (Size/2 - (i*3 -Size*.15))**2 ) < (Size/2)  || Math.sqrt( ( Size/2 - (j*3 - Size*1.9))**2 + (Size/2 - (i*3 - Size*1.9)  )**2 ) < Size/2 || Math.sqrt( ( Size/2 - (j*3 - Size*1.02))**2 + (Size/2 - (i*3 - Size*1.02)  )**2 ) < Size/2 || i==j || i==j-1 || i==j+1 || i==j+2 || i==j-2 || i==j+3 || i==j-3 ){
        s[i][j] = 1;
      } else{
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }
}


function MakeNetworkBeads(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if( Math.sqrt( ( Size/2 - (j*3 - Size*.15) )**2 + (Size/2 - (i*3 -Size*.15))**2 ) < (Size/2)  || Math.sqrt( ( Size/2 - (j*3 - Size*1.9))**2 + (Size/2 - (i*3 - Size*1.9)  )**2 ) < Size/2 || Math.sqrt( ( Size/2 - (j*3 - Size*1.02))**2 + (Size/2 - (i*3 - Size*1.02)  )**2 ) < Size/2 || i==j || i==j-1 || i==j+1 || i==j+2 || i==j-2 || i==j+3 || i==j-3 || Math.sqrt( ( Size/2 - (j*3))**2 + (Size/2 - (i*3 - Size*1.9)  )**2 ) < Size/2 ||Math.sqrt( ( Size/2 - (i*3 - Size*.1) )**2 + (Size*2.5 - j*3 - 5)**2 ) < (Size/2) || i==Size-j-1 || i==j-1 || i==Size-j || i==Size-j-2 || i==Size-j+2  || i==Size-j+1 || i==Size-j+3 || i==Size-j-3 ){
        s[i][j] = 1;
      } else{
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }
}

function MakeDiagonal(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if(i==j || i==j-1 || i==j+1){
      } else {
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }    
  s[i][j] = 1; 
}

function MakeCircle(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if( Math.sqrt( ( Size/2 - (j*3 - Size))**2 + (Size/2 - (i*3 - Size)  )**2 ) < Size/2){
          s[i][j] = 1;
      } else{
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }
}


function MakeDonut(){
  for(var i = 0; i < Size; i++){
    for(var j = 0; j < Size; j++){
      if( (Math.sqrt( ( Size/2 - (j*3 - Size))**2 + (Size/2 - (i*3 - Size)  )**2 ) < Size/2) &&  (Math.sqrt( ( Size/2 - (j*6 - Size*2.5))**2 + (Size/2 - (i*6 - Size*2.5)  )**2 ) > Size/2) ){
        s[i][j] = 1;
      } else {
        s[i][j] = -1;
      }
      colorSquare(i, j);
    }
  }
}

