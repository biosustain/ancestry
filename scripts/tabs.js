function openTab(tabGroupId, tabName) {
    //console.log(document.getElementById(tabName).offsetWidth)
    // Declare all variables
    var i, tabcontent, tablinks,
        tabGroup = document.getElementById(tabGroupId);

    // Get all elements with class="tabcontent" and hide them
    tabcontent = tabGroup.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.visibility = "hidden";
        tabcontent[i].style.position = "absolute";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = tabGroup.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    tabGroup.getElementsByClassName("tab-" + tabName)[0].style.visibility = "visible";
    tabGroup.getElementsByClassName("tab-" + tabName)[0].style.position = "static";
    tabGroup.getElementsByClassName(tabName + "-tab")[0].className += " active";
    //console.log(document.getElementById(tabName).offsetWidth)
}