const StaySchedule = require('./StaySchedule');

class GASchedulePlanner {

    constructor(chromosomeSize, populationSize, maxGeneration) {
        this.chromosomeSize=chromosomeSize;
        this.populationSize=populationSize;
        this.maxGeneration=maxGeneration;
        this.population=new Array();
        this.haveModel=false;
        this.stringModel=new String("");
        this.weightsArray = new Array();
    }

    set weights(weights) {
        this.weightsArray = weights;
    }
    
    set model(stringModel) {
        this.stringModel=stringModel.toLowerCase();
        this.haveModel=true;
    }

    generateFirstPopulation() {
        if (this.haveModel) {
            this.population = this.generateRandomPopulationWithModel(this.populationSize);
        }
        else {
            this.population = this.generateRandomPopulation(this.populationSize);
        }
    }

    generateRandomPopulationWithModel(size) {
        let randomPopulation = new Array();
        for (let chromosome=0; chromosome<size; chromosome++) {
            randomPopulation[chromosome] = new StaySchedule(this.generateRandomChromosomeWithModel(this.chromosomeSize));
            randomPopulation[chromosome].weights = this.weightsArray;
        }
        return randomPopulation;
    }

    generateRandomPopulation(size) {
        let randomPopulation = new Array();
        for (let chromosome=0; chromosome<size; chromosome++) {
            randomPopulation[chromosome] = new StaySchedule(this.generateRandomChromosome(this.chromosomeSize));
            randomPopulation[chromosome].weights = this.weightsArray;
        }
        return randomPopulation;
    }

    generateRandomChromosomeWithModel(size) {
        let randomChromosome = new String();
        for (let gene=0; gene<size; gene++) {
            if (this.stringModel[gene] && this.stringModel[gene]!=='-') {
                randomChromosome+=this.stringModel[gene];
            }
            else {
                randomChromosome+=this.generateRandomGene();
            }
        }
        return randomChromosome;
    }

    generateRandomChromosome(size) {
        let randomChromosome = new String();
        for (let gene=0; gene<size; gene++) {
            randomChromosome+=this.generateRandomGene();
        }
        return randomChromosome;
    }

    generateRandomGene() {
        let randomNumber = Math.random();
        if (randomNumber<(1/3)) {
            return 'm';
        }
        if (randomNumber<(2/3)) {
            return 'p';
        }
        return 'x';
    }

    findBest(numberOfSchedules) {
        if (numberOfSchedules>=this.populationSize) {
            return this.population;
        }
        let best = this.population.sort((a,b) => a.score - b.score).slice(0,numberOfSchedules);
        return best;
    }
}

module.exports = GASchedulePlanner;