let CurrentTheme = null;

let RatedThemesData = localStorage.getItem("ratedThemes");
let RatedThemes = RatedThemesData == null ? Array() : RatedThemesData.split(',');

function CleanThemeName(themeName) {
    return themeName.trim().toUpperCase();
}

function GetRandomTheme() {
    if (RatedThemes.length >= _.size(Themes)) return null;

    let nonRatedThemes = _.omit(Themes, RatedThemes);

    CalculateWeights(nonRatedThemes);

    let r = Math.random();
    for (let id in nonRatedThemes)
        if (r < nonRatedThemes[id].stackedChances)
            return nonRatedThemes[id];
    return _.sample(nonRatedThemes);
}

function SetNewTheme(newTheme) {
    let voteBox = document.querySelector("div#vote");
    let themeBox = voteBox.querySelector("span#theme");
    let buttonNegative = voteBox.querySelector("button.btn-danger");
    let buttonPositive = voteBox.querySelector("button.btn-success");

    CurrentTheme = newTheme;

    voteBox.classList.add("canvote");
    voteBox.classList.remove("voting");
    voteBox.classList.remove("error");
    voteBox.classList.remove("nothing");

    if (newTheme == null) {
        themeBox.innerHTML = "...";
        voteBox.classList.add("nomore");
        return;
    }

    themeBox.innerHTML = CleanThemeName(CurrentTheme.themeName);

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

    let data = {};
    let field = vote == 'P' ? "ratingPositive" : "ratingNegative";
    data[field] = CurrentTheme[field] + 1;

    ThemesRef.child(CurrentTheme.id).update(data)
        .then(() => {
            RatedThemes.push(CurrentTheme.id);
            RatedThemes = _.uniq(RatedThemes);
            localStorage.setItem("ratedThemes", RatedThemes);
            setTimeout(() => SetNewTheme(GetRandomTheme()), 250);
        })
        .catch(err => {
            console.error(err);
            SetNewTheme(CurrentTheme);
            voteBox.classList.add("error");
            voteBox.querySelector("div.alert-danger #error").innerHTML = err;
        });
}

/*
 ##### Suggestion #####
 */

function ThemeSuggested(event) {
    event.preventDefault();

    function IsDuplicate(themeName) {
        for (let id in Themes)
            if (Themes[id].themeName == themeName) return true;
        return false;
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
        setTimeout(() => {
            form.className = "success";
            form.reset();
            EnableForm();
        }, 500);
    }).catch(err => {
        console.error(err);
        form.className = "error";
        form.querySelector("div.alert-danger #error").innerHTML = err;
        EnableForm();
    });
}

function FormChanged(event) {
    event.preventDefault();

    let form = document.querySelector("div#suggestion form");
    form.className = "";
}