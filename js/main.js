//Erstellt ein Format, dass einen Integer dazu zwingt 2 Stellen zu haben.
var sekformat   = new Intl.NumberFormat('de', {minimumIntegerDigits: "2"});

var body        = document.querySelector('body');
var audio       = document.getElementById('audio');
var play        = document.getElementById('play');
var pause       = document.getElementById('pause');
var preload     = document.getElementById('preload');
var played      = document.getElementById('played');
var overlay     = document.getElementById('overlay');
var volume      = document.getElementById('volume');
var volIcons    = document.getElementById('volicons');
var volBar      = document.getElementById('volume-bar');
var volBarInner = document.getElementById('volbar-inner');
var volBarWrap  = document.getElementById('volbar-wrapper');
var volMin      = document.getElementById('volume-min');
var volMid      = document.getElementById('volume-mid');
var volMax      = document.getElementById('volume-max');
var progBar     = document.getElementById('progress-bar'); 
var progBarWrap = document.getElementById('progbar-wrapper');
var currentTime = document.getElementById('current');
var duration    = document.getElementById('duration');
var infos       = document.getElementById('infos');
var title       = document.getElementById('title');
var author      = document.getElementById('author');
var album       = document.getElementById('album');
var year        = document.getElementById('year');
var bg          = document.getElementById('background');
var timer;
var audioBlob;

function getTags(blob) {
    musicmetadata(blob, function(err, result) {
        if (err) throw err;
        
        author.innerText = result.artist;
        album.innerText = result.album;
        title.innerText = result.title;
        year.innerText = result.year;

        if (result.picture.length > 0) {
            let picture = result.picture[0];
            url = URL.createObjectURL(new Blob([picture.data], {'type': 'image/' + picture.format}));
        } else {
            url = "";
        }
        bg.src = url;
    });
}

