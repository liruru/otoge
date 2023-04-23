const songList = [
  {name: "長音厨肺活量テスト", displaybpm: "180", bpm: 180, offset: 395}
];
let mode, songs, fumen, result, combo, score;
let notesSpeed = 1;

let selectSE, roll, oldSelected;
let spacing = 65;

let tapSE, song, startDate, gameFrameCount, timer, judgeLine, notesList;
let fastLate = [];
let particle = [];


function preload() {
  selectSE = loadSound("選択.mp3");
  tapSE = loadSound("タップ.mp3");
  songs = [loadSound("【初音ミク】長音厨肺活量テスト【オリジナルPV】.mp3"), loadSound("test.mp3")];
  fumen = [loadStrings("長音厨.txt"), loadStrings("test.txt")];
}


function setup() {
  frameRate(60);
  createCanvas(1280, 960);
  background(255);

  menu();
}

function menu() { 
  roll = 0;
  mode = "menu";
}

function game(_song) {
  mode = "game";
  song = _song;
  startDate = Date.now();
  gameFrameCount = 0;
  judgeLine = height-200;
  notesList = [];
  combo = 0;
  score = 0;
  result = {perfect: 0, great: 0, good: 0, miss: 0};

  for(let i of fumen[song]) {
    let _type = "1";
    let _key;
    let _timing = 60000 / songList[song].bpm * i.slice(1) + songList[song].offset + 1200;
    let _x;
    let _y = judgeLine - 60000 / songList[song].bpm * i.slice(1) * notesSpeed - songList[song].offset - 1200;

    if(i.charAt() === "d") {
      _key = "d";
      _x = width/2 - spacing*3;
    }
    else if(i.charAt() === "f") {
      _key = "f";
      _x = width/2 - spacing;
    }
    else if(i.charAt() === "j") {
      _key = "j";
      _x = width/2 + spacing;
    }
    else if(i.charAt() === "k") {
      _key = "k";
      _x = width/2 + spacing*3;
    }

    notesList.push({type: _type, key: _key, timing: _timing, x: _x, y: _y, isProcessed: false});
  }
}

function draw() {
  background(255);
  strokeWeight(1);
  stroke(77);
  noFill();
  rect(0, 0, width, height);

  if(mode === "menu") {
    drawMenu();
  }
  else if(mode === "game") {
    drawGame();
  }
  else if(mode === "result") {
    drawResult();
  }
}

function drawMenu() {
  if(keyIsDown(13) || keyIsDown(32)) {
    //決定
    game(selected);
  }
  else {
    if(keyIsDown(38) && roll>0) roll -= 1;
    if(keyIsDown(40) && roll<(songList.length-1)*10) roll += 1;
    
    selected = round(roll/10);

    for(let i=0; i<songList.length; i++) {
      if(i === selected) {
        //選択中
        noFill();
        strokeWeight(3);
        stroke(77);
        rect(350, height/2 - 55 + (i*10-roll)*12, width, 110);
        fill(77);
        noStroke();
        textSize(40);
        text(`${songList[i].name}`, 380, height/2 + 10 + (i*10-roll)*12);
        textSize(20);
        text(`BPM: ${songList[i].displaybpm}`, 384, height/2 + 45 + (i*10-roll)*12);
      }
      else {
        //それ以外
        noFill();
        strokeWeight(3);
        stroke(179);
        rect(450, height/2 - 46 + (i*10-roll)*12, width, 85);
  
        fill(179);
        noStroke();
        textSize(35);
        text(`${songList[i].name}`, 480, height/2 + 8 + (i*10-roll)*12);
      }
    }

    if(oldSelected != selected) selectSE.play();
    oldSelected = selected;
  }
}

function drawGame() {
  timer = Date.now() - startDate;
  gameFrameCount += 1;

  if(gameFrameCount === 90) {
    songs[song].play();
  }

  drawLines();

  noStroke();
  fill(77);
  textSize(30);
  text(`Score: ${round(score)}`,10, 40);
  text(`Combo: ${combo}`, 1000, 40);

  drawParticle();

  //ノーツ
  notesList.map(e => e.y += notesSpeed*deltaTime);
  for(let i of notesList) {
    if(!i.isProcessed) {
      if(i.timing - timer < -200) { 
        result.miss += 1;
        combo = 0;
        i.isProcessed = true;
      }
      if(!i.isProcessed) drawNotes(i.type, i.x, i.y);
    }
  }

  for(let i=0; i<notesList.length; i++) {
    if(!notesList[i].isProcessed) break;
    if(i+1 === notesList.length) {
      mode = "result";
    }
  }
}

function drawLines() {
  strokeWeight(2);
  stroke(keyIsDown(68) ? 223 : 128);
  line(width/2 - spacing*3, 0, width/2 - spacing*3, height);
  stroke(keyIsDown(70) ? 223 : 128);
  line(width/2 - spacing, 0, width/2 - spacing, height);
  stroke(keyIsDown(74) ? 223 : 128);
  line(width/2 + spacing, 0, width/2 + spacing, height);
  stroke(keyIsDown(75) ? 223 : 128);
  line(width/2 + spacing*3, 0, width/2 + spacing*3, height);
  stroke(191);
  line(0, judgeLine, width, judgeLine);
}

