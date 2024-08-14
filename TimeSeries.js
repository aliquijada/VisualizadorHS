// TimeSeries.js

var ImgClass = require('users/corfobbppciren2023/App_HS_User:Img_collection.js');
var Sensores = require('users/corfobbppciren2023/App_HS_User:Sensores.js'); 
var s = require('users/corfobbppciren2023/App_HS_User:Style.js').styles; 



//var region = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Geometrias/Region_de_Valparaiso_4326_corregido");



exports.Click = function(year, coords, region, callback) {
  
// 1. Obtener las coordenadas  
  var point = ee.Geometry.Point([coords.lon, coords.lat]);
  if(!insideRegion(point, region)){
    return null;
  }

  // Obtener la lista de imágenes
  var rasterCollection = ImgClass.collection(year, '01/01/0101')[0];

  // Función para obtener los valores de los píxeles en un punto específico para una imagen
  var getPixelValues = function(image) {
    return image.reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: 1000, // Ajusta la escala según la resolución de tus imágenes
      maxPixels: 1e5
    });
  };

  // Combinar todos los diccionarios en uno solo
  var comb = ee.Dictionary({});
  var imgCount = rasterCollection.length;

  for (var i = 0; i < imgCount; i++) {
    var pixelRaster = getPixelValues(rasterCollection[i]);
    comb = comb.combine(pixelRaster);
  }
  var newDict = renameDict(comb);
  

  return [newDict, coords];
};

//Prueba con datos fuera de terreno de region
//exports.Click(2017, {lon: -70.88502197265625, lat: -33.063580547926655}, region);


// Función para crear el gráfico cuando se hace clic en el mapa

exports.createChartOUT = function(c, listGeometry) {

  if (listGeometry=== null) {
    print('El valor de dictValue es null.');
    //no se crea el gráfico, tampoco da alerta
    return null;
  }
  
  var point = listGeometry[1];
  var lat = point.lat.toFixed(3);
  var lon = point.lon.toFixed(3);
  var title = 'Humedad de suelo de punto: '+lat +','+ lon;
  
  var valueDict = listGeometry[0];
  
  // Se muestra el panel chartPanel por primera vez
  if (!c.chart.chartPanel.style().get('shown')) {
    c.chart.chartPanel.style().set('shown', true);
  }
  // Si se hace clic nuevamente, entonces se cambia el nombre de la etiqueta y se muestra el gráfico
  if (c.chart.shownButton.getLabel() == 'Show chart') {
    c.chart.container.style().set({shown: true});
    c.chart.shownButton.setLabel('Hide chart');
  }

  var xValues = ee.List(valueDict.keys());
  var yValues = ee.List(valueDict.values());

  // Para establecer el límite del gráfico
  var minYValue = yValues.reduce(ee.Reducer.min());
  var minYLimit = ee.Number(minYValue).subtract(2.5);
  var ylim = minYLimit.getInfo();

  // Creación del gráfico
  var chart = ui.Chart.array.values({array: yValues, axis: 0, xLabels: xValues})
  .setSeriesNames(['HS'])
  .setOptions({
    title: title,
    colors: ['1d6b99'],
    hAxis: {
      title: 'Fecha',
      titleTextStyle: s.styleChartAxis,
      slantedText: true,
      slantedTextAngle: 90,
      textStyle: {fontSize: 12},
    },
    vAxis: {
      title: 'Humedad de suelo (%)',
      titleTextStyle: s.styleChartAxis,
      viewWindow: {min: ylim}
    },
    lineSize: 2,
    pointSize: 1,
    legend: {position: 'none'},
  });

  chart.style().set(s.styleChartArea);

  // Limpiar el panel y agregar el nuevo gráfico
  c.chart.container.widgets().reset([chart]);

};


