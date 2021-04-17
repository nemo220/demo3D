/*
 * anime.js v3.2.0
 * (c) 2020 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */

'use strict';

// Stagger helpers

function stagger(val, params) {
    if (params === void 0) params = {};

    var direction = params.direction || 'normal';
    var easing = params.easing ? parseEasings(params.easing) : null;
    var grid = params.grid;
    var axis = params.axis;
    var fromIndex = params.from || 0;
    var fromFirst = fromIndex === 'first';
    var fromCenter = fromIndex === 'center';
    var fromLast = fromIndex === 'last';
    var isRange = is.arr(val);
    var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
    var val2 = isRange ? parseFloat(val[1]) : 0;
    var unit = getUnit(isRange ? val[1] : val) || 0;
    var start = params.start || 0 + (isRange ? val1 : 0);
    var values = [];
    var maxValue = 0;
    return function (el, i, t) {
        if (fromFirst) { fromIndex = 0; }
        if (fromCenter) { fromIndex = (t - 1) / 2; }
        if (fromLast) { fromIndex = t - 1; }
        if (!values.length) {
            for (var index = 0; index < t; index++) {
                if (!grid) {
                    values.push(Math.abs(fromIndex - index));
                } else {
                    var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
                    var fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
                    var toX = index % grid[0];
                    var toY = Math.floor(index / grid[0]);
                    var distanceX = fromX - toX;
                    var distanceY = fromY - toY;
                    var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                    if (axis === 'x') { value = -distanceX; }
                    if (axis === 'y') { value = -distanceY; }
                    values.push(value);
                }
                maxValue = Math.max.apply(Math, values);
            }
            if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
            if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
        }
        var spacing = isRange ? (val2 - val1) / maxValue : val1;
        return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
    }
}


// Units

function getUnit(val) {
    var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    if (split) { return split[1]; }
}
// Easings

function parseEasingParameters(string) {
    var match = /\(([^)]+)\)/.exec(string);
    return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
}


function parseEasings(easing, duration) {
    if (is.fnc(easing)) { return easing; }
    var name = easing.split('(')[0];
    var ease = penner[name];
    var args = parseEasingParameters(easing);
    switch (name) {
        case 'spring': return spring(easing, duration);
        case 'cubicBezier': return applyArguments(bezier, args);
        case 'steps': return applyArguments(steps, args);
        default: return applyArguments(ease, args);
    }
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration) {

    var params = parseEasingParameters(string);
    var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
    var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
    var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
    var velocity = minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
    var w0 = Math.sqrt(stiffness / mass);
    var zeta = damping / (2 * Math.sqrt(stiffness * mass));
    var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    var a = 1;
    var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

    function solver(t) {
        var progress = duration ? (duration * t) / 1000 : t;
        if (zeta < 1) {
            progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
        } else {
            progress = (a + b * progress) * Math.exp(-progress * w0);
        }
        if (t === 0 || t === 1) { return t; }
        return 1 - progress;
    }

    function getDuration() {
        var cached = cache.springs[string];
        if (cached) { return cached; }
        var frame = 1 / 6;
        var elapsed = 0;
        var rest = 0;
        while (true) {
            elapsed += frame;
            if (solver(elapsed) === 1) {
                rest++;
                if (rest >= 16) { break; }
            } else {
                rest = 0;
            }
        }
        var duration = elapsed * frame * 1000;
        cache.springs[string] = duration;
        return duration;
    }

    return duration ? solver : getDuration;

}


// Utils

function minMax(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

function stringContains(str, text) {
    return str.indexOf(text) > -1;
}

function applyArguments(func, args) {
    return func.apply(null, args);
}

var is = {
    arr: function (a) { return Array.isArray(a); },
    obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
    pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
    svg: function (a) { return a instanceof SVGElement; },
    inp: function (a) { return a instanceof HTMLInputElement; },
    dom: function (a) { return a.nodeType || is.svg(a); },
    str: function (a) { return typeof a === 'string'; },
    fnc: function (a) { return typeof a === 'function'; },
    und: function (a) { return typeof a === 'undefined'; },
    hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
    rgb: function (a) { return /^rgb/.test(a); },
    hsl: function (a) { return /^hsl/.test(a); },
    col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
    key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; }
};




var defaultTweenSettings = {
    duration: 1000,
    delay: 0,
    endDelay: 0,
    easing: 'easeOutElastic(1, .5)',
    round: 0
};

window.anime = {};
anime.version = '3.2.0';
anime.stagger = stagger;
