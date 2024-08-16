// Define una lista de imagenes que sera agregara a una coleccion en el main.
var Selectores = require('users/corfobbppciren2023/App_HS_User:Selectores.js'); 

// Función optimizada para obtener min y max
ImgClass = {};

// Variable para almacenar resultados cacheados
ImgClass.cache = {};


//Funciones internas

function dateFormat(date){
  //recibe la fecha como string y devuelve cada parte y el formato para ser utilizado en la banda
    var parts = date.split('/');
    var day = parts[0];
    var month = parts[1];
    var year = parts[2];
    var newDate = 'b' + year + '-' + month + '-' + day;
    return [newDate, year, month, day];
}

function checkAssetsYear(year) {
  print('ejecutando');
  var assetList = [
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n1',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n2',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n3',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n4'
  ];
  
  var existingCount = 0;
  
  // Función auxiliar para verificar un asset
  var checkAsset = function(assetPath) {
    // Intenta obtener el asset para verificar su existencia
    var asset = ee.Image(assetPath).getInfo();
    if (asset) {
      existingCount++;
    }
  };
  
  // Verificar cada asset en la lista
  assetList.forEach(function(path) {
    try {
      checkAsset(path);
    } catch (e) {

    }
  });
  
  return existingCount;
}

// Función para obtener el año actual
function getYear() {
  var currentDate = ee.Date(new Date());
  // Extrae el año de la fecha actual
  var currentYear = currentDate.get('year').getInfo();
  return currentYear;
}

function checkImageExistence(imageId) {
  try {
    var image = ee.Image(imageId);
    var exists = image.bandNames().size().gt(0).getInfo();
    return exists;
  } catch (e) {
    // En caso de error, la imagen no existe
    return false;
  }
}

exports.collection = function(selectedYear,date, disp_year) {
  var year;
  
  if(selectedYear!=1){
    year = selectedYear;
  }else{
    year = dateFormat(date)[1];  
  }
  var newDate = dateFormat(date)[0];
  var dateList = Selectores.getDateList(year, disp_year);
  
  var index = Selectores.getBand(date, dateList);
  var rasters = [];
  var returnRaster = null; 
  
  // Lista de IDs de imágenes
  var imageIds = [
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n1',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n2',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n3',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n4'
  ];
  
  // Verificar existencia y agregar a la lista si existe
  imageIds.forEach(function(id) {
    if (checkImageExistence(id)) {
      rasters.push(ee.Image(id));
    } 
  });
  
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

  return [rasters, returnRaster];
  
};

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


  
// Función para descargar imágenes del año especificado
exports.DownloadYear = function(year) {
  var links = [];
  // Lista de IDs de imágenes
  var imageIds = [
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n1',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n2',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n3',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n4'
  ];
  
  // Nombres de archivos para las imágenes
  var fileNames = [
    'SM' + year + 'Valparaiso_1',
    'SM' + year + 'Valparaiso_2',
    'SM' + year + 'Valparaiso_3',
    'SM' + year + 'Valparaiso_4'
  ];

  // Verificar existencia y generar enlaces solo para imágenes existentes
  for (var i = 0; i < imageIds.length; i++) {
    if (checkImageExistence(imageIds[i])) {
      var url = ee.Image(imageIds[i]).getDownloadURL({
        name: fileNames[i],
        scale: 1000,
        filePerBand: false,
        format: 'GEO_TIFF'
      });
      links.push(url);
    } 
  }
  return links;
};
