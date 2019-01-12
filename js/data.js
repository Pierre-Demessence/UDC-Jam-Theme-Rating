let Themes = null;

const COEF = 0.001;

const ThemesRef = firebase.database().ref('/');

ThemesRef.on('value', function (snapshot) {
    Themes = {};
    snapshot.forEach(function (theme) {
        Themes[theme.key] = theme.val();
        Themes[theme.key].id = theme.key;
        Themes[theme.key].nbRatings = theme.val().ratingPositive + theme.val().ratingNegative;
        Themes[theme.key].score = theme.val().ratingPositive - theme.val().ratingNegative;
    });
    CalculateWeights(Themes);
});

function CalculateWeights(Themes) {
    let totalNbRatings = _.reduce(Themes, (sum, t) => sum += t.nbRatings, 0);
    let totalScores = _.reduce(Themes, (sum, t) => sum += t.score, 0);

    let totalWeights = 0;
    for (let id in Themes) {
        Themes[id].weight = (totalNbRatings + 1) / (Themes[id].nbRatings + COEF);
        totalWeights += Themes[id].weight;
    }

    let totalChances = 0;
    for (let id in Themes) {
        Themes[id].chances = (Themes[id].weight / totalWeights) * 100;
        totalChances += Themes[id].chances / 100;
        Themes[id].stackedChances = totalChances;
    }
}

// ----- ----- ----- ----- -----

function EnableDarkTheme(enable) {
    document.querySelector("link#darktheme").disabled = !enable;
    localStorage.setItem("darktheme", enable);
}

EnableDarkTheme(localStorage.getItem("darktheme") == "true");