function initControl(type) {
    pause.style.display = 'none';
    volMid.style.display = 'none';
    volMin.style.display = 'none';

    play.addEventListener('click', function() {
        audio.play();
    });

    pause.addEventListener('click', function() {
        audio.pause();
    });

    volIcons.addEventListener('click', function() {
        if(audio.muted) {
            audio.muted = false;
            console.log("Unmuted audio");
        }
        else {
            audio.muted = true;
            console.log("Muted audio");
        }
    });

    volIcons.addEventListener('mouseover', function() {
        clearTimeout(timer);
        volBarWrap.style.width = '100px';
    });

    volBarWrap.addEventListener('mouseover', function() {
        clearTimeout(timer);
        volBarWrap.style.width = '100px';
        console.log("volBarWrap Mouseover");
    });

    volume.addEventListener('mouseleave', function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            volBarWrap.style.width = '0';
        }, 1000);
    });

    audio.addEventListener('pause', function() {
        play.style.display = 'inline';
        pause.style.display = 'none';
        console.log("Pause");
    });

    audio.addEventListener('play', function() {
        play.style.display = 'none';
        pause.style.display = 'inline';
        console.log("Play");
    });

    audio.addEventListener('progress', function() {
        if(audio.buffered.length>0) {
            if(type == 2) {
                preload.style.height = 100 * audio.buffered.end(0) / audio.duration + "%";
            }
            else {
                preload.style.width = 100 * audio.buffered.end(0) / audio.duration + "%";
            }
            console.log('Preload: ' + 100 * audio.buffered.end(0) / audio.duration + "%");
        }
    });

    audio.addEventListener('timeupdate', function() {
        if(type == 2) {
            played.style.height = 100 * audio.currentTime / audio.duration + "%";
        }
        else {
            played.style.width = 100 * audio.currentTime / audio.duration + "%";
        }
        currentTime.innerText = "Time: " + Math.floor(audio.currentTime/60) + ":" + sekformat.format(Math.floor(audio.currentTime%60));;
    });

    audio.addEventListener('loadedmetadata', function() {
        currentTime.innerText = "Time: " + Math.floor(audio.currentTime/60) + ":" + sekformat.format(Math.floor(audio.currentTime%60));;
        duration.innerText = "Duration: " + Math.floor(audio.duration/60) + ":" + sekformat.format(Math.floor(audio.duration%60));
    });

    audio.addEventListener('ended', function() {
        play.style.display = 'inline';
        pause.style.display = 'none';
    });

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

    progBarWrap.addEventListener('mousemove', function(event) {
        //Setzt die aktuelle Zeit beim anklicken und bewegen innerhalb des Zeitstrahls
        if(type == 2) {
            if (event.buttons == 1) { //Prüft ob eine Maustaste gedrückt ist
                //Erfasst die gesamte Breite des progBarWrap Elements und dann die Mausposition relativ zu dem Element
                let height = progBarWrap.clientHeight;
                let mousePos = event.offsetY;

                //errechnet den Faktor der die Position des Cursors repräsentiert
                let factor = mousePos / height;

                //errechnet den neuen Wet des currentTime Attributs
                let vidDuration = audio.duration;
                let targetTime = vidDuration* (1-factor);

                //Setzt die neue currentTime
                //Der innere Teil der soundline wird automatisch aktualisiert
                audio.currentTime = targetTime;
            }
        }
        else {
            if (event.buttons == 1) { //Prüft ob eine Maustaste gedrückt ist
                //Erfasst die gesamte Breite des progBarWrap Elements und dann die Mausposition relativ zu dem Element
                let width = progBarWrap.clientWidth;
                let mousePos = event.offsetX;

                //errechnet den Faktor der die Position des Cursors repräsentiert
                let factor = mousePos / width;

                //errechnet den neuen Wet des currentTime Attributs
                let vidDuration = audio.duration;
                let targetTime = vidDuration*factor;

                //Setzt die neue currentTime
                //Der innere Teil der soundline wird automatisch aktualisiert
                audio.currentTime = targetTime;
            }
        }
    });

    progBarWrap.addEventListener('click', function(event) {
        if(type == 2) {
            //Erfasst die gesamte Breite des progBarWrap Elements und dann die Mausposition relativ zu dem Element
            let height = progBarWrap.clientHeight;
            let mousePos = event.offsetY;

            //errechnet den Faktor der die Position des Cursors repräsentiert
            let factor = mousePos / height;

            //errechnet den neuen Wet des currentTime Attributs
            let vidDuration = audio.duration;
            let targetTime = vidDuration* (1-factor);

            //Setzt die neue currentTime
            //Der innere Teil der soundline wird automatisch aktualisiert
            audio.currentTime = targetTime;
        }
        else {
            //Erfasst die gesamte Breite des progBarWrap Elements und dann die Mausposition relativ zu dem Element
            let width = progBarWrap.clientWidth;
            let mousePos = event.offsetX;

            //errechnet den Faktor der die Position des Cursors repräsentiert
            let factor = mousePos / width;

            //errechnet den neuen Wet des currentTime Attributs
            let vidDuration = audio.duration;
            let targetTime = vidDuration*factor;

            //Setzt die neue currentTime
            //Der innere Teil der soundline wird automatisch aktualisiert
            audio.currentTime = targetTime;
        }
    });

    volBarWrap.addEventListener('mousemove', function(event) {
        //Setzt die aktuelle Lautstärke beim anklicken und bewegen innerhalb des Lautstärkestrahls
        if(type == 2) {
            if (event.buttons == 1) { //Prüft ob eine Maustaste gedrückt ist
                //Erfasst die gesamte Breite des volBarWrap Elements und dann die Mausposition relativ zu dem Element
                let height = volBarWrap.clientHeight;
                let mousePos = event.offsetY;

                //errechnet den Faktor der die Position des Cursors repräsentiert
                let factor = mousePos / height;

                //Setzt die neue Volume
                //Der innere Teil der soundline wird automatisch aktualisiert
                audio.volume = 1-factor;
            }
        }
        else {
            if (event.buttons == 1) { //Prüft ob eine Maustaste gedrückt ist
                //Erfasst die gesamte Breite des volBarWrap Elements und dann die Mausposition relativ zu dem Element
                let width = volBarWrap.clientWidth;
                let mousePos = event.offsetX;

                //errechnet den Faktor der die Position des Cursors repräsentiert
                let factor = mousePos / width;

                //Setzt die neue Volume
                //Der innere Teil der soundline wird automatisch aktualisiert
                audio.volume = factor;
            }
        }
    });

    volBarWrap.addEventListener('click', function(event) {
        if(type == 2) {
            //Erfasst die gesamte Breite des volBarWrap Elements und dann die Mausposition relativ zu dem Element
            let height = volBarWrap.clientHeight;
            let mousePos = event.offsetY;

            //errechnet den Faktor der die Position des Cursors repräsentiert
            let factor = mousePos / height;

            //Setzt die neue Volume
            //Der innere Teil der soundline wird automatisch aktualisiert
            audio.volume = 1-factor;
        }    
        else {
            //Erfasst die gesamte Breite des volBarWrap Elements und dann die Mausposition relativ zu dem Element
            let width = volBarWrap.clientWidth;
            let mousePos = event.offsetX;

            //errechnet den Faktor der die Position des Cursors repräsentiert
            let factor = mousePos / width;

            //Setzt die neue Volume
            //Der innere Teil der soundline wird automatisch aktualisiert
            audio.volume = factor;
        }
    });
}