function drawNotes(type, x, y) {
  stroke(217);
  strokeWeight(4);
  fill(204, 239, 255);
  if(type === "1") {
    circle(x, y, 45);
  }
}

function keyTyped() {
  if(mode === "game") {
    timer = Date.now() - startDate;
    if(keyCode === 68) { //d
      tapSE.play();
      for(let i of notesList) {
        if(i.key === "d" && !(i.isProcessed)) {
          let judgement = judge(i.timing, timer)
          tap(judgement, i.x, i.y);
          if(judgement !== null) i.isProcessed = true;
          break;
        }
      }
    }
    else if(keyCode === 70) { //f
      tapSE.play();
      for(let i of notesList) {
        if(i.key === "f" && !(i.isProcessed)) {
          let judgement = judge(i.timing, timer)
          tap(judgement, i.x, i.y);
          if(judgement !== null) i.isProcessed = true;
          break;
        }
      }
    }
    else if(keyCode === 74) { //j
      tapSE.play();
      for(let i of notesList) {
        if(i.key === "j" && !(i.isProcessed)) {
          let judgement = judge(i.timing, timer)
          tap(judgement, i.x, i.y);
          if(judgement !== null) i.isProcessed = true;
          break;
        }
      }
    }
    else if(keyCode === 75) { //k
      tapSE.play();
      for(let i of notesList) {
        if(i.key === "k" && !(i.isProcessed)) {
          let judgement = judge(i.timing, timer);
          tap(judgement, i.x, i.y);
          if(judgement !== null) i.isProcessed = true;
          break;
        }
      }
    }
  }

  if(mode === "result") {
    
  }
}

function judge(timing, timer) {
  //console.log(timing - timer);
  if(abs(timing - timer) < 50) {
    result.perfect += 1;
    combo += 1;
    score += 10000000/notesList.length;
    return "perfect";
  }
  else if(abs(timing - timer) < 120) {
    result.great += 1;
    combo += 1;
    score += 10000000/notesList.length * 2/3;
    return "great";
  }
  else if(abs(timing - timer) < 180) {
    result.good += 1;
    combo = 0;
    score += 10000000/notesList.length * 1/3;
    return "good";
  }

  else return null;
}

function tap(judge, _x, _y) {
  for(let i=0; i<5; i++) {
    let _d = random(0, 2*PI);
    let _s = 4;
    let _r, _g, _b;
    if(judge === "perfect") { 
      _r = 255;
      _g = 228;
      _b = 153;
      particle.push({x: _x, y: _y, d: _d, s: _s, r: _r, g: _g, b: _b, alpha: 255});
    }
    else if(judge === "great") {
      _r = 179;
      _g = 204;
      _b = 240;
      particle.push({x: _x, y: _y, d: _d, s: _s, r: _r, g: _g, b: _b, alpha: 255});
    }
    else if(judge === "good") {
      _r = 204;
      _g = 204;
      _b = 204;
      particle.push({x: _x, y: _y, d: _d, s: _s, r: _r, g: _g, b: _b, alpha: 255});
    }
    
  }
}

function drawParticle() {
  for(let i of particle) {
    stroke(i.r, i.g, i.b, i.alpha);
    strokeWeight(4);
    noFill()
    circle(i.x, i.y, 50);
    i.x += i.s*cos(i.d);
    i.y += i.s*sin(i.d);
    if(i.alpha < 0) particle.splice(particle.indexOf(i), 1)
    else i.alpha -= 10;
  }
}

function drawResult() {
  drawLines();
  background(77, 77, 77, 89);

  fill(255);
  noStroke();


  textSize(180);
  text(round(score), 170, 420);

  textSize(50);
  text(songList[song].name, 180, 180);
  if(result.great + result.good + result.miss === 0) text("All Perfect!", 770, 180);
  else if(result.good + result.miss === 0) text("Full Combo!", 770, 180);

  textSize(45);
  text("Perfect:", 180, 600);
  text("Great:", 180, 680);
  text("Good:", 180, 760);
  text("Miss:", 180, 840);
  text(`${result.perfect}`, 410, 600);
  text(`${result.great}`, 410, 680);
  text(`${result.good}`, 410, 760);
  text(`${result.miss}`, 410, 840);

  textSize(240);
  strokeWeight(5);
  stroke(255);
  if(result.great + result.good + result.miss === 0) text("SS", 780, 820);
  else if(score >= 9500000) text("S", 780, 820);
  else if(score >= 9000000) text("A", 780, 820);
  else if(score >= 8000000) text("B", 780, 820);
  else if(score >= 6000000) text("C", 780, 820);
  else text("D", 800, 820);
}