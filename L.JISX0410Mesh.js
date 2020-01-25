const MILLIS = 3600000;

L.JISX0410Mesh = L.LayerGroup.extend({
    options: {
        showLabels: true,
        redraw: 'move',
        maxZoom: 15,
        minZoom: 6,
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
        this._bounds = this._map.getBounds().pad(0.5);
        this.clearLayers();
        var zoom = this._map.getZoom();
        if (zoom < this.options.minZoom || zoom > this.options.maxZoom) {
            return this;
        }
        var zoom = this._map.getZoom();
        // 1次メッシュ
        this._meshWidthMs = MILLIS;
        this._meshHeightMs = MILLIS * (40 / 60);
        if (zoom < 10) {
        } else if (zoom < 14) {
            // 2次メッシュ
            this._meshWidthMs = this._meshWidthMs / 8;
            this._meshHeightMs = this._meshHeightMs / 8;
        } else {
            // 3次メッシュ
            this._meshWidthMs = this._meshWidthMs / 8 / 10;
            this._meshHeightMs = this._meshHeightMs / 8 / 10;
        }
        this.constructLines(this._bounds);
        return this;
    },

    getMins: function() {
        // rounds up to nearest multiple of x
        var sw = this._bounds.getSouthWest();
        var w = this._meshWidthMs;
        var h = this._meshHeightMs;
        return {
            x: Math.floor(sw.lng * MILLIS / w) * w,
            y: Math.floor(sw.lat * MILLIS / h) * h
        };
    },

    getLineCounts: function() {
        var ne = this._bounds.getNorthEast();
        var sw = this._bounds.getSouthWest();
        var widthMs = Math.sqrt(Math.pow(ne.lng - sw.lng, 2)) * MILLIS;
        var heightMs = Math.sqrt(Math.pow(ne.lat - sw.lat, 2)) * MILLIS;
        return {
            x: Math.ceil(widthMs / this._meshWidthMs),
            y: Math.ceil(heightMs / this._meshHeightMs)
        };
    },

    constructLines: function(bounds) {
      var width = this._meshWidthMs;
      var height = this._meshHeightMs;

      var mins = this.getMins();
      var ne = this._bounds.getNorthEast();

      var latlngs = [];
      var lines = new Array();
      var labels = new Array();

      // for vertical lines
      var bottom = this._bounds.getSouth();
      var top = this._bounds.getNorth();
      var x = mins.x;
      do {
        var lng = x / MILLIS;
        //latlngs.push([[bottom, lng], [top, lng]]);
        var line = L.polyline([[bottom, lng], [top, lng]], this.lineStyle);
        lines.push(line);
        x += this._meshWidthMs;
      } while (x < ne.lng * MILLIS);

      // for horizontal lines
      var left = this._bounds.getWest();
      var right = this._bounds.getEast();
      var y = mins.y;
      do {
        var lat = y / MILLIS;
        latlngs.push([[lat, left], [lat, right]]);
        var line = L.polyline([[lat, left], [lat, right]], this.lineStyle);
        lines.push(line);

        y += this._meshHeightMs;
      } while (y < ne.lat * MILLIS);

      //L.polyline(latlngs, this.lineStyle).addTo(this._map);
      lines.forEach(this.addLayer, this);
    }
});

L.jisx0410Mesh = function(options) {
    return new L.JISX0410Mesh(options);
};
