
/* Google Analytics*/

var analyticsCode = ui.Label({
  value: '<!-- Google tag (gtag.js) -->'+
        '<script async src="https://www.googletagmanager.com/gtag/js?id=G-71LZ1F1B4W"></script>'+
        '<script>'+
        'window.dataLayer = window.dataLayer || [];'+
        'function gtag(){dataLayer.push(arguments);}'+
        'gtag("js", new Date());'+
        'gtag("config", "G-71LZ1F1B4W");'+
        '</script>',
  style: {position: 'bottom-left'},
  targetUrl: null,
  
});
var analyticsPanel = ui.Panel({
  widgets: [analyticsCode],
  style: {shown: false}
});
ui.root.add(analyticsPanel);
/*******************************************************************************
 * Modulos *
 * Import all the modules from other scripts
 ******************************************************************************/

var Selectores = require('users/corfobbppciren2023/App_HS_User:Selectores.js'); 
var ImgClass = require('users/corfobbppciren2023/App_HS_User:Img_collection.js'); 
var chartClass = require('users/corfobbppciren2023/App_HS_User:TimeSerie.js'); 
var c = {}; // Define a JSON object for storing UI components.
var region = ee.FeatureCollection("projects/ee-corfobbppciren2023/assets/Geometrias/Region_de_Valparaiso_4326_corregido");


/*******************************************************************************
 * Components *
 * 
 * A section to define the widgets that will compose your app.
 * 
 * Guidelines:
 * 1. Except for static text and constraints, accept default values;
 *    initialize them in the initialization section.
 * 2. Limit composition of widgets to those belonging to an inseparable unit
 *    (i.e. a group of widgets that would make no sense out of order). 
 ******************************************************************************/

// Define a control panel for user input.
c.controlPanel = ui.Panel();

// Define a series of panel widgets to be used as horizontal dividers.
c.dividers = {};
c.dividers.divider1 = ui.Panel();
c.dividers.divider2 = ui.Panel();
c.dividers.divider3 = ui.Panel();
c.dividers.divider4 = ui.Panel();

// Define the main interactive map.
c.map = ui.Map();

// Define an app info widget group.
c.info = {};
c.info.titleLabel = ui.Label('Humedad de suelo');
c.info.aboutLabel = ui.Label(
  'Producto de humedad de suelo en unidades de [%] ' +
  'desde el 2015 a 2023 a una resolución espacial de 1 km x 1km. ' +
  'Mediante un click, seleccione un punto de interés para obtener ' +
  'la evolución temporal de la humedad.');
c.info.paperLabel = ui.Label({
  value: 'Repositorio GitHub',
  targetUrl: 'https://github.com/jvaldiviesob/Humedad_de_Suelo'
});
c.info.websiteLabel = ui.Label({
  value: 'Publicación de referencia',
  targetUrl: 'https://www.nature.com/articles/s41597-023-02011-7'
});
c.info.panel = ui.Panel([
  c.info.titleLabel, c.info.aboutLabel,
  c.info.paperLabel, c.info.websiteLabel
]);

//Define a download per year widget group
c.downloadYear = {}
c.downloadYear.title = ui.Label();
c.downloadYear.label1 = ui.Label();
c.downloadYear.label2 = ui.Label();
c.downloadYear.label3 = ui.Label();
c.downloadYear.label4 = ui.Label();

//Lista donde se almacenara el valor min y max de la capa mostrada. 
//Se usa para actualizar la leyenda y renderizar la capa
c.minmax= []


var init_year = '2017'
//probaremos con el agno 2017 primero
var disp_year = ['2017', '2015']
//var disp_year = ['2015','2016','2017','2018','2019','2020','2021','2022','2023']

//arreglo temporal
var DownloadYearlabels = [
  c.downloadYear.label1,
  c.downloadYear.label2,
  c.downloadYear.label3,
  c.downloadYear.label4
];

