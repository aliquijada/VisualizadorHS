/**
 * Example: Earth Engine App for a Published Research Paper
 *  
 * This script demonstrates how to make a basic Earth Engine App that could
 * accompany a published research paper.
 * 
 * @author Tyler Erickson (tylere@google.com)
 * @author Justin Braaten (braaten@google.com)
 */


/*******************************************************************************
 * Model *
 * 
 * A section to define information about the data being presented in your
 * app.
 * 
 * Guidelines: Use this section to import assets and define information that
 * are used to parameterize data-dependant widgets and control style and
 * behavior on UI interactions.
 ******************************************************************************/
var Selectores = require('users/corfobbppciren2023/App_HS_User:Selectores.js'); 

// Define a JSON object for storing model info (app data).
var m = {};

var region = ee.FeatureCollection('users/corfobbppciren2023/assets/Geometrias/Region_de_Valparaiso_4326_corregido')

// Define the image collection.
m.col = ee.ImageCollection.fromImages([
  ee.Image('users/corfobbppciren2023/SM2019Valparaiso_2')
  .set('system:index','2019')
  .set('system:time_start','2019')
  .set('year','2019'),
//  ee.Image('users/corfobbppciren2023/SM2020Valparaiso')
//  .set('system:index','2020')
//  .set('system:time_start','1577836800000')
//  .set('year','2020')
  ]);


//Map.addLayer(m.col)
//print('m.col',m.col)  

// Define info about the bands in this collection that the app will present.
m.imgInfo = {
  bands: {
    'Humedad 01-05-2019': {
      bname: 'band_2019-05-01_classification',
      color: '445DB8',
      vis: {
        min: 10,
        max: 25,
        palette: ['ECF0FF', '8A4089', '00145D']
      }
    },
  },
  startYear: 2015,
  endYear: 2023,
};

// Define information for example locations.
m.exLocInfo = {
    'Catemu': {
    urlSlug: 'ex1',
    lon: -70.961529, lat: -32790570, zoom: 13,
    desc: 'Sensor Catemu.'
  },
  'Cerrillos de Catemu': {
    urlSlug: 'ex2',
    lon: -70.935843, lat: -32.69204, zoom: 13,
    desc: 'Sensor Cerrillos de Catemu.'
  },
    'Chincolco 1': {
    urlSlug: 'ex3',
    lon: -70.857704, lat: -32.21951, zoom: 13,
    desc: 'Sensor Chincolco 1.'
  },
    'Chincolco 2': {
    urlSlug: 'ex4',
    lon: -70.858225, lat: -32.220457, zoom: 13,
    desc: 'Sensor Chincolco 2.'
  },
    'Cuncumén': {
    urlSlug: 'ex5',
    lon: -71.426146, lat: -33.735716, zoom: 13,
    desc: 'Sensor Cuencumén.'
  },
    'Paihuen 1': {
    urlSlug: 'ex6',
    lon: -70.846916, lat: -32.370352, zoom: 13,
    desc: 'Sensor Paihuen 1.'
  },
    'Paihuen 2': {
    urlSlug: 'ex7',
    lon: -70.846936, lat: -32.370337, zoom: 13,
    desc: 'Sensor Paihuen 2.'
  },
    'Putaendo 1': {
    urlSlug: 'ex8',
    lon: -70.7017064, lat: -32.62731, zoom: 13,
    desc: 'Sensor Putaendo 1.'
  },
    'Putaendo 2': {
    urlSlug: 'ex9',
    lon: -70.7019918, lat: -32.627551, zoom: 13,
    desc: 'Sensor Putaendo 2.'
  },
    'San Esteban': {
    urlSlug: 'ex10',
    lon: -70.558912, lat: -32.804610, zoom: 13,
    desc: 'Sensor San Esteban.'
  }
};


//print('m.imgInfo',m.imgInfo)
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

// Define a JSON object for storing UI components.
var c = {};

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

