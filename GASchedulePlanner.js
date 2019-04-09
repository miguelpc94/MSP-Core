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
     'x' - The value for this position have to be 'x'
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
    tournamentSelection(selectionSize) {
        let winnerPopulation=new Array();
        for (let chromosome=0; chromosome<selectionSize; chromosome++) {
            let competitors=this.randomGetChromosomes(this.tournamentSize);
            winnerPopulation.push(this.findBestFrom(competitors,1)[0]);
        }
        return winnerPopulation;
    }

    // Get a number of chromosomes at random indexes from the actual population
    randomGetChromosomes(numberOfChromosomes) {
        let randomChromosomes=new Array();
        for (let chromosome=0; chromosome<numberOfChromosomes; chromosome++) {
            let randomIndex = Math.floor(Math.random()*this.populationSize);
            randomChromosomes.push(this.population[randomIndex]);
        }
        return randomChromosomes;
    }

    // Perform a k-point crossover between each pair of schedule strings
    // The crossover points segments the schedule in weeks
    scheduleStringCrossover(scheduleStrings) {
        let crossoveredStrings = new Array();
        let scheduleStringsParents1 = scheduleStrings.slice(0,Math.floor(scheduleStrings.length/2));
        let scheduleStringsParents2 = scheduleStrings.slice(Math.floor(scheduleStrings.length/2),scheduleStrings.length);
        for (let parent=0; parent<scheduleStringsParents1.length; parent++) {
            let parent1=scheduleStringsParents1[parent];
            let parent2=scheduleStringsParents2[parent];
            crossoveredStrings.push(this.weekCrossover(parent1, parent2));
        }
        return crossoveredStrings;
    }

    // Perform a k-point crossover between two shcedule strings, where the 
    // crossover points segment the schedules in weeks
    weekCrossover(scheduleString1, scheduleString2) {
        let numberOfSegments=scheduleString1.length/7;
        let crossoveredString = new String();
        for (let segment=0; segment<numberOfSegments; segment++) {
            if (Math.random()>=0.5) {
                crossoveredString+=scheduleString1.substr(segment*7,7);
            }
            else {
                crossoveredString+=scheduleString2.substr(segment*7,7);
            }
        }
        return crossoveredString;
    }

    // Mutate the schedule strings delivered, respecting the model if there is any
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
    mutateScheduleString(scheduleString) {
        let mutatedScheduleString = new String();
        for (let gene=0; gene<this.chromosomeSize; gene++) {
            if (Math.random()<=this.geneMutationChance) {
                mutatedScheduleString+=this.generateRandomGene();
            }
            else {
                mutatedScheduleString+=scheduleString[gene]
            }
        }
        return mutatedScheduleString;
    }

    // Mutate a single schedule string considering the model
    mutateScheduleStringWithModel(scheduleString) {
        let mutatedScheduleString = new String();
        for (let gene=0; gene<this.chromosomeSize; gene++) {
            if (this.stringModel[gene]==='-' && this.stringModel[gene]!==undefined && Math.random()<=this.geneMutationChance) {
                mutatedScheduleString+=this.generateRandomGene();
            }
            else {
                mutatedScheduleString+=scheduleString[gene];
            }
        }
        return mutatedScheduleString;
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

    // Generate a population of the given size considering the model
    generateRandomPopulationWithModel(size) {
        let randomPopulation = new Array();
        for (let chromosome=0; chromosome<size; chromosome++) {
            randomPopulation[chromosome] = new StaySchedule(this.generateRandomChromosomeWithModel(this.chromosomeSize));
            randomPopulation[chromosome].weights = this.weightsArray;
        }
        return randomPopulation;
    }

    // Generate a population of the given size without any model
    generateRandomPopulation(size) {
        let randomPopulation = new Array();
        for (let chromosome=0; chromosome<size; chromosome++) {
            randomPopulation[chromosome] = new StaySchedule(this.generateRandomChromosome(this.chromosomeSize));
            randomPopulation[chromosome].weights = this.weightsArray;
        }
        return randomPopulation;
    }

    // Generate a random schedule string considering the model
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

    // Generate a random schedule string ignoring the model
    generateRandomChromosome(size) {
        let randomChromosome = new String();
        for (let gene=0; gene<size; gene++) {
            randomChromosome+=this.generateRandomGene();
        }
        return randomChromosome;
    }

    // Return a random valid gene
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

    // Find the given number of best from the actual population in ascending score order
    findBest(numberOfSchedules) {
        if (numberOfSchedules>=this.populationSize) {
            return this.population;
        }
        let best = this.population.sort((a,b) => a.score - b.score).slice(0,numberOfSchedules);
        return best;
    }

    // Find the given number of best from the given population in ascending score order
    findBestFrom(analyzedPopulation,numberOfSchedules) {
        if (numberOfSchedules>=analyzedPopulation.length) {
            return analyzedPopulation;
        }
        let best = analyzedPopulation.sort((a,b) => a.score - b.score).slice(0,numberOfSchedules);
        return best;
    }

    // Print a report with the general status
    report(generation) {
        let bestScore=this.elite[0].score;
        let averageScore=this.population.reduce((total,schedule) => total+=schedule.score,0)/this.populationSize;
        console.log(`G: ${generation} Best: ${bestScore} Average: ${averageScore}`);
    }

    // For debuging porposes. Test the methods critical for the algorithm to perform well and
    // print the results
    test() {
        console.log("\n>Starting testing routines...");

        console.log("\n>Setting some GA parameters for the test");
        this.chromosomeSize=14;
        this.populationSize=10;
        this.maxGeneration=100;
        this.eliteSize=2;
        this.geneMutationChance=0.01;
        this.tournamentSize = 3;
        this.weights = [1.0, 1.0, 1.0, 1.0, 0.1, 0.1];
        this.haveModel=false;

        console.log("\n>Generating the first population. All chromosomes should have 14 characters and follow no model. Check them below:");
        this.generateFirstPopulation();
        console.log(this.extractScheduleStringsFrom(this.population));

        console.log("\n>Generating the first population. All chromosomes should have 14 characters and follow the model 'mpppxmmp--'. Check them below:");
        this.model='mpppxmmp--';
        this.generateFirstPopulation();
        console.log(this.extractScheduleStringsFrom(this.population));

        console.log("\n>Randomly picking 3 chromosomes. They must belong to the actual population seen in the last test. Check it below:");
        console.log(this.extractScheduleStringsFrom(this.randomGetChromosomes(3)));

        console.log("\n>Picking 5 tournament winners. They must belong to the actual population seen in before the last test. Check it below:");
        console.log(this.extractScheduleStringsFrom(this.tournamentSelection(5)));

        console.log("\n>Picking the elite chromosomes. The elite size is 2. They must belong to the actual population seen in last tests. Check it below:");
        console.log(this.extractScheduleStringsFrom(this.elite));

        console.log("\n>Generarting a report line. Check it below:");
        this.report(0);

        console.log("\n>Taking the top 5 schedule strings from the last tests and generating a new subpopulation. Check it below:");
        let subpop=this.generatePopulationFromStrings(this.extractScheduleStringsFrom(this.population.slice(0,5)));
        console.log(this.extractScheduleStringsFrom(subpop));

        console.log("\n>Increasing the gene mutation rate to 100% and mutating the schedule strings shown in the last test considering the model. Check it below:");
        this.geneMutationChance=1;
        console.log(this.mutateScheduleStrings(this.extractScheduleStringsFrom(subpop)));

        console.log("\n>Increasing the gene mutation rate to 100% and mutating the schedule strings shown in the last test ignoring the model. Check it below:");
        this.geneMutationChance=1;
        this.haveModel=false;
        console.log(this.mutateScheduleStrings(this.extractScheduleStringsFrom(subpop)));

        console.log("\n>Testing the crossover. Below the '+' indicate a crossover operation and '=' is the result:\n");
        let scheduleStrings = [
            'ppppppppppppppppppppp',
            'mmmmmmmmmmmmmmmmmmmmm',
            'mpmpmpmpmpmpmpmpmpmpm',
            'mxmxmxmxmxmxmxmxmxmxm',
            'pxpxpxpxpxpxpxpxpxpxp',
            'xxxxxxxxxxxxxxxxxxxxx'
        ];
        let crossoveredScheduleStrings=this.scheduleStringCrossover(scheduleStrings);
        console.log(`${scheduleStrings[0]} + ${scheduleStrings[3]} = ${crossoveredScheduleStrings[0]}`);
        console.log(`${scheduleStrings[1]} + ${scheduleStrings[4]} = ${crossoveredScheduleStrings[1]}`);
        console.log(`${scheduleStrings[2]} + ${scheduleStrings[5]} = ${crossoveredScheduleStrings[2]}`);

        console.log("\n>Printing the actual population and then its offspring, both populations of the same size. Mutation rate set to 0.1 and ignoring the model:");
        this.geneMutationChance=0.1;
        console.log('\nParent:\n');
        console.log(this.extractScheduleStringsFrom(this.population));
        console.log('\nOffspring:\n');
        console.log(this.extractScheduleStringsFrom(this.generateOffspring(this.populationSize)));

        console.log("\n>Considering the parent population seen in the last test, a cycle will be run and the new population ignoring the model will be printed below:");

        this.report(0);
        this.cycle();
        console.log(this.extractScheduleStringsFrom(this.population));
        this.report(0);

        return;
    }
}

module.exports = GASchedulePlanner;