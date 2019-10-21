/**
 * Scans media query breakpoints in given CSSStylesheet and returns
 * them as array
 */
'use strict';
const allowedFeatures = ['min-width', 'max-width'];

export default function(doc=document, options={}) {

    var list = Array.from(doc.styleSheets);
    return Promise.all(list.map(ss => {
        // NB Check for own `.cssRules` property to bypass Chrome security
        // with external stylesheets
        // try...catch because browser may not able to enumerate rules for cross-domain sheets

        try {
            const rules = ss.rules || ss.cssRules;
            if (rules) return readCSSOM(ss);
        } catch (e) {
            console.warn("Can't read the css rules of: " + ss.href, e);
        }

        // Rules are not available: most likely CSS was loaded
        // from another domain and browser blocked access to CSSOM
        // according to same-origin policy.
        // Try to use external loader, if available
        if (options.loadCSS) {
            return options.loadCSS(ss.href).then(readCSSOM);
        }

        return null;
    }))
    // flatten nested arrays of breakpoints
    .then(values => [].concat(...values.filter(Boolean)))
    .then((array) => {
        var uniqueArray = unique(array);
        return uniqueArray;
    })
    .then(optimize)
    .then(bp => bp.sort((a, b) => a.smallest - b.smallest));
};

class Breakpoint {
    constructor(query, features) {
        this._real = null;
        this._id = null;
        this._features = null;
        this._query = query.trim();
        this.features = features;
    }

    get id() {
        if (this._id === null && this.features.length) {
            this._id = 'bp_' + this.features.map(f => f + this[f]).join('__');
        }

        return this._id;
    }

    get query() {
        return this._query;
    }

    get features() {
        if (!this._features) {
            this._features = Object.keys(this).filter(key => key[0] !== '_').sort();
        }

        return this._features;
    }

    set features(value={}) {
        this._id = this._features = this._real = null;
        Object.keys(value).forEach(feature => this[normalizeName(feature)] = value[feature]);
    }

    /**
     * Returns smallest feature size for current breakpoint
     * @type {Number}
     */
    get smallest() {
        var smallest = this.features.reduce((prev, f) => Math.min(prev, this.real(f)), Number.POSITIVE_INFINITY);
        return smallest !== Number.POSITIVE_INFINITY ? smallest : 0;
    }

    /**
     * Returns real size (in pixels) of given feature
     * @param  {String} feature
     */
    real(feature) {
        if (!this._real) {
            this.measure();
        }

        return this._real[normalizeName(feature)];
    }

    /**
     * Measures real feature's dimentions
     * @param  {Element} ctx Optional content element where
     * features should be measured
     * @return {Object}     Real feature sizes
     */
    measure(ctx=document.body) {
        var m = document.createElement('div');
        m.style.cssText = 'position:absolute;padding:0;margin:0;top:0;left:0;height:0;';
        ctx.appendChild(m);

        var real = this.features.reduce((out, feature) => {
            if (typeof this[feature] === 'number') {
                out[feature] = this[feature];
            } else {
                m.style.width = this[feature];
                out[feature] = m.offsetWidth;
            }
            return out;
        }, {});

        ctx.removeChild(m);
        return this._real = real;
    }
}

/**
 * Parses media query expression and returns breakpoint
 * options
 * @param  {String} mq Media Query expression
 * @return {Breakpoint}
 */
function parse(mq) {
    var feature, out = {}, empty = true;
    mq.replace(/\(\s*([\w\-]+)\s*:\s*(.+?)\)/g, function(str, feature, value) {
        feature = feature.trim();
        if (allowedFeatures.indexOf(feature) !== -1) {
            empty = false;
            out[feature] = value.trim();
        }
        return '';
    });

    return empty ? null : new Breakpoint(mq, out);
}

function readCSSOM(stylesheet, breakpoints=[]) {
    var rules = stylesheet.rules || stylesheet.cssRules;

    // Have Found Media Query?
    var found = false;

    for (var i = 0, il = rules.length; i < il; i++) {
        if (rules[i].media) {
            var cssMediaList = rules[i].media;
            found = true;
            for (var j = 0, jl = cssMediaList.length; j < jl; j++) {
                var mediaRule = parse(cssMediaList[j]);
                if(mediaRule) breakpoints.push(mediaRule);
            }
        }

        if (rules[i].styleSheet) {
            readCSSOM(rules[i].styleSheet, breakpoints);
        }
    }

    if(!found) console.warn('Did not find any media queries in', stylesheet.href || stylesheet);

    return breakpoints;
}

/**
 * Filters given breakpoints list and leaves unique items only
 * @param  {Array} breakpoints
 * @return {Array}
 */
function unique(breakpoints) {
    var lookup = {};
    return breakpoints.filter(b => !b || lookup[b.id] ? false : lookup[b.id] = true);
}

function normalizeName(str) {
    return str.replace(/\-([a-z])/g, (str, ch) => ch.toUpperCase());
}

/**
 * Optimizes breakpoints list: keeps only ones with unique width
 * @param  {Array} breakpoints
 * @return {Array}
 */
function optimize(breakpoints) {
    var lookup = {}
    return breakpoints.reduce((out, bp) => {
        var width = bp.smallest;
        if (!lookup[width]) {
            lookup[width] = true;
            out.push(bp);
        }
        return out;
    }, []);
}
