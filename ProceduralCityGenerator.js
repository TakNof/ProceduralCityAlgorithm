import Matrix from './Matrix.js';
import ShapeGenerator from './ShapeGenerator.js';

class ProceduralCityGenerator{
    #scene;
    #citySize;
    #buildingsSize;
    #amountOfBuildings;
    #distributionMatrix;

    /**
     * 
     * @param {THREE.Scene} scene 
     * @param {Object} citySize 
     * @param {Object} buildingsSize 
     * @returns 
     */
    constructor(scene, citySize, buildingsSize){
        this.#scene = scene;
        this.#citySize = citySize;
        this.#buildingsSize = buildingsSize;

        this.#amountOfBuildings = {width: 0, depth: 0, height: 0};

        for(let measurement in buildingsSize){
            this.#amountOfBuildings[measurement] = Math.trunc(citySize[measurement] / buildingsSize[measurement]);
        }
        
        this.#distributionMatrix = new Matrix(this.#amountOfBuildings.depth, this.#amountOfBuildings.width);        
    }

    getScene(){
        return this.#scene;
    }

    getCitySize(){
        return this.#citySize;
    }

    getBuildingsSize(){
        return this.#buildingsSize;
    }

    getAmountOfBuildings(){
        return this.#amountOfBuildings;
    }

    getDistributionMatrix(){
        return this.#distributionMatrix;
    }

    setRoads(amount){
        // while(amount > this.getDistributionMatrix().rows || amount > this.getDistributionMatrix().columns){
        //     amount /= 2;
        // }

        let functionsToCreateRoads = ["linealCreation", "radialCreation"];

        for(let a = 0; a < amount; a++){
            let index = this.#rand(0, functionsToCreateRoads.length - 1);
            let typeOfRoad = functionsToCreateRoads[index];
            this[typeOfRoad]();
        }
    }

    linealCreation(startingPosition, endingPosition){
        if(!startingPosition){
            startingPosition = [this.#rand(0, this.getDistributionMatrix().rows - 1), this.#rand(0, this.getDistributionMatrix().columns - 1)];
        }
        
        if(!endingPosition){
            endingPosition = [this.#rand(0, this.getDistributionMatrix().rows - 1), this.#rand(0, this.getDistributionMatrix().columns - 1)];
        }

        let equation;

        let deltaX = endingPosition[0] - startingPosition[0];
        let deltaY = endingPosition[1] - startingPosition[1];

        if(deltaX == 0){
            equation = function(x){return startingPosition[0]};
        }else if(deltaY == 0){
            equation = function(x){return startingPosition[1]};
        }else{
            let slope = deltaX/deltaY;

            equation = function(x){return Math.trunc(slope*x + startingPosition[1] - slope*startingPosition[0])};
        }

        let distance = Math.trunc(Math.abs(Math.hypot(...startingPosition) - Math.hypot(...endingPosition)));

        for(let i = 0; i < distance; i++){
            if(i < 0 || equation(i) < 0 || i > this.getDistributionMatrix().rows - 1 || equation(i) > this.getDistributionMatrix().columns - 1){
                break;
            }

            this.getDistributionMatrix().array[i][equation(i)] = 1;

            // let probabilityOfConnection = this.#rand(0, 10) == 1;

            // if(probabilityOfConnection){
            //     this.connectPaths([i, equation(i)]);
            // }
        }
    }

    radialCreation(){
        let selectedPosition = [this.#rand(0, this.getDistributionMatrix().rows - 1), this.#rand(0, this.getDistributionMatrix().columns - 1)];

        let radius = this.#rand(5, 10);

        let steps = radius * 9;

        let divisions = 2*Math.PI /steps;

        let startingAngle = this.#rand(0, steps);

        let endingAngle;

        do{
            endingAngle = this.#rand(0, steps) + startingAngle;
        }while(this.#rand(0, steps) + startingAngle > steps);


        for(let i = startingAngle; i < endingAngle; i++){
            let x = Math.trunc(radius*Math.cos(i*divisions) + selectedPosition[0]);
            let y = Math.trunc(radius*Math.sin(i*divisions) + selectedPosition[1]);

            if(x < 0 || y < 0 || x > this.getDistributionMatrix().rows - 1 || y > this.getDistributionMatrix().columns - 1){
                break;
            }

            // console.log(radius*Math.cos(i*divisions), radius*Math.sin(i*divisions));
            this.getDistributionMatrix().array[x][y] = 1;

            // let probabilityOfConnection = this.#rand(0, 10) == 1;

            // if(probabilityOfConnection){
            //     this.connectPaths([x, y]);
            // }
        }
    }

    connectPaths(selectedPosition){
        let analysisRadius = this.#rand(2, 10);

        let steps = analysisRadius * 9;

        let divisions = 2*Math.PI /steps;

        for(let i = 0; i < analysisRadius; i++){
            for(let j = i; j < steps; j++){
                let x = Math.trunc(analysisRadius*Math.cos(i*divisions) + selectedPosition[0]);
                let y = Math.trunc(analysisRadius*Math.sin(i*divisions) + selectedPosition[1]);

                if(x < 0 || y < 0 || x > this.getDistributionMatrix().rows - 1 || y > this.getDistributionMatrix().columns - 1){
                    break;
                }

                if(this.getDistributionMatrix().array[x][y] == 1){
                    let objectivePosition = [x, y];

                    this.linealCreation(selectedPosition, objectivePosition);
                }
            }
        }
    }

    create(){
        let colours = [0x03cffc, 0x09ff00, 0xff8800, 0xff00e1];

        for(let i = 0; i < this.getDistributionMatrix().rows - 1; i++){
            for(let j = 0; j < this.getDistributionMatrix().columns - 1; j++){
                let cube;
                if(this.getDistributionMatrix().array[i][j] == 1){
                    cube = new ShapeGenerator(
                        "Cube", 
                        [this.getBuildingsSize().width, this.getBuildingsSize().height/10, this.getBuildingsSize().depth], 
                        "Standard", 
                        {color: 0x383b39}
                    );
                }else{
                    cube = new ShapeGenerator(
                        "Cube", 
                        [this.getBuildingsSize().width, this.#rand(this.getBuildingsSize().height/2, this.getBuildingsSize().height), this.getBuildingsSize().depth], 
                        "Standard", 
                        {color: colours[this.#rand(0, colours.length -1)]}
                    );
                }

                cube.position.x = i * this.getBuildingsSize().width - this.getCitySize().width/2;
                cube.position.z = j * this.getBuildingsSize().depth - this.getCitySize().depth/2;
                cube.position.y = cube.geometry.parameters.height/2;
                this.getScene().add(cube);
            }
        }
    }

    #rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}

export default ProceduralCityGenerator;