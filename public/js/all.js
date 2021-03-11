/* ------------------------ */
/* DOM VARIABLES            */
/* ------------------------ */
//variables from html, organized by how they appear top to bottom, left to right on the webpage
var canvas = document.getElementById("theCanvas");
var context = canvas.getContext("2d");
var nThicknessInput = document.getElementById("nThicknessInput");// n = nanotube
var nDiameterInput = document.getElementById("nDiameterInput");
var nHeightInput = document.getElementById("nHeightInput");
var nSpinSelect = document.getElementById("nSpinSelect");
var molRatioSlider = document.getElementById("molRatioSlider"); //mol = mole
var molRatioReadout = document.getElementById("molRatioReadout");
var spfReadout = document.getElementById("spfReadout");
var spfSlider = document.getElementById("spfSlider");
var tempInput = document.getElementById("tempInput");
var BfieldInput = document.getElementById("BfieldInput");
var magnetSelect = document.getElementById("magnetSelect");
var sizeSelect = document.getElementById("sizeSelect");
var algorithmSelect = document.getElementById("algorithmSelect");
var boundarySelect = document.getElementById("boundarySelect");
var showSpinCheck = document.getElementById("showSpin");
var SettleBInput = document.getElementById("SettleB");
var startButton = document.getElementById("startButton");
var show = document.getElementById("show"); //for testing purposes
var patternSelect = document.getElementById("patternSelect");
var graphButton = document.getElementById("graphButton");
var incrementGraphSelect = document.getElementById("incrementGraphSelect");
var typeGraphSelect = document.getElementById("typeGraphSelect");


/* ------------------------ */
/* OUTPUT DATA              */
/* ------------------------ */
// Displayed in DOM in Data Table
// Default values
var InnerLoopCount = 0;
var StepsPerLoop = Math.pow(10, Number(spfSlider.value)); // this*innerLoopCount rounded to the nearest hundredth = steps that are shown
var Ecurrent = 0.0; //energy of current loops in algorithm
var EsquaredTotal = 0.0; // declared to calculate sigmaE
var Etotal = 0.0; //total energy, declared to calculate average energy

var Mcurrent = 0.0; //magnetization of loop
var MsquaredTotal = 0.0; //see EsquaredTotal
var Mtotal = 0.0; //total magnetization, used in average


/* ------------------------ */
/* CALCULATION PARAMETERS   */
/* ------------------------ */

//inputs
var T = Number(tempInput.value); //temperature
var zeroT = false; //true when t = 0

var Bfield = Number(BfieldInput.value); //magnetic field

//initialize magnet options
magnetSelect.selectedIndex = 0; //ferromagnetic is the default
var CouplingConstant;
if(magnetSelect.value == "Ferromagnetic")
    CouplingConstant = 1;
else
    CouplingConstant = -1;


//size
sizeSelect.selectedIndex = 9; //default is 100
var Size = Number(sizeSelect.options[sizeSelect.selectedIndex].text);  // dimensions of lattice
var SquareWidth = canvas.width/Size; //size of each square determined by size of lattice
var upRatio = 0.0; //for when you use the mol ratio creator slider/button, decimal of "up" spins
changeMolRatioSettings();

//algorithm
algorithmSelect.selectedIndex = 0; //default is metropolis
var algorithm = 0; //0 is metropolis, 1 is kawasaki nonlocal, and 2 is kawasaki local, selecting BEG or Wolff will take you to a different webpage


//boundary conditions
boundarySelect.selectedIndex = 0; //default is regular pbc
var pbc = true;
var ApbcBothDirections = false;
var ApbcOneDirection = false;
var FreeBound = false; //for isolated boundaries
var screw = false;
//for all boundary conditons below, they are really just pbc with fixed positive or negative edges
var PlusMinus = false;
var skewedPlusMinus = false;
var plusBothDirections = false;
var minusBothDirections = false;
             
 
var showSpin = showSpinCheck.checked; // if true will show in a different color the squares that are manually changed

s
var SettleB = SettleBInput.value; //Dipole Settle Mode-what the square will flip to when it is clicked on

var maxSize = canvas.width; //used in resize()
var running = false; //true when running

// initialize
//sets local magnetic field of all dipoles to zero initially
var BfieldM = new Array(Size);
for (var i = 0; i < Size; i++){
    BfieldM[i] = new Array(Size);
    for (var j = 0; j < Size; j++){
        BfieldM[i][j] = 0;
    }
}


//sets a random 2D array of dipoles and colors them accordingly
var s = new Array(Size);
for (var i = 0; i < Size; i++){
    s[i] = new Array(Size);
    for (var j = 0; j < Size; j++){
        if(Math.random() < 0.5)
            s[i][j] = 1;

        else
            s[i][j] = -1;

        colorSquare(i, j);
    }
}

//these will be defined when someone saves a configuration so that the user can easily go back to the initial saved configuration
var initS;
var initBfieldM;
var initSettings;

//for graph of temp vs. magnetization
var graphOn = false;


/* ------------------------ */
/* START CALC               */
/* ------------------------ */
//computes current energy of original lattice before simulation begins (resetData() then resets the averages, not current energy)
if (algorithm == 0){
    ComputeEforMetropolis();
}
else if (algorithm == 1){
    ComputeEforKawasaki();
}
else{
    ComputeEforKawasakiLocal();
}
resetData();
simulate();
 
