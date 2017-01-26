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
    var averages = [];

    for (var i = 0, max = subjects.length; i < max; i++) {
      var avarage = getGradesAverage(subjects[i]);
      putGradesAverageCellToSubjectRow(subjects[i], avarage);
      averages.push(avarage);
    }

    addHeaderCellToTable(document.querySelector(tableHeaderSelector));
    addWholeGradesAverageToTableFoot(document.querySelector(tableSelector), averages);
    calculateAndAddRealWholeGradesAverageToTableFoot(document.querySelector(tableSelector));
  })();

  function getGradesAverage(row) {
    var ratings = row.querySelectorAll(ratingsSelector);

    var counter = 0;
    var denominator = 0;

    for (var i = 0, max = ratings.length; i < max; i++) {
      var weight = getWeightOfGrade(ratings[i]);
      var value = getRatingValue(ratings[i].innerHTML);

      if (value) {
        counter += value * weight;
        denominator += weight;
      }
    }

    if (0 == denominator) {
      return null;
    }

    return counter / denominator;
  }

  function putGradesAverageCellToSubjectRow(row, avarage) {
    var newNode = document.createElement('td');

    if (null == avarage) {
      var text = '-';
      avarage = '-';
    } else {
      var text = Math.round(avarage * 100) / 100;
    }

    newNode.textContent = text;
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

  function getRatingValue(rating) {
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
    newNode.textContent = 'Obliczona średnia';
    header.appendChild(newNode);
  }

  function calculateAverage(averages) {
    // remove null values
    averages = averages.filter(function(e){return e});

    // round averages
    for (var i = 0, roundedAverages = Array(); i < averages.length; i++) {
      var rounded = Math.round(averages[i]);

      // with this check, average be calculating even when doesn't have all ratings
      if (!isNaN(rounded)) {
        roundedAverages.push(rounded);
      }
    }

    // if array no contains any average, nothing shows
    if (roundedAverages.length == 0) {
      return NaN;
    }

    var sum = roundedAverages.reduce(function(a, b) { return a + b; });
    var avg = sum / roundedAverages.length;

    return avg;
  }

  function addWholeGradesAverageToTableFoot(table, averages) {
    var avg = calculateAverage(averages);

    var thead = table.querySelector('thead tr');

    var tfoot = document.createElement('thead');
    var tr = document.createElement('tr');
    var th = document.createElement('th');

    if (!isNaN(avg)) {
      th.textContent = Math.round(avg * 100) / 100;
      th.title = avg;
    } else {
      th.textContent = '-';
    }
    th.id = summaryContainerId;

    var docFrag = document.createDocumentFragment();
    for(var i = 0; i < thead.children.length - 1; i++) {
      docFrag.appendChild(document.createElement('th'));
    }
    tr.appendChild(docFrag);

    tr.appendChild(th);
    tfoot.appendChild(tr);
    table.appendChild(tfoot)
  }

  function calculateAndAddRealWholeGradesAverageToTableFoot(table) {
    // get subjects rows
    var subjects = document.querySelectorAll(subjetsSelector);
    var averages = [];

    // iterate over each sbuject
    for (var i = 0, max = subjects.length; i < max; i++) {
      // check is any grades exists
      if (getGradesAverage(subjects[i])) {
        var average = subjects[i].querySelector('td:nth-last-child(2)').innerHTML;
        averages.push(changeWordRatingToNumber(average));
      }
    }

    var cell = table.querySelector('thead:last-of-type th:nth-last-child(2)');
    var avg = calculateAverage(averages);
    if (!isNaN(avg)) {
      cell.textContent = Math.round(avg * 100) / 100;
      cell.title = avg;
    } else {
      cell.textContent = '-';
    }
  }

  function changeWordRatingToNumber(rating) {
    if (isRatingValueValid(rating)) {
      return getRatingValue(rating);
    }

    switch(rating) {
      case 'celujący': rating = 6; break;
      case 'bardzo dobry': rating = 5; break;
      case 'dobry': rating = 4; break;
      case 'dostateczny': rating = 3; break;
      case 'dopuszczający': rating = 2; break;
      case 'niedostateczny': rating = 1; break;
    }

    return rating;
  }

})();
