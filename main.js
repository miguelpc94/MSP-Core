const StaySchedule = require('./StaySchedule');

const schedule = new StaySchedule('mpppxmmmpppxmm');
console.log('\n'+schedule.prettySchedule);
console.log('\nViolations of rule 2: '+schedule.violationsOfRule2);
console.log('Violations of rule 3: '+schedule.violationsOfRule3);
console.log('Violations of rule 4: '+schedule.violationsOfRule4);
console.log('Violations of rule 5: '+schedule.violationsOfRule5);
