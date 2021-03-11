// Instantiates all global variables, incl. DOM elements and calculation parameters
// Handles all DOM functions (WIP -- moving from all.js to script.js)

/* ------------------------ */
/* DOM ELEMENTS             */
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
/* CALC OUTPUT              */
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


/* ---------------------------- */
/* INPUT PARAMETERS & VARIABLES */
/* ---------------------------- */

// ALGORITHM
// 0 - Metropolis (default)
// 1 - Kawasaki Non-Local
// 2 - Kawasaki Local
// 3 - BEG (not combined yet)
// 4 - Wolff (not combined yet)
var algorithm = 0; 

// TEMPERATURE
var T = Number(tempInput.value);
var zeroT = false; //true when t = 0

// MAGNETIC FIELD
var Bfield = Number(BfieldInput.value);
magnetSelect.selectedIndex = 0; //default: ferromagnetic
var CouplingConstant;
if (magnetSelect.value == "Ferromagnetic") {
    CouplingConstant = 1;
} else {
    CouplingConstant = -1;
}

// SIZE
// refers to dimensions of the lattice (that is ultimately shown on the DOM canvas)
sizeSelect.selectedIndex = 9; //default is 100
var Size = Number(sizeSelect.options[sizeSelect.selectedIndex].text); 
var maxSize = canvas.width; //used in resize()
var SquareWidth = canvas.width/Size; //size of each square determined by size of lattice

// UP RATIO -- Size affects this
var upRatio = 0.0; //for when you use the mol ratio creator slider/button, decimal of "up" spins

// BOUNDARY CONDITIONS
boundarySelect.selectedIndex = 0; //default is regular pbc (periodic boundary conditions)
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
             
// SHOW SPIN
var showSpin = showSpinCheck.checked; //if true will show in a different color the squares that are manually changed

// LOCAL MAGNETIC FIELD
var SettleB = SettleBInput.value; //Dipole Settle Mode-what the square will flip to when it is clicked on

// Metropolis is the hard-coded default within HTML
let algorithmList = document.getElementById('algorithmDropdown').querySelectorAll('li');
let algorithmButton = document.getElementById('algorithmBtn');


/* ----- ALGORITHM DROPDOWN MENU ------ */
for (let i = 0; i < algorithmList.length; i++) {
    // add event listener: click dropdown
    algorithmList[i].addEventListener('click', function() {

        // add 'active' to current element, remove from all others
        for (let j = 0; j < algorithmList.length; j++) {
            if (j == i) {
                if (i != algorithm) { // only do something if changing algorithms
                    algorithmList[j].firstChild.classList.add('active'); // change active element
                    algorithmButton.innerHTML = algorithmList[j].firstChild.textContent; // change dropdown button text to reflect active algorithm
                    algorithm = i;
                    initialize(i);
                }
            } else { 
                algorithmList[j].firstChild.classList.remove('active');
            }
        }
    })
}


/* ------------------------ */
/* INITIALIZE ALGORITHM     */
/* ------------------------ */

function initialize(algorithm) { // eventually this will do more things
    console.log(algorithm)
    switch (algorithm) {
        case 0: // Metropolis
            console.log('Metropolis')
            break;

        case 1: // Kawasaki (local)
            console.log('Kawasaki (local')
            break;

        case 2: // Kawasaki (non-local)
            console.log('Kawasaki (non-local')
            break;

        case 3: // Blume-Capel
            console.log('Blume-Capel')
            break;

        case 4: // Wolff
            console.log('Wolff')
            break;
    }
}

