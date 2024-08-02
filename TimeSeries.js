// TimeSeries.js

var ImgClass = require('users/corfobbppciren2023/App_HS_User:Img_collection.js');

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


// Prueba con datos fuera de terreno de region
//exports.Click(2017, {lon: -70.88502197265625, lat: -33.063580547926655}, region);


// Función para crear el gráfico
exports.createChartOUT = function(c, listGeometry) {
  var a = 'Titulo ejemplo'
  if (listGeometry=== null) {
    print('El valor de dictValue es null.');
    //no se crea el gráfico, tampoco da alerta
    return null;
  }
  
  var point = listGeometry[1];
  var lat = point.lat.toFixed(3);
  var lon = point.lon.toFixed(3);
  var title = 'Humedad de suelo de punto: '+lat +','+ lon 
  

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

  // Estilos
  var styleChartAxis = {
    italic: false,
    bold: true
  };
  var styleChartArea = {
    width: '600px',
    height: '450px', // Valor para asegurar que se vea la fecha completa
    margin: '0px',
    padding: '0px'
  };

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
      titleTextStyle: styleChartAxis,
      slantedText: true,
      slantedTextAngle: 90,
      textStyle: {fontSize: 12},
    },
    vAxis: {
      title: 'Humedad de suelo (%)',
      titleTextStyle: styleChartAxis,
      viewWindow: {min: ylim}
    },
    lineSize: 2,
    pointSize: 1,
    legend: {position: 'none'},
  });

  chart.style().set(styleChartArea);

  // Limpiar el panel y agregar el nuevo gráfico
  c.chart.container.widgets().reset([chart]);
};


//AGREGAR FUNCION PARA HACER UNA TABLA CON INFORMACION DEL PUNTO CLICKEADO
exports.tablaInfo = function(coords, c, region, dictHS, date, callback) {
  var punto = ee.Geometry.Point([coords.lon, coords.lat]);
  
  if (c.map.layers().length() > 1 && insideRegion(punto, region)) {
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
  var regionFirst = region.first()
  var isInRegion = regionFirst.geometry().contains(point, ee.ErrorMargin(1)).getInfo();
  if(isInRegion){
    return true
  }else{
    return false
  }

}


