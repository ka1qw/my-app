import Map from 'ol/Map.js';
import * as olProj from 'ol/proj';
import XYZ from 'ol/source/XYZ.js'
import * as control from 'ol/control'
import MousePosition from 'ol/control/MousePosition.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import {createStringXY} from 'ol/coordinate.js';

var isOnDiv = false

const apiKey = 'ab100b3c34d56fbee867f2177e35e827'
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lang=ru&'

/* получаем позицию мыши */
const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});

/* карта */
const map = new Map({
  /* controls: defaultControls().extend([mousePositionControl]), */
  layers: [
    new TileLayer({
      source: new OSM(/* {wrapX:false} */),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

/* слои */
let layers = []
let tempLayer = new TileLayer({
  source: new XYZ({
    url: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=ab100b3c34d56fbee867f2177e35e827'
  })
})

let windLayer = new TileLayer({
  source: new XYZ({
    url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=ab100b3c34d56fbee867f2177e35e827'
  })
})

let PrecLayer = new TileLayer({
  source: new XYZ({
    url: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=ab100b3c34d56fbee867f2177e35e827'
  })
})

let pressureLayer = new TileLayer({
  source: new XYZ({
    url: 'https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=ab100b3c34d56fbee867f2177e35e827'
  })
})
layers.push(pressureLayer,windLayer,PrecLayer,tempLayer)

map.addLayer(tempLayer)
map.addLayer(windLayer)
map.addLayer(PrecLayer)
map.addLayer(pressureLayer)

tempLayer.setVisible(false)
windLayer.setVisible(false)
PrecLayer.setVisible(false)
pressureLayer.setVisible(false)

/* проверка на нахождение мышки в чекбоксах */
document.getElementById("wind").addEventListener("mouseenter", function(  ) {isOnDiv=true;});
document.getElementById("temperature").addEventListener("mouseenter", function(  ) {isOnDiv=true;});
document.getElementById("prec").addEventListener("mouseenter", function(  ) {isOnDiv=true;});
document.getElementById("pressure").addEventListener("mouseenter", function(  ) {isOnDiv=true;});

document.getElementById("map").addEventListener("mouseout", function(  ) {isOnDiv=false;});


/* забираем координаты во время движения */
let coord = []
map.on('pointermove', function(evt){
  coord = olProj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'); 
})

/* чекаем координаты во время клика мышью */
document.addEventListener('mousedown', function(){
  console.log(isOnDiv);
  if (!isOnDiv){
    checkWeather()
  }
  
})


/* проверяем координаты и записываем данные по ним в html */
async function checkWeather(){
  if (coord.length != 0){
    const response = await fetch(apiUrl + `appid=${apiKey}&lat=${coord[1]}&lon=${coord[0]}`)
    var data = await response.json()
    if (data.name != null){
      document.querySelector(".city").innerHTML = data.name
      document.querySelector(".temp").innerHTML = 'Температура: ' + Math.round(data.main.temp) + "°C"
      document.querySelector(".humidity").innerHTML = 'Влажность: ' + data.main.humidity + "%"
      document.querySelector(".wind").innerHTML = 'Скорость ветра: ' + data.wind.speed + " m/s"
    } else {
      document.querySelector(".temp").innerHTML = ''
      document.querySelector(".humidity").innerHTML = ''
      document.querySelector(".wind").innerHTML = ''
      document.querySelector(".city").innerHTML = "Выберите точку на карте"
    }
    if (data.name == ''){
      document.querySelector(".city").innerHTML = 'Без названия'
    }
}
    
  /* console.log(data); */
}


function func(){
  let listOfBoxes = document.getElementsByClassName('check-box')
  for(let i=0;i<4;i++){
    if (listOfBoxes[i].checked){
      layers[i].setVisible(true)
    }
    else{
      layers[i].setVisible(false)
    }
  }


}

window.onload = function() {
  let filter = document.getElementsByClassName('check-box');
  for(let i=0;i<4;i++){
    filter[i].addEventListener('change', func);
  }
}

var element = document.createElement('div');
element.className = 'prec_class';
element.innerHTML="<b>Осадки</b>"
element.appendChild(document.getElementById('prec'));

var element1 = document.createElement('div');
element1.className = 'wind_class';
element1.innerHTML="<b>Ветер</b>"
element1.appendChild(document.getElementById('wind'));

var element2 = document.createElement('div');
element2.className = 'pressure_class';
element2.innerHTML="<b>Давление</b>"
element2.appendChild(document.getElementById('pressure'));

var element3 = document.createElement('div');
element3.className = 'temp_class';
element3.innerHTML="<b>Температура</b>"
element3.appendChild(document.getElementById('temperature'));


var controlPanel = new control.Control({
  element: element
});
map.addControl(controlPanel);

var controlPanel1 = new control.Control({
  element: element1
});
map.addControl(controlPanel);

var controlPanel2 = new control.Control({
  element: element2
});
map.addControl(controlPanel);

var controlPanel3 = new control.Control({
  element: element3
});
map.addControl(controlPanel);
map.addControl(controlPanel1);
map.addControl(controlPanel2);
map.addControl(controlPanel3);

const mapChecker = document.getElementById("map")
mapChecker.addEventListener('mouseout', (e)=>{
  coord = []
})
