(function () {
const MILLIS = 3600000;
const MESHWIDTH = [];
MESHWIDTH[1] = MILLIS;
MESHWIDTH[2] = MESHWIDTH[1] / 8;
MESHWIDTH[3] = MESHWIDTH[2] / 10;
const MESHHEIGHT= [];
MESHHEIGHT[1] = MILLIS * (40 / 60);
MESHHEIGHT[2] = MESHHEIGHT[1] / 8;
MESHHEIGHT[3] = MESHHEIGHT[2] / 10;

// JISX0410 domain of definition
BOUNDS = L.latLngBounds([0, 100], [66.66, 180]);

L.JISX0410Mesh = L.LayerGroup.extend({
    options: {
        redraw: 'move',
        maxZoom: 18,
        minZoom: 6,
        minZoom2: 10, // minZoom for mesh2
        minZoom3: 14,
        gridLetterStyle: "color: #216fff; font-size:12px;",
    },

    lineStyle: {
        stroke: true,
        color: '#216fff',
        opacity: 0.6,
        weight: 1,
        interactive: false,
        clickable: false //legacy support
    },


    initialize: function(options) {
        L.LayerGroup.prototype.initialize.call(this);
        L.Util.setOptions(this, options);
    },

    onAdd: function(map) {
        this._map = map;
        var graticule = this.redraw();
        this._map.on('viewreset ' + this.options.redraw, graticule.redraw, graticule);
        this.eachLayer(map.addLayer, map);
    },

    onRemove: function(map) {
        map.off('viewreset '+ this.options.redraw, this.map);
        this.eachLayer(this.removeLayer, this);
    },

    hide: function() {
        this.options.hidden = true;
        this.redraw();
    },

    show: function() {
        this.options.hidden = false;
        this.redraw();
    },

    redraw: function() {
        this._bounds = this._map.getBounds();
        this.clearLayers();
        var zoom = this._map.getZoom();
        if (zoom < this.options.minZoom || zoom > this.options.maxZoom) {
            return this;
        }
        if (!BOUNDS.contains(this._bounds)) {
          return this;
        }
        // 1次メッシュ
        if (zoom < this.options.minZoom2) {
            this._meshLevel = 1;
        } else if (zoom < this.options.minZoom3) {
            // 2次メッシュ
            this._meshLevel = 2;
        } else {
            // 3次メッシュ
            this._meshLevel = 3;
        }
        this.constructLines(this._bounds);
        return this;
    },

    getMins: function() {
        // rounds up to nearest multiple of x
        var sw = this._bounds.getSouthWest();
        var w = MESHWIDTH[this._meshLevel];
        var h = MESHHEIGHT[this._meshLevel];
        return {
            x: Math.floor(sw.lng * MILLIS / w) * w,
            y: Math.floor(sw.lat * MILLIS / h) * h
        };
    },

    constructLines: function(bounds) {
      var mins = this.getMins();
      var ne = this._bounds.getNorthEast();

      var lines = new Array();

      // for vertical lines
      var bottom = this._bounds.getSouth();
      var top = this._bounds.getNorth();
      var x = mins.x;
      do {
        var lng = x / MILLIS;
        var line = L.polyline([[bottom, lng], [top, lng]], this.lineStyle);
        lines.push(line);
        x += MESHWIDTH[this._meshLevel];
      } while (x < ne.lng * MILLIS);

      // for horizontal lines
      var left = this._bounds.getWest();
      var right = this._bounds.getEast();
      var y = mins.y;
      do {
        var lat = y / MILLIS;
        var line = L.polyline([[lat, left], [lat, right]], this.lineStyle);
        lines.push(line);
        y += MESHHEIGHT[this._meshLevel];
      } while (y < ne.lat * MILLIS);

      var labels = this.buildMeshLabels(mins);

      lines.forEach(this.addLayer, this);
      labels.forEach(this.addLayer, this);
    },

    buildMeshLabels: function(mins) {
      var labels = [];
      var ne = this._bounds.getNorthEast();
      var x = mins.x;
      do {
        var lng = (x + 1) / MILLIS;
        var y = mins.y;
        do {
          var lat = (y + 1) / MILLIS;
          var mesh = this.meshcode1(lat, lng);
          if (this._meshLevel >= 2) {
            mesh = this.meshcode2(lat, lng, mesh);
          }
          if (this._meshLevel == 3) {
            mesh = this.meshcode3(lat, lng, mesh);
          }
          var label = this.buildMeshLabel([lat, lng], mesh.code);
          labels.push(label)
          y += MESHHEIGHT[this._meshLevel];
        } while (y < ne.lat * MILLIS);
        x += MESHWIDTH[this._meshLevel];
      } while (x < ne.lng * MILLIS);
      return labels;
    }, 

    meshcode1: function (lat, lng) {
      let r = Math.round(Math.floor(lat * 1.5));
      let c = Math.round(Math.floor(lng - 100.0));
      let code = String(r) + String(c);
      let latms = (r * MILLIS) / 1.5;
      let lngms = (c + 100.0) * MILLIS;
      return {code: code, latms: latms, lngms: lngms};
    },

    meshcode2: function (lat, lng, mesh1) {
      let r = Math.floor((lat * MILLIS - mesh1.latms) / MESHHEIGHT[2]);
      let c = Math.floor((lng * MILLIS - mesh1.lngms) / MESHWIDTH[2]);
      let code = mesh1.code + String(r) + String(c);
      let latms = mesh1.latms + (r * MESHHEIGHT[2]);
      let lngms = mesh1.lngms + (c * MESHWIDTH[2]);
      return {code: code, latms: latms, lngms: lngms};
    },

    meshcode3: function (lat, lng, mesh2) {
      let r = Math.floor((lat * MILLIS - mesh2.latms) / MESHHEIGHT[3]);
      let c = Math.floor((lng * MILLIS - mesh2.lngms) / MESHWIDTH[3]);
      let code = mesh2.code + String(r) + String(c);
      //let latms = mesh2.latms + (r * MESHHEIGHT[3]);
      //let lngms = mesh2.lngms + (c * MESHWIDTH[3]);
      return {code: code} //, latms: latms, lngms: lngms};
    },

    buildMeshLabel: function(pos, label) {
      return L.marker(pos, {
        interactive: false,
        clickable: false, //legacy support
        icon: L.divIcon({
          iconSize: [0, 0],
          iconAnchor: [-10, 20],
          className: 'leaflet-grid-label',
          html: '<div style="'+ this.options.gridLetterStyle + '">' + label + '</div>'
        })
      });
    }
});

L.jisx0410Mesh = function(options) {
    return new L.JISX0410Mesh(options);
};
})();
