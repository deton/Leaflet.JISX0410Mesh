# Leaflet.JISX0410Mesh

JIS X 0410 地域メッシュを表示する、Leaflet plugin。
第1次メッシュから、第3次メッシュまで対応(分割地域メッシュは未対応)。

Demo
----
https://deton.github.io/Leaflet.JISX0410Mesh/demo.html

Usage
-----

```JavaScript

    var map = L.map('map',{
      center: [35.66566, 139.7509],
      zoom: 9,
    });

    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
    }).addTo(map);

    var options = {
    };

    L.jisx0410Mesh(options).addTo(map);

```

Options
-------
- redraw: Default = `'move'`. Sets when the grid is redrawn.
- maxZoom: Default = `18`. Limit the range that the grid is drawn.
- minZoom: Default = `6`. Limit the range that the grid is drawn.
- minZoom2: Default = `10`. 2次メッシュを表示する最小zoom値。
  これ未満のときは1次メッシュを表示。
- minZoom3: Default = `14`. 3次メッシュを表示する最小zoom値。
- labelStyle: Default = `'color: #216fff; font-size:12px;'`. A css string to style the labels.
- labelAnchor: Default = `[-2, 16]`. ラベル(地域メッシュコード)の表示位置調整。labelStyleのfont-sizeを12より大きくするときは、16よりも大きくする必要あり。

表示するメッシュ:
* 1次メッシュ: minZoom (デフォルト6) <= zoom < minZoom2 (10)
* 2次メッシュ: minZoom2 (10) <= zoom < minZoom3 (14)
* 3次メッシュ: minZoom3 (14) <= zoom <= maxZoom (18)


Code inspiration from https://github.com/jonshutt/Leaflet.OS.Graticule

See also
--------
* https://github.com/MALORGIS/jisX0410
  指定した範囲の地域メッシュのGeoJSON作成等。
* http://maps.gsi.go.jp/?ll=35.665664,139.7509&z=10&base=std&ls=chiikimesh&disp=1&vs=c1j0l0u0&d=v
  地理院地図で地域メッシュ表示。VectorTileを使用している模様。
* http://www.geosense.co.jp/map/tool/geoconverter.php?cmd=meshcode
  メッシュコードで検索
