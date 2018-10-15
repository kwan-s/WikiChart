"use strict";

var c = {
  "saved": [],
  "counter": localStorage.getItem("articleCount")
};

/**
 * Create a new request
 * 
 * @returns {XMLHttpRequest}
 */
function createRequestedObject() {
  var request;

  if (window.XMLHttpRequest) {
    request = new XMLHttpRequest();
  } else {
    request = new ActiveXObject("Microsoft.XMLHTTP");
  }
  return request;
}

/**
 * Request file data asynchronously
 *
 * @param {string} url
 * @param {function} callback
 */
function requestFile(url, callback) {
  var r = createRequestedObject();
  r.open("GET", url, true);
  r.setRequestHeader("Api-User-Agent", "stephenkwan03@outlook.com");
  U.addHandler(r, "load", function () {
    if (r.readyState === XMLHttpRequest.DONE && r.status >= 200 && r.status < 300 || r.status === 304) {
      U.$("errorNotification").style.display = "none";
      callback(r.responseText);
    } else if (r.status >= 400 && r.status < 500) {
      U.$("errorNotification").style.display = "block";
    } else if (r.status >= 500) {
      U.$("errorNotification").style.display = "block";
    }
  });
  r.send(null);
}

/**
 * Process top articles
 *
 * @param {string} text
 */
function processArticleJSON(text) {
  c.article = [];
  c.localArticle = [];
  var articleTitle;
  var articleView;
  var articleRank;
  var resetRank = 0;
  var topResetRank = 0;

  // Parse reponse text
  var wikiData = JSON.parse(text);

  // JSON file validation
  if (wikiData.items[0]) {
    // Regex variable
    var special = /^Sp(e|é)cial\:.*/;
    var ext = /\.[a-zA-Z]{2,3}$/;
    var category = /^[cC]ategory\:.*/;
    var user = /^[uU]ser\:.*/;
    // Array length
    var count = c.counter;
    // Display tile, view and rank
    for (var i = 0; i < count; i++) {
      var articleName = wikiData.items[0].articles[i].article;
      if (!(articleName === "Main_Page"
        || articleName === "Wikipédia:Accueil_principal"
        || articleName === "Sp?cial:Search"
        || user.test(articleName)
        || ext.test(articleName)
        || category.test(articleName)
        || special.test(articleName))) {
        articleTitle = wikiData.items[0].articles[i].article;
        articleView = wikiData.items[0].articles[i].views;
        articleRank = wikiData.items[0].articles[i].rank - resetRank;
        c.article.push(articleTitle);
        displayTopArticle(parseTitle(articleTitle), articleView, articleRank);
      } else {
        count++;
        resetRank++;
      }
    }
    // Loop through 2nd request
    for (var i = 0; i < c.article.length; i++) {
      if (localStorage.getItem("language") === "English") {
        requestFile("https://en.wikipedia.org/api/rest_v1/page/summary/" + c.article[i], processDataJSON);
      } else if (localStorage.getItem("language") === "Francais") {
        requestFile("https://fr.wikipedia.org/api/rest_v1/page/summary/" + c.article[i], processDataJSON);
      }
    }
    // Caching title, view and rank
    var topTwenty = 20;
    for (var i = 0; i < topTwenty; i++) {
      var articleName = wikiData.items[0].articles[i].article;
      if (!(articleName === "Main_Page"
        || articleName === "Wikipédia:Accueil_principal"
        || articleName === "Sp?cial:Search"
        || user.test(articleName)
        || ext.test(articleName)
        || category.test(articleName)
        || special.test(articleName))) {
        articleTitle = wikiData.items[0].articles[i].article;
        articleView = wikiData.items[0].articles[i].views;
        articleRank = wikiData.items[0].articles[i].rank - topResetRank;
        localStorage.setItem(retrieveLanguage() + "$" + g.dateValue + parseLocalId(wikiData.items[0].articles[i].article), JSON.stringify({ title: articleTitle, views: articleView, rank: articleRank }));
        c.localArticle.push(articleTitle);
      } else {
        topTwenty++;
        topResetRank++;
      }
    }
  }
  // Caching purposes
  for (var i = 0; i < c.localArticle.length; i++) {
    if (localStorage.getItem("language") === "English") {
      requestFile("https://en.wikipedia.org/api/rest_v1/page/summary/" + c.localArticle[i], processLocalDataJSON);
    } else if (localStorage.getItem("language") === "Francais") {
      requestFile("https://fr.wikipedia.org/api/rest_v1/page/summary/" + c.localArticle[i], processLocalDataJSON);
    }
  }
}

