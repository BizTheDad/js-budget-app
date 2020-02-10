/*******************************************************************************
* BUDGET CONTROLLER
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
    inputButton: '.add__btn'
  }

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // This will be either "inc" or "exp"
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: document.querySelector(DOMStrings.inputValue).value
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

  var ctrlAddItem = function () {

    // 1. Get the input data
    input = UICtrl.getInput()
    console.log(input)

    // 2. Add the item to the budget controller
    // 3. Add the new item to the new user interface
    // 4. Calculate the budget
    // 5. Display the budget

  }

  return {
    init: function () {
      setUpEventListeners()
    }
  }

})(budgetController, UIController);

controller.init()
