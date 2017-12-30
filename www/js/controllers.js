angular.module('starter.controllers', [])
  .controller('AppCtrl', function ($rootScope, $scope, $ionicModal, $ionicListDelegate, $ionicSideMenuDelegate, Piedb, $firebaseAuth, $firebaseArray, ionicToast) {
    $scope.isLoading = true

    // Form model for the login modal
    $scope.loginData = {}

    // Form model for addPerson modal
    $scope.userData = {}

    // Form model for edit modal
    $scope.editData = {}
    $scope.newData = {}

    // Create the authentiction object and set initial authentication
    var auth = $firebaseAuth()
    $scope.isAuthenticated = false

    // Called on the addPerson template when admin wants to add a new person
    $scope.checkForUser = function (user) {
      $scope.userExists = $scope.people.find(function (index) {
        return index['name'] == user
      })
    }

    // Initialize powerhour status of false
    $rootScope.powerHour = {
      checked: false
    }

    // Watch for change of powerhour via slider. Initialized at .25 per vote and $1 for 5. When switched on, double # of votes bought
    $rootScope.$watch('powerHour.checked', function (newValue, oldValue) {
      if (newValue === true) {
        // Double buying power
        $rootScope.price /= 2
        $rootScope.votesPerDollar *= 2
      } else {
        // Set pricing on the rootScope of the app
        $rootScope.price = 0.25
        $rootScope.votesPerDollar = 5
      }
    })

    // Get grand total dollar amount from objects in Firebase
    $scope.people = $firebaseArray(Piedb.child('people'))
    Piedb.child('people').on('value', function (snapshot) {
      var total = 0
      snapshot.forEach(function (child) {
        total += child.val().amount
      })
      $scope.grandTotal = total
    })

    // Create and open the login modal that we will use later
    $scope.login = function () {
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.loginmodal = modal
        $scope.loginmodal.show()
      })
    }

    // Create and open addPerson modal
    $scope.addPerson = function () {
      $ionicModal.fromTemplateUrl('templates/addPerson.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.modal = modal
        $scope.modal.show()
      })
    }

    // Create and open the edit form and set the editData object = to the values of the firebase user object
    $scope.edit = function (person) {
      $ionicModal.fromTemplateUrl('templates/edit.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.editmodal = modal
        $scope.editmodal.show()
        $scope.editData = $scope.people.$getRecord(person.$id)
      })
    }

    // Perform the login action when the admin submits the login form
    $scope.doLogin = function () {
      auth.$signInWithEmailAndPassword($scope.loginData.username, $scope.loginData.password).then(function (data) {
        $scope.loginmodal.hide()
        $scope.isAuthenticated = auth.$getAuth()
        $scope.loginData = {}
      }).catch(function (error) {
        console.error(error)
      })
    }

    // Log the user out, set authentiction status, and close the menu
    $scope.logout = function () {
      auth.$signOut()
      $scope.isAuthenticated = null
      $ionicSideMenuDelegate.toggleLeft()
    }

    // This function is triggered when dollar amount is being added
    $scope.calculateVotes = function (price) {
      if (price % 1 === 0) {
        $scope.userData.votes = price * $rootScope.votesPerDollar
      } else {
        $scope.userData.votes = (Math.floor(price) * $rootScope.votesPerDollar) + (((price % 1) / $rootScope.price) * 1)
      }
    }

    // This function is triggered when votes are being added
    $scope.calculateAmount = function (votes) {
      if (votes % $rootScope.votesPerDollar === 0) {
        $scope.userData.amount = votes / $rootScope.votesPerDollar
      } else {
        $scope.userData.amount = (Math.floor(votes / $rootScope.votesPerDollar)) + ((votes % $rootScope.votesPerDollar) * $rootScope.price)
      }
    }

    // Add new person
    $scope.submitPerson = function (form) {
      if (form.$valid && !$scope.userExists) {
        $scope.userData.isPlaying = true
        $scope.userData.name = $scope.userData.name.toLowerCase()
        $scope.people.$add($scope.userData)
          .then(function () {
            ionicToast.show($scope.userData.name + ' created', 'top', false, 4000)
            $scope.userData = {}
            $scope.modal.hide()
            form.$setUntouched()
          }).catch(function (error) {
            ionicToast.show(error, 'top', true, 3000)
          })
      }
    }
    // Save edit to amount and votes
    $scope.submitEdit = function () {
      $scope.editData.amount += $scope.newData.amount
      $scope.editData.votes += $scope.newData.votes
      $scope.people.$save($scope.editData)
      $scope.newData = {}
    }
  })

  // CONTEST CONTROLLER
  .controller('ContestCtrl', function ($scope, $ionicListDelegate, Piedb, $firebaseArray) {
    // Status of delete buttons that move users to the bought out section
    $scope.status = false
    $scope.toggleDeleteButtons = function () {
      $scope.status = !$scope.status
    }

    // GET OBJECTS FROM FIREBASE
    var ref = Piedb.child('people').orderByChild('votes')
    $scope.people = $firebaseArray(ref)
    $scope.people.$loaded()
      .then(function () {
        $scope.isLoading = false
      })

    // Buyout costs x2 current amount of money on person
    $scope.buyOut = function (person) {
      var record = $scope.people.$getRecord(person.$id)
      record.amount *= 2
      record.isPlaying = false
      $scope.people.$save(record)
    }
    // In case admin performs buyout action on wrong person
    $scope.backIn = function (person) {
      var record = $scope.people.$getRecord(person.$id)
      record.amount /= 2
      record.isPlaying = true
      $scope.people.$save(record)
    }

    // Destroy the login modal to prevent memory leaks
    $scope.closeLogin = function () {
      $scope.loginmodal.remove()
    }

    // Destroy the AddPerson modal to prevent memory leaks
    $scope.closeAdd = function () {
      $scope.modal.remove()
    }

    // Destroy the edit form and slide the option buttons close
    $scope.closeEdit = function () {
      $scope.newData = {}
      $scope.editmodal.remove()
      $ionicListDelegate.closeOptionButtons()
    }
  })

  .controller('DetailsCtrl', function ($rootScope, $scope, SettingsService, Piedb, $firebaseArray) {
    $scope.title = 'Details'
  })
