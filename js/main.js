var sekformat   = new Intl.NumberFormat('de', {minimumIntegerDigits: "2"}); //Erstellt ein Format, dass einen Integer dazu zwingt 2 Stellen zu haben.
var body        = document.querySelector('body');                           //<body>-tag
var audio       = document.getElementById('audio');                         //Audio-Element
var play        = document.getElementById('play');                          //Play-button
var pause       = document.getElementById('pause');                         //Pause-button
var preload     = document.getElementById('preload');                       //Preload-bar
var played      = document.getElementById('played');                        //Played-bar
var overlay     = document.getElementById('overlay');                       //Overlay
var volume      = document.getElementById('volume');                        //Volume-container
var volIcons    = document.getElementById('volicons');                      //Volume-icons-container
var volBar      = document.getElementById('volume-bar');                    //Volume-bar
var volBarInner = document.getElementById('volbar-inner');                  //Volume-bar-inner (Shows the acutal percentage of volume)
var volBarWrap  = document.getElementById('volbar-wrapper');                //Volume-bar-wrapper
var volMin      = document.getElementById('volume-min');                    //Volume-minimum-icon
var volMid      = document.getElementById('volume-mid');                    //Volume-middle-icon
var volMax      = document.getElementById('volume-max');                    //Volume-maximum-icon
var progBar     = document.getElementById('progress-bar');                  //Progress-bar
var progBarWrap = document.getElementById('progbar-wrapper');               //Progress-bar-wrapper
var currentTime = document.getElementById('current');                       //Current-time-text
var duration    = document.getElementById('duration');                      //Duration-text
var infos       = document.getElementById('infos');                         //ID3-information-container
var title       = document.getElementById('title');                         //Title-text
var author      = document.getElementById('author');                        //Artist-text
var album       = document.getElementById('album');                         //Album-text
var year        = document.getElementById('year');                          //Year-text
var bg          = document.getElementById('background');                    //Background
var timer;                                                                  //Timer
var audioBlob;                                                              //Blob of audio-element

/**
 * Get ID3 information of audio-blob and sets into html-elements
 * @author AtronixYT
 * @param {blob} Blob of an audio-element to get ID3-information
 */
function getTags(blob) {
    /**
     * Gets ID3 information and executes given callback on finish
     * @author Thomas Robinson
     * @param blob Audio-blob
     * @param function Callback-function
     */
    musicmetadata(blob, function(err, result) {
        if (err) throw err;                                                 //If error occurs throw error
        
        author.innerText = result.artist;                                   //Sets artist into Artist-text
        album.innerText = result.album;                                     //Sets album into Album-text
        title.innerText = result.title;                                     //Sets title into Title-text
        year.innerText = result.year;                                       //Sets Year into Year-text

        document.getElementById('description').setAttribute('content', result.artist + ' - ' + result.title);   //Sets artist and title into description
        document.getElementById('sideTitle').innerHTML = result.artist + ' - ' + result.title;                  //Sets artist and title into side-title

        if (result.picture.length > 0) {                                                                        //If picture is found
            picture = result.picture[0];                                                                        //Gets first picture of array
            format = picture.format;                                                                            //Gets format of picture
            url = URL.createObjectURL(new Blob([picture.data], {'type': 'image/' + format}));                   //Creates a new object on browser for picture and returns the url
        } else {                                                                                                //Otherwise
            url = "./media/audio.jpg";                                                                          //Sets url to default background image
            format = 'jpg';                                                                                     //Sets image type to jpg
        }
        
        initMediaNotifications(result.title,result.artist,result.album,url,format);                             //Initiates chromes media-notifications
        bg.src = url;
    });
}

/**
 * Initiates chromes media-notifications
 * @author AtronixYT
 * @param {String} title The title
 * @param {String} artist The artist
 * @param {String} album The album-name
 * @param {String} url The url of the cover-image
 * @param {String} format the format of the cover image
 */
function initMediaNotifications(title, artist, album, url, format) {
    img = new Image();                                                                                          //Creates new Image
    img.src = url;                                                                                              //Sets the source of the image to the url

    /**
     * Adds eventlistener for finished load of image 
     * @author AtronixYT
     */
    img.addEventListener('load', function() {
        width = img.width;                                                                                      //Gets image-width
        height = img.height;                                                                                    //Gets image-height

        if('mediaSession' in navigator) {                                                                       //If the navigator has a valid mediaSession-element
            navigator.mediaSession.metadata = new MediaMetadata({                                               //Sets new Metadata of the mediaSession-element
                title: title,                                                                                   //Sets title
                artist: artist,                                                                                 //Sets artist
                album: album,                                                                                   //Sets album-name
                artwork: [                                                                                      //Sets artwork-array
                    {src: url, sizes: width+'x'+height, type: 'image/'+format}                                  //1st Element source is image-url, width is image-width, height is image-height, type is image-format
                ]
            });
        }
    });
}

/**
 * Initialises Eventlisteners, Styles and JS-Content
 * @author AtronixYT
 * @param {int} type decides design
 */
