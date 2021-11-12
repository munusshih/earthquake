var southWest = L.latLng(-180, -360),
  northEast = L.latLng(180, 90),
  bounds = L.latLngBounds(southWest, northEast);


(async () => {
  const map = L.map('map', {
    preferCanvas: true,
    maxZoom: 13,
    minZoom: 2,
    maxBounds: bounds
  }).setView([20, -170], 3)

  // fetch data sources
  const eqCSV = await d3.csv('./all_month.csv')
  var currentEQ = eqCSV.filter(function (data) {
    return data.Time === '11/11';
  });

  var group1 = L.featureGroup();

  L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      attribution: '',
      noWrap: false,
      ext: 'png'
    }
  ).addTo(map)

  // scale radius
  var extent = d3.extent(eqCSV, function (d) {
    return parseFloat(d.mag);
  });
  let rScale = d3.scalePow()
    .exponent(9)
    .domain(extent)
    .range([10000, 5000000]);

  var extent = d3.extent(eqCSV, function (d) {
    return parseFloat(d.depth);
  });
  let cScale = d3.scaleSequentialPow()
    .exponent(0.5)
    .domain([extent[1], extent[0]])
    .interpolator(d3.interpolateInferno);


  getDataAddMarkers = function ({
    label
  }) {
    currentEQ = eqCSV.filter(function (data) {
      return data.Time === label;
    });

    group1.clearLayers();

    currentEQ.sort(function (x, y) {
      return d3.descending(parseFloat(x.mag), parseFloat(y.mag));
    })

    let color_scale = []
    for (var i = 0; i < currentEQ.length; i++) {
      color_scale.push(cScale(currentEQ[i].depth))
    }

    for (var i = 0; i < currentEQ.length; i++) {
      let longituder = (currentEQ[i].longitude < 0) ? (currentEQ[i].longitude) : (currentEQ[i].longitude - 360);

      let circle = new L.circle([currentEQ[i].latitude, longituder], {
        color: color_scale[i],
        fillOpacity: 0.5,
        weight: 1,
        radius: rScale(currentEQ[i].mag)
      }).bindTooltip(
        currentEQ[i].place.replace('of', 'of<br>'), {
          sticky: true, // If true, the tooltip will follow the mouse instead of being fixed at the feature center.
          opacity: 1,
          className: 'ToolTipProvince'
        }).bindPopup("latitude: " + currentEQ[i].latitude + "<br>" +
        "longitude: " + currentEQ[i].longitude + "<br>" +
        "depth: " + currentEQ[i].depth + "<br>" +
        "magnitude: " + currentEQ[i].mag + " " + currentEQ[i].magType, {

        }).addTo(group1);
    }

    map.addLayer(group1);

    document.getElementById("currentDate").innerHTML = "Visualizations 2021/" + label;
  };


  L.control.timelineSlider({
      timelineItems: ["11/11", "11/10", "11/9", "11/8", "11/7", "11/6", "11/5", "11/4", "11/3", "11/2", "11/1", "10/31", "10/30", "10/29", "10/28", "10/27", "10/26", "10/25", "10/24", "10/23", "10/22", "10/21", "10/20", "10/19", "10/18", "10/17", "10/16", "10/15", "10/14", "10/13", "10/12"],
      changeMap: getDataAddMarkers,
      labelWidth: '27px',
      thumbHeight: '5px',
      backgroundOpacity: '1',
      backgroundColor: '#000',
      bottomBgPadding: '20px',
      topBgPadding: '30px',
      activeColor: '#ffba42',
      labelFontSize: '1px'
    })
    .addTo(map);


  var legend = L.control({
    position: 'bottomright'
  });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 100, 200, 300, 400, 500, 600],
      labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + cScale(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map);

})()