// Define a data year selector widget group.
c.selectYear = {};
c.selectYear.label = ui.Label('Seleccione un año para mostrar');
c.selectYear.selector = ui.Select({
  items:disp_year,
  value: init_year, 
  onChange: function(selectedYear) {
    c.downloadYear.title.setValue('Descarga año completo');
    c.downloadYear.title.style().set(s.widgetTitle);
    c.selectBand.selector.setValue(null, false );
        if (c.selectBand.selector.getValue() === null) {
          c.downloadBand.label.style().set(disableLabel);
          c.downloadBand.label.setUrl('');
        }
    
    var links = ImgClass.collection(selectedYear, '01/01/0101')[0];
    for (var i = 0; i < DownloadYearlabels.length; i++) {
      DownloadYearlabels[i].setValue('Parte ' + (i + 1) + '/4');
      var url = links[i].getDownloadURL({name: 'SM'+ selectedYear + 'Valparaiso_'+ i.toString(), scale: 1000, filePerBand: false, format: 'GEO_TIFF'});
      DownloadYearlabels[i].setUrl(url);
      DownloadYearlabels[i].style().set(ableLabel);
      
    }
    
    //eliminar la tabla si es que hay
    if(c.infoTable !== undefined){
        c.infoTable.style().set('shown', false);
      }
    
    //eliminar la capa que este en el mapa si es que la hay
    print(c.map.layers());
    var mapLayer = c.map.layers().get(1);
    if(mapLayer !== undefined){
      if(mapLayer.getName()== 'Humedad de Suelo'){
        c.map.remove(mapLayer);
      }
    }
    //eliminar grafico
    c.chart.chartPanel.style().set('shown', false);
  }
  
})
c.selectYear.panel = ui.Panel([c.selectYear.label, c.selectYear.selector]);
c.downloadYear.panel = ui.Panel([c.downloadYear.title, 
                                  c.downloadYear.label1,
                                  c.downloadYear.label2,
                                  c.downloadYear.label3,
                                  c.downloadYear.label4])

// Define a download per day widget group
c.downloadBand = {}; //Etiqueta de descarga que se actualizará dinámicamente
c.downloadBand.title = ui.Label('')
c.downloadBand.label = ui.Label('');

// Define a data band selector widget group.
//inicializamos en el 2023
c.selectBand = {};
c.selectBand.label = ui.Label('Seleccione el día a visualizar');
c.selectBand.selector = ui.Select({
  items: Selectores.getDateList(init_year),
  placeholder: 'Seleccione una fecha',
  onChange: function(selectedDate) {
    
    var raster = ImgClass.collection(1,selectedDate)[1];
    
    // Verificar si se obtuvo un raster válido
    if (raster !== null) {
      
      try{
        var minMaxResult = updateMinMax(raster, selectedDate);
        print(minMaxResult);

        // Utilizar los valores min y max directamente
        var clippedRaster = raster.clip(region);
        var layer = ui.Map.Layer(clippedRaster, {
          min: minMaxResult.min,
          max: minMaxResult.max,
          palette: ['ECF0FF', '8A4089', '00145D']
        }, 'Humedad de Suelo');
        
        c.map.layers().set(1, layer); //se agrega a la segunda posicion
      
      updateLegend(minMaxResult.min, minMaxResult.max);
      
      //genera link de descarga inmediatamente
      var downloadUrl = raster.getDownloadURL({format: 'GeoTIFF'});
      c.downloadBand.label.setValue('Descarga Imagen día');
      c.downloadBand.label.setUrl(downloadUrl);
      c.downloadBand.label.style().set(ableLabel);
      c.downloadBand.title.setValue('Descarga día seleccionado');
      c.downloadBand.title.style().set(s.widgetTitle)
      
      if(c.infoTable !== undefined){
        //borrar la tabla si es que existe
        c.infoTable.style().set('shown', false);
      }
      
      }catch (err) {
        print('Error:', err);
      }


    } else {
      print('No se encontró un raster para la fecha seleccionada.');
    }
  }
});
c.selectBand.panel = ui.Panel([c.selectBand.label, c.selectBand.selector]);
c.downloadBand.panel = ui.Panel([c.downloadBand.title, c.downloadBand.label ])


// Define a legend widget group.
c.legend = {};
c.legend.title = ui.Label();
c.legend.colorbar = ui.Thumbnail(ee.Image.pixelLonLat().select(0));
c.legend.leftLabel = ui.Label('[min]');
c.legend.centerLabel = ui.Label();
c.legend.rightLabel = ui.Label('[max]');
c.legend.labelPanel = ui.Panel({
  widgets: [
    c.legend.leftLabel,
    c.legend.centerLabel,
    c.legend.rightLabel,
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});
c.legend.panel = ui.Panel([
  c.legend.title,
  c.legend.colorbar,
  c.legend.labelPanel
]);


// Widgets del mapa


//Define a panel for informative table

c.infoTable = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    shown: false  // Esconder el panel inicialmente
  }}); //panel con información onClick 

