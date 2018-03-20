'use strict';

app.controllerProvider.register("CustomNavigationCtrl", function($scope, $rootScope, $compile, $stateParams, $timeout) {
  var globalConfig = EkstepRendererAPI.getGlobalConfig();
  $scope.customNavigationVisible = false;
  $rootScope.isItemScene = false;
  $rootScope.stageId = undefined;
  $scope.state_off = "off";
  $scope.state_on = "on";
  $scope.state_disable = "disable";
  $scope.overlayVisible = false;
  $scope.pluginInstance = undefined;
  $scope.init = function() {
    EkstepRendererAPI.addEventListener("renderer:overlay:show", $scope.showCustomNavigation);
    EkstepRendererAPI.addEventListener("renderer:overlay:hide", $scope.hideCustomNavigation);

    EkstepRendererAPI.addEventListener("renderer:content:start", $scope.showCustomNavigation);


    $scope.pluginInstance = EkstepRendererAPI.getPluginObjs("org.ekstep.navigation");

    EventBus.addEventListener("sceneEnter", function(data) {
      $timeout( function(){
        $scope.showCustomNavigation();
      }, 0);

    });

    $scope.showCustomNavigation();
    if ($scope.pluginInstance) {
      if (globalConfig.overlay.showOverlay) {
        $scope.customNavigationVisible = $scope.pluginInstance.customNavigationVisible;
        $scope.safeApply();
      }
    }
  }

  $scope.showCustomNavigation = function() {
    if (!globalConfig.overlay.showOverlay) return;
    $scope.customNavigationVisible = true;
    $scope.hideDefaultNavigation();
    $scope.safeApply();
  }

  $scope.hideDefaultNavigation = function(){
    EkstepRendererAPI.dispatchEvent("renderer:next:hide");
    EkstepRendererAPI.dispatchEvent("renderer:previous:hide");
    $timeout(function() {
    EkstepRendererAPI.dispatchEvent('renderer:customprevious:show');
    EkstepRendererAPI.dispatchEvent('renderer:customNext:show');
    }, 50);
  }

  $scope.hideCustomNavigation = function() {
    $scope.customNavigationVisible = false;
    $scope.safeApply();
  }

  $scope.navigate = function(navType) {
    var currentStageId = EkstepRendererAPI.getCurrentStageId();
    if (navType === "next") {
        /**
         * actionNavigateNext  event used to navigate to next stage from the current stage of the content.
         * @event actionNavigateNext
         * @fires actionNavigateNext
         * @memberof EkstepRendererEvents
         */
         EventBus.dispatch("renderer:navigation:next",currentStageId);

       } else if (navType === "previous") {
        /**
         * actionNavigatePrevious  event used to navigate to previous stage from the current stage of the content.
         * @event actionNavigatePrevious
         * @fires actionNavigatePrevious
         * @memberof EkstepRendererEvents
         */
         EventBus.dispatch("renderer:navigation:prev");
       }
     }

     $rootScope.defaultSubmit = function() {
    /**
     * actionDefaultSubmit  will dispatch to eval the item(question's).
     * @event actionDefaultSubmit
     * @fires actionDefaultSubmit
     * @memberof EkstepRendererEvents
     */
     EventBus.dispatch("actionDefaultSubmit");
   }

   $scope.init();
 });

