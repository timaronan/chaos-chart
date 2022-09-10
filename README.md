# d3-chaos v4

d3 v4 port of a sortable chaos line chart

## Installing

If you use NPM, `npm install d3-chaos`.

## API Reference

<a name="chaos" href="#chaos">#</a> d3.<b>chaos</b>()

Constructs a new default [chaos generator](#_chaos).

<a name="_chaos" href="#_chaos">#</a> <i>chaos</i>(<i>data</i>)

For example:

```js
var data = [[1,2,3],[1,7,9],[2,7,12]]; 
var chaos = d3.chaos().data(data);
var parent = d3.select('body').call(chaos);
```

<a name="chaos_layout" href="#chaos_layout">#</a> <i>chaos</i>.<b>layout</b>([<i>{width:width,height:height,margin{top:top,bottom:bottom,left:left,right:right}}</i>])

If *layout* is specified, sets the *layout* and returns this chaos generator. If *layout* is not specified, returns the current *layout*, which defaults to:  ```{margin:{top: 100, right: 80, bottom: 100, left: 10},width:1500, height:2000}```

<a name="chaos_keys" href="#chaos_keys">#</a> <i>chaos</i>.<b>keys</b>([<i>{top,middle,bottom}</i>])

If *keys* is specified, sets the *keys* and returns this chaos generator. If *keys* is not specified, returns the current *keys*, which are the keys for the range values, which default to:  ```{bottom:0,middle:1,top:2}```
