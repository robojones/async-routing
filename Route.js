const defaultPath = [true];

class Route {
    constructor() {
        this.routes = [];
        this.paths = [];
    }
    /**
    * Add a new route
    * @param {function|...*} args
    */
    route(...args) {
        const self = this;

        const rawPath = parsePath(args[0]);
        const path = rawPath.shift() || null;
        var route = args.filter((f) => {
            return typeof f === 'function' || f instanceof Route
        });

        if(path && (path !== true || rawPath.length)) {
            let r = new Route();
            r.route.apply(r, [rawPath].concat(route));
            route = [r];
        }

        route.forEach((r) => {
            self.paths.push(path);
            self.routes.push(r);
        });

        return this;
    }
    /**
    * Match your routing-logic on a path
    * @param {Object|string} fullPath - the path
   	* @param {Object} args - array or arguments for the routes
   	* @param {function} done - callback triggered when no endpoint is reached
    */
    run(fullPath, args, done) {
        const self = this;
        var i = 0;
        fullPath = parsePath(fullPath);
        const path = fullPath[0];

        next();

        function next(...error) {
            if(error.length) {
                console.log("error", error);
                error.forEach((err) => {
                    args.push(err);
                });
            }

            if(i === self.routes.length) {
                if(done) done();
                return;
            }

            const p = self.paths[i];
            const route = self.routes[i];
            if((p === null && !fullPath.length) || (p === true && fullPath.length)) {
                if(typeof route === 'function') {
                    tryHandler(route, args, next);
                } else if(route instanceof Route) {
                    runRoute(route, fullPath.slice(1), args, next);
                } else {
                    throw new Error('routing error');
                }
            } else if(p === path) { // wenn richtiger pfad
                if(route instanceof Route) {
                    runRoute(route, fullPath.slice(1), args, next);
                } else {
                    throw new Error('routing error');
                }
            } else {
                process.nextTick(next);
            }
            i++;
        }
    }
}

function tryHandler(handler, args, next) {
    if(handler.length === args.length + 1) {
        setImmediate(function() {
            handler.apply(null, args.concat(next));
        });
    }
}

function runRoute(route, path, args, next) {
    process.nextTick(route.run.bind(route, path, args, next));
}

function parsePath(path) {

    if(Array.isArray(path)) {
        return path;
    }

    if(typeof path === 'string') {
        return path.split('/').filter((item) => {
            return item;
        }).map((item) => {
            if(item === '*') {
                return true;
            }
            return item;
        });
    }

    return defaultPath;
}

module.exports = Route;