app.compileProvider.directive('customNextNavigation', function($rootScope, $timeout) {
  return {
    restrict: 'E',
    template: '<div><a class="nav-icon nav-next" ng-show="showCustomNext !== state_off" href="javascript:void(0);"><img ng-src="{{customNextIcon}}" ng-click="navigate(\'next\')"></a></div>',
    link: function(scope) {
      scope.customNextIcon = EkstepRendererAPI.resolvePluginResource("org.ekstep.overlay", "1.0", "renderer/assets/icons/next.png");
      var events = ["overlayNext", "renderer:customNext:show", "renderer:customNext:hide", "renderer:next:hide","renderer:next:show"];
      scope.toggleNav = function(event) {
        var val;
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        var defaultValue = globalConfig.overlay.showNext ? "on" : "off";
        switch (event.type) {
          /**
          * renderer:next:show Event to show next navigation icon.
          * @event renderer:next:show
          * @listen renderer:next:show
          * @memberOf EkstepRendererEvents
          */
          case "renderer:customNext:show":
          val = 'on';
          break;
          case "renderer:next:show":
          val = "on";
          EkstepRendererAPI.dispatchEvent('renderer:next:hide');
          $timeout(function() {
          EkstepRendererAPI.dispatchEvent('renderer:customNext:show');
          }, 50);
          break;
          /**
          * renderer:next:hide Event to hide next navigation icon.
          * @event renderer:next:hide
          * @listen renderer:next:hide
          * @memberOf EkstepRendererEvents
          */    
          case "renderer:customNext:hide":
          case "renderer:next:hide":
          val = "off";
          break;
          case "overlayNext":
          val = event.target ? event.target : defaultValue;
        }
        scope.showCustomNext = val;
        $rootScope.safeApply();
      };
      _.each(events, function(event) {
        EkstepRendererAPI.addEventListener(event, scope.toggleNav, scope)
      });
    }
  }
});

app.compileProvider.directive('customPreviousNavigation', function($rootScope, $timeout) {
  return {
    restrict: 'E',
    template: '<div><a class="nav-icon nav-previous" ng-show="showCustomPrevious !== state_off" ng-class="{\'nav-disable\': showCustomPrevious == state_disable}" href="javascript:void(0);"><img ng-src="{{customePreviousIcon}}" ng-click="navigate(\'previous\')"></a></div>',
    link: function(scope) {
      var events = ["renderer:customprevious:show", "renderer:customprevious:hide", "overlayPrevious","renderer:previous:hide", "renderer:previous:show"];
      scope.customePreviousIcon = EkstepRendererAPI.resolvePluginResource("org.ekstep.overlay", "1.0", "renderer/assets/icons/back.png");
      scope.changeValue = function(event) {
        var val;
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        var defaultValue = globalConfig.overlay.showPrevious ? "on" : "off";
        switch (event.type) {
          case "overlayPrevious":
          val = event.target ? event.target : defaultValue;
          break;
          /**
           * renderer:previous:show Event to show previous navigation icon.
           * @event renderer:previous:show
           * @listen renderer:previous:show
           * @memberOf EkstepRendererEvents
           */
           case "renderer:customprevious:show":
           val = "on";
           break;

           case "renderer:previous:show":
           EkstepRendererAPI.dispatchEvent('renderer:previous:hide');
           $timeout(function() {
           EkstepRendererAPI.dispatchEvent('renderer:customprevious:show');
           }, 50);
           val = "on";
           break;
          /**
           * renderer:previous:hide Event to hide previous navigation icon.
           * @event renderer:previous:hide
           * @listen renderer:previous:hide
           * @memberOf EkstepRendererEvents
           */
           case "renderer:customprevious:hide":
           case "renderer:previous:hide":
           val = "off";
           break;
         }
         if (val == "on") {
          var navigateToStage = EkstepRendererAPI.getStageParam('previous');
          if (_.isUndefined(navigateToStage)) {
            val = "disable";
            $('previous-navigation').hide();
            if (EkstepRendererAPI.isItemScene() && EkstepRendererAPI.getCurrentController().hasPrevious()) {
              val = "enable"
            }
          } else {
            val = "enable"
          }
        }
        
        scope.showCustomPrevious = val;
        $rootScope.safeApply();
      }
      _.each(events, function(event) {
        EkstepRendererAPI.addEventListener(event, scope.changeValue, scope)
      })
    }
  }
});

//# sourceURL=CustomNavigationCtrl.js