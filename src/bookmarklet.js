(function() {
  "use strict";

  const tableDefaultSelector = '.ocenyZwykle-table';
  const tableDetailsSelector = '.ocenySzczegoly-table';
  const tableHeaderSelector = tableDefaultSelector + ' > thead > tr';
  const subjectsSelector = 'tbody tr';
  const ratingsSelector = 'td.break-word span';
  const gradesSelector = 'tbody tr';
  const summaryContainerId = 'whole-avarage';

  (function(){
    if(document.getElementById(summaryContainerId)) {
      return;
    }

    if (document.querySelector(tableDefaultSelector)) {
      const subjects = document.querySelectorAll(subjectsSelector);
      const averages = [];

      for (let i = 0, max = subjects.length; i < max; i++) {
        let average = getGradesAverage(subjects[i]);
        putGradesAverageCellToSubjectRow(subjects[i], average);
        averages.push(average);
      }

      addWholeGradesAverageToTableFoot(averages);
      calculateAndAddRealWholeGradesAverageToTableFoot();

    } else if(document.querySelector(tableDetailsSelector)) {
      let grades = document.querySelectorAll(gradesSelector);
      let weightedAverage = calculateAverageFromGrades(grades);
      addWeightedAverageToTableFoot(weightedAverage);
    }
  })();

  function calculateAverageFromGrades(grades) {
    let counter = 0;
    let denominator = 0;

    for (let i = 0; i < grades.length; i++) {
      let grade = getGradeValue(grades[i]);

      if (grade.value) {
        counter += grade.value * grade.weight;
        denominator += grade.weight;
      }
    }

    if (0 === denominator) {
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
    const grades = row.querySelectorAll(ratingsSelector);

    let counter = 0;
    let denominator = 0;

    for (let i = 0, max = grades.length; i < max; i++) {
      const value = getRatingValue(grades[i].innerHTML);
      const weight = getWeightOfGradeFromAlt(grades[i]);

      if (value) {
        counter += value * weight;
        denominator += weight;
      }
    }

    if (0 === denominator) {
      return null;
    }

    return counter / denominator;
  }

  function putGradesAverageCellToSubjectRow(row, average) {
    let text;
    if (null == average) {
      text = '-';
      average = '-';
    } else {
      text = Math.round(average * 100) / 100;
    }

    const newNode = document.createElement('td');
    newNode.textContent = text;
    newNode.title = average;
    row.appendChild(newNode)
  }

  /**
   * Extract weight of grade from span alt.
   * @param  {Object} span Span
   * @return {Number} Grade weight
   */
  function getWeightOfGradeFromAlt(span) {
    const alt = span.getAttribute('alt');

    const weightText = alt.match(/Waga:\s[0-9]{1,2},[0-9]{2}/)[0];

    let weight = weightText.match(/[0-9]{1,2},[0-9]{2}/)[0];

    return parseFloat(weight.replace(/,/, '.'));
  }

  /**
   * Check is rating value valid.
   * @param  {*}  rating Rating value
   * @return {Boolean}
   */
  function isRatingValueValid(rating) {
    return /^([+-])?[0-6]([+-])?$/.test(rating);
  }

  /**
   * Get real rating value.
   * @param  {*} rating Rating
   * @return {Number|Boolean}
   */
  function getRatingValue(rating) {
    if (!isRatingValueValid(rating)) {
      return false;
    }

    if (/^(\+)[0-6]$/.test(rating) || /^[0-6](\+)$/.test(rating)) {
      return parseInt(rating) + 0.25;
    }

    if (/^(-)[0-6]$/.test(rating) || /^[0-6](-)$/.test(rating)) {
      return parseInt(rating) - 0.25;
    }

    return rating;
  }

  /**
   * Add header cell to table.
   * @param {String} text Cell text content
   */
  function addHeaderCellToTable(text) {
    const header = document.querySelector(tableHeaderSelector);
    const newNode = document.createElement('th');
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
    averages = averages.filter(e => { return e });

    // round averages
    const roundedAverages = [];
    for (let i = 0; i < averages.length; i++) {
      const rounded = Math.round(averages[i]);

      // with this check, average be calculating even when doesn't have all ratings
      if (!isNaN(rounded)) {
        roundedAverages.push(rounded);
      }
    }

    // if array no contains any average, nothing shows
    if (0 === roundedAverages.length) {
      return NaN;
    }

    const sum = roundedAverages.reduce((a, b) => { return a + b });

    return sum / roundedAverages.length;
  }

  /**
   * Add whole grades average to table foot.
   * @param {Array} averages Average grades
   */
  function addWholeGradesAverageToTableFoot(averages) {
    addHeaderCellToTable('Obliczona średnia');

    const table = document.querySelector(tableDefaultSelector);
    const thead = table.querySelector('thead tr');

    const tfoot = document.createElement('thead');
    const tr = document.createElement('tr');
    const th = document.createElement('th');

    const avg = calculateAverage(averages);
    if (!isNaN(avg)) {
      th.textContent = avg.toFixed(2);
      th.title = avg.toString();
    } else {
      th.textContent = '-';
    }
    th.id = summaryContainerId;

    const docFrag = document.createDocumentFragment();
    for (let i = 0; i < thead.children.length - 1; i++) {
      docFrag.appendChild(document.createElement('th'));
    }
    tr.appendChild(docFrag);

    tr.appendChild(th);
    tfoot.appendChild(tr);
    table.appendChild(tfoot)
  }

  function calculateAndAddRealWholeGradesAverageToTableFoot() {
    // get subject rows
    const subjects = document.querySelectorAll(subjectsSelector);
    const averages = [];

    // iterate over each subject
    for (let i = 0, max = subjects.length; i < max; i++) {
      // check is any grades exists
      if (subjects[i].querySelector(ratingsSelector)) {
        let average = subjects[i].querySelector('td:nth-last-child(2)').innerHTML;
        averages.push(normalizeRating(average));
      }
    }

    const table = document.querySelector(tableDefaultSelector);
    const cell = table.querySelector('thead:last-of-type th:nth-last-child(2)');
    const avg = calculateAverage(averages);

    if (!isNaN(avg)) {
      cell.textContent = avg.toFixed(2);
      cell.title = avg;
    } else {
      cell.textContent = '-';
    }
  }

  function addWeightedAverageToTableFoot(average) {
    const table = document.querySelector(tableDetailsSelector);
    const thead = table.querySelector('thead tr');
    const tfoot = document.createElement('thead');
    const tr = document.createElement('tr');
    const th = document.createElement('th');

    if (!isNaN(average)) {
      th.textContent = average.toFixed(2);
      th.title = average;
    } else {
      th.textContent = '-';
    }
    th.id = summaryContainerId;

    const docFrag = document.createDocumentFragment();
    for (let i = 0; i < thead.children.length; i++) {
      if (1 === i) {
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
