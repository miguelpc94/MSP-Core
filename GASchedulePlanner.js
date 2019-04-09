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
    // NEED TEST ###########################################################
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
    // NEED TEST ###########################################################
    reportedRun(interval) {
        this.generateFirstPopulation();
        for (let generation=0;generation<this.maxGeneration; generation++) {
            if ((generation%interval)==0) this.report(generation);
            this.cycle();
        }
    }

    // Perform the complete GA cycle, generating the new population from the elite and offspring
    // NEED TEST ###########################################################
    cycle() {
        let nextPopulation = new Array();
        let offspringPopulation=new Array();
        nextPopulation = nextPopulation.concat(this.elite);
        offspringPopulation = this.generateOffspring(this.populationSize-this.eliteSize);
        nextPopulation = nextPopulation.concat(offspringPopulation);
        this.population = nextPopulation;
    }

    // Select the parents from the population, generate their offspring and mutate them
    // NEED TEST ###########################################################
    generateOffspring(offspringSize) {
        let offspring=new Array();
        let parents=this.tournamentSelection(offspringSize*2);
        let parentsStrings=this.extractScheduleStringsFrom(parents);
        let offspringStrings=this.scheduleStringCrossover(parentsStrings);
        offspringStrings = this.mutateScheduleStrings(offspringStrings);
        offspring=this.generatePopulationFromStrings(offspringStrings);
        return offspring;
    }
    
    // Use tournament selection between a number of chromosome determined by the GA
    // NEED TEST ###########################################################
    tornamentSelection(selectionSize) {
        let winnerPopulation=new Array();
        for (let chromosome=0; chromosome<selectionSize; chromosome++) {
            let competitors=this.randomGetChromosomes(this.tournamentSize);
            winnerPopulation.push(this.findBestFrom(competitors,1));
        }
        return winnerPopulation;
    }

    // Get a number of chromosomes at random indexes from the actual population
    // NEED TEST ###########################################################
    randomGetChromosomes(numberOfChromosomes) {
        let randomChromosomes=new Array();
        for (let chromosome=0; chromosome<numberOfChromosomes; chromosome++) {
            let randomIndex = Math.floor(Math.random*this.populationSize);
            randomChromosomes.push(this.population[randomIndex]);
        }
        return randomChromosomes;
    }

    // Perform a k-point crossover between each pair of schedule strings
    // The crossover points segments the schedule in weeks
    // NEED TEST ###########################################################
    scheduleStringCrossover(scheduleStrings) {
        let crossoveredStrings = new Array();
        let scheduleStringsParents1 = scheduleStrings.slice(0,Math.floor(scheduleStrings.length/2));
        let scheduleStringsParents2 = scheduleStrings.slice(Math.floor(scheduleStrings.length/2),scheduleStrings.length);
        for (let parent=0; parent<scheduleStringsParents1.length; parent++) {
            let parent1=scheduleStringsParents1[parent];
            let parent2=scheduleStringsParents1[parent];
            crossoveredStrings.push(this.weekCrossover(parent1, parent2));
        }
        return crossoveredStrings;
    }

    // Perform a k-point crossover between two shcedule strings, where the 
    // crossover points segment the schedules in weeks
    // UNDER WRITING
    weekCrossover(scheduleString1, scheduleString2) {
        let numberOfSegments=scheduleString1.length/7;
        let crossoveredString = new String();
        for (let segment=0; segment<numberOfSegments; segment++) {
            if (Math.random>=0.5) {
                crossoveredString+=scheduleString1.substr(segment*7,7);
            }
            else {
                crossoveredString+=scheduleString2.substr(segment*7,7);
            }
        }
        return crossoveredString;
    }

    // Mutate the schedule strings delivered, respecting the model if there is any
    // NEED TEST ###########################################################
    mutateScheduleStrings(scheduleStrings) {
        let mutatedScheduleStrings=new Array()
        if (this.haveModel) {
            for (let scheduleString of scheduleStrings) {
                mutatedScheduleStrings.push(this.mutateScheduleStringWithModel(scheduleString));
            }
        }
        else {
            for (let scheduleString of scheduleStrings) {
                mutatedScheduleStrings.push(this.mutateScheduleString(scheduleString));
            }
        }
        return mutatedScheduleStrings;
    }

    // Mutate a single shcedule string ignoring the model
    // NEED TEST ###########################################################
    mutateScheduleString(scheduleString) {
        let mutatedScheduleString = new String();
        for (let gene=0; gene<this.chromosomeSize; gene++) {
            if (Math.random<=this.geneMutationChance) {
                mutatedScheduleString+=generateRandomGene();
            }
            else {
                mutatedScheduleString+=scheduleString[gene]
            }
        }
        return mutatedScheduleString;
    }

    // Mutate a single shcedule string considering the model
    // NEED TEST ###########################################################
    mutateScheduleStringWithModel(scheduleString) {
        let mutatedScheduleString = new String();
        for (let gene=0; gene<this.chromosomeSize; gene++) {
            if (this.model[gene]!=='m' && this.model[gene]!=='p' && Math.random<=this.geneMutationChance) {
                mutatedScheduleString+=generateRandomGene();
            }
            else {
                mutatedScheduleString+=scheduleString[gene]
            }
        }
        return mutatedScheduleString;
    }

    // Return an array with only the schedule strings from the StaySchedule instances
    // NEED TEST ###########################################################
    extractScheduleStringsFrom(analyzedPopulation) {
        return analyzedPopulation.map(schedule => schedule.scheduleString);
    }

    // Generate a population from schedule strings
    // NEED TEST ###########################################################
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
        if (numberOfSchedules>=analyzedPopulation.length) {
            return analyzedPopulation;
        }
        let best = analyzedPopulation.sort((a,b) => a.score - b.score).slice(0,numberOfSchedules);
        return best;
    }

    // NEED TEST ###########################################################
    report(generation) {
        let bestScore=this.elite[0].score;
        let averageScore=this.population.reduce((total,schedule) => total+=schedule.score)/this.populationSize;
        console.log(`G: ${generation} Best: ${bestScore} Average: ${averageScore}`);
    }

    test() {
        return;
    }
}

module.exports = GASchedulePlanner;