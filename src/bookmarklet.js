const tableDefaultSelector = '.ocenyZwykle-table';

function insertAfter(el, referenceNode) {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function addKeyEvents() {
  Array.from(document.querySelectorAll(tableDefaultSelector + " span")).forEach(el => {
    el.contentEditable = true;
    el.addEventListener("keydown", evt => {
      if (!((evt.key > 0 && evt.key < 6) || evt.key === '+' || evt.key === '-' || evt.key === 'Backspace'
          || evt.key === 'Delete')) {
        evt.preventDefault();
      }
      let number = parseInt(evt.target.innerHTML);
      if (isNaN(number)) {
        number = 1;
      }
      if (evt.key === "ArrowUp" && number !== 6) {
        evt.target.textContent = (number + 1).toString();
      }
      if (evt.key === "ArrowDown" && number !== 1) {
        evt.target.textContent = (number - 1).toString();
      }
      if (evt.key === "ArrowLeft") {
        evt.target.previousElementSibling.focus();
      }
      if (evt.key === "ArrowRight") {
        evt.target.nextElementSibling.focus();
      }
      calculateSubjectsAverage();
    });
  });
}

function addCellsToTable() {
  if (document.querySelector(tableDefaultSelector) && !document.querySelector('.average-volcano')) {
    const headerCell = document.createElement("th");
    headerCell.textContent = "Średnia";
    insertAfter(headerCell, document.querySelector(tableDefaultSelector + ' thead th:nth-child(2)'));

    Array.from(document.querySelectorAll(tableDefaultSelector + " tbody td:nth-child(2)")).forEach(el => {
      let bodyCell = document.createElement("td");
      bodyCell.textContent = "-";
      insertAfter(bodyCell, el);
    });

    const footer = document.createElement("thead");
    footer.classList.add("average-volcano");
    const tr = document.createElement("tr");
    const docFrag = document.createDocumentFragment();
    for (let i = 0; i < document.querySelector(tableDefaultSelector + " thead tr").children.length; i++) {
      let th = document.createElement('th');
      th.textContent = i > 1 ? '-' : '';
      docFrag.appendChild(th);
    }
    tr.appendChild(docFrag);

    footer.appendChild(tr);
    insertAfter(footer, document.querySelector(tableDefaultSelector + " tbody"));
  }
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
    return parseInt(rating) + 0.33;
  }

  if (/^(-)[0-6]$/.test(rating) || /^[0-6](-)$/.test(rating)) {
    return parseInt(rating) - 0.33;
  }

  return rating;
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

function getCalculatedSubjectAverage(subjectGrades) {
  let counter = 0;
  let denominator = 0;

  Array.from(subjectGrades.querySelectorAll("span")).forEach(grade => {
    const value = getRatingValue(grade.innerHTML);
    const weight = getWeightOfGradeFromAlt(grade);

    if (value) {
      counter += value * weight;
      denominator += weight;
    }
  });

  if (0 === denominator) {
    return null;
  }

  const avg = counter / denominator;

  subjectGrades.nextSibling.title = avg;
  subjectGrades.nextSibling.textContent = avg.toFixed(2);

  return avg;
}

function calculateSubjectsAverage() {
  const averages = [];
  Array.from(document.querySelectorAll(tableDefaultSelector + " tbody td:nth-child(2)")).forEach(el => {
    averages.push(getCalculatedSubjectAverage(el));
  });

  const avg = calculateAverage(averages);
  const fullAvgCell = document.querySelector(tableDefaultSelector + " thead:nth-of-type(2) th:nth-child(3)");
  if (!isNaN(avg)) {
    fullAvgCell.textContent = avg.toFixed(2);
    fullAvgCell.title = avg;
  }
}

function calculateRealAverage(cellFromEnd) {
  const averages = [];
  Array.from(document.querySelectorAll(tableDefaultSelector + " tbody td:nth-last-child("+cellFromEnd+")")).forEach(el => {
    averages.push(normalizeRating(el.innerHTML));
  });

  const avg = calculateAverage(averages);
  const fullAvgCell = document.querySelector(tableDefaultSelector + " thead:nth-of-type(2) th:nth-last-child("+cellFromEnd+")");

  if (!isNaN(avg)) {
    fullAvgCell.textContent = avg.toFixed(2);
    fullAvgCell.title = avg;
  }
}

addCellsToTable();
calculateSubjectsAverage();
calculateRealAverage(1);
calculateRealAverage(2);
addKeyEvents();

const observer = new MutationObserver(() => {
  calculateSubjectsAverage();
  calculateRealAverage(1);
  calculateRealAverage(2);
});

observer.observe(document.querySelector(tableDefaultSelector), {
  subtree: true
  , characterData: true
  , attributes: true
  , attributeFilter: ['alt']
});
