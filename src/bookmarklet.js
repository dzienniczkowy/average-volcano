(function(){
  "use strict";

  var tableDefaultSelector = '.ocenyZwykle-table';
  var tableDetailsSelector = '.ocenySzczegoly-table';
  var tableHeaderSelector = tableDefaultSelector + ' > thead > tr';
  var subjetsSelector = 'tbody tr';
  var ratingsSelector = 'td.break-word span';
  var gradesSelector = 'tbody tr'
  var summaryContainerId = 'whole-avarage';

  (function(){
    if(document.getElementById(summaryContainerId)) {
      return;
    }

    if (document.querySelector(tableDefaultSelector)) {
      var subjects = document.querySelectorAll(subjetsSelector);
      var averages = [];

      for (var i = 0, max = subjects.length; i < max; i++) {
        var avarage = getGradesAverage(subjects[i]);
        putGradesAverageCellToSubjectRow(subjects[i], avarage);
        averages.push(avarage);
      }

      addWholeGradesAverageToTableFoot(averages);
      calculateAndAddRealWholeGradesAverageToTableFoot();

    } else if(document.querySelector(tableDetailsSelector)) {
      var grades = document.querySelectorAll(gradesSelector);

      var weightedAverage = calculateAverageFromGrades(grades);
      addWeightedAverageToTableFoot(weightedAverage);
    }
  })();

  function calculateAverageFromGrades(grades) {
    var counter = 0;
    var denominator = 0;

    for (let i = 0; i < grades.length; i++) {
      let grade = getGradeValue(grades[i]);

      if (grade.value) {
        counter += grade.value * grade.weight;
        denominator += grade.weight;
      }
    }

    if (0 == denominator) {
      return null;
    }

    return counter / denominator;
  }

  function getGradeValue(gradeRow) {
    let value = gradeRow.querySelector('td:nth-child(2)').textContent;
    let weight = gradeRow.querySelector('td:nth-child(4)').textContent;

    value = getRatingValue(value);
    weight = parseFloat(weight.replace(/,/, '.'));

    if (value) {
      return {
        "value": value,
        "weight": weight
      };
    }

    return false;
  }

  function getGradesAverage(row) {
    var grades = row.querySelectorAll(ratingsSelector);

    var counter = 0;
    var denominator = 0;

    for (var i = 0, max = grades.length; i < max; i++) {
      var value = getRatingValue(grades[i].innerHTML);
      var weight = getWeightOfGradeFromAlt(grades[i]);

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
    if (null == avarage) {
      var text = '-';
      avarage = '-';
    } else {
      var text = Math.round(avarage * 100) / 100;
    }

    var newNode = document.createElement('td');
    newNode.textContent = text;
    newNode.title = avarage;
    row.appendChild(newNode)
  }

  /**
   * Extract weight of grade from span alt.
   * @param  {Object} span Span
   * @return {Number} Grade weight
   */
  function getWeightOfGradeFromAlt(span) {
    var alt = span.getAttribute('alt');

    var weightText = alt.match(/Waga:\s[0-9]{1,2},[0-9]{2}/)[0];

    var weight = weightText.match(/[0-9]{1,2},[0-9]{2}/)[0];
    var weight = parseFloat(weight.replace(/,/, '.'));

    return weight;
  }

  /**
   * Check is rating value valid.
   * @param  {*}  rating Rating value
   * @return {Boolean}
   */
  function isRatingValueValid(rating) {
    return /^(\+|\-)?[0-6](\+|\-)?$/.test(rating);
  }

  /**
   * Get real rating value.
   * @param  {*} rating Rating
   * @return {Number}
   */
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

  /**
   * Add header cell to table.
   * @param {String} text Cell text content
   */
  function addHeaderCellToTable(text) {
    var header = document.querySelector(tableHeaderSelector);
    var newNode = document.createElement('th');
    newNode.textContent = text;
    header.appendChild(newNode);
  }

  /**
   * Calculate average from array values.
   * @param  {Array} averages
   * @return {Number}
   */
  function calculateAverage(averages) {
    // remove null values
    averages = averages.filter(function(e){ return e });

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

    var sum = roundedAverages.reduce(function(a, b) { return a + b });
    var avg = sum / roundedAverages.length;

    return avg;
  }

  /**
   * Add whole grades average to table foot.
   * @param {Array} averages Average grades
   */
  function addWholeGradesAverageToTableFoot(averages) {
    addHeaderCellToTable('Obliczona średnia');

    var table = document.querySelector(tableDefaultSelector);
    var thead = table.querySelector('thead tr');

    var tfoot = document.createElement('thead');
    var tr = document.createElement('tr');
    var th = document.createElement('th');

    var avg = calculateAverage(averages);
    if (!isNaN(avg)) {
      th.textContent = Math.round(avg * 100) / 100;
      th.title = avg;
    } else {
      th.textContent = '-';
    }
    th.id = summaryContainerId;

    var docFrag = document.createDocumentFragment();
    for (var i = 0; i < thead.children.length - 1; i++) {
      docFrag.appendChild(document.createElement('th'));
    }
    tr.appendChild(docFrag);

    tr.appendChild(th);
    tfoot.appendChild(tr);
    table.appendChild(tfoot)
  }

  function calculateAndAddRealWholeGradesAverageToTableFoot() {
    // get subject rows
    var subjects = document.querySelectorAll(subjetsSelector);
    var averages = [];

    // iterate over each subject
    for (var i = 0, max = subjects.length; i < max; i++) {
      // check is any grades exists
      if (subjects[i].querySelector(ratingsSelector)) {
        var average = subjects[i].querySelector('td:nth-last-child(2)').innerHTML;
        averages.push(normalizeRating(average));
      }
    }

    var table = document.querySelector(tableDefaultSelector);
    var cell = table.querySelector('thead:last-of-type th:nth-last-child(2)');
    var avg = calculateAverage(averages);

    if (!isNaN(avg)) {
      cell.textContent = Math.round(avg * 100) / 100;
      cell.title = avg;
    } else {
      cell.textContent = '-';
    }
  }

  function addWeightedAverageToTableFoot(average) {
    var table = document.querySelector(tableDetailsSelector);
    var thead = table.querySelector('thead tr');
    var tfoot = document.createElement('thead');
    var tr = document.createElement('tr');
    var th = document.createElement('th');

    if (!isNaN(average)) {
      th.textContent = Math.round(average * 100) / 100;
      th.title = average;
    } else {
      th.textContent = '-';
    }
    th.id = summaryContainerId;

    var docFrag = document.createDocumentFragment();
    for (var i = 0; i < thead.children.length; i++) {
      if (i == 1) {
        docFrag.appendChild(th);
      } else {
        docFrag.appendChild(document.createElement('th'));
      }
    }
    tr.appendChild(docFrag);

    tfoot.appendChild(tr);
    table.appendChild(tfoot);
  }

  /**
   * Normalize rating value.
   * @param  {Number|String} rating Rating value
   * @return {Number} Rating number value
   */
  function normalizeRating(rating) {
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
      default: rating = 0;
    }

    return rating;
  }

})();