// SIMULATE -- parses which alg to run
function simulate(){
    if(running){
        if(algorithm == 0){
            Metropolis();
        }
        else if(algorithm == 1){
            MetropolisforKawasaki();
        }
        else {
            MetropolisforKawasakiLocal();
        }
        Cumulate();
    }
    DisplayData();
    window.setTimeout(simulate, 1); //comes back in 1 millisecond
}

/* ---------------------------------- */
/* DIPOLES FOR Metropolis & Kawasaki  */
/* ---------------------------------- */
//returns the dipole to the left of s[i][j] taking into account boundary conditions
function getLeft(i, j){
    if (j == 0) {
        if(pbc) //or any other boundary condition not listed here:
            return s[i][Size -1];

        else if(ApbcBothDirections)
            return -s[i][Size -1];

        else if (ApbcOneDirection)
            return -s[i][Size -1];

        else if(FreeBound)
            return 0;

    } else {
        return s[i][j-1];
    }
}
 
 //returns the dipole to the right of s[i][j] taking into account boundary conditions
function getRight(i, j){
    if (j == Size-1) {
        if(pbc)
            return s[i][0];
        else if (ApbcBothDirections)
            return -s[i][0];
        else if (ApbcOneDirection)
            return -s[i][0];
        else if (FreeBound)
            return 0;
    }
    else
        return s[i][j+1];
}

//dipole above s[i][j] with boundary conditions
function getTop(i, j){
    if (i==0)
    {
        if(pbc)
            return s[Size-1][j];
        else if (ApbcBothDirections)
            return -s[Size-1][j];
        else if (ApbcOneDirection)
            return s[Size-1][j];
        else if (FreeBound)
            return 0;
    }
    else
        return s[i-1][j];
}

//dipole below with boundary conditions
function getBottom(i,j){
    if (i==Size-1){
        if(pbc)
            return s[0][j];
        else if (ApbcBothDirections)
            return -s[0][j];
        else if (ApbcOneDirection)
            return s[0][j];
        else if (FreeBound)
            return 0;
    }
    else
        return s[i+1][j];
}


/* ------------------------ */
/* CUMULATE                 */
/* ------------------------ */
//adds in stats of the current loop
function Cumulate(){
    Etotal += Ecurrent;
    EsquaredTotal += (Ecurrent*Ecurrent);
    Mtotal += Mcurrent;
    MsquaredTotal += (Mcurrent*Mcurrent);
}

