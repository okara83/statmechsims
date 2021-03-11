/* ---------------------------------- */
/* DIPOLES FOR Metropolis & Kawasaki  */
/* ---------------------------------- */
// used by all algorithms
// referenced by metropolis.js and kawasaki.js

// returns the dipole to the left of s[i][j] taking into account boundary conditions
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
    if (i==0) {
        if (pbc)
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
        if (pbc)
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