/**
 * Process data of an article
 *
 * @param {string} text
 */
function processDataJSON(text) {
  // Parse reponse text
  var wikiData = JSON.parse(text);
  var wikiTitle = wikiData.title;
  var articleId = U.$(wikiData.title).id;
  // Append url, summary and image to the right article
  if (wikiData.title === articleId) {
    U.$(articleId).childNodes[1].setAttribute("href", wikiData.content_urls.desktop.page);

    var summary = document.createElement("p");
    var summaryNode = document.createTextNode(wikiData.extract);
    summary.appendChild(summaryNode);
    U.$(articleId).appendChild(summary);

    // Check if image exists
    if (wikiData.originalimage) {
      var image = document.createElement("img");
      image.setAttribute("src", wikiData.originalimage.source);
      image.setAttribute("alt", wikiData.title);
      image.setAttribute("width", "300px");
      image.setAttribute("height", "300px");
      U.$(articleId).appendChild(image);
    }
  }
  addSpanHandler();
}

/**
 * Add saveArticle/unsavetopArticle handler to every span
 * Add toggleStar handler to every span
 */
function addSpanHandler() {
  var topArticles = document.getElementsByTagName("span");
  var topSpan = [];
   
  for (var i = 0; i < topArticles.length; i++) {
    if (!(/^saved.*/.test(topArticles[i].id))) {
      topSpan[i] = topArticles[i];
      if (topSpan[i].textContent === "☆") {
        U.addHandler(topSpan[i], "click", saveArticle);
      } else if (topSpan[i].textContent === "★") {
        U.addHandler(topSpan[i], "click", unsaveTopArticle);
      }
      U.addHandler(topSpan[i], "click", toggleStar);
    }
  }
}

/**
 * Cache top 20 articles
 * 
 * @param {string} text 
 */
function processLocalDataJSON(text) {
  // Parse data
  var wikiData = JSON.parse(text);
  // Loop through localStorage
  for (var i = 0; i < localStorage.length; i++) {
    if (/^en\$.*/.test(localStorage.key(i)) || /^fr\$.*/.test(localStorage.key(i))) {
      if (parseId(wikiData.title) === localStorage.key(i).substring(13)) {
        var data = JSON.parse(localStorage.getItem(localStorage.key(i)))
        data.url = wikiData.content_urls.desktop.page;
        data.summary = wikiData.extract;
        if (wikiData.originalimage) {
          data.image = wikiData.originalimage.source;
        } else {
          data.image = "";
        }
        // Set expiry date to the following day
        data.searchDate = new Date();
        data.searchDate.setDate(data.searchDate.getDate() + 1);
        // Append to localStorage
        localStorage.setItem(localStorage.key(i), JSON.stringify(data));
      }
    }
  }
}

/**
 * Display title, view, rank
 * 
 * @param {string} title 
 * @param {string} view 
 * @param {string} rank 
 */
function displayTopArticle(title, view, rank) {
  var article = document.createElement("article");
  article.setAttribute("id", parseTitle(title));

  var star = "☆";
  var articleSpanNode = document.createTextNode(star);
  var articleSpan = document.createElement("span");
  articleSpan.setAttribute("id", "span" + parseId(title));
  articleSpan.appendChild(articleSpanNode);
  article.appendChild(articleSpan);
  U.addHandler(articleSpan, "click", saveArticle);

  var articleTitle = document.createElement("a");
  var articleTitleNode = document.createTextNode(title);
  articleTitle.appendChild(articleTitleNode);
  article.appendChild(articleTitle);

  var articleView = document.createElement("p");
  var articleViewNode = document.createTextNode("Views: " + view);
  articleView.appendChild(articleViewNode);
  article.appendChild(articleView);

  var articleRank = document.createElement("p");
  var articleRankNode = document.createTextNode("Rank: " + rank);
  articleRank.appendChild(articleRankNode);
  article.appendChild(articleRank);

  U.$("topContent").appendChild(article);

  syncSavedStar();
}

