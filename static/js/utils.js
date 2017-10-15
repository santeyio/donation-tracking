function get_cookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// --------------------------------------------
// ------ toggle for the screen overlay -------
// --------------------------------------------

function overlay_on() {
  document.getElementById("overlay").style.display = "block";
}
function overlay_off() {
    document.getElementById("overlay").style.display = "none";
}
