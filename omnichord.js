const types  = ["MAJ", "MIN", "DIM", "MAJ7", "MIN7", "AUG"];
const fifths = ["C",  "G", "D",  "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
const notes  = ["C", "Db", "D", "Eb", "E", "F", "F#",  "G", "Ab",  "A", "Bb", "B"];
const keys   = ["1",  "2", "3",  "4", "5", "6",  "7",  "8",  "9",  "0",  "-", "=",
                "q",  "w", "e",  "r", "t", "y",  "u",  "i",  "o",  "p",  "[", "]",
                "a",  "s", "d",  "f", "g", "h",  "j",  "k",  "l",  ";",  "'", "\\",
                "!",  "@", "#",  "$", "%", "^", "&",   "*", "(",   ")",  "_",  "+",
                "Q",  "W", "E",  "R", "T", "Y",  "U",  "I",  "O",  "P",  "{", "}",
                "A",  "S", "D",  "F", "G", "H",  "J",  "K",  "L",  ":",  '"', "|"];
const triads = [[0,4,7], [0,3,7], [0,3,6], [0,4,7,11], [0,3,7,11], [0,4,8]];
var currentChord = [];
var currentNoteId = null;

var chordSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        volume: -15,
        count: 3,
        spread: 40,
        type : "triangle"
    },
    envelope: {
        decay: 1,
        release: 1
    }
}).toDestination();

var harpSynth = new Tone.PolySynth(Tone.Synth, {
    volume: -15,
    oscillator: {
        type: "triangle"
    },
    envelope: {
        decay: 1,
        release: 1
    }
}).toDestination();

function getNote(key) {
    var index = keys.indexOf(key);
    var row_index = Math.floor(index / 12);
    var type = types[row_index];
    var col_index = index % 12;
    var note = fifths[col_index];
    var note_index = notes.indexOf(note);
    var id = `r${row_index}n${col_index}`;
    return {index, row_index, col_index, note_index, type, note, id};
}

function chordDown(key) {
    data = getNote(key);
    document.querySelectorAll(".key.active").forEach((activekey) => activekey.classList.remove("active"));
    document.querySelector(`#${data.id}`).classList.add("active");
    
    var chord = [];
    triads[data.row_index].forEach((note) => {
        var note_index = note + data.note_index;
        chord.push(notes[note_index % 12] + "3");
    });
    
    if(JSON.stringify(currentChord) == JSON.stringify(chord)) return;
    currentChord = chord;

    var chord_vol = document.getElementById("chordvol").value;
    chordSynth.triggerAttack(chord, "0", chord_vol);
}

function chordUp(key) {
    currentChord = [];
    chordSynth.releaseAll();
    data = getNote(key);
    document.querySelector(`#${data.id}`).classList.remove("active");
}

function slider(dir) {
    if(currentChord.length == 0) return;
    currentNoteId = Math.min(Math.max(currentNoteId + Math.sign(dir), 0), 9);

    document.querySelectorAll(".sliderbar.active").forEach((slider) => slider.classList.remove("active"));
    document.querySelector(`#slider${currentNoteId}`).classList.add("active");

    var max = currentChord.length;
    note = currentChord[currentNoteId % max];
    note = note.slice(0, -1) + (Math.floor(currentNoteId / max) + 4); // remove octave off note, add octaves
    var harp_vol = document.getElementById("harpvol").value;
    harpSynth.triggerAttackRelease(note, "4n");
}

function init() {
    var rowDiv = document.getElementById("head");
    fifths.forEach((note) => {
        rowDiv.innerHTML += `<div class="key-label"><div class="text">${note}</div></div>`;
    });
    types.forEach((type, i) => {
        var rowDiv = document.getElementById("row" + (i + 1));
        rowDiv.innerHTML = `<div class="type-label"><div class="text">${type}</div></div>`
        fifths.forEach((note, j) => {
            var key = keys[i * 12 + j];
            rowDiv.innerHTML += `<div class="key color${j}" id="r${i}n${j}"
                                      onmousedown="chordDown('${key}')" onmouseup="chordUp('${key}')">
                                    <div class="text">${key}</div>
                                 </div>`;
        });
    });

    document.addEventListener("keydown", (e) => chordDown(e.key));
    document.addEventListener("keyup", (e) =>  chordUp(e.key));
    document.addEventListener("wheel", (e) =>  slider(e.wheelDelta));
}