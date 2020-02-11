/*******************************************************************************
* BUDGET MODEL
* - The "Expense" and "Income" ID's are created by taking the last ID in the
*   object array and adding one.
* - The ".add__type" DOM element will be either "exp" or "inc"
*******************************************************************************/
var budgetModel = (function () {
  var Expense, Income, data

  Expense = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
    this.percentage = -1
  }

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(this.value / totalIncome * 100)
    } else {
      this.percentage = -1
    }
  }

  Expense.prototype.getPercentage = function () {
    return this.percentage
  }

  Income = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
  }

  data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }

  var calculateTotal = function (type) {
    var sum = 0

    data.allItems[type].forEach(function (current) {
      sum += current.value
    })

    data.totals[type] = sum
  }

  return {
    addItem: function (type, desc, val) {
      var newItem, ID, itemArrayLength

      itemArrayLength = data.allItems[type].length
      if (itemArrayLength > 0) {
        ID = data.allItems[type][itemArrayLength - 1].id + 1
      } else {
        ID = 1
      }

      if (type === 'exp') {
        newItem = new Expense(ID, desc, val)
      } else if (type === 'inc') {
        newItem = new Income(ID, desc, val)
      }

      data.allItems[type].push(newItem)

      return newItem
    },

    deleteItem: function (type, id) {
      var index

      index = data.allItems[type].findIndex(function (current) {
        return current.id === id
      })

      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: function () {
      var expenses, income

      // 1. Calculate total income and expenses
      calculateTotal('exp')
      calculateTotal('inc')

      // 2. Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp

      // 3. Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round(data.totals.exp / data.totals.inc * 100)
      } else {
        data.percentage = -1
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc)
      })
    },

    getPercentages: function () {
      var allPercentages

      allPercentages = data.allItems.exp.map(function (current) {
        return current.getPercentage()
      })

      return allPercentages
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function () {
      console.log(data)
    }
  }

})();

/*******************************************************************************
* BUDGET VIEW
*******************************************************************************/
var budgetView = (function () {
  var DOMStrings, nodeListForEach, formatNumber

  DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    incAndExpContainer: '.container',
    expensePercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i)
    }
  }

  formatNumber = function (num, type) {
    var numSplit, integer, decimal, sign

    // Rules:
    // 1. Put a "+"" or "-" before the number
    // 2. Print the number accurate to two decimal places
    // 3. Comma separate values a thousand and over

    num = Math.abs(num)
    num = num.toFixed(2)
    numSplit = num.split('.')
    integer = numSplit[0]

    if (integer.length > 3) {
      integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3)
    }

    decimal = numSplit[1]

    return (type === 'exp' ? sign = '-' : sign = "+") + ' ' + integer + '.' + decimal
  }

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      }
    },

    addListItem: function (obj, type) {
      var html, newHTML, element

      // 1. Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMStrings.incomeContainer
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMStrings.expenseContainer
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // 2. Replace placeholder text with actual data
      newHTML = html.replace('%id%', obj.id)
      newHTML = newHTML.replace('%description%', obj.description)
      newHTML = newHTML.replace('%value%', formatNumber(obj.value, type))

      // 3. Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML)
    },

    deleteListItem: function (selectorID) {
      var element

      element = document.getElementById(selectorID)
      element.parentNode.removeChild(element)
    },

    clearFields: function () {
      var inputFields, inputFieldsArray

      inputFields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue)

      // Converting the list into an array
      inputFieldsArray = Array.prototype.slice.call(inputFields)
      inputFieldsArray.forEach(function (current, index) {
        current.value = ""
      });

      inputFieldsArray[0].focus()
    },

    displayBudget: function (obj) {
      var type

      obj.budget > 0 ? type = 'inc' : type = 'exp'

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type)
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp')
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---'
      }
    },

    displayPercentages: function (percentages) {
      var fields

      fields = document.querySelectorAll(DOMStrings.expensePercLabel)
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%'
        } else {
          current.textContent = '---'
        }
      })
    },

    displayMonthAndYear: function () {
      var now, year, month, months

      now = new Date()
      year = now.getFullYear()

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      month = now.getMonth()

      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year
    },

    changedType: function () {
      var fields

      fields = document.querySelectorAll(
        DOMStrings.inputType + ', ' +
        DOMStrings.inputDescription + ', ' +
        DOMStrings.inputValue
      )

      nodeListForEach(fields, function (current) {
        current.classList.toggle('red-focus')
      })

      document.querySelector(DOMStrings.inputButton).classList.toggle('red')
    },

    getDOMStrings: function () {
      return DOMStrings
    }
  }

})();

/*******************************************************************************
* GLOBAL APP CONTROLLER
*******************************************************************************/
var controller = (function (budgetMdl, budgetVw) {

  var setUpEventListeners = function () {
    var DOM = budgetVw.getDOMStrings()

    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem)
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem()
      }
    })
    document.querySelector(DOM.incAndExpContainer).addEventListener('click', ctrlDeleteItem)
    document.querySelector(DOM.inputType).addEventListener('change', budgetVw.changedType)
  }

  var updateBudget = function () {
    var budget

    // 1. Calculate the budget
    budgetMdl.calculateBudget()

    // 2. Return the budget
    budget = budgetMdl.getBudget()

    // 3. Display the budget
    budgetVw.displayBudget(budget)
  }

  var updatePercentages = function () {
    var allPercentages

    // 1. Calculate the percentages
    budgetMdl.calculatePercentages();

    // 2. Read percentages from the budget controller
    allPercentages = budgetMdl.getPercentages()

    // 3. Update the UI with the new percentages
    budgetVw.displayPercentages(allPercentages)
  }

  var ctrlAddItem = function () {
    var input, newItem

    // 1. Get the input data
    input = budgetVw.getInput()

    if (input.description !== "" && !isNaN(input.value)) {
      // 2. Add the item to the budget controller
      newItem = budgetMdl.addItem(input.type, input.description, input.value)

      // 3. Add the new item to the new user interface
      budgetVw.addListItem(newItem, input.type)

      // 4. Clear the input fields
      budgetVw.clearFields()

      // 5. Calculate and update the budget
      updateBudget()

      // 6. Calculate and update percentages
      updatePercentages()
    } else {
      alert('Your must enter a description and a value!')
    }
  }

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID

    // 1. Identify the target element that identifies the item
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

    if (itemID) {
      // 2. Split the "id" tag into the type and number
      splitID = itemID.split('-')
      type = splitID[0]
      ID = parseInt(splitID[1])

      // 3. Delete the item from the model
      budgetMdl.deleteItem(type, ID)

      // 4. Delete the item from the view
      budgetVw.deleteListItem(itemID)

      // 5. Update and show the new budget
      updateBudget()

      // 6. Calculate and update percentages
      updatePercentages()
    }
  }

  return {
    init: function () {
      console.log('Application has started...')
      setUpEventListeners()
      budgetVw.displayMonthAndYear()
      budgetVw.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      })
    }
  }

})(budgetModel, budgetView);

controller.init()
