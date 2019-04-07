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
            if (planned=='x' && (weekday==SAT || weekday==SUN)) {
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

    // Count the number of violations of the rule 5
    get violationsOfRule5() {

        /* 
            The rule5Enforcer contain only enough data and methods to determine if a given 
            planned day violates the rule 5, considering the days given before it
        */
        let rule5Enforcer = {
            daysOfAvoidance: {},
            avoiding: {},
            lastPlanned: '-',
            isViolation: function(planned) {
                let violation=new Boolean(false);
                violation = this.avoiding[planned]===true;
                this.updateStatus(planned);
                return violation;
            },
            updateStatus: function(planned) {
                if (!(planned in this.avoiding)) {
                    this.avoiding[planned]=false;
                    this.daysOfAvoidance[planned]=2;
                    if (this.lastPlanned!=='-') {
                        this.avoiding[this.lastPlanned]=true;
                    }
                }
                else {
                    if (planned!=this.lastPlanned) {
                        this.avoiding[this.lastPlanned]=true;
                    }
                    if (this.daysOfAvoidance[planned]==0) {
                        this.daysOfAvoidance[planned]=2;
                    }
                    else {
                        this.daysOfAvoidance[planned]++;
                    }
                }
                this.lastPlanned=planned;
                this.decayAvoidance();
            },
            decayAvoidance: function() {
                for (let planType in this.avoiding) {
                    if (this.avoiding[planType]==true) {
                        if (this.daysOfAvoidance[planType]>0) {
                            this.daysOfAvoidance[planType]--;
                        }
                        if (this.daysOfAvoidance[planType]==0) {
                            this.avoiding[planType]=false;
                        }
                    }
                }
            }
        };
        let violations = new Number(0);

        for (let day=0; day<this.schedule.length; day++) {
            if (rule5Enforcer.isViolation(this.schedule[day])) {
                violations++;
            }
        }
        return violations;
    }

    // Count the number of violations of the preference 1
    get violationsOfPreference1() {
        let count = new Number(0);
        for (let day=0; day<this.schedule.length; day++) {
            if (this.schedule[day]==='x') {
                count++;
            }
        }
        return count;
    }

    // Count the number of violations of the preference 2
    get violationsOfPreference2() {
        let count = new Number(0);
        let lastPlanned=this.schedule[0];
        for (let day=0; day<this.schedule.length; day++) {
            if (this.schedule[day]!=lastPlanned) {
                count++;
            }
            lastPlanned=this.schedule[day];
        }
        return count;
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

        return prettyString.split("").reduce((str,char) => `${str} ${char}`,"");
    }
}

module.exports = StaySchedule;