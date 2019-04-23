const StaySchedule = require('./StaySchedule');
const GASchedulePlanner = require('./GASchedulePlanner');

let chromosomeSize=49;
let populationSize=500;
let maxGeneration=75;
let eliteSize=5;
let geneMutationChance=0.05;
let tournamentSize = 2;
let planner = new GASchedulePlanner(chromosomeSize, populationSize, maxGeneration, eliteSize, geneMutationChance, tournamentSize);

// Rule 1: Can sleep at her parent's house any weekday;

// Rule 2: Can sleep at my father's house between friday and sunday only;
let weightViolationsOfRule2=4.0;

// Rule 3: Can only sleep apart between monday and friday;
let weightViolationsOfRule3=1;

// Rule 4: It can't be spent more than 3 consecutive days in the same configuration, 
// which are: sleeping at her parent's house, sleeping at my father's house or sleeping apart;
let weightViolationsOfRule4=2;

// Rule 5: If n consecutive days are spent at the same configuration, then this configuration 
// can't be used for n+1 consecutive days;
let weightViolationsOfRule5=2;

//Preference 1: We'd like to spent the least number of days possible sleeping apart;
let weightViolationsOfPreference1=2;

// Preference 2: We'd like to keep the number of switches between configurations as low 
// as possible. Switching betweeen sleeping at any of the houses is worst then switching 
// from sleeping apart to sleeping at any of the houses and vice versa.
let weightViolationsOfPreference2=0.5;

planner.model='mpppxmmmpxxxpppp----mm----xpp-----mm----xp'; //'mppp--mm----xpp-----mm----xpp-----mm----xp'

planner.weights= [
    weightViolationsOfRule2,
    weightViolationsOfRule3,
    weightViolationsOfRule4,
    weightViolationsOfRule5,
    weightViolationsOfPreference1,
    weightViolationsOfPreference2
];
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