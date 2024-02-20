
let currentSong = new Audio();
let songs;
let currFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="./assets/music.svg" alt="">
        <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
        <div></div>
        </div>
        <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="./assets/play.svg" alt="">
        </div></li>`
    }

    // Attach an event listner to each songs
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs

}
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {

        currentSong.play()
        play.src = "./assets/pause.svg"
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
        <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 100 100">
                <!-- Circle -->
                <circle cx="50" cy="50" r="30" fill="#00FF00" />

                <!-- Play symbol (triangle) -->
                <polygon points="42,35 42,65 67,50" fill="#FFFFFF" />
            </svg>


        </div>
        <img src="./songs/${folder}/cover.jpeg" alt="">
        <h2>${response.title}</h2>
        <p>${response.description}</p>
    </div>`

        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })


}

async function main() {

    // get the list of all the songs
    await getSongs("songs/ArijitSingh")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()


    // Attach an event listner to play, next & previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "./assets/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "./assets/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(Math.floor(currentSong.currentTime))} / ${secondsToMinutesSeconds(Math.floor(currentSong.duration))} `
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    // Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = precent + "%";
        currentSong.currentTime = ((currentSong.duration) * precent) / 100
    })

    // Add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    // Add an event listner for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listner to previous
    previous.addEventListener("click", () => {
        console.log("p clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listner to next
    next.addEventListener("click", () => {
        console.log("n clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }

    })

    // Add event listner to mute the volume
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {

            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })


}

main()    