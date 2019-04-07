const StaySchedule = require('./StaySchedule');

const schedule = new StaySchedule('mpppxmmmpppxmm');
console.log('\n'+schedule.prettySchedule);
console.log('\n'+schedule.violationsOfRule2);
console.log('\n'+schedule.violationsOfRule3);
console.log('\n'+schedule.violationsOfRule4);
