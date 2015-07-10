// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.controller('ImageController', function($scope, $cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, ImageService, FileService) {

  $ionicPlatform.ready(function() {
    $scope.images = FileService.images();
    $scope.$apply();
  });

  $scope.urlForImage = function(imageName) {
    var trueOrigin = cordova.file.dataDictionary + imageName;
    return trueOrigin;
  }

  $scope.addMedia = function() {
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        {text: 'Take photo'},
        {text: 'Photo from library'}
      ],
      titleText: 'Add Images',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        $scope.addImage(index);
      }
    });
  }

  $scope.addImage = function(type) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type).then(function() {
      $scope.$apply();
    });
  }

  $scope.sendEmail = function() {
    if ($scope.images != null && $scope.images.length > 0) {
      var mailImages = [];
      var savedImages = $scope.images;
      if ($cordovaDevice.getPlatform() == 'Android') {
        // Currently only working for on image
        var imageUrl = $scope.urlForImages(savedImages[0]);
        var name = imageUrl.substr(imageUrl.lastIndexOf('/')+1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/')+1);
        $cordovaFile.copyFile(namePath, name, cordova.file.externalRootDirectory, name)
        .then(function(info) {
          mailImages.push(''+cordova.file.externalRootDirectory+name);
          $scope.openMailComposer(mailImages);
        }, function(e) {
          reject();
        });
      } else {
        for (var i=0; i<savedImages.length; i++) {
          mailImages.push(''+$scope.urlForImage(savedImages[i]));
        }
        $scope.openMailComposer(mailImages);
      }
    }
  }

  $scope.openMailComposer = function(attachments) {
    var bodyText = '<html><h2>My Images</h2></html';
    var email = {
      to: 'sheak@dbix.com.my',
      attachments: attachments,
      subject: 'Sheak\'s Images',
      body: bodyText,
      isHtml: true
    };

    $cordovaEmailComposer.open(email).then(null, function() {
      for (var i=0; i<attachments.length; i++) {
        var name = attachments[i].substr(attachments[i].lastIndexOf('/')+1);
        $cordovaFile.removeFile(cordova.file.externalRootDirectory, name);
      }
    });
  }
});