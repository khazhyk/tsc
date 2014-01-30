function ShittyTable(objectArray, element, options) {
    this.isNumbered = false;
    this.data = objectArray;
    this.owningElement = element;
    this.defaultSortOrder = -1;
    this.sortCrit = []; // -1 is desc, 0 is auto, 1 is asc
}
ShittyTable.prototype.updateData = function(data) {
    this.data = data;
    this.doSort();
    this.render();
}
ShittyTable.prototype.sortBy = function(crit, reverse, ignorePrev) {
    var match = this.sortCrit.filter(function(x) {
        return x[0] == crit;
    });

    var newCrit = [crit, reverse];

    if (match.length !== 0) {
        if (newCrit[1] === 0) {
            newCrit[1] = (match[0][1] == -1) ? 1 : -1;
        }
    } else {
        if (newCrit[1] == 0) {
            newCrit[1] = -1;
        }
    }

    this.sortCrit = this.sortCrit.filter(function(x) {
        return x[0] != crit;
    })

    this.sortCrit.unshift(newCrit);

    this.doSort();

}
ShittyTable.prototype.doSort = function() {
    var that = this;
    this.data = this.data.sort(function(a,b) {
        for (var key in that.sortCrit) {
            var crit = that.sortCrit[key][0];
            var desc = that.sortCrit[key][1];
            if (a[crit] == b[crit]) {
                continue;
            } else {
                return ((a[crit] > b[crit]) ? -1 : 1) * (desc);
            }
        }
    });
}
ShittyTable.prototype.render = function() {
    while(this.owningElement.lastChild) this.owningElement.removeChild(this.owningElement.lastChild);
    var objectArray = this.data;
    var numbered = this.isNumbered;
    var that = this;
    var onClickFun = function(title) {
        that.sortBy(title, 0);
        that.render();
    }

    var table = objectArray2Table(objectArray, numbered, onClickFun);

    this.owningElement.appendChild(table);
}

function objectArray2Table(objectArray, numbered, clickFun) {
    var tbl = document.createElement("table"),
        thd = document.createElement("thead"),
        tbd = document.createElement("tbody"),
        headerRow = document.createElement("tr");

    if (numbered) {
        var cell = document.createElement("th");
        cell.appendChild(document.createTextNode("#"));
        headerRow.appendChild(cell);
    }

    for (attribute in objectArray[0]) {
        var cell = document.createElement("th");
        cell.appendChild(document.createTextNode(attribute));
        cell.addEventListener("click", (function(at) {
            return function() {
                clickFun(at);
            };
        })(attribute));
        headerRow.appendChild(cell);
    }
    thd.appendChild(headerRow);

    for (idx in objectArray) {
        var row = document.createElement("tr");
        if (numbered) {
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode(parseInt(idx)+1));
            row.appendChild(cell);
        }
        for (attribute in objectArray[idx]) {
            var cell = document.createElement("td");
            cell.appendChild(document.createTextNode(objectArray[idx][attribute]));
            row.appendChild(cell);
        }
        tbd.appendChild(row);
    }

    tbl.appendChild(thd);
    tbl.appendChild(tbd);

    return tbl;
}
