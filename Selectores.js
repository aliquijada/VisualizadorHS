//Clase para manejar metodos de fecha dando que se selecciona un agno


exports.getDateList = function(year, disp_year) {
  var dates = [];
  if (year !== null) {
    var startDate = new Date(year, 0, 1); 
    var endDate = new Date(year, 11, 31); 

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

//checkFecha('asdasd');