/* ------------------------ */
/* CALC & DISPLAY DATA      */
/* ------------------------ */
var Mav; //so that it can be accessed in the temperature vs. magnetization plot
//changes data display of energy and magnitization
function DisplayData(){
    var Steps, Eav, Esquaredav, SigmaE, Msquaredav, SigmaM;
    if(InnerLoopCount == 0){
        Steps = 0;
        Eav = 0.0;
        SigmaE = 0.0;
        Mav = 0.0;
        SigmaM = 0.0;
    }
    else{
        if(StepsPerLoop >= 100) {
            Steps = InnerLoopCount*(StepsPerLoop/100)*100;
        } else { 
            Steps = InnerLoopCount*StepsPerLoop; //can't round off to hundreths place if stepsPerLoop is below 100
        }
        Eav = Etotal/InnerLoopCount;
        var Esquaredav = EsquaredTotal/InnerLoopCount;
        SigmaE = Math.sqrt(Esquaredav-(Eav*Eav));
        Mav = Mtotal/InnerLoopCount;
        Msquaredav = MsquaredTotal/InnerLoopCount;
        SigmaM = Math.sqrt(Msquaredav - (Mav*Mav));
    }
    var sizeSquared = Size*Size;
    var data = [Steps, Ecurrent, Eav, SigmaE, Mcurrent, Mav, SigmaM];
    var dataNames =["Steps", "Energy", "Eav", "SigmaE", "M", "Mav", "SigmaM"];
    document.getElementById(dataNames[0]).innerHTML = data[0]; //because number of steps is the only data that doesn't have to be divided by sizeSquared
    for(var i = 1; i < data.length; i++){ //starts at "Energy", looping through the two arrays saves space
        document.getElementById(dataNames[i]).innerHTML = (data[i]/sizeSquared).toFixed(3);
    }
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

//computes total energy from scratch when using the kawasaki algorithm
function ComputeEforKawasaki(){
    Ecurrent = 0.0;
    Mcurrent = 0.0;
    for(var i=0; i<Size; i++){
        for(var j=0; j<Size; j++){
            var right = getRight(i,j);
            var left = getLeft(i,j);
            var top = getTop(i,j);
            var bottom = getBottom(i,j);
            var thisS = s[i][j];
            Ecurrent = Ecurrent - .5*CouplingConstant*thisS*(right+left+top+bottom)-thisS*Bfield
            Mcurrent += thisS;
        }
    }
}
 
/* ------------------------ */
/* SPIN                     */
/* ------------------------ */
// jquery for setting the spin by clicking on a square
// this can all be easily split out
$(document).ready(function(){

    //for when the mouse is dragged or clicked
    var mouseDown = false;

    var oldI, oldJ, newI, newJ; //so it doesn't flip the spin more than once in one square we distinguish between old and new
    $("canvas").mousedown(function(event){
        mouseDown = true;

        var offSet = $(this).offset();
        var x = event.pageX - offSet.left,
            y = event.pageY - offSet.top;

        oldI = Math.floor(y/SquareWidth);
        oldJ = Math.floor(x/SquareWidth);
        setSpin(oldI,oldJ);

    });
    $(document).mouseup(function(event){
        mouseDown = false;
    });

    //make an unset square button
    $("canvas").mousemove(function(event){
        if(mouseDown){
            var offSet = $(this).offset();
            var x = event.pageX - offSet.left,
                y = event.pageY - offSet.top;
            newI = Math.floor(y/SquareWidth);
            newJ = Math.floor(x/SquareWidth);
            if((newI != oldI) || (newJ != oldJ))
            {
                oldI = newI;
                oldJ = newJ;
                setSpin(newI, newJ);
            }
        }
    });
});


function setSpin(i, j){
    if(SettleB == 0.0){
        Ecurrent += deltaUforM(i,j); //update energy value
        s[i][j] *= -1;
        Mcurrent += (2.0*s[i][j]);//update magnetization value
    } else { // only changes value/color if the SettleB and previous value don't match
        if (s[i][j] == 1 && SettleB < -0.1)  {
            Ecurrent += deltaUforM(i,j);
            s[i][j] *= -1;
            Mcurrent += (2.0*s[i][j]);
        } else if(s[i][j] == -1 && SettleB >0.1){
            Ecurrent += deltaUforM(i,j);
            s[i][j] *= -1;
            Mcurrent += (2.0*s[i][j]);
        }
    }
    BfieldM[i][j] = SettleB; //make sure local magnetic field is updated
    colorSquare(i,j);
}

/* ------------------------ */
/* COLOR CANVAS             */
/* ------------------------ */
//colors a certain square, taking into account if it has been set manually and if it's set to bipartite
function colorSquare(i, j) {
    if(!showSpin && BfieldM[i][j] == 100)// basically if the square is part of a nanotube it will be a darker blue
        context.fillStyle = "#00008B";
    else if(!showSpin && BfieldM[i][j] == -100)
        context.fillStyle = "#FFD700"; //or a darker yellow
    else if(showSpin && BfieldM[i][j] > .0001)
        context.fillStyle = '#ff0000';

    else if (showSpin && BfieldM[i][j] < -.0001)
        context.fillStyle = '#008000';

    else{
        if((magnetSelect.selectedIndex == 2) && (i%2 == j%2)){
            if(s[i][j] == 1)
                context.fillStyle = '#ffff00';
            else
                context.fillStyle = '#0000ff';
        }
        else{
            if(s[i][j]== 1)
                context.fillStyle = '#0000ff';
            else
                context.fillStyle = '#ffff00';
        }
    }
    context.fillRect(j*SquareWidth, i*SquareWidth, SquareWidth,SquareWidth);
}
 
// Color all squares
function colorAll(){
    for(var i = 0; i < Size; i++) {
        for(var j = 0; j < Size; j++){
            colorSquare(i,j);
        }
    }
}

//recolors squares and resets Bfield (for use in the boundary conditions)
function colorAllAndResetBfieldM(){ 
    for(var i = 0; i < Size; i++) {
        for(var j = 0; j < Size; j++){
            BfieldM[i][j] = 0;
            colorSquare(i,j);
        }
    }
}

/* ------------------------ */
/* DOM BUTTONS              */
/* ------------------------ */
//these functions all have to do with the buttons in the html and are organized by their order of appearance from top to bottom, left to right
//resets tables (except for current energy and magnetization)
function resetData(){
    InnerLoopCount = 0;
    Etotal = 0;
    EsquaredTotal = 0;
    Mtotal = 0;
    MsquaredTotal = 0;
    DisplayData();
}
 
 
function MakePattern(){
    if (patternSelect.value == "Thick X"){
        return MakeFatX();
    }
    if (patternSelect.value == "Thin X"){
        return MakeThinX();
    }
    if (patternSelect.value == "Cross"){
        return MakeCross();
    }
    if (patternSelect.value == "Horizontal"){
        return MakeHorizontal();
    }
    if (patternSelect.value == "Vertical"){
        return MakeVertical();
    }
    if (patternSelect.value == "SquareDrop"){
        return MakeSquare();
    }
    if (patternSelect.value == "3 Connected Beads"){
        return MakeBeads();
    }
    if (patternSelect.value == "5 Bead Network"){
        return MakeNetworkBeads();
    }
    if (patternSelect.value == "Diagonal"){
        return MakeDiagonal();
    }
    if (patternSelect.value == "Circular Droplet"){
        return MakeCircle();
    }
    if (patternSelect.value == "Annulus (Donut)"){
        return MakeDonut();
    }
    if (patternSelect.value == "Grating"){
        return MakeGrating();
    }
    if (patternSelect.value == "Dots"){
        return MakeDots();
    }
}
 
 
 
 
function MakeSquare(){
    for(var i = 0; i < Size; i++){
        for(var j = 0; j < Size; j++){
            if( Math.abs((Size/2)-i)<Size*0.1 &&  Math.abs((Size/2)-j)<Size*0.1 ){
                s[i][j] = 1;
            }
            else{
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
            var g = n+c
            var fa = m+c
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
            }
            else{
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
            }
            else{
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
            }
            else{
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
            }
            else{
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
            }
            else{
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
            }
            else{
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
            }
            else{
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
                s[i][j] = 1;
            }
            else{
                s[i][j] = -1;
            }
            colorSquare(i, j);
        }
    }
}
 
function MakeCircle(){
    for(var i = 0; i < Size; i++){
        for(var j = 0; j < Size; j++){
            if( Math.sqrt( ( Size/2 - (j*3 - Size))**2 + (Size/2 - (i*3 - Size)  )**2 ) < Size/2){
                s[i][j] = 1;
            }
            else{
                s[i][j] = -1;
            }
            colorSquare(i, j);
        }
    }

}
 
 
function MakeDonut(){
    for(var i = 0; i < Size; i++){
        for(var j = 0; j < Size; j++){
            if( (Math.sqrt( ( Size/2 - (j*3 - Size))**2 + (Size/2 - (i*3 - Size)  )**2 ) < Size/2) &&  (Math.sqrt( ( Size/2 - (j*6 - Size*2.5))**2 + (Size/2 - (i*6 - Size*2.5)  )**2 ) > Size/2)  ){
                s[i][j] = 1;
            }
            else{
                s[i][j] = -1;
            }
            colorSquare(i, j);
        }
    }
}
 
/* --- NANOTUBES --- */

//makes a nanotube of set spins shown in dark yellow or blue
function makeNanotube(){
    BfieldInput.value = 0;
    changeBfield();
    tempInput.value = 1;
    changeT();
    var nThickness = Number(nThicknessInput.value);
    var nDiameter = Number(nDiameterInput.value);
    var nHeight = Number(nHeightInput.value);
    if(nSpinSelect.selectedIndex == 0)
        nSpin = 1;
    else
        nSpin = -1;
    s[0][0] = nSpin; //makes sure it will color everything else the opposite of what the tubes are
    makeAllOneColor();

    var leftIndex = (Math.round(Size/2) - 1) - (Math.round(nDiameter/2) + (nThickness - 1));
    var rightIndex = leftIndex + (nThickness - 1) + (nDiameter + 1);
    var topIndex = (Math.round(Size/2) - 1) - (Math.round(nHeight/2)-1);
    var bottomIndex = topIndex + nHeight;

    for(var i = topIndex; i < bottomIndex; i++){
        for(var j = leftIndex; j < leftIndex + nThickness; j++){
            s[i][j] *= -1;
            BfieldM[i][j] = 100 * nSpin;
            colorSquare(i, j);
        }
    }
    for(var i = topIndex; i < bottomIndex; i++){
        for(var j = rightIndex; j < rightIndex + nThickness; j++){
            s[i][j] *= -1;
            BfieldM[i][j] = 100 * nSpin;
            colorSquare(i, j);
        }
    }

    if (algorithm == 0){
        ComputeEforMetropolis();
    } else if (algorithm = 1){
        ComputeEforKawasaki();
    } else{
        ComputeEforKawasakiLocal();
    }
    resetData();
}
 
function changeNanotubeSettings(){
        nDiameterInput.value = Math.floor(Size/2); //makes sure the default nanotube isn't bigger than the lattice
        nThicknessInput.value = Math.floor(Size/8) + 1;
        nHeightInput.value = Math.floor(Size/2);
        nDiameterInput.max = Size - 2; //makes sure you can't make a nanotube that's bigger than the lattice
        nThicknessInput.max = Math.floor(Size/2);
        nHeightInput.max = Size;
}
 
function changeMolRatioSettings(){//also changes readout and slider value
    //ratios available depend on the size of the lattice so they can evenly divide into the size
    if(Size%4 == 0){
        molRatioSlider.value = 2;
        molRatioSlider.max = 4;
    }
    else if(Size%5 == 0){
        molRatioSlider.value = 3;
        molRatioSlider.max = 5;
    }
    else if(Size%3 == 0){
        molRatioSlider.value = 1;
        molRatioSlider.max = 3;
    }
    changeMolRatio();
}
 
function changeMolRatio(){//ONLY changes readout
    var v = Number(molRatioSlider.value);

    if(Size%4 == 0)
        upRatio = v/4;

    else if(Size%5 == 0)
        upRatio = v/5;

    else if(Size%3 == 0)
        upRatio = v/3;
    var downRatio = (1 - upRatio).toFixed(2);
    molRatioReadout.innerHTML = "Mole Ratio: " + upRatio+ " Up and " + downRatio + " Down";
}
 
function execMolRatio(){//actually creates the mole ratio
    var middleIndex = upRatio*Size; //where the "up" part will end and the "down" part will start in the lattice
    var topSpin = -s[0][0]; //decides the spin of the top part of the lattice by taking the opposite of the current spin (so when you press "executemolratio" again, it  flip the color of the top and bottom part)
    for(i = 0; i < middleIndex; i++){
        for(j = 0; j< Size; j++){
            s[i][j] = topSpin;
            BfieldM[i][j]= 0;
            colorSquare(i,j);
        }
    }
    for(i = middleIndex; i <Size; i++){
        for(j= 0; j<Size; j++){
            s[i][j] = -topSpin;
            BfieldM[i][j] = 0;
            colorSquare(i,j);
        }
    }
    if (algorithm == 0){
        ComputeEforMetropolis();
    }
    else if (algorithm = 1){
        ComputeEforKawasaki();
    }
    else{
        ComputeEforKawasakiLocal();
    }
    resetData();
}
 
function changeSpf(){
    StepsPerLoop = Math.pow(10, Number(spfSlider.value));
    spfReadout.innerHTML = " Steps Per Frame: " + StepsPerLoop;
}
 
function changeT(){
    T = Number(tempInput.value);
    if(T==0)
        zeroT = true;
    else
        zeroT = false;
}

function changeBfield(){
    Bfield = Number(BfieldInput.value);
}
 
function changeMagnet(){
    if(magnetSelect.selectedIndex == 0) //if it's ferromagnetic
        CouplingConstant = 1;
    else
        CouplingConstant = -1;
    colorAll(); //have to recolor all the squares if its been change from or to bipartite
}
 
 
//resizes lattice
function resize() {
    // First up-sample the lattice into a temporary array at max resolution:
    var tempS = new Array(maxSize);
    for (var i=0; i<maxSize; i++) {
        tempS[i] = new Array(maxSize);
        for (var j=0; j<maxSize; j++) {
            var iOld = Math.floor(i / SquareWidth);
            var jOld = Math.floor(j / SquareWidth);
            tempS[i][j] = s[iOld][jOld];
        }
    }
    // Get new size from GUI selector:
    Size = Number(sizeSelect.options[sizeSelect.selectedIndex].text);
    SquareWidth = canvas.width / Size;

    // Now re-create the spin array, down-sampling from temporary array
    s = new Array(Size);
    BfieldM = new Array(Size);
    for (var iNew=0; iNew<Size; iNew++) {
        s[iNew] = new Array(Size);
        BfieldM[iNew] = new Array(Size);
        for (var jNew=0; jNew<Size; jNew++) {
            var sTotal = 0;
            //iterates through one square in the new lattice
            for (var i=iNew*SquareWidth; i<(iNew+1)*SquareWidth; i++) {
                for (var j=jNew*SquareWidth; j<(jNew+1)*SquareWidth; j++) {
                    sTotal += tempS[i][j];
                }
            }
            if (sTotal > 0) {
                s[iNew][jNew] = 1;// average determines down-sampled value of that square
            }
            else if (sTotal < 0) {
                s[iNew][jNew] = -1;
            }
            else { // resolve ties with a random number
                if (Math.random() < 0.5) 
                    s[iNew][jNew] = 1;
                else 
                    s[iNew][jNew] = -1;
            }
            BfieldM[iNew][jNew] = 0;
            colorSquare(iNew, jNew);
        }
    }
    resetData();

    if (algorithm == 0){
        ComputeEforMetropolis();
    }
    else if (algorithm = 1){
        ComputeEforKawasaki();
    }
    else{
        ComputeEforKawasakiLocal();
    }
    changeNanotubeSettings();
    changeMolRatioSettings();
}
 
 
 
 
 
function changeAlgorithm(){
    if(algorithmSelect.selectedIndex < 3){//if the algorithm is either metropolis or either kawasaki local or nonlocal
        algorithm = algorithmSelect.selectedIndex
    }
    else if (algorithmSelect.selectedIndex == 3){
        location.href = "BEG.html";
    }
    else{
        location.href = "wolff.html";
    }
}


function changeBoundaries(){
    pbc = false;
    ApbcBothDirections = false;
    ApbcOneDirection = false;

    //only set them true if select says they are
    if(boundarySelect.selectedIndex == 0){
        pbc = true;
        colorAllAndResetBfieldM();
    }

    else if(boundarySelect.selectedIndex == 1){
        ApbcBothDirections = true;
        colorAllAndResetBfieldM();
    }

    else if(boundarySelect.selectedIndex == 2){
        ApbcOneDirection = true;
        colorAllAndResetBfieldM();
    }

    else if(boundarySelect.selectedIndex ==3){
        FreeBound = true;
        colorAllAndResetBfieldM();
    }

    //everything below just uses pbc but have skewed borders
    else if(boundarySelect.selectedIndex == 4){
        pbc = true; //other than top and bottom rows, all other boundaries are the same as pbc
        for(var j = 0; j < Size; j++){ //sets the top and bottom rows to be either positive or negative with a large local magnetic field
            s[0][j] = 1;
            BfieldM[0][j] = 100;
            colorSquare(0,j);

            s[Size-1][j] = -1;
            BfieldM[Size-1][j] = -100;
            colorSquare(Size-1, j);
        }
    }

    else if(boundarySelect.selectedIndex == 5){
        pbc = true;
        for(var j = 0; j < Size; j++){
            s[0][j] = 1;
            BfieldM[0][j] = 100;
            colorSquare(0,j);

            s[Size-1][j] = -1;
            BfieldM[Size-1][j] = -100;
            colorSquare(Size-1, j);
        }

        for(var i = 0; i < Size; i++){
            s[i][0] = 1;
            BfieldM[i][0] = 100;
            colorSquare(i,0);

            s[i][Size-1] = -1;
            BfieldM[i][Size-1] = -100;
            colorSquare(i, Size-1);
        }
    }
    else if(boundarySelect.selectedIndex == 6){
    pbc = true;
        for(var j = 0; j < Size; j++){
            s[0][j] = 1;
            BfieldM[0][j] = 100;
            colorSquare(0,j);

            s[Size-1][j] = 1;
            BfieldM[Size-1][j] = 100;
            colorSquare(Size-1, j);
        }

        for(var i = 0; i < Size; i++){
            s[i][0] = 1;
            BfieldM[i][0] = 100;
            colorSquare(i,0);

            s[i][Size-1] = 1;
            BfieldM[i][Size-1] = 100;
            colorSquare(i, Size-1);
        }
    }

    else if(boundarySelect.selectedIndex == 7){
        pbc = true;
        for(var j = 0; j < Size; j++){
            s[0][j] = -1;
            BfieldM[0][j] = -100;
            colorSquare(0,j);

            s[Size-1][j] = -1;
            BfieldM[Size-1][j] = -100;
            colorSquare(Size-1, j);
        }

        for(var i = 0; i < Size; i++){
            s[i][0] = -1;
            BfieldM[i][0] = -100;
            colorSquare(i,0);

            s[i][Size-1] = -1;
            BfieldM[i][Size-1] = -100;
            colorSquare(i, Size-1);
        }
    }
    
    //new screw/twist bc
    else if(boundarySelect.selectedIndex == 8){
        pbc = true;
        for(var j = 0; j < Size; j++){
            s[0][j] = -1;
            BfieldM[0][j] = -100;
            colorSquare(0,j);

            s[Size-1][j] = -1;
            BfieldM[Size-1][j] = -100;
            colorSquare(Size-1, j);
        }

        for(var i = 0; i < Size; i++){
            s[i][0] = -1;
            BfieldM[i][0] = -100;
            colorSquare(i,0);

            s[i][Size-1] = -1;
            BfieldM[i][Size-1] = -100;
            colorSquare(i, Size-1);
        }
    }
    

    if (algorithm == 0){
        ComputeEforMetropolis();
    }
    else if (algorithm = 1){
        ComputeEforKawasaki();
    }
    else{
        ComputeEforKawasakiLocal();
    }
    resetData();
}
 
 
function changeShowSpin(){
    showSpin = !showSpin;
    colorAll();
}
 
function changeSettleB(){
    SettleB = Number(SettleBInput.value);
}
 
 
 
function randomize(){ //doesn't change fixed boundary conditions
    var startX; //where the algorithm starts horizontally depends on the boundary condition (so we don't change the fixed spins in the skewed boundary conditions)
    var endX; //where it ends horizontally
    var startY;
    var endY;
    //if it's fixed plus minus one way
    if(boundarySelect.selectedIndex == 4){
        startX = 0;
        endX = 0;
        startY = 1;
        endY = Size - 1;
    }
    //fixed plus minus both ways, plus both ways, or minus both ways
    else if(boundarySelect.selectedIndex > 4){
        startX = 1;
        endX = Size - 1;
        startY = 1;
        endY = Size - 1;
    }
    //for all other boundary conditions, there's no need to avoid the top or bottom row because there aren't any fixed spins
    else{
        startX = 0;
        endX = Size;
        startY = 0;
        endY = Size;
    }
    for (var i = startY; i < endY; i++){
        for (var j = startX; j < endX; j++){
            if(Math.random() < 0.5){
                s[i][j] = 1;
            }
            else{
                s[i][j] = -1;
            }
            BfieldM[i][j] = 0;
            colorSquare(i, j);
        }
    }


    if (algorithm == 0){
        ComputeEforMetropolis();
    }
    else if (algorithm = 1){
        ComputeEforKawasaki();
    }
    else{
        ComputeEforKawasakiLocal();
    }
    resetData();
}

//colors all squares opposite of a square in the middle of the lattice, used in "align" button (doesn't mess with fixed boundary conditions)
function makeAllOneColor(){
    var startX; //where the algorithm starts horizontally depends on the boundary condition (so we don't change the fixed spins in the skewed boundary conditions)
    var endX; //where it ends horizontally
    var startY;
    var endY;
    //if it's fixed plus minus one way
    if(boundarySelect.selectedIndex == 4){
        startX = 0;
        endX = 0;
        startY = 1;
        endY = Size - 1;
    }
    //fixed plus minus both ways, plus both ways, or minus both ways
    else if(boundarySelect.selectedIndex > 4){
        startX = 1;
        endX = Size - 1;
        startY = 1;
        endY = Size - 1;
    }
    //for all other boundary conditions, there's no need to avoid the top or bottom row because there aren't any fixed spins
    else{
        startX = 0;
        endX = Size;
        startY = 0;
        endY = Size;
    }
    var middle = Math.round(Size/2) - 1;
    s[middle][middle] *= -1; //opposite of this middle square's color so you can flip back and forth by clicking it again
    for(var i = startY; i < endY; i++){
        for(var j = startX; j < endX; j++){
            s[i][j] = s[middle][middle];
            BfieldM[i][j] = 0;
            colorSquare(i,j);
        }
    }

    if (algorithm == 0){
        ComputeEforMetropolis();
    }
    else if (algorithm = 1){
        ComputeEforKawasaki();
    }
    else{
        ComputeEforKawasakiLocal();
    }
    resetData();
}

//to return to initial SAVED configuration (only enabled after the "open" button is pressed)
function restart(){ 
    for(var i = 0; i< Size; i++){
        for(var j = 0; j < Size; j++){
            BfieldM[i][j] = initBfieldM[i][j];
            s[i][j] = initS;
        }
    }
    var settings = [];
    for(var i = 0; i < initSettings.length; i++){
        settings[i] = initSettings[i];
    }
    changeSettings(settings);
    colorAll();
    startStop();
}

//DOES revert boundary conditions to periodic and gets rid of fixed spins
function restartFromAligned(){ 
    var settings = [2.27, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0]; //default settings
    changeSettings(settings);
    makeAllOneColor();

    if (algorithm == 0){
        ComputeEforMetropolis();
    }
    else if (algorithm = 1){
        ComputeEforKawasaki();
    }
    else{
        ComputeEforKawasakiLocal();
    }
    resetData();
    startStop();
}

function restartFromRandom(){
    var settings = [2.27, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0];
    changeSettings(settings);
    randomize();

    if (algorithm == 0){
        ComputeEforMetropolis();
    }
    else if (algorithm = 1){
        ComputeEforKawasaki();
    }
    else{
        ComputeEforKawasakiLocal();
    }
    resetData();
    startStop();
}
 
 
//used in start button
function startStop(){
    running = !running;
    if(running){
        startButton.value = " Pause ";
        graphButton.disabled = false; //So you can't start recording values when the simulation isn't running
    }
    else{
        startButton.value = " Start ";
        graphButton.disabled = true;
    }

}


//everything below has to do with saving
//basically creates a text files, converts all necessary data into strings then has the capability to essentially
//recreate the lattice from an uploaded textfile

 
function saveTextAsFile() {
    var textToSave = makeSettingsString() + makeSpinArrayString() + "X"+ makeBfieldArrayString(); //"X" used as a divider between spin and Bfield array so it doesn't have to know how long each is
    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = document.getElementById("inputFileNameToSaveAs").value;

    //creates and destroys download link (otherwise it won't just let you download the textfile from a button)
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}
 
function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}
 