// Crear un botón de cerrar
var closeButton = ui.Button({
  label : 'Cerrar tabla',
  onClick: function() {
    c.infoTable.style().set('shown', false);
  },
  style: {
    margin: '0px 0px 2px 0px',
    fontSize: '6px',
    padding: '0px',

  }
});


// Crear las filas con etiquetas vacías que se actualizarán más tarde
var latRow = createRow('Latitud', '', 'white');
var lonRow = createRow('Longitud', '', '#D3D3D3');
var humRow = createRow('Humedad (%)', '', 'white');
var dateRow = createRow('Fecha', '', '#D3D3D3');



// Define a panel for displaying a chart.
c.chart = {};
c.chart.shownButton = ui.Button('Ocultar gráfico');
c.chart.container = ui.Panel();  // will hold the dynamically generated chart. 
c.chart.chartPanel = ui.Panel([c.chart.shownButton, c.chart.container]);


//Point for onClick function
var pointLayer = null


/*******************************************************************************
 * Composition *
 * 
 * A section to compose the app i.e. add child widgets and widget groups to
 * first-level parent components like control panels and maps.
 * 
 * Guidelines: There is a gradient between components and composition. There
 * are no hard guidelines here; use this section to help conceptually break up
 * the composition of complicated apps with many widgets and widget groups.
 ******************************************************************************/

c.controlPanel.add(c.info.panel);
c.controlPanel.add(c.dividers.divider1);
c.controlPanel.add(c.selectYear.panel);
c.controlPanel.add(c.selectBand.panel);
c.controlPanel.add(c.dividers.divider4);
c.controlPanel.add(c.downloadBand.panel);
c.controlPanel.add(c.downloadYear.panel);

c.infoTable.add(closeButton);
c.infoTable.add(latRow);
c.infoTable.add(lonRow);
c.infoTable.add(humRow);
c.infoTable.add(dateRow);


c.map.add(c.legend.panel);
c.map.add(c.chart.chartPanel);
c.map.add(c.infoTable);


//Mapa de fondo, region
//colores region
var visParams_region = {
  color: 'black',          // Color del borde
  fillColor: 'FF000000',
  width: 3               // Ancho del borde
};
var styled_region = region.style(visParams_region);
var layer_region = ui.Map.Layer(styled_region, {}, 'Región de Valparaíso');
c.map.layers().add(layer_region);


ui.root.clear();
ui.root.add(c.controlPanel);
ui.root.add(c.map);


/*******************************************************************************
 * Styling *
 * 
 * A section to define and set widget style properties.
 * 
 * Guidelines:
 * 1. At the top, define styles for widget "classes" i.e. styles that might be
 *    applied to several widgets, like text styles or margin styles.
 * 2. Set "inline" style properties for single-use styles.
 * 3. You can add multiple styles to widgets, add "inline" style followed by
 *    "class" styles. If multiple styles need to be set on the same widget, do
 *    it consecutively to maintain order.
 ******************************************************************************/

// Define CSS-like class style properties for widgets; reusable styles.
var s = {};

s.opacityWhiteMed = {
  backgroundColor: 'rgba(255, 255, 255, 0.5)'
};
s.opacityWhiteNone = {
  backgroundColor: 'rgba(255, 255, 255, 0)'
};
s.aboutText = {
  fontSize: '13px',
  color: '505050'
};
s.widgetTitle = {
  fontSize: '15px',
  fontWeight: 'bold',
  margin: '8px 8px 0px 8px',
  color: '383838'
};
s.stretchHorizontal = {
  stretch: 'horizontal'
};
s.noTopMargin = {
  margin: '0px 8px 8px 8px'
};
s.smallBottomMargin = {
  margin: '8px 8px 4px 8px'
};
s.bigTopMargin = {
  margin: '24px 8px 8px 8px'
};
s.divider = {
  backgroundColor: 'F0F0F0',
  height: '4px',
  margin: '20px 0px'
};

s.infoTable = {
  border: '1px solid black',
  width: '250px',
  padding: '8px',
  shown: false
}


