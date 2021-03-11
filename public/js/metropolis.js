// All functions for METROPOLIS algorithm
// Original code can be found in IsingModelIndex.html

// Variables defined in all.js:
//  * var zeroT
//  * var Ecurrent
//  * var Mcurrent
//  * var Size
//  * var s -- the 2D array 'grid' that is mapped to the canvas
//  * var CouplingConstant
//  * var InnerLoopCount
//  * var Bfield
//  * var BfieldM

// Functions defined in all.js:
//  * colorSquare

// Functions defined in dipoles.js: 
//  * getLeft
//  * getRight
//  * getTop
//  * getBottom

// Style notes: 
//  * global-scope 'constants' and closures will be capitalized and/or annotated. 
//  * local-scope 'constants' and closures will be capitalized and start with an _Underscore for ease of reading.
//      - e.g. _Ediff, _EdiffforM

/* ------------------------ */
/* METROPOLIS               */
/* ------------------------ */
// runs the metropolis algorithm and colors squares accordingly
function Metropolis() {
    for (var step = 0; step < StepsPerLoop; step++){
        var i = Math.floor(Math.random()*Size);
        var j = Math.floor(Math.random()*Size);
        thisS = s[i][j]; // does this need to be declared here?
        var _Ediff = deltaU(i,j);
        var _EdiffforM = deltaUforM(i,j);
        if (zeroT){ // global closure; to avoid dividing by zero
            if((_EdiffforM < 0.0) || ((_EdiffforM == 0) && (Math.random() < .5))){ //always flip if deltaU is negative or if deltaU is 0 then flip randomly
                thisS *= -1;
                s[i][j] = thisS;
                colorSquare(i,j);
                Ecurrent += _Ediff;
                Mcurrent += (2*thisS);
            }
            //if deltaU is positive then there is no flip when at absolute zero
        }
        else if ((_EdiffforM <= 0.0) || (Math.random() < Math.exp((-_EdiffforM)/T))){
            thisS *= -1;
            s[i][j] = thisS;
            colorSquare(i,j);
            Ecurrent += _Ediff;
            Mcurrent += (2*thisS);

        }
    }
    InnerLoopCount++; //this is a closure
}
 
// energy change without local magnetic field
function deltaU(i,j){
    var left = getLeft(i,j);
    var right = getRight(i,j);
    var top = getTop(i,j);
    var bottom = getBottom(i,j);
    var thisS = s[i][j];
    return (2.0 * CouplingConstant * thisS * (top+bottom+left+right)+2.0 * thisS * Bfield)
}

//computes energy change if dipole s[i][j] is flipped with local magnetic field
function deltaUforM(i, j){
    var left = getLeft(i,j);
    var right = getRight(i,j);
    var top = getTop(i,j);
    var bottom = getBottom(i,j);
    var thisS = s[i][j];

    return (2.0 * CouplingConstant * thisS * (top+bottom+left+right))+ (2.0 * thisS *(Bfield+BfieldM[i][j]));
}

//computes total energy from scratch when using the metropolis algorithm
function ComputeEforMetropolis(){
    Ecurrent = 0.0;
    Mcurrent = 0.0;
    for(var i=0; i<Size; i++){
        for(var j=0; j<Size; j++){
            var right = getRight(i,j);
            var bottom = getBottom(i,j);
            var thisS = s[i][j];
            Ecurrent = Ecurrent - CouplingConstant*thisS*(right+bottom)-thisS*Bfield;
            Mcurrent+= thisS;
        }
    }
}

