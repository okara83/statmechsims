// Functions for Kawasaki Non-Local and Kawasaki Local

// The following variables can be found in all.js:
//  * var zeroT
//  * var Ecurrent
//  * var Mcurrent
//  * var Size
//  * var s -- the 2D array 'grid' that is mapped to the canvas
//  * var CouplingConstant
//  * var InnerLoopCount
//  * var Bfield
//  * var BfieldM

// The following functions can be found in all.js:
//  * colorSquare
//  * getLeft
//  * getRight
//  * getTop
//  * getBottom

// Style notes: 
//  * global-scope 'constants' and closures will be capitalized and/or annotated. 
//  * local-scope 'constants' and closures will be capitalized and start with an _Underscore for ease of reading.
//      - e.g. _Ediff, _EdiffforM

 
/* ------------------------ */
/* KAWASAKI NON-LOCAL       */
/* ------------------------ */
//Runs the Kawasaki algorithm and colors squares accordingly
function MetropolisforKawasaki(){
    for (var step = 0; step <StepsPerLoop; step++){
        var i1 = Math.floor(Math.random()*Size);
        var j1 = Math.floor(Math.random()*Size);
        var i2 = Math.floor(Math.random()*Size);
        var j2 = Math.floor(Math.random()*Size);
        if (s[i1][j1] != s[i2][j2]){ // s is a closure; it is the 2D array 'grid' that is mapped to the canvas
            var thisS = s[i1][j1];
            var thatS = s[i2][j2];
            var _EdiffforM = deltaUforKawasakiforM(i1, j1, i2, j2);
            var _Ediff = deltaUforKawasaki(i1, j1, i2, j2);
            if (zeroT){ //to avoid dividing by zero
                if ((_EdiffforM < 0.0) || ((_EdiffforM == 0) && (Math.random() < .5))){ //always flip if deltaU is negative
                    thisS *= -1;
                    s[i1][j1] = thisS;
                    thatS *= -1;
                    s[i2][j2] = thatS;
                    colorSquare(i1, j1);
                    colorSquare(i2, j2);
                    Ecurrent += _Ediff;
                    Mcurrent += ((2*thisS) + (2*thatS));
                }
            }
            else if ((_EdiffforM <= 0.0) || (Math.random() < Math.exp((-_EdiffforM)/T))){
                thisS *= -1;
                s[i1][j1] = thisS;
                thatS *= -1;
                s[i2][j2] = thatS;
                colorSquare(i1, j1);
                colorSquare(i2, j2);
                Ecurrent += _Ediff;
                Mcurrent += ((2*thisS) + (2*thatS));
            }
        }
    }
    InnerLoopCount++; //this is a closure
}

// energy change for kawaskai without local magnetic field
function deltaUforKawasaki(i1, j1, i2, j2){
    var thisS = s[i1][j1];
    var thatS = s[i2][j2];

    var left1 = getLeft(i1,j1);
    var right1 = getRight(i1,j1);
    var top1 = getTop(i1,j1);
    var bottom1 = getBottom(i1,j1);

    var left2 = getLeft(i2,j2);
    var right2 = getRight(i2,j2);
    var top2 = getTop(i2,j2);
    var bottom2 = getBottom(i2,j2);

    if ((j2 == 0 && j1 == Size - 1 && i2 == i1) || (j2 == Size - 1 && j1 == 0 && i2 == i1) || (i2 == 0 && i1 == Size - 1 && j2 == j1)
    || (i2 == Size - 1 && i1 == 0 && j2 == j1)) {
        if (pbc || ApbcBothDirections || ApbcOneDirection || PlusMinus)
            return (2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) +
                2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) +
                4.0*CouplingConstant + 2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]));
        else if (FreeBound)
            return (2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) +
                2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) +
                2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][2]));
    }
    else if ((j2 == j1+1 && i2 == i1) || (j1 == j2 + 1 && i1 == i2) || (j2 == j1-1 && i2 == i1) ||
    (j1 == j2 - 1 && i1 == i2) || (j2 == j1 && i2 == i1+1) || (j1 == j2 && i1 == i2 + 1) ||
    (j2 == j1 && i2 == i1-1 || j1 == j2 && i1 == i2 - 1))
        return (2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) +
            2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) +
            4.0*CouplingConstant + 2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]));
    else
        return (2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) +
            2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) +
            2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]));
}

