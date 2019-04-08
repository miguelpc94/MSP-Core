const StaySchedule = require('./StaySchedule');
const GASchedulePlanner = require('./GASchedulePlanner');

let chromosomeSize=28;
let populationSize=50;
let maxGeneration=100;
let eliteSize=5;
let geneMutationChance=0.01;
let tournamentSize = 3;
let planner = new GASchedulePlanner(chromosomeSize, populationSize, maxGeneration, eliteSize, geneMutationChance, tournamentSize);

planner.model='mpppxmmm-----pp';
planner.weights = [2.0, 0.5, 0.5, 0.5, 0.15, 0.25];
planner.reportedRun(5);

let schedules = planner.elite;

console.log('\n****** Printing out the best schedules:\n')
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