//-----------------PANEL SELECTORES-------------------------//


// Define a data year selector widget group.
c.selectYear = {};
c.selectYear.label = ui.Label('Seleccione un año para mostrar');
c.selectYear.slider = ui.Slider({
  min: m.imgInfo.startYear,
  max: m.imgInfo.endYear,
  step: 1
});


c.selectYear.slider.onChange(getSelectedYear);

function getSelectedYear() {
  var agno_sel1 = c.selectYear.slider.getValue();
  var days_agno = Selectores.getDateList(agno_sel1);
  return days_agno
  
}


c.selectYear.panel = ui.Panel([c.selectYear.label, c.selectYear.slider]);

// Define a data band selector widget group.
c.selectBand = {};
c.selectBand.label = ui.Label('Seleccione el día a visualizar');
//c.selectBand.selector = ui.Select(Object.keys(getSelectedYear(c.selectYear.slider.getValue())));
c.selectBand.selector = ui.Select(Object.keys(m.imgInfo.bands));
c.selectBand.panel = ui.Panel([c.selectBand.label, c.selectBand.selector]);

// Define a reduction region radius selector widget group (for charting).
c.selectRadius = {};
c.selectRadius.label = ui.Label('Seleccione un punto');
c.selectRadius.slider = ui.Slider({
  min: 30,
  max: 60,
  step: 30
});
c.selectRadius.panel = ui.Panel([c.selectRadius.label, c.selectRadius.slider]);

// Define an example location selector widget group.
c.selectExample = {};
c.selectExample.label = ui.Label('Localidades');
c.selectExample.selector = ui.Select({
  items: Object.keys(m.exLocInfo),
  placeholder: 'Seleccione una localidad...',
});
c.selectExample.descLabel = ui.Label();
c.selectExample.panel = ui.Panel([
  c.selectExample.label,
  c.selectExample.selector,
  c.selectExample.descLabel
]);

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

// Define a panel for displaying a chart.
c.chart = {};
c.chart.shownButton = ui.Button('Ocultar gráfico');
c.chart.container = ui.Panel();  // will hold the dynamically generated chart. 
c.chart.chartPanel = ui.Panel([c.chart.shownButton, c.chart.container]);


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
//c.controlPanel.add(c.dividers.divider2);
//c.controlPanel.add(c.selectRadius.panel);
//c.controlPanel.add(c.dividers.divider3);
c.controlPanel.add(c.selectExample.panel);
c.controlPanel.add(c.dividers.divider4);
c.map.add(c.legend.panel);
c.map.add(c.chart.chartPanel);

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

c.selectYear.slider.style().set(s.stretchHorizontal);
c.selectYear.label.style().set(s.widgetTitle);

c.selectBand.selector.style().set(s.stretchHorizontal);
c.selectBand.label.style().set(s.widgetTitle);

c.selectRadius.slider.style().set(s.stretchHorizontal);
c.selectRadius.label.style().set(s.widgetTitle);

c.selectExample.selector.style().set(s.stretchHorizontal);
c.selectExample.label.style().set(s.widgetTitle);
c.selectExample.descLabel.style().set(s.aboutText);
c.selectExample.descLabel.style().set(s.noTopMargin);

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
  width: '200px',
  padding: '0px'});
c.legend.panel.style().set(s.opacityWhiteMed);
c.legend.labelPanel.style().set(s.opacityWhiteNone);

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

function getPropertyValueList(dataModelDict, propertyName){
  // Get a list of values for a specified property name.
  var result = [];
  for (var key in dataModelDict) {
    result.push(dataModelDict[key][propertyName]);
  }
  return result;
}

