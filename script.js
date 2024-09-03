let currentsong = new Audio();
let songs;
let curentFolder;
let Fold;
let loop = false;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getFolders(params) {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let respose = await a.text();
    let div = document.createElement("div")
    div.innerHTML = respose;
    let as = div.getElementsByTagName("a")
    // console.log(as);
    Fold = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.includes("/songs")) {
            Fold.push(element.href.split("/songs/")[1]);
        }
    }
    return Fold;

}
async function getSongs(folder) {
    curentFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let respose = await a.text();
    let div = document.createElement("div")
    div.innerHTML = respose;
    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }

    // Show all the songs in the playlist
    let songlist = document.querySelector(".left-mid").getElementsByTagName("ul")[0]
    songlist.innerHTML = ""
    for (const song of songs) {
        songlist.innerHTML = songlist.innerHTML + `
         <li>
         <img class="invert" src="/images/music.svg" alt="">
         <div class="info">${song.replaceAll('%20', " ").split('.mp3')[0]}</div>
         <div class="playnow">
         <img class="invert"  src="/images/playsqu.svg" alt="">
         </div></li>`;
    }


    // Attach Event listener to each song in playlist
    Array.from(document.querySelector(".left-mid").getElementsByTagName('li')).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").innerHTML + ".mp3")

        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${curentFolder}/` + track
    if (!pause) {
        currentsong.play();
        play.src = "/images/pause.svg"
    }
    document.querySelector(".songName").innerHTML = decodeURI(track.split(".mp3")[0])

}


async function main(params) {

    //  get list of songs 
    await getSongs("songs/yt")

    playMusic(songs[0], true)

    // Show all the folder in the album
    Fold = await getFolders()

    let album = document.querySelector(".playlist")
    for (const folder of Fold) {
        // Get the metadata of the folder
        let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
        let respose = await a.json();

        album.innerHTML = album.innerHTML + `
        <div class="card" data-folder="${folder}">
        <div class="play">
            <img src="/images/play.svg" alt="">
        </div>
        <img src="/songs/${folder}/cover.jpg" alt="">
        <h3>${respose.title}</h3>
        <p>${respose.description}</p>
        </div>
        `
        // <h3>${folder.replaceAll('%20', " ").slice(0, -1)}</h3>
    }


    // Attach Event listener to each card in album
    Array.from(document.querySelector(".playlist").getElementsByClassName('card')).forEach(e => {
        e.addEventListener("click", async element => {

            songs = await getSongs(`songs/${element.currentTarget.dataset.folder.slice(0, -1)}`)

            playMusic(songs[0])
        })
    })

    // Attach Event listener play
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "/images/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = '/images/play V2.svg'
        }
    })

    // Attach Event listener previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0]);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])

        } else if ((index) < 1) {
            playMusic(songs[songs.length - 1])
        }

    })

    // Attach Event listener next
    next.addEventListener("click", () => {
        currentsong.pause()
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        else if ((index) = songs.length) {
            playMusic(songs[0])
        }
    })

    //  Listen to time update event
    currentsong.addEventListener("timeupdate", () => {

        current_Time.innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}`
        song_Duration.innerHTML = `${secondsToMinutesSeconds(currentsong.duration)}`

        // seekbar motion 
        const sheet = document.styleSheets[0];
        const rules = sheet.cssRules || sheet.rules;

        // Modify the rule for .play-song .container_two div span::before
        for (let i = 0; i < rules.length; i++) {
            if (rules[i].selectorText === '.play-song .container_two div span::before') {
                rules[i].style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"; // Change the left property
                break;
            }
            if (rules[i].selectorText === '.play-song .container_two div span::after') {
                rules[i].style.width = (currentsong.currentTime / currentsong.duration) * 100 + "%";
            }
        }

        // playing next songs automatically
        for (let i = 0; i <= songs.length; i++) {
            // const element = array[index];
            let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
            if (currentsong.currentTime == currentsong.duration) {
                if ((index) < songs.length - 1) {
                    playMusic(songs[index + 1])
                }
                else if (loop) {
                    playMusic(songs[0])
                }
            }

        }
    })

    //    Add Event listener on seekbar 
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        const sheet = document.styleSheets[0];
        const rules = sheet.cssRules || sheet.rules;

        // Modify the rule for .play-song .container_two div span::before
        for (let i = 0; i < rules.length; i++) {
            if (rules[i].selectorText === '.play-song .container_two div span::before') {
                rules[i].style.left = percent + "%"; // Change the left property
                break;
            }
            if (rules[i].selectorText === '.play-song .container_two div span::after') {
                rules[i].style.width = percent + "%";
            }
        }
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;


    })
    //    Add Event listener on volume
    range.addEventListener('change', (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
    }) 
    //    Add Event listener for Loop
    document.querySelector(".loop").addEventListener('click', (e) => {
        loop = true
        document.querySelector(".loop").classList.toggle('glow');
    })

    //  Add Event Listener on Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    //  Add Event Listener on close hamburger
    document.querySelector(".ham-close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })
    // Add Event Listener for mute
    sound.addEventListener("click",(e)=>{
        if (sound.src.includes("volume.svg")) {
            sound.src="images/mute.svg"
            currentsong.volume=0;
        }
        else{
            sound.src= "images/volume.svg"
            currentsong.volume = 1
        }
        
    })
}

main();