//diccionario con estilo de label desactivada, se busca transparencia. Sera el estilo inicial.
var disableLabel = {
  backgroundColor: 'white',  // blanco como el fondo del controlPanel.
  padding: '10px 15px',  
  border: 'none',
  color: 'white',  
  textAlign: 'center',  
  fontSize: '13px',  
  margin: '10px'};

var ableLabel = {
  stretch: 'horizontal',
  backgroundColor: '#f3f3f3',  // color gris igual al de los selectores.
  padding: '5px',  
  border: '1px solid lightgrey',//#dcdcd 
  color: 'black',  
  textAlign: 'center',  
  fontSize: '13px',  
  margin: '10px' 
}
// Set widget style.
c.info.titleLabel.style().set({
  fontSize: '20px',
  fontWeight: 'bold'
});
c.info.titleLabel.style().set(s.bigTopMargin);
c.info.aboutLabel.style().set(s.aboutText);
c.info.paperLabel.style().set(s.aboutText);
c.info.paperLabel.style().set(s.smallBottomMargin);
c.info.websiteLabel.style().set(s.aboutText);
c.info.websiteLabel.style().set(s.noTopMargin);

c.selectYear.selector.style().set(s.stretchHorizontal);
c.selectYear.label.style().set(s.widgetTitle);

c.selectBand.selector.style().set(s.stretchHorizontal);
c.selectBand.label.style().set(s.widgetTitle);

c.downloadYear.label1.style().set(disableLabel);
c.downloadYear.label2.style().set(disableLabel);
c.downloadYear.label3.style().set(disableLabel);
c.downloadYear.label4.style().set(disableLabel);
c.downloadBand.label.style().set(disableLabel);

c.controlPanel.style().set({
  width: '275px',
  padding: '0px'
});

c.map.style().set({
  cursor: 'crosshair'
});

c.map.setOptions('SATELLITE');

c.chart.chartPanel.style().set({
  position: 'bottom-right',
  shown: false
});
c.chart.chartPanel.style().set(s.opacityWhiteMed);
c.chart.shownButton.style().set({
  margin: '0px 0px',
});


//estilo leyenda
c.legend.title.style().set({
  fontWeight: 'bold',
  fontSize: '12px',
  color: '383838'
});
c.legend.title.style().set(s.opacityWhiteNone);
c.legend.colorbar.style().set({
  stretch: 'horizontal',
  margin: '0px 8px',
  maxHeight: '20px'
});
c.legend.leftLabel.style().set({
  margin: '4px 8px',
  fontSize: '12px'
});
c.legend.leftLabel.style().set(s.opacityWhiteNone);
c.legend.centerLabel.style().set({
  margin: '4px 8px',
  fontSize: '12px',
  textAlign: 'center',
  stretch: 'horizontal'
});
c.legend.centerLabel.style().set(s.opacityWhiteNone);
c.legend.rightLabel.style().set({
  margin: '4px 8px',
  fontSize: '12px'
});
c.legend.rightLabel.style().set(s.opacityWhiteNone);
c.legend.panel.style().set({
  position: 'bottom-left',
  width: '210px',
  padding: '0px'});
c.legend.panel.style().set(s.opacityWhiteMed);
c.legend.labelPanel.style().set(s.opacityWhiteNone);


c.infoTable.style().set(s.opacityWhiteMed);

// Loop through setting divider style.
Object.keys(c.dividers).forEach(function(key) {
  c.dividers[key].style().set(s.divider);
});

/*******************************************************************************
 * Behaviors *
 * 
 * A section to define app behavior on UI activity.
 * 
 * Guidelines:
 * 1. At the top, define helper functions and functions that will be used as
 *    callbacks for multiple events.
 * 2. For single-use callbacks, define them just prior to assignment. If multiple
 *    callbacks are required for a widget, add them consecutively to maintain
 *    order; single-use followed by multi-use.
 * 3. As much as possible, include callbacks that update URL parameters.
 ******************************************************************************/

function getSelectedYear() {
  var agno_sel1 = c.selectYear.selector.getValue();
  var days_agno = Selectores.getDateList(agno_sel1);
  c.selectBand.selector.items().reset(days_agno)
  return days_agno;
}

c.selectYear.selector.onChange(getSelectedYear);


