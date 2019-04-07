class StaySchedule {

    constructor(schedule="-------") {
        this.schedule=schedule;
    }

    set staySchedule(schedule) {
        this.schedule=schedule;
    }

    get prettySchedule() {
        let prettyString=new String();
        let numberOfWeeks=1+Math.floor(this.schedule.length/7);

        prettyString="SMTWTFS\n"

        for (let week=0;week<numberOfWeeks;week++) {
            prettyString+=this.schedule.substr(week*7,7);
            prettyString+='\n';
        }

        prettyString=Array.prototype.map.call(prettyString,char => char+" ").reduce((str,char) => str+=char," ")

        return prettyString;
    }
}

module.exports = StaySchedule;