//energy change with local magnetic field
function deltaUforKawasakiforM(i1, j1, i2, j2){
    var thisS = s[i1][j1];
    var thatS = s[i2][j2];

    var left1 = getLeft(i1,j1);
    var right1 = getRight(i1,j1);
    var top1 = getTop(i1,j1);
    var bottom1 = getBottom(i1,j1);

    var left2 = getLeft(i2,j2);
    var right2 = getRight(i2,j2);
    var top2 = getTop(i2,j2);
    var bottom2 = getBottom(i2,j2);

    if (((j2 == j1+1) && i2 == i1) || ((j1 == j2 + 1) && i1 == i2) || ((j2 == j1-1) && (i2 == i1))
    || (j1 == j2 - 1 && i1 == i2) || (j2 == j1 && i2 == i1+1) || (j1 == j2 && i1 == i2 + 1) ||
    (j2 == j1 && i2 == i1-1) || (j1 == j2 && i1 == i2 - 1)){
        return 2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) + 2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) + 4.0*CouplingConstant + 2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]);

    } else {
        return 2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) + 2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) + 2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]);
    }
}

/* ------------------------ */
/* KAWASAKI LOCAL          */
/* ------------------------ */

function MetropolisforKawasakiLocal(){
    for (var step = 0; step <StepsPerLoop; step++){
        var i1 = Math.floor(Math.random()*Size);
        var j1 = Math.floor(Math.random()*Size);
        var dictkey = [i1, j1];
        var tryit = nearestneighs[dictkey]; // nearestneighs is defined below this function
        var randtry = tryit[Math.floor(Math.random()*4)];
        var i2 = randtry[0];
        var j2 = randtry[1];

        if (s[i1][j1] != s[i2][j2]){
            var thisS = s[i1][j1];
            var thatS = s[i2][j2];
            var _EdiffforM = deltaUforKawasakiforM(i1, j1, i2, j2);
            var _Ediff = deltaUforKawasaki(i1, j1, i2, j2);
            if (zeroT){ //to avoid dividing by zero
                if ((_EdiffforM < 0.0) || ((_EdiffforM == 0) && (Math.random() < .5))){ //always flip if deltaU is negative
                    thisS *= -1;
                    s[i1][j1] = thisS;
                    thatS *= -1;
                    s[i2][j2] = thatS;
                    colorSquare(i1, j1);
                    colorSquare(i2, j2);
                    Ecurrent += _Ediff;
                    Mcurrent += ((2*thisS) + (2*thatS));
                }
            } 
            else if ((_EdiffforM <= 0.0) || (Math.random() < Math.exp((-_EdiffforM)/T))){
                thisS *= -1;
                s[i1][j1] = thisS;
                thatS *= -1;
                s[i2][j2] = thatS;
                colorSquare(i1, j1);
                colorSquare(i2, j2);
                Ecurrent += _Ediff;
                Mcurrent += ((2*thisS) + (2*thatS));
            }
        }
    }
    InnerLoopCount++; //this is a closure
}