function enableOpen(){
    document.getElementById("openButton").disabled = false;
}
 
function loadFileAsText() {
    document.getElementById("restartButton").disabled = false;
    var fileToLoad = document.getElementById("fileToLoad").files[0];

    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) {
        var textFromFileLoaded = fileLoadedEvent.target.result;
        recreateLattice(textFromFileLoaded);
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
}
 
 
function recreateLattice(text){
    var settingsText = text.substring(0, text.indexOf("["));
    var sText = text.substring(text.indexOf("["), text.indexOf("X"));
    var BfieldText = text.substring(text.indexOf("X") + 1);
    var settings = JSON.parse("[" + settingsText + "]");
    changeSettings(settings);
    s = JSON.parse("[" + sText + "]");
    BfieldM = JSON.parse("[" + BfieldText + "]");
    for(var i = 0; i < Size; i++){
        for(var j = 0; j < Size; j++){
            s[i][j] = Number(s[i][j]);

            BfieldM[i][j] = Number(BfieldM[i][j]); //make sure the strings convert back to numbers
            colorSquare(i,j);
        }
    }

    //saved for "restart" button to return to initial saved configuration
    initBfieldM = new Array(Size);
    initS = new Array(Size);
    for(var i = 0; i < Size; i++){
        initBfieldM[i] = new Array(Size);
        initS[i] = new Array(Size);
        for(var j = 0; j < Size; j++){
            initBfieldM[i][j] = BfieldM[i][j];
            initS[i][j] = s[i][j];
        }
    }

    initSettings = new Array(settings.length);
    for(var i = 0; i < settings.length; i++){
        initSettings[i] = settings[i];
    }
}
 
