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
let songlist = [];
let userID = "";
let selected_playlist_id = "";
let current_track_uri = "";
let limit = 3;

var small_window = document.getElementById("deviceswindows");
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const option3 = document.getElementById("option3");
const popplaylist = document.getElementById("playlistPopup");
const closePlaylist = document.getElementById("closePopup");

function Autherzation() {
  let url = authorize;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialog=true";
  //defining the range of access
  url +=
    "&scope=user-read-private user-library-read playlist-read-private user-read-recently-played user-top-read app-remote-control streaming user-read-playback-state playlist-modify-public playlist-modify-private";
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
  //clear the website url to redirect uri
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
      console.log(access_token);
      localStorage.setItem("access_token", access_token);
    }
    if (data.refresh_token != undefined) {
      refresh_token = data.refresh_token;
      localStorage.setItem("refresh_token", refresh_token);
    }
  } else {
    alert(this.responseText);
  }
}
// a function that will return random int between value from min to max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// building the getting popular anime playlist end point and do api call
function getPlaylist() {
  let rank = randomInt(3, 0);
  playlist = `https://api.spotify.com/v1/browse/categories/anime/playlists?limit=1&offset=${rank}`;
  current_api_response = "PlayList";
  callApi("GET", playlist, null, handleResponse, "PlayList");
}

function getSongs() {
  // if the user didn't click get playlist
  if (playlist == "") {
    alert("Please login and get the playlist first!");
  }
  callApi("GET", tracks, null, handleResponse, "songList");
}

//the general spotify api call format (Sending HTML call)
function callApi(method, url, body, callback, responseType) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader(
    "Authorization",
    "Bearer " + localStorage.getItem("access_token")
  );
  xhr.send(body);
  xhr.onload = function () {
    if (callback != null) {
      callback.call(xhr, responseType);
    }
  };
}

function songList(data) {
  songlist = [];
  let size = 0;
  if (data != null) {
    size = data.items.length;
  }
  let counter = 1;
  //created 3 song objs for later use
  for (let i = 0; i < limit; i++) {
    let newsong = {};
    newsong.data = data.items[randomInt(0, size)];
    newsong.isplaying = false;
    songlist.push(newsong);
  }

  songlist.forEach((song) => {
    //getting the cover img for each recommanded song
    document.getElementById(`albumImage${counter}`).src =
      song.data.track.album.images[0].url;
    document.getElementById(`trackTitle${counter}`).textContent =
      song.data.track.album.name;
    document.getElementById(`trackArtist${counter}`).textContent =
      song.data.track.album.artists[0].name;
    song.isplaying = false;
    song.uri = song.data.track.uri;
    counter++;
  });
}

