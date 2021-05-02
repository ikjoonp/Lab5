// script.js
const canvas = document.getElementById("user-image");
const fileInput = document.getElementById("image-input");
const voiceSelect = document.getElementById('voice-selection');
const btn = document.getElementById('generate-meme');
const topText = document.getElementById('text-top');
const botText = document.getElementById('text-bottom');
const icon = document.getElementById('volume-group').getElementsByTagName('img')[0];
const volume = document.getElementById('volume-group').getElementsByTagName('input')[0];
var clearReadBtn = document.getElementById("generate-meme").getElementsByTagName('button');
var counter = 0;
var generateBtn , clearBtn, readBtn;
var voices;
var voiceVol = 1;
// Copy and pasted from the given resource. I assume this is okay given that the implementation video has identical format to this.
function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }

  voices = speechSynthesis.getVoices();

  for(var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
}
voiceSelect.disabled = false;
voiceSelect.remove(0);
populateVoiceList();

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

for (var temp of clearReadBtn) {
  if (counter == 0){
    generateBtn = temp;
    counter++;
  }else if (counter == 1){
    clearBtn = temp;
    counter++;
  }else{
    readBtn = temp;
    counter++;
  }
}

fileInput.addEventListener('change', function(e) {
  img.src = URL.createObjectURL(e.target.files[0]);
  img.alt = e.target.files[0].name;
});

const ctx = canvas.getContext('2d');
const img = new Image(); // used to load image from <input> and draw to canvas

img.addEventListener('load', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle= "black";
  ctx.fillRect(0,0, 400, 400);
  var dimensions = getDimensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);
  generateBtn.disabled = false;
  clearBtn.disabled = true;
  readBtn.disabled = true;
});


btn.addEventListener('submit', function(e) {
  e.preventDefault();

  ctx.font = '50px Impact';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText(topText.value.toUpperCase(), 200, 50, 400);
  ctx.fillText(botText.value.toUpperCase(), 200, 390, 400);

 clearBtn.disabled = false;
 readBtn.disabled = false;
 generateBtn.disabled = true;
});

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  generateBtn.disabled = false;
  clearBtn.disabled = true;
  readBtn.disabled = true;
});

// Successfully reads the meme initially but stops after using too many times/weird inputs. Seems to be buggy.

readBtn.addEventListener('click', function(e) {
  e.preventDefault();
  console.log("Read clicked");
  var utterThisTop = new SpeechSynthesisUtterance(topText.value);
  var utterThisBottom = new SpeechSynthesisUtterance(botText.value)
  utterThisTop.volume = voiceVol;
  utterThisBottom.volume = voiceVol;
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  console.log(selectedOption);
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThisTop.voice = voices[i];
      utterThisBottom.voice = voices[i];
    }
  }

  speechSynthesis.speak(utterThisTop);
  console.log("Top uttered");
  speechSynthesis.speak(utterThisBottom);
  console.log("Bottom uttered");
});

volume.addEventListener('change', function(e) {
  if (volume.value == 0){
    icon.src = "/icons/volume-level-0.svg";
    voiceVol = 0;
  }else if (volume.value < 34){
    icon.src = "/icons/volume-level-1.svg"
    voiceVol = volume.value/100;
  }else if (volume.value < 67){
    icon.src = "/icons/volume-level-2.svg"
    voiceVol = volume.value/100;
  }else{
    icon.src = "/icons/volume-level-3.svg"
    voiceVol = 1
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;
  
  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