// Handles drawing the legend when band selector changes.
function updateLegend(minValue, maxValue) {
      var date = c.selectBand.selector.getValue();
      // Rev. disponibilidad de valores antes de usarlos
      if (minValue !== null && maxValue !== null) {
        // Redondear los valores a un decimal
        var minValueRounded = minValue.toFixed(1);
        var maxValueRounded = maxValue.toFixed(1);
        var centerValueRounded = ((parseFloat(minValue) + parseFloat(maxValue)) / 2).toFixed(1);
        print('Min Value:', minValueRounded);
        print('Max Value:', maxValueRounded);
        // Se utiliza la misma paleta para todas las capas renderizadas
        c.legend.title.setValue('Humedad de suelo ' + date + ' (%)');

        c.legend.colorbar.setParams({
          bbox: [0, 0, 1, 0.1],
          dimensions: '100x10',
          format: 'png',
          min:0,
          max:1,
          palette : ['ECF0FF', '8A4089', '00145D']
        });
        c.legend.leftLabel.setValue(minValueRounded);
        c.legend.centerLabel.setValue(centerValueRounded);
        c.legend.rightLabel.setValue(maxValueRounded);
      } else {
        print('Error: No se pudieron obtener los valores min y max.');
      }
    }

//crear fila para panel de informacion 
function createRow(label, value, bgColor) {
  return ui.Panel({
    widgets: [
      ui.Label(label, {padding: '1px', backgroundColor: bgColor || 'white'}),
      ui.Label(value, {padding: '1px', backgroundColor: bgColor || 'white'})
    ],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      backgroundColor: bgColor || 'white',
      border: '1px solid black',
      stretch: 'horizontal',
      fontSize: '4px',
      height: '35px'
    }
  });
}

function showHideChart() {
  var shown = true;
  var label = 'Ocultar gráfico';
  if (c.chart.shownButton.getLabel() == 'Ocultar gráfico') {
    shown = false;
    label = 'Mostrar gráfico';
  }
  c.chart.container.style().set({shown: shown});
  c.chart.shownButton.setLabel(label);
}

c.chart.shownButton.onClick(showHideChart);


function updateMinMax(layer, date) {
  var minMaxDict = ImgClass.MinMaxBand(layer, date);

  // Procesar el diccionario sincrónicamente para obtener los valores de min y max
  var result = minMaxDict.getInfo();
  if (result) {
    return result;
  } else {
    throw new Error('Error al obtener min y max');
  }
}


/*******************************************************************************
 * Initialize *
 * 
 * A section to initialize the app state on load.
 * 
 * Guidelines:
 * 1. At the top, define any helper functions.
 * 2. As much as possible, use URL params to initialize the state of the app.
 ******************************************************************************/

// Set model state based on URL parameters or default values.
c.map.setCenter({
  lon: ui.url.get('lon', -70.3),
  lat: ui.url.get('lat', -32.9),
  zoom: ui.url.get('zoom', 8)
});

c.map.onClick(function(coords) {
  
  
  //para agregar un punto donde clickeo el usuario
  var clickedPoint = ee.Geometry.Point(coords.lon, coords.lat);
  if (pointLayer) {
    c.map.layers().remove(pointLayer); // Remove the previous point layer
  }
  pointLayer = ui.Map.Layer(clickedPoint, {color: 'red'}, 'Punto seleccionado');
  
  
  // Aquí pasas el valor del selector y las coordenadas al método Click
  var valueDict = chartClass.Click(c.selectYear.selector.getValue(), coords, region);
  chartClass.createChartOUT(c,valueDict);
  //var valueTable = chartClass.tablaInfo(coords,c,region, valueDict,c.selectBand.selector.getValue());
  chartClass.tablaInfo(coords, {map: c.map}, region, valueDict, c.selectBand.selector.getValue(), function(values) {
    if (values) {
      // Actualizar las etiquetas con los valores retornados
      latRow.widgets().get(1).setValue(values.lat);
      lonRow.widgets().get(1).setValue(values.lon);
      humRow.widgets().get(1).setValue(values.hs);
      dateRow.widgets().get(1).setValue(values.newDate);
      
      // Mostrar el panel
      c.infoTable.style().set('shown', true);
      c.infoTable.style().set('position', 'bottom-left');
    } else {
      // Si no hay datos para las coordenadas clickeadas, esconder el panel
      c.infoTable.style().set('shown', false);
    }
  });
  if(valueDict){
    c.map.layers().add(pointLayer);
  }
});


print(c)

