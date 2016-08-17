#routing - fast and efficient routing
## Example
```
const http = require('http');
const url  = require('url');
const routing = require('routing');

//create a new router
const router = routing();

//add some routes
router.route(function () {
  res.write('found homepage');
  res.end();
})
.route('/hello', function(req, res, next){
  res.write('found /hello');
  res.end();
});

//create and start a server
const server = http.createServer((req, res, next) => {
  const path = url.parse(req.url).pathname;
  
  //call our router
  router(path, [req, res], function () {
  
    //add a basic error handler
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.write("404 Not Found\n");
    res.end();
  });
});

server.listen(3000, function () {
  console.log(`Server running on port`, port);
});
```
When requesting `localhost:3000` in the browser you will get:
```
found homepage
```
A request on `localhost:3000/hello` would have this response:
```
found /hello
```
All other paths get a `404 Not Found` message as response.
## Methods
### .route()
Add a route.
#### Arguments
1\. String that represents the path (this is optional)

e.g.`/foo` or `/foo/baz`

2\. Handlers for the route.

The handlers get the arguments passed as second argument to the `.run()` method (see below) and as last argument a method called `next()`

__Warning:__ Your handlers need to have exactly as much arguments as the .run method gets passed as second argument plus the `next()` method.
__Methods without the correct amount of arguments will not get called.__

e.g. if you are passing `req` and `res` to the router all your handlers need to get `req`, `res` and `next()`.

#### Returns
`this`

### .run()
Match your routing logic on a path

#### Arguments
1\. A path (can be an `array` or `string`)

e.g. `/foo`, `/foo/baz` or `['foo', 'baz']`

2\. An `array` of arguments for the handlers.

If you are working with a http-server this would be:
`[req, res]`

3\. An error-handler that is getting called when every route that matches calls `next()`.

On a http-server you would probably send a 404 status code.

## Routes with *
`/*` or `*` matches every route.

`/*/adsf`
matches `/hi/asdf`, `/a/asdf` and `/foo/asdf`.
It does not match `/asdf`.

`/foo/*`
matches `/foo/baz`, `/foo/asdf` and `/foo/asdf/baz`.
It does not match `/foo`.
