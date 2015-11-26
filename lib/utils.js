import angular from 'angular'

function WindowResize($window, $rootScope) {
    let window = angular.element($window);
    let width = window[0].innerWidth;

    angular.element($window).on('resize', (event) => {
        let newWidth = window[0].innerWidth;
        if (width != newWidth) {
            $rootScope.$broadcast('window-resize', width = newWidth);
        }
    });
}

export default angular.module('plotify.utils', [])
    .service("WindowResize", WindowResize);