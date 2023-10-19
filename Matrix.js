class Matrix{
    /**
     * @param {Number} rows 
     * @param {Number} columns
     * @param {Boolean} randomValues
     * @return {Matrix}
     */
    constructor(rows, columns, randomValues = false){
        let array = new Array(rows);
        for(let i = 0; i < rows; i++){
            array[i] = new Array(columns).fill(0);
        }

        if(randomValues){
            for(let i = 0; i < rows; i++){
                for(let j = 0; j < columns; j++){
                    array[i][j] = this.randomIntFromInterval(-10, 10);
                }
            }
        }

        this.rows = rows;
        this.columns = columns;

        this.array = array;
    }

    readMatrix(){
        for(let i = 0; i < this.rows; i++){
            console.log(this.array[i]);
        }

        console.log(" ");
    }

    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    loadData(data){
        if(Array.isArray(data[0])){
            if(data.length != this.rows && data[0].length != this.columns){
                throw new Error("Invalid amount of data")
            }else{
                this.array = data;
            }
        }else if(Array.isArray(data)){
            if(data.length !== this.rows * this.columns){
                throw new Error("Invalid amount of data")
            }else{
                for(let i = 0; i < this.rows; i++){
                    for(let j = 0; j < this.columns; j++){
                        this.array[i][j] = data[i * this.columns + j];
                    }
                }
            }
        }else{
            throw new Error("Invalid data formatting");
        }
    }

    toString(){
        return this.array;
    }

    #checkOperativity(matrices, type){
        let rows = -1;
        let columns = -1;

        if(type == "add" || type == "substract"){
            for(let matrix of matrices){
                if(rows == -1 && columns == -1){
                    rows = matrix.rows;
                    columns = matrix.columns;
                }else if(matrix.rows < 2 || matrix.columns < 2 || matrix.rows != rows || matrix.columns != columns){
                    return false;
                }
            }
        }else if(type == "multiply" || type == "divide"){
            for(let matrix of matrices){
                if(rows == -1 && columns == -1){
                    rows = matrix.rows;
                    columns = matrix.columns;
                }else if(matrix.columns < 1 || matrix.rows < 2 || matrix.columns != rows || matrix.rows != columns){
                    return false;
                }
            }
        }else if(type == "dotProduct"){
            for(let matrix of matrices){
                if(rows == -1 && columns == -1){
                    rows = matrix.rows;
                    columns = matrix.columns;
                }else if(matrix.rows < 1 || matrix.rows > 1 || matrix.columns < 2 || matrix.rows != rows || matrix.columns != columns){
                    return false;
                }
            }
        }else if(type == "crossProduct"){
            for(let matrix of matrices){
                if(rows == -1 && columns == -1){
                    rows = matrix.rows;
                    columns = matrix.columns;
                }else if(matrix.rows < 1 || matrix.rows > 1 || matrix.columns != 3 || matrix.rows != rows || matrix.columns != columns){
                    return false;
                }
            }
        }else{
            throw new Error("Invalid matrix operation");
        }

        return true;
    }

    add(other){
        if(this.#checkOperativity([this, other], "add")){
            let matrices = [this, other];
            let newMatrix = new Matrix(this.rows, this.columns);

            for(let i = 0; i < this.rows; i++){
                for(let j = 0; j < this.columns; j++){
                    let value = 0;
                    for(let matrix of matrices){
                        value += matrix.array[i][j];
                    }

                    newMatrix.array[i][j] = value;
                }
            }

            return newMatrix;
        }
    }

    substract(other){
        if(this.#checkOperativity([this, other], "substract")){
            let matrices = [this, other];
            let newMatrix = new Matrix(this.rows, this.columns);

            for(let i = 0; i < this.rows; i++){
                for(let j = 0; j < this.columns; j++){
                    let value = 0;
                    for(let [k, matrix] of matrices.entries()){
                        if(k == 0){
                            value += matrix.array[i][j];
                        }else{
                            value -= matrix.array[i][j];
                        }
                    }

                    newMatrix.array[i][j] = value;
                }
            }

            return newMatrix;
        }
    }

    multiply(other){
        if(this.#checkOperativity([this, other], "multiply")){
            let matrices = [this, other];
            let newMatrix = new Matrix(this.rows, other.columns);

            for (let i = 0; i < matrices[0].rows; i++) {
                for (let j = 0; j < matrices[1].columns; j++) {
                    for (let k = 0; k < matrices[1].rows; k++) {
                        newMatrix.array[i][j] += matrices[0].array[i][k] * matrices[1].array[k][j];
                    }
                }
            }

            return newMatrix;
        }
    }

    divide(other){
        if(other.array && this.#checkOperativity([this, other], "divide")){
            other.loadData(other.adjunct().transposed().divide(other.determinant()))
            return this.multiply(other);

        }else{
            return this.array.map(function divide(x){
                if(Array.isArray(x)){
                    return x.map(x => (x / other).toFixed(2));
                }else{
                    return (x / other).toFixed(2);
                }
            });
        }
    }

    dotProduct(other){
        if(this.#checkOperativity([this, other], "dotProduct")){

            let copyMatrix = other.transposed();
    
            return this.multiply(copyMatrix);
        }
    }

    crossProduct(other){
        if(this.#checkOperativity([this, other], "crossProduct")){
            let copyMatrix = new Matrix(this.columns, this.columns);


            let unitVector = ["i", "j", "k"];

            if(this.columns < 3){
                unitVector.splice(2, 1);
            }

            copyMatrix.loadData([unitVector, this.array[0], other.array[0]]);
            
            return copyMatrix.determinant();
        }
    }

    #copyMatrix(obj) {
        let copy = Object.assign([], obj);
        Object.keys(copy).forEach(key => {
            if (typeof copy[key] === 'object') {
            copy[key] = this.#copyMatrix(copy[key]);
            }
        });
        return copy;
    }

    adjunct(matrix = this){
        let copyMatrix = new Matrix(this.rows, this.columns);
        copyMatrix.loadData(this.#copyMatrix(matrix.array));

        for(let i = 0; i < copyMatrix.rows; i++){
            for(let j = 0; j < copyMatrix.columns; j++){
                copyMatrix.array[i][j] = this.determinant2x2(i, j, matrix);
                if((i*3 + j )% 2 != 0){
                    copyMatrix.array[i][j] *= -1;
                }
            }
        }

        return copyMatrix;
    }

    transposed(matrix = this){
        let copyMatrix = new Matrix(this.columns, this.rows);

        for (let i = 0; i < copyMatrix.rows; i++) {
            for (let j = 0; j < copyMatrix.columns; j++) {
                copyMatrix.array[i][j] = matrix.array[j][i] 
            }
        }

        return copyMatrix;
    }
    
    determinant(matrix = this){
        let determinant = 0;

        if(matrix.columns > 3){
            for(let i = 0; i < matrix.columns; i++){
                if(i %  2 == 0){
                    determinant += matrix.array[0][i]*this.determinant(this.#createSubMatrix(0, i, matrix));
                }else{
                    determinant -= matrix.array[0][i]*this.determinant(this.#createSubMatrix(0, i, matrix));
                }
            }
        }else{
            if(typeof matrix.array[0][1] === "string" ){
                determinant = new Array(matrix.columns);
            }
            for(let i = 0; i < matrix.columns; i++){
                if(Array.isArray(determinant)){
                    if(i %  2 == 0){
                        determinant[i] = `${this.determinant2x2(0, i, matrix)}${matrix.array[0][i]}`;
                    }else{
                        determinant[i] = `${-this.determinant2x2(0, i, matrix)}${matrix.array[0][i]}`
                    }
                }else{
                    if(i %  2 == 0){
                        determinant += matrix.array[0][i]*this.determinant2x2(0, i, matrix);
                    }else{
                        determinant -= matrix.array[0][i]*this.determinant2x2(0, i, matrix);
                    }
                }
            }
        }
    
        if(typeof matrix.array[0][1] === "string" ){
            let copyMatrix = new Matrix(1, 3);
            copyMatrix.loadData([determinant]);
            return copyMatrix;
        }else{
            return determinant;
        }
    }

    determinant2x2(blockedRow = -1, blockedColumn = -1, matrix = this){
        let ctrlVariable = 0;
        let values = new Array(4);
        for(let i = 0; i < matrix.rows; i++){
            if(blockedRow !== i){
                for(let j = 0; j < matrix.columns; j++){
                    if(blockedColumn !== j){
                        values[ctrlVariable] = matrix.array[i][j];
                        ctrlVariable += 1;
                    }
                }
            }
        }

        let result = values[0]*values[3] - values[2]*values[1];

        return result;
    }

    #createSubMatrix(blockedRow, blockedColumn, matrix = this){
        let subMatrix = new Matrix(matrix.rows - 1, matrix.columns - 1);
        let ctrlVariable = 0;
        let values = new Array((matrix.rows - 1)* (matrix.columns - 1));
    
        for(let i = 0; i < matrix.rows; i++){
            if(blockedRow !== i){
                for(let j = 0; j < matrix.columns; j++){
                    if(blockedColumn !== j){
                        values[ctrlVariable] = matrix.array[i][j];
                        ctrlVariable += 1;
                    }
                }
            }
        }    
    
        subMatrix.loadData(values);
    
        return subMatrix;
    }
}

export default Matrix;