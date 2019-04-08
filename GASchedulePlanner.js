const StaySchedule = require('./StaySchedule');

class GASchedulePlanner {

    /*
     Requires GA parameters to create a GA shcedule planner. Parameters are:
     - chromosomeSize: Number of days in the schedule to be planned
     - populationSize: Size of the population being run on the GA
     - maxGeneration: Number of generations to be run before stopping the GA
     - eliteSize: Size of the elite in a population
     - geneMutationChance: Chance of mutating each gene
     - tournamentSize: Size of the tournament selection
     */
    constructor(chromosomeSize, populationSize, maxGeneration, eliteSize, geneMutationChance, tournamentSize) {
        this.chromosomeSize=chromosomeSize;
        this.populationSize=populationSize;
        this.maxGeneration=maxGeneration;
        this.eliteSize=eliteSize;
        this.geneMutationChance=geneMutationChance;
        this.tournamentSize = tournamentSize;
        this.population=new Array();
        this.haveModel=false;
        this.stringModel=new String();
        this.weightsArray = new Array();
    }

    // Set the weights used in the evaluation process
    set weights(weights) {
        this.weightsArray = weights;
    }
    
    /*
     Set a model a for all the choromosomes to follow. The model can be composed of 4 different characters.
     'm' - The value for this position have to be 'm'
     'p' - The value for this position have to be 'p'
     '-' or undefined - The value for this position can be anything
     */
    set model(stringModel) {
        this.stringModel=stringModel.toLowerCase();
        this.haveModel=true;
    }

    // Return the elite chromosomes
    get elite() {
        return this.findBest(this.eliteSize);
    }

    /*
    Generate the first population from a model, if there is one. If not, generate a complately random first population
    For the first population, it's generated a population 10 times bigger than the desired size and then the best are
    selected to fit the desired size.
    */
    generateFirstPopulation() {
        let firstPopulation=new Array();
        if (this.haveModel) {
            firstPopulation = this.generateRandomPopulationWithModel(this.populationSize*100);
        }
        else {
            firstPopulation = this.generateRandomPopulation(this.populationSize*100);
        }
        this.population=this.findBestFrom(firstPopulation,this.populationSize);
    }

    // Run the GA reporting the progress from time to time
    reportedRun(interval) {
        this.generateFirstPopulation();
        for (let generation=0;generation<this.maxGeneration; generation++) {
            if ((generation%interval)==0) this.report(generation);
            let nextPopulation = new Array();
            let offspringPopulation=new Array();
            nextPopulation = nextPopulation.concat(this.elite);
            offspringPopulation = this.generateOffspring(this.populationSize-this.eliteSize);
            nextPopulation = nextPopulation.concat(offspringPopulation);
            this.population = nextPopulation;
        }
    }

    // Select the parents from the population, generate their offspring and mutate them
    generateOffspring(offspringSize) {
        let offspring=new Array();
        let parents=this.tournamentSelection(offspringSize*2);
        let parentsStrings=this.extractScheduleStringsFrom(parents);
        let offspringStrings=this.scheduleStringCrossover(parentsStrings);
        offspringStrings = this.mutateScheduleStrings(offspringStrings);
        offspring=this.generatePopulationFromStrings(offspringStrings);
        return offspring;
    }
    
    // UNDER WRITING
    tornamentSelection(selectionSize) {
        return this.population;
    }

    // UNDER WRITING
    scheduleStringCrossover(scheduleStrings=new Array()) {
        return scheduleStrings;
    }

    // UNDER WRITING
    mutateScheduleStrings(scheduleStrings=new Array()) {
        return scheduleStrings;
    }

    // Return an array with only the schedule strings from the StaySchedule instances
    extractScheduleStringsFrom(analyzedPopulation) {
        return analyzedPopulation.map(schedule => schedule.scheduleString);
    }

    // Generate a population from schedule strings
    generatePopulationFromStrings(scheduleStrings) {
        let generatedPopulation=new Array();
        for (let scheduleString of scheduleStrings) {
            let newSchedule=new StaySchedule(scheduleString)
            newSchedule.weights = this.weightsArray;
            generatedPopulation.push(newSchedule);
        }
        return generatedPopulation
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

    findBestFrom(analyzedPopulation,numberOfSchedules) {
        if (numberOfSchedules>=analyzedPopulation) {
            return analyzedPopulation;
        }
        let best = analyzedPopulation.sort((a,b) => a.score - b.score).slice(0,numberOfSchedules);
        return best;
    }

    report(generation) {
        let bestScore=this.elite[0].score;
        let averageScore=this.population.reduce((total,schedule) => total+=schedule.score)/this.populationSize;
        console.log(`G: ${generation} Best: ${bestScore} Average: ${averageScore}`);
    }
}

module.exports = GASchedulePlanner;