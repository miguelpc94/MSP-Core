# MSP-Core

Multi-Stay Planner is a solution for me and my wife to allocate our temporary stay between our parent's houses while we prepare to move to London.

This core version is being written in JavaScript and will be run by Node.js on a terminal. After the algorithm is validated I pretend to write a Web or Android App probably using Meteor using this core.

The algorithm will plan how me and my wife will spend our nights until we move out of the country. We are in a temporary situation where we can sleep together in her parent's house, in my father's house or sleep apart, what we really don't want to. There are several rules and preferences that constrains which weekday can be spend where and out preferences about the stay schedule.

Here are the updated agreed rules and preferences:

* Rule 1: Can sleep at her parent's house any weekday;
* Rule 2: Can sleep at my father's house between friday and sunday only;
* Rule 3: Can only sleep apart between monday and friday;
* Rule 4: It can't be spent more than 3 consecutive days in the same configuration, which are: sleeping at her parent's house, sleeping at my father's house or sleeping apart;
* Rule 5: If n consecutive days are spent at the same configuration, then this configuration can't be used for n+1 consecutive days;
* Preference 1: We'd like to spent the least number of days possible sleeping apart;
* Preference 2: We'd like to keep the number of switches between configurations as low as possible. Switching betweeen sleeping at any of the houses is worst then switching from sleeping apart to sleeping at any of the houses and vice versa.