/*
	Prologue by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

// spotify autherzation
var client_id = "96b2f974cbfe48908a7675c8284a03eb";
var client_secret = "e2a20fb86c4d443989276aa4110d0e1c";
const redirect_uri = "http://localhost:5500/";

const authorize = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
//using token to access endpoint api call(medium_term by default)
let playlist = "";
let tracks = "";
let device_id = "";
let device_id_index = 0;
let isplaying = false;

var small_window = document.getElementById("deviceswindows");
var openBtn = document.getElementById("Show_Devices");
var closeBtn = document.getElementsByClassName("deviceswindows_close")[0];

function Autherzation() {
  let url = authorize;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialog=true";
  //defining the range of access
  url +=
    "&scope=user-read-private user-library-read playlist-read-private user-read-recently-played user-top-read app-remote-control streaming user-read-playback-state";
  //"&scope=user-read-private user-library-read playlist-read-private user-read-recently-played user-top-read";
  window.location.href = url;
}

function pageload() {
  if (window.location.search.length > 0) {
    handleRedirect();
  }
}

function handleRedirect() {
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("", "", redirect_uri);
}

function getCode() {
  let code = null;
  // Get the full query string from the URL (e.g., ?name=JohnDoe&age=25)
  const queryString = window.location.search;
  if (queryString.length > 0) {
    //creating a url search obj to help search for a certain url token
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get("code");
  }
  return code;
}

// async function getToken() {
//   const authOptions = {
//     url: `https://accounts.spotify.com/api/token`,
//     method: "POST",
//     headers: {
//       Authorization: "Basic " + btoa(client_id + ":" + client_secret),
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: "grant_type=client_credentials",
//   };

//   fetch(authOptions.url, authOptions)
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data);
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }

function fetchAccessToken(code) {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secret=" + client_secret;
  callAuthApi(body);
}

function callAuthApi(body) {
  //sending a request to spotify server
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader(
    "Authorization",
    "Basic " + btoa(client_id + ":" + client_secret)
  );
  xhr.send(body);
  xhr.onload = handleAuthResponse;
}

function refreshAcessToken() {
  refresh_token = localStorage.getItem("refresh_token");
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refresh_token;
  body += "&client_id=" + client_id;
  callAuthApi(body);
}

function handleAuthResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    if (data.access_token != undefined) {
      access_token = data.access_token;
      localStorage.setItem("access_token", access_token);
      console.log(access_token);
    }
    if (data.refresh_token != undefined) {
      refresh_token = data.refresh_token;
      localStorage.setItem("refresh_token", refresh_token);
    }
    //getSongs();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPlaylist() {
  let rank = randomInt(3, 0);
  playlist = `https://api.spotify.com/v1/browse/categories/anime/playlists?limit=1&offset=${rank}`;
  console.log(playlist);
  callApi("GET", playlist, null, handlePlaylistResponse);
}

function getSongs() {
  if (playlist == "") {
    alert("Please login and get the playlist first!");
  }
  callApi("GET", tracks, null, handleSongResponse);
}

function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("access_token")
  );
  xhr.send(body);
  xhr.onload = callback;
}

function songList(data) {
  let size = data.items.length;
  let song1 = data.items[randomInt(0, size)];
  let song2 = data.items[randomInt(0, size)];
  let song3 = data.items[randomInt(0, size)];
  document.getElementById("albumImage1").src = song1.track.album.images[0].url;
  document.getElementById("trackTitle1").textContent = song1.track.album.name;
  document.getElementById("trackArtist1").textContent =
    song1.track.album.artists[0].name;
  document.getElementById("albumImage2").src = song2.track.album.images[0].url;
  document.getElementById("trackTitle2").innerHTML = song2.track.album.name;
  document.getElementById("trackArtist2").innerHTML =
    song2.track.album.artists[0].name;
  document.getElementById("albumImage3").src = song3.track.album.images[0].url;
  document.getElementById("trackTitle3").innerHTML = song3.track.album.name;
  document.getElementById("trackArtist3").innerHTML =
    song3.track.album.artists[0].name;
}

function handleSongResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    songList(data);
  } else if (this.status == 401) {
    refreshAcessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function PlayList(data) {
  track_id = data.playlists.items[0].id;
  tracks = `https://api.spotify.com/v1/playlists/${track_id}/tracks`;
  //change button color to indicate loaded
  document.getElementById("playlists").style.backgroundColor =
    "#" + Math.floor(Math.random() * 16777215).toString(16);
  //console.log(tracks);
}

function handlePlaylistResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log(data);
    PlayList(data);
  } else if (this.status == 401) {
    refreshAcessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function handlePlayResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    setDevice(data.devices);
  } else if (this.status == 401) {
    refreshAcessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function get_device() {
  let check_device = "https://api.spotify.com/v1/me/player/devices";
  callApi("GET", check_device, null, handlePlayResponse);
}

function switchToDevice(id) {
  let swichD = "https://api.spotify.com/v1/me/player";
  let body = {};
  body.device_ids = [];
  body.device_ids.push(id);
  callApi("PUT", swichD, JSON.stringify(body), null);
  device_id = id;
}

function setDevice(devices) {
  const deviceList = document.getElementById("deviceList");
  deviceList.innerHTML = ""; // Clear current list
  devices.forEach((device) => {
    const li = document.createElement("li");
    li.textContent = `${device.name} (${device.type})`;
    li.addEventListener("click", function () {
      switchToDevice(device.id);
    });
    deviceList.appendChild(li);
  });
}

// Open modal on button click
openBtn.onclick = function () {
  small_window.classList.add("show");
  get_device();
};

// Close modal on 'x' click
closeBtn.onclick = function () {
  small_window.classList.remove("show");
};

function play(uri) {
  const playapi = "https://api.spotify.com/v1/me/player/play";
  let body = {};
}

albumImage1.onclick = function () {
  if (isplaying) {
    callApi();
  } else {
  }
};

(function ($) {
  var $window = $(window),
    $body = $("body"),
    $nav = $("#nav");

  // Play initial animations on page load.
  $window.on("load", function () {
    window.setTimeout(function () {
      $body.removeClass("is-preload");
    }, 100);
  });

  // Nav.
  var $nav_a = $nav.find("a");

  $nav_a
    .addClass("scrolly")
    .on("click", function (e) {
      var $this = $(this);

      // External link? Bail.
      if ($this.attr("href").charAt(0) != "#") return;

      // Prevent default.
      e.preventDefault();

      // Deactivate all links.
      $nav_a.removeClass("active");

      // Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
      $this.addClass("active").addClass("active-locked");
    })
    .each(function () {
      var $this = $(this),
        id = $this.attr("href"),
        $section = $(id);

      // No section for this link? Bail.
      if ($section.length < 1) return;

      // Scrollex.
      $section.scrollex({
        mode: "middle",
        top: "-10vh",
        bottom: "-10vh",
        initialize: function () {
          // Deactivate section.
          $section.addClass("inactive");
        },
        enter: function () {
          // Activate section.
          $section.removeClass("inactive");

          // No locked links? Deactivate all links and activate this section's one.
          if ($nav_a.filter(".active-locked").length == 0) {
            $nav_a.removeClass("active");
            $this.addClass("active");
          }

          // Otherwise, if this section's link is the one that's locked, unlock it.
          else if ($this.hasClass("active-locked"))
            $this.removeClass("active-locked");
        },
      });
    });

  // Scrolly.
  // $(".scrolly").scrolly();

  // Header (narrower + mobile).

  // Toggle.
  $(
    '<div id="headerToggle">' +
      '<a href="#header" class="toggle"></a>' +
      "</div>"
  ).appendTo($body);

  // Header.
  $("#header").panel({
    delay: 500,
    hideOnClick: true,
    hideOnSwipe: true,
    resetScroll: true,
    resetForms: true,
    side: "left",
    target: $body,
    visibleClass: "header-visible",
  });

  $("#top").show();
  $("#contact").hide();
  $("#about").hide();
  $("#portfolio").hide();

  $("#top-link").click(function () {
    $("#top").show();
    $("#contact").hide();
    $("#about").hide();
    $("#portfolio").hide();
  });

  $("#portfolio-link").click(function () {
    $("#top").hide();
    $("#contact").hide();
    $("#about").hide();
    $("#portfolio").show();
  });

  $("#about-link").click(function () {
    $("#top").hide();
    $("#contact").hide();
    $("#about").show();
    $("#portfolio").hide();
  });

  $("#contact-link").click(function () {
    $("#top").hide();
    $("#contact").show();
    $("#about").hide();
    $("#portfolio").hide();
  });

  $("#login").click(function () {
    Autherzation();
  });

  $("#playlists").click(function () {
    getPlaylist();
  });

  $("#random").click(function () {
    getSongs();
  });

  $("#option1").click(function () {});
  $("#option2").click(function () {});
})(jQuery);
