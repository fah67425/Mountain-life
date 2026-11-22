let player = {
    day: 1,
    hour: 8, money: 100,
    health: 100, energy: 100,
    hunger: 100, happiness: 100,
    level: 1, xp: 0
};

let events = [];
let currentfilter = "all";

function updateclock() {
    let hour = player.hour;
    let period = hour >= 12  ? "PM" : "AM";
    let displayhour = hour % 12;

    if (displayhour === 0) {
        displayhour = 12;
    }

    document.getElementById("clock").textContent = String(displayhour).padStart(2, "0") + ":00" + period;
    document.getElementById("day").textContent = String(player.day).padStart(2, "0");
}

function updatestats() {
    let stats = ["health","energy","hunger","happiness"];
    stats.forEach(stat => {
        document.getElementById(stat + "value").textContent = player[stat] + "%";
        document.getElementById(stat + "bar").style.width = player[stat] + "%";
    });

    document.getElementById("money").textContent = "$" + player.money;
    document.getElementById("level").textContent = "LEVEL " + player.level;
    document.getElementById("xpbar").style.width =  player.xp + "%";
    document.getElementById("xptext").textContent = player.xp + " / 100 XP";
}

function addxp(amount) {
    player.xp += amount;

    while (player.xp >= 100) {
        player.xp -= 100;
        player.level++;

        addjournal("you reached level " + player.level + "!");
    }
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

        message = "you enjoyed a meal. hugner restored!";
        player.hour += 1;
    }

    else if (activity === "explore") {
        if (player.energy < 25) {
            addjournal("you need more energy to explore the mountain!");
            return;
        }

        player.energy -= 25;
        player.hunger -= 15;
        player.happiness += 20;

        addxp(25);

        message = "you explored the beautiful and massive mountain valley!";
        player.hour += 2;
    }

    else if (activity === "rest") {

        player.energy += 35;
        player.health += 5;

        message = "you rested and recovered your energy!";

        player.hour += 2;
    }

    let stats = ["health", "energy", "hunger", "happiness"];

    stats.forEach(stat => {
        player[stat] = Math.max(0, Math.min(100, player[stat]));
    });

    if (player.hour >= 24) {
        player.day += Math.floor(player.hour / 24);
        player.hour = player.hour % 24;

        player.hunger = Math.max(0, player.hunger - 10);
        player.energy = Math.max(0, player.energy - 10);

        addjournal("a new day has begun.");
    }

    addjournal(message, activity, "your character has completed " + activity + "ing. check your wallet and stats!");
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
            <h3>no events found<h3>
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

addjournal(
    "you arrived at mountain valley.", "system", "a new chapter of your new mountain life has begun!"
);
updateclock();
updatestats();