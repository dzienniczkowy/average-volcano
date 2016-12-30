(function(){
  "use strict";

  var tableSelector = '.ocenyZwykle-table';
  var tableHeaderSelector = tableSelector + ' > thead > tr';
  var subjetsSelector = 'tbody tr';
  var ratingsSelector = 'td.break-word span';
  var summaryContainerId = 'whole-avarage';

  (function(){
    if(document.getElementById(summaryContainerId) || document.querySelector(tableSelector) == null) {
      return;
    }

    var subjects = document.querySelectorAll(subjetsSelector);
    var avarages = [];

    for (var i = 0, max = subjects.length; i < max; i++) {
      var avarage = getGradesAverage(subjects[i]);
      putGradesAverageCellToSubjectRow(subjects[i], avarage);
      avarages.push(avarage);
    }

    addHeaderCellToTable(document.querySelector(tableHeaderSelector));
    addWholeGradesAverageToTableFoot(document.querySelector(tableSelector), avarages);
  })();

  function getGradesAverage(row) {
    var ratings = row.querySelectorAll(ratingsSelector);

    var counter = 0;
    var denominator = 0;

    for (var i = 0, max = ratings.length; i < max; i++) {
      var weight = getWeightOfGrade(ratings[i]);
      var value = getRatingValue(ratings[i]);

      if (value) {
        counter += value * weight;
        denominator += weight;
      }
    }

    if (denominator == 0) {
      return 0;
    }

    return counter / denominator;
  }

  function putGradesAverageCellToSubjectRow(row, avarage) {
    var newNode = document.createElement('td');

    var text = Math.round(avarage * 100) / 100;
    if (text == 0) {
      text = '-';
    }
    newNode.innerHTML = text;
    newNode.title = avarage;
    row.appendChild(newNode)

    return avarage;
  }

  function getWeightOfGrade(span) {
    var alt = span.getAttribute('alt');
    var weight = alt.match(/[0-9]{1,2},[0-9]{2}/)[0];
    var weight = parseFloat(weight.replace(/,/, '.'));

    return weight;
  }

  function isRatingValueValid(rating) {
    return /^(\+|\-)?[0-6](\+|\-)?$/.test(rating);
  }

  function getRatingValue(span) {
    var rating = span.innerHTML;

    if (!isRatingValueValid(rating)) {
      return false;
    }

    if (/^(\+)[0-6]$/.test(rating) || /^[0-6](\+)$/.test(rating)) {
      return parseInt(rating) + 0.25;
    }

    if (/^(\-)[0-6]$/.test(rating) || /^[0-6](\-)$/.test(rating)) {
      return parseInt(rating) - 0.25;
    }

    return rating;
  }

  function addHeaderCellToTable(header) {
    var newNode = document.createElement('th');
    newNode.innerHTML = 'Obliczona średnia';
    header.appendChild(newNode);
  }

  function addWholeGradesAverageToTableFoot(table, avarages) {
    var sum = avarages.reduce(function(a, b) { return a + b; });
    var avg = sum / avarages.length;

    var tfoot = document.createElement('thead');
    var tr = document.createElement('tr');
    var th = document.createElement('th');

    th.innerHTML = Math.round(avg * 100) / 100;
    th.title = avg;
    th.id = summaryContainerId;

    tr.appendChild(document.createElement('th'));
    tr.appendChild(document.createElement('th'));
    tr.appendChild(document.createElement('th'));
    tr.appendChild(document.createElement('th'));
    tr.appendChild(th);
    tfoot.appendChild(tr);
    table.appendChild(tfoot)
  }

})();
