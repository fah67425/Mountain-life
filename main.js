let player = {
    day: 1,
    hour: 8, money: 100,
    health: 100, energy: 100,
    hunger: 100, happiness: 100,
    level: 1, xp: 0,
    maxenergy: 100,
};
let events = [];
let currentfilter = "all";
let currentweather = {};
const weathertypes = [
    {
        name: "sunny", description: "perfect weather for exploring", effect: "exploration gives extra happiness"
    },
    {
        name: "cloudy", description: "a calm day in the highlands.", effect: "none"
    },
    {
        name: "rainy", description: "wet trails make hiking harder!", effect: "exploration uses 10 more extra energy"
    },
    {
        name: "stormy", description: "strong winds and dangerous trails.", effect: "exploration uses 20 more extra energy"
    }
];

function updateclock() {
    let hour = player.hour;
    let period = hour >= 12  ? "PM" : "AM";
    let displayhour = hour % 12;

    if (displayhour === 0) {
        displayhour = 12;
    }

    document.getElementById("clock").textContent = String(displayhour).padStart(2, "0") + ":00 " + period;
    document.getElementById("day").textContent = String(player.day).padStart(2, "0");
}

function updatestats() {
    let stats = ["health","energy","hunger","happiness"];

    stats.forEach(stat => {
        let value = player[stat];
        let percentage = stat === "energy" ? (value / player.maxenergy) * 100 : value;

        document.getElementById(stat + "value").textContent = stat === "energy" ? value + "/" + player.maxenergy : value + "%";
        document.getElementById(stat + "bar").style.width = percentage + "%";
    });

    document.getElementById("money").textContent = "$" + player.money;
    document.getElementById("level").textContent = "LEVEL " + player.level;
    document.getElementById("xpbar").style.width = player.xp + "%";
    document.getElementById("xptext").textContent = player.xp + " / 100 XP";
}

function addxp(amount) {
    player.xp += amount;

    while (player.xp >= 100) {
        player.xp -= 100;
        player.level++;
        player.money += 50;

        let reward = "you earned $50!";

        if (player.level % 5 === 0) {
            player.maxenergy += 10;

            reward += " maximum energy increased by 10 to " + player.maxenergy;
        }

        let titles = [
            "beginner explorer","veteran explorer",
            "elite explorer","pro explorer",
            "master explorer","grandmaster explorer",
            "mountain legend"
        ];

        let title = titles[Math.min(player.level - 1, titles.length - 1)];
        document.getElementById("leveltitle").textContent = title;
        document.getElementById("popuplevel").textContent = "LEVEL " + player.level;
        document.getElementById("popupreward").textContent = reward + " new title: " + title;
        document.getElementById("levelpopup").classList.add("show");

        addjournal("you reached level " + player.level + "!", "system", reward + " your new title is " + title + "!"
        );
    }
}

function closelevelpopup() {
    document.getElementById("levelpopup").classList.remove("show");
}

//activity
function doactivity(activity) {
    let message = "";

    if (activity === "work") {
        if (player.energy < 20) {
            addjournal("you are too tired to work!");
            return;
        }

        player.money += 30;
        player.energy -= 30;
        player.hunger -= 15;
        player.happiness -= 5;

        message = "you work for 3 hours and earned $30.";

        player.hour += 3;
    }

    else if (activity === "eat") {
        if (player.money < 10) {
            addjournal("you dont have enough money for food.");
            return;
        }

        player.money -= 10;
        player.hunger += 30;
        player.happiness += 5;

        message = "you enjoyed a meal. hunger restored!";
        player.hour += 1;
    }

    else if (activity === "explore") {
        let energycost = 25;

        if (currentweather.name === "rainy") {
            energycost += 10;
        } if (currentweather.name === "stormy") {
            energycost += 20;
        } 

        if (player.energy < energycost) {
            addjournal("you dont have enough energy to explore", "explore", "you need at least " + energycost + " energy to explore");
            return;
        }

        player.energy -= energycost;
        player.hunger -= 15;
        player.happiness += 20;

        if (currentweather.name === "sunny") {
            player.happiness += 10;
        }

        addxp(25);

        message = "you explored the beautiful and massive mountain valley!"

        if (currentweather.name === "rainy") {
            message += " the wet trails made the journey harder";
        } if (currentweather.name === "stormy") {
            message += " strong winds made the journey difficult";
        } if (currentweather.name === "sunny") {
            message += " the beautiful sunshine lifted your mood!"
        }

        player.hour += 2;
    }

    else if (activity === "rest") {

        player.energy += 35;
        player.health += 5;

        message = "you rested and recovered your energy!";

        player.hour += 2;
    }

    player.health = Math.max(0, Math.min(100, player.health));
    player.energy = Math.max(0, Math.min(player.maxenergy, player.energy));
    player.hunger = Math.max(0, Math.min(100, player.hunger));
    player.happiness = Math.max(0, Math.min(100, player.happiness));

    if (player.hour >= 24) {
        player.day += Math.floor(player.hour / 24);
        player.hour = player.hour % 24;

        player.hunger = Math.max(0, player.hunger - 10);
        player.energy = Math.max(0, player.energy - 10);

        addjournal("a new day has begun.");
        setweather(true);
    }

    let verbs = { work: "working", eat: "eating", explore: "exploring", rest: "resting" };
    addjournal(message, activity, "your character has completed " + verbs[activity] + ". check your wallet and stats!");
    updateclock();
    updatestats();
}

