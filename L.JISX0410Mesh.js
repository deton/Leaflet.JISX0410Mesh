(function () {
const MILLIS = 3600000;
const MESHWIDTH = [];
MESHWIDTH[1] = MILLIS;
MESHWIDTH[2] = MESHWIDTH[1] / 8;
MESHWIDTH[3] = MESHWIDTH[2] / 10;
MESHWIDTH[4] = MESHWIDTH[3] / 2;
MESHWIDTH[5] = MESHWIDTH[4] / 2;
MESHWIDTH[6] = MESHWIDTH[5] / 2;
const MESHHEIGHT= [];
MESHHEIGHT[1] = MILLIS * (40 / 60);
MESHHEIGHT[2] = MESHHEIGHT[1] / 8;
MESHHEIGHT[3] = MESHHEIGHT[2] / 10;
MESHHEIGHT[4] = MESHHEIGHT[3] / 2;
MESHHEIGHT[5] = MESHHEIGHT[4] / 2;
MESHHEIGHT[6] = MESHHEIGHT[5] / 2;

// JISX0410 domain of definition
const BOUNDS = L.latLngBounds([0, 100], [66.66, 180]);

L.JISX0410Mesh = L.LayerGroup.extend({
    options: {
        redraw: 'move',
        maxZoom: 18,
        minZoom: 6,
        minZoom2: 10, // minZoom for mesh2
        minZoom3: 14,
        minZoom4: 16,
        minZoom5: 17,
        minZoom6: 18,
        labelFormat: 0, // 0: '53393690', 1: '5339-3690', 2: '5339-36-90'
        labelStyle: "color: #216fff; font-size: 12px; white-space: nowrap;",
        labelAnchor: [-2, 16]
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
        this.redraw();
        map.on('viewreset ' + this.options.redraw, this.redraw, this);
        this.eachLayer(map.addLayer, map);
        return this;
    },

    onRemove: function(map) {
        map.off('viewreset '+ this.options.redraw, this.redraw, this);
        this.eachLayer(map.removeLayer, map);
        return this;
    },

    redraw: function() {
        //console.time('jisx0410mesh');
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
        } else if (zoom < this.options.minZoom4) {
            // 3次メッシュ
            this._meshLevel = 3;
        } else if (zoom < this.options.minZoom5) {
            this._meshLevel = 4;
        } else if (zoom < this.options.minZoom6) {
            this._meshLevel = 5;
        } else {
            this._meshLevel = 6;
        }
        this.constructLines(this._bounds);
        //console.timeEnd('jisx0410mesh');
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
          var meshcode = this.meshcode(lat, lng, this._meshLevel);
          var label = this.buildMeshLabel([lat, lng], meshcode);
          labels.push(label);
          y += MESHHEIGHT[this._meshLevel];
        } while (y < ne.lat * MILLIS);
        x += MESHWIDTH[this._meshLevel];
      } while (x < ne.lng * MILLIS);
      return labels;
    },

    meshcode: function (lat, lng, meshLevel) {
      // 1次メッシュコード
      var r1 = Math.round(Math.floor(lat * 1.5));
      var c1 = Math.round(Math.floor(lng - 100.0));
      var code1 = String(r1) + String(c1);
      if (meshLevel <= 1) {
        return code1;
      }
      var mesh1latms = (r1 * MILLIS) / 1.5;
      var mesh1lngms = (c1 + 100.0) * MILLIS;

      // 2次メッシュコード
      var latms = lat * MILLIS;
      var lngms = lng * MILLIS;
      var r2 = Math.floor((latms - mesh1latms) / MESHHEIGHT[2]);
      var c2 = Math.floor((lngms - mesh1lngms) / MESHWIDTH[2]);
      var code2 = code1 + (this.options.labelFormat >= 1 ? '-' : '') + String(r2) + String(c2);
      if (meshLevel == 2) {
        return code2;
      }
      var mesh2latms = mesh1latms + (r2 * MESHHEIGHT[2]);
      var mesh2lngms = mesh1lngms + (c2 * MESHWIDTH[2]);

      // 3次メッシュコード 1km
      var r3 = Math.floor((latms - mesh2latms) / MESHHEIGHT[3]);
      var c3 = Math.floor((lngms - mesh2lngms) / MESHWIDTH[3]);
      var code3 = code2 + (this.options.labelFormat >= 2 ? '-' : '') + String(r3) + String(c3);
      if (meshLevel == 3) {
        return code3;
      }
      var mesh3latms = mesh2latms + (r3 * MESHHEIGHT[3]);
      var mesh3lngms = mesh2lngms + (c3 * MESHWIDTH[3]);

      // 4次メッシュコード 500m
      var r4 = Math.floor((latms - mesh3latms) / MESHHEIGHT[4]);
      var c4 = Math.floor((lngms - mesh3lngms) / MESHWIDTH[4]);
      var code4 = r4 < 1 ? String(c4 + 1) : String(c4 + 1 + 2);
      code4 = code3 + (this.options.labelFormat >= 1 ? '-' : '') + code4;
      if (meshLevel == 4) {
        return code4;
      }
      var mesh4latms = mesh3latms + (r4 * MESHHEIGHT[4]);
      var mesh4lngms = mesh3lngms + (c4 * MESHWIDTH[4]);

      // 5次メッシュコード 250m
      var r5 = Math.floor((latms - mesh4latms) / MESHHEIGHT[5]);
      var c5 = Math.floor((lngms - mesh4lngms) / MESHWIDTH[5]);
      var code5 = r5 < 1 ? String(c5 + 1) : String(c5 + 1 + 2);
      code5 = code4 + (this.options.labelFormat >= 2 ? '-' : '') + code5;
      if (meshLevel == 5) {
        return code5;
      }
      var mesh5latms = mesh4latms + (r5 * MESHHEIGHT[5]);
      var mesh5lngms = mesh4lngms + (c5 * MESHWIDTH[5]);

      // 6次メッシュコード 125m
      var r6 = Math.floor((latms - mesh5latms) / MESHHEIGHT[6]);
      var c6 = Math.floor((lngms - mesh5lngms) / MESHWIDTH[6]);
      var code6 = r6 < 1 ? String(c6 + 1) : String(c6 + 1 + 2);
      code6 = code5 + (this.options.labelFormat >= 2 ? '-' : '') + code6;
      return code6;
    },

    buildMeshLabel: function(pos, label) {
      return L.marker(pos, {
        interactive: false,
        clickable: false, //legacy support
        icon: L.divIcon({
          iconSize: [0, 0],
          iconAnchor: this.options.labelAnchor,
          className: 'leaflet-grid-label',
          html: '<div style="'+ this.options.labelStyle + '">' + label + '</div>'
        })
      });
    },

    meshcode2latlng: function (meshcode) {
      meshcode = String(meshcode).replace(/-/g, '');
      var r = parseInt(meshcode.substring(0, 2), 10);
      var c = parseInt(meshcode.substring(2, 4), 10);
      var lat1 = r / 1.5;
      var lng1 = c + 100;
      if (meshcode.length == 4) { // 1次メッシュ
        return L.latLng(lat1, lng1);
      }

      r = parseInt(meshcode.substring(4, 5), 10);
      c = parseInt(meshcode.substring(5, 6), 10);
      var lat2 = lat1 + MESHHEIGHT[2] * r / MILLIS;
      var lng2 = lng1 + MESHWIDTH[2] * c / MILLIS;
      if (meshcode.length == 6) { // 2次メッシュ
        return L.latLng(lat2, lng2);
      }

      r = parseInt(meshcode.substring(6, 7), 10);
      c = parseInt(meshcode.substring(7, 8), 10);
      var lat3 = lat2 + MESHHEIGHT[3] * r / MILLIS;
      var lng3 = lng2 + MESHWIDTH[3] * c / MILLIS;
      if (meshcode.length == 8) { // 3次メッシュ 1km
        return L.latLng(lat3, lng3);
      }

      var n = parseInt(meshcode.substring(8, 9), 10);
      var rc = div4code_to_rowcol(n);
      var lat4 = lat3 + MESHHEIGHT[4] * rc[0] / MILLIS;
      var lng4 = lng3 + MESHWIDTH[4] * rc[1] / MILLIS;
      if (meshcode.length == 9) { // 4次メッシュ 500m
        return L.latLng(lat4, lng4);
      }

      n = parseInt(meshcode.substring(9, 10), 10);
      rc = div4code_to_rowcol(n);
      var lat5 = lat4 + MESHHEIGHT[5] * rc[0] / MILLIS;
      var lng5 = lng4 + MESHWIDTH[5] * rc[1] / MILLIS;
      if (meshcode.length == 10) { // 5次メッシュ 250m
        return L.latLng(lat5, lng5);
      }

      n = parseInt(meshcode.substring(10, 11), 10);
      rc = div4code_to_rowcol(n);
      var lat6 = lat5 + MESHHEIGHT[6] * rc[0] / MILLIS;
      var lng6 = lng5 + MESHWIDTH[6] * rc[1] / MILLIS;
      if (meshcode.length == 11) { // 6次メッシュ 125m
        return L.latLng(lat6, lng6);
      }

      function div4code_to_rowcol(div4code) {
        var r, c;
        switch (div4code) {
          case 1: r = 0; c = 0; break;
          case 2: r = 0; c = 1; break;
          case 3: r = 1; c = 0; break;
          case 4: r = 1; c = 1; break;
        }
        return [r, c];
      }
    }
});

L.jisx0410Mesh = function(options) {
    return new L.JISX0410Mesh(options);
};
})();
