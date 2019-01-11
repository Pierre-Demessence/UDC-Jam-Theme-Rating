let Themes = null;
let TotalNbRatings = null;
let TotalScore = null;
const ThemesRef = firebase.database().ref('/');

ThemesRef.on('value', function(snapshot) {
    Themes = {};
    let TotalScore = 0;
    snapshot.forEach(function(theme) {
        Themes[theme.key] = theme.val();
        Themes[theme.key].id = theme.key;
        Themes[theme.key].nbRatings = theme.val().ratingPositive + theme.val().ratingNegative;
        Themes[theme.key].score = theme.val().ratingPositive - theme.val().ratingNegative;
        TotalNbRatings += Themes[theme.key].nbRatings;
        TotalScore += Themes[theme.key].score;
    });
    console.log(Themes);
    console.log(TotalNbRatings);
    console.log(TotalScore);
});


let CurrentTheme = null;

function GetRandomTheme() {
    return _.sample(Themes);
}

function SetNewTheme(newTheme) {
    let voteBox = document.querySelector("div#vote");
    let themeBox = voteBox.querySelector("span#theme");
    let buttonNegative = voteBox.querySelector("button.btn-danger");
    let buttonPositive = voteBox.querySelector("button.btn-success");

    CurrentTheme = newTheme;
    themeBox.innerHTML = CurrentTheme.themeName;

    voteBox.classList.add("canvote");
    voteBox.classList.remove("voting");

    buttonNegative.disabled = false;
    buttonPositive.disabled = false;
}

ThemesRef.once("value", function() {
    SetNewTheme(GetRandomTheme());
});

function ThemeVoted(event, vote) {
    event.preventDefault();

    let voteBox = document.querySelector("div#vote");
    let themeBox = voteBox.querySelector("span#theme");
    let buttonNegative = voteBox.querySelector("button.btn-danger");
    let buttonPositive = voteBox.querySelector("button.btn-success");

    themeBox.innerHTML = "";

    buttonNegative.disabled = true;
    buttonPositive.disabled = true;

    voteBox.classList.remove("canvote");
    voteBox.classList.add("voting");

    console.log(CurrentTheme);

    let data = {};
    let field = vote == 'P' ? "ratingPositive" : "ratingNegative";
    data[field] = CurrentTheme[field] + 1;

    ThemesRef.child(CurrentTheme.id).update(data)
        .then(function() {
            setTimeout(() => SetNewTheme(GetRandomTheme()), 1000);
        });
}

function ThemeSuggested(event) {
    event.preventDefault();

    function IsDuplicate(themeName) {
        for (let id in Themes)
            if (Themes[id].themeName == themeName) return true;
        return false;
    }

    function CleanThemeName(themeName) {
        return themeName.trim().toUpperCase();
    }

    function EnableForm() {
        themeInput.disabled = false;
        submitButton.disabled = false;
        submitButtonText.innerHTML = "Submit";
    }

    let form = document.querySelector("div#suggestion form");
    let themeInput = form.querySelector("input");
    let submitButton = form.querySelector("button");
    let submitButtonText = submitButton.querySelector("span.text");
    let themeNameSuccess = form.querySelector("div.alert-success span#themeNameSuccess");

    form.className = "sending";

    let themeName = themeInput.value;
    themeNameSuccess.innerHTML = themeName;
    let cleanedThemeName = CleanThemeName(themeName);

    themeInput.disabled = true;
    submitButton.disabled = true;
    submitButtonText.innerHTML = "Sending...";

    if (IsDuplicate(cleanedThemeName)) {
        form.className = "duplicate";
        EnableForm();
        return ;
    }

    ThemesRef.push({
        themeName: cleanedThemeName,
        ratingPositive: 0,
        ratingNegative: 0
    }).then(() => {
        form.className = "success";
        form.reset();
        EnableForm();
    }).catch(err => {
        form.className = "error";
        EnableForm();
    });


}

function FormChanged(event) {
    event.preventDefault();

    let form = document.querySelector("div#suggestion form");
    form.className = "";
}