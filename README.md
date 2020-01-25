# Leaflet.JISX0410Mesh
Add JIS X 0410 Mesh squares to your leaflet maps.

Usage
-----

```JavaScript

    var map = L.map('map',{
      center: [35.840, 137.593],
      zoom: 9,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var options = {      
    };

    L.jisx0410Mesh(options).addTo(map);

```

Options
-------
- redraw: Default = 'move'. Sets when the grid is redrawn.
- maxZoom: Default = 15. Limit the range that the grid is drawn.
- minZoom: Default = 6. Limit the range that the grid is drawn.
- gridLetterStyle: Default = 'color: #216fff; font-size:12px;'. A css string to style the labels.


Code inspiration from
* https://github.com/jonshutt/Leaflet.OS.Graticule
* https://github.com/MALORGIS/jisX0410
