const StaySchedule = require('./StaySchedule');

const schedule = new StaySchedule('mpppxmmppppmmm');
schedule.weights = [0.5, 0.5, 0.5, 0.5, 0.05, 0.05]
console.log('\n'+schedule.prettySchedule);
console.log('\nViolations of rule 2: '+schedule.violationsOfRule2);
console.log('Violations of rule 3: '+schedule.violationsOfRule3);
console.log('Violations of rule 4: '+schedule.violationsOfRule4);
console.log('Violations of rule 5: '+schedule.violationsOfRule5);
console.log('Violations of preference 1: '+schedule.violationsOfPreference1);
console.log('Violations of preference 2: '+schedule.violationsOfPreference2);
console.log('Score: '+schedule.score);