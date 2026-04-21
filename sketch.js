let capture;
let pg; 
let bubbles = [];
let saveBtn;
const stepSize = 20; // 馬賽克單位大小

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.hide();

  updateGraphicsLayer();

  saveBtn = createButton('SNAP! 擷取灰階畫面');
  styleButton();
  saveBtn.mousePressed(savePhoto);
}

function draw() {
  background('#e7c6ff');

  let imgW = width * 0.6;
  let imgH = height * 0.6;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;

  // 1. 繪製外邊框
  noFill();
  stroke('#ffffff');
  strokeWeight(8);
  rect(x - 5, y - 5, imgW + 10, imgH + 10, 15);

  // 2. 處理馬賽克與灰階邏輯
  push();
  translate(x + imgW, y); // 移動到右邊準備翻轉
  scale(-1, 1);           // 水平翻轉
  
  capture.loadPixels();
  
  // 雙重迴圈遍歷視訊像素，步進值為 stepSize
  for (let ty = 0; ty < capture.height; ty += stepSize) {
    for (let tx = 0; tx < capture.width; tx += stepSize) {
      // 取得該像素點的索引位置 (r, g, b, a)
      let index = (tx + ty * capture.width) * 4;
      let r = capture.pixels[index];
      let g = capture.pixels[index + 1];
      let b = capture.pixels[index + 2];

      // 計算平均值取得灰階值
      let gray = (r + g + b) / 3;

      // 根據灰階值填充顏色
      fill(gray);
      noStroke();
      
      // 將視訊的座標對應到畫布顯示的比例
      let drawX = map(tx, 0, capture.width, 0, imgW);
      let drawY = map(ty, 0, capture.height, 0, imgH);
      let drawStepW = map(stepSize, 0, capture.width, 0, imgW);
      let drawStepH = map(stepSize, 0, capture.height, 0, imgH);
      
      rect(drawX, drawY, drawStepW, drawStepH);
    }
  }
  pop();

  // 3. 處理泡泡層 (維持在最上方)
  pg.clear();
  if (random(1) < 0.15) {
    bubbles.push(new Bubble(pg.width, pg.height));
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display(pg);
    if (bubbles[i].isDead()) bubbles.splice(i, 1);
  }
  image(pg, x, y);

  // 4. 按鈕位置
  saveBtn.position(width / 2 - saveBtn.width / 2, y + imgH + 30);
}

function updateGraphicsLayer() {
  pg = createGraphics(width * 0.6, height * 0.6);
}

function savePhoto() {
  let imgW = width * 0.6;
  let imgH = height * 0.6;
  let x = (width - imgW) / 2;
  let y = (height - imgH) / 2;
  
  let snapshot = get(x, y, imgW, imgH);
  snapshot.save('grayscale_mosaic', 'jpg');
}

function styleButton() {
  saveBtn.style('padding', '10px 20px');
  saveBtn.style('background-color', '#4a4e69');
  saveBtn.style('color', 'white');
  saveBtn.style('border', 'none');
  saveBtn.style('border-radius', '20px');
  saveBtn.style('font-weight', 'bold');
  saveBtn.style('cursor', 'pointer');
}

class Bubble {
  constructor(w, h) {
    this.x = random(w);
    this.y = h + 20;
    this.r = random(4, 12);
    this.speed = random(1, 2.5);
  }
  update() {
    this.y -= this.speed;
    this.x += sin(frameCount * 0.05) * 0.8;
  }
  display(layer) {
    layer.noFill();
    layer.stroke(255, 180);
    layer.strokeWeight(2);
    layer.circle(this.x, this.y, this.r * 2);
    layer.fill(255, 100);
    layer.noStroke();
    layer.circle(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.4);
  }
  isDead() { return this.y < -20; }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateGraphicsLayer();
}