// Handles drawing the legend when band selector changes.
function updateLegend() {
  c.legend.title.setValue(c.selectBand.selector.getValue() + ' (%)');
  c.legend.colorbar.setParams({
    bbox: [0, 0, 1, 0.1],
    dimensions: '100x10',
    format: 'png',
    min: 0,
    max: 1,
    palette: m.imgInfo.bands[c.selectBand.selector.getValue()].vis.palette
  });
  c.legend.leftLabel.setValue(
    m.imgInfo.bands[c.selectBand.selector.getValue()].vis.min);
  c.legend.centerLabel.setValue(
    m.imgInfo.bands[c.selectBand.selector.getValue()].vis.max / 2);
  c.legend.rightLabel.setValue(
    m.imgInfo.bands[c.selectBand.selector.getValue()].vis.max);
}

//  var region_0 = ee.FeatureCollection('projects/ee-corfobbppciren2023/assets/Geometrias/Region_de_Valparaiso_4326_corregido');
//  var visParams_region = {
//    color: 'black',          // Color del contorno
//    fillColor: 'FF000000',
//    width: 3               // Ancho del contorno
// }
//  var styled_region = region_0.style(visParams_region);
//  var layer_0 = ui.Map.Layer(styled_region, {}, 'Valparaíso');


// Handles year and band selection for new map layer display.
function updateMap() {
  var year = c.selectYear.slider.getValue();
  var band = c.selectBand.selector.getValue();
//var img = m.col.filter(ee.Filter.eq('year', parseInt(year, 10)))
  var img = m.col.select(m.imgInfo.bands[band].bname);

  var layer = ui.Map.Layer(
    img, m.imgInfo.bands[band].vis, band + ', ' + year)
  c.map.layers().set(0, layer);
//  c.map.layers().set(1, layer_0);
}

// Handles map clicks for charting.
function drawChart(coords) {
  // Get out if call to drawChart did not come from map click and the chart
  // has not been drawn previously.
  if (!coords.lon) {
    return null;
  }
  
  // Get out if the clicked point intersects invalid data.
  var point = ee.Geometry.Point([coords.lon, coords.lat]);
  var validDataTest = m.col.first().select(0).reduceRegion({
    reducer: ee.Reducer.first(),
    geometry: point,
    scale: m.col.first().projection().nominalScale()
  });
  if (!validDataTest.get(validDataTest.keys().get(0)).getInfo()) {
    return null;
  }
  
  // Show the chart panel if this is the first time a point is clicked.
  if (!c.chart.chartPanel.style().get('shown')) {
    c.chart.chartPanel.style().set('shown', true);
  }
  
  // Show chart if hidden; assuming user wants to see updates to chart.
  if (c.chart.shownButton.getLabel() == 'Show chart') {
    c.chart.container.style().set({shown: true});
    c.chart.shownButton.setLabel('Hide chart');
  }

  var radius = c.selectRadius.slider.getValue();
  var layer = ui.Map.Layer(
    point.buffer(radius), null, 'Chart region');
  c.map.layers().set(1, layer);

  var styleChartAxis = {
    italic: false,
    bold: true
  };
  var styleChartArea = {
    width: '600px',
    height: '255px',
    margin: '0px',
    padding: '0px'
  }; 
  
  var chart = ui.Chart.image.series({
    imageCollection: m.col.select(
      getPropertyValueList(m.imgInfo.bands, 'bname')),
    region: point.buffer(radius),
    reducer: ee.Reducer.mean(),
    scale: m.col.first().projection().nominalScale()
  })
  .setSeriesNames(Object.keys(m.imgInfo.bands))
  .setChartType('ColumnChart')
  .setOptions({
    titlePosition: 'none',
    colors: getPropertyValueList(m.imgInfo.bands, 'color'),
    hAxis: {
      title: 'Fecha',
      titleTextStyle: styleChartAxis
    },
    vAxis: {
      title: 'Humedad de Suelo [%]',
      titleTextStyle: styleChartAxis,
    },
    legend: { position: "none" },
    isStacked: 'false'
  });
  chart.style().set(styleChartArea);
  
  c.chart.container.widgets().reset([chart]);
}