function addjournal(message, category = "system", details = "") {
    let event = {
        message: message, category: category,
        details: details || message, time: getgametime(),
        day: player.day
    };

    events.unshift(event);
    renderevents();
    updateeventsummary();
}

function getgametime() {
    let hour = player.hour;
    let period = hour >= 12 ? "PM" : "AM";
    let displayhour = hour % 12;

    if (displayhour === 0) {
        displayhour = 12;
    }

    return String(displayhour).padStart(2, "0") + ":00 " + period;
}

function renderevents() {
    let journal = document.getElementById("journal");
    journal.innerHTML = "";
    let filteredevents = events.filter(event => {
        if (currentfilter === "all") {
            return true;
        }
        return event.category === currentfilter;
    });

    if (filteredevents.length === 0) {
        journal.innerHTML = `
        <div class="emptyevents">
            <h3>no events found</h3>
            <p>try another category or complete an activity</p>
        </div>
        `;

        return;
    }

    filteredevents.forEach(event => {
        let card = document.createElement("div");
        card.className = "eventcard";
        card.dataset.category = event.category;

        let marker = document.createElement("div");
        marker.className = "eventmarker";

        let content = document.createElement("div");
        content.className = "eventcontent";

        let top = document.createElement("div");
        top.className = "eventtop";

        let category = document.createElement("span");
        category.className = "eventcategory";
        category.textContent = event.category.toUpperCase();

        let time = document.createElement("span");
        time.className = "eventtime";
        time.textContent = "DAY " + event.day + " . " + event.time;

        let message = document.createElement("p");
        message.className = "eventmessage";
        message.textContent = event.message;

        let expand = document.createElement("button");
        expand.className = "eventexpand";
        expand.textContent = "show details";

        let details = document.createElement("p");
        details.className = "event-details";
        details.textContent = event.details;
        details.hidden = true;

        expand.onclick = function() {
            details.hidden = !details.hidden;

            expand.textContent = details.hidden ? "show details" : "hide details";
        };

        top.appendChild(category);
        top.appendChild(time);
        content.appendChild(top);
        content.appendChild(message);
        content.appendChild(expand);
        content.appendChild(details);
        card.appendChild(marker);
        card.appendChild(content);
        journal.appendChild(card);
    });
}

function filterevents(filter, button) {
    currentfilter = filter;
    document.querySelectorAll(".filterbtn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");
    renderevents();
}

function clearevents() {
    if (events.length === 0){
        return;
    }

    let confirmclear = confirm("are you sure you want to clear your event history?");

    if (confirmclear) {
        events = [];
        renderevents();
    }
}

function updateeventsummary() {
    let count = events.filter(event => event.day === player.day &&
        event.category !== "system").length;

    document.getElementById("eventcount").textContent = count + (count === 1 ? " ACTIVITY" : " ACTIVITIES");

    let summary = document.getElementById("eventsummarytext");

    if (count === 0) {
        summary.textContent = "a fresh day is waiting....";
    } else if (count < 3) {
        summary.textContent = "seems like ur doing something today.";
    } else {
        summary.textContent = "you are having a really nice day!";
    }
}

function setweather(notify = true) {
    let previousweather = currentweather.name;

    currentweather = weathertypes[Math.floor(Math.random() * weathertypes.length)];

    document.getElementById("weather").textContent = currentweather.name; 
    document.getElementById("weatherdescription").textContent = currentweather.description;

    if (notify && previousweather !== currentweather.name) {
        addjournal(
            "the weather changed to " + currentweather.name, "system", currentweather.description + " " + currentweather.effect
        );
    }
}

addjournal(
    "you arrived at mountain valley.", "system", "a new chapter of your new mountain life has begun!"
);
updateclock();
updatestats();
setweather(false);