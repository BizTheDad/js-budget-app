/*******************************************************************************
* BUDGET CONTROLLER
* - The "Expense" and "Income" ID's are created by taking the last ID in the
*   object array and adding one.
* - The ".add__type" DOM element will be either "exp" or "inc"
*******************************************************************************/
var budgetController = (function () {
  var Expense, Income, data

  Expense = function (id, description, value) {
    this.id = id
    this.description = description
    this.value = value
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
* UI CONTROLLER
*******************************************************************************/
var UIController = (function () {

  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage'
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
        html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = DOMStrings.expenseContainer
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }

      // 2. Replace placeholder text with actual data
      newHTML = html.replace('%id%', obj.id)
      newHTML = newHTML.replace('%description%', obj.description)
      newHTML = newHTML.replace('%value%', obj.value)

      // 3. Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHTML)
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
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc
      document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%'
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---'
      }
    },

    getDOMStrings: function () {
      return DOMStrings
    }
  }

})();

/*******************************************************************************
* GLOBAL APP CONTROLLER
*******************************************************************************/
var controller = (function (budgetCtrl, UICtrl) {

  var setUpEventListeners = function () {
    var DOM = UICtrl.getDOMStrings()

    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem)
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem()
      }
    })
  }

  var updateBudget = function () {
    var budget

    // 1. Calculate the budget
    budgetCtrl.calculateBudget()

    // 2. Return the budget
    budget = budgetCtrl.getBudget()

    // 3. Display the budget
    UICtrl.displayBudget(budget)
  }

  var ctrlAddItem = function () {
    var input, newItem

    // 1. Get the input data
    input = UICtrl.getInput()

    if (input.description !== "" && !isNaN(input.value)) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value)

      // 3. Add the new item to the new user interface
      UICtrl.addListItem(newItem, input.type)

      // 4. Clear the input fields
      UICtrl.clearFields()

      // 5. Calculate and update the budget
      updateBudget()
    } else {
      alert('Your must enter a description and a value!')
    }
  }

  return {
    init: function () {
      console.log('Application has started...')
      setUpEventListeners()
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      })
    }
  }

})(budgetController, UIController);

controller.init()