/* Used in Kawasaki Local */
nearestneighs = new Object();
for (var m = 0; m < Size; m++){
    for (var n = 0; n < Size; n++){
        var pair = [];
        var indexNeighs = [];
        var ordered = [m,n];
        for (var zz = 0; zz < 4; zz++){
            if (zz==0){  //look up
                if (m == 0){
                    pair = [Size-1,n];
                    indexNeighs.push(pair);
                } else{
                    pair = [m-1,n];
                    indexNeighs.push(pair);
                }
            }

            if (zz==1){   //look down
                if (m == Size-1){
                    pair = [0,n];
                    indexNeighs.push(pair);
                } else{
                    pair = [m+1,n];
                    indexNeighs.push(pair);
                }
            }

            if (zz==2){    //look left
                if (n == 0){
                    pair = [m,Size-1];
                    indexNeighs.push(pair);
                    }
                else{ pair = [m,n-1];
                    indexNeighs.push(pair);
                }
            }

            if (zz==3){ //look right
                if (n == Size-1){
                    pair = [m,0];
                    indexNeighs.push(pair);
                } else{
                    pair = [m,n+1];
                    indexNeighs.push(pair);
                }
            }
            nearestneighs[[m,n]] = indexNeighs;
        }
    }
}

// energy change for kawasaki without local magnetic field
function deltaUforKawasakiLocal(i1,j1, i2, j2){
    var thisS = s[i1][j1];
    var thatS = s[i2][j2];

    var left1 = getLeft(i1,j1);
    var right1 = getRight(i1,j1);
    var top1 = getTop(i1,j1);
    var bottom1 = getBottom(i1,j1);

    var left2 = getLeft(i2,j2);
    var right2 = getRight(i2,j2);
    var top2 = getTop(i2,j2);
    var bottom2 = getBottom(i2,j2);

    if ((j2 == 0 && j1 == Size - 1 && i2 == i1) || (j2 == Size - 1 && j1 == 0 && i2 == i1) || (i2 == 0 && i1 == Size - 1 && j2 == j1)
    || (i2 == Size - 1 && i1 == 0 && j2 == j1)) {
        if (pbc || ApbcBothDirections || ApbcOneDirection || PlusMinus)
        return (2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) +
            2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) +
            4.0*CouplingConstant + 2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]));
        else if (FreeBound)
        return (2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) +
            2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) +
            2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][2]));
    }
    else if ((j2 == j1+1 && i2 == i1) || (j1 == j2 + 1 && i1 == i2) || (j2 == j1-1 && i2 == i1) ||
    (j1 == j2 - 1 && i1 == i2) || (j2 == j1 && i2 == i1+1) || (j1 == j2 && i1 == i2 + 1) ||
    (j2 == j1 && i2 == i1-1 || j1 == j2 && i1 == i2 - 1)) {
        return (2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) +
            2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) +
            4.0*CouplingConstant + 2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]));
    } else {
        return (2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) +
            2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) +
            2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]));
    }
}

//energy change with local magnetic field
function deltaUforKawasakiforMLocal(i1, j1, i2, j2){
    var thisS = s[i1][j1];
    var thatS = s[i2][j2];

    var left1 = getLeft(i1,j1);
    var right1 = getRight(i1,j1);
    var top1 = getTop(i1,j1);
    var bottom1 = getBottom(i1,j1);

    var left2 = getLeft(i2,j2);
    var right2 = getRight(i2,j2);
    var top2 = getTop(i2,j2);
    var bottom2 = getBottom(i2,j2);

    if (((j2 == j1+1) && i2 == i1) || ((j1 == j2 + 1) && i1 == i2) || ((j2 == j1-1) && (i2 == i1))
    || (j1 == j2 - 1 && i1 == i2) || (j2 == j1 && i2 == i1+1) || (j1 == j2 && i1 == i2 + 1) ||
    (j2 == j1 && i2 == i1-1) || (j1 == j2 && i1 == i2 - 1)){
        return 2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) + 2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) + 4.0*CouplingConstant + 2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]);
    } else {
        return 2.0*CouplingConstant*thisS*(bottom1 + top1 + left1 + right1) + 2.0*CouplingConstant*thatS*(bottom2 + top2 + left2 + right2) + 2.0*thisS*(Bfield+BfieldM[i1][j1]) + 2.0*thatS*(Bfield+BfieldM[i2][j2]);
    }
}
