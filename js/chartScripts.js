"use strict";

var d = {
    "monthlyViews": []
};

/**
 * Retrieve user settings and inputs
 * 
 * @param {Event} e 
 */
function getUserInput(e) {
    e = e || window.event;
    d.monthlyViews = [];
    // Language selection
    findLanguage();
    // Check if textbox's value
    if (U.$("article").value === "") {
        e.preventDefault();
    } else {
        var exist = false;
        var article = U.$("article").value;
        if (d.language === "en") {
            for (var i = 0; i < localStorage.length; i++) {
                if ((/^en\!.*/.test(localStorage.key(i)))) {
                    if (("en!" + parseId(article) === localStorage.key(i))) {
                        exist = true;
                        var views = localStorage.getItem(localStorage.key(i)).split(",");
                        for (var j = 0; j < views.length; j++) {
                            d.monthlyViews.push(views[j]);
                        }
                    }
                }
            }
        } else {
            for (var i = 0; i < localStorage.length; i++) {
                if ((/^fr\!.*/.test(localStorage.key(i)))) {
                    if (("fr!" + parseId(article) === localStorage.key(i))) {
                        exist = true;
                        var views = localStorage.getItem(localStorage.key(i)).split(",");
                        for (var j = 0; j < views.length; j++) {
                            d.monthlyViews.push(views[j]);
                        }
                    }
                }
            }
        }
        if (!exist) {
            d.parseArticle = getParsedTitle(article);
            retrieveRequest(d.parseArticle, d.language, d.dates[12].split("-").join(""), d.dates[0].split("-").join(""));
        } else {
            createGraph();
        }
    }
}

/**
 * Create a graph
 */
function createGraph() {
    // Check if canvas is empty
    if (U.$("chart") !== null) {
        U.$("chart").remove();
    }
    // Create new canvas
    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", "chart");
    U.$("chartWrapper").append(canvas);
    // Create chart
    var chart = document.getElementById("chart");
    var fullChart = new Chart(chart, {
        type: 'bar',
        data: {
            labels: [d.dates[12], d.dates[11], d.dates[10], d.dates[9], d.dates[8], d.dates[7], d.dates[6], d.dates[5], d.dates[4], d.dates[3], d.dates[2], d.dates[1]],
            datasets: [{
                label: 'Number of views',
                data: [d.monthlyViews[0], d.monthlyViews[1], d.monthlyViews[2], d.monthlyViews[3], d.monthlyViews[4], d.monthlyViews[5], d.monthlyViews[6], d.monthlyViews[7], d.monthlyViews[8], d.monthlyViews[9], d.monthlyViews[10], d.monthlyViews[11], d.monthlyViews[12]],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

/**
 * Make a new request to retrieve monthly views
 * 
 * @param {string} article 
 * @param {string} language 
 * @param {string} startdate 
 * @param {string} enddate 
 */
function retrieveRequest(article, language, startdate, enddate) {
    requestFile("https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/" + language + ".wikipedia.org/all-access/all-agents/" + article + "/monthly/" + startdate + "01/" + enddate + "01", storeViews);
}

/**
 * Append views to global array
 * 
 * @param {string} text 
 */
function storeViews(text) {
    var wikiData = JSON.parse(text);

    for (var i = 0; i < wikiData.items.length; i++) {
        d.monthlyViews.push(wikiData.items[i].views);
    }
    findLanguage();
    var localMonthlyViews = d.monthlyViews;
    localStorage.setItem(d.language + "!" + parseId(U.$("article").value), localMonthlyViews);
    // Create graph
    createGraph();
}

/**
 * Find language selection
 * 
 * @returns {string}
 */
function findLanguage() {
    d.language = U.$("articleLanguage").value;
    if (d.language === "English") {
        d.language = "en";
    } else {
        d.language = "fr";
    }
}

/**
 * Replace ' ' (spaces) with '_' (underscores)
 * 
 * @param {string} article 
 */
function getParsedTitle(article) {
    return article.split(" ").join("_");
}

/**
 * Create an array of the past 12 months in YYYY-MM format
 * 
 * @returns {array}
 */
function createPastDates() {
    var today = new Date();
    var dateContainer = [];
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var monthNumber = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    for (var i = 0; i < 13; i++) {
        month--;
        dateContainer.push(year + "-" + monthNumber[month]);
        if (month < 1) {
            month = 12;
            year--;
        }
    }
    return dateContainer;
}

U.ready(function () {
    d.dates = createPastDates();
    // Adder handler to submit button
    U.addHandler(U.$("activityButton"), "click", getUserInput);
});

