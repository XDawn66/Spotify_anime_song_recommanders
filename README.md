A website that can recommend the most recent popular anime songs through spotify api, allowing users to try out the recommended songs and save them into their personal Spotify playlist. (spotify client id and client secret required, the redirect URI is set to localhost 5500 by default)

How it works:

1. this is powered by node js so please make sure u have node js installed, and you can check by typing

```
node -v
```

in your terminal to see if any errors were shown.

2. Make sure the Spotify app is opened and signed in before you use the website in order to play on the current devices

3. Make sure you go to the Spotify developer website to get your personal client ID and client secret. You can follow this tutorial as a reference:
https://www.youtube.com/watch?v=mBgg9i1ghNw

!!MAKE SURE YOU ALSO SET THE Redirect URI to http://localhost:5500/!!!
This is the default setting, you can change it to any website URI you want as long as you change the variable called redirect_uri in public\assets\js\main.js and the Spotify developer website

5. run the following code in the terminal

```
node app.js
```

-Login in and enter your client id and client secret

-click the getplaylist button until u see it change color (different colors mean different playlists)

-get recommanded songs by clicking give me song songs.

-try out the music by clicking images

-add or undo the song u selected from your playlist

This app (HARO) still underdevloped! More functions will be added in the future, such as chat, and email filters...

Prologue by HTML5 UP
html5up.net | @ajlkn

Credits:

	ChatGPT
 
	Demo Images:
		Felicia Simion (ineedchemicalx.deviantart.com)
		Unsplash (unsplash.com)
  
	Icons:
		Font Awesome (fontawesome.io)
  
	Other
		jQuery (jquery.com)
		Scrollex (github.com/ajlkn/jquery.scrollex)
		Responsive Tools (github.com/ajlkn/responsive-tools)
