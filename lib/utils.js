import angular from 'angular'

function WindowResize($window, $rootScope) {
    let window = angular.element($window);
    let width = window[0].innerWidth;
    let height = window[0].innerHeight;

    angular.element($window).on('resize', (event) => {
        console.log(window[0]);
        let newWidth = window[0].innerWidth;
        let newHeight = window[0].innerHeight;
        if (width != newWidth || height != newHeight) {
            $rootScope.$broadcast('window-resize', width = newWidth, height = newHeight);
        }
    });
}

export default angular.module('ancestry.utils', [])
    .service("WindowResize", WindowResize);