function handleResponse(responseType) {
  console.log(responseType);
  if (this.status == 200) {
    var dataToProcess = JSON.parse(this.responseText);
    switch (responseType) {
      case "userID":
        userID = dataToProcess.id;
        break;
      case "Remove":
        alert("Undo Success!");
        break;
      case "PlayList":
        PlayList(dataToProcess);
        break;
      case "songList":
        songList(dataToProcess);
        break;
      case "setDevice":
        setDevice(dataToProcess);
        console.log("work");
        break;
      case "CreateUserPlaylist":
        CreateUserPlaylist(dataToProcess);
        break;
      default:
        console.log(this.responseText);
        break;
    }
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
  //general random color
}

function get_device() {
  let check_device = "https://api.spotify.com/v1/me/player/devices";
  callApi("GET", check_device, null, handleResponse, "setDevice");
}

function switchToDevice(id) {
  let swichD = "https://api.spotify.com/v1/me/player";
  let body = {};
  body.device_ids = [];
  body.device_ids.push(id);
  callApi("PUT", swichD, JSON.stringify(body), null, null);
  device_id = id;
}

function setDevice(devicesdata) {
  devices = devicesdata.devices;
  console.log("device", devicesdata);
  const deviceList = document.getElementById("deviceList");
  deviceList.innerHTML = ""; // Clear current list
  let default_device = devices[0].id;
  device_id = default_device;
  devices.forEach((device) => {
    const li = document.createElement("li");
    li.textContent = `${device.name} (${device.type})`;
    li.addEventListener("click", function () {
      switchToDevice(device.id);
    });
    deviceList.appendChild(li);
  });
}

function play(song) {
  const playapi = "https://api.spotify.com/v1/me/player/play";
  let playpos = 0;
  //record where the song start
  // song.start = Date.now();
  // console.log("start:\n", song);
  // if ("end" in song) {
  //   playpos = song.end;
  //   console.log(playpos);
  // }
  let body = {};
  body.uris = [song.uri];
  body.position_ms = 0;
  // console.log(body);
  callApi(
    "PUT",
    playapi + `?device_id=${device_id}`,
    JSON.stringify(body),
    null,
    null
  );
}

function pause() {
  // console.log("end:\n", song);
  let pauseAPI = "https://api.spotify.com/v1/me/player/pause";
  //still need to work on pause and resume
  // song.end = Date.now();
  // song.end = song.end - song.start;
  callApi("PUT", pauseAPI + `?device_id=${device_id}`, null, null, null);
}

//need code optimization

function getUserPlaylist() {
  let getUserIDAPI = "https://api.spotify.com/v1/me";
  callApi("GET", getUserIDAPI, null, handleResponse, "userID");
  let userplaylistAPI = `https://api.spotify.com/v1/users/${userID}/playlists`;
  callApi("GET", userplaylistAPI, null, handleResponse, "CreateUserPlaylist");
}

function CreateUserPlaylist(data) {
  const userplaylist = document.getElementById("playlistContainer");
  userplaylist.innerHTML = "";
  data.items.forEach((playlist) => {
    const playlistItem = document.createElement("div");
    playlistItem.classList.add("playlist-item");
    playlistItem.innerHTML = `
                <img src="${playlist.images[0].url}" alt="${playlist.name}">
                <div class="playlist-name">${playlist.name}</div>
            `;
    playlistContainer.appendChild(playlistItem);
    playlistItem.addEventListener("click", function () {
      alert(`You selected ${playlist.name}`);
      //adding to playlist here after
      //console.log("playlist:", playlist);
      addSongTOList(playlist.id);
      selected_playlist_id = playlist.id;

      popplaylist.classList.remove("show"); // Hide the popup
    });
  });
}

function addSongTOList(playlist_id, track_uri = current_track_uri) {
  let end = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
  let body = {};
  body.uris = [track_uri];
  callApi("POST", end, JSON.stringify(body), handleaddresponse);
}

function handleaddresponse() {
  if (this.status == 201) {
    //var data = JSON.parse(this.responseText);
    alert("Successful added to the playlist!");
  } else if (this.status == 401) {
    refreshAcessToken();
  } else {
    console.log(this.responseText);
    alert(this.responseText);
  }
}

function remove_song(playlist_id, track_uri = current_track_uri) {
  let end = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
  let body = {};
  body.tracks = [];
  let trackobj = {};
  trackobj.uri = track_uri;
  body.tracks.push(trackobj);
  callApi("DELETE", end, JSON.stringify(body), null, null);
}

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
    if (device_id == null || device_id == false) {
      console.log("trigger");
      get_device();
    }
    getSongs();
  });

  $("#Show_Devices").click(function () {
    small_window.classList.add("show");
    get_device();
  });

  $(".deviceswindows_close")
    .eq(0)
    .click(function () {
      small_window.classList.remove("show");
      get_device();
    });

  $("#option1").click(function () {
    current_track_uri = songlist[0].data.track.uri;
    getUserPlaylist();
    popplaylist.classList.add("show");
  });
  $("#option1_u").click(function () {
    current_track_uri = songlist[0].data.track.uri;
    remove_song(selected_playlist_id);
  });

  $("#option2").click(function () {
    current_track_uri = songlist[1].data.track.uri;
    getUserPlaylist();
    popplaylist.classList.add("show");
  });
  $("#option2_u").click(function () {
    current_track_uri = songlist[1].data.track.uri;
    remove_song(selected_playlist_id);
  });

  $("#option3").click(function () {
    current_track_uri = songlist[2].data.track.uri;
    getUserPlaylist();
    popplaylist.classList.add("show");
  });
  $("#option3_u").click(function () {
    current_track_uri = songlist[2].data.track.uri;
    remove_song(selected_playlist_id);
  });

  $("#closePopup").click(function () {
    popplaylist.classList.remove("show");
  });

  $(".Recommends .albumImage").click(function () {
    let index = $(this).parent().index(); //get the index of the click image
    for (let i = 0; i < limit; i++) {
      if (i != index) {
        songlist[i].isplaying = false;
      }
    }
    if (songlist[index].isplaying) {
      pause();
    } else {
      play(songlist[index]);
    }
    songlist[index].isplaying = !songlist[index].isplaying;
  });
})(jQuery);