/**
 * Display articles from localStorage
 * 
 * @param {string} title 
 * @param {string} view 
 * @param {string} rank 
 * @param {string} url 
 * @param {string} summary 
 * @param {string} image 
 */
function displayTopLocalArticle(title, view, rank, url, summary, image) {
  var article = document.createElement("article");
  article.setAttribute("id", parseTitle(title));

  var star = "☆";
  var articleSpanNode = document.createTextNode(star);
  var articleSpan = document.createElement("span");
  articleSpan.setAttribute("id", "span" + parseId(title));
  articleSpan.appendChild(articleSpanNode);
  article.appendChild(articleSpan);
  U.addHandler(articleSpan, "click", saveArticle);
  U.addHandler(articleSpan, "click", toggleStar);

  var articleTitle = document.createElement("a");
  articleTitle.setAttribute("href", url);
  var articleTitleNode = document.createTextNode(title);
  articleTitle.appendChild(articleTitleNode);
  article.appendChild(articleTitle);

  var articleView = document.createElement("p");
  var articleViewNode = document.createTextNode("Views: " + view);
  articleView.appendChild(articleViewNode);
  article.appendChild(articleView);

  var articleRank = document.createElement("p");
  var articleRankNode = document.createTextNode("Rank: " + rank);
  articleRank.appendChild(articleRankNode);
  article.appendChild(articleRank);

  var articleSummary = document.createElement("p");
  var articleSummaryNode = document.createTextNode(summary);
  articleSummary.appendChild(articleSummaryNode);
  article.appendChild(articleSummary);

  if (image !== "") {
    var articleImage = document.createElement("img");
    articleImage.setAttribute("src", image);
    articleImage.setAttribute("alt", parseTitle(title));
    articleImage.setAttribute("width", "300px");
    articleImage.setAttribute("height", "300px");
    article.appendChild(articleImage);
  }

  U.$("topContent").appendChild(article);
}

/**
 * Save article into the savedContent tab
 * 
 * @param {Event} e 
 */
function saveArticle(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  var targetNode = target.parentNode;
  var copyTitle = targetNode.childNodes[1].cloneNode(true);
  var copySummary = targetNode.childNodes[4].cloneNode(true);
  // Save article into localStorage
  localStorage.setItem("saved" + targetNode.id, JSON.stringify({ title: copyTitle.textContent, url: copyTitle.href, summary: copySummary.textContent }));
  // Reset array
  c.saved = [];
  for (var i = 0; i < localStorage.length; i++) {
    if (/^saved.*/.test(localStorage.key(i))) {
      c.saved.push(localStorage.key(i));
    }
  }
  // Clear savedContent tab
  while (U.$("savedContent").firstChild) {
    U.$("savedContent").removeChild(U.$("savedContent").firstChild);
  }
  // Display saved articles
  displaySavedArticle();
  // Remove handler for saving
  U.removeHandler(target, "click", saveArticle);
  // Add handler for unsaving
  U.addHandler(target, "click", unsaveTopArticle);
  // Loop through savedContent tab's articles
  // Sync stars of articles in topContent tab and savedContent tab
  // Add unsaveSavedArticle handler
  for (var i = 0; i < U.$("savedContent").childNodes.length; i++) {
    U.$("savedContent").childNodes[i].firstChild.textContent = "★";
    U.addHandler(U.$("savedContent").childNodes[i].firstChild, "click", unsaveSavedArticle);
  }
}

/**
 * Create saved articles in savedContent tab
 */
