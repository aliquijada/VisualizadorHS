//Clase para manejar metodos de fecha dando que se selecciona un agno

//funciones internas:

function checkAssetsYear(year) {
  // Lista de posibles assets
  var assetList = [
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n1',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n2',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n3',
    'users/corfobbppciren2023/SM' + year + 'Valparaiso_n4'
  ];
  
  var lastAvailableAsset = null;

  // Función auxiliar para verificar un asset
  var checkAsset = function(assetPath) {
    try {
      // Intenta obtener el asset para verificar su existencia
      var asset = ee.Image(assetPath).getInfo();
      // Si la imagen existe, actualiza la última imagen disponible
      if (asset) {
        lastAvailableAsset = ee.Image(assetPath);
      }
    } catch (e) {
      // Maneja el error aquí si es necesario
      //print('Error al verificar el asset: ' + assetPath);
    }
  };
  
  // Verificar cada asset en la lista en orden
  assetList.forEach(function(path) {
    checkAsset(path);
  });
  
  // Verificar si se encontró una imagen válida
  if (lastAvailableAsset) {
    // Extraer los nombres de las bandas de la imagen
    var bandNames = lastAvailableAsset.bandNames();
    // Obtener el nombre de la última banda
    var lastBandName = bandNames.get(bandNames.size().subtract(1));
    return lastBandName.getInfo(); // Obtener el nombre de la banda como una cadena
  } else {
    return null; // Retornar null si no se encontró ninguna imagen válida
  }
}

// Función para obtener el año actual
function getYear() {
  var currentDate = ee.Date(new Date());
  // Extrae el año de la fecha actual
  var currentYear = currentDate.get('year').getInfo();
  return currentYear;
}



exports.getDateList = function(year, disp_year) {
  //para el currentYear se deben utilizar las fechas hasta el raster 
  var endDate;
  var currentYear = getYear();
  var assetsCurrentYear = checkAssetsYear(currentYear);

  var dates = [];
  
  if (year !== null) {
    if(year ===currentYear.toString()){
      var datePart = assetsCurrentYear.substring(1); // Elimina la 'b'
      var cMonth = parseInt(datePart.substring(5, 7), 10) - 1; // Mes (0 basado)
      var cDay = parseInt(datePart.substring(8, 10), 10); // Día
      endDate = new Date(year, cMonth, cDay);
      
    }else{
      endDate = new Date(year, 11, 31); 
    }
    
    var startDate = new Date(year, 0, 1); 
    for (var date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      var day = ("0" + date.getDate()).slice(-2);
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var formattedDate = day + "/" + month + "/" + date.getFullYear();
      dates.push(formattedDate);
      }
  }

  return dates;
};

//si las bandas de los tiff se llaman YYYY-MM-DD entonces esta funcion no es necesaria
exports.getBand = function(date, dateList){
  var indexBand = dateList.indexOf(date);
  return indexBand;
};


exports.onChangeSelectedYear = function(c, links, selectedYear, s){
  //Primero dishabilitar los labels:
    c.downloadYear.label1.setValue('');
    c.downloadYear.label2.setValue('');
    c.downloadYear.label3.setValue('');
    c.downloadYear.label4.setValue('');
    c.downloadYear.label1.style().set(s.disableLabel);
    c.downloadYear.label2.style().set(s.disableLabel);
    c.downloadYear.label3.style().set(s.disableLabel);
    c.downloadYear.label4.style().set(s.disableLabel);
    
    c.legend.panel.style().set({'shown': false});
    
    c.downloadYear.title.setValue('Descarga año completo');
    c.downloadYear.title.style().set(s.widgetTitle);
    c.selectBand.selector.setValue(null, false );
    
    if (c.selectBand.selector.getValue() === null) {
      c.downloadBand.label.style().set(s.disableLabel);
      c.downloadBand.label.setUrl('');
    }
    
    //var links = ImgClass.collection(selectedYear, '01/01/0101', disp_year)[0];
    

  for (var i = 0; i < links.length; i++) {
  c.downloadYearlabels[i].setValue('Parte ' + (i + 1) + '/4');
  var url = links[i].getDownloadURL({
    name: 'SM' + selectedYear + 'Valparaiso_' + i.toString(), 
    scale: 1000, 
    filePerBand: false, 
    format: 'GEO_TIFF'
  });
  c.downloadYearlabels[i].setUrl(url);
  c.downloadYearlabels[i].style().set(s.ableLabel);
}
    
    //eliminar la tabla si es que hay
    if(c.infoTable !== undefined){
        c.infoTable.style().set('shown', false);
      }
    
    //eliminar la capa que este en el mapa si es que la hay
    print(c.map.layers());
    var mapLayer = c.map.layers().get(0);
    if(mapLayer !== undefined){
      if(mapLayer.getName()== 'Humedad de Suelo'){
        c.map.layers().set(0, layerDummy); //reemplazamos con la capa dummy para borrar

      }
    }
    //eliminar grafico
    c.chart.chartPanel.style().set('shown', false);
    
};



///funciones para la otra app, no utiles ahora
function bisiesto(agno) {
  return (agno % 4 === 0 && agno % 100 !== 0) || (agno % 400 === 0);
}

var meses30 = ['02','04','06','09','11'];

exports.checkFecha = function(dateString) {
  // Verificar formato DD/MM/AAAA
  //0: error de formato - 1: error de fecha - 2: fecha correcta.
  
  var dia = dateString.split('/')[0];
  var mes = dateString.split('/')[1];
  var agno = dateString.split('/')[2];
  try {
    var fechaEspecifica = new Date(agno+'-'+mes + '-'+ dia);
  // Si no hay error, verificar existencia de dia 
    

    if(isNaN(dia) || parseInt(dia)>31){
      print('formato incorrecto porque puse mas de 31 en los dias');
      return 'Formato incorrecto de fecha';
    }
    // verificar bisiesto
    if(mes == '02' && !bisiesto(agno) && dia>28){
      //print('no existe la fecha ',fechaEspecifica,' .No es agno bisisesto');
      return 'Verifique la fecha';
    }
    //verificar meses con menos de 31 dias
    if (dia>30 && meses30.indexOf(mes) !== -1){
      //print(mes, ' solo tiene 30 dias');
      return 'Verifique la fecha';
    }
    
    //verificar que agno sea posterior a 2015
    if(agno<2015){
      return 'Datos disponibles a partir del año 2015';
    }
    
    //verificar que agno sea anterior a 2025
    if(agno>2024){
      return 'Verifique la fecha';
    }
    
    print(fechaEspecifica);
    
  } catch (error) {
    // error de formato
    print('Error de formato:', error.message);
    return 'Formato incorrecto de fecha';
}
  
  return '';
};



