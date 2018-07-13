if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

/**
 *
 * INITIAL VARS
 *
 * */

let children = [];

let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
    'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

if (typeof asireisen === 'undefined') {
    console.log('missing calendar information');
}

let start = asireisen.start.split('-');
let end = asireisen.end.split('-');
let duration = asireisen.duration;
let bookable = asireisen.bookableDates;

let elem = document.getElementById('drawing-table');
let cm = ~~(start[1]);
let ocm = null;
let min_day = ~~(start[0]);
let min_month = cm;
let max_day = ~~(end[0]);
let max_month = ~~(end[1]);
let max_year = ~~(end[2]);
let year = ~~(start[2]);
let sel1 = null;
let sel2 = null;

let callback = elem.getAttribute('callback');

let html = '<table id="calendar"><tr>' +
    '<th class="prev" onclick="back()"><</th><th id="month" colspan="5">{0} {1}</th><th class="next" onclick="forward()">></th></tr><tr>'.format(months[cm-1], year) +
    '<th>Su</th>' +
    '<th>Mo</th>' +
    '<th>Tu</th>' +
    '<th>We</th>' +
    '<th>Th</th>' +
    '<th>Fr</th>' +
    '<th>Sa</th>' +
    '</tr>';


/**
 *
 * METHODS
 *
 * */

function paintChosenBoxes(v1, v2) {
    if (v2 === null) {
        v1.setAttribute('class', 'start-date');
    } else {
        for (i = v1 + 1; i < v2; ++i) {
            document.getElementById(i).setAttribute('class', 'in-range');
        }
        document.getElementById(v2).setAttribute('class', 'end-date');
    }
}

function refreshPaint() {
    if (!sel1) {
        return;
    }
    for (i = sel1; i <= sel2; ++i) {
        document.getElementById(i).setAttribute('class', 'available');
    }
    if (sel1 > sel2) {
        document.getElementById(sel1).setAttribute('class', 'available');
    }
    sel1 = null;
    sel2 = null;
}

loadMonth(cm);

function loadMonth(cm) {
    refreshPaint();
    elem = document.getElementById('drawing-table');
    /*children[ocm] = elem.firstChild;
    elem.removeChild(elem.firstChild);

    if (children[cm]) {
        elem.appendChild(children[cm]);
        return
    }*/

    draw = html;
    days = new Date(year, cm, 0).getDate();
    day = new Date(year, cm-1, 1, 0, 0, 0, 0).getDay();
    weeks = days / 7 + 1;

    for (i = 1, n = 1; i <= Math.ceil(weeks); ++i) {
        draw += '<tr>';
        for (j = 0; j < 7; ++j) {
            id = "{0}-{1}-{2}".format(cm>9?cm:'0'+cm, n>9?n:'0'+n, year);
            // TODO CHECKING
            if ((n === 1 && day !== j)) {
                draw += '<td class="off-date"></td>';
                continue;
            }
            if (n > days) break;
            if (typeof bookable !== 'undefined') {
                if (!bookable.includes(id)) {
                    draw += '<td class="off-date" id="'+ n + '">' + n + '</td>';
                } else {
                    draw += '<td class="available" id="' + n + '" onclick="choose(this)">' + n + '</td>';
                }
            }
            else if ((cm == min_month && min_day > n) ||
                (cm == max_month && max_day < n)) {
                draw += '<td class="off-date" id="'+ n + '">' + n + '</td>';
            } else {
                draw += '<td class="available" id="' + n + '" onclick="choose(this)">' + n + '</td>';
            }
            n++;
        }
        draw += '</tr>';
    }
    draw += '</table>';


    /*el = document.createElement('div');
    el.setAttribute('id', 'table');
    elem.appendChild(el);*/
    elem.innerHTML = draw
    document.getElementById('month').innerText = '{0} {1}'.format(months[cm-1], year);

    ocm = cm;
}

function call(date1, date2) {
    startDate = new Date(date1);
    endDate = new Date(date2);
    eval(callback)(startDate, endDate);
}

function choose(el) {
    if (sel2) {
        refreshPaint();
    }
    if (sel1) {
        sel2 = ~~el.getAttribute('id');
        paintChosenBoxes(sel1, sel2);

        call('{0}-{1}-{2}'.format(cm, sel1, year), '{0}-{1}-{2}'.format(cm, sel2, year));
    } else {
        sel1 = ~~el.getAttribute('id');
        paintChosenBoxes(el, null);
        if (typeof duration !== 'undefined') {
            totalDays = new Date(year, cm, 0).getDate();

            if (totalDays >= (sel1 + duration)) {
                choose(document.getElementById(sel1 + duration));
                return;
            }
            __day = sel1 + duration - totalDays;
            sel2 = __day;
            call('{0}-{1}-{2}'.format(cm, sel1, year), '{0}-{1}-{2}'.format(cm+1, sel2, year));
        }
    }
}

function back() {
    if (cm == 1 || cm <= min_month) return;
    cm --;
    loadMonth(cm);
}

function forward() {
    if (cm == 12 || cm >= max_month) return;
    cm ++;
    loadMonth(cm);
}