function createSavedArticle() {
  for (var i = 0; i < localStorage.length; i++) {
    if (/^saved.*/.test(localStorage.key(i))) {
      var articleDetails = JSON.parse(localStorage.getItem(localStorage.key(i)));

      var savedArticle = document.createElement("article");
      savedArticle.setAttribute("id", localStorage.key(i));

      var star = "★";
      var spanArticleNode = document.createTextNode(star);
      var spanArticle = document.createElement("span");
      spanArticle.setAttribute("id", "savedspan" + articleDetails.title);
      spanArticle.appendChild(spanArticleNode);
      savedArticle.appendChild(spanArticle);

      var titleArticle = document.createElement("a");
      titleArticle.setAttribute("href", articleDetails.url);
      var titleArticleNode = document.createTextNode(articleDetails.title);
      titleArticle.appendChild(titleArticleNode);
      savedArticle.appendChild(titleArticle);

      var summaryArticle = document.createElement("p");
      var summaryArticleNode = document.createTextNode(articleDetails.summary);
      summaryArticle.appendChild(summaryArticleNode);
      savedArticle.appendChild(summaryArticle);

      // Append to savedContent tab
      U.$("savedContent").appendChild(savedArticle);
    }
  }
}

/**
 * Display saved articles in the savedContent tab
 */
function displaySavedArticle() {
  // Check if length is equal to 0
  // Used to display articles after reloading/opening the page
  if (c.saved.length === 0) {
    createSavedArticle();
  } else {
    if (U.$("savedContent").childNodes.length === 0) {
      createSavedArticle();
    }
  }
}

/**
 * Un-save article from the savedContent tab when click stars from topContent tab
 * 
 * @param {Event} e 
 */
function unsaveTopArticle(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  var targetNode = target.parentNode;
  var savedPrefix = /^saved.*/;
  // Loop through localStorage
  for (var i = 0; i < localStorage.length; i++) {
    // Check if the key starts with 'saved'
    if (/^saved.*/.test(localStorage.key(i))) {
      // Check if target's id concatenated with 'saved' is equal to the localStorage's key
      if ("saved" + targetNode.id === localStorage.key(i)) {
        // Remove article from DOM
        U.$("savedContent").removeChild(U.$(localStorage.key(i)));
        // Remove article from localStorage
        localStorage.removeItem(localStorage.key(i));
      }
    }
  }
  // Remove handler for unsaving
  U.removeHandler(target, "click", unsaveTopArticle);
  // Add handler for saving
  U.addHandler(target, "click", saveArticle);
  // Placeholder text if no saved articles
  if (U.$("savedContent").children.length === 0) {
    var noArticle = document.createElement("p");
    var message = "Nothing saved yet";
    var noArticleNode = document.createTextNode(message);
    noArticle.appendChild(noArticleNode);
    U.$("savedContent").appendChild(noArticle);
  }
}

/**
 * Un-save article from the savedContent tab when click stars from savedContent tab
 * 
 * @param {Event} e 
 */
function unsaveSavedArticle(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  var targetNode = target.parentNode;
  // Loop through localStorage
  for (var i = 0; i < localStorage.length; i++) {
    // Check if article id is equal to the localStorage key
    if (targetNode.id === localStorage.key(i)) {
      // Remove from DOM
      U.$("savedContent").removeChild(U.$(localStorage.key(i)));
      // Remove from localStorage
      localStorage.removeItem(localStorage.key(i));
    }
  }
  // Un-check star of the article in topContent tab
  for (var j = 0; j < U.$("topContent").getElementsByTagName("article").length; j++) {
    // I use the function parseId (remove spaces), because '"saved" + U.$("topContent").getElementsByTagName("article")[j].childNodes[0].id' returns the id without spaces
    if ("saved" + U.$("topContent").getElementsByTagName("article")[j].childNodes[0].id === parseId(target.id)) {
      U.$("topContent").getElementsByTagName("article")[j].childNodes[0].textContent = "☆";
      U.addHandler(U.$("topContent").getElementsByTagName("article")[j].childNodes[0], "click", saveArticle);
      U.removeHandler(U.$("topContent").getElementsByTagName("article")[j].childNodes[0], "click", unsaveTopArticle);
    }
  }
  // Display message if savedContent tab is empty
  if (U.$("savedContent").children.length === 0) {
    var noArticle = document.createElement("p");
    var message = "Nothing saved yet";
    var noArticleNode = document.createTextNode(message);
    noArticle.appendChild(noArticleNode);
    U.$("savedContent").appendChild(noArticle);
  }
}