function makeSettingsString() {
    var string =  "" + T + ", " + Bfield + ", " + magnetSelect.selectedIndex + ", " + sizeSelect.selectedIndex + ", " + algorithmSelect.selectedIndex + ", " + boundarySelect.selectedIndex + ", " + InnerLoopCount + ", " +  Ecurrent + ", " + EsquaredTotal + ", " + Etotal + ", " + Mcurrent + ", " + MsquaredTotal + ", " + Mtotal;
    return string;
}
 
function makeSpinArrayString() {
    var string = "";
    for(var i = 0; i<Size; i++){
        string += "[";
        for(var j = 0; j<Size; j++){
            if(j<Size-1)
                string += "\"" + s[i][j] + "\", ";
            else
                string += "\"" + s[i][j] + "\"";
        }
        if(i<Size - 1)
            string += "],";
        else
            string += "]";
    }
    return string;
}
 
function makeBfieldArrayString() {
    var string = "";
    for(var i = 0; i<Size; i++){
        string += "[";
        for(var j = 0; j<Size; j++){
            if(j<Size-1)
                string += "\"" + BfieldM[i][j] + "\", ";
            else
                string += "\"" + BfieldM[i][j] + "\"";
        }
        if(i<Size - 1)
            string += "],";
        else
            string += "]";
    }
    return string;
}
 
