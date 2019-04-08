const StaySchedule = require('./StaySchedule');
const GASchedulePlanner = require('./GASchedulePlanner');

let chromosomeSize=14;
let populationSize=10000;
let maxGeneration=100;
let planner = new GASchedulePlanner(chromosomeSize, populationSize, maxGeneration);

//planner.model='mpppxmm';
planner.weights = [0.5, 0.5, 0.5, 0.5, 0.05, 0.05]
planner.generateFirstPopulation()

let schedules = planner.findBest(5);
console.log(planner.population.length);

for (let schedule of schedules) {
    console.log('\n'+schedule.prettySchedule);
    console.log('Violations of rule 2: '+schedule.violationsOfRule2);
    console.log('Violations of rule 3: '+schedule.violationsOfRule3);
    console.log('Violations of rule 4: '+schedule.violationsOfRule4);
    console.log('Violations of rule 5: '+schedule.violationsOfRule5);
    console.log('Violations of preference 1: '+schedule.violationsOfPreference1);
    console.log('Violations of preference 2: '+schedule.violationsOfPreference2);
    console.log('Score: '+schedule.score);
}