/**
 * Replace '_'(underscore) by ' '(space)
 *
 * @param {string} article
 * @returns {string}
 */
function parseTitle(article) {
  return article.split("_").join(" ");
}

/**
 * Replace ' ' (space) by '' (no-space)
 *
 * @param {string} article
 * @returns {string}
 */
function parseId(article) {
  return article.split(" ").join("");
}

/**
 * Replace '_' (underscore) by '' (no-space)
 * 
 * @param {string} article 
 * @returns {string}
 */
function parseLocalId(article) {
  return article.split("_").join("");
}

/**
 * Switch star content after click
 * 
 * @param {Event} e 
 */
function toggleStar(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  if (target.textContent === "★") {
    target.textContent = "☆";
  } else if (target.textContent === "☆") {
    target.textContent = "★";
  }
}

/**
 * Return an array of JSON object
 * 
 * @param {string} date 
 * @returns {array}
 */
function getSortedStorageDate(date) {
  var storage = [];
  for (var i = 0; i < localStorage.length; i++) {
    if (/^(en|fr)\$.*/.test(localStorage.key(i))) {
      // localStorage key: $YYYY/MM/DD/articleName
      if (date === localStorage.key(i).substring(3, 13)) {
        storage.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
      }
    }
  }
  // Sort by rank
  storage.sort(function (a, b) {
    return a.rank - b.rank;
  })
  return storage;
}

/**
 * Return previous date
 * 
 * @returns {string} 
 */
function getPreviousDay() {
  var previousDay = new Date();
  var previousDayString = "";
  // Get year
  var year = previousDay.getFullYear();
  // Get month
  if ((previousDay.getMonth() + 1) < 10) {
    var month = "0" + (previousDay.getMonth() + 1);
  } else {
    var month = previousDay.getMonth() + 1;
  }
  // Get day
  if ((previousDay.getDate() - 1) < 10) {
    var day = "0" + (previousDay.getDate() - 1);
  } else {
    var day = previousDay.getDate() - 1;
  }
  // String format
  previousDayString = year + "/" + month + "/" + day;
  return previousDayString;
}

/**
 * Calculate the number of dates between date one and date two
 * 
 * Courtesy to: https://stackoverflow.com/a/543152
 * 
 * @param {string} first 
 * @param {string} second 
 * @returns {number}
 */
function dateDifference(first, second) {
  return Math.round((first - second) / (1000 * 60 * 60 * 24));
}

/**
 * Delete daily local storage item
 */
function deleteDailyStorage() {
  for (var i in localStorage) {
    if (/^\$.*/.test(i)) {
      // Set today's date
      var todayDate = new Date();
      if ((todayDate.getMonth() + 1) < 10) {
        var month = "0" + (todayDate.getMonth() + 1);
      } else {
        var month = todayDate.getMonth() + 1;
      }
      if ((todayDate.getDate() - 1) < 10) {
        var day = "0" + (todayDate.getDate() - 1);
      } else {
        var day = todayDate.getDate() - 1;
      }
      var formatTodayDate = todayDate.getFullYear() + "/" + month + "/" + day;
      // Set expiry date
      if (JSON.parse(localStorage.getItem(i)).searchDate) {
        var date = JSON.parse(localStorage.getItem(i)).searchDate;
        var formatDate = date.substring(0, 10).split("-").join("/");
        // Calculate difference of days
        if (dateDifference(new Date(formatTodayDate), new Date(formatDate)) >= 1) {
          localStorage.removeItem(i);
        }
      } else {
        localStorage.removeItem(i);
      }
    }
  }
}

/**
 * Check if date is available in localStorage
 * 
 * @returns {boolean}
 */