function initControl(type) {
    pause.style.display = 'none';                                                                               //Hides pause-button
    volMid.style.display = 'none';                                                                              //Hides volume-middle-icon
    volMin.style.display = 'none';                                                                              //Hides volume-minimum-icon

    /**
     * Adds eventlistener for click on play-button
     * @author AtronixYT
     */
    play.addEventListener('click', function() {
        audio.play();                                                                                           //Plays audio
    });

    /**
     * Adds eventlistener for click on pause-button
     * @author AtronixYT
     */
    pause.addEventListener('click', function() {
        audio.pause();                                                                                          //Pauses video
    });

    /**
     * Adds eventlistener for click on volume-icons-container
     * @author AtronixYT
     */
    volIcons.addEventListener('click', function() {
        if(audio.muted) {                                                                                       //If audio is already muted
            audio.muted = false;                                                                                //Unmute audio
            console.log("Unmuted audio");                                                                       //Sends information to console
        }
        else {                                                                                                  //Otherwise
            audio.muted = true;                                                                                 //Mutes audio
            console.log("Muted audio");                                                                         //Sends information to console
        }
    });

    /**
     * Adds eventlistener for mouseover on volume-icons-container
     * @author AtronixYT
     */
    volIcons.addEventListener('mouseover', function() {
        clearTimeout(timer);                                                                                    //Clears timer
        volBarWrap.style.width = '100px';                                                                       //Sets width of volume-bar-wrapper to 100px
        console.log("volIcons Mouseover");                                                                      //Sends information to console
    });

    /**
     * Adds eventlistener for mouseover on volume-bar-wrapper
     * @author AtronixYT
     */
    volBarWrap.addEventListener('mouseover', function() {
        clearTimeout(timer);                                                                                    //Clears timer
        volBarWrap.style.width = '100px';                                                                       //Sets width of volume-bar-wrapper to 100px
        console.log("volBarWrap Mouseover");                                                                    //Sends information to console
    });

    /**
     * Adds eventlistener for mouseleave on volume-container
     * @author AtronixYT
     */
    volume.addEventListener('mouseleave', function() {
        clearTimeout(timer);                                                                                    //Clears timer
        timer = setTimeout(function() {                                                                         //Sets new timer to 1000ms and given callback
            volBarWrap.style.width = '0';                                                                       //Sets width of volume-bar-wrapper to 0px
        }, 1000);                                                                                               //1000ms
        console.log("Volume mouseleave");                                                                       //Sends infotmation to console
    });

    /**
     * Adds eventlistener for pause of audio
     * @author AtronixYT
     */
    audio.addEventListener('pause', function() {
        play.style.display = 'inline';                                                                          //Shows play-button
        pause.style.display = 'none';                                                                           //Hides pause-button
        console.log("Pause");                                                                                   //Sends information to console
    });

    /**
     * Adds eventlistener for play of audio
     * @author AtronixYT
     */
    audio.addEventListener('play', function() {
        play.style.display = 'none';                                                                            //Hides play-button
        pause.style.display = 'inline';                                                                         //Shows pause-button
        console.log("Play");                                                                                    //Sends information to console
    });

    /**
     * Adds eventlistener for progress of audio
     * @author AtronixYT
     */
    audio.addEventListener('progress', function() {
        if(audio.buffered.length>0) {                                                                           //If the buffered video-information is found
            if(type == 2) {                                                                                     //If style is type 2
                preload.style.height = 100 * audio.buffered.end(0) / audio.duration + "%";                      //Sets new height of preload-bar
            }
            else {                                                                                              //Otherwise
                preload.style.width = 100 * audio.buffered.end(0) / audio.duration + "%";                       //Sets new width of preload-bar
            }
            console.log('Preload: ' + 100 * audio.buffered.end(0) / audio.duration + "%");                      //Sends information to console
        }
    });

    /**
     * Adds eventlistener for timeupdate of audio
     * @author AtronixYT
     */
    audio.addEventListener('timeupdate', function() {
        if(type == 2) {                                                                                         //If style is type 2
            played.style.height = 100 * audio.currentTime / audio.duration + "%";                               //Sets new height of played-bar
        }
        else {                                                                                                  //Otherwise
            played.style.width = 100 * audio.currentTime / audio.duration + "%";                                //Sets new width of played-bar
        }
        currentTime.innerText = "Time: " + Math.floor(audio.currentTime/60) + ":" + sekformat.format(Math.floor(audio.currentTime%60)); //Updates current-time value
    });

    /**
     * Adds eventlistener for finished loading metadata of audio
     * @author AtronixYT
     */
    audio.addEventListener('loadedmetadata', function() {
        currentTime.innerText = "Time: " + Math.floor(audio.currentTime/60) + ":" + sekformat.format(Math.floor(audio.currentTime%60)); //Updates current-time value
        duration.innerText = "Duration: " + Math.floor(audio.duration/60) + ":" + sekformat.format(Math.floor(audio.duration%60));      //Updates duration value
    });

    /**
     * Adds eventlistener for end of audio
     * @author AtronixYT
     */
    audio.addEventListener('ended', function() {
        play.style.display = 'inline';                                                                          //Shows play-button
        pause.style.display = 'none';                                                                           //Hides pause-button
    });

    /**
     * Adds eventlistener for volume-change of audio
     * @author AtronixYT
     */
    audio.addEventListener('volumechange', function() {
        if(type == 2) {    
            volBarInner.style.height = 100 * audio.volume + "%";
        }
        else {
            volBarInner.style.width = 100 * audio.volume + "%";
        }
        
        if (audio.muted || audio.volume <= 0) {
            volMax.style.display = 'none';
            volMin.style.display = 'inline';
            volMid.style.display = 'none';
        } else if(audio.volume < 0.5) {
            volMax.style.display = 'none';
            volMin.style.display = 'none';
            volMid.style.display = 'inline';
        } else {
            volMax.style.display = 'inline';
            volMin.style.display = 'none';
            volMid.style.display = 'none';
        }
    });

    /**
     * Adds eventlistener for mousemove on progress-bar-wrapper
     * @author AtronixYT
     */
    progBarWrap.addEventListener('mousemove', function(event) {
        if(type == 2) {                                                     //If Style is type 2
            if (event.buttons == 1) {                                       //If button is pressed
                let height = progBarWrap.clientHeight;                      //Gets height of progrbarwrapper
                let mousePos = event.offsetY;                               //Gets offset of mouse
                let factor = mousePos / height;                             //Gets offset in percent
                let audDuration = audio.duration;                           //Gets duration of audio
                let targetTime = audDuration* (1-factor);                   //Calculates new Time from duration and offset percentage
                audio.currentTime = targetTime;                             //Sets new time as current time of audio
            }
        }
        else {                                                              //Every other style
            if (event.buttons == 1) {                                       //If button is pressed
                let width = progBarWrap.clientWidth;                        //Gets width of progress-bar-wrapper
                let mousePos = event.offsetX;                               //Gets offset of mous
                let factor = mousePos / width;                              //Gets offset in percent
                let audDuration = audio.duration;                           //Gets duration of audio
                let targetTime = audDuration*factor;                        //Calculates new time from duration and offset percentage
                audio.currentTime = targetTime;                             //Sets new time as current time of audio
            }
        }
    });

    /**
     * Adds eventlistener for click on progress-bar-wrapper
     * @author AtronixYT
     */
    progBarWrap.addEventListener('click', function(event) {
        if(type == 2) {                                                 //If Style is type 2
            let height = progBarWrap.clientHeight;                      //Gets height of progrbarwrapper
            let mousePos = event.offsetY;                               //Gets offset of mouse
            let factor = mousePos / height;                             //Gets offset in percent
            let audDuration = audio.duration;                           //Gets duration of audio
            let targetTime = audDuration* (1-factor);                   //Calculates new Time from duration and offset percentage
            audio.currentTime = targetTime;                             //Sets new time as current time of audio
        }
        else {                                                          //Every other style
            let width = progBarWrap.clientWidth;                        //Gets width of progress-bar-wrapper
            let mousePos = event.offsetX;                               //Gets offset of mous
            let factor = mousePos / width;                              //Gets offset in percent
            let audDuration = audio.duration;                           //Gets duration of audio
            let targetTime = audDuration*factor;                        //Calculates new time from duration and offset percentage
            audio.currentTime = targetTime;                             //Sets new time as current time of audio
        }
    });

    /**
     * Adds eventlistener for mousemove on volume-bar-wrapper
     * @author AtronixYT
     */
    volBarWrap.addEventListener('mousemove', function(event) {
        if(type == 2) {                                                     //If Style is type 2
            if (event.buttons == 1) {                                       //If button is pressed
                let height = volBarWrap.clientHeight;                       //Gets height of volume-bar-wrapper
                let mousePos = event.offsetY;                               //Gets mouse-offset
                let factor = mousePos / height;                             //Gets offset percentage
                audio.volume = 1-factor;                                    //Sets offset percentage as volume
            }
        }
        else {                                                              //Every other style
            if (event.buttons == 1) {                                       //If button is pressed
                let width = volBarWrap.clientWidth;                         //Gets width of volume-bar-wrapper
                let mousePos = event.offsetX;                               //Gets mouse-offset
                let factor = mousePos / width;                              //Gets offset percentage
                audio.volume = factor;                                      //Sets offset percentage as volume
            }
        }
    });

    /**
     * Adds eventlistener for click on volume-bar-wrapper
     * @author AtronixYT
     */
    volBarWrap.addEventListener('click', function(event) {
        if(type == 2) {                                                     //If Style is type 2
            let height = volBarWrap.clientHeight;                           //Gets height of volume-bar-wrapper
            let mousePos = event.offsetY;                                   //Gets mouse-offset
            let factor = mousePos / height;                                 //Gets offset percentage
            audio.volume = 1-factor;                                        //Sets offset percentage as volume
        }
        else {                                                              //Every other style
            let width = volBarWrap.clientWidth;                             //Gets width of volume-bar-wrapper
            let mousePos = event.offsetX;                                   //Gets mouse-offset
            let factor = mousePos / width;                                  //Gets offset percentage
            audio.volume = factor;                                          //Sets offset percentage as volume
        }
    });
}