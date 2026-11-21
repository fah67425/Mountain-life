let player = {
    day: 1,
    hour: 8, money: 100,
    health: 100, energy: 100,
    hunger: 100, happiness: 100,
    level: 1, xp: 0
};

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

    addjournal(message);
    updateclock();
    updatestats();
}

function addjournal(message) {
    let journal = document.getElementById("journal");
    let entry = document.createElement("p");
    entry.className = "journalentry";
    entry.textContent = message;

    journal.prepend(entry);
}

updateclock();
updatestats();