// Handles example location selection.
function zoomToLoc(loc) {
  c.selectExample.descLabel.setValue(m.exLocInfo[loc].desc);
  c.map.setCenter(
    m.exLocInfo[loc].lon + 0.05,  // shift map left to avoid chart.
    m.exLocInfo[loc].lat,
    m.exLocInfo[loc].zoom);
  c.selectRadius.slider.setValue(60);
  var coords = {lon: m.exLocInfo[loc].lon, lat: m.exLocInfo[loc].lat};
  drawChart(coords);
  updateUrlParamChart(coords);
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

function updateUrlParamYear(newValue) {
  ui.url.set('year', newValue);
}
c.selectYear.slider.onChange(updateUrlParamYear);
c.selectYear.slider.onChange(updateMap);

function updateUrlParamBand(newValue) {
  var bands = getPropertyValueList(m.imgInfo.bands, 'bname');
  ui.url.set('band', m.imgInfo.bands[newValue].bname);
}
c.selectBand.selector.onChange(updateUrlParamBand);
c.selectBand.selector.onChange(updateMap);
c.selectBand.selector.onChange(updateLegend);

function updateUrlParamRadius(newValue) {
  ui.url.set('radius', newValue);
}
c.selectRadius.slider.onChange(updateUrlParamRadius);
c.selectRadius.slider.onChange(function(value) {
  drawChart({lon: ui.url.get('chart_lon'), lat: ui.url.get('chart_lat')})});

function updateUrlParamExample(newValue) {
  ui.url.set('example', m.exLocInfo[newValue].urlSlug);
}
c.selectExample.selector.onChange(updateUrlParamExample);
c.selectExample.selector.onChange(zoomToLoc);

function updateUrlParamMap(newMapParams) {
  ui.url.set('lat', newMapParams.lat);
  ui.url.set('lon', newMapParams.lon);
  ui.url.set('zoom', newMapParams.zoom);
}
c.map.onChangeBounds(ui.util.debounce(updateUrlParamMap, 100));

function updateUrlParamChart(newChartParams) {
  ui.url.set('chart_lat', newChartParams.lat);
  ui.url.set('chart_lon', newChartParams.lon);
}
c.map.onClick(drawChart);
c.map.onClick(updateUrlParamChart);


/*******************************************************************************
 * Initialize *
 * 
 * A section to initialize the app state on load.
 * 
 * Guidelines:
 * 1. At the top, define any helper functions.
 * 2. As much as possible, use URL params to initialize the state of the app.
 ******************************************************************************/

function findKey(dataModelDict, propertyName, propertyValue){
  // Find the first dictionary key for a specified property value.
  for (var key in dataModelDict) {
    if (dataModelDict[key][propertyName] == propertyValue) {
      return key;
    }
  }
  return null;
}

// Set model state based on URL parameters or default values.
c.map.setCenter({
  lon: ui.url.get('lon', -70.3),
  lat: ui.url.get('lat', -32.9),
  zoom: ui.url.get('zoom', 8)
});

c.selectYear.slider.setValue(ui.url.get('year', 2019), false);

c.selectBand.selector.setValue(
  findKey(m.imgInfo.bands, 'bname', ui.url.get('band', 'band_2019-05-01_classification')), 
  false);

c.selectRadius.slider.setValue(ui.url.get('radius', 30), false);

c.selectExample.selector.setValue(
  findKey(m.exLocInfo, 'urlSlug', ui.url.get('example')),
  false);
if (ui.url.get('example')) {
  c.selectExample.descLabel.setValue(
    m.exLocInfo[c.selectExample.selector.getValue()].desc);
}

// Render the map and legend.
updateMap();
updateLegend();

// Render the chart if applicable (chart_lon exists as URL param).
drawChart({lon: ui.url.get('chart_lon'), lat: ui.url.get('chart_lat')});


