"use strict;"

var g = {};

/**
 * Function that validates user's input
 * 
 * @param {Event} e 
 */
function validateForm(e) {
    e = e || window.event;
    // Clear session storage
    sessionStorage.clear();
    // Error variable
    var error = false;
    // Date regex
    var validDate = /^201[5-8]\/[0-1]\d\/[0-3]\d$/;
    // Call saveSettings function
    saveSettings();
    // Check date's format
    if (!(validDate.test(g.date.value))) {
        error = true;
    }

    // Prevent default if there's an error
    if (error) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        return false;
    } else {
        // Save date value into session storage
        sessionStorage.setItem("date", g.date.value);
    }
}

/**
 * Sets user's setting after reloading the website
 * 
 * @param {string} setting 
 */
function setSettingsArticle(setting) {
    g.articleCount.value = setting;
}

/**
 * Sets user's setting after reloading the website
 * 
 * @param {string} setting 
 */
function setSettingsLanguage(setting) {
    g.language.value = setting;
}

/**
 * Save user's settings into the localStorage
 */
function saveSettings() {
    // Save article's count
    localStorage.setItem("articleCount", g.articleCount.options[g.articleCount.selectedIndex].text);
    setSettingsArticle(g.articleCount.options[g.articleCount.selectedIndex].text);
    // Save language's language
    localStorage.setItem("language", g.language.options[g.language.selectedIndex].text);
    setSettingsLanguage(g.language.options[g.language.selectedIndex].text);
}

/**
 * Set and save user's number of visit
 */
function setVisitCountCookie() {
    var notif = U.$("notification");
    // Store cookie into global variable
    g.visitCount = COOKIE.getCookie("visitCount");
    // Check if cookie exist
    if (!g.visitCount) {
        g.visitCount = 0;
    }
    g.visitCount++;
    // Display message at 10th visit
    if (g.visitCount == "10") {
        notif.style.visibility = "visible";
        notif.style.opacity = 1;
        // Notification fade out
        (function fade() {
            if ((notif.style.opacity -= 0.1) < 0) {
                notif.style.visibility = "hidden";
            } else {
                // Call fade every 1 second
                setTimeout(fade, 1000);
            }
        })();
    }
    // Create expire date
    var expire = new Date();
    // Set expire date
    expire.setDate(expire.getDate() + 7);
    // Set cookie
    COOKIE.setCookie("visitCount", g.visitCount, expire);
}

/**
 * Hide adblock message
 */
function hideDisableAdblock() {
    var message = U.$("disableAdblock");
    message.style.display = "block";
    message.style.opacity = 1;
    // Message fade out
    (function fade() {
        if ((message.style.opacity -= 0.1) < 0) {
            message.style.display = "none";
        } else {
            // Call fade every 1 second
            setTimeout(fade, 1000);
        }
    })();
}

U.ready(function () {
    // Assign settingForm, articleCountr and language's id to a global variable
    g.settingForm = U.$("settingForm");
    g.articleCount = U.$("articleCount");
    g.language = U.$("language");
    g.date = U.$("date");
    // Add handler for save button
    U.addHandler(U.$("saveButton"), "click", saveSettings);
    // Add handler for save&submit button
    U.addHandler(g.settingForm, "submit", validateForm);
    // Store key into variables
    var settingArticle = localStorage.getItem("articleCount");
    var settingLanguage = localStorage.getItem("language");
    // Sets article's count
    if (settingArticle) {
        setSettingsArticle(settingArticle);
    }
    // Sets language's language
    if (settingLanguage) {
        setSettingsLanguage(settingLanguage);
    }
    // Save settings
    saveSettings();
    // Set user's number of visit
    setVisitCountCookie();
    // Store key into variable
    g.dateValue = sessionStorage.getItem("date");
    // First visit display information about adblock
    if(g.visitCount == "1") {
        hideDisableAdblock();
    }
});