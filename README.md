# Leaflet.JISX0410Mesh

JIS X 0410 地域メッシュを表示する、Leaflet plugin。
ズームレベルに応じて、1次メッシュ(約80km四方)から6次メッシュ(約125m四方)までを切り替えて表示。

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
- minZoom4: Default = `16`. 4次メッシュを表示する最小zoom値。
- minZoom5: Default = `17`. 5次メッシュを表示する最小zoom値。
- minZoom6: Default = `18`. 6次メッシュを表示する最小zoom値。
- labelFormat: Default = `0`. ラベル(地域メッシュコード)の表示形式。
  例:
  - `0`: '53393690'
  - `1`: '5339-3690'
  - `2`: '5339-36-90'
- labelStyle: Default = `'color: #216fff; font-size: 12px; white-space: nowrap;'`. A css string to style the labels.
- labelAnchor: Default = `[-2, 16]`. ラベルの表示位置調整。labelStyleのfont-sizeを12より大きくするときは、16よりも大きくする必要あり。

表示するメッシュ:
* 1次メッシュ(80km): minZoom (デフォルト6) <= zoom < minZoom2 (10)
* 2次メッシュ(10km): minZoom2 (10) <= zoom < minZoom3 (14)
* 3次メッシュ( 1km): minZoom3 (14) <= zoom < minZoom4 (16)
* 4次メッシュ(500m): minZoom4 (16) <= zoom < minZoom5 (17)
* 5次メッシュ(250m): minZoom5 (17) <= zoom < minZoom6 (18)
* 6次メッシュ(125m): minZoom6 (18) <= zoom <= maxZoom (18)


Code inspiration from https://github.com/jonshutt/Leaflet.OS.Graticule

See also
--------
* https://github.com/MALORGIS/jisX0410
  指定した範囲の地域メッシュのGeoJSON作成等。
* http://maps.gsi.go.jp/#9/35.665664/139.750900/&base=blank&ls=blank%7Cchiikimesh&disp=11&lcd=blank&vs=c1j0h0k0l0u0t0z0r0s0m0f1&d=v
  地理院地図サイトでの地域メッシュ表示。VectorTileを使用している模様。
* http://www.geosense.co.jp/map/tool/geoconverter.php?cmd=meshcode
  メッシュコードで検索