function findLocalDate() {
  var exist = false;
  if(g.language.value === "English") {
    for (var i = 0; i < localStorage.length; i++) {
      if (/^en\$.*/.test(localStorage.key(i))) {
        if (g.dateValue === localStorage.key(i).substring(3, 13)) {
          exist = true;
          break;
        }
      }
    }
    return exist;
  } else {
    for (var i = 0; i < localStorage.length; i++) {
      if (/^fr\$.*/.test(localStorage.key(i))) {
        if (g.dateValue === localStorage.key(i).substring(3, 13)) {
          exist = true;
          break;
        }
      }
    }
    return exist;
  }
}

/**
 * Return language selection
 */
function retrieveLanguage() {
  if(g.language.value === "English") {
    return "en";
  } else {
    return "fr";
  }
}

/**
 * Wait until every article has been displayed
 * Check stars of saved articles in topContent tab 
 */
function syncSavedStar() {
  if (U.$("topContent").getElementsByTagName("article").length == c.counter) {
    for (var i = 0; i < U.$("topContent").getElementsByTagName("article").length; i++) {
      for (var j = 0; j < U.$("savedContent").childNodes.length; j++) {
        if ("saved" + U.$("topContent").getElementsByTagName("article")[i].id === U.$("savedContent").childNodes[j].id) {
          U.$("topContent").getElementsByTagName("article")[i].childNodes[0].textContent = "★";
        }
      }
    }
  }
}

U.ready(function () {
  // Display saved articles
  displaySavedArticle();
  // Remove 'Nothing saved yet' after reloading with saved articles
  if (U.$("savedContent").children.length > 1) {
    if (U.$("savedContent").children[0].tagName === "P") {
      U.$("savedContent").removeChild(U.$("savedContent").children[0]);
    }
  }
  // Check the stars of saved articles
  // Add unsaveSavedArticle handler to checked stars
  for (var i = 0; i < U.$("savedContent").childNodes.length; i++) {
    if (U.$("savedContent").childNodes[i].tagName === "ARTICLE") {
      if (U.$("savedContent").childNodes[i].firstChild) {
        U.$("savedContent").childNodes[i].firstChild.textContent = "★";
        U.addHandler(U.$("savedContent").childNodes[i].firstChild, "click", unsaveSavedArticle);
      }
    } else if (U.$("savedContent").childNodes[i].tagName === "P") {
      U.$("savedContent").childNodes[i].firstChild.textContent = "Nothing saved yet";
    }
  }
  // Check if date is available in localStorage
  if (g.dateValue !== null) {
    var exist = findLocalDate();
    if (!exist) {
      if (localStorage.getItem("language") == "English") {
        // Send request
        requestFile("https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/" + g.dateValue, processArticleJSON);
      } else {
        // Send request
        requestFile("https://wikimedia.org/api/rest_v1/metrics/pageviews/top/fr.wikipedia.org/all-access/" + g.dateValue, processArticleJSON);
      }
    } else {
      var storage = getSortedStorageDate(g.dateValue);
      for (var i = 0; i < c.counter; i++) {
        displayTopLocalArticle(parseTitle(storage[i].title), storage[i].views, storage[i].rank, storage[i].url, storage[i].summary, storage[i].image);
      }
      syncSavedStar();
    }
  } else {
    // Get previous day
    g.dateValue = getPreviousDay();
    // Check if search date is available in localStorage
    var exist = findLocalDate();
    if (!exist) {
      if (localStorage.getItem("language") == "English") {
        // Send request
        requestFile("https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/" + g.dateValue, processArticleJSON);
      } else {
        // Send request
        requestFile("https://wikimedia.org/api/rest_v1/metrics/pageviews/top/fr.wikipedia.org/all-access/" + g.dateValue, processArticleJSON);
      }
    } else {
      var storage = getSortedStorageDate(g.dateValue);
      for (var i = 0; i < c.counter; i++) {
        displayTopLocalArticle(parseTitle(storage[i].title), storage[i].views, storage[i].rank, storage[i].url, storage[i].summary, storage[i].image);
      }
      syncSavedStar();
    }
  }
  // Delete daily storage
  deleteDailyStorage();
});
