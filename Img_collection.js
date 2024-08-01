// Define una lista de imagenes que sera agregara a una coleccion en el main.

var Selectores = require('users/corfobbppciren2023/App_HS_User:Selectores.js'); 

function dateFormat(date){
  //recibe la fecha como string y devuelve cada parte y el formato para ser utilizado en la banda
    var parts = date.split('/');
    var day = parts[0];
    var month = parts[1];
    var year = parts[2];
    var newDate = 'b' + year + '-' + month + '-' + day;
    return [newDate, year, month, day]
}


exports.collection = function(selectedYear,date) {
  if(selectedYear!=1){
    var year = selectedYear
  }else{
    year = dateFormat(date)[1];  
  }
  var newDate = dateFormat(date)[0];
  var dateList = Selectores.getDateList(year);
  var index = Selectores.getBand(date, dateList);
  var rasters = [];
  var returnRaster = null; 
  rasters.push(ee.Image('users/corfobbppciren2023/SM'+ year +'Valparaiso_n1'));
  rasters.push(ee.Image('users/corfobbppciren2023/SM'+ year +'Valparaiso_n2'));
  rasters.push(ee.Image('users/corfobbppciren2023/SM'+ year +'Valparaiso_n3'));
  rasters.push(ee.Image('users/corfobbppciren2023/SM'+ year +'Valparaiso_n4'));
   if(selectedYear==1){
  for (var j = 0; j < rasters.length; j++) {
    var raster = rasters[j];
    var bandNames = raster.bandNames();
    // Verificamos si alguna banda del raster coincide con la fecha dada
    var matchingBands = bandNames.filter(ee.Filter.stringContains('item', newDate));
    if (matchingBands.size().getInfo() > 0) {
      returnRaster = raster.select(matchingBands);
      
    }}
  }
  
  return [rasters, returnRaster]
  
}

//funcion para obtener min y max de la banda
exports.MinMaxBand = function(layer, date) {
  var region = layer.geometry();
  var bandName = dateFormat(date)[0];
  var stats = layer.reduceRegion({
    reducer: ee.Reducer.minMax(),
    geometry: region,
    scale: 1000
  });
  
  // Cree un diccionario con los valores mínimos y máximos
  var minValue = stats.get(bandName + '_min');
  var maxValue = stats.get(bandName + '_max');
  return ee.Dictionary({min: minValue, max: maxValue});
};

exports.DownloadYear = function(year){
  var links = [];
  
  var img1 = ee.Image('users/corfobbppciren2023/SM'+ year +'Valparaiso_n1'),
      img2 = ee.Image('users/corfobbppciren2023/SM'+ year +'Valparaiso_n2'),
      img3 = ee.Image('users/corfobbppciren2023/SM'+ year +'Valparaiso_n3'),
      img4 = ee.Image('users/corfobbppciren2023/SM'+ year +'Valparaiso_n4');
    
    // Lógica para generar el enlace según el año seleccionado
    var url1 = img1.getDownloadURL({name: 'SM'+ year + 'Valparaiso_1', scale: 1000, filePerBand: false, format: 'GEO_TIFF'});
    var url2 = img2.getDownloadURL({name: 'SM'+ year + 'Valparaiso_2', scale: 1000, filePerBand: false, format: 'GEO_TIFF'});
    var url3 = img3.getDownloadURL({name: 'SM'+ year + 'Valparaiso_3', scale: 1000, filePerBand: false, format: 'GEO_TIFF'});
    var url4 = img4.getDownloadURL({name: 'SM'+ year + 'Valparaiso_4', scale: 1000, filePerBand: false, format: 'GEO_TIFF'});
    
    links.push(url1, url2, url3, url4);
    return links
  
}



//funcion de prueba para ver los valores de la banda
function histograma(layer, region, bandName){
  var histogram = layer.reduceRegion({
    reducer: ee.Reducer.frequencyHistogram(),
    geometry: region,
    scale: 1000,  
    maxPixels: 1e13
  });
  
  // Obtener el histograma para la banda deseada
  var band_histogram = ee.Dictionary(histogram.get(bandName)); 
  
  // Convertir las llaves del histograma (valores únicos) en una lista
  var unique_values = band_histogram.keys().map(function(key) {
    return ee.Number.parse(key);
  });
  
  print('Unique values:', unique_values);

}

