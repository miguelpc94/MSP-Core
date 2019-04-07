const SUN=0;
const MON=1;
const TUE=2;
const WED=3;
const THU=4;
const FRI=5;
const SAT=6;

/*
    This Class stores a stay schedule and process its properties. The schedule is defined by a String, which each
    position represents a day and the characters can be:
    'p' - Her parent's house
    'm' - My father's house
    'x' - Sleeping apart

*/
class StaySchedule {

    // The default schedule is a week sleeping apart
    constructor(schedule="xxxxxxx") {
        this.schedule=schedule;
    }

    // Set a schedule
    set staySchedule(schedule) {
        this.schedule=schedule;
    }

    // Count the number of violations of the rule 2
    get violationsOfRule2() {
        let violations = new Number(0);

        for (let day=0; day<this.schedule.length; day++) {
            let weekday = day % 7;
            let planned = this.schedule[day];
            if (planned=='m' && weekday!=FRI && weekday!=SAT && weekday!=SUN) {
                violations++;
            }
        }

        return violations;
    }

    // Count the number of violations of the rule 3
    get violationsOfRule3() {
        let violations = new Number(0);

        for (let day=0; day<this.schedule.length; day++) {
            let weekday = day % 7;
            let planned = this.schedule[day];
            if (planned=='x' && (weekday==FRI || weekday==SAT || weekday==SUN)) {
                violations++;
            }
        }

        return violations;
    }

    // Count the number of violations of the rule 4
    get violationsOfRule4() {
        let violations = new Number(0);
        let lastPlanned = '-';
        let repeatingPlanCount = new Number(0);

        for (let day=0; day<this.schedule.length; day++) {
            let planned = this.schedule[day];
            if (planned==lastPlanned) {
                repeatingPlanCount++;
            }
            else {
                repeatingPlanCount=0;
                lastPlanned=planned;
            }
            if (repeatingPlanCount>=3) {
                violations++;
            }
        }

        return violations;
    }

    // Return a formated stay schedule
    get prettySchedule() {
        let prettyString=new String();
        let numberOfWeeks=this.schedule.length/7;

        prettyString="Wn SMTWTFS\n"

        for (let week=0;week<numberOfWeeks;week++) {
            prettyString+='W'+(week+1)+' ';
            prettyString+=this.schedule.substr(week*7,7);
            prettyString+='\n';
        }

        // Add ' ' between chars in the string borrowing a method from the Array's prototype
        prettyString=Array.prototype.map.call(prettyString,char => char+" ").reduce((str,char) => str+=char," ")

        return prettyString;
    }
}

module.exports = StaySchedule;