function changeSettings(settings){
    tempInput.value = settings[0];
    changeT();
    BfieldInput.value = settings[1];
    changeBfield();
    magnetSelect.selectedIndex = settings[2];
    changeMagnet();
    sizeSelect.selectedIndex = settings[3];
    Size = Number(sizeSelect.options[sizeSelect.selectedIndex].text);
    SquareWidth = canvas.height/Size;
    changeNanotubeSettings();
    changeMolRatioSettings();
    algorithmSelect.selectedIndex = settings[4];
    changeAlgorithm();
    boundarySelect.selectedIndex = settings[5];
    changeBoundaries();
    InnerLoopCount = settings[6];
    Ecurrent = settings[7];
    EsquaredTotal = settings[8];
    Etotal = settings[9];
    Mcurrent = settings[10];
    MsquaredTotal = settings[11];
    DisplayData();
}

/* ------------ */
/* GRAPH        */
/* ------------ */

//live chart for temperature vs. magnetization and temperature vs. energy
var graphInterval;

function startStopGraph(){
    graphOn = !graphOn
    if(graphOn){
        graphButton.value = "Stop Graph";
        typeGraphSelect.disabled = true;
        incrementGraphSelect.disabled = true;
        if(typeGraphSelect.selectedIndex == 0){
            graphM();
        }
        else {
            graphE();
        }
    }
    if(!graphOn){
        graphButton.value = "Graph"
        clearInterval(graphInterval); //stops current live graph
        typeGraphSelect.disabled = false;
    }
}
 
 
function graphM() { //graphs temp vs magnetization
    var dps = [];   //dataPoints.

    var chart = new CanvasJS.Chart("chartContainer",{
        title: {
            text: "Temperature vs. Magnetization"
        },
        axisX: {
            title: "Temperature"
        },
        axisY: {
            title: "Magnetization"
        },
        data: [{
            type: "scatter",
            color: "#ff0000",
            dataPoints : dps
        }]
    });

    chart.render();
    document.getElementById("exportChart").addEventListener("click",function(){
        chart.exportChart({format: "jpg"})
    }); 
    
    var updateInterval = 500; //updates every 0.5 seconds

    var updateChart = function () {
        if(incrementGraphSelect.selectedIndex == 0){ //if incremental increase is selected temperature will increase
            if(tempInput.value >= 2.0 && tempInput.value <= 2.5){
                dps.push({x: T,y: (Mcurrent/(Size*Size))}); //x value is temperature and y value is average magnetization
                tempInput.value = (Number(tempInput.value) +.015).toFixed(2);
            }
            else if(tempInput.value >= 4.0){
                tempInput.value = "0";
            }
            else{
                dps.push({x: T,y: (Mcurrent/(Size*Size))}); //x value is temperature and y value is average magnetization
                tempInput.value = (Number(tempInput.value) +.05).toFixed(2);
            }
        }
        else{ //else it will decrease
            if(tempInput.value >= 2.0 && tempInput.value <= 2.5){
                dps.push({x: T,y: (Mcurrent/(Size*Size))}); //x value is temperature and y value is average magnetization
                tempInput.value = (Number(tempInput.value) - .015).toFixed(2);
            }
            else if(tempInput.value >= 0){
                tempInput.value = "4";
            }
            else{
                dps.push({x: T,y: (Mcurrent/(Size*Size))}); //x value is temperature and y value is average magnetization
                tempInput.value = (Number(tempInput.value) -.05).toFixed(2);
            }
        }
        changeT();
        chart.render();
    };

    // generates first set of dataPoints
    updateChart();
    graphInterval = setInterval(function(){updateChart()}, updateInterval);
}
 