// Función para crear el gráfico cuando se selecciona un sensor
exports.createChartSensor = function(c, sensor, listGeometry, region) {
  
  
//se crea un grafico con la data 2024 y la del sensor
//listGeometry es la data del sensor
//data2024 es la data del modelo del año 2024

//sensor coordinates
var coords = Sensores.nom_sensores.get(sensor);
coords.evaluate(function(coordsEvaluated) {
    if (!coordsEvaluated) {
      print('No se encontraron coordenadas para el sensor:', sensor);
      return;
    }
    var data2024 = exports.Click('2024', coordsEvaluated, region);
    

    if (listGeometry=== null) {
    // seguro
    print('El valor de dictValue es null.');
    //no se crea el gráfico, tampoco da alerta
    return null;
  }
  
  var point = listGeometry[1];
  var lat = point.lat.toFixed(3);
  var lon = point.lon.toFixed(3);
  var title = 'Humedad de suelo sensor: ' + sensor;
  
  var valueDict = ee.Dictionary(listGeometry[0]); //convertir porque evaluate pasa los objetos a JS nativos 
  
  // Se muestra el panel chartPanel por primera vez
  if (!c.chart.chartPanel.style().get('shown')) {
    c.chart.chartPanel.style().set('shown', true);
  }
  // Si se hace clic nuevamente, entonces se cambia el nombre de la etiqueta y se muestra el gráfico
  if (c.chart.shownButton.getLabel() == 'Show chart') {
    c.chart.container.style().set({shown: true});
    c.chart.shownButton.setLabel('Hide chart');
  }



  //data sensor
  var xValues = ee.List(valueDict.keys());
  //data modelo
  var xValuesMod = ee.List(data2024[0].keys());
  
  var combinedDates = ee.List(xValues.cat(xValuesMod));
  
  // Convierte las fechas a ee.Date
  var dateList = combinedDates.map(function(dateStr) {
    return ee.Date(dateStr);
  }); 

  var minDate = ee.Date(dateList.reduce(ee.Reducer.min()));
  var maxDate = ee.Date(dateList.reduce(ee.Reducer.max()));
  
  var numDays = maxDate.difference(minDate, 'day');

// Generar una secuencia de fechas
  var dateSequence = ee.List.sequence(0, numDays).map(function(day) {
    return minDate.advance(day, 'day');
  });

  // Convertir la secuencia de fechas a un formato legible
  var formattedDateSequence = dateSequence.map(function(date) {
    return ee.Date(date).format('YYYY-MM-dd');
  });

  var updatedData2024Dict = addMissingDates(ee.Dictionary(data2024[0]), formattedDateSequence);
  var updatedValueDict = addMissingDates(valueDict, formattedDateSequence);

  var yValuesMod = ee.List(updatedData2024Dict.values());
  var yValues = ee.List(updatedValueDict.values());
  
  var minYValueMod = ee.Number(data2024[0].values().reduce(ee.Reducer.min()));
  var minYValue = ee.Number(valueDict.values().reduce(ee.Reducer.min()));
  var overallMinYValue = minYValue.min(minYValueMod);


  var combinedLists = ee.List([yValues, yValuesMod]);
  var yArray = ee.Array(combinedLists);



  
  // Para establecer el límite del gráfico
  
  var minYLimit = ee.Number(overallMinYValue).subtract(2.5);
  var ylim = minYLimit.getInfo();
  
  // Creación del gráfico
  var chart = ui.Chart.array.values({array: yArray, axis: 1, xLabels: formattedDateSequence})
  .setSeriesNames(['Sensor','Modelo'])
  .setOptions({
    title: title,
    colors: ['1d6b99', 'cf513e'],
    hAxis: {
      title: 'Fecha',
      titleTextStyle: s.styleChartAxis,
      slantedText: true,
      slantedTextAngle: 90,
      textStyle: {fontSize: 12},
    },
    vAxis: {
      title: 'Humedad de suelo (%)',
      titleTextStyle: s.styleChartAxis,
      viewWindow: {min: ylim}
    },
    //lineSize: 2,
    pointSize: 2,
    legend: {position: 'right'},
  });
  
  

  chart.style().set(s.styleChartArea);

  // Limpiar el panel y agregar el nuevo gráfico
  c.chart.container.widgets().reset([chart]);
  });
};

//AGREGAR FUNCION PARA HACER UNA TABLA CON INFORMACION DEL PUNTO CLICKEADO
exports.tablaInfo = function(coords, options, region, dictHS, date, callback) {
  //esta funcion debe funcionar solo si hay un dia seleccionado
  var map = options.map;
  var punto = ee.Geometry.Point([coords.lon, coords.lat]);
  
  if (map.layers().length() > 1 && insideRegion(punto, region) && date !== null) {
    var point = dictHS[1];
    var lat = point.lat.toFixed(3);
    var lon = point.lon.toFixed(3);
    var parts = date.split('/');
    var day = parts[0];
    var month = parts[1];
    var year = parts[2];
    var newDate = year + '-' + month + '-' + day;
    var hs = dictHS[0].get(newDate);

    hs.evaluate(function(hsValue) {
      // Redondear hsValue a 3 decimales
      var roundedHsValue = hsValue ? hsValue.toFixed(2) : null;
      
      callback({
        lat: lat,
        lon: lon,
        newDate: newDate,
        hs: roundedHsValue
      });
    });
  } else {
    callback(null);
  }

  
};


// Funciones internas
function renameDict(dict) {
  var keys = dict.keys(); // Llaves del diccionario
  var values = dict.values();
  
  var renameKey = function(key) {
    // Eliminar la letra 'b' inicial
    var newKey = ee.String(key).slice(1);
    return newKey;
  };
  
  var newKeys = keys.map(renameKey);
  var newDict = ee.Dictionary.fromLists(newKeys, values); // Construye nuevo diccionario con nuevas llaves
  return newDict;
}

function insideRegion(point, region){

// 2. Verificar que las coordenadas se encuentren en el terreno
  var regionFirst = region.first();
  var isInRegion = regionFirst.geometry().contains(point, ee.ErrorMargin(1)).getInfo();
  if(isInRegion){
    return true;
  }else{
    return false;
  }

}

function addMissingDates(dict, dateList) {

  // Usa map para recorrer dateList
  var newDictEntries = dateList.map(function(date) {
    // Convierte date a string para usar como clave
    var dateStr = ee.Date(date).format('YYYY-MM-dd');
    // Obtén el valor de dict para la clave dateStr, o NaN si no existe
    var value = dict.get(dateStr, -9999);
    return ee.List([dateStr, value]);
  });
  
  // Convierte la lista de pares de nuevo a un diccionario
  var newDict = ee.Dictionary(newDictEntries.flatten());

  return newDict;
}

//var coordsEvaluated = {'lat': -32.692044305555555, 'lon':-70.93584390000001 };
//exports.Click('2017', coordsEvaluated, region);


