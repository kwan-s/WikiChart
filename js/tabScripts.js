"use strict";

// Global namespace
var t = {};

function disableHTMLAnchor() {
  U.$("top").setAttribute("href", "#!topContent");
  U.$("saved").setAttribute("href", "#!savedContent");
  U.$("activity").setAttribute("href", "#!activityContent");
  U.$("about").setAttribute("href", "#!aboutContent");
};

/**
 * Shows selected paragraph's content
 *
 * @param {event} e - Event
 */
function showContent(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  // Top tab selected
  if (target.id === t.top.id) {
    t.topContent.style.display = "block";
    t.savedContent.style.display = "none";
    t.activityContent.style.display = "none";
    t.aboutContent.style.display = "none";
    t.top.style.backgroundColor = "#CDD7D6";
    t.saved.style.backgroundColor = "#A8B0B0";
    t.activity.style.backgroundColor = "#A8B0B0";
    t.about.style.backgroundColor = "#A8B0B0";
  // Saved tab selected
  } else if (target.id === t.saved.id) {
    t.topContent.style.display = "none";
    t.savedContent.style.display = "block";
    t.activityContent.style.display = "none";
    t.aboutContent.style.display = "none";
    t.top.style.backgroundColor = "#A8B0B0";
    t.saved.style.backgroundColor = "#CDD7D6";
    t.activity.style.backgroundColor = "#A8B0B0";
    t.about.style.backgroundColor = "#A8B0B0";
   // Activity tab selected
  } else if (target.id === t.activity.id){
    t.topContent.style.display = "none";
    t.savedContent.style.display = "none";
    t.activityContent.style.display = "block";
    t.aboutContent.style.display = "none";
    t.top.style.backgroundColor = "#A8B0B0";
    t.saved.style.backgroundColor = "#A8B0B0";
    t.activity.style.backgroundColor = "#CDD7D6";
    t.about.style.backgroundColor = "#A8B0B0";
   // About tab selected
  } else {
    t.topContent.style.display = "none";
    t.savedContent.style.display = "none";
    t.activityContent.style.display = "none";
    t.aboutContent.style.display = "block";
    t.top.style.backgroundColor = "#A8B0B0";
    t.saved.style.backgroundColor = "#A8B0B0";
    t.activity.style.backgroundColor = "#A8B0B0";
    t.about.style.backgroundColor = "#CDD7D6";
  }
}

U.ready(function() {
  // Anchar tag variables
  t.top = U.$("top");
  t.saved = U.$("saved");
  t.activity = U.$("activity");
  t.about = U.$("about");
  // Disable html anchor scroll
  disableHTMLAnchor();
  // Default display of the tabScripts
  t.top.style.backgroundColor = "#CDD7D6";
  t.saved.style.backgroundColor = "#A8B0B0";
  t.activity.style.backgroundColor = "#A8B0B0";
  t.about.style.backgroundColor = "#A8B0B0";
  // Paragraph tag variables
  t.topContent = U.$("topContent");
  t.savedContent = U.$("savedContent");
  t.activityContent = U.$("activityContent");
  t.aboutContent = U.$("aboutContent");
  // Default display of the paragraphs
  t.topContent.style.display = "block";
  t.savedContent.style.display = "none";
  t.activityContent.style.display = "none";
  t.aboutContent.style.display = "none";
  // Add handlers for top, saved and activity anchor tags
  U.addHandler(t.top, "click", showContent);
  U.addHandler(t.saved, "click", showContent);
  U.addHandler(t.activity, "click", showContent);
  U.addHandler(t.about, "click", showContent);
});