function graphE() { //graphs temp vs. energy
    var dps = [];   //dataPoints.

    var chart = new CanvasJS.Chart("chartContainer",{
        title :{
            text: "Temperature vs. Energy"
        },
        axisX: {
            title: "Temperature"
        },
        axisY: {
            title: "Energy"
        },
        data: [{
            type: "scatter",
            color: "#ff0000",
            dataPoints : dps
        }]
    });

    chart.render();
    document.getElementById("exportChart").addEventListener("click",function(){
        chart.exportChart({format: "jpg"});
    }); 

    document.getElementById("exportChart").addEventListener("click",function(){
        chart.exportChart({format: "jpg"});
    }); 


    var updateInterval = 500; //updates every 0.5 seconds

    var updateChart = function () {
        if(incrementGraphSelect.selectedIndex == 0){ //if incremental increase is selected temperature will increase
            if(tempInput.value >= 2.0 && tempInput.value <= 2.5){
                dps.push({x: T,y: (Ecurrent/(Size*Size))}); //x value is temperature and y value is average magnetization
                tempInput.value = (Number(tempInput.value) +.015).toFixed(2);
            }
            else if(tempInput.value >= 4.0){
                tempInput.value = "0";
            }
            else{
                dps.push({x: T,y: (Ecurrent/(Size*Size))}); //x value is temperature and y value is average magnetization
                tempInput.value = (Number(tempInput.value) +.05).toFixed(2);
            }
        }
        else{ //else it will decrease
            if(tempInput.value >= 2.0 && tempInput.value <= 2.5){
                dps.push({x: T,y: (Ecurrent/(Size*Size))}); //x value is temperature and y value is average magnetization
                tempInput.value = (Number(tempInput.value) - .015).toFixed(2);
            }
            else if(tempInput.value >= 0){
                tempInput.value = "4";
            }
            else{
                dps.push({x: T,y: (Ecurrent/(Size*Size))}); //x value is temperature and y value is average magnetization
                tempInput.value = (Number(tempInput.value) -.05).toFixed(2);
            }
        }
        changeT();
        chart.render();
    };

    // generates first set of dataPoints
    updateChart();

    graphInterval = setInterval(function(){updateChart()}, updateInterval);
}