/*  ALGORITHM LIST -- based on their order in HTML
0   Metropolis
1   Kawasaki (local)
2   Kawasaki (non-local)
3   Blume-Capel
4   Wolff
*/

// Metropolis is the hard-coded default within HTML
let activeAlgorithm = 0; // CLOSURE
let algorithmList = document.getElementById('algorithmDropdown').querySelectorAll('li');
let algorithmButton = document.getElementById('algorithmBtn');

/* ----- ALGORITHM DROPDOWN MENU ------ */

for (let i = 0; i < algorithmList.length; i++) {
    // add event listener: click dropdown
    algorithmList[i].addEventListener('click', function() {

        // add 'active' to current element, remove from all others
        for (let j = 0; j < algorithmList.length; j++) {
            if (j == i) {
                if (i != activeAlgorithm) { // only do something if changing algorithms
                    algorithmList[j].firstChild.classList.add('active'); // change active element
                    algorithmButton.innerHTML = algorithmList[j].firstChild.textContent; // change dropdown button text to reflect active algorithm
                    activeAlgorithm = j;
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

function initialize(algorithm) {
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

