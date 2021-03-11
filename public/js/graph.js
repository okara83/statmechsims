/* ------------ */
/* GRAPH        */
/* ------------ */
// live chart for temperature vs. magnetization and temperature vs. energy

// default: no graph
var graphOn = false;
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
        title: {
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